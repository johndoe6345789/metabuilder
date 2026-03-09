#include "prisma_adapter.hpp"

namespace dbal {
namespace adapters {
namespace sql {

std::vector<SqlRow> NativePrismaAdapter::runQuery(SqlConnection* connection,
                             const std::string& sql,
                             const std::vector<SqlParam>& params) {
    (void)connection;
    const auto payload = buildPayload(sql, params, "query");
    const auto response = requestsClient_.post(
        "/api/native-prisma",
        payload.dump());
    if (response.statusCode != 200) {
        throw SqlError{SqlError::Code::Unknown, "Native Prisma bridge request failed"};
    }
    return parseQueryResponse(response.json);
}

int NativePrismaAdapter::runNonQuery(SqlConnection* connection,
                const std::string& sql,
                const std::vector<SqlParam>& params) {
    (void)connection;
    const auto payload = buildPayload(sql, params, "nonquery");
    const auto response = requestsClient_.post(
        "/api/native-prisma",
        payload.dump());
    if (response.statusCode != 200) {
        throw SqlError{SqlError::Code::Unknown, "Native Prisma bridge request failed"};
    }
    return parseNonQueryResponse(response.json);
}

std::string NativePrismaAdapter::resolveBridgeUrl(const SqlConnectionConfig& config) {
    if (!config.prisma_bridge_url.empty()) {
        return config.prisma_bridge_url;
    }
    if (const char* env_url = std::getenv("DBAL_NATIVE_PRISMA_URL")) {
        return std::string(env_url);
    }
    return "http://localhost:3000";
}

std::string NativePrismaAdapter::resolveBridgeToken(const SqlConnectionConfig& config) {
    if (!config.prisma_bridge_token.empty()) {
        return config.prisma_bridge_token;
    }
    if (const char* env_token = std::getenv("DBAL_NATIVE_PRISMA_TOKEN")) {
        return std::string(env_token);
    }
    return "";
}

std::unordered_map<std::string, std::string> NativePrismaAdapter::buildBridgeHeaders(const std::string& token) {
    std::unordered_map<std::string, std::string> headers;
    headers["Content-Type"] = "application/json";
    if (!token.empty()) {
        headers["x-dbal-native-prisma-token"] = token;
    }
    return headers;
}

nlohmann::json NativePrismaAdapter::buildPayload(const std::string& sql,
                            const std::vector<SqlParam>& params,
                            const std::string& type) const {
    nlohmann::json payload;
    payload["sql"] = sql;
    payload["type"] = type;
    payload["params"] = nlohmann::json::array();
    for (const auto& param : params) {
        payload["params"].push_back(param.value);
    }
    return payload;
}

std::vector<SqlRow> NativePrismaAdapter::parseQueryResponse(const nlohmann::json& responseJson) const {
    std::vector<SqlRow> rows;
    if (responseJson.contains("rows") && responseJson["rows"].is_array()) {
        for (const auto& entry : responseJson["rows"]) {
            SqlRow row;
            if (entry.is_object()) {
                for (const auto& [key, value] : entry.items()) {
                    if (value.is_string()) {
                        row.columns[key] = value.get<std::string>();
                    } else {
                        row.columns[key] = value.dump();
                    }
                }
            }
            rows.push_back(std::move(row));
        }
    }
    return rows;
}

int NativePrismaAdapter::parseNonQueryResponse(const nlohmann::json& responseJson) const {
    if (responseJson.contains("affected") && responseJson["affected"].is_number()) {
        return responseJson["affected"].get<int>();
    }
    return 0;
}

}
}
}
