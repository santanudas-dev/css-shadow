import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const ToastComponent = ({ toast, onRemove }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration || 3000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
  }

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${bgColors[toast.type]} shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full duration-300`}>
      {icons[toast.type]}
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        ×
      </button>
    </div>
  )
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Expose addToast globally
  useEffect(() => {
    (window as any).showToast = addToast
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  )
}

// Helper functions
export const showToast = {
  success: (message: string, duration?: number) => (window as any).showToast?.(message, 'success', duration),
  error: (message: string, duration?: number) => (window as any).showToast?.(message, 'error', duration),
  info: (message: string, duration?: number) => (window as any).showToast?.(message, 'info', duration),
  warning: (message: string, duration?: number) => (window as any).showToast?.(message, 'warning', duration),
}