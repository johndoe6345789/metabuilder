import appStrings from '@/data/app-shortcuts.json'

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message = appStrings.messages.loading }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
