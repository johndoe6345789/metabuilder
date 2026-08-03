/**
 * @file oauth_client_config.cpp
 */
#include "oauth_client_config.hpp"

#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>
#include <algorithm>
#include <fstream>
#include <stdexcept>

namespace dbal::oidc::clients {

bool OAuthClient::isValidRedirectUri(const std::string& uri) const {
    return std::find(redirect_uris.begin(), redirect_uris.end(), uri) != redirect_uris.end();
}

bool OAuthClient::isValidPostLogoutRedirectUri(const std::string& uri) const {
    return std::find(post_logout_redirect_uris.begin(), post_logout_redirect_uris.end(), uri)
           != post_logout_redirect_uris.end();
}

bool OAuthClient::isScopeAllowed(const std::string& requestedScope) const {
    // Space-delimited scope strings; every requested token must be a member
    // of this client's configured scope set.
    auto tokenize = [](const std::string& s) {
        std::vector<std::string> out;
        size_t start = 0;
        while (start <= s.size()) {
            size_t sp = s.find(' ', start);
            if (sp == std::string::npos) sp = s.size();
            if (sp > start) out.push_back(s.substr(start, sp - start));
            start = sp + 1;
        }
        return out;
    };
    auto allowed = tokenize(scope);
    auto requested = tokenize(requestedScope);
    for (const auto& r : requested) {
        if (std::find(allowed.begin(), allowed.end(), r) == allowed.end()) {
            return false;
        }
    }
    return true;
}

OAuthClientConfig OAuthClientConfig::load(const std::string& path) {
    std::ifstream f(path);
    if (!f.is_open()) {
        throw std::runtime_error("Cannot open OIDC clients config: " + path);
    }
    nlohmann::json root = nlohmann::json::parse(f); // throws on malformed JSON — fail loudly

    OAuthClientConfig config;
    if (!root.contains("clients") || !root["clients"].is_array()) {
        throw std::runtime_error("OIDC clients config missing 'clients' array: " + path);
    }

    for (const auto& node : root["clients"]) {
        OAuthClient c;
        c.client_id    = node.at("client_id").get<std::string>();
        c.client_name  = node.value("client_name", c.client_id);
        c.token_endpoint_auth_method = node.value("token_endpoint_auth_method", std::string("none"));

        if (c.token_endpoint_auth_method != "none") {
            throw std::runtime_error(
                "Client '" + c.client_id + "': only token_endpoint_auth_method=none "
                "(public clients) is supported in v1");
        }

        if (node.contains("grant_types"))
            for (const auto& g : node["grant_types"]) c.grant_types.push_back(g.get<std::string>());
        if (node.contains("response_types"))
            for (const auto& r : node["response_types"]) c.response_types.push_back(r.get<std::string>());
        if (node.contains("redirect_uris"))
            for (const auto& u : node["redirect_uris"]) c.redirect_uris.push_back(u.get<std::string>());
        if (node.contains("post_logout_redirect_uris"))
            for (const auto& u : node["post_logout_redirect_uris"]) c.post_logout_redirect_uris.push_back(u.get<std::string>());

        c.require_pkce = node.value("require_pkce", true);
        if (!c.require_pkce) {
            throw std::runtime_error(
                "Client '" + c.client_id + "': require_pkce=false is not supported — "
                "PKCE is mandatory for every client in this provider");
        }

        if (node.contains("pkce_methods")) {
            for (const auto& m : node["pkce_methods"]) c.pkce_methods.push_back(m.get<std::string>());
        }
        if (c.pkce_methods.empty() ||
            std::any_of(c.pkce_methods.begin(), c.pkce_methods.end(),
                        [](const std::string& m) { return m != "S256"; })) {
            throw std::runtime_error(
                "Client '" + c.client_id + "': pkce_methods must be exactly [\"S256\"] — "
                "'plain' is never accepted by this provider");
        }

        c.scope = node.value("scope", std::string("openid"));
        c.access_token_ttl_seconds  = node.value("access_token_ttl_seconds", 900LL);
        c.refresh_token_ttl_seconds = node.value("refresh_token_ttl_seconds", 1209600LL);
        c.id_token_ttl_seconds      = node.value("id_token_ttl_seconds", 900LL);

        if (c.redirect_uris.empty()) {
            throw std::runtime_error("Client '" + c.client_id + "': redirect_uris must not be empty");
        }

        config.clients_[c.client_id] = std::move(c);
    }

    spdlog::info("[oidc] Loaded {} OAuth client(s) from {}", config.clients_.size(), path);
    return config;
}

std::optional<OAuthClient> OAuthClientConfig::get(const std::string& clientId) const {
    auto it = clients_.find(clientId);
    if (it == clients_.end()) return std::nullopt;
    return it->second;
}

} // namespace dbal::oidc::clients
