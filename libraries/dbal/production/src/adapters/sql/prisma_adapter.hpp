#ifndef DBAL_PRISMA_ADAPTER_HPP
#define DBAL_PRISMA_ADAPTER_HPP

#include "sql_adapter_base.hpp"
#include "../../runtime/requests_client.hpp"
#include <nlohmann/json.hpp>

namespace dbal {
namespace adapters {
namespace sql {

class PrismaAdapter : public SqlAdapter {
public:
    explicit PrismaAdapter(const SqlConnectionConfig& config)
        : SqlAdapter(config, Dialect::Prisma) {}
};

class NativePrismaAdapter : public SqlAdapter {
public:
    explicit NativePrismaAdapter(const SqlConnectionConfig& config)
        : SqlAdapter(config, Dialect::Prisma),
          requestsClient_(resolveBridgeUrl(config), buildBridgeHeaders(resolveBridgeToken(config))) {}

    std::vector<SqlRow> runQuery(SqlConnection* connection,
                                 const std::string& sql,
                                 const std::vector<SqlParam>& params) override;

    int runNonQuery(SqlConnection* connection,
                    const std::string& sql,
                    const std::vector<SqlParam>& params) override;

private:
    static std::string resolveBridgeUrl(const SqlConnectionConfig& config);
    static std::string resolveBridgeToken(const SqlConnectionConfig& config);
    static std::unordered_map<std::string, std::string> buildBridgeHeaders(const std::string& token);

    nlohmann::json buildPayload(const std::string& sql,
                                const std::vector<SqlParam>& params,
                                const std::string& type) const;

    std::vector<SqlRow> parseQueryResponse(const nlohmann::json& responseJson) const;
    int parseNonQueryResponse(const nlohmann::json& responseJson) const;

    runtime::RequestsClient requestsClient_;
};

}
}
}

#endif
