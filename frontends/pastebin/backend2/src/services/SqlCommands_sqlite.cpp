#include "SqlCommands_sqlite.hpp"

namespace pastebin {

namespace {

// Reads SQL from SQL_CODE_B64, executes against an in-memory SQLite DB,
// and prints table output -- ported verbatim from the old Flask
// service's _SQL_SQLITE_PY.
const char* kSqlitePy = R"PY(
import sqlite3, sys, os, base64
sql = base64.b64decode(os.environ.get('SQL_CODE_B64', '')).decode('utf-8', 'replace')
conn = sqlite3.connect(':memory:')

def print_table(cursor, rows):
    if not rows:
        print('Empty set (0 rows)')
        return
    cols = [d[0] for d in cursor.description]
    data = [[str(v) if v is not None else 'NULL' for v in row] for row in rows]
    ws = [max(len(c), max((len(r[i]) for r in data), default=0)) for i, c in enumerate(cols)]
    sep = '+' + '+'.join('-' * (w + 2) for w in ws) + '+'
    def row_line(r):
        return '|' + '|'.join(' {:<{}} '.format(v, ws[i]) for i, v in enumerate(r)) + '|'
    print(sep)
    print(row_line(cols))
    print(sep)
    for r in data:
        print(row_line(r))
    print(sep)
    n = len(data)
    print('({} row{})'.format(n, 's' if n != 1 else ''))

stmts = [s.strip() for s in sql.split(';') if s.strip()]
ok = True
for stmt in stmts:
    try:
        cur = conn.execute(stmt)
        if cur.description:
            print_table(cur, cur.fetchall())
        else:
            conn.commit()
            n = cur.rowcount
            if n >= 0:
                print('Query OK, {} row{} affected'.format(n, 's' if n != 1 else ''))
            else:
                print('Query OK')
    except Exception as e:
        print('ERROR: ' + str(e), file=sys.stderr)
        ok = False
conn.close()
sys.exit(0 if ok else 1)
)PY";

} // namespace

SqlCommand buildSqliteCommand(const std::string& sqlBase64) {
    SqlCommand out;
    out.cmd = {"python3", "-c", kSqlitePy};
    out.env = {"SQL_CODE_B64=" + sqlBase64};
    out.networkDisabled = true;
    return out;
}

} // namespace pastebin
