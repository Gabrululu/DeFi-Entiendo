import { useReadContract, useAccount } from 'wagmi'
import { CONTRACTS } from '../contracts/addresses'
import USDCABI from '../contracts/abis/MockERC20.json'
import { formatUnits } from 'viem'

export function useUserBalance() {
  const { address } = useAccount()

  const { data: balance, isLoading, refetch } = useReadContract({
    address: CONTRACTS.sepolia.usdc,
    abi: USDCABI.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refresh every 5 seconds
    }
  })

  const formattedBalance = balance 
    ? formatUnits(balance as bigint, 18)
    : '0'

  return {
    balance: formattedBalance,
    balanceRaw: balance as bigint | undefined,
    isLoading,
    refetch,
  }
}