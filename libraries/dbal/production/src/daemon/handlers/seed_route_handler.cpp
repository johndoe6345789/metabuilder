/**
 * @file seed_route_handler.cpp
 * @brief Admin endpoint for loading seed data into the database
 */

#include "seed_route_handler.hpp"
#include "../server_helpers/response.hpp"
#include "../actions/seed_loader_action.hpp"

#include <cstdlib>
#include <cstring>
#include <drogon/drogon.h>
#include <spdlog/spdlog.h>

namespace dbal {
namespace daemon {
namespace handlers {

SeedRouteHandler::SeedRouteHandler(Client& client)
    : client_(client) {}

bool SeedRouteHandler::validateAdminAuth(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>& callback
) const {
    const char* expected_token = std::getenv("DBAL_ADMIN_TOKEN");
    if (!expected_token || std::strlen(expected_token) == 0) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Admin endpoints are disabled (no DBAL_ADMIN_TOKEN configured)";
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(drogon::k403Forbidden);
        callback(resp);
        return false;
    }
    auto auth_header = request->getHeader("Authorization");
    if (auth_header.empty() || auth_header != std::string("Bearer ") + expected_token) {
        ::Json::Value body;
        body["success"] = false;
        body["error"] = "Unauthorized";
        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
        resp->setStatusCode(drogon::k401Unauthorized);
        callback(resp);
        return false;
    }
    return true;
}

void SeedRouteHandler::applyCorsHeaders(
    const drogon::HttpRequestPtr& request,
    const drogon::HttpResponsePtr& response
) const {
    auto origin = request->getHeader("Origin");
    if (!origin.empty()) {
        const char* allowed = std::getenv("DBAL_CORS_ORIGIN");
        std::string allowed_origin = allowed ? allowed : "http://localhost:3000";
        if (origin == allowed_origin) {
            response->addHeader("Access-Control-Allow-Origin", allowed_origin);
        }
    }
}

void SeedRouteHandler::handleSeed(
    const drogon::HttpRequestPtr& request,
    std::function<void(const drogon::HttpResponsePtr&)>&& callback
) {
    // Handle CORS preflight
    if (request->method() == drogon::HttpMethod::Options) {
        auto response = drogon::HttpResponse::newHttpResponse();
        response->setStatusCode(drogon::HttpStatusCode::k204NoContent);
        applyCorsHeaders(request, response);
        response->addHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        callback(response);
        return;
    }

    // Auth check
    if (!validateAdminAuth(request, callback)) {
        return;
    }

    // Parse optional JSON body
    bool force = false;
    std::string seed_dir;

    auto jsonPtr = request->getJsonObject();
    if (jsonPtr) {
        const auto& json = *jsonPtr;
        force = json.get("force", false).asBool();
        seed_dir = json.get("seed_dir", "").asString();
    }

    // Resolve seed directory
    if (seed_dir.empty()) {
        seed_dir = actions::SeedLoaderAction::getDefaultSeedDir();
    }

    spdlog::info("Admin API: seed request (dir={}, force={})", seed_dir, force);

    // Execute seed loading
    auto summary = actions::SeedLoaderAction::loadSeeds(client_, seed_dir, force);

    // Build response
    ::Json::Value body;
    body["success"] = summary.success;

    ::Json::Value data;
    data["total_inserted"] = summary.total_inserted;
    data["total_skipped"] = summary.total_skipped;
    data["total_failed"] = summary.total_failed;
    data["seed_dir"] = seed_dir;
    data["force"] = force;

    ::Json::Value results_arr(::Json::arrayValue);
    for (const auto& r : summary.results) {
        ::Json::Value entry;
        entry["entity"] = r.entity;
        entry["inserted"] = r.inserted;
        entry["skipped"] = r.skipped;
        entry["failed"] = r.failed;

        ::Json::Value errors_arr(::Json::arrayValue);
        for (const auto& e : r.errors) {
            errors_arr.append(e);
        }
        entry["errors"] = errors_arr;
        results_arr.append(entry);
    }
    data["results"] = results_arr;

    // Include top-level errors if any
    if (!summary.errors.empty()) {
        ::Json::Value top_errors(::Json::arrayValue);
        for (const auto& e : summary.errors) {
            top_errors.append(e);
        }
        body["errors"] = top_errors;
    }

    body["data"] = data;

    auto response = drogon::HttpResponse::newHttpJsonResponse(body);
    applyCorsHeaders(request, response);

    if (!summary.success) {
        // For mixed outcomes, return 200 with success=false so the client can inspect
        // per-entity results. This allows tooling to handle "partial success" cases
        // (some rows inserted, some failed) without treating them as transport-level errors.
        //
        // If *no* rows were inserted and there were failures, then the seed operation
        // effectively produced no useful work and is treated as a hard failure. In that
        // case we escalate to HTTP 500 so automation/health checks can reliably detect
        // that the seed run did not succeed at all.
        if (summary.total_inserted == 0 && summary.total_failed > 0) {
            response->setStatusCode(drogon::HttpStatusCode::k500InternalServerError);
        }
    }

    callback(response);
}

} // namespace handlers
} // namespace daemon
} // namespace dbal
