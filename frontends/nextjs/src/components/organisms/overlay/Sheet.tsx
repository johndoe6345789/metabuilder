// Sheet barrel export - maintains backward compatibility after splitting into smaller organisms
// Components split into separate files to keep each under 150 LOC
export { SheetCore as Sheet, type SheetProps, SheetTrigger, SheetContent } from './SheetCore'
export {
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetPortal,
  SheetOverlay,
  SheetClose,
} from './SheetLayout'
