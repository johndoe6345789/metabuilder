/**
 * DatabaseSettings - Runtime database configuration panel
 *
 * Lets the user view the current database adapter, test connections,
 * and switch databases at runtime via the DBAL admin API.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BASE_PATH } from '@/lib/app-config';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Alert,
  Divider,
  Chip,
} from '@metabuilder/fakemui';

interface AdapterInfo {
  name: string;
  description: string;
  supported: boolean;
  active: boolean;
}

interface CurrentConfig {
  adapter: string;
  database_url: string;
  status: string;
}

// Which form fields to show per adapter type
const ADAPTER_FIELDS: Record<string, string[]> = {
  postgres: ['host', 'port', 'database', 'user', 'password'],
  mysql: ['host', 'port', 'database', 'user', 'password'],
  cockroachdb: ['host', 'port', 'database', 'user', 'password'],
  tidb: ['host', 'port', 'database', 'user', 'password'],
  sqlite: ['path'],
  mongodb: ['connectionString', 'database'],
  redis: ['host', 'port', 'dbIndex'],
  elasticsearch: ['host', 'port', 'index'],
  cassandra: ['host', 'port', 'keyspace'],
  surrealdb: ['host', 'port', 'namespace', 'database'],
  supabase: ['host', 'apiKey', 'database'],
  dynamodb: ['region', 'accessKey', 'secretKey', 'table'],
};

const DEFAULT_PORTS: Record<string, string> = {
  postgres: '5432',
  mysql: '3306',
  cockroachdb: '26257',
  tidb: '4000',
  mongodb: '27017',
  redis: '6379',
  elasticsearch: '9200',
  cassandra: '9042',
  surrealdb: '8000',
};

function buildUrl(adapter: string, fields: Record<string, string>): string {
  if (adapter === 'sqlite') {
    return `sqlite://${fields.path || ':memory:'}`;
  }
  if (adapter === 'mongodb') {
    return fields.connectionString || `mongodb://localhost:27017/${fields.database || 'metabuilder'}`;
  }
  const user = fields.user || '';
  const password = fields.password || '';
  const host = fields.host || 'localhost';
  const port = fields.port || DEFAULT_PORTS[adapter] || '';
  const database = fields.database || 'metabuilder';

  const auth = user ? `${user}${password ? ':' + password : ''}@` : '';
  const portPart = port ? ':' + port : '';

  return `${adapter}://${auth}${host}${portPart}/${database}`;
}

export default function DatabaseSettings() {
  const [config, setConfig] = useState<CurrentConfig | null>(null);
  const [adapters, setAdapters] = useState<AdapterInfo[]>([]);
  const [selectedAdapter, setSelectedAdapter] = useState('postgres');
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [switchResult, setSwitchResult] = useState<{ ok: boolean; message: string } | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_PATH}/api/dbal/admin/config`);
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch {
      // DBAL might not be running
    }
  }, []);

  const fetchAdapters = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_PATH}/api/dbal/admin/adapters`);
      const data = await res.json();
      if (data.success) {
        setAdapters(data.data);
      }
    } catch {
      // DBAL might not be running
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchConfig(), fetchAdapters()]).finally(() => setLoading(false));
  }, [fetchConfig, fetchAdapters]);

  const handleAdapterChange = (value: string) => {
    setSelectedAdapter(value);
    setFormFields({});
    setTestResult(null);
    setSwitchResult(null);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormFields(prev => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const url = buildUrl(selectedAdapter, formFields);
      const res = await fetch(`${BASE_PATH}/api/dbal/admin/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adapter: selectedAdapter, database_url: url }),
      });
      const data = await res.json();
      setTestResult({
        ok: data.success,
        message: data.message || data.error || 'Unknown result',
      });
    } catch (err) {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : 'Request failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleApply = async () => {
    setSwitching(true);
    setSwitchResult(null);
    try {
      const url = buildUrl(selectedAdapter, formFields);
      const res = await fetch(`${BASE_PATH}/api/dbal/admin/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adapter: selectedAdapter, database_url: url }),
      });
      const data = await res.json();
      setSwitchResult({
        ok: data.success,
        message: data.message || data.error || 'Unknown result',
      });
      if (data.success) {
        await fetchConfig();
        await fetchAdapters();
      }
    } catch (err) {
      setSwitchResult({ ok: false, message: err instanceof Error ? err.message : 'Request failed' });
    } finally {
      setSwitching(false);
    }
  };

  const fields = ADAPTER_FIELDS[selectedAdapter] || [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="body2" color="text.secondary">Loading database configuration...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Current Config */}
      <Card data-testid="current-db-card">
        <CardHeader title="Current Database" />
        <CardContent>
          {config ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle1">Adapter:</Typography>
                <Chip
                  label={config.adapter}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={config.status}
                  color={config.status === 'connected' ? 'success' : 'error'}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle1">URL:</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {config.database_url}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Alert severity="warning">
              Could not connect to DBAL daemon. Make sure it is running on port 8080.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Switch Database */}
      <Card data-testid="switch-db-card">
        <CardHeader title="Switch Database" />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Adapter
              </Typography>
              <Select
                fullWidth
                value={selectedAdapter}
                onChange={(e) => handleAdapterChange(e.target.value)}
                data-testid="adapter-select"
              >
                <MenuItem value="postgres">PostgreSQL</MenuItem>
                <MenuItem value="mysql">MySQL</MenuItem>
                <MenuItem value="mongodb">MongoDB</MenuItem>
                <MenuItem value="sqlite">SQLite</MenuItem>
                <MenuItem value="redis">Redis</MenuItem>
                <MenuItem value="elasticsearch">Elasticsearch</MenuItem>
                <MenuItem value="cassandra">Cassandra</MenuItem>
                <MenuItem value="surrealdb">SurrealDB</MenuItem>
                <MenuItem value="supabase">Supabase</MenuItem>
                <MenuItem value="cockroachdb">CockroachDB</MenuItem>
                <MenuItem value="tidb">TiDB</MenuItem>
              </Select>
            </Box>

            <Divider />

            {/* Dynamic fields based on adapter type */}
            {fields.map((field) => (
              <TextField
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                fullWidth
                value={formFields[field] || ''}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                type={field === 'password' || field === 'secretKey' || field === 'apiKey' ? 'password' : 'text'}
                placeholder={
                  field === 'host' ? 'localhost' :
                  field === 'port' ? DEFAULT_PORTS[selectedAdapter] || '' :
                  field === 'database' ? 'metabuilder' :
                  field === 'user' ? 'metabuilder' :
                  field === 'connectionString' ? 'mongodb://user:pass@host:27017/db' :
                  field === 'path' ? '/path/to/database.sqlite' :
                  ''
                }
                data-testid={`field-${field}`}
              />
            ))}

            {testResult && (
              <Alert severity={testResult.ok ? 'success' : 'error'} data-testid="test-result">
                {testResult.message}
              </Alert>
            )}

            {switchResult && (
              <Alert severity={switchResult.ok ? 'success' : 'error'} data-testid="switch-result">
                {switchResult.message}
              </Alert>
            )}
          </Box>
        </CardContent>
        <CardActions>
          <Button
            variant="outlined"
            onClick={handleTestConnection}
            disabled={testing}
            data-testid="test-connection-btn"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={switching}
            data-testid="apply-db-btn"
          >
            {switching ? 'Switching...' : 'Apply'}
          </Button>
        </CardActions>
      </Card>

      {/* Available Backends */}
      {adapters.length > 0 && (
        <Card data-testid="backends-card">
          <CardHeader title="Available Backends" />
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {adapters.map((a) => (
                <Chip
                  key={a.name}
                  label={a.name}
                  color={a.active ? 'primary' : a.supported ? 'default' : 'default'}
                  variant={a.active ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
