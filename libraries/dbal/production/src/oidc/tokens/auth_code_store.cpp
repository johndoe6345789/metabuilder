/**
 * @file auth_code_store.cpp
 */
#include "auth_code_store.hpp"
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

AuthCodeStore::AuthCodeStore(dbal::Client& client, int ttlSeconds)
    : client_(client), ttl_seconds_(ttlSeconds) {}

Result<std::string> AuthCodeStore::issue(const AuthorizationCodeRequest& req) {
    std::string rawCode = dbal::security::generate_token();
    std::string codeHash = dbal::security::sha256_hex(rawCode);

    nlohmann::json data;
    data["codeHash"] = codeHash;
    data["clientId"] = req.clientId;
    data["userId"] = req.userId;
    data["tenantId"] = req.tenantId;
    data["redirectUri"] = req.redirectUri;
    data["codeChallenge"] = req.codeChallenge;
    data["codeChallengeMethod"] = req.codeChallengeMethod;
    data["scope"] = req.scope;
    data["nonce"] = req.nonce ? nlohmann::json(*req.nonce) : nlohmann::json(nullptr);
    data["expiresAt"] = nowUnix() + ttl_seconds_;
    data["consumedAt"] = nullptr;
    data["createdAt"] = nowUnix();

    auto result = client_.createEntity("AuthorizationCode", data);
    if (result.isError()) {
        return result.error();
    }
    return rawCode;
}

Result<RedeemedCode> AuthCodeStore::redeem(const std::string& rawCode, const std::string& clientIdHint) {
    std::string codeHash = dbal::security::sha256_hex(rawCode);

    dbal::ListOptions opts;
    opts.filter["codeHash"] = codeHash;
    opts.limit = 1;

    auto listResult = client_.listEntities("AuthorizationCode", opts);
    if (listResult.isError()) {
        return listResult.error();
    }
    const auto& items = listResult.value().items;
    if (items.empty()) {
        return Error::notFound("invalid_grant: authorization code not found");
    }

    const auto& row = items.front();
    std::string id = row.value("id", std::string());
    std::string storedClientId = row.value("clientId", std::string());
    long long expiresAt = row.value("expiresAt", 0LL);
    bool consumed = !row.contains("consumedAt") || !row["consumedAt"].is_null();

    if (storedClientId != clientIdHint) {
        return Error::validationError("invalid_grant: client_id mismatch");
    }
    if (consumed) {
        spdlog::warn("[oidc] Authorization code replay detected for client {} — "
                     "treating as leaked (caller must revoke the resulting token family)",
                     storedClientId);
        return Error::validationError("invalid_grant: authorization code already used");
    }
    if (expiresAt <= nowUnix()) {
        return Error::validationError("invalid_grant: authorization code expired");
    }

    // Mark consumed. See header docs for the known, narrow TOCTOU window here.
    nlohmann::json update;
    update["consumedAt"] = nowUnix();
    auto updateResult = client_.updateEntity("AuthorizationCode", id, update);
    if (updateResult.isError()) {
        return updateResult.error();
    }

    RedeemedCode redeemed;
    redeemed.clientId = storedClientId;
    redeemed.userId = row.value("userId", std::string());
    redeemed.tenantId = row.value("tenantId", std::string());
    redeemed.redirectUri = row.value("redirectUri", std::string());
    redeemed.codeChallenge = row.value("codeChallenge", std::string());
    redeemed.codeChallengeMethod = row.value("codeChallengeMethod", std::string());
    redeemed.scope = row.value("scope", std::string());
    if (row.contains("nonce") && row["nonce"].is_string()) {
        redeemed.nonce = row["nonce"].get<std::string>();
    }
    return redeemed;
}

} // namespace dbal::oidc::tokens
