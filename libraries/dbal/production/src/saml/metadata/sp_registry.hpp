/**
 * @file sp_registry.hpp
 * @brief Declarative Service Provider registry loaded from sp_registry.json.
 *
 * Deliberately static/file-based, matching the same convention as
 * dbal::oidc::clients::OAuthClientConfig and dbal::auth::AuthConfig — no
 * dynamic SP self-registration, which would mean parsing arbitrary
 * SP-supplied metadata XML as a new untrusted-input surface.
 */
#pragma once

#include <map>
#include <optional>
#include <string>

namespace dbal::saml::metadata {

struct ServiceProvider {
    std::string entity_id;
    std::string name;
    /// The ONLY place a Response is ever sent — never taken from the
    /// AuthnRequest's own AssertionConsumerServiceURL attribute, which
    /// would let an attacker redirect a legitimate assertion elsewhere.
    std::string acs_url;
};

class SpRegistry {
public:
    /// Throws std::runtime_error on missing/malformed file — a broken SP
    /// registry should fail loudly rather than silently disable SAML.
    static SpRegistry load(const std::string& path);

    std::optional<ServiceProvider> get(const std::string& entityId) const;

private:
    std::map<std::string, ServiceProvider> sps_;
};

} // namespace dbal::saml::metadata
