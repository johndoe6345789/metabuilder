#include "EncryptedSecretClient.hpp"
#include "DbalClient.hpp"
#include "../util_env.hpp"

namespace email_backend {

std::optional<std::string> createEncryptedSecret(
    const std::string& plaintext) {
    nlohmann::json body;
    body["plaintext"] = plaintext;
    body["tenantId"] = dbalTenant();

    const auto r = dbalRequest("POST", "/admin/secrets", &body);
    if (!r || !r->ok())
        return std::nullopt;
    const std::string id = r->body.value("id", "");
    return id.empty() ? std::nullopt : std::optional(id);
}

std::optional<std::string> revealEncryptedSecret(const std::string& id) {
    const auto r = dbalRequest("POST", "/admin/secrets/" + id + "/reveal");
    if (!r || !r->ok())
        return std::nullopt;
    return r->body.value("plaintext", "");
}

} // namespace email_backend
