import { createWalletClient, http, parseUnits } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import * as dotenv from 'dotenv'

// Cargar .env
dotenv.config()

const USDC_ADDRESS = '0x5C159EC2e979F7e2ddff8b5BDd23e7846133CcA3' as const

// ABI mínimo para mint
const USDC_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

async function mintUSDC() {
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`
  const rpcUrl = process.env.VITE_SEPOLIA_RPC_URL || process.env.SEPOLIA_RPC_URL
  
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not found in .env')
  }

  if (!rpcUrl) {
    throw new Error('SEPOLIA_RPC_URL not found in .env')
  }

  const account = privateKeyToAccount(privateKey)
  
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(rpcUrl),
  })

  console.log('🪙 Minting 1000 USDC to:', account.address)
  console.log('📍 USDC Contract:', USDC_ADDRESS)

  try {
    const hash = await client.writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'mint',
      args: [account.address, parseUnits('1000', 18)],
    })

    console.log('✅ Transaction sent!')
    console.log('📝 Hash:', hash)
    console.log('🔗 View on Etherscan:', `https://sepolia.etherscan.io/tx/${hash}`)
    console.log('\nWait ~15 seconds for confirmation, then refresh your wallet!')
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Error minting USDC:', error.message)
    } else {
      console.error('❌ Error minting USDC:', error)
    }
  }
}

mintUSDC().catch(console.error)