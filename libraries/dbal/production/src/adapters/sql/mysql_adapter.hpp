#ifndef DBAL_MYSQL_ADAPTER_HPP
#define DBAL_MYSQL_ADAPTER_HPP

#include "sql_adapter_base.hpp"
#include "mysql_connection.hpp"

struct MYSQL_RES;

namespace dbal {
namespace adapters {
namespace sql {

class MySQLAdapter : public SqlAdapter {
public:
    explicit MySQLAdapter(const SqlConnectionConfig& config);

    // Override create/update/createMany because MySQL doesn't support RETURNING
    Result<Json> create(const std::string& entityName, const Json& data) override;
    Result<Json> update(const std::string& entityName, const std::string& id, const Json& data) override;
    Result<int>  createMany(const std::string& entityName, const std::vector<Json>& records) override;

protected:
    std::vector<SqlRow> runQuery(SqlConnection*, const std::string& sql,
                                 const std::vector<SqlParam>& params) override;

    int runNonQuery(SqlConnection*, const std::string& sql,
                    const std::vector<SqlParam>& params) override;

private:
    std::string escapeString(const std::string& input);
    std::string buildQueryString(const std::string& sql, const std::vector<SqlParam>& params);
    void ensureConnected();

    MySQLConnection mysql_;
};

}
}
}

#endif
