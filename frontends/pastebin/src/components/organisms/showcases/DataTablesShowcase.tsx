import { Card, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@metabuilder/components/fakemui'

export function DataTablesShowcase() {
  return (
    <section className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="data-tables-showcase" role="region" aria-label="Data tables showcase">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Data Tables</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Structured data display with actions
        </p>
      </div>

      <Card>
        <div className="border-b" style={{ padding: '16px', borderBottom: '1px solid var(--mat-sys-outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontWeight: 600, fontSize: '1.125rem', lineHeight: '1.75rem' }}>Recent Transactions</h3>
            <Button variant="outlined" size="sm">
              Export
            </Button>
          </div>
        </div>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Transaction</TableCell>
                <TableCell>Date</TableCell>
                <TableCell style={{ textAlign: 'right' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Chip>Completed</Chip>
                </TableCell>
                <TableCell style={{ fontWeight: 500 }}>Payment received</TableCell>
                <TableCell>Mar 15, 2024</TableCell>
                <TableCell style={{ textAlign: 'right' }}>$250.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Chip color="secondary">Pending</Chip>
                </TableCell>
                <TableCell style={{ fontWeight: 500 }}>Processing payment</TableCell>
                <TableCell>Mar 14, 2024</TableCell>
                <TableCell style={{ textAlign: 'right' }}>$150.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Chip>Completed</Chip>
                </TableCell>
                <TableCell style={{ fontWeight: 500 }}>Refund issued</TableCell>
                <TableCell>Mar 13, 2024</TableCell>
                <TableCell style={{ textAlign: 'right', color: 'var(--mat-sys-error)' }}>-$75.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Chip color="error">Failed</Chip>
                </TableCell>
                <TableCell style={{ fontWeight: 500 }}>Payment declined</TableCell>
                <TableCell>Mar 12, 2024</TableCell>
                <TableCell style={{ textAlign: 'right' }}>$0.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </section>
  )
}
