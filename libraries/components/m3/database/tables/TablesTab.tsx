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
import { TableChart } from '../../icons';
import { useMemo, useState } from 'react';
import styles from '../../../../scss/components/tables-tab.module.scss';

export type TableInfo = {
  table_name: string;
};

/**
 * Display strings for TablesTab. All optional — defaults are English, so the
 * component works standalone; localized apps pass translated values (incl. the
 * count-aware ones as functions, since the counts are computed internally).
 */
export type TablesTabLabels = {
  title: string;
  tablesCount: (count: number) => string;
  browseSchema: string;
  available: (count: number) => string;
  ofTotal: (count: number, total: number) => string;
  filter: string;
  noMatch: string;
  context: string;
  browseTables: string;
  browseHint: string;
  selectedHint: string;
  drawerHint: string;
  total: string;
  search: string;
  layout: string;
  scope: string;
  match: string;
  selectedTable: string;
  allVisible: string;
  visible: (count: number) => string;
  twoPane: string;
  filtered: string;
  allTables: string;
  openTable: string;
};

const DEFAULT_LABELS: TablesTabLabels = {
  title: 'Database Tables',
  tablesCount: n => `${n} tables`,
  browseSchema: 'Browse schema',
  available: n => `${n} available`,
  ofTotal: (n, total) => `${n} of ${total}`,
  filter: 'Filter tables',
  noMatch: 'No tables match this filter.',
  context: 'Context',
  browseTables: 'Browse tables',
  browseHint:
    'The list is searchable and optimized for quick navigation. Pick a table '
    + 'on the left to open the row browser.',
  selectedHint:
    'Open this table to inspect rows, manage records, or jump to the column '
    + 'and constraint tools.',
  drawerHint:
    'Use the left drawer for table management, query building, and schema '
    + 'tools.',
  total: 'Total',
  search: 'Search',
  layout: 'Layout',
  scope: 'Scope',
  match: 'Match',
  selectedTable: 'Selected table',
  allVisible: 'All tables visible',
  visible: n => `${n} visible`,
  twoPane: 'Two-pane browser',
  filtered: 'Filtered',
  allTables: 'All tables',
  openTable: 'Open table',
};

export type TablesTabProps = {
  tables: TableInfo[];
  selectedTable: string;
  onTableClick: (tableName: string) => void;
  title?: string;
  description?: string;
  labels?: Partial<TablesTabLabels>;
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
  title,
  description,
  labels,
  testId,
}: TablesTabProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  const heading = title ?? L.title;
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
          <Typography variant="h5">{heading}</Typography>
          <Chip size="small" label={L.tablesCount(tables.length)} />
        </Box>
        {description && (
          <Typography variant="body2" className={styles.subtitle}>
            {description}
          </Typography>
        )}
        <Typography variant="caption" className={styles.eyebrow}>
          {L.browseSchema}
        </Typography>
      </Box>

      <Box className={styles.grid}>
        <Paper className={styles.panel}>
          <Box className={styles.panelHeader}>
            <Box className={styles.countRow}>
              <Typography variant="body2" className={styles.count}>
                {filteredTables.length === tables.length
                  ? L.available(filteredTables.length)
                  : L.ofTotal(filteredTables.length, tables.length)}
              </Typography>
            </Box>
            <TextField
              size="small"
              className={styles.search}
              placeholder={L.filter}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <div className={styles.listWrapper}>
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
                        <TableChart />
                      </ListItemIcon>
                      <ListItemText primary={table.table_name} />
                    </ListItemButton>
                  </ListItem>
                ))
              ) : (
                <div className={styles.noMatch}>
                  <Typography variant="body2" color="text.secondary">
                    {L.noMatch}
                  </Typography>
                </div>
              )}
            </List>
          </div>
        </Paper>

        <Paper className={styles.panel}>
          <Box className={styles.infoPanel}>
            <Typography variant="caption" className={styles.eyebrow}>
              {L.context}
            </Typography>
            {selected ? (
              <>
                <Typography variant="h6" className={styles.tableName}>
                  {selected.table_name}
                </Typography>
                <Typography variant="body2" className={styles.infoBody}>
                  {L.selectedHint}
                </Typography>
                <Box className={styles.statGrid}>
                  <Box className={styles.statCard}>
                    <Typography variant="caption" className={styles.statLabel}>
                      {L.scope}
                    </Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      {L.selectedTable}
                    </Typography>
                  </Box>
                  <Box className={styles.statCard}>
                    <Typography variant="caption" className={styles.statLabel}>
                      {L.match}
                    </Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      {isFiltered ? L.filtered : L.allTables}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Typography variant="body2" className={styles.infoBody}>
                  {L.drawerHint}
                </Typography>
                <Button variant="outlined" onClick={() => onTableClick(selected.table_name)}>
                  {L.openTable}
                </Button>
              </>
            ) : (
              <>
                <Typography variant="h6" className={styles.tableName}>
                  {L.browseTables}
                </Typography>
                <Typography variant="body2" className={styles.infoBody}>
                  {L.browseHint}
                </Typography>
                <Box className={styles.statGrid}>
                  <Box className={styles.statCard}>
                    <Typography variant="caption" className={styles.statLabel}>
                      {L.total}
                    </Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      {L.tablesCount(tables.length)}
                    </Typography>
                  </Box>
                  <Box className={styles.statCard}>
                    <Typography variant="caption" className={styles.statLabel}>
                      {L.search}
                    </Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      {isFiltered
                        ? L.visible(filteredTables.length)
                        : L.allVisible}
                    </Typography>
                  </Box>
                  <Box className={styles.statCard}>
                    <Typography variant="caption" className={styles.statLabel}>
                      {L.layout}
                    </Typography>
                    <Typography variant="body2" className={styles.statValue}>
                      {L.twoPane}
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
