#ifndef DBAL_POSTGRES_ADAPTER_HPP
#define DBAL_POSTGRES_ADAPTER_HPP

#include "sql_adapter_base.hpp"
#include "postgres_connection.hpp"

extern "C" { typedef struct pg_result PGresult; }

namespace dbal {
namespace adapters {
namespace sql {

class PostgresAdapter : public SqlAdapter {
public:
    explicit PostgresAdapter(const SqlConnectionConfig& config);

protected:
    std::vector<SqlRow> runQuery(SqlConnection*, const std::string& sql,
                                 const std::vector<SqlParam>& params) override;

    int runNonQuery(SqlConnection*, const std::string& sql,
                    const std::vector<SqlParam>& params) override;

private:
    PGresult* execParams(const std::string& sql, const std::vector<SqlParam>& params);
    void ensureConnected();

    mutable std::mutex pg_mutex_;  // serialise access to pg_ under concurrent load
    PostgresConnection pg_;
};

}
}
}

#endif
