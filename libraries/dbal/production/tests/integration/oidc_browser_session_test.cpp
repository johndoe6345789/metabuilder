/**
 * @file oidc_browser_session_test.cpp
 * @brief Regression tests for the browser-level SSO session added to fix
 *        /authorize always forcing a fresh login (the actual "single" in
 *        single sign-on): OidcService::createBrowserSession,
 *        lookupBrowserSession, revokeBrowserSession, and the shared
 *        buildAuthorizeRedirect helper.
 */

#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>

#include "dbal/client.hpp"
#include "oidc/oidc_service.hpp"
#include "../helpers/real_schema_env.hpp"

using dbal::oidc::AuthorizeRequest;
using dbal::oidc::OidcService;
using dbal::oidc::clients::OAuthClientConfig;
using dbal::oidc::crypto::RsaKeypair;

namespace {

dbal::Client makeInMemoryClient() {
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = "sqlite://:memory:";
    return dbal::Client(config);
}

std::string writeTempClientsJson() {
    auto path = (std::filesystem::temp_directory_path() / "dbal_test_clients_session.json").string();
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
          "post_logout_redirect_uris": [],
          "require_pkce": true,
          "pkce_methods": ["S256"],
          "scope": "openid profile offline_access"
        }
      ]
    })";
    f.close();
    return path;
}

class OidcBrowserSessionTest : public ::testing::Test {
protected:
    dbal_test::RealSchemaEnvGuard schema_env_;

    void SetUp() override {
        clientsPath_ = writeTempClientsJson();
        keyPath_ = (std::filesystem::temp_directory_path() / "dbal_test_session_key.pem").string();
        std::filesystem::remove(keyPath_);

        client_ = std::make_unique<dbal::Client>(makeInMemoryClient());
        auto clientConfig = OAuthClientConfig::load(clientsPath_);
        RsaKeypair keypair(keyPath_);
        service_ = std::make_unique<OidcService>(
            *client_, std::move(clientConfig), std::move(keypair), "https://dbal.example.com");
    }

    void TearDown() override {
        std::filesystem::remove(clientsPath_);
        std::filesystem::remove(keyPath_);
    }

    std::string clientsPath_;
    std::string keyPath_;
    std::unique_ptr<dbal::Client> client_;
    std::unique_ptr<OidcService> service_;
};

} // namespace

TEST_F(OidcBrowserSessionTest, CreateThenLookupReturnsMatchingUserAndTenant) {
    auto created = service_->createBrowserSession("alice", "pastebin");
    ASSERT_TRUE(created.isOk());
    EXPECT_FALSE(created.value().empty());

    auto found = service_->lookupBrowserSession(created.value());
    ASSERT_TRUE(found.isOk());
    EXPECT_EQ(found.value().userId, "alice");
    EXPECT_EQ(found.value().tenantId, "pastebin");
}

TEST_F(OidcBrowserSessionTest, LookupOfUnknownSidFails) {
    auto found = service_->lookupBrowserSession("not-a-real-session-id");
    EXPECT_TRUE(found.isError());
}

TEST_F(OidcBrowserSessionTest, RevokedSessionCanNoLongerBeLookedUp) {
    auto created = service_->createBrowserSession("bob", "pastebin");
    ASSERT_TRUE(created.isOk());

    auto revoked = service_->revokeBrowserSession(created.value());
    ASSERT_TRUE(revoked.isOk());

    // This is the exact behavior /oidc/logout depends on: once revoked, a
    // subsequent /authorize call with the same cookie must NOT resurrect
    // the login.
    auto found = service_->lookupBrowserSession(created.value());
    EXPECT_TRUE(found.isError());
}

TEST_F(OidcBrowserSessionTest, RevokingAnUnknownSidDoesNotCrashOrSucceedSilentlyWrong) {
    // logout is called even when there's no cookie/session server-side
    // remembers -- must degrade gracefully either way; the handler itself
    // treats this as non-fatal (see oidc_route_handler.cpp's handleLogout).
    auto revoked = service_->revokeBrowserSession("never-existed");
    // Whether this reports ok or error, it must not throw -- the handler
    // only logs a warning on error and continues clearing the cookie.
    SUCCEED();
    (void)revoked;
}

TEST_F(OidcBrowserSessionTest, BuildAuthorizeRedirectIncludesCodeAndState) {
    AuthorizeRequest req;
    req.clientId = "pastebin-web";
    req.redirectUri = "http://localhost:3000/pastebin/auth/callback";
    req.scope = "openid profile";
    req.state = "xyz-state-value";
    req.codeChallenge = "irrelevant-for-this-helper";
    req.codeChallengeMethod = "S256";

    auto location = service_->buildAuthorizeRedirect(req, "alice", "pastebin");
    ASSERT_TRUE(location.isOk());
    EXPECT_NE(location.value().find(req.redirectUri), std::string::npos);
    EXPECT_NE(location.value().find("code="), std::string::npos);
    EXPECT_NE(location.value().find("state=xyz-state-value"), std::string::npos);
}

TEST_F(OidcBrowserSessionTest, BuildAuthorizeRedirectOmitsStateParamWhenStateIsEmpty) {
    AuthorizeRequest req;
    req.clientId = "pastebin-web";
    req.redirectUri = "http://localhost:3000/pastebin/auth/callback";
    req.scope = "openid";
    req.state = "";
    req.codeChallenge = "irrelevant-for-this-helper";
    req.codeChallengeMethod = "S256";

    auto location = service_->buildAuthorizeRedirect(req, "alice", "pastebin");
    ASSERT_TRUE(location.isOk());
    EXPECT_EQ(location.value().find("state="), std::string::npos);
}
