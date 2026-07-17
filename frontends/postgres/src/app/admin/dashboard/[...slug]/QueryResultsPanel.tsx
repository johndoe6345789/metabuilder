'use client';

import {
  Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@metabuilder/components/m3';
import s from './dashboard-content.module.scss';

type Field = { name: string };
type Props = {
  queryResult: {
    rowCount: number;
    fields: Field[];
    rows: Record<string, any>[];
  };
};

function dlFile(name: string, content: string, mime: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function QueryResultsPanel({ queryResult }: Props) {
  const { rowCount, fields, rows } = queryResult;

  const exportCSV = () => {
    const hdr = fields.map(f => JSON.stringify(f.name)).join(',');
    const body = rows.map(r =>
      fields.map(f => {
        const v = r[f.name];
        return v == null ? '' : JSON.stringify(String(v));
      }).join(','),
    ).join('\n');
    dlFile('query-results.csv', `${hdr}\n${body}`, 'text/csv');
  };

  const exportJSON = () =>
    dlFile('query-results.json', JSON.stringify(rows, null, 2), 'application/json');

  return (
    <Paper className={s.queryResults}>
      <div className={s.queryHeader}>
        <Typography variant="caption" color="text.secondary">
          {rowCount} row{rowCount !== 1 ? 's' : ''}
        </Typography>
        {rows?.length > 0 && (
          <span className={s.exportRow}>
            <Tooltip title="Export as CSV">
              <Button size="small" variant="outlined" onClick={exportCSV}>CSV</Button>
            </Tooltip>
            <Tooltip title="Export as JSON">
              <Button size="small" variant="outlined" onClick={exportJSON}>JSON</Button>
            </Tooltip>
          </span>
        )}
      </div>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {fields?.map(f => (
                <TableCell key={f.name}><strong>{f.name}</strong></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row, idx) => (
              <TableRow key={idx}>
                {fields?.map(f => (
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
