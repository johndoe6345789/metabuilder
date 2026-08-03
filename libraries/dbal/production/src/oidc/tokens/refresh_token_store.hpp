/**
 * @file refresh_token_store.hpp
 * @brief Issues and rotates opaque OAuth2 refresh tokens, backed by the
 *        RefreshToken entity through the existing generic multi-backend
 *        adapter (dbal::Client) — no bespoke storage layer.
 *
 * Reuse detection: every refresh token carries a familyId shared across its
 * entire rotation chain. Presenting an already-rotated (revoked) token is
 * treated as a leak signal — the whole family is revoked, not just that one
 * token, mirroring Keycloak's session-based revocation model.
 */
#pragma once

#include "dbal/core/client.hpp"
#include "dbal/core/errors.hpp"
#include <optional>
#include <string>

namespace dbal::oidc::tokens {

struct RefreshTokenRequest {
    std::string clientId;
    std::string userId;
    std::string tenantId;
    std::string scope; ///< never exceeds the scope of the original grant, even across rotations
    std::string familyId; ///< empty => start a new family (first issuance from an auth code)
    std::optional<std::string> parentId;
};

/// Fields of a successfully rotated (consumed) refresh token.
struct RotatedRefreshToken {
    std::string tokenId; ///< row id of the just-consumed token — becomes the next token's parentId
    std::string clientId;
    std::string userId;
    std::string tenantId;
    std::string scope;
    std::string familyId;
};

class RefreshTokenStore {
public:
    explicit RefreshTokenStore(dbal::Client& client);

    /// Generates a CSPRNG refresh token, stores only its SHA-256 hash, returns the raw token.
    Result<std::string> issue(const RefreshTokenRequest& req, long long ttlSeconds);

    /**
     * @brief Look up, validate, and consume (rotate) a refresh token.
     *
     * If the token has already been consumed (revokedAt set), this is
     * treated as reuse of a leaked token: every token sharing its familyId
     * is revoked and the caller gets a distinct error so the token endpoint
     * can respond appropriately. Otherwise this token alone is marked
     * revoked (rotation-consumption) and its fields are returned so the
     * caller can issue a fresh access/ID/refresh token in the same family.
     *
     * NOTE: like AuthCodeStore::redeem, consumption is read-then-update via
     * the generic entity API, not a single atomic conditional update — see
     * that file's header for the accepted, narrow TOCTOU window this shares.
     */
    Result<RotatedRefreshToken> rotate(const std::string& rawToken, const std::string& clientIdHint);

    /**
     * @brief Revoke a single refresh token (used by /oidc/logout).
     *
     * Unlike rotate()'s reuse-detection path, this revokes only the
     * presented token, not its whole family -- a normal logout isn't a
     * leak signal. Idempotent: revoking an already-revoked or unknown token
     * is not an error (logout shouldn't fail just because the token was
     * already gone).
     */
    Result<bool> revoke(const std::string& rawToken);

private:
    void revokeFamily(const std::string& familyId);

    dbal::Client& client_;
};

} // namespace dbal::oidc::tokens
