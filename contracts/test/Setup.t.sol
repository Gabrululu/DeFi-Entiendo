// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../test/mocks/MockERC20.sol";

contract SetupTest is Test {
    MockERC20 public usdc;
    
    address public alice = address(0x1);
    address public bob = address(0x2);
    
    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC");
        
        // Dar fondos a usuarios de prueba
        usdc.mint(alice, 10000e6); // 10k USDC
        usdc.mint(bob, 5000e6);    // 5k USDC
    }
    
    function testSetup() public {
        assertEq(usdc.balanceOf(alice), 10000e6);
        assertEq(usdc.balanceOf(bob), 5000e6);
    }
}
