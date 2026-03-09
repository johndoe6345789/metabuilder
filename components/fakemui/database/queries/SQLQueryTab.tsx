'use client';

import { useState } from 'react';
import { Box } from '../../layout';
import { Paper } from '../../surfaces';
import { Typography } from '../../data-display';
import { Button, TextField } from '../../inputs';
import { CircularProgress } from '../../feedback';

export type SQLQueryTabProps = {
  onExecuteQuery: (query: string) => Promise<void>;
  title?: string;
  description?: string;
  placeholder?: string;
  testId?: string;
};

/**
 * SQLQueryTab - A component for executing raw SQL queries.
 * Provides a text area for query input and execute button.
 */
export function SQLQueryTab({
  onExecuteQuery,
  title = 'SQL Query Interface',
  description,
  placeholder = 'SELECT * FROM your_table LIMIT 10;',
  testId,
}: SQLQueryTabProps) {
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);

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
    <Box data-testid={testId}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>
      )}

      <Paper sx={{ p: 2, mt: 2 }}>
        <TextField
          fullWidth
          label="SQL Query (SELECT only)"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder={placeholder}
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

export default SQLQueryTab;
