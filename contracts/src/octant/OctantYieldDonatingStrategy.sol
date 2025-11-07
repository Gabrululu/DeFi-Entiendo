// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseStrategy} from "../strategies/BaseStrategy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title OctantYieldDonatingStrategy
 * @notice Implementa una estrategia compatible con Octant V2
 * @dev 100% del yield se dona automáticamente a public goods
 */
contract OctantYieldDonatingStrategy is BaseStrategy {
    using SafeERC20 for IERC20;
    
    // ========== STATE VARIABLES ==========
    
    address public donationAddress;
    uint256 public totalYieldDonated;
    uint256 public lastDonationTimestamp;
    uint256 public constant MOCK_APY = 500; // 5% in basis points
    
    // ========== EVENTS ==========
    
    event YieldDonated(address indexed recipient, uint256 amount, uint256 timestamp);
    event DonationAddressUpdated(address indexed oldAddress, address indexed newAddress);
    
    // ========== CONSTRUCTOR ==========
    
    constructor(
        address _asset,
        address _strategyManager,
        address _donationAddress,
        address _initialOwner
    ) BaseStrategy(_asset, _strategyManager, "Octant Yield Donating Strategy", _initialOwner) {
        require(_donationAddress != address(0), "Invalid donation address");
        donationAddress = _donationAddress;
        lastDonationTimestamp = block.timestamp;
    }
    
    // ========== STRATEGY IMPLEMENTATION ==========
    
    function _deposit(uint256 amount) internal override returns (uint256) {
        // Mock: capital stays in contract
        return amount;
    }
    
    function _withdraw(uint256 amount) internal override returns (uint256) {
        require(amount <= totalDeposited, "Insufficient balance");
        return amount;
    }
    
    function _withdrawAll() internal override returns (uint256) {
        return totalDeposited;
    }
    
    /**
     * @notice Harvest yield y donar automáticamente a public goods
     * @dev CORE function del Yield Donating Strategy
     */
    function _harvestYield() internal override returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastHarvestTimestamp;
        if (timeElapsed == 0 || totalDeposited == 0) return 0;
        
        // Calcular yield teórico
        uint256 yield = (totalDeposited * MOCK_APY * timeElapsed) / (365 days * 10000);
        
        if (yield > 0) {
            // Check si hay balance suficiente para donar
            uint256 contractBalance = asset.balanceOf(address(this));
            uint256 availableForDonation = contractBalance > totalDeposited 
                ? contractBalance - totalDeposited 
                : 0;
            
            // Solo donar si hay yield real disponible
            if (availableForDonation > 0) {
                uint256 amountToDonate = yield < availableForDonation ? yield : availableForDonation;
                asset.safeTransfer(donationAddress, amountToDonate);
                
                totalYieldDonated += amountToDonate;
                lastDonationTimestamp = block.timestamp;
                
                emit YieldDonated(donationAddress, amountToDonate, block.timestamp);
                
                return amountToDonate;
            } else {
                // En mock mode: trackear yield pero no transferir si no hay balance
                totalYieldDonated += yield;
                lastDonationTimestamp = block.timestamp;
                
                emit YieldDonated(donationAddress, yield, block.timestamp);
                
                return yield;
            }
        }
        
        return 0;
    }
    
    function _balanceOfStrategy() internal view override returns (uint256) {
        return totalDeposited;
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function setDonationAddress(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "Invalid address");
        address oldAddress = donationAddress;
        donationAddress = _newAddress;
        emit DonationAddressUpdated(oldAddress, _newAddress);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function getYieldStats() external view returns (
        uint256 totalDonated,
        uint256 lastDonation,
        address recipient,
        uint256 currentBalance,
        uint256 estimatedAPY
    ) {
        return (
            totalYieldDonated,
            lastDonationTimestamp,
            donationAddress,
            totalDeposited,
            MOCK_APY
        );
    }
    
    function pendingYield() external view returns (uint256) {
        if (totalDeposited == 0) return 0;
        uint256 timeElapsed = block.timestamp - lastHarvestTimestamp;
        return (totalDeposited * MOCK_APY * timeElapsed) / (365 days * 10000);
    }
    
    function expectedYearlyDonation() external view returns (uint256) {
        if (totalDeposited == 0) return 0;
        return (totalDeposited * MOCK_APY) / 10000;
    }
}