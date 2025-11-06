import { Wallet } from 'lucide-react';

interface ConnectWalletButtonProps {
  address: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectWalletButton({
  address,
  isConnecting,
  onConnect,
  onDisconnect,
}: ConnectWalletButtonProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (address) {
    return (
      <button
        onClick={onDisconnect}
        className="px-6 py-3 glass-effect hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg transform hover:scale-105 active:scale-95"
      >
        <Wallet className="w-5 h-5" />
        {formatAddress(address)}
      </button>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className="px-6 py-3 btn-primary text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Wallet className="w-5 h-5" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
