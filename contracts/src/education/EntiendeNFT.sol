// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EntiendeNFT
 * @notice NFTs educativos soulbound para DeFi Entiendo
 * @dev No transferibles - representan logros educativos reales
 */
contract EntiendeNFT is ERC721Enumerable, Ownable {
    
    // ========== ENUMS ==========
    
    enum Difficulty {
        Beginner,
        Intermediate,
        Advanced
    }
    
    // ========== STRUCTS ==========
    
    struct LessonMetadata {
        string lessonName;
        string conceptExplained;
        Difficulty difficulty;
        uint256 timestamp;
        bool quizCompleted;
        uint256 score; // 0-100
    }
    
    // ========== STATE VARIABLES ==========
    
    uint256 private _tokenIdCounter;
    
    mapping(uint256 => LessonMetadata) public lessonData;
    mapping(address => uint256[]) public userNFTs;
    mapping(address => bool) public minters; // Authorized minters
    
    // Prevent transfers (soulbound)
    bool public transfersEnabled = false;
    
    string private _baseTokenURI;
    
    // ========== EVENTS ==========
    
    event LessonNFTMinted(
        address indexed user,
        uint256 indexed tokenId,
        string lessonName,
        Difficulty difficulty
    );
    event QuizCompleted(address indexed user, uint256 indexed tokenId, uint256 score);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    // ========== CONSTRUCTOR ==========
    
    constructor(address _initialOwner)
        ERC721("DeFi Entiendo Achievement", "DEFIA")
    {
        _transferOwnership(_initialOwner);
    }
    
    // ========== MODIFIERS ==========
    
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized minter");
        _;
    }
    
    // ========== INTERNAL MINTING LOGIC ==========
    
    /**
     * @notice Internal mint logic
     */
    function _mintLesson(
        address user,
        string memory lessonName,
        string memory conceptExplained,
        Difficulty difficulty
    ) internal returns (uint256) {
        require(user != address(0), "Invalid user");
        
        uint256 tokenId = _tokenIdCounter++;
        
        _safeMint(user, tokenId);
        
        lessonData[tokenId] = LessonMetadata({
            lessonName: lessonName,
            conceptExplained: conceptExplained,
            difficulty: difficulty,
            timestamp: block.timestamp,
            quizCompleted: false,
            score: 0
        });
        
        userNFTs[user].push(tokenId);
        
        emit LessonNFTMinted(user, tokenId, lessonName, difficulty);
        return tokenId;
    }
    
    // ========== MINTING FUNCTIONS ==========
    
    /**
     * @notice Mint NFT educativo al completar lección
     */
    function mintLessonNFT(
        address user,
        string memory lessonName,
        string memory conceptExplained,
        Difficulty difficulty
    ) external onlyMinter returns (uint256) {
        return _mintLesson(user, lessonName, conceptExplained, difficulty);
    }
    
    /**
     * @notice Marcar quiz como completado con score
     */
    function completeQuiz(uint256 tokenId, uint256 score) external onlyMinter {
        require(_exists(tokenId), "Token doesn't exist");
        require(score <= 100, "Invalid score");
        require(!lessonData[tokenId].quizCompleted, "Quiz already completed");
        
        lessonData[tokenId].quizCompleted = true;
        lessonData[tokenId].score = score;
        
        emit QuizCompleted(ownerOf(tokenId), tokenId, score);
    }
    
    /**
     * @notice Batch mint para múltiples lecciones
     */
    function batchMintLessons(
        address user,
        string[] memory lessonNames,
        string[] memory concepts,
        Difficulty[] memory difficulties
    ) external onlyMinter returns (uint256[] memory) {
        require(
            lessonNames.length == concepts.length && 
            concepts.length == difficulties.length,
            "Array length mismatch"
        );
        
        uint256[] memory tokenIds = new uint256[](lessonNames.length);
        
        for (uint256 i = 0; i < lessonNames.length; i++) {
            tokenIds[i] = _mintLesson(user, lessonNames[i], concepts[i], difficulties[i]);
        }
        
        return tokenIds;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Get todas las lecciones de un usuario
     */
    function getUserLessons(address user) external view returns (uint256[] memory) {
        return userNFTs[user];
    }
    
    /**
     * @notice Get metadata completo de un token
     */
    function getLessonData(uint256 tokenId)
        external
        view
        returns (
            string memory lessonName,
            string memory conceptExplained,
            Difficulty difficulty,
            uint256 timestamp,
            bool quizCompleted,
            uint256 score
        )
    {
        require(_exists(tokenId), "Token doesn't exist");
        LessonMetadata memory data = lessonData[tokenId];
        
        return (
            data.lessonName,
            data.conceptExplained,
            data.difficulty,
            data.timestamp,
            data.quizCompleted,
            data.score
        );
    }
    
    /**
     * @notice Get progreso del usuario por nivel
     */
    function getUserProgress(address user)
        external
        view
        returns (
            uint256 beginnerCount,
            uint256 intermediateCount,
            uint256 advancedCount,
            uint256 quizzesCompleted,
            uint256 averageScore
        )
    {
        uint256[] memory tokens = userNFTs[user];
        uint256 totalScore = 0;
        
        for (uint256 i = 0; i < tokens.length; i++) {
            LessonMetadata memory data = lessonData[tokens[i]];
            
            if (data.difficulty == Difficulty.Beginner) beginnerCount++;
            else if (data.difficulty == Difficulty.Intermediate) intermediateCount++;
            else if (data.difficulty == Difficulty.Advanced) advancedCount++;
            
            if (data.quizCompleted) {
                quizzesCompleted++;
                totalScore += data.score;
            }
        }
        
        if (quizzesCompleted > 0) {
            averageScore = totalScore / quizzesCompleted;
        }
    }
    
    /**
     * @notice Check si usuario completó lección específica
     */
    function hasCompletedLesson(address user, string memory lessonName)
        external
        view
        returns (bool)
    {
        uint256[] memory tokens = userNFTs[user];
        
        for (uint256 i = 0; i < tokens.length; i++) {
            if (
                keccak256(bytes(lessonData[tokens[i]].lessonName)) ==
                keccak256(bytes(lessonName))
            ) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @notice Check if token exists (public wrapper)
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }
    
    // ========== SOULBOUND LOGIC (v4.x) ==========
    
    /**
     * @notice Override para prevenir transfers (soulbound)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        // Allow minting and burning, but not transfers
        require(
            from == address(0) || to == address(0) || transfersEnabled,
            "Soulbound: transfers disabled"
        );
        
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @notice Emergency: enable transfers (use with caution)
     */
    function setTransfersEnabled(bool enabled) external onlyOwner {
        transfersEnabled = enabled;
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}