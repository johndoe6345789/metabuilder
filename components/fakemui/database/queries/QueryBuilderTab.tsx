'use client';

import { useState } from 'react';
import { Box } from '../../layout';
import { Paper } from '../../surfaces';
import { Typography, Chip } from '../../data-display';
import {
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  IconButton,
} from '../../inputs';
import { Add, Delete, Play } from '../../icons';
import { DataGrid } from '../grids';

export type QueryOperator = {
  value: string;
  label: string;
};

export type WhereCondition = {
  column: string;
  operator: string;
  value: string;
};

export type QueryBuilderTabProps = {
  tables: Array<{ table_name: string }>;
  onExecuteQuery: (params: QueryBuilderParams) => Promise<QueryResult>;
  onFetchColumns: (tableName: string) => Promise<string[]>;
  operators?: QueryOperator[];
  testId?: string;
};

export type QueryBuilderParams = {
  table: string;
  columns?: string[];
  where?: Array<{
    column: string;
    operator: string;
    value?: string;
  }>;
  orderBy?: {
    column: string;
    direction: 'ASC' | 'DESC';
  };
  limit?: number;
  offset?: number;
};

export type QueryResult = {
  rows: Record<string, unknown>[];
  rowCount: number;
  query?: string;
};

const DEFAULT_OPERATORS: QueryOperator[] = [
  { value: '=', label: 'Equals (=)' },
  { value: '!=', label: 'Not Equals (!=)' },
  { value: '>', label: 'Greater Than (>)' },
  { value: '<', label: 'Less Than (<)' },
  { value: '>=', label: 'Greater or Equal (>=)' },
  { value: '<=', label: 'Less or Equal (<=)' },
  { value: 'LIKE', label: 'Like (LIKE)' },
  { value: 'ILIKE', label: 'Like (Case Insensitive)' },
  { value: 'IN', label: 'In (IN)' },
  { value: 'IS NULL', label: 'Is Null' },
  { value: 'IS NOT NULL', label: 'Is Not Null' },
];

/**
 * QueryBuilderTab - A visual SQL query builder component.
 * Allows building SELECT queries with table/column selection, filters, and sorting.
 */
export function QueryBuilderTab({
  tables,
  onExecuteQuery,
  onFetchColumns,
  operators = DEFAULT_OPERATORS,
  testId,
}: QueryBuilderTabProps) {
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [whereConditions, setWhereConditions] = useState<WhereCondition[]>([]);
  const [orderByColumn, setOrderByColumn] = useState('');
  const [orderByDirection, setOrderByDirection] = useState<'ASC' | 'DESC'>(
    'ASC'
  );
  const [limit, setLimit] = useState('');
  const [offset, setOffset] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTableChange = async (tableName: string) => {
    setSelectedTable(tableName);
    setSelectedColumns([]);
    setWhereConditions([]);
    setOrderByColumn('');
    setResult(null);
    setGeneratedQuery('');

    if (!tableName) {
      setAvailableColumns([]);
      return;
    }

    try {
      const columns = await onFetchColumns(tableName);
      setAvailableColumns(columns);
    } catch (err) {
      console.error('Failed to fetch columns:', err);
    }
  };

  const handleAddCondition = () => {
    setWhereConditions([
      ...whereConditions,
      { column: '', operator: '=', value: '' },
    ]);
  };

  const handleRemoveCondition = (index: number) => {
    setWhereConditions(whereConditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (
    index: number,
    field: keyof WhereCondition,
    value: string
  ) => {
    const updated = [...whereConditions];
    if (updated[index]) {
      updated[index][field] = value;
    }
    setWhereConditions(updated);
  };

  const handleExecuteQuery = async () => {
    if (!selectedTable) {
      setError('Please select a table');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params: QueryBuilderParams = { table: selectedTable };

      if (selectedColumns.length > 0) {
        params.columns = selectedColumns;
      }

      if (whereConditions.length > 0) {
        params.where = whereConditions
          .filter((c) => c.column && c.operator)
          .map((c) => ({
            column: c.column,
            operator: c.operator,
            value:
              c.operator === 'IS NULL' || c.operator === 'IS NOT NULL'
                ? undefined
                : c.value,
          }));
      }

      if (orderByColumn) {
        params.orderBy = {
          column: orderByColumn,
          direction: orderByDirection,
        };
      }

      if (limit) {
        params.limit = Number.parseInt(limit, 10);
      }

      if (offset) {
        params.offset = Number.parseInt(offset, 10);
      }

      const data = await onExecuteQuery(params);
      setResult(data);
      setGeneratedQuery(data.query || '');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Query execution failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedTable('');
    setSelectedColumns([]);
    setAvailableColumns([]);
    setWhereConditions([]);
    setOrderByColumn('');
    setOrderByDirection('ASC');
    setLimit('');
    setOffset('');
    setResult(null);
    setGeneratedQuery('');
    setError('');
  };

  return (
    <div data-testid={testId}>
      <Typography variant="h5" gutterBottom>
        Query Builder
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Build SELECT queries visually with table/column selection, filters, and
        sorting
      </Typography>

      <Paper sx={{ p: 2, mt: 2 }}>
        {/* Table Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Table</InputLabel>
          <Select
            value={selectedTable}
            onChange={(e) => handleTableChange(e.target.value as string)}
          >
            {tables.map((table) => (
              <option key={table.table_name} value={table.table_name}>
                {table.table_name}
              </option>
            ))}
          </Select>
        </FormControl>

        {selectedTable && (
          <>
            {/* Column Selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Columns (empty = all columns)</InputLabel>
              <Select
                multiple
                value={selectedColumns}
                onChange={(e) =>
                  setSelectedColumns(e.target.value as unknown as string[])
                }
              >
                {availableColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </Select>
              {selectedColumns.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {selectedColumns.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            </FormControl>

            {/* WHERE Conditions */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1">WHERE Conditions</Typography>
                <Button size="small" onClick={handleAddCondition}>
                  <Add /> Add Condition
                </Button>
              </Box>

              {whereConditions.map((condition, index) => (
                <Box
                  key={index}
                  sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}
                >
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Column</InputLabel>
                    <Select
                      value={condition.column}
                      onChange={(e) =>
                        handleConditionChange(
                          index,
                          'column',
                          e.target.value as string
                        )
                      }
                    >
                      {availableColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Operator</InputLabel>
                    <Select
                      value={condition.operator}
                      onChange={(e) =>
                        handleConditionChange(
                          index,
                          'operator',
                          e.target.value as string
                        )
                      }
                    >
                      {operators.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {condition.operator !== 'IS NULL' &&
                    condition.operator !== 'IS NOT NULL' && (
                      <TextField
                        sx={{ flex: 1 }}
                        label="Value"
                        value={condition.value}
                        onChange={(e) =>
                          handleConditionChange(index, 'value', e.target.value)
                        }
                      />
                    )}

                  <IconButton
                    color="error"
                    onClick={() => handleRemoveCondition(index)}
                    aria-label="Remove condition"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </Box>

            {/* ORDER BY */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Order By (optional)</InputLabel>
                <Select
                  value={orderByColumn}
                  onChange={(e) => setOrderByColumn(e.target.value as string)}
                >
                  <option value="">None</option>
                  {availableColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {orderByColumn && (
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Direction</InputLabel>
                  <Select
                    value={orderByDirection}
                    onChange={(e) =>
                      setOrderByDirection(e.target.value as 'ASC' | 'DESC')
                    }
                  >
                    <option value="ASC">Ascending</option>
                    <option value="DESC">Descending</option>
                  </Select>
                </FormControl>
              )}
            </Box>

            {/* LIMIT and OFFSET */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                label="Limit (optional)"
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
              <TextField
                sx={{ flex: 1 }}
                label="Offset (optional)"
                type="number"
                value={offset}
                onChange={(e) => setOffset(e.target.value)}
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleExecuteQuery}
                disabled={loading}
              >
                <Play /> Execute Query
              </Button>
              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Error Display */}
      {error && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Generated Query Display */}
      {generatedQuery && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Generated SQL:
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 1,
              bgcolor: 'grey.100',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {generatedQuery}
          </Box>
        </Paper>
      )}

      {/* Results Display */}
      {result && result.rows && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Results ({result.rowCount} rows)
          </Typography>
          {result.rows.length > 0 && (
            <DataGrid
              columns={Object.keys(result.rows[0]).map((key) => ({
                name: key,
              }))}
              rows={result.rows}
            />
          )}
          {result.rows.length === 0 && (
            <Typography color="text.secondary">No results found</Typography>
          )}
        </Paper>
      )}
    </div>
  );
}

export default QueryBuilderTab;
