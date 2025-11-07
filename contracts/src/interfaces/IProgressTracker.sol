// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IProgressTracker {
    function initializeUser(address user) external;
    function checkMilestone(address user, uint256 totalDeposited) external;
    function getUserLevel(address user) external view returns (uint256);
    function completeLesson(address user, uint256 lessonId) external;
    function passQuiz(address user, uint256 quizId) external;
}