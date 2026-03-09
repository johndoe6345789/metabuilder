export interface CodeExplanationDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean

  /**
   * Callback when open state changes
   */
  onOpenChange: (open: boolean) => void

  /**
   * File name being explained
   */
  fileName?: string

  /**
   * The code explanation text
   */
  explanation: string

  /**
   * Whether the explanation is being loaded
   */
  isLoading: boolean
}
