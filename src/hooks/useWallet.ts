import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function useWallet() {
  const { address, isConnecting: wagmiConnecting } = useAccount()
  const { connect: wagmiConnect, connectors, isPending, error: connectError } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()

  const connect = async () => {
    try {      
      const metamaskConnector = connectors.find(c => c.id === 'injected')
      const connector = metamaskConnector || connectors[0]
      
      if (connector) {
        wagmiConnect({ connector })
      } else {
        throw new Error('No wallet connector found')
      }
    } catch (err) {
      console.error('Connection error:', err)
    }
  }

  const disconnect = () => {
    wagmiDisconnect()
  }

  return {
    address: address || null,
    isConnecting: wagmiConnecting || isPending,
    error: connectError?.message || null,
    connect,
    disconnect,
    isConnected: !!address,
  }
}