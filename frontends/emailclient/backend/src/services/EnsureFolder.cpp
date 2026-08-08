#include "EnsureFolder.hpp"
#include "DbalClient.hpp"
#include "../util_env.hpp"

namespace email_backend {

std::optional<std::string> findFolder(const std::string& emailClientId,
                                       const std::string& name) {
    const auto r = dbalRequest(
        "GET", "/" + dbalTenant() +
                   "/email_client/EmailFolder?filter.emailClientId=" +
                   emailClientId + "&filter.name=" + name + "&limit=1");
    if (!r || !r->ok())
        return std::nullopt;
    const auto items =
        r->body.value("data", r->body).value("data", nlohmann::json::array());
    if (items.empty())
        return std::nullopt;
    const std::string id = items.front().value("id", "");
    return id.empty() ? std::nullopt : std::optional(id);
}

std::optional<std::string> ensureFolder(const std::string& emailClientId,
                                         const std::string& name,
                                         const std::string& type) {
    if (auto existing = findFolder(emailClientId, name))
        return existing;

    nlohmann::json body;
    body["tenantId"] = dbalTenant();
    body["emailClientId"] = emailClientId;
    body["name"] = name;
    body["type"] = type;

    const auto r = dbalRequest(
        "POST", "/" + dbalTenant() + "/email_client/EmailFolder", &body);
    if (!r || !r->ok())
        return std::nullopt;
    const std::string id = r->body.value("data", nlohmann::json::object())
                                .value("id", "");
    return id.empty() ? std::nullopt : std::optional(id);
}

} // namespace email_backend
