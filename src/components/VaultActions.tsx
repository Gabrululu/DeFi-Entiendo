import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACTS } from '../contracts/addresses'
import VaultABI from '../contracts/abis/DefiEntiendoVault.json'
import USDCABI from '../contracts/abis/MockERC20.json'

export function VaultActions() {
  const { address } = useAccount() // Faltaba esto
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'idle' | 'approving' | 'depositing'>('idle')

  // Separar los hooks para approve y deposit
  const { 
    writeContract: approve, 
    data: approveHash,
    isPending: isApprovePending 
  } = useWriteContract()
  
  const { 
    writeContract: deposit, 
    data: depositHash,
    isPending: isDepositPending 
  } = useWriteContract()

  // Wait for transactions
  const { isLoading: isApproving } = useWaitForTransactionReceipt({ 
    hash: approveHash 
  })
  
  const { isLoading: isDepositing, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ 
    hash: depositHash 
  })

  const handleDeposit = async () => {
    if (!amount || !address) return

    try {
      // Step 1: Approve USDC
      setStep('approving')
      
      approve({
        address: CONTRACTS.sepolia.usdc,
        abi: USDCABI.abi,
        functionName: 'approve',
        args: [CONTRACTS.sepolia.vault, parseUnits(amount, 18)],
      })
    } catch (error) {
      console.error('Approve failed:', error)
      setStep('idle')
    }
  }

  // Auto-trigger deposit después de approve
  const handleDepositAfterApprove = async () => {
    if (!amount || !address) return

    try {
      setStep('depositing')
      
      deposit({
        address: CONTRACTS.sepolia.vault,
        abi: VaultABI.abi,
        functionName: 'deposit',
        args: [parseUnits(amount, 18), address],
      })
    } catch (error) {
      console.error('Deposit failed:', error)
      setStep('idle')
    }
  }

  // Cuando approval termina, hacer deposit
  if (approveHash && !isApproving && step === 'approving') {
    handleDepositAfterApprove()
  }

  // Cuando deposit termina con éxito, resetear
  if (isDepositSuccess && step === 'depositing') {
    setAmount('')
    setStep('idle')
  }

  const getButtonText = () => {
    if (!address) return 'Connect Wallet'
    if (step === 'approving' || isApproving) return 'Approving...'
    if (step === 'depositing' || isDepositing) return 'Depositing...'
    return 'Deposit'
  }

  const isButtonDisabled = 
    !address || 
    !amount || 
    step !== 'idle' || 
    isApproving || 
    isDepositing ||
    isApprovePending ||
    isDepositPending

  return (
    <div className="space-y-4">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount to deposit"
        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400"
        disabled={step !== 'idle'}
      />
      
      <button
        onClick={handleDeposit}
        disabled={isButtonDisabled}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {getButtonText()}
      </button>

      {/* Status messages */}
      {approveHash && step === 'approving' && (
        <p className="text-xs text-blue-400">
          Approval transaction: {approveHash.slice(0, 10)}...
        </p>
      )}
      
      {depositHash && step === 'depositing' && (
        <p className="text-xs text-emerald-400">
          Deposit transaction: {depositHash.slice(0, 10)}...
        </p>
      )}

      {isDepositSuccess && (
        <p className="text-xs text-emerald-400">
          ✅ Deposit successful!
        </p>
      )}
    </div>
  )
}