export const CONTRACTS = {
  sepolia: {
    usdc: import.meta.env.VITE_USDC_ADDRESS as `0x${string}`,
    vault: import.meta.env.VITE_VAULT_ADDRESS as `0x${string}`,
    strategyManager: import.meta.env.VITE_STRATEGY_MANAGER_ADDRESS as `0x${string}`,
    progressTracker: import.meta.env.VITE_PROGRESS_TRACKER_ADDRESS as `0x${string}`,
    nft: import.meta.env.VITE_NFT_ADDRESS as `0x${string}`,
  }
} as const

export const CHAIN_ID = {
  SEPOLIA: Number(import.meta.env.VITE_CHAIN_ID) || 11155111
} as const

// Validación de configuración
const requiredEnvVars = [
  'VITE_USDC_ADDRESS',
  'VITE_VAULT_ADDRESS',
  'VITE_NFT_ADDRESS',
  'VITE_PROGRESS_TRACKER_ADDRESS',
  'VITE_STRATEGY_MANAGER_ADDRESS',
]

requiredEnvVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    console.error(`Missing required env var: ${varName}`)
  }
})