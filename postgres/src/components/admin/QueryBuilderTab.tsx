'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { getQueryOperators } from '@/utils/featureConfig';
import DataGrid from './DataGrid';

type QueryBuilderTabProps = {
  tables: Array<{ table_name: string }>;
  onExecuteQuery: (params: any) => Promise<any>;
};

type WhereCondition = {
  column: string;
  operator: string;
  value: string;
};

export default function QueryBuilderTab({
  tables,
  onExecuteQuery,
}: QueryBuilderTabProps) {
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [whereConditions, setWhereConditions] = useState<WhereCondition[]>([]);
  const [orderByColumn, setOrderByColumn] = useState('');
  const [orderByDirection, setOrderByDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [limit, setLimit] = useState('');
  const [offset, setOffset] = useState('');
  const [result, setResult] = useState<any>(null);
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get operators from configuration
  const OPERATORS = getQueryOperators();

  // Fetch columns when table is selected
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
      const response = await fetch('/api/admin/table-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName }),
      });

      if (response.ok) {
        const data = await response.json();
        const columns = data.columns.map((col: any) => col.column_name);
        setAvailableColumns(columns);
      }
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
    value: string,
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
      const params: any = { table: selectedTable };

      if (selectedColumns.length > 0) {
        params.columns = selectedColumns;
      }

      if (whereConditions.length > 0) {
        params.where = whereConditions
          .filter(c => c.column && c.operator)
          .map(c => ({
            column: c.column,
            operator: c.operator,
            value: c.operator === 'IS NULL' || c.operator === 'IS NOT NULL'
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
    } catch (err: any) {
      setError(err.message || 'Query execution failed');
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
    <>
      <Typography variant="h5" gutterBottom>
        Query Builder
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Build SELECT queries visually with table/column selection, filters, and sorting
      </Typography>

      <Paper sx={{ p: 2, mt: 2 }}>
        {/* Table Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Table</InputLabel>
          <Select
            value={selectedTable}
            label="Select Table"
            onChange={e => handleTableChange(e.target.value)}
          >
            {tables.map(table => (
              <MenuItem key={table.table_name} value={table.table_name}>
                {table.table_name}
              </MenuItem>
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
                label="Select Columns (empty = all columns)"
                onChange={e => setSelectedColumns(e.target.value as string[])}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map(value => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {availableColumns.map(col => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* WHERE Conditions */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">WHERE Conditions</Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddCondition}
                >
                  Add Condition
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
                      label="Column"
                      onChange={e => handleConditionChange(index, 'column', e.target.value)}
                    >
                      {availableColumns.map(col => (
                        <MenuItem key={col} value={col}>
                          {col}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel>Operator</InputLabel>
                    <Select
                      value={condition.operator}
                      label="Operator"
                      onChange={e => handleConditionChange(index, 'operator', e.target.value)}
                    >
                      {OPERATORS.map(op => (
                        <MenuItem key={op.value} value={op.value}>
                          {op.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {condition.operator !== 'IS NULL' && condition.operator !== 'IS NOT NULL' && (
                    <TextField
                      sx={{ flex: 1 }}
                      label="Value"
                      value={condition.value}
                      onChange={e => handleConditionChange(index, 'value', e.target.value)}
                    />
                  )}

                  <IconButton
                    color="error"
                    onClick={() => handleRemoveCondition(index)}
                  >
                    <DeleteIcon />
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
                  label="Order By (optional)"
                  onChange={e => setOrderByColumn(e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {availableColumns.map(col => (
                    <MenuItem key={col} value={col}>
                      {col}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {orderByColumn && (
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Direction</InputLabel>
                  <Select
                    value={orderByDirection}
                    label="Direction"
                    onChange={e => setOrderByDirection(e.target.value as 'ASC' | 'DESC')}
                  >
                    <MenuItem value="ASC">Ascending</MenuItem>
                    <MenuItem value="DESC">Descending</MenuItem>
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
                onChange={e => setLimit(e.target.value)}
              />
              <TextField
                sx={{ flex: 1 }}
                label="Offset (optional)"
                type="number"
                value={offset}
                onChange={e => setOffset(e.target.value)}
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleExecuteQuery}
                disabled={loading}
              >
                Execute Query
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
              >
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
              columns={Object.keys(result.rows[0]).map(key => ({ name: key }))}
              rows={result.rows}
            />
          )}
          {result.rows.length === 0 && (
            <Typography color="text.secondary">No results found</Typography>
          )}
        </Paper>
      )}
    </>
  );
}
