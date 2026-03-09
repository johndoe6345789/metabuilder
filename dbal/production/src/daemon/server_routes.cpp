/**
 * @file server_routes.cpp
 * @brief Route registration using clean architecture handlers
 */

#include "server.hpp"
#include "handlers/health_route_handler.hpp"
#include "handlers/entity_route_handler.hpp"
#include "handlers/query_route_handler.hpp"
#include "security/jwt/jwt_validator.hpp"
#include "auth/auth_config.hpp"
#include "handlers/blob_route_handler.hpp"
#include "handlers/rpc_route_handler.hpp"
#include "handlers/schema_route_handler.hpp"
#include "handlers/admin_route_handler.hpp"
#include "handlers/seed_route_handler.hpp"
#include "actions/seed_loader_action.hpp"
#include "handlers/batch_route_handler.hpp"
#include "handlers/entity_route_handler_helpers.hpp"
#include "bulk_handler.hpp"
#include "rpc_restful_handler.hpp"

// Blob storage backends
#include "../blob/memory_storage.hpp"
#include "../blob/filesystem_storage.hpp"
#include "../blob/s3_storage.hpp"

#include <chrono>
#include <cstdlib>
#include <drogon/drogon.h>
#include <filesystem>
#include <mutex>
#include <spdlog/spdlog.h>
#include <sstream>
#include <unordered_map>

namespace {
    int env_int(const char* name, int default_val) {
        const char* v = std::getenv(name);
        if (v && *v) {
            try { return std::stoi(v); } catch (...) {}
        }
        return default_val;
    }

    // Prefer X-Forwarded-For so each real client gets its own bucket
    // when the daemon sits behind a reverse proxy (nginx, etc.)
    std::string rate_limit_key(const drogon::HttpRequestPtr& req) {
        auto xff = req->getHeader("X-Forwarded-For");
        if (!xff.empty()) {
            // Take only the first (original client) IP
            auto comma = xff.find(',');
            return comma == std::string::npos ? xff : xff.substr(0, comma);
        }
        return req->getPeerAddr().toIp();
    }

    struct RateLimitEntry {
        int count = 0;
        std::chrono::steady_clock::time_point window_start = std::chrono::steady_clock::now();
    };

    class SimpleRateLimiter {
    public:
        SimpleRateLimiter(int max_requests, int window_seconds)
            : max_requests_(max_requests), window_seconds_(window_seconds) {}

        bool allow(const std::string& key) {
            std::lock_guard<std::mutex> lock(mutex_);
            auto now = std::chrono::steady_clock::now();
            auto& entry = entries_[key];
            auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now - entry.window_start).count();
            if (elapsed >= window_seconds_) {
                entry.count = 0;
                entry.window_start = now;
            }
            if (entry.count >= max_requests_) {
                return false;
            }
            entry.count++;
            return true;
        }
    private:
        int max_requests_;
        int window_seconds_;
        std::mutex mutex_;
        std::unordered_map<std::string, RateLimitEntry> entries_;
    };

    // Configurable via env: DBAL_ADMIN_RATE_LIMIT, DBAL_MUTATION_RATE_LIMIT, DBAL_READ_RATE_LIMIT
    static SimpleRateLimiter admin_limiter(env_int("DBAL_ADMIN_RATE_LIMIT", 10), 60);
    static SimpleRateLimiter mutation_limiter(env_int("DBAL_MUTATION_RATE_LIMIT", 50), 60);
    static SimpleRateLimiter read_limiter(env_int("DBAL_READ_RATE_LIMIT", 1000), 60);
}

namespace dbal {
namespace daemon {

using DrogonCallback = std::function<void(const drogon::HttpResponsePtr&)>;

void Server::registerRoutes() {
    if (routes_registered_.exchange(true)) {
        return;
    }

    // Initialize JWT validator + YAML auth config
    {
        const char* secret = std::getenv("JWT_SECRET_KEY");
        jwt_secret_ = secret ? secret : "";
        if (!jwt_secret_.empty()) {
            spdlog::info("[auth] JWT_SECRET_KEY is set — entity auth enforcement enabled");
        } else {
            spdlog::warn("[auth] JWT_SECRET_KEY not set — entity routes will 503 if require_auth=true");
        }

        const char* auth_cfg_path = std::getenv("DBAL_AUTH_CONFIG");
        if (auth_cfg_path && std::filesystem::exists(auth_cfg_path)) {
            auth_config_ = dbal::auth::AuthConfig::load(auth_cfg_path);
        } else {
            auth_config_ = dbal::auth::AuthConfig::loadDefault();
        }
    }

    // Initialize workflow engine from DBAL_EVENT_CONFIG
    {
        const char* event_cfg_path = std::getenv("DBAL_EVENT_CONFIG");
        if (event_cfg_path && std::filesystem::exists(event_cfg_path)) {
            dbal::ClientConfig wf_client_cfg;
            {
                std::lock_guard<std::mutex> cfg_lock(config_mutex_);
                wf_client_cfg.adapter      = config_adapter_;
                wf_client_cfg.database_url = config_database_url_;
                wf_client_cfg.mode         = config_mode_;
                wf_client_cfg.endpoint     = config_endpoint_;
            }
            wf_client_cfg.sandbox_enabled = config_sandbox_enabled_.load();
            wf_engine_.emplace(wf_client_cfg);
            wf_engine_->loadConfig(event_cfg_path);
        } else {
            spdlog::debug("[workflow] DBAL_EVENT_CONFIG not set — workflow engine disabled");
        }
    }

    // Auto-seed on startup if DBAL_SEED_ON_STARTUP=true
    {
        const char* seed_on_startup = std::getenv("DBAL_SEED_ON_STARTUP");
        if (seed_on_startup && std::string(seed_on_startup) == "true") {
            if (ensureClient()) {
                std::string seed_dir = actions::SeedLoaderAction::getDefaultSeedDir();
                spdlog::info("[seed] auto-seeding from {}", seed_dir);
                auto summary = actions::SeedLoaderAction::loadSeeds(*dbal_client_, seed_dir);
                spdlog::info("[seed] complete — inserted={}, skipped={}, failed={}",
                             summary.total_inserted, summary.total_skipped, summary.total_failed);
            } else {
                spdlog::warn("[seed] skipping auto-seed — could not acquire DB client");
            }
        }
    }

    // Initialize handlers
    auto health_handler = std::make_shared<handlers::HealthRouteHandler>(address());

    // Get schema paths from environment or use defaults
    const char* env_registry = std::getenv("DBAL_SCHEMA_REGISTRY_PATH");
    const char* env_packages = std::getenv("DBAL_PACKAGES_PATH");
    const char* env_output = std::getenv("DBAL_PRISMA_OUTPUT_PATH");

    const std::string registry_path = env_registry ? env_registry : "/app/prisma/schema-registry.json";
    const std::string packages_path = env_packages ? env_packages : "/app/packages";
    const std::string output_path = env_output ? env_output : "/app/prisma/generated-from-packages.prisma";

    auto schema_handler = std::make_shared<handlers::SchemaRouteHandler>(
        registry_path, packages_path, output_path
    );

    // Register health routes
    drogon::app().registerHandler(
        "/health",
        [health_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback) {
            health_handler->handleHealth(req, std::move(callback));
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Options}
    );

    drogon::app().registerHandler(
        "/healthz",
        [health_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback) {
            health_handler->handleHealth(req, std::move(callback));
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Options}
    );

    drogon::app().registerHandler(
        "/version",
        [health_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback) {
            health_handler->handleVersion(req, std::move(callback));
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Options}
    );

    drogon::app().registerHandler(
        "/api/version",
        [health_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback) {
            health_handler->handleVersion(req, std::move(callback));
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Options}
    );

    drogon::app().registerHandler(
        "/status",
        [health_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback) {
            health_handler->handleStatus(req, std::move(callback));
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Options}
    );

    drogon::app().registerHandler(
        "/api/status",
        [health_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback) {
            health_handler->handleStatus(req, std::move(callback));
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Options}
    );

    // Register schema management route
    drogon::app().registerHandler(
        "/api/dbal/schema",
        [schema_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback) {
            schema_handler->handleSchema(req, std::move(callback));
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Post}
    );

    // Admin route handler — uses callbacks into Server for adapter switching
    auto admin_handler = std::make_shared<handlers::AdminRouteHandler>(
        // getConfig
        [this]() -> std::pair<std::string, std::string> {
            return getActiveConfig();
        },
        // switchAdapter
        [this](const std::string& adapter, const std::string& url) -> bool {
            return switchAdapter(adapter, url);
        },
        // testConnection
        [this](const std::string& adapter, const std::string& url, std::string& error) -> bool {
            return testConnection(adapter, url, error);
        }
    );

    // GET/POST /admin/config — current config / switch database
    // Route is /admin/* (not /api/admin/*) to avoid collision with entity wildcard /{t}/{p}/{e}
    // Nginx strips /api/ prefix, so browser calls /api/admin/config → DBAL gets /admin/config
    drogon::app().registerHandler(
        "/admin/config",
        [admin_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback) {
            auto client_key = rate_limit_key(req);
            if (!admin_limiter.allow(client_key)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            if (req->method() == drogon::HttpMethod::Post) {
                admin_handler->handlePostConfig(req, std::move(callback));
            } else {
                admin_handler->handleGetConfig(req, std::move(callback));
            }
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Post, drogon::HttpMethod::Options}
    );

    // GET /admin/adapters — list all supported backends
    drogon::app().registerHandler(
        "/admin/adapters",
        [admin_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback) {
            auto client_key = rate_limit_key(req);
            if (!admin_limiter.allow(client_key)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            admin_handler->handleGetAdapters(req, std::move(callback));
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Options}
    );

    // POST /admin/test-connection — test without switching
    drogon::app().registerHandler(
        "/admin/test-connection",
        [admin_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback) {
            auto client_key = rate_limit_key(req);
            if (!admin_limiter.allow(client_key)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            admin_handler->handleTestConnection(req, std::move(callback));
        },
        {drogon::HttpMethod::Post, drogon::HttpMethod::Options}
    );

    // POST /admin/seed — load seed data into the database
    // Requires ensureClient() since seed loading uses the DBAL client
    drogon::app().registerHandler(
        "/admin/seed",
        [this](const drogon::HttpRequestPtr& req, DrogonCallback&& callback) {
            auto client_key = rate_limit_key(req);
            if (!admin_limiter.allow(client_key)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            if (!ensureClient()) {
                ::Json::Value body;
                body["success"] = false;
                body["error"] = "DBAL client is unavailable";
                auto response = drogon::HttpResponse::newHttpJsonResponse(body);
                response->setStatusCode(drogon::HttpStatusCode::k503ServiceUnavailable);
                callback(response);
                return;
            }
            auto seed_handler = std::make_shared<handlers::SeedRouteHandler>(*dbal_client_);
            seed_handler->handleSeed(req, std::move(callback));
        },
        {drogon::HttpMethod::Post, drogon::HttpMethod::Options}
    );

    // RPC route requires client - register with ensureClient check
    drogon::app().registerHandler(
        "/api/dbal",
        [this](const drogon::HttpRequestPtr& req, DrogonCallback&& callback) {
            auto client_ip = req->getPeerAddr().toIp();
            if (!mutation_limiter.allow(client_ip)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            if (!ensureClient()) {
                ::Json::Value body;
                body["success"] = false;
                body["message"] = "DBAL client is unavailable";
                auto response = drogon::HttpResponse::newHttpJsonResponse(body);
                response->setStatusCode(drogon::HttpStatusCode::k503ServiceUnavailable);
                callback(response);
                return;
            }
            auto rpc_handler = std::make_shared<handlers::RpcRouteHandler>(*dbal_client_);
            rpc_handler->handleRpc(req, std::move(callback));
        },
        {drogon::HttpMethod::Post}
    );

    // ===== Bulk operations — transactional (single entity) =====
    // Registered BEFORE generic entity routes so /_bulk/* patterns match first

    // POST /{tenant}/{package}/{entity}/_bulk/create
    drogon::app().registerHandler(
        "/{tenant}/{package}/{entity}/_bulk/create",
        [this](const drogon::HttpRequestPtr& req, DrogonCallback&& callback,
               const std::string& tenant, const std::string& package, const std::string& entity) {
            auto client_ip = req->getPeerAddr().toIp();
            if (!mutation_limiter.allow(client_ip)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            if (!ensureClient()) {
                ::Json::Value body;
                body["success"] = false;
                body["error"] = "DBAL client is unavailable";
                auto response = drogon::HttpResponse::newHttpJsonResponse(body);
                response->setStatusCode(drogon::HttpStatusCode::k503ServiceUnavailable);
                callback(response);
                return;
            }

            // Parse body
            std::string bodyStr(req->getBody());
            ::Json::Value body;
            {
                std::istringstream stream(bodyStr);
                ::Json::CharReaderBuilder reader;
                JSONCPP_STRING errs;
                if (!::Json::parseFromStream(reader, stream, &body, &errs) || !errs.empty()) {
                    body = ::Json::Value(::Json::arrayValue);
                }
            }

            // Build RouteInfo
            std::string full_path = "/" + tenant + "/" + package + "/" + entity;
            auto route = rpc::parseRoute(full_path);

            // Create response callbacks
            auto callbacks = handlers::createResponseCallbacks(std::move(callback));

            rpc::BulkHandler::handleBulkCreate(
                *dbal_client_, route, body,
                callbacks.send_success, callbacks.send_error
            );
        },
        {drogon::HttpMethod::Post}
    );

    // POST /{tenant}/{package}/{entity}/_bulk/update
    drogon::app().registerHandler(
        "/{tenant}/{package}/{entity}/_bulk/update",
        [this](const drogon::HttpRequestPtr& req, DrogonCallback&& callback,
               const std::string& tenant, const std::string& package, const std::string& entity) {
            auto client_ip = req->getPeerAddr().toIp();
            if (!mutation_limiter.allow(client_ip)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            if (!ensureClient()) {
                ::Json::Value body;
                body["success"] = false;
                body["error"] = "DBAL client is unavailable";
                auto response = drogon::HttpResponse::newHttpJsonResponse(body);
                response->setStatusCode(drogon::HttpStatusCode::k503ServiceUnavailable);
                callback(response);
                return;
            }

            // Parse body
            std::string bodyStr(req->getBody());
            ::Json::Value body;
            {
                std::istringstream stream(bodyStr);
                ::Json::CharReaderBuilder reader;
                JSONCPP_STRING errs;
                if (!::Json::parseFromStream(reader, stream, &body, &errs) || !errs.empty()) {
                    body = ::Json::Value(::Json::arrayValue);
                }
            }

            // Build RouteInfo
            std::string full_path = "/" + tenant + "/" + package + "/" + entity;
            auto route = rpc::parseRoute(full_path);

            // Create response callbacks
            auto callbacks = handlers::createResponseCallbacks(std::move(callback));

            rpc::BulkHandler::handleBulkUpdate(
                *dbal_client_, route, body,
                callbacks.send_success, callbacks.send_error
            );
        },
        {drogon::HttpMethod::Post}
    );

    // POST /{tenant}/{package}/{entity}/_bulk/delete
    drogon::app().registerHandler(
        "/{tenant}/{package}/{entity}/_bulk/delete",
        [this](const drogon::HttpRequestPtr& req, DrogonCallback&& callback,
               const std::string& tenant, const std::string& package, const std::string& entity) {
            auto client_ip = req->getPeerAddr().toIp();
            if (!mutation_limiter.allow(client_ip)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            if (!ensureClient()) {
                ::Json::Value body;
                body["success"] = false;
                body["error"] = "DBAL client is unavailable";
                auto response = drogon::HttpResponse::newHttpJsonResponse(body);
                response->setStatusCode(drogon::HttpStatusCode::k503ServiceUnavailable);
                callback(response);
                return;
            }

            // Parse body
            std::string bodyStr(req->getBody());
            ::Json::Value body;
            {
                std::istringstream stream(bodyStr);
                ::Json::CharReaderBuilder reader;
                JSONCPP_STRING errs;
                if (!::Json::parseFromStream(reader, stream, &body, &errs) || !errs.empty()) {
                    body = ::Json::Value(::Json::arrayValue);
                }
            }

            // Build RouteInfo
            std::string full_path = "/" + tenant + "/" + package + "/" + entity;
            auto route = rpc::parseRoute(full_path);

            // Create response callbacks
            auto callbacks = handlers::createResponseCallbacks(std::move(callback));

            rpc::BulkHandler::handleBulkDelete(
                *dbal_client_, route, body,
                callbacks.send_success, callbacks.send_error
            );
        },
        {drogon::HttpMethod::Post}
    );

    // ===== Batch operations — multi-entity transactional =====
    // POST /{tenant}/{package}/_batch
    drogon::app().registerHandler(
        "/{tenant}/{package}/_batch",
        [this](const drogon::HttpRequestPtr& req, DrogonCallback&& callback,
               const std::string& tenant, const std::string& package) {
            auto client_ip = req->getPeerAddr().toIp();
            if (!mutation_limiter.allow(client_ip)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            if (!ensureClient()) {
                ::Json::Value body;
                body["success"] = false;
                body["error"] = "DBAL client is unavailable";
                auto response = drogon::HttpResponse::newHttpJsonResponse(body);
                response->setStatusCode(drogon::HttpStatusCode::k503ServiceUnavailable);
                callback(response);
                return;
            }

            auto batch_handler = std::make_shared<handlers::BatchRouteHandler>(*dbal_client_);
            batch_handler->handleBatch(req, std::move(callback), tenant, package);
        },
        {drogon::HttpMethod::Post}
    );

    // ===== Blob storage routes =====
    // Registered BEFORE generic entity routes so /{tenant}/{package}/blob/*
    // patterns match before the /{tenant}/{package}/{entity} wildcard.
    //
    // Blob storage backend selection:
    // - DBAL_BLOB_BACKEND env var: "memory" (default), "filesystem", "s3"
    // - DBAL_BLOB_ROOT env var: root directory for filesystem backend
    //   (default: /tmp/dbal-blobs)

    auto createBlobStorage = []() -> std::shared_ptr<blob::BlobStorage> {
        const char* env_backend = std::getenv("DBAL_BLOB_BACKEND");
        std::string backend = env_backend ? env_backend : "memory";

        if (backend == "filesystem") {
            const char* env_root = std::getenv("DBAL_BLOB_ROOT");
            std::string root = env_root ? env_root : "/tmp/dbal-blobs";
            spdlog::info("Blob storage: filesystem (root={})", root);
            return std::make_shared<blob::FilesystemStorage>(std::filesystem::path(root));
        }

        if (backend == "s3") {
            blob::S3Config s3cfg;
            auto env_or = [](const char* name, const char* fallback) -> std::string {
                const char* v = std::getenv(name);
                return v ? v : fallback;
            };
            s3cfg.endpoint   = env_or("DBAL_BLOB_URL", "http://localhost:9000");
            s3cfg.bucket     = env_or("DBAL_BLOB_BUCKET", "dbal-storage");
            s3cfg.region     = env_or("DBAL_BLOB_REGION", "us-east-1");
            s3cfg.access_key = env_or("DBAL_BLOB_ACCESS_KEY", "");
            s3cfg.secret_key = env_or("DBAL_BLOB_SECRET_KEY", "");
            const char* path_style = std::getenv("DBAL_BLOB_PATH_STYLE");
            s3cfg.use_path_style = !path_style || std::string(path_style) != "false";
            spdlog::info("Blob storage: s3 (endpoint={}, bucket={})", s3cfg.endpoint, s3cfg.bucket);
            return std::make_shared<blob::S3Storage>(std::move(s3cfg));
        }

        // Default to memory storage
        spdlog::info("Blob storage: memory");
        return std::make_shared<blob::MemoryStorage>();
    };

    auto blob_storage = createBlobStorage();
    auto blob_handler = std::make_shared<handlers::BlobRouteHandler>(blob_storage);

    // GET /{tenant}/{package}/blob/_stats — storage statistics
    // Registered first so "_stats" literal matches before {key} wildcard
    drogon::app().registerHandler(
        "/{tenant}/{package}/blob/_stats",
        [blob_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback,
                       const std::string& tenant, const std::string& package) {
            auto client_ip = req->getPeerAddr().toIp();
            if (!read_limiter.allow(client_ip)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            blob_handler->handleBlobStats(req, std::move(callback), tenant, package);
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Options}
    );

    // GET /{tenant}/{package}/blob — list blobs
    drogon::app().registerHandler(
        "/{tenant}/{package}/blob",
        [blob_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback,
                       const std::string& tenant, const std::string& package) {
            auto client_ip = req->getPeerAddr().toIp();
            if (!read_limiter.allow(client_ip)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            blob_handler->handleBlobList(req, std::move(callback), tenant, package);
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Options}
    );

    // GET/POST /{tenant}/{package}/blob/{key}/{action} — presign, copy
    // Registered before the single-key route so /blob/{key}/presign and
    // /blob/{key}/copy match before /blob/{key}
    drogon::app().registerHandler(
        "/{tenant}/{package}/blob/{key}/{action}",
        [blob_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback,
                       const std::string& tenant, const std::string& package,
                       const std::string& key, const std::string& action) {
            auto client_ip = req->getPeerAddr().toIp();
            auto& limiter = (req->method() == drogon::HttpMethod::Get) ? read_limiter : mutation_limiter;
            if (!limiter.allow(client_ip)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            blob_handler->handleBlobAction(req, std::move(callback), tenant, package, key, action);
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Post, drogon::HttpMethod::Options}
    );

    // PUT/GET/DELETE/HEAD /{tenant}/{package}/blob/{key} — single blob CRUD
    drogon::app().registerHandler(
        "/{tenant}/{package}/blob/{key}",
        [blob_handler](const drogon::HttpRequestPtr& req, DrogonCallback&& callback,
                       const std::string& tenant, const std::string& package,
                       const std::string& key) {
            auto client_ip = req->getPeerAddr().toIp();
            auto& limiter = (req->method() == drogon::HttpMethod::Get ||
                             req->method() == drogon::HttpMethod::Head)
                            ? read_limiter : mutation_limiter;
            if (!limiter.allow(client_ip)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                callback(resp);
                return;
            }
            blob_handler->handleBlobWithKey(req, std::move(callback), tenant, package, key);
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Put,
         drogon::HttpMethod::Delete, drogon::HttpMethod::Head,
         drogon::HttpMethod::Options}
    );

    // ===== JSON procedure route — registered BEFORE generic entity wildcard =====
    // GET /{tenant}/{package}/query/{name}?params...
    // Literal "query" segment takes priority over {entity} wildcard in Drogon routing.
    drogon::app().registerHandler(
        "/{tenant}/{package}/query/{name}",
        [this](const drogon::HttpRequestPtr& req, DrogonCallback&& callback,
               const std::string& tenant, const std::string& package, const std::string& name) {
            const char* env_cors = std::getenv("DBAL_CORS_ORIGIN");
            std::string cors_org = env_cors ? env_cors : auth_config_.cors_origin;
            if (req->method() == drogon::HttpMethod::Options) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k204NoContent);
                resp->addHeader("Access-Control-Allow-Origin", cors_org);
                resp->addHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
                resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                callback(resp);
                return;
            }
            auto cb = [orig = std::move(callback), cors_org](const drogon::HttpResponsePtr& resp) {
                resp->addHeader("Access-Control-Allow-Origin", cors_org);
                orig(resp);
            };
            auto client_ip = req->getPeerAddr().toIp();
            if (!read_limiter.allow(client_ip)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                cb(resp); return;
            }
            if (!ensureClient()) {
                ::Json::Value body; body["success"] = false;
                body["error"] = "DBAL client is unavailable";
                auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
                resp->setStatusCode(drogon::HttpStatusCode::k503ServiceUnavailable);
                cb(resp); return;
            }

            // Load procedures from DBAL_SCHEMA_DIR/queries/ (lazy, once per request — cached)
            static std::once_flag query_loaded;
            static std::shared_ptr<handlers::QueryRouteHandler> query_handler_s;
            std::call_once(query_loaded, [this]() {
                query_handler_s = std::make_shared<handlers::QueryRouteHandler>(*dbal_client_);
                // DBAL_SCHEMA_DIR points to entities/ — queries/ is a sibling directory.
                // Check explicit DBAL_QUERIES_DIR override first, then derive from parent.
                const char* schema_dir  = std::getenv("DBAL_SCHEMA_DIR");
                const char* queries_env = std::getenv("DBAL_QUERIES_DIR");
                std::string queries_dir;
                if (queries_env) {
                    queries_dir = queries_env;
                } else if (schema_dir) {
                    queries_dir = (std::filesystem::path(schema_dir).parent_path() / "queries").string();
                } else {
                    queries_dir = "dbal/shared/api/schema/queries";
                }
                query_handler_s->loadProcedures(queries_dir);
            });

            query_handler_s->handle(req, std::move(cb), tenant, package, name);
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Options}
    );

    // RESTful entity routes require client
    drogon::app().registerHandler(
        "/{tenant}/{package}/{entity}",
        [this](const drogon::HttpRequestPtr& req, DrogonCallback&& callback,
               const std::string& tenant, const std::string& package, const std::string& entity) {
            // CORS preflight
            const char* env_cors = std::getenv("DBAL_CORS_ORIGIN");
            std::string cors_org = env_cors ? env_cors : auth_config_.cors_origin;
            if (req->method() == drogon::HttpMethod::Options) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k204NoContent);
                resp->addHeader("Access-Control-Allow-Origin", cors_org);
                resp->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
                resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                resp->addHeader("Access-Control-Max-Age", "3600");
                callback(resp);
                return;
            }
            // Wrap callback to attach CORS headers to every response
            auto cb = [orig = std::move(callback), cors_org](const drogon::HttpResponsePtr& resp) {
                resp->addHeader("Access-Control-Allow-Origin", cors_org);
                resp->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
                resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                orig(resp);
            };
            // Rate limiting
            auto client_key = rate_limit_key(req);
            auto& limiter = (req->method() == drogon::HttpMethod::Get) ? read_limiter : mutation_limiter;
            if (!limiter.allow(client_key)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                cb(resp);
                return;
            }
            if (!ensureClient()) {
                ::Json::Value body;
                body["success"] = false;
                body["error"] = "DBAL client is unavailable";
                auto response = drogon::HttpResponse::newHttpJsonResponse(body);
                response->setStatusCode(drogon::HttpStatusCode::k503ServiceUnavailable);
                cb(response);
                return;
            }
            // JWT auth + ownership context
            std::optional<handlers::AuthContext> auth_ctx;
            auto entity_cfg = auth_config_.getEntityConfig(tenant, entity);
            if (entity_cfg.require_auth) {
                bool is_admin = false;
                const char* admin_tok = std::getenv("DBAL_ADMIN_TOKEN");
                if (admin_tok && std::strlen(admin_tok) > 0) {
                    auto auth_hdr = req->getHeader("Authorization");
                    if (auth_hdr == std::string("Bearer ") + admin_tok) is_admin = true;
                }
                if (!is_admin) {
                    if (jwt_secret_.empty()) {
                        ::Json::Value body; body["success"] = false;
                        body["error"] = "Auth not configured (JWT_SECRET_KEY not set)";
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
                        resp->setStatusCode(drogon::k503ServiceUnavailable);
                        cb(resp); return;
                    }
                    auto claims = dbal::security::JwtValidator::fromRequest(req, jwt_secret_);
                    if (!claims) {
                        ::Json::Value body; body["success"] = false;
                        body["error"] = "Unauthorized";
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
                        resp->setStatusCode(drogon::k401Unauthorized);
                        cb(resp); return;
                    }
                    handlers::AuthContext ctx;
                    ctx.user_id   = claims->user_id;
                    ctx.tenant_id = tenant;
                    ctx.config    = entity_cfg;
                    auth_ctx = std::move(ctx);
                }
            }
            auto entity_handler = std::make_shared<handlers::EntityRouteHandler>(
                *dbal_client_, wf_engine_.has_value() ? &*wf_engine_ : nullptr);
            entity_handler->handleEntity(req, std::move(cb), tenant, package, entity, auth_ctx);
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Post, drogon::HttpMethod::Options}
    );

    drogon::app().registerHandler(
        "/{tenant}/{package}/{entity}/{id}",
        [this](const drogon::HttpRequestPtr& req, DrogonCallback&& callback,
               const std::string& tenant, const std::string& package,
               const std::string& entity, const std::string& id) {
            // CORS preflight
            const char* env_cors = std::getenv("DBAL_CORS_ORIGIN");
            std::string cors_org = env_cors ? env_cors : auth_config_.cors_origin;
            if (req->method() == drogon::HttpMethod::Options) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k204NoContent);
                resp->addHeader("Access-Control-Allow-Origin", cors_org);
                resp->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
                resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                resp->addHeader("Access-Control-Max-Age", "3600");
                callback(resp);
                return;
            }
            auto cb = [orig = std::move(callback), cors_org](const drogon::HttpResponsePtr& resp) {
                resp->addHeader("Access-Control-Allow-Origin", cors_org);
                resp->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
                resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                orig(resp);
            };
            auto client_ip = req->getPeerAddr().toIp();
            auto& limiter = (req->method() == drogon::HttpMethod::Get) ? read_limiter : mutation_limiter;
            if (!limiter.allow(client_ip)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                cb(resp); return;
            }
            if (!ensureClient()) {
                ::Json::Value body; body["success"] = false;
                body["error"] = "DBAL client is unavailable";
                auto response = drogon::HttpResponse::newHttpJsonResponse(body);
                response->setStatusCode(drogon::HttpStatusCode::k503ServiceUnavailable);
                cb(response); return;
            }
            std::optional<handlers::AuthContext> auth_ctx;
            auto entity_cfg = auth_config_.getEntityConfig(tenant, entity);
            if (entity_cfg.require_auth) {
                bool is_admin = false;
                const char* admin_tok = std::getenv("DBAL_ADMIN_TOKEN");
                if (admin_tok && std::strlen(admin_tok) > 0) {
                    auto auth_hdr = req->getHeader("Authorization");
                    if (auth_hdr == std::string("Bearer ") + admin_tok) is_admin = true;
                }
                if (!is_admin) {
                    if (jwt_secret_.empty()) {
                        ::Json::Value body; body["success"] = false;
                        body["error"] = "Auth not configured (JWT_SECRET_KEY not set)";
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
                        resp->setStatusCode(drogon::k503ServiceUnavailable);
                        cb(resp); return;
                    }
                    auto claims = dbal::security::JwtValidator::fromRequest(req, jwt_secret_);
                    if (!claims) {
                        ::Json::Value body; body["success"] = false;
                        body["error"] = "Unauthorized";
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
                        resp->setStatusCode(drogon::k401Unauthorized);
                        cb(resp); return;
                    }
                    handlers::AuthContext ctx;
                    ctx.user_id   = claims->user_id;
                    ctx.tenant_id = tenant;
                    ctx.config    = entity_cfg;
                    auth_ctx = std::move(ctx);
                }
            }
            auto entity_handler = std::make_shared<handlers::EntityRouteHandler>(
                *dbal_client_, wf_engine_.has_value() ? &*wf_engine_ : nullptr);
            entity_handler->handleEntityWithId(req, std::move(cb), tenant, package, entity, id, auth_ctx);
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Post,
         drogon::HttpMethod::Put, drogon::HttpMethod::Patch,
         drogon::HttpMethod::Delete, drogon::HttpMethod::Options}
    );

    drogon::app().registerHandler(
        "/{tenant}/{package}/{entity}/{id}/{action}",
        [this](const drogon::HttpRequestPtr& req, DrogonCallback&& callback,
               const std::string& tenant, const std::string& package,
               const std::string& entity, const std::string& id, const std::string& action) {
            // CORS preflight
            const char* env_cors = std::getenv("DBAL_CORS_ORIGIN");
            std::string cors_org = env_cors ? env_cors : auth_config_.cors_origin;
            if (req->method() == drogon::HttpMethod::Options) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k204NoContent);
                resp->addHeader("Access-Control-Allow-Origin", cors_org);
                resp->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
                resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                resp->addHeader("Access-Control-Max-Age", "3600");
                callback(resp);
                return;
            }
            auto cb = [orig = std::move(callback), cors_org](const drogon::HttpResponsePtr& resp) {
                resp->addHeader("Access-Control-Allow-Origin", cors_org);
                resp->addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
                resp->addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                orig(resp);
            };
            auto client_ip = req->getPeerAddr().toIp();
            auto& limiter = (req->method() == drogon::HttpMethod::Get) ? read_limiter : mutation_limiter;
            if (!limiter.allow(client_ip)) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k429TooManyRequests);
                cb(resp); return;
            }
            if (!ensureClient()) {
                ::Json::Value body; body["success"] = false;
                body["error"] = "DBAL client is unavailable";
                auto response = drogon::HttpResponse::newHttpJsonResponse(body);
                response->setStatusCode(drogon::HttpStatusCode::k503ServiceUnavailable);
                cb(response); return;
            }
            // Actions inherit the entity's require_auth but not ownership semantics
            auto entity_cfg = auth_config_.getEntityConfig(tenant, entity);
            if (entity_cfg.require_auth) {
                bool is_admin = false;
                const char* admin_tok = std::getenv("DBAL_ADMIN_TOKEN");
                if (admin_tok && std::strlen(admin_tok) > 0) {
                    auto auth_hdr = req->getHeader("Authorization");
                    if (auth_hdr == std::string("Bearer ") + admin_tok) is_admin = true;
                }
                if (!is_admin) {
                    if (jwt_secret_.empty()) {
                        ::Json::Value body; body["success"] = false;
                        body["error"] = "Auth not configured (JWT_SECRET_KEY not set)";
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
                        resp->setStatusCode(drogon::k503ServiceUnavailable);
                        cb(resp); return;
                    }
                    auto claims = dbal::security::JwtValidator::fromRequest(req, jwt_secret_);
                    if (!claims) {
                        ::Json::Value body; body["success"] = false;
                        body["error"] = "Unauthorized";
                        auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
                        resp->setStatusCode(drogon::k401Unauthorized);
                        cb(resp); return;
                    }
                }
            }
            auto entity_handler = std::make_shared<handlers::EntityRouteHandler>(*dbal_client_);
            entity_handler->handleEntityAction(req, std::move(cb), tenant, package, entity, id, action);
        },
        {drogon::HttpMethod::Get, drogon::HttpMethod::Post, drogon::HttpMethod::Options}
    );

}

} // namespace daemon
} // namespace dbal
