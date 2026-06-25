'use client';

import { useRef, useState } from 'react';
import { Box } from '../../layout';
import { Paper } from '../../surfaces';
import { Typography } from '../../data-display';
import { Button } from '../../inputs';
import { CircularProgress } from '../../feedback';
import styles from './SQLQueryTab.module.scss';

export type SQLQueryTabProps = {
  onExecuteQuery: (query: string) => Promise<void>;
  title?: string;
  description?: string;
  placeholder?: string;
  testId?: string;
};

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const KW_RE = /\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|OUTER|FULL|CROSS|ON|AND|OR|NOT|IN|IS|NULL|AS|LIMIT|OFFSET|ORDER|BY|GROUP|HAVING|DISTINCT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|ALTER|DROP|ADD|COLUMN|CONSTRAINT|PRIMARY|KEY|UNIQUE|CHECK|REFERENCES|FOREIGN|DEFAULT|IF|EXISTS|WITH|UNION|ALL|CASE|WHEN|THEN|ELSE|END|COUNT|SUM|AVG|MIN|MAX|COALESCE|NULLIF|CAST|RETURNING|USING|BEGIN|COMMIT|ROLLBACK|TRUNCATE|EXPLAIN|ANALYZE|VACUUM|SERIAL|INTEGER|TEXT|BOOLEAN|BIGINT|VARCHAR|NUMERIC|TIMESTAMP|UUID|RETURNING)\b/gi;

function hlTokens(text: string): string {
  return esc(text)
    .replace(KW_RE, '<span class="sql-kw">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="sql-num">$1</span>');
}

function hlCode(text: string): string {
  const parts: string[] = [];
  const re = /'[^']*'/g;
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(hlTokens(text.slice(last, m.index)));
    parts.push(`<span class="sql-str">${esc(m[0])}</span>`);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(hlTokens(text.slice(last)));
  return parts.join('');
}

function highlightSQL(text: string): string {
  return text.split('\n').map(line => {
    let ci = -1;
    let inStr = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === "'") { inStr = !inStr; continue; }
      if (!inStr && line[i] === '-' && line[i + 1] === '-') { ci = i; break; }
    }
    return ci >= 0
      ? hlCode(line.slice(0, ci)) + `<span class="sql-cmt">${esc(line.slice(ci))}</span>`
      : hlCode(line);
  }).join('\n');
}

export function SQLQueryTab({
  onExecuteQuery,
  title = 'SQL Query Interface',
  description,
  placeholder = 'SELECT * FROM your_table LIMIT 10;',
  testId,
}: SQLQueryTabProps) {
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleExecute = async () => {
    if (!queryText.trim()) return;
    setLoading(true);
    try { await onExecuteQuery(queryText); } finally { setLoading(false); }
  };

  const syncScroll = (ta: HTMLTextAreaElement) => {
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
  };

  return (
    <Box data-testid={testId} className={styles.root}>
      <Typography variant="h5" gutterBottom>{title}</Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          className={styles.description}
        >
          {description}
        </Typography>
      )}
      <Paper className={styles.card}>
        <Box className={styles.editorBlock}>
          <label className={styles.editorLabel}>
            SQL Query (SELECT only)
          </label>
          <div className="sql-editor-wrap">
            <pre
              ref={preRef}
              className="sql-pre"
              aria-hidden="true"
              /* eslint-disable-next-line react/no-danger */
              dangerouslySetInnerHTML={{ __html: highlightSQL(queryText) + '\n' }}
            />
            <textarea
              className="sql-ta"
              value={queryText}
              onChange={e => setQueryText(e.target.value)}
              onScroll={e => syncScroll(e.currentTarget)}
              placeholder={placeholder}
              spellCheck={false}
              rows={8}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </Box>
        <Box className={styles.actions}>
          <Button variant="contained" onClick={handleExecute} disabled={loading || !queryText.trim()}>
            {loading ? <CircularProgress size={24} /> : 'Execute Query'}
          </Button>
          {!queryText.trim() && !loading && (
            <Typography variant="caption" color="text.secondary" className={styles.hint}>
              Type a query above to execute
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default SQLQueryTab;
