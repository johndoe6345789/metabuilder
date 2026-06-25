'use client';

import SearchIcon from '../../Search';
import { Box } from '../../layout';
import { Paper } from '../../surfaces';
import {
  Chip,
  Divider,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '../../data-display';
import { Button, InputAdornment, TextField } from '../../inputs';
import { Storage } from '../../icons';
import { useMemo, useState } from 'react';
import styles from '../../../../scss/components/tables-tab.module.scss';

export type TableInfo = {
  table_name: string;
};

export type TablesTabProps = {
  tables: TableInfo[];
  selectedTable: string;
  onTableClick: (tableName: string) => void;
  title?: string;
  description?: string;
  testId?: string;
};

/**
 * TablesTab - A component for displaying and selecting database tables.
 * Shows a list of available tables with selection support.
 */
export function TablesTab({
  tables,
  selectedTable,
  onTableClick,
  title = 'Database Tables',
  description,
  testId,
}: TablesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredTables = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tables;
    return tables.filter(table => table.table_name.toLowerCase().includes(q));
  }, [searchQuery, tables]);

  const selected = selectedTable
    ? tables.find(table => table.table_name === selectedTable)
    : undefined;
  const isFiltered = filteredTables.length !== tables.length;

  return (
    <Box data-testid={testId} className={styles.root}>
      <Box className={styles.header}>
        <Box className={styles.titleRow}>
          <Typography variant="h5">{title}</Typography>
          <Chip size="small" label={`${tables.length} tables`} />
        </Box>
        {description && (
          <Typography variant="body2" className={styles.subtitle}>
            {description}
          </Typography>
        )}
        <Typography variant="caption" className={styles.eyebrow}>
          Browse schema
        </Typography>
      </Box>

      <Box className={styles.grid}>
        <Paper className={styles.panel}>
          <Box className={styles.panelHeader}>
            <Box className={styles.countRow}>
              <Typography variant="body2" className={styles.count}>
                {filteredTables.length === tables.length
                  ? `${filteredTables.length} available`
                  : `${filteredTables.length} of ${tables.length}`}
              </Typography>
            </Box>
            <TextField
              size="small"
              className={styles.search}
              placeholder="Filter tables"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <List dense disablePadding className={styles.list}>
            {filteredTables.length > 0 ? (
              filteredTables.map(table => (
                <ListItem key={table.table_name} disablePadding>
                  <ListItemButton
                    selected={selectedTable === table.table_name}
                    onClick={() => onTableClick(table.table_name)}
                    className={styles.listItem}
                  >
                    <ListItemIcon>
                      <Storage />
                    </ListItemIcon>
                    <ListItemText primary={table.table_name} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No tables match this filter.
                </Typography>
              </Box>
            )}
          </List>
        </Paper>

        <Paper className={styles.panel}>
          <Box className={styles.infoPanel}>
            <Typography variant="caption" className={styles.eyebrow}>
              Context
            </Typography>
            {selected ? (
              <>
                <Typography variant="h6" className={styles.tableName}>
                  {selected.table_name}
                </Typography>
                <Typography variant="body2" className={styles.infoBody}>
                  Open this table to inspect rows, manage records, or jump to the
                  column and constraint tools.
                </Typography>
                <Box className={styles.statGrid}>
                  <Box className={styles.statCard}>
                    <Typography variant="caption" className={styles.statLabel}>
                      Scope
                    </Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      Selected table
                    </Typography>
                  </Box>
                  <Box className={styles.statCard}>
                    <Typography variant="caption" className={styles.statLabel}>
                      Match
                    </Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      {isFiltered ? 'Filtered' : 'All tables'}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Typography variant="body2" className={styles.infoBody}>
                  Use the left drawer for table management, query building, and schema tools.
                </Typography>
                <Button variant="outlined" onClick={() => onTableClick(selected.table_name)}>
                  Open table
                </Button>
              </>
            ) : (
              <>
                <Typography variant="h6" className={styles.tableName}>
                  Browse tables
                </Typography>
                <Typography variant="body2" className={styles.infoBody}>
                  The list is searchable and optimized for quick navigation.
                  Pick a table on the left to open the row browser.
                </Typography>
                <Box className={styles.statGrid}>
                  <Box className={styles.statCard}>
                    <Typography variant="caption" className={styles.statLabel}>
                      Total
                    </Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      {tables.length} tables
                    </Typography>
                  </Box>
                  <Box className={styles.statCard}>
                    <Typography variant="caption" className={styles.statLabel}>
                      Search
                    </Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      {isFiltered
                        ? `${filteredTables.length} visible`
                        : 'All tables visible'}
                    </Typography>
                  </Box>
                  <Box className={styles.statCard}>
                    <Typography variant="caption" className={styles.statLabel}>
                      Layout
                    </Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      Two-pane browser
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default TablesTab;
