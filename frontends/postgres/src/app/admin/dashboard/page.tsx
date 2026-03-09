'use client';

import LogoutIcon from '@mui/icons-material/Logout';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CodeIcon from '@mui/icons-material/Code';
import RuleIcon from '@mui/icons-material/Rule';
import SpeedIcon from '@mui/icons-material/Speed';
import StorageIcon from '@mui/icons-material/Storage';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import ColumnManagerTab from '@/components/admin/ColumnManagerTab';
import ConstraintManagerTab from '@/components/admin/ConstraintManagerTab';
import IndexManagerTab from '@/components/admin/IndexManagerTab';
import QueryBuilderTab from '@/components/admin/QueryBuilderTab';
import SQLQueryTab from '@/components/admin/SQLQueryTab';
import TableManagerTab from '@/components/admin/TableManagerTab';
import TablesTab from '@/components/admin/TablesTab';
import { getFeatureById, getNavItems } from '@/utils/featureConfig';
import { BASE_PATH } from '@/lib/app-config';
import { theme } from '@/utils/theme';
import Button from '@mui/material/Button';

const DRAWER_WIDTH = 240;

// Icon map for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<any>> = {
  Storage: StorageIcon,
  Code: CodeIcon,
  AccountTree: AccountTreeIcon,
  TableChart: TableChartIcon,
  ViewColumn: ViewColumnIcon,
  Rule: RuleIcon,
  Speed: SpeedIcon,
};

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get navigation items from features.json
  const navItems = getNavItems();

  const fetchTables = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/tables`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch tables');
      }
      const data = await response.json();
      setTables(data.tables);
    } catch (err: any) {
      setError(err.message);
    }
  }, [router]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleTableClick = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setQueryResult(null);

    try {
      const dataResponse = await fetch(`${BASE_PATH}/api/admin/table-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName }),
      });

      if (!dataResponse.ok) {
        const data = await dataResponse.json();
        throw new Error(data.error || 'Query failed');
      }

      const data = await dataResponse.json();
      setQueryResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteQuery = async (query: string) => {
    setLoading(true);
    setError('');
    setQueryResult(null);

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Query failed');
      }

      setQueryResult(data);
      setSuccessMessage('Query executed successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_PATH}/api/admin/logout`, {
        method: 'POST',
      });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Table Management Handlers
  const handleCreateTable = async (tableName: string, columns: any[]) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/table-manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName,
          columns,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create table');
      }

      setSuccessMessage(data.message);
      await fetchTables();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDropTable = async (tableName: string) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/table-manage`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to drop table');
      }

      setSuccessMessage(data.message);
      if (selectedTable === tableName) {
        setSelectedTable('');
        setQueryResult(null);
      }
      await fetchTables();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Column Management Handlers
  const handleAddColumn = async (tableName: string, data: any) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/column-manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add column');
      }

      setSuccessMessage(result.message);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleModifyColumn = async (tableName: string, data: any) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/column-manage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to modify column');
      }

      setSuccessMessage(result.message);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDropColumn = async (tableName: string, data: any) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/column-manage`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to drop column');
      }

      setSuccessMessage(result.message);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Constraint Management Handlers
  const handleAddConstraint = async (tableName: string, data: any) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/constraints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add constraint');
      }

      setSuccessMessage(result.message || 'Constraint added successfully');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDropConstraint = async (tableName: string, constraintName: string) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/constraints`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName,
          constraintName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to drop constraint');
      }

      setSuccessMessage(result.message || 'Constraint dropped successfully');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Query Builder Handler
  const handleExecuteBuiltQuery = async (params: any) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/query-builder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Query failed');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get icon component for navigation item
  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent /> : <StorageIcon />;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <StorageIcon sx={{ mr: 2 }} />
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Postgres Admin Panel
            </Typography>
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            'width': DRAWER_WIDTH,
            'flexShrink': 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {navItems.map((item, index) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    selected={tabValue === index}
                    onClick={() => setTabValue(index)}
                  >
                    <ListItemIcon>
                      {getIconComponent(item.icon)}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Toolbar />

          {/* Render tabs dynamically based on navItems */}
          {navItems.map((item, index) => (
            <TabPanel key={item.id} value={tabValue} index={index}>
              {item.id === 'tables' && (
                <TablesTab
                  tables={tables}
                  selectedTable={selectedTable}
                  onTableClick={handleTableClick}
                />
              )}
              {item.id === 'query' && (
                <SQLQueryTab onExecuteQuery={handleExecuteQuery} />
              )}
              {item.id === 'query-builder' && (
                <QueryBuilderTab
                  tables={tables}
                  onExecuteQuery={handleExecuteBuiltQuery}
                />
              )}
              {item.id === 'table-manager' && (
                <TableManagerTab
                  tables={tables}
                  onCreateTable={handleCreateTable}
                  onDropTable={handleDropTable}
                />
              )}
              {item.id === 'column-manager' && (
                <ColumnManagerTab
                  tables={tables}
                  onAddColumn={handleAddColumn}
                  onModifyColumn={handleModifyColumn}
                  onDropColumn={handleDropColumn}
                />
              )}
              {item.id === 'constraints' && (
                <ConstraintManagerTab
                  tables={tables}
                  onAddConstraint={handleAddConstraint}
                  onDropConstraint={handleDropConstraint}
                />
              )}
              {item.id === 'indexes' && (
                <IndexManagerTab
                  tables={tables}
                  onRefresh={fetchTables}
                />
              )}
            </TabPanel>
          ))}

          {successMessage && (
            <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {queryResult && !loading && (
            <Paper sx={{ mt: 2, overflow: 'auto' }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Rows returned: {queryResult.rowCount}
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {queryResult.fields?.map((field: any) => (
                        <TableCell key={field.name}>
                          <strong>{field.name}</strong>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {queryResult.rows?.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        {queryResult.fields?.map((field: any) => (
                          <TableCell key={field.name}>
                            {row[field.name] !== null
                              ? String(row[field.name])
                              : 'NULL'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
