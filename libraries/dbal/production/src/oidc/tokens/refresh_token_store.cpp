/**
 * @file refresh_token_store.cpp
 */
#include "refresh_token_store.hpp"
#include "../../security/tokens/generate_token.hpp"
#include "../../security/crypto/sha256.hpp"

#include <chrono>
#include <spdlog/spdlog.h>

namespace dbal::oidc::tokens {

namespace {
long long nowUnix() {
    return std::chrono::duration_cast<std::chrono::seconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();
}
} // namespace

RefreshTokenStore::RefreshTokenStore(dbal::Client& client) : client_(client) {}

Result<std::string> RefreshTokenStore::issue(const RefreshTokenRequest& req, long long ttlSeconds) {
    std::string rawToken = dbal::security::generate_token();
    std::string tokenHash = dbal::security::sha256_hex(rawToken);
    // A brand-new family gets its own CSPRNG identifier — it isn't a secret
    // itself (never presented back to redeem a token), just needs to be
    // unique per rotation chain, so reusing generate_token() is fine.
    std::string familyId = req.familyId.empty() ? dbal::security::generate_token() : req.familyId;

    nlohmann::json data;
    data["tokenHash"] = tokenHash;
    data["familyId"] = familyId;
    data["clientId"] = req.clientId;
    data["userId"] = req.userId;
    data["tenantId"] = req.tenantId;
    data["scope"] = req.scope;
    data["parentId"] = req.parentId ? nlohmann::json(*req.parentId) : nlohmann::json(nullptr);
    data["revokedAt"] = nullptr;
    data["expiresAt"] = nowUnix() + ttlSeconds;
    data["createdAt"] = nowUnix();

    auto result = client_.createEntity("RefreshToken", data);
    if (result.isError()) {
        return result.error();
    }
    return rawToken;
}

Result<RotatedRefreshToken> RefreshTokenStore::rotate(const std::string& rawToken, const std::string& clientIdHint) {
    std::string tokenHash = dbal::security::sha256_hex(rawToken);

    dbal::ListOptions opts;
    opts.filter["tokenHash"] = tokenHash;
    opts.limit = 1;

    auto listResult = client_.listEntities("RefreshToken", opts);
    if (listResult.isError()) {
        return listResult.error();
    }
    const auto& items = listResult.value().items;
    if (items.empty()) {
        return Error::notFound("invalid_grant: refresh token not found");
    }

    const auto& row = items.front();
    std::string id = row.value("id", std::string());
    std::string familyId = row.value("familyId", std::string());
    std::string storedClientId = row.value("clientId", std::string());
    long long expiresAt = row.value("expiresAt", 0LL);
    bool revoked = row.contains("revokedAt") && !row["revokedAt"].is_null();

    if (storedClientId != clientIdHint) {
        return Error::validationError("invalid_grant: client_id mismatch");
    }

    if (revoked) {
        spdlog::warn("[oidc] Refresh token reuse detected for client {} (family {}) — "
                     "revoking entire token family", storedClientId, familyId);
        revokeFamily(familyId);
        return Error::validationError("invalid_grant: refresh token reuse detected — token family revoked");
    }
    if (expiresAt <= nowUnix()) {
        return Error::validationError("invalid_grant: refresh token expired");
    }

    // Mark consumed (rotation). See header docs for the known, narrow TOCTOU window here.
    nlohmann::json update;
    update["revokedAt"] = nowUnix();
    auto updateResult = client_.updateEntity("RefreshToken", id, update);
    if (updateResult.isError()) {
        return updateResult.error();
    }

    RotatedRefreshToken rotated;
    rotated.tokenId = id;
    rotated.clientId = storedClientId;
    rotated.userId = row.value("userId", std::string());
    rotated.tenantId = row.value("tenantId", std::string());
    rotated.scope = row.value("scope", std::string());
    rotated.familyId = familyId;
    return rotated;
}

Result<bool> RefreshTokenStore::revoke(const std::string& rawToken) {
    std::string tokenHash = dbal::security::sha256_hex(rawToken);

    dbal::ListOptions opts;
    opts.filter["tokenHash"] = tokenHash;
    opts.limit = 1;

    auto listResult = client_.listEntities("RefreshToken", opts);
    if (listResult.isError()) {
        return listResult.error();
    }
    const auto& items = listResult.value().items;
    if (items.empty()) {
        return true; // idempotent: already gone (or never existed)
    }

    const auto& row = items.front();
    bool alreadyRevoked = row.contains("revokedAt") && !row["revokedAt"].is_null();
    if (alreadyRevoked) {
        return true;
    }

    std::string id = row.value("id", std::string());
    nlohmann::json update;
    update["revokedAt"] = nowUnix();
    auto updateResult = client_.updateEntity("RefreshToken", id, update);
    if (updateResult.isError()) {
        return updateResult.error();
    }
    return true;
}

void RefreshTokenStore::revokeFamily(const std::string& familyId) {
    dbal::ListOptions opts;
    opts.filter["familyId"] = familyId;
    // A rotation chain realistically never grows large; a generous cap keeps
    // this a single list call without needing pagination.
    opts.limit = 1000;

    auto listResult = client_.listEntities("RefreshToken", opts);
    if (listResult.isError()) {
        spdlog::error("[oidc] Failed to list token family {} for revocation: {}",
                      familyId, listResult.error().what());
        return;
    }

    long long now = nowUnix();
    for (const auto& row : listResult.value().items) {
        bool alreadyRevoked = row.contains("revokedAt") && !row["revokedAt"].is_null();
        if (alreadyRevoked) continue;
        std::string id = row.value("id", std::string());
        if (id.empty()) continue;
        nlohmann::json update;
        update["revokedAt"] = now;
        auto updateResult = client_.updateEntity("RefreshToken", id, update);
        if (updateResult.isError()) {
            spdlog::error("[oidc] Failed to revoke token {} in family {}: {}",
                          id, familyId, updateResult.error().what());
        }
    }
}

} // namespace dbal::oidc::tokens
