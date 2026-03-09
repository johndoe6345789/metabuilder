#pragma once

#include <string>
#include <unordered_map>
#include <filesystem>
#include <fstream>
#include <functional>
#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include "dbal/core/client.hpp"

namespace dbal {
namespace daemon {
namespace handlers {

/**
 * QueryRouteHandler — Executes named JSON procedure definitions.
 *
 * Procedures live in DBAL_SCHEMA_DIR/queries/*.json.
 * Endpoint: GET /{tenant}/{package}/query/{name}?param=value
 *
 * Each procedure JSON defines:
 *   - entity:    target entity name
 *   - select:    fields or aggregations
 *   - groupBy:   GROUP BY fields
 *   - orderBy:   ORDER BY fields with direction
 *   - params:    [{name, type, required}] — validated from query string
 *   - where:     [{field, op, param}] — WHERE conditions bound to params
 *   - limit:     optional default limit
 */
class QueryRouteHandler {
public:
    using DrogonCallback = std::function<void(const drogon::HttpResponsePtr&)>;

    explicit QueryRouteHandler(dbal::Client& client);

    /**
     * Load procedure definitions from the queries/ subdirectory.
     * Called once at startup.
     */
    void loadProcedures(const std::string& queries_dir);

    /**
     * Handle GET /{tenant}/{package}/query/{name}?params...
     */
    void handle(
        const drogon::HttpRequestPtr& request,
        DrogonCallback&& callback,
        const std::string& tenant,
        const std::string& package,
        const std::string& name
    );

    size_t procedureCount() const { return procedures_.size(); }

private:
    dbal::Client& client_;
    std::unordered_map<std::string, nlohmann::json> procedures_;  // name → procedure JSON
};

} // namespace handlers
} // namespace daemon
} // namespace dbal
