import { Typography } from '@metabuilder/components/fakemui';

export type TdvField = { name: string; dataTypeID: number };

const BIGINT_OID = 20;
const TS_NAME = /(?:at|_at|time|stamp|created|updated|date)$/i;

export function fmtCell(value: any, f: TdvField) {
  if (value === null || value === undefined) {
    return (
      <Typography component="span" variant="caption" color="text.disabled">
        NULL
      </Typography>
    );
  }
  if (f.dataTypeID === BIGINT_OID && TS_NAME.test(f.name)) {
    const n = Number(value);
    if (n > 1_000_000_000 && n < 100_000_000_000_000) {
      return new Date(
        n < 10_000_000_000 ? n * 1000 : n,
      ).toLocaleString();
    }
  }
  return String(value);
}
