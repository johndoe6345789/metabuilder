/**
 * @file saml_request_store.hpp
 * @brief Persists the pending SP AuthnRequest (id, SP entity, ACS URL,
 *        RelayState) across the redirect to the shared login page, through
 *        the SamlAuthnRequestState entity via the existing generic
 *        multi-backend adapter — no bespoke storage layer.
 *
 * This is the SAML analog of OIDC's authorization-code bookkeeping: the
 * AuthnRequest's own ID doubles as the lookup key (it's not a secret — it
 * gets echoed back in the final Response's InResponseTo, which the SP
 * itself will see), consumed exactly once when the login form is
 * submitted, so a Response's InResponseTo can only ever correspond to a
 * request this IdP actually received and hasn't already answered.
 */
#pragma once

#include "dbal/core/client.hpp"
#include "dbal/core/errors.hpp"
#include <optional>
#include <string>

namespace dbal::saml::state {

struct PendingSamlRequest {
    std::string requestId;
    std::string spEntityId;
    std::string acsUrl;
    std::optional<std::string> relayState;
};

class SamlRequestStore {
public:
    explicit SamlRequestStore(dbal::Client& client, int ttlSeconds = 300);

    /// Persists a freshly-received AuthnRequest's details.
    Result<bool> store(const PendingSamlRequest& req);

    /**
     * @brief Look up, validate, and consume a pending request by its
     *        requestId. Rejects if not found, already consumed, or expired.
     *
     * NOTE: like AuthCodeStore::redeem, consumption is read-then-update via
     * the generic entity API — see that file's header for the accepted,
     * narrow TOCTOU window this shares.
     */
    Result<PendingSamlRequest> take(const std::string& requestId);

private:
    dbal::Client& client_;
    int ttl_seconds_;
};

} // namespace dbal::saml::state
