#include "SqlCommands_postgres.hpp"

namespace pastebin {

namespace {

const char* kPostgresScript = R"SH(
initdb -D /tmp/pgdata -U postgres --no-locale --encoding=UTF8 2>/dev/null && \
pg_ctl start -D /tmp/pgdata -l /tmp/pg.log -w \
  -o "--unix_socket_directories=/tmp --listen_addresses=127.0.0.1" 2>/dev/null && \
echo "$SQL_CODE_B64" | base64 -d | \
psql -U postgres --pset=border=2 -v ON_ERROR_STOP=1
)SH";

} // namespace

SqlCommand buildPostgresCommand(const std::string& sqlBase64) {
    SqlCommand out;
    out.cmd = {"bash", "-c", kPostgresScript};
    out.env = {"SQL_CODE_B64=" + sqlBase64};
    out.networkDisabled = false; // postgres needs loopback
    return out;
}

} // namespace pastebin
