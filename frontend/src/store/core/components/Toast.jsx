import { useEffect, useState } from 'react'
import { CheckCircle, X, AlertCircle, Info, Gift, ShoppingBag } from 'lucide-react'

const Toast = ({ message, isVisible, onClose, type = 'success', duration = 4000 }) => {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (isVisible) {
      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval)
            onClose()
            return 0
          }
          return prev - (100 / (duration / 50))
        })
      }, 50)

      // Auto close timer
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
      }
    } else {
      setProgress(100)
    }
  }, [isVisible, onClose, duration])

  if (!isVisible) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
          progress: 'bg-green-300'
        }
      case 'error':
        return {
          container: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
          progress: 'bg-red-300'
        }
      case 'info':
        return {
          container: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
          progress: 'bg-blue-300'
        }
      case 'cart':
        return {
          container: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
          progress: 'bg-purple-300'
        }
      default:
        return {
          container: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
          progress: 'bg-green-300'
        }
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6" />
      case 'error':
        return <AlertCircle className="w-6 h-6" />
      case 'info':
        return <Info className="w-6 h-6" />
      case 'cart':
        return <ShoppingBag className="w-6 h-6" />
      default:
        return <CheckCircle className="w-6 h-6" />
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className={`relative flex items-center space-x-4 space-x-reverse px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 min-w-[320px] max-w-md ${styles.container}`}>
        {/* Icon */}
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        {/* Message */}
        <div className="flex-1">
          <span className="font-semibold text-sm leading-relaxed">{message}</span>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 hover:scale-110"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
          <div 
            className={`h-full transition-all duration-75 ease-linear ${styles.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Sparkle Effect for Success */}
        {type === 'success' && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
          </div>
        )}

        {/* Cart Icon Animation for Cart Type */}
        {type === 'cart' && (
          <div className="absolute -top-2 -left-2">
            <Gift className="w-5 h-5 text-yellow-300 animate-bounce" />
          </div>
        )}
      </div>
    </div>
  )
}

export default Toast