// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IProgressTracker.sol";

/**
 * @title ProgressTracker
 * @notice Sistema de progreso educativo para DeFi Entiendo
 * @dev Tracks user learning milestones y niveles
 */
contract ProgressTracker is IProgressTracker, Ownable {
    
    // ========== ENUMS ==========
    
    enum Level {
        Newcomer,      // 0 - Just joined
        Learner,       // 1 - First deposit
        Student,       // 2 - 3+ lessons completed
        Practitioner,  // 3 - 7+ lessons completed
        Expert,        // 4 - 15+ lessons completed
        Master         // 5 - All lessons + high quiz scores
    }
    
    // ========== STRUCTS ==========
    
    struct UserProgress {
        Level currentLevel;
        uint256 lessonsCompleted;
        uint256 quizzesPassed;
        uint256 totalScore;
        uint256 lastActivityTimestamp;
        bool initialized;
    }
    
    struct Milestone {
        uint256 depositAmount; // Amount needed
        uint256 lessonsRequired;
        uint256 quizzesRequired;
        Level levelToUnlock;
        string name;
        bool exists;
    }
    
    // ========== STATE VARIABLES ==========
    
    mapping(address => UserProgress) public userProgress;
    mapping(uint256 => Milestone) public milestones;
    mapping(address => bool) public authorizedCallers; // Vault, NFT contract, etc.
    
    uint256 public totalUsers;
    uint256 public milestoneCount;
    
    address public nftContract;
    
    // ========== EVENTS ==========
    
    event UserInitialized(address indexed user);
    event LevelUp(address indexed user, Level newLevel);
    event LessonCompleted(address indexed user, uint256 lessonId);
    event QuizPassed(address indexed user, uint256 quizId, uint256 score);
    event MilestoneReached(address indexed user, uint256 milestoneId);
    
    // ========== CONSTRUCTOR ==========
    
    constructor(address _initialOwner) {
        _transferOwnership(_initialOwner);  // v4.x style
        _setupDefaultMilestones();
    }
    
    // ========== MODIFIERS ==========
    
    modifier onlyAuthorized() {
        require(
            authorizedCallers[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }
    
    // ========== CORE FUNCTIONS ==========
    
    /**
     * @notice Inicializar usuario nuevo
     */
    function initializeUser(address user) external onlyAuthorized {
        require(!userProgress[user].initialized, "Already initialized");
        
        userProgress[user] = UserProgress({
            currentLevel: Level.Newcomer,
            lessonsCompleted: 0,
            quizzesPassed: 0,
            totalScore: 0,
            lastActivityTimestamp: block.timestamp,
            initialized: true
        });
        
        totalUsers++;
        emit UserInitialized(user);
    }
    
    /**
     * @notice Check milestone basado en depósito
     */
    function checkMilestone(address user, uint256 totalDeposited) external onlyAuthorized {
        require(userProgress[user].initialized, "User not initialized");
        
        UserProgress storage progress = userProgress[user];
        progress.lastActivityTimestamp = block.timestamp;
        
        // Check if reached Learner level (first deposit milestone)
        if (progress.currentLevel == Level.Newcomer && totalDeposited > 0) {
            _levelUp(user, Level.Learner);
        }
        
        // Check other milestones
        _checkAllMilestones(user);
    }
    
    /**
     * @notice Marcar lección como completada
     */
    function completeLesson(address user, uint256 lessonId) external onlyAuthorized {
        require(userProgress[user].initialized, "User not initialized");
        
        UserProgress storage progress = userProgress[user];
        progress.lessonsCompleted++;
        progress.lastActivityTimestamp = block.timestamp;
        
        emit LessonCompleted(user, lessonId);
        
        _checkAllMilestones(user);
    }
    
    /**
     * @notice Marcar quiz como pasado
     */
    function passQuiz(address user, uint256 quizId) external onlyAuthorized {
        require(userProgress[user].initialized, "User not initialized");
        
        UserProgress storage progress = userProgress[user];
        progress.quizzesPassed++;
        progress.lastActivityTimestamp = block.timestamp;
        
        // Assume score passed separately, for now just count
        emit QuizPassed(user, quizId, 0);
        
        _checkAllMilestones(user);
    }
    
    /**
     * @notice Actualizar score de usuario
     */
    function updateScore(address user, uint256 score) external onlyAuthorized {
        require(userProgress[user].initialized, "User not initialized");
        userProgress[user].totalScore += score;
    }
    
    // ========== INTERNAL FUNCTIONS ==========
    
    function _levelUp(address user, Level newLevel) internal {
        userProgress[user].currentLevel = newLevel;
        emit LevelUp(user, newLevel);
    }
    
    function _checkAllMilestones(address user) internal {
        UserProgress memory progress = userProgress[user];
        
        // Student: 3+ lessons
        if (
            progress.currentLevel == Level.Learner &&
            progress.lessonsCompleted >= 3
        ) {
            _levelUp(user, Level.Student);
        }
        
        // Practitioner: 7+ lessons
        if (
            progress.currentLevel == Level.Student &&
            progress.lessonsCompleted >= 7
        ) {
            _levelUp(user, Level.Practitioner);
        }
        
        // Expert: 15+ lessons
        if (
            progress.currentLevel == Level.Practitioner &&
            progress.lessonsCompleted >= 15
        ) {
            _levelUp(user, Level.Expert);
        }
        
        // Master: All lessons + high quiz scores
        if (
            progress.currentLevel == Level.Expert &&
            progress.lessonsCompleted >= 20 &&
            progress.quizzesPassed >= 15
        ) {
            _levelUp(user, Level.Master);
        }
    }
    
    function _setupDefaultMilestones() internal {
        // Milestone 1: First Deposit
        milestones[0] = Milestone({
            depositAmount: 1e18, // 1 token
            lessonsRequired: 0,
            quizzesRequired: 0,
            levelToUnlock: Level.Learner,
            name: "First Deposit",
            exists: true
        });
        
        // Milestone 2: Active Student
        milestones[1] = Milestone({
            depositAmount: 0,
            lessonsRequired: 3,
            quizzesRequired: 0,
            levelToUnlock: Level.Student,
            name: "Active Student",
            exists: true
        });
        
        // Milestone 3: DeFi Practitioner
        milestones[2] = Milestone({
            depositAmount: 0,
            lessonsRequired: 7,
            quizzesRequired: 3,
            levelToUnlock: Level.Practitioner,
            name: "DeFi Practitioner",
            exists: true
        });
        
        milestoneCount = 3;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function getUserLevel(address user) external view returns (uint256) {
        return uint256(userProgress[user].currentLevel);
    }
    
    function getUserStats(address user)
        external
        view
        returns (
            Level level,
            uint256 lessonsCompleted,
            uint256 quizzesPassed,
            uint256 totalScore,
            uint256 lastActivity
        )
    {
        UserProgress memory progress = userProgress[user];
        return (
            progress.currentLevel,
            progress.lessonsCompleted,
            progress.quizzesPassed,
            progress.totalScore,
            progress.lastActivityTimestamp
        );
    }
    
    function getLevelName(Level level) public pure returns (string memory) {
        if (level == Level.Newcomer) return "Newcomer";
        if (level == Level.Learner) return "Learner";
        if (level == Level.Student) return "Student";
        if (level == Level.Practitioner) return "Practitioner";
        if (level == Level.Expert) return "Expert";
        if (level == Level.Master) return "Master";
        return "Unknown";
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function addAuthorizedCaller(address caller) external onlyOwner {
        require(caller != address(0), "Invalid address");
        authorizedCallers[caller] = true;
    }
    
    function removeAuthorizedCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = false;
    }
    
    function setNFTContract(address _nftContract) external onlyOwner {
        require(_nftContract != address(0), "Invalid address");
        nftContract = _nftContract;
        authorizedCallers[_nftContract] = true;
    }
}