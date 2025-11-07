// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {StrategyManager} from "../src/core/StrategyManager.sol";

contract AddOctantStrategyScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Direcciones
        address strategyManagerAddr = 0x126409a7DD1CF34004E1A1BFd416eb666Cd0351F;
        address octantStrategyAddr = 0x45413dC90Bcb5CCa3550E0d931A5c512c2dB7a3c;
        
        console.log("==============================================");
        console.log("Adding Octant Strategy to StrategyManager...");
        console.log("Strategy Manager:", strategyManagerAddr);
        console.log("Octant Strategy:", octantStrategyAddr);
        console.log("==============================================");
        
        vm.startBroadcast(deployerPrivateKey);
        
        StrategyManager manager = StrategyManager(strategyManagerAddr);
        
        // Add strategy con 20% allocation
        manager.addStrategy(
            octantStrategyAddr,
            "Octant Yield Donating",
            2000 // 20% allocation (2000 basis points = 20%)
        );
        
        console.log("");
        console.log("SUCCESS: Strategy added!");
        console.log("Name: Octant Yield Donating");
        console.log("Allocation: 20%");
        console.log("==============================================");
        
        vm.stopBroadcast();
    }
}