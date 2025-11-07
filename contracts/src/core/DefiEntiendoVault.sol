// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";  // v4.x usa security/

import "../interfaces/IStrategyManager.sol";
import "../interfaces/IProgressTracker.sol";

/**
 * @title DefiEntiendoVault
 * @notice Vault educativo ERC-4626 que genera yield para public goods
 * @dev "Entiende DeFi mientras generas impacto"
 */
contract DefiEntiendoVault is ERC4626, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // ========== STATE VARIABLES ==========
    
    IStrategyManager public strategyManager;
    IProgressTracker public progressTracker;
    
    uint256 public totalYieldGenerated;
    uint256 public totalDonatedToPublicGoods;
    uint256 public lastHarvestTimestamp;
    
    // User tracking
    mapping(address => uint256) public userFirstDepositTime;
    mapping(address => uint256) public userTotalDeposited;
    mapping(address => uint256) public userYieldContribution;
    
    // Fee configuration (basis points)
    uint256 public performanceFee; // 0 = 0%, 1000 = 10%
    uint256 public constant MAX_PERFORMANCE_FEE = 2000; // Max 20%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    address public treasury;
    
    // ========== EVENTS ==========
    
    event UserDeposited(address indexed user, uint256 assets, uint256 shares);
    event UserWithdrew(address indexed user, uint256 assets, uint256 shares);
    event YieldHarvested(uint256 amount, uint256 timestamp);
    event DonationMade(uint256 amount, uint256 timestamp);
    event StrategyManagerUpdated(address indexed newManager);
    event ProgressTrackerUpdated(address indexed newTracker);
    event PerformanceFeeUpdated(uint256 newFee);
    
    // ========== CONSTRUCTOR ==========
    
    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _initialOwner
    ) 
        ERC4626(_asset)
        ERC20(_name, _symbol)
    {
        _transferOwnership(_initialOwner);  // v4.x style
        treasury = _initialOwner;
        lastHarvestTimestamp = block.timestamp;
    }
    
    // ========== CORE FUNCTIONS ==========
    
    /**
     * @notice Deposit assets con tracking educativo
     */
    function deposit(uint256 assets, address receiver)
        public
        virtual
        override
        nonReentrant
        returns (uint256 shares)
    {
        // Initialize user progress on first deposit
        if (userFirstDepositTime[receiver] == 0) {
            userFirstDepositTime[receiver] = block.timestamp;
            
            if (address(progressTracker) != address(0)) {
                progressTracker.initializeUser(receiver);
            }
        }
        
        shares = super.deposit(assets, receiver);
        userTotalDeposited[receiver] += assets;
        
        // Check educational milestones
        if (address(progressTracker) != address(0)) {
            progressTracker.checkMilestone(receiver, userTotalDeposited[receiver]);
        }
        
        emit UserDeposited(receiver, assets, shares);
        return shares;
    }
    
    /**
     * @notice Withdraw con tracking
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    )
        public
        virtual
        override
        nonReentrant
        returns (uint256 shares)
    {
        shares = super.withdraw(assets, receiver, owner);
        emit UserWithdrew(owner, assets, shares);
        return shares;
    }
    
    /**
     * @notice Calcula total assets (idle + deployed en estrategias)
     */
    function totalAssets() public view virtual override returns (uint256) {
        uint256 idle = IERC20(asset()).balanceOf(address(this));
        uint256 deployed = 0;
        
        if (address(strategyManager) != address(0)) {
            deployed = strategyManager.totalDeployedAssets();
        }
        
        return idle + deployed;
    }
    
    // ========== YIELD MANAGEMENT ==========
    
    /**
     * @notice Harvest yield de todas las estrategias
     * @dev Solo owner puede llamar
     */
    function harvestYield() external onlyOwner returns (uint256 totalYield) {
        require(address(strategyManager) != address(0), "Strategy manager not set");
        
        totalYield = strategyManager.harvestAllStrategies();
        
        if (totalYield > 0) {
            totalYieldGenerated += totalYield;
            
            // Calculate performance fee if set
            uint256 feeAmount = 0;
            if (performanceFee > 0) {
                feeAmount = (totalYield * performanceFee) / FEE_DENOMINATOR;
                IERC20(asset()).safeTransfer(treasury, feeAmount);
            }
            
            // Rest goes to public goods
            uint256 donationAmount = totalYield - feeAmount;
            totalDonatedToPublicGoods += donationAmount;
            
            lastHarvestTimestamp = block.timestamp;
            
            emit YieldHarvested(totalYield, block.timestamp);
            emit DonationMade(donationAmount, block.timestamp);
        }
        
        return totalYield;
    }
    
    /**
     * @notice Deploy capital a estrategias según allocation
     */
    function deployCapital(uint256 amount) external onlyOwner {
        require(address(strategyManager) != address(0), "Strategy manager not set");
        require(amount <= IERC20(asset()).balanceOf(address(this)), "Insufficient balance");
        
        IERC20(asset()).safeTransfer(address(strategyManager), amount);
        strategyManager.deployCapital(amount);
    }
    
    /**
     * @notice Rebalancear estrategias
     */
    function rebalance() external onlyOwner {
        require(address(strategyManager) != address(0), "Strategy manager not set");
        strategyManager.rebalance();
    }
    
    // ========== USER STATS ==========
    
    /**
     * @notice Obtener estadísticas completas del usuario
     */
    function getUserStats(address user)
        external
        view
        returns (
            uint256 totalDeposited,
            uint256 currentValue,
            uint256 yieldContribution,
            uint256 educationLevel,
            uint256 daysActive,
            uint256 sharesOwned
        )
    {
        sharesOwned = balanceOf(user);
        totalDeposited = userTotalDeposited[user];
        currentValue = convertToAssets(sharesOwned);
        
        // Proporcional yield contribution
        if (totalSupply() > 0 && totalDonatedToPublicGoods > 0) {
            yieldContribution = (totalDonatedToPublicGoods * sharesOwned) / totalSupply();
        }
        
        // Education level
        if (address(progressTracker) != address(0)) {
            educationLevel = progressTracker.getUserLevel(user);
        }
        
        // Days active
        if (userFirstDepositTime[user] > 0) {
            daysActive = (block.timestamp - userFirstDepositTime[user]) / 1 days;
        }
    }
    
    /**
     * @notice APY estimado basado en últimos yields
     */
    function estimatedAPY() external view returns (uint256) {
        if (totalAssets() == 0 || lastHarvestTimestamp == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - lastHarvestTimestamp;
        if (timeElapsed == 0) return 0;
        
        // Simple APY calculation (can be improved)
        uint256 annualizedYield = (totalYieldGenerated * 365 days) / timeElapsed;
        return (annualizedYield * 10000) / totalAssets(); // In basis points
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function setStrategyManager(address _manager) external onlyOwner {
        require(_manager != address(0), "Invalid address");
        strategyManager = IStrategyManager(_manager);
        emit StrategyManagerUpdated(_manager);
    }
    
    function setProgressTracker(address _tracker) external onlyOwner {
        require(_tracker != address(0), "Invalid address");
        progressTracker = IProgressTracker(_tracker);
        emit ProgressTrackerUpdated(_tracker);
    }
    
    function setPerformanceFee(uint256 _fee) external onlyOwner {
        require(_fee <= MAX_PERFORMANCE_FEE, "Fee too high");
        performanceFee = _fee;
        emit PerformanceFeeUpdated(_fee);
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasury = _treasury;
    }
    
    /**
     * @notice Emergency withdraw from strategies
     */
    function emergencyWithdrawFromStrategies() external onlyOwner {
        require(address(strategyManager) != address(0), "Strategy manager not set");
        strategyManager.emergencyWithdrawAll();
    }
}