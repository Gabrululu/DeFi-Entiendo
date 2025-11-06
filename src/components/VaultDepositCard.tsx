import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Loader2 } from 'lucide-react';

interface VaultDepositCardProps {
  userBalance: number;
  vaultBalance: number;
  currentAPY: number;
  onDeposit: (amount: number) => Promise<void>;
  onWithdraw: (amount: number) => Promise<void>;
}

export function VaultDepositCard({
  userBalance,
  vaultBalance,
  currentAPY,
  onDeposit,
  onWithdraw,
}: VaultDepositCardProps) {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsProcessing(true);
    try {
      if (mode === 'deposit') {
        await onDeposit(numAmount);
      } else {
        await onWithdraw(numAmount);
      }
      setAmount('');
    } catch (error) {
      console.error('Transaction error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const maxAmount = mode === 'deposit' ? userBalance : vaultBalance;

  return (
    <div className="glass-effect glass-hover rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Vault Operations</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#84FF00]/20 to-[#00D4FF]/20 rounded-lg">
          <TrendingUp className="w-4 h-4 text-[#84FF00]" />
          <span className="gradient-text font-semibold">{currentAPY}% APY</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('deposit')}
          className={`flex-1 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 ${
            mode === 'deposit'
              ? 'bg-gradient-to-r from-[#00D4FF] to-[#84FF00] text-white shadow-lg'
              : 'glass-effect text-slate-400 hover:bg-white/10'
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          Deposit
        </button>
        <button
          onClick={() => setMode('withdraw')}
          className={`flex-1 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 ${
            mode === 'withdraw'
              ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg'
              : 'glass-effect text-slate-400 hover:bg-white/10'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" />
          Withdraw
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-300">Amount</label>
              <button
                type="button"
                onClick={() => setAmount(maxAmount.toString())}
                className="text-sm text-[#00D4FF] hover:text-[#84FF00] transition-colors transform hover:scale-105"
              >
                Max: {maxAmount.toFixed(4)} ETH
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full glass-effect border-2 border-transparent focus:border-[#FF0080] rounded-xl px-4 py-3 text-white text-lg focus:outline-none transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                ETH
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your Wallet Balance</span>
              <span className="text-white font-medium">{userBalance.toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your Vault Balance</span>
              <span className="text-white font-medium">{vaultBalance.toFixed(4)} ETH</span>
            </div>
            {amount && parseFloat(amount) > 0 && (
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-slate-400">Estimated Yearly Earnings</span>
                <span className="gradient-text font-medium">
                  +{(parseFloat(amount) * currentAPY / 100).toFixed(4)} ETH
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isProcessing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount}
            className="w-full py-3.5 btn-primary text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Transaction...
              </>
            ) : (
              mode === 'deposit' ? 'Deposit to Vault' : 'Withdraw from Vault'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
