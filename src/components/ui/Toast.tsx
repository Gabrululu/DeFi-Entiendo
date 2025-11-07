import { useEffect } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

interface ToastProps {
  type: 'success' | 'error' | 'info'
  message: string
  onClose: () => void
  duration?: number
}

export function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  }

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg border ${bgColors[type]} backdrop-blur-sm flex items-center gap-3 min-w-[300px] animate-slide-up`}>
      {icons[type]}
      <p className="text-sm text-white flex-1">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}