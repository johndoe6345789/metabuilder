#include "postgres_adapter.hpp"
#include "postgres_error_mapper.hpp"
#include <libpq-fe.h>
#include <spdlog/spdlog.h>
#include <cstdlib>
#include <mutex>
#include <stdexcept>

namespace dbal {
namespace adapters {
namespace sql {

PostgresAdapter::PostgresAdapter(const SqlConnectionConfig& config)
    : SqlAdapter(config, Dialect::Postgres), pg_(config) {
    ensureConnected();
    initialize();
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

void PostgresAdapter::ensureConnected() {
    if (!pg_.isAlive()) {
        if (!pg_.connect()) {
            throw std::runtime_error("PostgresAdapter: unable to connect");
        }
    }
}

PGresult* PostgresAdapter::execParams(const std::string& sql,
                                      const std::vector<SqlParam>& params) {
    std::lock_guard<std::mutex> lock(pg_mutex_);
    ensureConnected();

    // Build the C-style arrays that PQexecParams expects.
    std::vector<const char*> values;
    values.reserve(params.size());
    for (const auto& p : params) {
        values.push_back(p.value.empty() ? nullptr : p.value.c_str());
    }

    PGresult* res = PQexecParams(
        pg_.handle(),
        sql.c_str(),
        static_cast<int>(params.size()),
        nullptr,          // paramTypes  — let PG infer
        values.data(),
        nullptr,          // paramLengths — text format
        nullptr,          // paramFormats — text format
        0                 // resultFormat — text
    );

    ExecStatusType status = PQresultStatus(res);
    if (status != PGRES_TUPLES_OK && status != PGRES_COMMAND_OK) {
        const char* sqlstate = PQresultErrorField(res, PG_DIAG_SQLSTATE);
        std::string msg = PQresultErrorMessage(res);
        SqlError::Code code = mapPgSqlState(sqlstate);
        PQclear(res);
        throw SqlError{code, msg};
    }

    return res;
}

// ---------------------------------------------------------------------------
// Virtual overrides
// ---------------------------------------------------------------------------

std::vector<SqlRow> PostgresAdapter::runQuery(SqlConnection*,
                                              const std::string& sql,
                                              const std::vector<SqlParam>& params) {
    PGresult* res = execParams(sql, params);

    int nrows = PQntuples(res);
    int ncols = PQnfields(res);

    std::vector<SqlRow> rows;
    rows.reserve(static_cast<size_t>(nrows));

    for (int r = 0; r < nrows; ++r) {
        SqlRow row;
        for (int c = 0; c < ncols; ++c) {
            const char* colName = PQfname(res, c);
            if (PQgetisnull(res, r, c)) {
                row.columns[colName] = "";
            } else {
                row.columns[colName] = PQgetvalue(res, r, c);
            }
        }
        rows.push_back(std::move(row));
    }

    PQclear(res);
    return rows;
}

int PostgresAdapter::runNonQuery(SqlConnection*,
                                 const std::string& sql,
                                 const std::vector<SqlParam>& params) {
    PGresult* res = execParams(sql, params);

    const char* affected = PQcmdTuples(res);
    int count = (affected && affected[0]) ? std::atoi(affected) : 0;

    PQclear(res);
    return count;
}

}
}
}
