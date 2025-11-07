// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseStrategy} from "./BaseStrategy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockAaveStrategy
 * @notice Mock de estrategia Aave para testing/demo
 * @dev Simula un APY del 5% anual
 */
contract MockAaveStrategy is BaseStrategy {
    
    uint256 public constant MOCK_APY = 500; // 5% in basis points
    uint256 public lastUpdateTime;
    
    constructor(
        address _asset,
        address _strategyManager,
        address _initialOwner
    ) BaseStrategy(_asset, _strategyManager, "Mock Aave Strategy", _initialOwner) {
        lastUpdateTime = block.timestamp;
    }
    
    function _deposit(uint256 amount) internal override returns (uint256) {
        // Simular deposit a Aave (en realidad solo guardamos el balance)
        return amount;
    }
    
    function _withdraw(uint256 amount) internal override returns (uint256) {
        require(amount <= totalDeposited, "Insufficient balance");
        return amount;
    }
    
    function _withdrawAll() internal override returns (uint256) {
        return totalDeposited;
    }
    
    function _harvestYield() internal override returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastUpdateTime;
        if (timeElapsed == 0) return 0;
        
        // Calcular yield basado en APY mock
        uint256 yield = (totalDeposited * MOCK_APY * timeElapsed) / (365 days * 10000);
        
        lastUpdateTime = block.timestamp;
        return yield;
    }
    
    function _balanceOfStrategy() internal view override returns (uint256) {
        return totalDeposited;
    }
}