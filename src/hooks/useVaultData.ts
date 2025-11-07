import { useReadContract } from 'wagmi'
import { CONTRACTS } from '../contracts/addresses'
import VaultABI from '../contracts/abis/DefiEntiendoVault.json'
import { formatUnits } from 'viem'

export function useVaultData() {
  // Total Assets in Vault
  const { data: totalAssets, isLoading: loadingAssets, refetch: refetchAssets } = useReadContract({
    address: CONTRACTS.sepolia.vault,
    abi: VaultABI.abi,
    functionName: 'totalAssets',
  })

  // Total Yield Generated
  const { data: totalYield, isLoading: loadingYield } = useReadContract({
    address: CONTRACTS.sepolia.vault,
    abi: VaultABI.abi,
    functionName: 'totalYieldGenerated',
  })

  // Total Donated to Public Goods
  const { data: totalDonated, isLoading: loadingDonated } = useReadContract({
    address: CONTRACTS.sepolia.vault,
    abi: VaultABI.abi,
    functionName: 'totalDonatedToPublicGoods',
  })

  // APY estimation
  const { data: apy } = useReadContract({
    address: CONTRACTS.sepolia.vault,
    abi: VaultABI.abi,
    functionName: 'estimatedAPY',
  })

  // Format values (18 decimals for Mock USDC)
  const formattedAssets = totalAssets 
    ? formatUnits(totalAssets as bigint, 18) 
    : '0'
  
  const formattedYield = totalYield 
    ? formatUnits(totalYield as bigint, 18) 
    : '0'
  
  const formattedDonated = totalDonated 
    ? formatUnits(totalDonated as bigint, 18) 
    : '0'

  const formattedAPY = apy
    ? (Number(apy) / 100).toFixed(2) // Convert basis points to percentage
    : '0'

  return {
    totalAssets: formattedAssets,
    totalYield: formattedYield,
    totalDonated: formattedDonated,
    apy: formattedAPY,
    isLoading: loadingAssets || loadingYield || loadingDonated,
    refetch: refetchAssets,
  }
}