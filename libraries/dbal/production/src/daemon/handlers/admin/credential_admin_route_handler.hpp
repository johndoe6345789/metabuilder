/**
 * @file credential_admin_route_handler.hpp
 * @brief Narrow, admin-token-gated endpoint for setting a Credential's
 *        password — the one legitimate way an external caller (Flask) can
 *        ever cause a Credential row to be written, since Credential is
 *        `schema.acl.system`-protected and permanently unreachable through
 *        the generic entity CRUD surface (see SchemaAclRegistry, Phase 2).
 *
 * This does NOT reopen that boundary — it's a purpose-built operation with
 * its own validation, exactly like /oidc/token or /oidc/login already are,
 * not a generic passthrough to the Credential entity.
 *
 * Consumers: pastebin's one-shot legacy-account migration script, its
 * password-reset-confirm step (after a user proves control of their
 * account via a reset token), and its registration endpoint for brand-new
 * signups.
 */
#pragma once

#include "dbal/core/client.hpp"
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>

namespace dbal::daemon::handlers::admin {

class CredentialAdminRouteHandler {
public:
    explicit CredentialAdminRouteHandler(dbal::Client& client);

    /// POST /admin/credentials — body {"username": "...", "password": "..."}.
    void handleSetCredential(const drogon::HttpRequestPtr& req,
                              std::function<void(const drogon::HttpResponsePtr&)>&& cb);

private:
    dbal::Client& client_;
};

} // namespace dbal::daemon::handlers::admin
