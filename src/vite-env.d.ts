/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_CHAIN_ID: string
  readonly VITE_USDC_ADDRESS: string
  readonly VITE_VAULT_ADDRESS: string
  readonly VITE_NFT_ADDRESS: string
  readonly VITE_PROGRESS_TRACKER_ADDRESS: string
  readonly VITE_STRATEGY_MANAGER_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}