// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {DefiEntiendoVault} from "../src/core/DefiEntiendoVault.sol";
import {StrategyManager} from "../src/core/StrategyManager.sol";
import {ProgressTracker} from "../src/education/ProgressTracker.sol";
import {MockERC20} from "../test/mocks/MockERC20.sol";

contract DefiEntiendoVaultTest is Test {
    DefiEntiendoVault public vault;
    StrategyManager public strategyManager;
    ProgressTracker public progressTracker;
    MockERC20 public usdc;
    
    address public owner = address(this);
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public treasury = address(0x3);
    
    function setUp() public {
        // Deploy mock USDC
        usdc = new MockERC20("USD Coin", "USDC");
        
        // Deploy contracts
        vault = new DefiEntiendoVault(
            usdc,
            "DeFi Entiendo Vault",
            "deUSDC",
            owner
        );
        
        strategyManager = new StrategyManager(
            address(usdc),
            address(vault),
            owner
        );
        
        progressTracker = new ProgressTracker(owner);
        
        // Configure vault
        vault.setStrategyManager(address(strategyManager));
        vault.setProgressTracker(address(progressTracker));
        vault.setTreasury(treasury);
        
        // Authorize vault in progress tracker
        progressTracker.addAuthorizedCaller(address(vault));
        
        // Mint tokens to users
        usdc.mint(alice, 10000e6); // 10k USDC
        usdc.mint(bob, 5000e6);    // 5k USDC
    }
    
    function testDeposit() public {
        uint256 depositAmount = 100e6; // 100 USDC
        
        vm.startPrank(alice);
        usdc.approve(address(vault), depositAmount);
        
        uint256 shares = vault.deposit(depositAmount, alice);
        
        assertEq(vault.balanceOf(alice), shares);
        assertEq(vault.totalAssets(), depositAmount);
        assertEq(vault.userTotalDeposited(alice), depositAmount);
        
        vm.stopPrank();
    }
    
    function testMultipleDeposits() public {
        // Alice deposits
        vm.startPrank(alice);
        usdc.approve(address(vault), 100e6);
        vault.deposit(100e6, alice);
        vm.stopPrank();
        
        // Bob deposits
        vm.startPrank(bob);
        usdc.approve(address(vault), 200e6);
        vault.deposit(200e6, bob);
        vm.stopPrank();
        
        assertEq(vault.totalAssets(), 300e6);
        assertGt(vault.balanceOf(alice), 0);
        assertGt(vault.balanceOf(bob), 0);
    }
    
    function testWithdraw() public {
        uint256 depositAmount = 100e6;
        
        vm.startPrank(alice);
        usdc.approve(address(vault), depositAmount);
        uint256 shares = vault.deposit(depositAmount, alice);
        
        // Withdraw half
        uint256 withdrawAmount = 50e6;
        vault.withdraw(withdrawAmount, alice, alice);
        
        assertLt(vault.balanceOf(alice), shares);
        assertEq(usdc.balanceOf(alice), 9950e6); // Started with 10k, deposited 100, withdrew 50
        
        vm.stopPrank();
    }
    
    function testUserStats() public {
        vm.startPrank(alice);
        usdc.approve(address(vault), 100e6);
        vault.deposit(100e6, alice);
        vm.stopPrank();
        
        (
            uint256 deposited,
            uint256 currentValue,
            ,
            uint256 educationLevel,
            uint256 daysActive,
            uint256 shares
        ) = vault.getUserStats(alice);
        
        assertEq(deposited, 100e6);
        assertEq(currentValue, 100e6);
        assertGt(educationLevel, 0); // Should be initialized
        assertEq(daysActive, 0); // Same day
        assertGt(shares, 0);
    }
    
    function testFuzzDeposit(uint256 amount) public {
        vm.assume(amount > 0 && amount <= 10000e6);
        
        usdc.mint(address(this), amount);
        usdc.approve(address(vault), amount);
        
        uint256 shares = vault.deposit(amount, address(this));
        
        assertGe(vault.totalAssets(), amount);
        assertEq(vault.balanceOf(address(this)), shares);
    }
    
    // Cambio: Test que deposit 0 es permitido pero no hace nada
    function test_DepositZeroIsAllowed() public {
        vm.startPrank(alice);
        usdc.approve(address(vault), 0);
        
        uint256 sharesBefore = vault.balanceOf(alice);
        vault.deposit(0, alice);
        uint256 sharesAfter = vault.balanceOf(alice);
        
        // Deposit 0 es permitido pero no da shares
        assertEq(sharesBefore, sharesAfter);
        
        vm.stopPrank();
    }
    
    function test_RevertWhen_WithdrawMoreThanBalance() public {
        vm.startPrank(alice);
        usdc.approve(address(vault), 100e6);
        vault.deposit(100e6, alice);
        
        // Try to withdraw more than deposited
        vm.expectRevert();
        vault.withdraw(200e6, alice, alice);
        
        vm.stopPrank();
    }
    
    // Test de progress tracker initialization
    function test_ProgressTrackerInitialization() public {
        vm.startPrank(alice);
        usdc.approve(address(vault), 100e6);
        vault.deposit(100e6, alice);
        vm.stopPrank();
        
        // Check que el usuario fue inicializado en progress tracker
        uint256 level = progressTracker.getUserLevel(alice);
        assertGt(level, 0, "User should be initialized with level > 0");
    }
    
    // Test de eventos
    function test_EmitUserDepositedEvent() public {
        uint256 depositAmount = 100e6;
        
        vm.startPrank(alice);
        usdc.approve(address(vault), depositAmount);
        
        // Expect event
        vm.expectEmit(true, false, false, true);
        emit DefiEntiendoVault.UserDeposited(alice, depositAmount, 100e6);
        
        vault.deposit(depositAmount, alice);
        vm.stopPrank();
    }
    
    // Test only owner functions
    function test_RevertWhen_NonOwnerCallsHarvestYield() public {
        vm.prank(alice);
        vm.expectRevert();
        vault.harvestYield();
    }
    
    function test_OwnerCanSetStrategyManager() public {
        address newManager = address(0x999);
        
        vm.prank(owner);
        vault.setStrategyManager(newManager);
        
        assertEq(address(vault.strategyManager()), newManager);
    }
    
    // Test performance fee
    function test_SetPerformanceFee() public {
        uint256 newFee = 1000; // 10%
        
        vm.prank(owner);
        vault.setPerformanceFee(newFee);
        
        assertEq(vault.performanceFee(), newFee);
    }
    
    function test_RevertWhen_PerformanceFeeTooHigh() public {
        uint256 tooHighFee = 3000; // 30% > MAX_PERFORMANCE_FEE (20%)
        
        vm.prank(owner);
        vm.expectRevert();
        vault.setPerformanceFee(tooHighFee);
    }
    
    // Test APY calculation
    function test_EstimatedAPY() public {
        uint256 apy = vault.estimatedAPY();
        // APY inicial debería ser 0 (no hay yield generado)
        assertEq(apy, 0);
    }
    
    // Test first deposit time tracking
    function test_FirstDepositTimeTracking() public {
        vm.startPrank(alice);
        usdc.approve(address(vault), 100e6);
        
        uint256 timestampBefore = block.timestamp;
        vault.deposit(100e6, alice);
        
        uint256 firstDepositTime = vault.userFirstDepositTime(alice);
        assertEq(firstDepositTime, timestampBefore);
        
        vm.stopPrank();
    }
    
    // Test multiple deposits don't reset first deposit time
    function test_MultipleDepositsKeepFirstTime() public {
        vm.startPrank(alice);
        
        usdc.approve(address(vault), 200e6);
        vault.deposit(100e6, alice);
        uint256 firstTime = vault.userFirstDepositTime(alice);
        
        // Wait some time
        vm.warp(block.timestamp + 1 days);
        
        // Second deposit
        vault.deposit(100e6, alice);
        uint256 secondTime = vault.userFirstDepositTime(alice);
        
        // First deposit time shouldn't change
        assertEq(firstTime, secondTime);
        
        vm.stopPrank();
    }
}