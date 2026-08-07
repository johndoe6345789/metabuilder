#include "SqlCommands_mysql.hpp"

namespace pastebin {

namespace {

const char* kMysqlScript = R"SH(
mkdir -p /tmp/db && \
mysqld --initialize-insecure --user=mysql --datadir=/tmp/db 2>/dev/null && \
mysqld --datadir=/tmp/db --user=mysql --socket=/tmp/mysql.sock \
  --skip-networking=0 --bind-address=127.0.0.1 --port=3306 \
  --pid-file=/tmp/mysql.pid 2>/dev/null & \
for i in $(seq 60); do \
  mysql -h127.0.0.1 -P3306 -uroot --silent -e "" 2>/dev/null && break; sleep 1; \
done && \
echo "$SQL_CODE_B64" | base64 -d > /tmp/query.sql && \
mysql -h127.0.0.1 -P3306 -uroot --table < /tmp/query.sql
)SH";

} // namespace

SqlCommand buildMysqlCommand(const std::string& sqlBase64) {
    SqlCommand out;
    out.cmd = {"bash", "-c", kMysqlScript};
    out.env = {"SQL_CODE_B64=" + sqlBase64, "MYSQL_ALLOW_EMPTY_PASSWORD=1"};
    out.networkDisabled = false; // mysqld needs loopback
    return out;
}

} // namespace pastebin
