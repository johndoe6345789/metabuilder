// Sheet barrel export - maintains backward compatibility after splitting into smaller organisms
// Components split into separate files to keep each under 150 LOC
export { SheetCore as Sheet, SheetContent,type SheetProps, SheetTrigger } from './SheetCore'
export {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
} from './SheetLayout'
