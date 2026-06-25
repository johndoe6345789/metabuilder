/**
 * @file entity_route_handler.hpp
 * @brief RESTful entity CRUD endpoint handlers
 */

#pragma once

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>
#include <memory>
#include <optional>
#include "dbal/core/client.hpp"
#include "auth/auth_config.hpp"

// Forward-declare to avoid including the full workflow engine in every TU
namespace dbal::workflow { class WfEngine; }

namespace dbal {
namespace daemon {
namespace handlers {

/**
 * @brief Auth context derived from a validated JWT + entity auth config.
 * Passed from server_routes.cpp into handler methods to drive ownership logic.
 */
struct AuthContext {
    std::string user_id;          ///< JWT "sub" claim — the owner's UUID
    std::string tenant_id;        ///< Tenant extracted from the URL path
    dbal::auth::EntityAuthConfig config; ///< Resolved auth rules for this entity
};

/**
 * @class EntityRouteHandler
 * @brief Handles RESTful entity CRUD operations
 *
 * Supports multi-tenant entity routes in the format:
 * /{tenant}/{package}/{entity}[/{id}[/{action}]]
 *
 * Methods:
 * - GET    /{tenant}/{package}/{entity}          -> List entities
 * - POST   /{tenant}/{package}/{entity}          -> Create entity
 * - GET    /{tenant}/{package}/{entity}/{id}     -> Read entity
 * - PUT    /{tenant}/{package}/{entity}/{id}     -> Update entity
 * - PATCH  /{tenant}/{package}/{entity}/{id}     -> Partial update
 * - DELETE /{tenant}/{package}/{entity}/{id}     -> Delete entity
 * - POST   /{tenant}/{package}/{entity}/{id}/{action} -> Custom action
 */
class EntityRouteHandler {
public:
    explicit EntityRouteHandler(dbal::Client& client,
                                dbal::workflow::WfEngine* wf_engine = nullptr);

    /**
     * @brief Handle entity list/create operations
     * GET  -> List entities (filtered by userId if auth.filter_by_owner)
     * POST -> Create entity (userId+tenantId injected if auth.inject_owner)
     */
    void handleEntity(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback,
        const std::string& tenant,
        const std::string& package,
        const std::string& entity,
        std::optional<AuthContext> auth = std::nullopt
    );

    /**
     * @brief Handle entity CRUD operations with ID
     * GET    -> Read entity  (403 if not owner and auth.check_ownership)
     * PUT    -> Update entity (403 if not owner and auth.check_ownership)
     * PATCH  -> Partial update (403 if not owner and auth.check_ownership)
     * DELETE -> Delete entity (403 if not owner and auth.check_ownership)
     */
    void handleEntityWithId(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback,
        const std::string& tenant,
        const std::string& package,
        const std::string& entity,
        const std::string& id,
        std::optional<AuthContext> auth = std::nullopt
    );

    /**
     * @brief Handle custom entity actions
     * POST -> Execute custom action
     */
    void handleEntityAction(
        const drogon::HttpRequestPtr& request,
        std::function<void(const drogon::HttpResponsePtr&)>&& callback,
        const std::string& tenant,
        const std::string& package,
        const std::string& entity,
        const std::string& id,
        const std::string& action
    );

private:
    dbal::Client& client_;
    dbal::workflow::WfEngine* wf_engine_ = nullptr; // non-owning, may be null
};

} // namespace handlers
} // namespace daemon
} // namespace dbal
