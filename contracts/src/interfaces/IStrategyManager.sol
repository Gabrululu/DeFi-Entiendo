// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStrategyManager {
    function deployCapital(uint256 amount) external;
    function harvestAllStrategies() external returns (uint256);
    function totalDeployedAssets() external view returns (uint256);
    function rebalance() external;
    function emergencyWithdrawAll() external;
    function getStrategyDistribution() external view returns (
        string[] memory names,
        uint256[] memory allocations,
        uint256[] memory amounts
    );
}
