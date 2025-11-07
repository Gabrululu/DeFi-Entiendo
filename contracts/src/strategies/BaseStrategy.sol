// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IStrategy.sol";

/**
 * @title BaseStrategy
 * @notice Abstract base para todas las estrategias DeFi
 */
abstract contract BaseStrategy is IStrategy, Ownable {
    using SafeERC20 for IERC20;
    
    // ========== STATE VARIABLES ==========
    
    IERC20 public immutable asset;
    address public strategyManager;
    
    uint256 public totalDeposited;
    uint256 public totalYieldHarvested;
    uint256 public lastHarvestTimestamp;
    
    string public strategyName;
    
    // ========== EVENTS ==========
    
    event Deposited(uint256 amount);
    event Withdrawn(uint256 amount);
    event YieldHarvested(uint256 amount);
    event EmergencyWithdraw(uint256 amount);
    
    // ========== CONSTRUCTOR ==========
    
    constructor(
        address _asset,
        address _strategyManager,
        string memory _name,
        address _initialOwner
    ) {
        require(_asset != address(0), "Invalid asset");
        require(_strategyManager != address(0), "Invalid manager");
        
        _transferOwnership(_initialOwner);  // v4.x style
        asset = IERC20(_asset);
        strategyManager = _strategyManager;
        strategyName = _name;
        lastHarvestTimestamp = block.timestamp;
    }
    
    // ========== MODIFIERS ==========
    
    modifier onlyManager() {
        require(msg.sender == strategyManager, "Only manager");
        _;
    }
    
    // ========== VIRTUAL FUNCTIONS (To Override) ==========
    
    function _deposit(uint256 amount) internal virtual returns (uint256);
    function _withdraw(uint256 amount) internal virtual returns (uint256);
    function _withdrawAll() internal virtual returns (uint256);
    function _harvestYield() internal virtual returns (uint256);
    function _balanceOfStrategy() internal view virtual returns (uint256);
    
    // ========== EXTERNAL FUNCTIONS ==========
    
    function deposit(uint256 amount) external onlyManager returns (uint256) {
        require(amount > 0, "Amount must be > 0");
        
        asset.safeTransferFrom(strategyManager, address(this), amount);
        
        uint256 deposited = _deposit(amount);
        totalDeposited += deposited;
        
        emit Deposited(deposited);
        return deposited;
    }
    
    function withdraw(uint256 amount) external onlyManager returns (uint256) {
        require(amount > 0, "Amount must be > 0");
        require(amount <= totalDeposited, "Insufficient balance");
        
        uint256 withdrawn = _withdraw(amount);
        totalDeposited -= withdrawn;
        
        asset.safeTransfer(strategyManager, withdrawn);
        
        emit Withdrawn(withdrawn);
        return withdrawn;
    }
    
    function withdrawAll() external onlyManager returns (uint256) {
        uint256 withdrawn = _withdrawAll();
        totalDeposited = 0;
        
        asset.safeTransfer(strategyManager, withdrawn);
        
        emit Withdrawn(withdrawn);
        return withdrawn;
    }
    
    function harvestYield() external onlyManager returns (uint256) {
        uint256 yield = _harvestYield();
        
        if (yield > 0) {
            totalYieldHarvested += yield;
            lastHarvestTimestamp = block.timestamp;
            
            asset.safeTransfer(strategyManager, yield);
            
            emit YieldHarvested(yield);
        }
        
        return yield;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function balanceOf() external view returns (uint256) {
        return _balanceOfStrategy();
    }
    
    function totalAssets() external view returns (uint256) {
        return _balanceOfStrategy() + asset.balanceOf(address(this));
    }
    
    function name() external view returns (string memory) {
        return strategyName;
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function setStrategyManager(address _manager) external onlyOwner {
        require(_manager != address(0), "Invalid address");
        strategyManager = _manager;
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 amount = _withdrawAll();
        totalDeposited = 0;
        
        asset.safeTransfer(owner(), amount);
        emit EmergencyWithdraw(amount);
    }
}