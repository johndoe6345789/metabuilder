import { Info, Warning } from '@phosphor-icons/react'

export const getLevelIcon = (level: string) => {
  switch (level) {
    case 'error':
      return <Warning className="w-5 h-5" weight="fill" />
    case 'warning':
      return <Warning className="w-5 h-5" />
    case 'info':
      return <Info className="w-5 h-5" />
    default:
      return <Info className="w-5 h-5" />
  }
}

export const getLevelColor = (level: string) => {
  switch (level) {
    case 'error':
      return 'bg-red-500/20 text-red-400 border-red-500/50'
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    case 'info':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
  }
}
