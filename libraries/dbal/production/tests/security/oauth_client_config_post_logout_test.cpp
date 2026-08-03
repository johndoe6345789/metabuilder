/**
 * @file oauth_client_config_post_logout_test.cpp
 * @brief Regression test for OAuthClient::isValidPostLogoutRedirectUri,
 *        added alongside /oidc/logout so it actually enforces the
 *        already-parsed-but-previously-unused post_logout_redirect_uris.
 */

#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>

#include "oidc/clients/oauth_client_config.hpp"

using dbal::oidc::clients::OAuthClientConfig;

namespace {

std::string writeTempClientsJson() {
    auto path = (std::filesystem::temp_directory_path() / "dbal_test_clients_post_logout.json").string();
    std::ofstream f(path);
    f << R"({
      "clients": [
        {
          "client_id": "pastebin-web",
          "client_name": "Pastebin",
          "token_endpoint_auth_method": "none",
          "grant_types": ["authorization_code", "refresh_token"],
          "response_types": ["code"],
          "redirect_uris": ["http://localhost:3000/pastebin/auth/callback"],
          "post_logout_redirect_uris": ["http://localhost:3000/pastebin/"],
          "require_pkce": true,
          "pkce_methods": ["S256"],
          "scope": "openid profile offline_access"
        }
      ]
    })";
    f.close();
    return path;
}

} // namespace

TEST(OAuthClientConfigPostLogout, RegisteredUriIsValid) {
    auto path = writeTempClientsJson();
    auto config = OAuthClientConfig::load(path);
    auto client = config.get("pastebin-web");
    ASSERT_TRUE(client.has_value());
    EXPECT_TRUE(client->isValidPostLogoutRedirectUri("http://localhost:3000/pastebin/"));
    std::filesystem::remove(path);
}

TEST(OAuthClientConfigPostLogout, UnregisteredUriIsRejected) {
    auto path = writeTempClientsJson();
    auto config = OAuthClientConfig::load(path);
    auto client = config.get("pastebin-web");
    ASSERT_TRUE(client.has_value());
    // Not in post_logout_redirect_uris, even though it's a plausible-looking
    // same-app URL -- exact match only, same rule as isValidRedirectUri.
    EXPECT_FALSE(client->isValidPostLogoutRedirectUri("http://localhost:3000/pastebin/other"));
    EXPECT_FALSE(client->isValidPostLogoutRedirectUri("http://evil.example.com/"));
    std::filesystem::remove(path);
}

TEST(OAuthClientConfigPostLogout, EmptyListRejectsEverything) {
    auto path = (std::filesystem::temp_directory_path() / "dbal_test_clients_no_logout_uris.json").string();
    std::ofstream f(path);
    f << R"({
      "clients": [
        {
          "client_id": "codegen-web",
          "client_name": "Codegen",
          "token_endpoint_auth_method": "none",
          "grant_types": ["authorization_code"],
          "response_types": ["code"],
          "redirect_uris": ["http://localhost:3000/codegen/auth/callback"],
          "post_logout_redirect_uris": [],
          "require_pkce": true,
          "pkce_methods": ["S256"],
          "scope": "openid profile"
        }
      ]
    })";
    f.close();

    auto config = OAuthClientConfig::load(path);
    auto client = config.get("codegen-web");
    ASSERT_TRUE(client.has_value());
    EXPECT_FALSE(client->isValidPostLogoutRedirectUri("http://localhost:3000/codegen/"));
    std::filesystem::remove(path);
}
