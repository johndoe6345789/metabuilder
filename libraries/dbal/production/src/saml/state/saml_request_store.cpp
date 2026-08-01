/**
 * @file saml_request_store.cpp
 */
#include "saml_request_store.hpp"

#include <chrono>
#include <spdlog/spdlog.h>

namespace dbal::saml::state {

namespace {
long long nowUnix() {
    return std::chrono::duration_cast<std::chrono::seconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();
}
} // namespace

SamlRequestStore::SamlRequestStore(dbal::Client& client, int ttlSeconds)
    : client_(client), ttl_seconds_(ttlSeconds) {}

Result<bool> SamlRequestStore::store(const PendingSamlRequest& req) {
    nlohmann::json data;
    data["requestId"] = req.requestId;
    data["spEntityId"] = req.spEntityId;
    data["acsUrl"] = req.acsUrl;
    data["relayState"] = req.relayState ? nlohmann::json(*req.relayState) : nlohmann::json(nullptr);
    data["consumedAt"] = nullptr;
    data["expiresAt"] = nowUnix() + ttl_seconds_;
    data["createdAt"] = nowUnix();

    auto result = client_.createEntity("SamlAuthnRequestState", data);
    if (result.isError()) {
        return result.error();
    }
    return true;
}

Result<PendingSamlRequest> SamlRequestStore::take(const std::string& requestId) {
    dbal::ListOptions opts;
    opts.filter["requestId"] = requestId;
    opts.limit = 1;

    auto listResult = client_.listEntities("SamlAuthnRequestState", opts);
    if (listResult.isError()) {
        return listResult.error();
    }
    const auto& items = listResult.value().items;
    if (items.empty()) {
        return Error::notFound("AuthnRequest state not found — start over at /saml/sso");
    }

    const auto& row = items.front();
    std::string id = row.value("id", std::string());
    long long expiresAt = row.value("expiresAt", 0LL);
    bool consumed = row.contains("consumedAt") && !row["consumedAt"].is_null();

    if (consumed) {
        spdlog::warn("[saml] AuthnRequest state replay for requestId {} — rejecting", requestId);
        return Error::validationError("AuthnRequest state already used");
    }
    if (expiresAt <= nowUnix()) {
        return Error::validationError("AuthnRequest state expired — start over at /saml/sso");
    }

    // Mark consumed. See header docs for the known, narrow TOCTOU window here.
    nlohmann::json update;
    update["consumedAt"] = nowUnix();
    auto updateResult = client_.updateEntity("SamlAuthnRequestState", id, update);
    if (updateResult.isError()) {
        return updateResult.error();
    }

    PendingSamlRequest pending;
    pending.requestId = requestId;
    pending.spEntityId = row.value("spEntityId", std::string());
    pending.acsUrl = row.value("acsUrl", std::string());
    if (row.contains("relayState") && row["relayState"].is_string()) {
        pending.relayState = row["relayState"].get<std::string>();
    }
    return pending;
}

} // namespace dbal::saml::state
