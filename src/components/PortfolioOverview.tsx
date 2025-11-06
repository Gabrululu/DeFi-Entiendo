import { Wallet, TrendingUp, Heart, DollarSign } from 'lucide-react';

interface PortfolioOverviewProps {
  depositedAmount: number;
  vaultValue: number;
  yieldGenerated: number;
  impactCreated: number;
}

export function PortfolioOverview({
  depositedAmount,
  vaultValue,
  yieldGenerated,
  impactCreated,
}: PortfolioOverviewProps) {
  const totalGain = vaultValue - depositedAmount;
  const gainPercentage = depositedAmount > 0 ? (totalGain / depositedAmount) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-effect glass-hover rounded-2xl p-6 group">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-[#00D4FF] to-[#0099FF] rounded-lg group-hover:animate-pulse-glow transition-all">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-300 text-sm font-medium">Deposited</span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {depositedAmount.toFixed(4)} ETH
        </div>
        <div className="text-sm text-slate-400">
          ${(depositedAmount * 2450).toFixed(2)}
        </div>
      </div>

      <div className="glass-effect glass-hover rounded-2xl p-6 group">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-[#84FF00] to-[#66CC00] rounded-lg group-hover:animate-pulse-glow transition-all">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-300 text-sm font-medium">Vault Value</span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {vaultValue.toFixed(4)} ETH
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${gainPercentage >= 0 ? 'text-[#84FF00]' : 'text-[#FF0080]'}`}>
            {gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%
          </span>
          <span className="text-slate-400 text-sm">
            ({gainPercentage >= 0 ? '+' : ''}{totalGain.toFixed(4)} ETH)
          </span>
        </div>
      </div>

      <div className="glass-effect glass-hover rounded-2xl p-6 group">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-[#FF6B00] to-[#FF4500] rounded-lg group-hover:animate-pulse-glow transition-all">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-300 text-sm font-medium">Yield Earned</span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {yieldGenerated.toFixed(4)} ETH
        </div>
        <div className="text-sm text-slate-400">
          ${(yieldGenerated * 2450).toFixed(2)}
        </div>
      </div>

      <div className="glass-effect glass-hover rounded-2xl p-6 group">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-[#FF0080] to-[#CC0066] rounded-lg group-hover:animate-pulse-glow transition-all">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-300 text-sm font-medium">Impact Created</span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {impactCreated.toFixed(4)} ETH
        </div>
        <div className="text-sm text-slate-400">
          Donated to public goods
        </div>
      </div>
    </div>
  );
}
