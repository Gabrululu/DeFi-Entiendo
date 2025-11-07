// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {OctantYieldDonatingStrategy} from "../src/octant/OctantYieldDonatingStrategy.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract OctantStrategyTest is Test {
    OctantYieldDonatingStrategy public strategy;
    MockERC20 public usdc;
    
    address public owner = address(this);
    address public strategyManager = address(0x1);
    address public donationAddress = address(0x2);
    address public user = address(0x3);
    
    function setUp() public {
        usdc = new MockERC20("Mock USDC", "USDC");
        strategy = new OctantYieldDonatingStrategy(
            address(usdc),
            strategyManager,
            donationAddress,
            owner
        );
        usdc.mint(strategyManager, 10000e18);
    }
    
    function testDeployment() public view {
        assertEq(strategy.strategyName(), "Octant Yield Donating Strategy");
        assertEq(strategy.donationAddress(), donationAddress);
        assertEq(strategy.totalYieldDonated(), 0);
    }
    
    function testDeposit() public {
        uint256 amount = 100e18;
        
        vm.startPrank(strategyManager);
        usdc.approve(address(strategy), amount);
        uint256 deposited = strategy.deposit(amount);
        vm.stopPrank();
        
        assertEq(deposited, amount);
        assertEq(strategy.totalDeposited(), amount);
    }
    
    function testYieldTracking() public {
        // Deposit
        uint256 depositAmount = 100e18;
        vm.startPrank(strategyManager);
        usdc.approve(address(strategy), depositAmount);
        strategy.deposit(depositAmount);
        vm.stopPrank();
        
        // Simulate time passing
        vm.warp(block.timestamp + 30 days);
        
        // Harvest (solo tracking, no transfer en mock)
        vm.prank(strategyManager);
        uint256 yieldTracked = strategy.harvestYield();
        
        // Verify yield was tracked
        assertGt(yieldTracked, 0, "Yield should be tracked");
        assertEq(strategy.totalYieldDonated(), yieldTracked, "Total donated should match");
    }
    
    function testYieldDonationWithBalance() public {
        // Deposit
        uint256 depositAmount = 100e18;
        vm.startPrank(strategyManager);
        usdc.approve(address(strategy), depositAmount);
        strategy.deposit(depositAmount);
        vm.stopPrank();
        
        // Simulate time and mint yield to contract
        vm.warp(block.timestamp + 30 days);
        uint256 expectedYield = strategy.pendingYield();
        usdc.mint(address(strategy), expectedYield);
        
        // Harvest (ahora SI puede transferir)
        vm.prank(strategyManager);
        uint256 yieldDonated = strategy.harvestYield();
        
        // Verify yield was donated
        assertEq(usdc.balanceOf(donationAddress), yieldDonated);
    }
    
    function testPrincipalIntact() public {
        uint256 depositAmount = 100e18;
        vm.startPrank(strategyManager);
        usdc.approve(address(strategy), depositAmount);
        strategy.deposit(depositAmount);
        vm.stopPrank();
        
        vm.warp(block.timestamp + 30 days);
        vm.prank(strategyManager);
        strategy.harvestYield();
        
        assertEq(strategy.totalDeposited(), depositAmount, "Principal intact");
    }
    
    function testSimpleWithdraw() public {
        // Deposit
        uint256 depositAmount = 100e18;
        vm.startPrank(strategyManager);
        usdc.approve(address(strategy), depositAmount);
        strategy.deposit(depositAmount);
        
        // Withdraw immediately (no harvest, no problema)
        uint256 withdrawn = strategy.withdraw(depositAmount);
        
        assertEq(withdrawn, depositAmount);
        assertEq(strategy.totalDeposited(), 0);
        vm.stopPrank();
    }
    
    function testPendingYieldCalculation() public {
        uint256 depositAmount = 100e18;
        vm.startPrank(strategyManager);
        usdc.approve(address(strategy), depositAmount);
        strategy.deposit(depositAmount);
        vm.stopPrank();
        
        uint256 pending1 = strategy.pendingYield();
        vm.warp(block.timestamp + 10 days);
        uint256 pending2 = strategy.pendingYield();
        
        assertGt(pending2, pending1);
    }
    
    function testExpectedYearlyDonation() public {
        uint256 depositAmount = 100e18;
        vm.startPrank(strategyManager);
        usdc.approve(address(strategy), depositAmount);
        strategy.deposit(depositAmount);
        vm.stopPrank();
        
        uint256 expectedYearly = strategy.expectedYearlyDonation();
        assertEq(expectedYearly, (depositAmount * 500) / 10000);
    }
    
    function testUpdateDonationAddress() public {
        address newAddress = address(0x999);
        strategy.setDonationAddress(newAddress);
        assertEq(strategy.donationAddress(), newAddress);
    }
    
    function test_RevertWhen_NonOwnerUpdatesDonationAddress() public {
        vm.prank(user);
        vm.expectRevert();
        strategy.setDonationAddress(address(0x999));
    }
    
    function testYieldStatsReporting() public {
        uint256 depositAmount = 100e18;
        vm.startPrank(strategyManager);
        usdc.approve(address(strategy), depositAmount);
        strategy.deposit(depositAmount);
        vm.stopPrank();
        
        vm.warp(block.timestamp + 30 days);
        vm.prank(strategyManager);
        strategy.harvestYield();
        
        (
            uint256 totalDonated,
            uint256 lastDonation,
            address recipient,
            uint256 currentBalance,
            uint256 apy
        ) = strategy.getYieldStats();
        
        assertGt(totalDonated, 0);
        assertEq(lastDonation, block.timestamp);
        assertEq(recipient, donationAddress);
        assertEq(currentBalance, depositAmount);
        assertEq(apy, 500);
    }
    
    function testZeroYieldWhenNoDeposit() public {
        vm.warp(block.timestamp + 30 days);
        vm.prank(strategyManager);
        uint256 yield = strategy.harvestYield();
        
        assertEq(yield, 0);
    }
}