// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";  // v4.x usa security/

import "../interfaces/IStrategy.sol";

/**
 * @title StrategyManager
 * @notice Gestiona múltiples estrategias DeFi con allocation dinámico
 */
contract StrategyManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ========== STRUCTS ==========
    
    struct Strategy {
        address strategyAddress;
        string name;
        uint256 targetAllocation; // In basis points (10000 = 100%)
        uint256 deployedAmount;
        bool isActive;
        uint256 lastHarvest;
    }
    
    // ========== STATE VARIABLES ==========
    
    IERC20 public immutable asset;
    address public vault;
    
    Strategy[] public strategies;
    
    uint256 public constant MAX_BPS = 10000;
    uint256 public constant MAX_STRATEGIES = 10;
    
    // ========== EVENTS ==========
    
    event StrategyAdded(uint256 indexed strategyId, address strategy, string name, uint256 allocation);
    event StrategyRemoved(uint256 indexed strategyId);
    event StrategyUpdated(uint256 indexed strategyId, uint256 newAllocation);
    event CapitalDeployed(uint256 totalAmount);
    event Rebalanced(uint256 timestamp);
    event YieldHarvested(uint256 indexed strategyId, uint256 amount);
    event EmergencyWithdraw(uint256 indexed strategyId, uint256 amount);
    
    // ========== CONSTRUCTOR ==========
    
    constructor(address _asset, address _vault, address _initialOwner) {
        require(_asset != address(0), "Invalid asset");
        require(_vault != address(0), "Invalid vault");
        
        _transferOwnership(_initialOwner);  // v4.x style
        asset = IERC20(_asset);
        vault = _vault;
    }
    
    // ========== MODIFIERS ==========
    
    modifier onlyVault() {
        require(msg.sender == vault, "Only vault");
        _;
    }
    
    // ========== STRATEGY MANAGEMENT ==========
    
    /**
     * @notice Agregar nueva estrategia
     */
    function addStrategy(
        address strategyAddress,
        string memory name,
        uint256 targetAllocation
    ) external onlyOwner {
        require(strategies.length < MAX_STRATEGIES, "Max strategies reached");
        require(strategyAddress != address(0), "Invalid address");
        require(getTotalAllocation() + targetAllocation <= MAX_BPS, "Allocation exceeds 100%");
        
        strategies.push(Strategy({
            strategyAddress: strategyAddress,
            name: name,
            targetAllocation: targetAllocation,
            deployedAmount: 0,
            isActive: true,
            lastHarvest: block.timestamp
        }));
        
        emit StrategyAdded(strategies.length - 1, strategyAddress, name, targetAllocation);
    }
    
    /**
     * @notice Actualizar allocation de estrategia
     */
    function updateStrategyAllocation(uint256 strategyId, uint256 newAllocation) external onlyOwner {
        require(strategyId < strategies.length, "Invalid strategy");
        
        uint256 oldAllocation = strategies[strategyId].targetAllocation;
        uint256 totalAllocation = getTotalAllocation() - oldAllocation + newAllocation;
        
        require(totalAllocation <= MAX_BPS, "Allocation exceeds 100%");
        
        strategies[strategyId].targetAllocation = newAllocation;
        emit StrategyUpdated(strategyId, newAllocation);
    }
    
    /**
     * @notice Desactivar estrategia
     */
    function deactivateStrategy(uint256 strategyId) external onlyOwner {
        require(strategyId < strategies.length, "Invalid strategy");
        require(strategies[strategyId].isActive, "Already inactive");
        
        // Withdraw all from strategy first
        if (strategies[strategyId].deployedAmount > 0) {
            IStrategy(strategies[strategyId].strategyAddress).withdrawAll();
        }
        
        strategies[strategyId].isActive = false;
        strategies[strategyId].targetAllocation = 0;
        
        emit StrategyRemoved(strategyId);
    }
    
    // ========== CAPITAL DEPLOYMENT ==========
    
    /**
     * @notice Deploy capital según target allocations
     */
    function deployCapital(uint256 totalAmount) external onlyVault nonReentrant {
        require(totalAmount > 0, "Amount must be > 0");
        
        uint256 deployed = 0;
        
        for (uint256 i = 0; i < strategies.length; i++) {
            if (!strategies[i].isActive) continue;
            
            uint256 amountToStrategy = (totalAmount * strategies[i].targetAllocation) / MAX_BPS;
            
            if (amountToStrategy > 0) {
                // Use safeApprove for v4.x (or safeIncreaseAllowance)
                asset.safeApprove(strategies[i].strategyAddress, 0);  // Reset first
                asset.safeApprove(strategies[i].strategyAddress, amountToStrategy);
                
                IStrategy(strategies[i].strategyAddress).deposit(amountToStrategy);
                strategies[i].deployedAmount += amountToStrategy;
                deployed += amountToStrategy;
            }
        }
        
        emit CapitalDeployed(deployed);
    }
    
    /**
     * @notice Rebalancear estrategias hacia target allocations
     */
    function rebalance() external onlyOwner nonReentrant {
        uint256 total = totalDeployedAssets();
        if (total == 0) return;
        
        for (uint256 i = 0; i < strategies.length; i++) {
            if (!strategies[i].isActive) continue;
            
            uint256 targetAmount = (total * strategies[i].targetAllocation) / MAX_BPS;
            uint256 currentAmount = strategies[i].deployedAmount;
            
            if (targetAmount > currentAmount) {
                // Need to deposit more
                uint256 deficit = targetAmount - currentAmount;
                if (asset.balanceOf(address(this)) >= deficit) {
                    asset.safeApprove(strategies[i].strategyAddress, 0);
                    asset.safeApprove(strategies[i].strategyAddress, deficit);
                    IStrategy(strategies[i].strategyAddress).deposit(deficit);
                    strategies[i].deployedAmount += deficit;
                }
            } else if (targetAmount < currentAmount) {
                // Need to withdraw
                uint256 excess = currentAmount - targetAmount;
                IStrategy(strategies[i].strategyAddress).withdraw(excess);
                strategies[i].deployedAmount -= excess;
            }
        }
        
        emit Rebalanced(block.timestamp);
    }
    
    // ========== YIELD HARVESTING ==========
    
    /**
     * @notice Harvest yield de todas las estrategias activas
     */
    function harvestAllStrategies() external onlyVault returns (uint256 totalYield) {
        for (uint256 i = 0; i < strategies.length; i++) {
            if (!strategies[i].isActive) continue;
            
            uint256 yieldAmount = IStrategy(strategies[i].strategyAddress).harvestYield();
            
            if (yieldAmount > 0) {
                totalYield += yieldAmount;
                strategies[i].lastHarvest = block.timestamp;
                emit YieldHarvested(i, yieldAmount);
            }
        }
        
        // Transfer all yield back to vault
        if (totalYield > 0) {
            asset.safeTransfer(vault, totalYield);
        }
        
        return totalYield;
    }
    
    /**
     * @notice Harvest yield de una estrategia específica
     */
    function harvestStrategy(uint256 strategyId) external onlyOwner returns (uint256) {
        require(strategyId < strategies.length, "Invalid strategy");
        require(strategies[strategyId].isActive, "Strategy inactive");
        
        uint256 yieldAmount = IStrategy(strategies[strategyId].strategyAddress).harvestYield();
        
        if (yieldAmount > 0) {
            strategies[strategyId].lastHarvest = block.timestamp;
            asset.safeTransfer(vault, yieldAmount);
            emit YieldHarvested(strategyId, yieldAmount);
        }
        
        return yieldAmount;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Total assets deployed en todas las estrategias
     */
    function totalDeployedAssets() public view returns (uint256 total) {
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].isActive) {
                total += strategies[i].deployedAmount;
            }
        }
    }
    
    /**
     * @notice Get distribution para UI
     */
    function getStrategyDistribution()
        external
        view
        returns (
            string[] memory names,
            uint256[] memory allocations,
            uint256[] memory amounts
        )
    {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].isActive) activeCount++;
        }
        
        names = new string[](activeCount);
        allocations = new uint256[](activeCount);
        amounts = new uint256[](activeCount);
        
        uint256 index = 0;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].isActive) {
                names[index] = strategies[i].name;
                allocations[index] = strategies[i].targetAllocation;
                amounts[index] = strategies[i].deployedAmount;
                index++;
            }
        }
    }
    
    function getTotalAllocation() public view returns (uint256 total) {
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].isActive) {
                total += strategies[i].targetAllocation;
            }
        }
    }
    
    function getStrategyCount() external view returns (uint256) {
        return strategies.length;
    }
    
    // ========== EMERGENCY ==========
    
    /**
     * @notice Emergency withdraw de todas las estrategias
     */
    function emergencyWithdrawAll() external onlyOwner {
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].deployedAmount > 0) {
                uint256 withdrawn = IStrategy(strategies[i].strategyAddress).withdrawAll();
                strategies[i].deployedAmount = 0;
                emit EmergencyWithdraw(i, withdrawn);
            }
        }
        
        // Send all to vault
        uint256 balance = asset.balanceOf(address(this));
        if (balance > 0) {
            asset.safeTransfer(vault, balance);
        }
    }
    
    /**
     * @notice Actualizar vault address
     */
    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "Invalid address");
        vault = _vault;
    }
}