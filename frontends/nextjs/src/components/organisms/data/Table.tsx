// Table barrel export - maintains backward compatibility after splitting into smaller organisms
// Components split into separate files to keep each under 150 LOC
export {
  TableCaption,
  TableCell,
  type TableCellProps,
  TableHead,
  type TableHeadProps,
  TableRow,
  type TableRowProps,
} from './TableCell'
export {
  TableCore as Table,
  TableBody,
  TableFooter,
  TableHeader,
  type TableProps,
} from './TableCore'
