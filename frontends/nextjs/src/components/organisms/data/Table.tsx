// Table barrel export - maintains backward compatibility after splitting into smaller organisms
// Components split into separate files to keep each under 150 LOC
export {
  TableCore as Table,
  type TableProps,
  TableHeader,
  TableBody,
  TableFooter,
} from './TableCore'
export {
  TableRow,
  type TableRowProps,
  TableHead,
  type TableHeadProps,
  TableCell,
  type TableCellProps,
  TableCaption,
} from './TableCell'
