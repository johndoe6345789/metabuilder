#include "RunnerRegistry_internal.hpp"

namespace pastebin {

void populateSqlRunners(std::map<std::string, RunnerSpec>& m) {
    m["sql-sqlite"] = makeSqlRunnerSpec(
        "PYTHON_RUNNER_IMAGE", "python:3.11-slim", "sqlite", "query.sql");

    m["sql-mysql"] = makeSqlRunnerSpec("MYSQL_RUNNER_IMAGE", "mysql:8.0",
                                        "mysql", "query.sql");

    m["sql-postgres"] = makeSqlRunnerSpec(
        "POSTGRES_RUNNER_IMAGE", "postgres:16-alpine", "postgres",
        "query.sql");
}

} // namespace pastebin
