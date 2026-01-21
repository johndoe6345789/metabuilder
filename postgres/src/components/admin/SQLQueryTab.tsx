'use client';

import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { getFeatureById } from '@/utils/featureConfig';

type SQLQueryTabProps = {
  onExecuteQuery: (query: string) => Promise<void>;
};

export default function SQLQueryTab({ onExecuteQuery }: SQLQueryTabProps) {
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);

  // Get feature configuration from JSON
  const feature = getFeatureById('sql-query');

  const handleExecute = async () => {
    if (!queryText.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onExecuteQuery(queryText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {feature?.name || 'SQL Query Interface'}
      </Typography>

      {feature?.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {feature.description}
        </Typography>
      )}

      <Paper sx={{ p: 2, mt: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          label="SQL Query (SELECT only)"
          variant="outlined"
          value={queryText}
          onChange={e => setQueryText(e.target.value)}
          placeholder="SELECT * FROM your_table LIMIT 10;"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleExecute}
          disabled={loading || !queryText.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Execute Query'}
        </Button>
      </Paper>
    </Box>
  );
}
