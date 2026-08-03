/**
 * @file client_credential_tenant_test.cpp
 * @brief Regression tests for the tenant-scoping fix: Client::setCredential
 *        now accepts a tenantId, Client::getCredentialTenantId reads it
 *        back (falling back to "system" when absent), and
 *        Client::getUserRoleByUsername looks up a user's role (falling
 *        back to "user" when no matching User row exists).
 */

#include <gtest/gtest.h>
#include "dbal/client.hpp"
#include "../helpers/real_schema_env.hpp"

namespace {

dbal::Client makeInMemoryClient() {
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = "sqlite://:memory:";
    return dbal::Client(config);
}

class ClientCredentialTenant : public ::testing::Test {
protected:
    dbal_test::RealSchemaEnvGuard schema_env_;
};

} // namespace

TEST_F(ClientCredentialTenant, TenantIdRoundTripsThroughSetCredential) {
    auto client = makeInMemoryClient();

    dbal::CreateCredentialInput input;
    input.username = "alice";
    input.passwordHash = "alice1234"; // legacy field name -- plaintext, hashed internally
    input.tenantId = "pastebin";

    auto setResult = client.setCredential(input);
    ASSERT_TRUE(setResult.isOk());

    auto tenantResult = client.getCredentialTenantId("alice");
    ASSERT_TRUE(tenantResult.isOk());
    EXPECT_EQ(tenantResult.value(), "pastebin");
}

TEST_F(ClientCredentialTenant, OmittedTenantIdDefaultsToSystem) {
    auto client = makeInMemoryClient();

    dbal::CreateCredentialInput input;
    input.username = "bob";
    input.passwordHash = "bob123456";
    // tenantId left default-constructed (empty) -- this is the exact bug:
    // the admin endpoint didn't accept/set it at all before this fix.

    auto setResult = client.setCredential(input);
    ASSERT_TRUE(setResult.isOk());

    auto tenantResult = client.getCredentialTenantId("bob");
    ASSERT_TRUE(tenantResult.isOk());
    EXPECT_EQ(tenantResult.value(), "system");
}

TEST_F(ClientCredentialTenant, UnknownUsernameDefaultsToSystem) {
    auto client = makeInMemoryClient();
    auto tenantResult = client.getCredentialTenantId("nobody-registered");
    // Soft-fails to "system" rather than propagating an error -- matches
    // login_route_handler.cpp's fallback, which only has a username after
    // verifyCredential already succeeded, so "unknown user" here would be
    // a logic bug, not a real-world case worth surfacing as an Error.
    ASSERT_TRUE(tenantResult.isOk());
    EXPECT_EQ(tenantResult.value(), "system");
}

TEST_F(ClientCredentialTenant, UpdatingPasswordDoesNotResetTenantId) {
    // setCredential is upsert-by-id; a second call for an existing user is
    // a password reset, not re-provisioning -- it must not silently move
    // the user to a different tenant.
    auto client = makeInMemoryClient();

    dbal::CreateCredentialInput input;
    input.username = "carol";
    input.passwordHash = "carol1234";
    input.tenantId = "pastebin";
    ASSERT_TRUE(client.setCredential(input).isOk());

    dbal::CreateCredentialInput resetInput;
    resetInput.username = "carol";
    resetInput.passwordHash = "new-password-1";
    resetInput.tenantId = ""; // not supplied on a reset call, same as real callers
    ASSERT_TRUE(client.setCredential(resetInput).isOk());

    auto tenantResult = client.getCredentialTenantId("carol");
    ASSERT_TRUE(tenantResult.isOk());
    EXPECT_EQ(tenantResult.value(), "pastebin");

    // The password itself did update.
    auto verify = client.verifyCredential("carol", "new-password-1");
    ASSERT_TRUE(verify.isOk());
    EXPECT_TRUE(verify.value());
}

TEST_F(ClientCredentialTenant, GetUserRoleByUsernameReturnsStoredRole) {
    auto client = makeInMemoryClient();

    dbal::CreateUserInput input;
    input.username = "dave";
    input.email = "dave@example.com";
    input.role = "moderator";
    ASSERT_TRUE(client.createUser(input).isOk());

    auto roleResult = client.getUserRoleByUsername("dave");
    ASSERT_TRUE(roleResult.isOk());
    EXPECT_EQ(roleResult.value(), "moderator");
}

TEST_F(ClientCredentialTenant, GetUserRoleByUsernameDefaultsToUserWhenNoRowExists) {
    // A Credential-only account (no linked User profile row) must still
    // get a usable role claim rather than an empty/error one.
    auto client = makeInMemoryClient();
    auto roleResult = client.getUserRoleByUsername("no-such-user");
    ASSERT_TRUE(roleResult.isOk());
    EXPECT_EQ(roleResult.value(), "user");
}
