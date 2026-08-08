/**
 * @file encrypted_secret_admin_route_handler.hpp
 * @brief Admin-token-gated endpoints for reversible secret storage -- the
 *        only way an external caller can create or reveal an
 *        EncryptedSecret, since it's `schema.acl.system`-protected and
 *        permanently unreachable through the generic entity CRUD surface
 *        (see credential_admin_route_handler.hpp for the identical
 *        pattern applied to Credential).
 *
 * Plaintext only ever appears in the create request body and the reveal
 * response body -- never in a stored/returned entity, never logged.
 */
#pragma once

#include "dbal/core/client.hpp"
#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>

namespace dbal::daemon::handlers::admin {

class EncryptedSecretAdminRouteHandler {
public:
    explicit EncryptedSecretAdminRouteHandler(dbal::Client& client);

    /// POST /admin/secrets — body {"plaintext": "...", "tenantId": "..."}.
    /// Returns {"success": true, "id": "..."} -- never the plaintext or
    /// the ciphertext.
    void handleCreate(const drogon::HttpRequestPtr& req,
                       std::function<void(const drogon::HttpResponsePtr&)>&& cb);

    /// POST /admin/secrets/{id}/reveal — returns {"success": true,
    /// "plaintext": "..."}. The only path plaintext ever leaves DBAL on.
    void handleReveal(const drogon::HttpRequestPtr& req,
                       std::function<void(const drogon::HttpResponsePtr&)>&& cb,
                       const std::string& id);

private:
    dbal::Client& client_;
};

} // namespace dbal::daemon::handlers::admin
