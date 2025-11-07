# Architecture - DeFi Entiendo

## System Overview

DeFi Entiendo is a gamified DeFi education platform with automated yield donation to public goods. The system consists of smart contracts (Solidity), a web frontend (React), and a database (Supabase).

┌─────────────────────────────────────────────────────────────┐
│ USER │
│ (MetaMask Wallet) │
└────────────────────┬────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React) │
│ - Wagmi/RainbowKit for Web3 │
│ - Supabase for education content │
│ - Real-time stats dashboard │
└────────────────────┬────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ SMART CONTRACTS (Sepolia) │
│ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ DefiEntiendoVault (ERC-4626) │ │
│ │ - User deposits USDC │ │
│ │ - Issues vault shares │ │
│ │ - Tracks education progress │ │
│ └──────────┬───────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ StrategyManager │ │
│ │ - Routes capital to strategies │ │
│ │ - Rebalances allocations │ │
│ │ - Harvests yield │ │
│ └──────────┬───────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ OctantYieldDonatingStrategy │ │
│ │ - Generates yield (~5% APY mock) │ │
│ │ - Donates 100% to public goods │ │
│ │ - Protects user principal │ │
│ └──────────────────────────────────────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ ProgressTracker │ │
│ │ - Tracks educational milestones │ │
│ │ - Issues NFT certificates │ │
│ └──────────────────────────────────────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ EntiendeNFT (ERC-721) │ │
│ │ - Soulbound certificates │ │
│ │ - Non-transferable │ │
│ └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ PUBLIC GOODS PROJECTS │
│ - Ethereum Development │
│ - DeFi Education Fund │
│ - Open Source Tools │
└─────────────────────────────────────────────────────────────┘

## Core Components

### 1. DefiEntiendoVault
**Type**: ERC-4626 Vault  
**Purpose**: Main entry point for user deposits

**Key Functions**:
function deposit(uint256 assets, address receiver) external returns (uint256 shares)
function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares)
function getUserStats(address user) external view returns (UserStats memory)

**Features**:
- Standard ERC-4626 compliant
- Deposit USDC, receive vault shares
- Principal always withdrawable
- Progress tracking integration

### 2. StrategyManager
**Type**: Strategy Orchestrator  
**Purpose**: Manages multiple yield strategies

**Key Functions**:
function addStrategy(address strategy, string memory name, uint256 allocation) external onlyOwner
function deployCapital(uint256 amount) external returns (uint256)
function harvestYield() external onlyOwner returns (uint256)

**Features**:
- Multiple strategy support
- Dynamic allocation (basis points)
- Emergency withdrawal
- Owner-controlled

### 3. OctantYieldDonatingStrategy
**Type**: Yield Strategy (Octant V2 Compatible)  
**Purpose**: Generate yield and donate 100% to public goods

**Key Functions**:
function deposit(uint256 amount) external returns (uint256)
function withdraw(uint256 amount) external returns (uint256)
function harvestYield() external returns (uint256)
function getYieldStats() external view returns (YieldStats memory)

**Yield Flow**:
1. User deposits → Capital deployed to strategy
2. Time passes → Yield accumulates (~5% APY)
3. Harvest called → 100% yield sent to donation address
4. Principal remains → User can withdraw anytime

### 4. ProgressTracker
**Type**: Education Progress Manager  
**Purpose**: Track learning achievements

**Key Functions**:
function recordAction(address user, ActionType action, uint256 value) external
function getUserLevel(address user) external view returns (Level memory)
function canMintNFT(address user, uint256 lessonId) external view returns (bool)

**Levels**:
- Newcomer (0 points)
- Learner (100 points)
- Explorer (500 points)
- Expert (2000 points)
- Master (10000 points)

### 5. EntiendeNFT
**Type**: ERC-721 Soulbound Token  
**Purpose**: Educational certificates

**Key Functions**:
function mint(address to, uint256 lessonId, string memory metadata) external onlyMinter
function tokenURI(uint256 tokenId) external view returns (string memory)

**Features**:
- Non-transferable (soulbound)
- One NFT per lesson per user
- On-chain metadata
- Verifiable credentials

## Data Flow

### Deposit Flow
User approves USDC to Vault

User calls vault.deposit(amount)

Vault mints shares to user

Vault transfers USDC from user

StrategyManager deploys capital to OctantStrategy

OctantStrategy holds capital

ProgressTracker records deposit action

User receives shares in wallet

### Yield Flow
Time passes (e.g., 30 days)

Owner calls strategyManager.harvestYield()

StrategyManager calls strategy.harvestYield()

Strategy calculates yield earned

Strategy transfers 100% yield to donation address

Strategy emits YieldDonated event

Frontend displays impact on dashboard

### Education Flow
User completes lesson in frontend

Frontend submits quiz score

ProgressTracker records completion

Points awarded based on difficulty

Level checked for upgrade

If milestone reached → mint NFT

EntiendeNFT mints certificate to user

User sees NFT in collection

## Security Model

### Access Control
- **Owner Only**: Strategy management, fee settings
- **Minter Role**: NFT minting (ProgressTracker only)
- **Authorized Callers**: ProgressTracker actions (Vault only)

### Safety Mechanisms
- ReentrancyGuard on all state changes
- Owner-only admin functions
- Emergency pause capability
- Input validation on all functions

### Audit Status
- OpenZeppelin v4.9.6 (audited libraries)
- Custom code: Not audited (testnet only)
- 29 comprehensive tests
- Fuzz testing included

## Tech Stack

### Smart Contracts
- **Language**: Solidity 0.8.24
- **Framework**: Foundry
- **Standards**: ERC-4626, ERC-721, Ownable2Step
- **Libraries**: OpenZeppelin v4.9.6

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Web3**: Wagmi + RainbowKit
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)

### Infrastructure
- **Network**: Sepolia Testnet
- **RPC**: Alchemy
- **Verification**: Etherscan
- **Hosting**: Vercel

## Performance Metrics

### Gas Costs (Sepolia)
- Deploy Vault: ~2.3M gas
- Deploy Strategy: ~1.3M gas
- Deposit: ~277k gas
- Withdraw: ~293k gas
- Harvest Yield: ~178k gas

### Scalability
- **Current**: Supports unlimited users
- **Bottleneck**: Ethereum gas costs
- **Solution**: L2 deployment (Arbitrum, Optimism)

## Future Architecture

### Phase 2: Real Yield Integration
OctantStrategy → Aave V3 → 3-5% real APY
→ Compound V3 → 4-6% real APY
→ Morpho Vaults → 5-8% real APY

### Phase 3: Cross-Chain
Mainnet → Polygon → Arbitrum → Optimism
↓ ↓ ↓ ↓
Shared NFT Registry (Layer Zero)

### Phase 4: DAO Governance
Governance Token → Voting Power → Strategy Allocation
→ Public Goods Selection
→ Fee Parameters

## Development Workflow

### Local Development
Contracts
cd contracts
forge build
forge test
anvil # Local node

Frontend
npm install
npm run dev

### Deployment
Deploy to Sepolia
forge script script/Deploy.s.sol --broadcast --verify

Deploy frontend
vercel deploy --prod

### Testing
Unit tests
forge test

Integration tests
forge test --match-contract Integration

Fuzz tests
forge test --fuzz-runs 1000

Coverage
forge coverage

## Monitoring

### On-Chain Events
- `Deposit` - User deposits to vault
- `Withdraw` - User withdraws from vault
- `YieldDonated` - Yield sent to public goods
- `StrategyAdded` - New strategy added
- `Transfer` (NFT) - Certificate minted

### Off-Chain Metrics
- Total Value Locked (TVL)
- Yield generated (cumulative)
- Donations to public goods
- Active users
- Lessons completed

## Questions?

- **GitHub**: https://github.com/Gabrululu/DeFi-Entiendo
- **Email**: gaby25231@gmail.com

---

**Last Updated**: November 7, 2025
