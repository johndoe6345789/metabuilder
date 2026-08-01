/**
 * @file auth_code_store.hpp
 * @brief Issues and redeems single-use OAuth2 authorization codes, backed by
 *        the AuthorizationCode entity through the existing generic
 *        multi-backend adapter (dbal::Client) — no bespoke storage layer.
 */
#pragma once

#include "dbal/core/client.hpp"
#include "dbal/core/errors.hpp"
#include <optional>
#include <string>

namespace dbal::oidc::tokens {

struct AuthorizationCodeRequest {
    std::string clientId;
    std::string userId;
    std::string tenantId;
    std::string redirectUri;
    std::string codeChallenge;
    std::string codeChallengeMethod; ///< always "S256" by the time this is called
    std::string scope;
    std::optional<std::string> nonce;
};

/// Fields of a successfully redeemed code — the caller (token endpoint) still
/// must verify redirectUri and codeChallenge/PKCE against the request itself.
struct RedeemedCode {
    std::string clientId;
    std::string userId;
    std::string tenantId;
    std::string redirectUri;
    std::string codeChallenge;
    std::string codeChallengeMethod;
    std::string scope;
    std::optional<std::string> nonce;
};

class AuthCodeStore {
public:
    explicit AuthCodeStore(dbal::Client& client, int ttlSeconds = 60);

    /// Generates a CSPRNG code, stores only its SHA-256 hash, returns the raw code.
    Result<std::string> issue(const AuthorizationCodeRequest& req);

    /**
     * @brief Look up, validate, and atomically consume a code.
     *
     * NOTE: consumption is read-then-update via the generic entity API, not
     * a single atomic "UPDATE ... WHERE consumedAt IS NULL" — the generic
     * Adapter interface (Postgres/MySQL/SQLite/Mongo/...) doesn't currently
     * expose conditional updates. This leaves a narrow race window between
     * two *simultaneous* redemption attempts of the same code (an attacker
     * would need to already possess a live code and fire concurrent
     * requests). Tightening this needs a new cross-backend conditional-update
     * primitive on Adapter — tracked as a follow-up, not silently ignored.
     */
    Result<RedeemedCode> redeem(const std::string& rawCode, const std::string& clientIdHint);

private:
    dbal::Client& client_;
    int ttl_seconds_;
};

} // namespace dbal::oidc::tokens
