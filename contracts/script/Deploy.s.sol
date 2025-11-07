// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {DefiEntiendoVault} from "../src/core/DefiEntiendoVault.sol";
import {StrategyManager} from "../src/core/StrategyManager.sol";
import {EntiendeNFT} from "../src/education/EntiendeNFT.sol";
import {ProgressTracker} from "../src/education/ProgressTracker.sol";
import {MockERC20} from "../test/mocks/MockERC20.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("==============================================");
        console.log("Deploying DeFi Entiendo contracts...");
        console.log("Deployer address:", deployer);
        console.log("==============================================");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy Mock USDC (para Sepolia)
        console.log("\n1. Deploying Mock USDC...");
        MockERC20 usdc = new MockERC20("Mock USD Coin", "USDC");
        console.log("Mock USDC deployed at:", address(usdc));
        
        // Mint some USDC to deployer for testing
        usdc.mint(deployer, 100000e6); // 100k USDC
        console.log("Minted 100,000 USDC to deployer");
        
        // 2. Deploy ProgressTracker
        console.log("\n2. Deploying ProgressTracker...");
        ProgressTracker progressTracker = new ProgressTracker(deployer);
        console.log("ProgressTracker deployed at:", address(progressTracker));
        
        // 3. Deploy EntiendeNFT
        console.log("\n3. Deploying EntiendeNFT...");
        EntiendeNFT nft = new EntiendeNFT(deployer);
        console.log("EntiendeNFT deployed at:", address(nft));
        
        // 4. Deploy Vault
        console.log("\n4. Deploying DefiEntiendoVault...");
        DefiEntiendoVault vault = new DefiEntiendoVault(
            usdc,
            "DeFi Entiendo Vault",
            "deUSDC",
            deployer
        );
        console.log("DefiEntiendoVault deployed at:", address(vault));
        
        // 5. Deploy StrategyManager
        console.log("\n5. Deploying StrategyManager...");
        StrategyManager strategyManager = new StrategyManager(
            address(usdc),
            address(vault),
            deployer
        );
        console.log("StrategyManager deployed at:", address(strategyManager));
        
        // 6. Configure contracts
        console.log("\n6. Configuring contracts...");
        vault.setStrategyManager(address(strategyManager));
        vault.setProgressTracker(address(progressTracker));
        
        progressTracker.addAuthorizedCaller(address(vault));
        progressTracker.setNFTContract(address(nft));
        
        nft.addMinter(address(progressTracker));
        
        console.log("\n==============================================");
        console.log("Deployment Complete! Save these addresses:");
        console.log("==============================================");
        console.log("Mock USDC:", address(usdc));
        console.log("Vault:", address(vault));
        console.log("StrategyManager:", address(strategyManager));
        console.log("ProgressTracker:", address(progressTracker));
        console.log("NFT:", address(nft));
        console.log("==============================================");
        
        vm.stopBroadcast();
    }
}