import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function DataTablesShowcase() {
  return (
    <section className="space-y-6" data-testid="data-tables-showcase" role="region" aria-label="Data tables showcase">
      <div>
        <h2 className="text-3xl font-bold mb-2">Data Tables</h2>
        <p className="text-muted-foreground">
          Structured data display with actions
        </p>
      </div>

      <Card>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Recent Transactions</h3>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <Badge>Completed</Badge>
              </TableCell>
              <TableCell className="font-medium">Payment received</TableCell>
              <TableCell>Mar 15, 2024</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Badge variant="secondary">Pending</Badge>
              </TableCell>
              <TableCell className="font-medium">Processing payment</TableCell>
              <TableCell>Mar 14, 2024</TableCell>
              <TableCell className="text-right">$150.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Badge>Completed</Badge>
              </TableCell>
              <TableCell className="font-medium">Refund issued</TableCell>
              <TableCell>Mar 13, 2024</TableCell>
              <TableCell className="text-right text-destructive">-$75.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Badge variant="destructive">Failed</Badge>
              </TableCell>
              <TableCell className="font-medium">Payment declined</TableCell>
              <TableCell>Mar 12, 2024</TableCell>
              <TableCell className="text-right">$0.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </section>
  )
}
