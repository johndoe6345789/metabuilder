'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SpeedIcon from '@mui/icons-material/Speed';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { getFeatureById, getIndexTypes } from '@/utils/featureConfig';
import { BASE_PATH } from '@/lib/app-config';
import ConfirmDialog from './ConfirmDialog';

type IndexManagerTabProps = {
  tables: Array<{ table_name: string }>;
  onRefresh: () => void;
};

export default function IndexManagerTab({
  tables,
  onRefresh,
}: IndexManagerTabProps) {
  const [selectedTable, setSelectedTable] = useState('');
  const [indexes, setIndexes] = useState<any[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create index form state
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [indexName, setIndexName] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [indexType, setIndexType] = useState('BTREE');
  const [isUnique, setIsUnique] = useState(false);

  // Delete confirmation
  const [deleteIndex, setDeleteIndex] = useState<string | null>(null);

  const feature = getFeatureById('index-management');
  const INDEX_TYPES = getIndexTypes();

  // Fetch indexes for selected table
  const fetchIndexes = async (tableName: string) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${BASE_PATH}/api/admin/indexes?tableName=${tableName}`);
      const data = await response.json();

      if (response.ok) {
        setIndexes(data.indexes || []);
      }
      else {
        setError(data.error || 'Failed to fetch indexes');
      }
    }
    catch (err: any) {
      setError(err.message || 'Failed to fetch indexes');
    }
    finally {
      setLoading(false);
    }
  };

  // Fetch columns for selected table
  const fetchColumns = async (tableName: string) => {
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/table-schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName }),
      });

      if (response.ok) {
        const data = await response.json();
        const cols = data.columns.map((col: any) => col.column_name);
        setAvailableColumns(cols);
      }
    }
    catch (err) {
      console.error('Failed to fetch columns:', err);
    }
  };

  // Handle table selection
  const handleTableChange = async (tableName: string) => {
    setSelectedTable(tableName);
    setIndexes([]);
    setError('');
    setSuccess('');

    if (tableName) {
      await Promise.all([
        fetchIndexes(tableName),
        fetchColumns(tableName),
      ]);
    }
  };

  // Handle create index
  const handleCreateIndex = async () => {
    if (!indexName || selectedColumns.length === 0) {
      setError('Index name and at least one column are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${BASE_PATH}/api/admin/indexes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: selectedTable,
          indexName,
          columns: selectedColumns,
          indexType,
          unique: isUnique,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Index "${indexName}" created successfully`);
        setOpenCreateDialog(false);
        setIndexName('');
        setSelectedColumns([]);
        setIndexType('BTREE');
        setIsUnique(false);
        await fetchIndexes(selectedTable);
        onRefresh();
      }
      else {
        setError(data.error || 'Failed to create index');
      }
    }
    catch (err: any) {
      setError(err.message || 'Failed to create index');
    }
    finally {
      setLoading(false);
    }
  };

  // Handle delete index
  const handleDeleteIndex = async () => {
    if (!deleteIndex)
      return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${BASE_PATH}/api/admin/indexes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexName: deleteIndex }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Index "${deleteIndex}" dropped successfully`);
        setDeleteIndex(null);
        await fetchIndexes(selectedTable);
        onRefresh();
      }
      else {
        setError(data.error || 'Failed to drop index');
      }
    }
    catch (err: any) {
      setError(err.message || 'Failed to drop index');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {feature?.name || 'Index Management'}
      </Typography>
      {feature?.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {feature.description}
        </Typography>
      )}

      {/* Success/Error Messages */}
      {success && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.light' }}>
          <Typography color="success.dark">{success}</Typography>
        </Paper>
      )}
      {error && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Table Selection */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <FormControl fullWidth>
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
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              disabled={loading}
            >
              Create Index
            </Button>
          </Box>
        )}
      </Paper>

      {/* Indexes List */}
      {selectedTable && indexes.length > 0 && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Indexes on {selectedTable}
          </Typography>
          <List>
            {indexes.map(index => (
              <ListItem
                key={index.index_name}
                secondaryAction={(
                  !index.is_primary && (
                    <Tooltip title="Drop Index">
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => setDeleteIndex(index.index_name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )
                )}
              >
                <ListItemIcon>
                  <SpeedIcon />
                </ListItemIcon>
                <ListItemText
                  primary={(
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">{index.index_name}</Typography>
                      {index.is_primary && <Chip label="PRIMARY KEY" size="small" color="primary" />}
                      {index.is_unique && !index.is_primary && <Chip label="UNIQUE" size="small" color="secondary" />}
                      <Chip label={index.index_type.toUpperCase()} size="small" />
                    </Box>
                  )}
                  secondary={`Columns: ${index.columns.join(', ')}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {selectedTable && indexes.length === 0 && !loading && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography color="text.secondary">
            No indexes found for table &quot;{selectedTable}&quot;
          </Typography>
        </Paper>
      )}

      {/* Create Index Dialog */}
      {openCreateDialog && (
        <Paper
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 3,
            zIndex: 1300,
            minWidth: 400,
            maxWidth: 600,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Create Index on {selectedTable}
          </Typography>

          <TextField
            fullWidth
            label="Index Name"
            value={indexName}
            onChange={e => setIndexName(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="e.g., idx_users_email"
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Columns</InputLabel>
            <Select
              multiple
              value={selectedColumns}
              label="Columns"
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

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Index Type</InputLabel>
            <Select
              value={indexType}
              label="Index Type"
              onChange={e => setIndexType(e.target.value)}
            >
              {INDEX_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  <Box>
                    <Typography variant="body1">{type.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox checked={isUnique} onChange={e => setIsUnique(e.target.checked)} />
            }
            label="Unique Index"
            sx={{ mt: 2 }}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleCreateIndex}
              disabled={loading}
            >
              Create
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setOpenCreateDialog(false);
                setIndexName('');
                setSelectedColumns([]);
                setIndexType('BTREE');
                setIsUnique(false);
              }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      )}

      {/* Overlay for create dialog */}
      {openCreateDialog && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1299,
          }}
          onClick={() => setOpenCreateDialog(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteIndex}
        title="Drop Index"
        message={`Are you sure you want to drop the index "${deleteIndex}"? This action cannot be undone.`}
        onConfirm={handleDeleteIndex}
        onCancel={() => setDeleteIndex(null)}
      />
    </>
  );
}
