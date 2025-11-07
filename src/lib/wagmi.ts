import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'

// Validar que el project ID esté presente
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set in .env')
}

export const config = getDefaultConfig({
  appName: 'DeFi Entiendo',
  projectId,
  chains: [sepolia],
  ssr: false,
})