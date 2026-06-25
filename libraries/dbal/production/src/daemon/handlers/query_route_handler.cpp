/**
 * @file query_route_handler.cpp
 * @brief JSON procedure handler — named, parameterized queries driven by JSON definitions.
 *
 * Procedures are loaded from DBAL_SCHEMA_DIR/queries/*.json at startup.
 * All parameter substitution uses bound SQL parameters (never string concatenation).
 */

#include "query_route_handler.hpp"
#include "../json_convert.hpp"
#include "dbal/core/types.hpp"
#include <fstream>
#include <filesystem>
#include <spdlog/spdlog.h>
#include <json/json.h>

namespace dbal {
namespace daemon {
namespace handlers {

QueryRouteHandler::QueryRouteHandler(dbal::Client& client)
    : client_(client) {}

void QueryRouteHandler::loadProcedures(const std::string& queries_dir) {
    if (!std::filesystem::exists(queries_dir)) {
        spdlog::debug("[query] no queries directory: {}", queries_dir);
        return;
    }
    for (const auto& entry : std::filesystem::directory_iterator(queries_dir)) {
        if (!entry.is_regular_file() || entry.path().extension() != ".json") continue;
        try {
            std::ifstream f(entry.path().string());
            if (!f.is_open()) continue;
            nlohmann::json proc = nlohmann::json::parse(f);
            const std::string name = proc.value("name", entry.path().stem().string());
            procedures_[name] = std::move(proc);
            spdlog::info("[query] loaded procedure: {}", name);
        } catch (const std::exception& e) {
            spdlog::warn("[query] failed to load {}: {}", entry.path().string(), e.what());
        }
    }
    spdlog::info("[query] {} procedure(s) loaded from {}", procedures_.size(), queries_dir);
}

static std::string safeSend503(QueryRouteHandler::DrogonCallback& callback, const std::string& msg) {
    ::Json::Value body;
    body["success"] = false;
    body["error"]   = msg;
    auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
    resp->setStatusCode(drogon::HttpStatusCode::k503ServiceUnavailable);
    callback(resp);
    return msg;
}

void QueryRouteHandler::handle(
    const drogon::HttpRequestPtr& request,
    DrogonCallback&& callback,
    const std::string& tenant,
    const std::string& /* package */,
    const std::string& name)
{
    // Find procedure
    auto it = procedures_.find(name);
    if (it == procedures_.end()) {
        ::Json::Value body;
        body["success"] = false;
        body["error"]   = "Unknown query procedure: " + name;
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(drogon::k404NotFound);
        callback(resp);
        return;
    }
    const nlohmann::json& proc = it->second;

    // Collect query string parameters
    auto params_map = request->getParameters();
    std::map<std::string, std::string> qparams;
    for (const auto& [k, v] : params_map) {
        qparams[k] = v;
    }

    // Validate required params
    if (proc.contains("params") && proc["params"].is_array()) {
        for (const auto& p : proc["params"]) {
            const std::string pname    = p.value("name",     std::string(""));
            const bool        required = p.value("required", false);
            if (required && qparams.find(pname) == qparams.end()) {
                ::Json::Value body;
                body["success"] = false;
                body["error"]   = "Missing required parameter: " + pname;
                auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
        }
    }

    // Build ListOptions from procedure definition + bound params
    ListOptions opts;

    // Pagination
    opts.page  = 1;
    opts.limit = proc.value("limit", 100);
    if (qparams.count("limit")) {
        try { opts.limit = std::stoi(qparams["limit"]); } catch (...) {}
    }
    if (qparams.count("page")) {
        try { opts.page = std::stoi(qparams["page"]); } catch (...) {}
    }

    // tenantId isolation — always root AND
    if (!tenant.empty()) {
        opts.filter["tenantId"] = tenant;
    }

    // WHERE conditions from procedure "where" array
    // Each: { "field": "...", "op": "eq", "param": "paramName" } OR "value": "literal"
    if (proc.contains("where") && proc["where"].is_array()) {
        for (const auto& w : proc["where"]) {
            const std::string field   = w.value("field", std::string(""));
            const std::string op_str  = w.value("op",    std::string("eq"));
            if (field.empty()) continue;

            FilterCondition cond;
            cond.field = field;
            // Map op string to enum
            if      (op_str == "ne")       cond.op = FilterOp::Ne;
            else if (op_str == "lt")       cond.op = FilterOp::Lt;
            else if (op_str == "lte")      cond.op = FilterOp::Lte;
            else if (op_str == "gt")       cond.op = FilterOp::Gt;
            else if (op_str == "gte")      cond.op = FilterOp::Gte;
            else if (op_str == "like")     cond.op = FilterOp::Like;
            else if (op_str == "ilike")    cond.op = FilterOp::ILike;
            else if (op_str == "isnull")   cond.op = FilterOp::IsNull;
            else if (op_str == "isnotnull")cond.op = FilterOp::IsNotNull;
            else                           cond.op = FilterOp::Eq;

            if (w.contains("param")) {
                // Bound from query string param
                const std::string param_name = w["param"].get<std::string>();
                auto pit = qparams.find(param_name);
                if (pit != qparams.end()) {
                    cond.value = pit->second;
                    opts.conditions.push_back(cond);
                }
                // If param not provided and not required, skip this condition
            } else if (w.contains("value")) {
                // Literal value from procedure definition (safe — server-defined, not user input)
                cond.value = w["value"].is_string()
                    ? w["value"].get<std::string>()
                    : w["value"].dump();
                opts.conditions.push_back(cond);
            }
        }
    }

    // GROUP BY from procedure "groupBy" array
    if (proc.contains("groupBy") && proc["groupBy"].is_array()) {
        for (const auto& gb : proc["groupBy"]) {
            if (gb.is_string()) opts.group_by.push_back(gb.get<std::string>());
        }
    }

    // Aggregations from procedure "select" — items with "func" key are aggregates
    if (proc.contains("select") && proc["select"].is_array()) {
        for (const auto& sel : proc["select"]) {
            if (sel.is_object() && sel.contains("func")) {
                const std::string func_str  = sel.value("func",  std::string("count"));
                const std::string field_str = sel.value("field", std::string("id"));
                const std::string alias_str = sel.value("alias", func_str);
                AggFunc func = AggFunc::Count;
                if      (func_str == "sum") func = AggFunc::Sum;
                else if (func_str == "avg") func = AggFunc::Avg;
                else if (func_str == "min") func = AggFunc::Min;
                else if (func_str == "max") func = AggFunc::Max;
                opts.aggregates.push_back({func, field_str, alias_str});
            } else if (sel.is_string()) {
                opts.select_fields.push_back(sel.get<std::string>());
            }
        }
    }

    // Sort from procedure "orderBy" array: [{field, dir}]
    if (proc.contains("orderBy") && proc["orderBy"].is_array()) {
        for (const auto& ob : proc["orderBy"]) {
            if (ob.is_object()) {
                const std::string field = ob.value("field", std::string(""));
                const std::string dir   = ob.value("dir",   std::string("asc"));
                if (!field.empty()) opts.sort[field] = dir;
            }
        }
    }

    // Execute
    const std::string entity = proc.value("entity", std::string(""));
    if (entity.empty()) {
        ::Json::Value body;
        body["success"] = false;
        body["error"]   = "Procedure missing 'entity' field";
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(drogon::k500InternalServerError);
        callback(resp);
        return;
    }

    auto result = client_.listEntities(entity, opts);
    if (!result.isOk()) {
        const auto& err = result.error();
        const int http_code = static_cast<int>(err.code());
        spdlog::error("[query] procedure '{}' error: {}", name, err.what());
        ::Json::Value body;
        body["success"] = false;
        body["error"]   = http_code >= 500 ? "Internal server error" : err.what();
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(static_cast<drogon::HttpStatusCode>(http_code));
        callback(resp);
        return;
    }

    const auto& list_result = result.value();
    ::Json::Value data(::Json::objectValue);
    ::Json::Value items(::Json::arrayValue);
    for (const auto& item : list_result.items) {
        items.append(nlohmann_to_jsoncpp(item));
    }
    data["data"]    = items;
    data["total"]   = list_result.total;
    data["success"] = true;
    auto resp = drogon::HttpResponse::newHttpJsonResponse(data);
    callback(resp);
}

} // namespace handlers
} // namespace daemon
} // namespace dbal
