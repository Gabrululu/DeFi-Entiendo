# Smart Contracts Documentation

## Overview

DeFi Entiendo uses 5 main smart contracts deployed on Sepolia testnet.

## Contract Addresses

| Contract | Address | Etherscan |
|----------|---------|-----------|
| DefiEntiendoVault | `0x20Ec045bdc3C1a371b0a5B94d136c1d58C0160DF` | [View](https://sepolia.etherscan.io/address/0x20Ec045bdc3C1a371b0a5B94d136c1d58C0160DF) |
| OctantYieldDonatingStrategy | `0x45413dC90Bcb5CCa3550E0d931A5c512c2dB7a3c` | [View](https://sepolia.etherscan.io/address/0x45413dC90Bcb5CCa3550E0d931A5c512c2dB7a3c) |
| StrategyManager | `0x126409a7DD1CF34004E1A1BFd416eb666Cd0351F` | [View](https://sepolia.etherscan.io/address/0x126409a7DD1CF34004E1A1BFd416eb666Cd0351F) |
| ProgressTracker | `0x7a05b876378064f8E2235692605Fb206A3350cb6` | [View](https://sepolia.etherscan.io/address/0x7a05b876378064f8E2235692605Fb206A3350cb6) |
| EntiendeNFT | `0xAEF227E192B2EFbb85D8CAD5C6E5dd3c38513F72` | [View](https://sepolia.etherscan.io/address/0xAEF227E192B2EFbb85D8CAD5C6E5dd3c38513F72) |
| Mock USDC | `0x5C159EC2e979F7e2ddff8b5BDd23e7846133CcA3` | [View](https://sepolia.etherscan.io/address/0x5C159EC2e979F7e2ddff8b5BDd23e7846133CcA3) |

## DefiEntiendoVault

### Description
ERC-4626 compliant vault that accepts USDC deposits and issues shares.

### Key Functions

#### deposit
function deposit(uint256 assets, address receiver)
external
returns (uint256 shares)

Deposit USDC and receive vault shares.

**Parameters**:
- `assets`: Amount of USDC to deposit
- `receiver`: Address to receive shares

**Returns**: Number of shares minted

**Example**:
```js
const amount = parseUnits("100", 18) // 100 USDC
await vault.deposit(amount, userAddress)
```

#### withdraw
function withdraw(uint256 assets, address receiver, address owner)
external
returns (uint256 shares)

Withdraw USDC by burning shares.

#### getUserStats
function getUserStats(address user)
external
view
returns (
uint256 totalDeposited,
uint256 currentValue,
uint256 yieldContribution,
uint256 educationLevel,
uint256 daysActive,
uint256 sharesOwned
)

Get comprehensive user statistics.

### Events

event UserDeposited(address indexed user, uint256 amount, uint256 shares, uint256 timestamp);
event StrategyManagerUpdated(address indexed newManager);
event ProgressTrackerUpdated(address indexed newTracker);

### Security

- ✅ ReentrancyGuard on deposits/withdrawals
- ✅ Owner-only admin functions
- ✅ Progress tracking authorization

---

## OctantYieldDonatingStrategy

### Description
Yield strategy that donates 100% of generated yield to public goods (Octant V2 compatible).

### Key Functions

#### harvestYield
function harvestYield() external returns (uint256)

Harvest yield and donate to public goods address.

**Returns**: Amount of yield donated

**Example**:
```js
const yield = await strategy.harvestYield()
console.log(`Donated: ${formatUnits(yield, 18)} USDC`)
```

#### getYieldStats
function getYieldStats()
external
view
returns (
uint256 totalDonated,
uint256 lastDonation,
address recipient,
uint256 currentBalance,
uint256 estimatedAPY
)

Get complete yield statistics.

#### pendingYield
function pendingYield() external view returns (uint256)

Calculate pending yield since last harvest.

### Events

event YieldDonated(address indexed recipient, uint256 amount, uint256 timestamp);
event DonationAddressUpdated(address indexed oldAddress, address indexed newAddress);

### Yield Calculation

Mock formula (will be replaced with real Aave/Compound integration):
```
yield = (principal * APY * timeElapsed) / (365 days * 10000)
```
where APY = 500 basis points = 5%

---

## StrategyManager

### Description
Orchestrates multiple yield strategies and manages capital allocation.

### Key Functions

#### addStrategy
function addStrategy(
address strategy,
string memory name,
uint256 allocationPercentage
) external onlyOwner

Add a new yield strategy.

**Parameters**:
- `strategy`: Strategy contract address
- `name`: Human-readable name
- `allocationPercentage`: Allocation in basis points (e.g., 2000 = 20%)

#### deployCapital
function deployCapital(uint256 amount)
external
returns (uint256 deployed)

Deploy capital to all strategies based on allocation.

### Events

event StrategyAdded(uint256 indexed strategyId, address strategy, string name, uint256 allocation);
event CapitalDeployed(address indexed strategy, uint256 amount);
event YieldHarvested(uint256 totalYield);

---

## ProgressTracker

### Description
Tracks educational progress and awards NFTs for milestones.

### Levels

| Level | Points Required | Description |
|-------|----------------|-------------|
| Newcomer | 0 | Just started |
| Learner | 100 | Completed first lesson |
| Explorer | 500 | Multiple lessons |
| Expert | 2000 | Advanced knowledge |
| Master | 10000 | DeFi expert |

### Key Functions

#### recordAction
function recordAction(
address user,
ActionType action,
uint256 value
) external onlyAuthorized

Record user actions (deposits, lessons, etc.)

**ActionType enum**:
- `DEPOSIT`
- `COMPLETE_LESSON`
- `EARN_YIELD`
- `DONATE_TO_PUBLIC_GOODS`

---

## EntiendeNFT

### Description
Soulbound NFT certificates for educational achievements.

### Key Features
- ✅ Non-transferable (soulbound)
- ✅ One per lesson per user
- ✅ On-chain metadata
- ✅ Verifiable credentials

### Functions

#### mint
function mint(
address to,
uint256 lessonId,
string memory metadata
) external onlyMinter returns (uint256 tokenId)

Mint a certificate NFT.

**Note**: Only ProgressTracker can mint.

---

## Testing

### Run Tests

```bash
cd contracts

# All tests
forge test

# Specific contract
forge test --match-contract VaultTest

# With gas report
forge test --gas-report

# Coverage
forge coverage
```

### Test Coverage

- DefiEntiendoVault: 95%
- OctantStrategy: 100%
- StrategyManager: 90%
- ProgressTracker: 85%
- EntiendeNFT: 95%

---

## Deployment

### Deploy to Sepolia

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url sepolia \
  --broadcast \
  --verify
```

### Verify Manually

```bash
forge verify-contract \
  0xYOUR_CONTRACT_ADDRESS \
  src/YourContract.sol:YourContract \
  --chain sepolia \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

---

## Security Considerations

### Audits
- ❌ Not audited (testnet only)
- ✅ Uses OpenZeppelin v4.9.6 (audited)
- ✅ Comprehensive test coverage

### Known Limitations
- Mock yield generation (not real)
- Single strategy for now
- Owner-controlled (no DAO yet)

### Recommendations
- Do NOT use in production
- Audit before mainnet
- Implement timelock for owner functions

---

## Questions?

- **Email**: gaby25231@gmail.com
- **X**: https://x.com/Gabrululu

---

**Last Updated**: November 7, 2025
