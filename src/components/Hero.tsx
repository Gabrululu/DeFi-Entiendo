import { TrendingUp, Users, DollarSign } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
}

export function Hero({ onExplore }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#00D4FF] via-[#0099FF] to-[#3366FF] py-24">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-float">
            Learn DeFi. Earn Impact.<br />
            <span className="gradient-text drop-shadow-lg">Fund Public Goods.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Deposit crypto, earn yield for public goods, and unlock educational NFTs as you master DeFi strategies.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={onExplore}
              className="px-8 py-4 btn-primary text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start Learning
            </button>
            <button
              onClick={onExplore}
              className="px-8 py-4 glass-effect hover:bg-white/20 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Explore Demo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="glass-effect glass-hover rounded-2xl p-6 group">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-gradient-to-br from-[#84FF00] to-[#66CC00] rounded-xl group-hover:animate-pulse-glow transition-all">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">$2.4M</div>
              <div className="text-white/70 text-sm">Total TVL</div>
            </div>

            <div className="glass-effect glass-hover rounded-2xl p-6 group">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-gradient-to-br from-[#FF6B00] to-[#FF4500] rounded-xl group-hover:animate-pulse-glow transition-all">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">47</div>
              <div className="text-white/70 text-sm">Projects Funded</div>
            </div>

            <div className="glass-effect glass-hover rounded-2xl p-6 group">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-gradient-to-br from-[#FF0080] to-[#CC0066] rounded-xl group-hover:animate-pulse-glow transition-all">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">1,842</div>
              <div className="text-white/70 text-sm">Active Learners</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
