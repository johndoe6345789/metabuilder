/**
 * @file oauth_client_config.hpp
 * @brief Declarative OAuth2/OIDC client registry loaded from clients.json.
 *
 * Deliberately static/file-based, not dynamic client registration (DCR) —
 * matches the same convention as dbal::auth::AuthConfig. Loaded once at
 * startup from DBAL_OIDC_CLIENTS_CONFIG.
 */
#pragma once

#include <map>
#include <optional>
#include <string>
#include <vector>

namespace dbal::oidc::clients {

struct OAuthClient {
    std::string client_id;
    std::string client_name;
    std::string token_endpoint_auth_method; ///< "none" for public clients — the only mode v1 supports
    std::vector<std::string> grant_types;
    std::vector<std::string> response_types;
    std::vector<std::string> redirect_uris;
    std::vector<std::string> post_logout_redirect_uris;
    bool require_pkce = true;
    std::vector<std::string> pkce_methods; ///< must contain only "S256" — enforced at load time
    std::string scope;
    long long access_token_ttl_seconds = 900;
    long long refresh_token_ttl_seconds = 1209600;
    long long id_token_ttl_seconds = 900;

    /// Exact string match against redirect_uris — no prefix/scheme relaxation.
    bool isValidRedirectUri(const std::string& uri) const;

    /// Same exact-match rule as isValidRedirectUri, against
    /// post_logout_redirect_uris. Used by /oidc/logout.
    bool isValidPostLogoutRedirectUri(const std::string& uri) const;

    /// True if every requested scope is present in this client's configured scope.
    bool isScopeAllowed(const std::string& requestedScope) const;
};

/**
 * @brief Read-only registry of declaratively-configured OAuth clients.
 */
class OAuthClientConfig {
public:
    /// Loads clients.json from @p path. Throws on missing/malformed file —
    /// unlike AuthConfig, a broken client registry should fail loudly rather
    /// than silently disable OIDC.
    static OAuthClientConfig load(const std::string& path);

    std::optional<OAuthClient> get(const std::string& clientId) const;

private:
    std::map<std::string, OAuthClient> clients_;
};

} // namespace dbal::oidc::clients
