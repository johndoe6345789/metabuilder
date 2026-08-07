#include "SqlRunner_command.hpp"
#include "SqlCommands_mysql.hpp"
#include "SqlCommands_postgres.hpp"
#include "SqlCommands_sqlite.hpp"

namespace pastebin {

std::optional<SqlCommand> buildSqlCommand(const RunnerSpec& spec,
                                           const std::string& sqlBase64) {
    if (spec.sqlRunner == "sqlite")
        return buildSqliteCommand(sqlBase64);
    if (spec.sqlRunner == "mysql")
        return buildMysqlCommand(sqlBase64);
    if (spec.sqlRunner == "postgres")
        return buildPostgresCommand(sqlBase64);
    return std::nullopt;
}

} // namespace pastebin
