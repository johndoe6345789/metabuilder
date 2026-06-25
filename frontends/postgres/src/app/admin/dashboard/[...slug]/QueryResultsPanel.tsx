'use client';

import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from '@metabuilder/components/fakemui';
import s from './dashboard-content.module.scss';

type Field = { name: string };
type Props = {
  queryResult: {
    rowCount: number;
    fields: Field[];
    rows: Record<string, any>[];
  };
};

export default function QueryResultsPanel({ queryResult }: Props) {
  return (
    <Paper className={s.queryResults}>
      <div className={s.queryHeader}>
        <Typography variant="caption" color="text.secondary">
          {queryResult.rowCount} row{queryResult.rowCount !== 1 ? 's' : ''}
        </Typography>
      </div>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {queryResult.fields?.map(f => (
                <TableCell key={f.name}><strong>{f.name}</strong></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {queryResult.rows?.map((row, idx) => (
              <TableRow key={idx}>
                {queryResult.fields?.map(f => (
                  <TableCell key={f.name}>
                    {row[f.name] !== null
                      ? String(row[f.name])
                      : (
                        <Typography component="span" variant="caption"
                          color="text.disabled">NULL</Typography>
                      )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
