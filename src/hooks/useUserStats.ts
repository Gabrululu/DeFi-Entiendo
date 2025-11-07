import { useReadContract, useAccount } from 'wagmi'
import { CONTRACTS } from '../contracts/addresses'
import VaultABI from '../contracts/abis/DefiEntiendoVault.json'
import { formatUnits } from 'viem'

export function useUserStats() {
  const { address } = useAccount()

  const { data: stats, isLoading, refetch } = useReadContract({
    address: CONTRACTS.sepolia.vault,
    abi: VaultABI.abi,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address, // Solo ejecuta si hay address
    }
  })

  if (!stats || !Array.isArray(stats) || !address) {
    return {
      totalDeposited: '0',
      currentValue: '0',
      yieldContribution: '0',
      educationLevel: 0,
      daysActive: 0,
      sharesOwned: '0',
      isLoading,
      refetch,
    }
  }

  return {
    totalDeposited: formatUnits(stats[0] as bigint, 18),
    currentValue: formatUnits(stats[1] as bigint, 18),
    yieldContribution: formatUnits(stats[2] as bigint, 18),
    educationLevel: Number(stats[3]),
    daysActive: Number(stats[4]),
    sharesOwned: formatUnits(stats[5] as bigint, 18),
    isLoading,
    refetch,
  }
}