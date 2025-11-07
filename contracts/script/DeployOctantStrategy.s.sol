// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {OctantYieldDonatingStrategy} from "../src/octant/OctantYieldDonatingStrategy.sol";

contract DeployOctantStrategyScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Direcciones deployadas anteriormente
        address usdc = 0x5C159EC2e979F7e2ddff8b5BDd23e7846133CcA3;
        address strategyManager = 0x126409a7DD1CF34004E1A1BFd416eb666Cd0351F;
        
        // Donation address (por ahora, usa una address de prueba)
        // En producción: usar Octant split contract address
        address donationAddress = deployer; // Cambiar por address real de Octant
        
        console.log("==============================================");
        console.log("Deploying Octant Yield Donating Strategy...");
        console.log("Deployer:", deployer);
        console.log("==============================================");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy strategy
        OctantYieldDonatingStrategy octantStrategy = new OctantYieldDonatingStrategy(
            usdc,
            strategyManager,
            donationAddress,
            deployer
        );
        
        console.log("\nOctant Strategy deployed at:", address(octantStrategy));
        console.log("USDC:", usdc);
        console.log("Strategy Manager:", strategyManager);
        console.log("Donation Address:", donationAddress);
        console.log("Mock APY: 5%");
        
        console.log("\n==============================================");
        console.log("Next Steps:");
        console.log("1. Add strategy to StrategyManager");
        console.log("2. Set allocation percentage");
        console.log("3. Deploy capital to strategy");
        console.log("4. Test harvest and donation flow");
        console.log("==============================================");
        
        vm.stopBroadcast();
    }
}