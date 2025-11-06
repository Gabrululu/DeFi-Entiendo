import { Wallet, BookOpen, TrendingUp, Vote, Heart } from 'lucide-react';

interface MobileNavProps {
  onNavigate: (section: string) => void;
}

export function MobileNav({ onNavigate }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-effect border-t border-white/10 px-4 py-3 safe-area-bottom">
        <div className="flex items-center justify-around">
          <button
            onClick={() => onNavigate('vault')}
            className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#84FF00]/20">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Vault</span>
          </button>

          <button
            onClick={() => onNavigate('learn')}
            className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#84FF00]/20 to-[#FF6B00]/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Learn</span>
          </button>

          <button
            onClick={() => onNavigate('strategies')}
            className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#FF6B00]/20 to-[#FF0080]/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Strategies</span>
          </button>

          <button
            onClick={() => onNavigate('impact')}
            className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#FF0080]/20 to-[#00D4FF]/20">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Impact</span>
          </button>

          <button
            onClick={() => onNavigate('governance')}
            className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#FF0080]/20">
              <Vote className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Vote</span>
          </button>
        </div>
      </div>
    </div>
  );
}
