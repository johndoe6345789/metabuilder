export interface DrawerProps {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  title?: string;
  description?: string;
  className?: string;
}
