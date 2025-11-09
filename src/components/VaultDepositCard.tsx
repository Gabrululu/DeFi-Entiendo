import { useState } from 'react';
import { TrendingUp, ArrowDownToLine, ArrowUpFromLine, Loader2 } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACTS } from '../contracts/addresses';
import VaultABI from '../contracts/abis/DefiEntiendoVault.json';
import USDCABI from '../contracts/abis/MockERC20.json';
import { useUserBalance } from '../hooks/useUserBalance';

interface VaultDepositCardProps {
  userBalance: number;
  vaultBalance: number;
  currentAPY: number;
  onDeposit: (amount: number) => Promise<void>;
  onWithdraw: (amount: number) => Promise<void>;
}

export function VaultDepositCard({
  vaultBalance,
  currentAPY,
}: VaultDepositCardProps) {
  const { address } = useAccount();
  const { balance: userBalanceStr, refetch: refetchBalance } = useUserBalance();
  const userBalance = parseFloat(userBalanceStr);

  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [txStep, setTxStep] = useState<'idle' | 'approving' | 'executing'>('idle');

  // Approve USDC
  const { writeContract: writeApprove, data: approveHash, error: approveError } = useWriteContract();
  
  // Deposit to Vault
  const { writeContract: writeDeposit, data: depositHash, error: depositError } = useWriteContract();
  
  // Withdraw from Vault
  const { writeContract: writeWithdraw, data: withdrawHash, error: withdrawError } = useWriteContract();

  // Wait for approve
  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ 
    hash: approveHash 
  });
  
  // Wait for deposit
  const { isLoading: isDepositing, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ 
    hash: depositHash 
  });
  
  // Wait for withdraw
  const { isLoading: isWithdrawing, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ 
    hash: withdrawHash 
  });

  // Handle deposit flow
  const handleDeposit = () => {
    if (!amount || !address || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    console.log('Starting deposit for:', amount, 'USDC');
    setTxStep('approving');
    
    try {
      writeApprove({
        address: CONTRACTS.sepolia.usdc,
        abi: USDCABI.abi,
        functionName: 'approve',
        args: [CONTRACTS.sepolia.vault, parseUnits(amount, 18)],
      });
    } catch (error) {
      console.error('Approve error:', error);
      setTxStep('idle');
    }
  };

  // Auto-execute deposit after approve
  if (isApproveSuccess && txStep === 'approving') {
    console.log('Approval successful, executing deposit...');
    setTxStep('executing');
    
    try {
      writeDeposit({
        address: CONTRACTS.sepolia.vault,
        abi: VaultABI.abi,
        functionName: 'deposit',
        args: [parseUnits(amount, 18), address],
      });
    } catch (error) {
      console.error('Deposit error:', error);
      setTxStep('idle');
    }
  }

  // Handle withdraw
  const handleWithdraw = () => {
    if (!amount || !address || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    console.log('Starting withdraw for:', amount, 'USDC');
    setTxStep('executing');
    
    try {
      writeWithdraw({
        address: CONTRACTS.sepolia.vault,
        abi: VaultABI.abi,
        functionName: 'withdraw',
        args: [parseUnits(amount, 18), address, address],
      });
    } catch (error) {
      console.error('Withdraw error:', error);
      setTxStep('idle');
    }
  };

  // Reset on success
  if (isDepositSuccess || isWithdrawSuccess) {
    setTimeout(() => {
      setAmount('');
      setTxStep('idle');
      refetchBalance();
    }, 1000);
  }

  // Show errors
  if (approveError) console.error('Approve error:', approveError);
  if (depositError) console.error('Deposit error:', depositError);
  if (withdrawError) console.error('Withdraw error:', withdrawError);

  const getButtonText = () => {
    if (!address) return 'Connect Wallet First';
    if (isApproving) return 'Approving...';
    if (isDepositing) return 'Depositing...';
    if (isWithdrawing) return 'Withdrawing...';
    if (txStep === 'approving') return 'Approving...';
    if (txStep === 'executing') return activeTab === 'deposit' ? 'Depositing...' : 'Withdrawing...';
    return activeTab === 'deposit' ? 'Deposit' : 'Withdraw';
  };

  const isButtonDisabled = 
    !address || 
    !amount || 
    txStep !== 'idle' ||
    parseFloat(amount) <= 0 ||
    (activeTab === 'deposit' && parseFloat(amount) > userBalance) ||
    (activeTab === 'withdraw' && parseFloat(amount) > vaultBalance);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Vault Operations</h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">{currentAPY}% APY</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-slate-400 mb-1">Your Balance</p>
          <p className="text-2xl font-bold gradient-text">{userBalance.toFixed(4)} USDC</p>
        </div>
        <div>
          <p className="text-sm text-slate-400 mb-1">In Vault</p>
          <p className="text-2xl font-bold text-white">{vaultBalance.toFixed(4)} USDC</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            activeTab === 'deposit'
              ? 'bg-blue-600 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <ArrowDownToLine className="w-4 h-4 inline mr-2" />
          Deposit
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            activeTab === 'withdraw'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          <ArrowUpFromLine className="w-4 h-4 inline mr-2" />
          Withdraw
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Amount (USDC)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            disabled={txStep !== 'idle'}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setAmount(activeTab === 'deposit' ? (userBalance * 0.25).toFixed(2) : (vaultBalance * 0.25).toFixed(2))}
              className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 text-slate-400 rounded"
              disabled={txStep !== 'idle'}
            >
              25%
            </button>
            <button
              onClick={() => setAmount(activeTab === 'deposit' ? (userBalance * 0.5).toFixed(2) : (vaultBalance * 0.5).toFixed(2))}
              className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 text-slate-400 rounded"
              disabled={txStep !== 'idle'}
            >
              50%
            </button>
            <button
              onClick={() => setAmount(activeTab === 'deposit' ? userBalance.toFixed(2) : vaultBalance.toFixed(2))}
              className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 text-slate-400 rounded"
              disabled={txStep !== 'idle'}
            >
              MAX
            </button>
          </div>
        </div>

        <button
          onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
          disabled={isButtonDisabled}
          className={`w-full py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === 'deposit'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          } text-white flex items-center justify-center`}
        >
          {(txStep !== 'idle' || isApproving || isDepositing || isWithdrawing) && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          {getButtonText()}
        </button>

        {(isDepositSuccess || isWithdrawSuccess) && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-sm text-emerald-400">
              Success! Transaction confirmed. Balance will update shortly.
            </p>
          </div>
        )}

        {(approveError || depositError || withdrawError) && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">
              Transaction failed. Please try again or check console for details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}