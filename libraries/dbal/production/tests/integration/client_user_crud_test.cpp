/**
 * @file client_user_crud_test.cpp
 * @brief Regression tests for Client::createUser/getUser/updateUser/
 *        deleteUser/listUsers now going through the real adapter_ instead
 *        of the legacy process-wide InMemoryStore singleton (see
 *        client_user_ops.cpp's header comment). Before this fix, User data
 *        was never actually persisted to the configured database, and
 *        listUsers' filter silently ignored any key other than
 *        "tenantId"/"role" -- both are covered here.
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

class ClientUserCrud : public ::testing::Test {
protected:
    dbal_test::RealSchemaEnvGuard schema_env_;
};

} // namespace

TEST_F(ClientUserCrud, CreateThenGetRoundTrips) {
    auto client = makeInMemoryClient();

    dbal::CreateUserInput input;
    input.username = "alice";
    input.email = "alice@example.com";
    input.role = "admin";
    input.tenantId = "pastebin";

    auto created = client.createUser(input);
    ASSERT_TRUE(created.isOk());
    EXPECT_FALSE(created.value().id.empty());
    EXPECT_EQ(created.value().username, "alice");
    EXPECT_EQ(created.value().role, "admin");

    auto fetched = client.getUser(created.value().id);
    ASSERT_TRUE(fetched.isOk());
    EXPECT_EQ(fetched.value().username, "alice");
    EXPECT_EQ(fetched.value().email, "alice@example.com");
    ASSERT_TRUE(fetched.value().tenantId.has_value());
    EXPECT_EQ(fetched.value().tenantId.value(), "pastebin");
}

TEST_F(ClientUserCrud, CreateWithoutRoleDefaultsToUser) {
    auto client = makeInMemoryClient();

    dbal::CreateUserInput input;
    input.username = "bob";
    input.email = "bob@example.com";
    // role left default-constructed empty, same as rpc_user_actions.cpp's
    // handle_user_create when the caller's payload omits "role".

    auto created = client.createUser(input);
    ASSERT_TRUE(created.isOk());
    EXPECT_EQ(created.value().role, "user");
}

TEST_F(ClientUserCrud, UpdateUserPersistsAcrossGet) {
    auto client = makeInMemoryClient();

    dbal::CreateUserInput input;
    input.username = "carol";
    input.email = "carol@example.com";
    input.role = "user";
    auto created = client.createUser(input);
    ASSERT_TRUE(created.isOk());

    dbal::UpdateUserInput update;
    update.role = "moderator";
    auto updated = client.updateUser(created.value().id, update);
    ASSERT_TRUE(updated.isOk());
    EXPECT_EQ(updated.value().role, "moderator");

    auto fetched = client.getUser(created.value().id);
    ASSERT_TRUE(fetched.isOk());
    EXPECT_EQ(fetched.value().role, "moderator");
    // Untouched field must survive the partial update.
    EXPECT_EQ(fetched.value().username, "carol");
}

TEST_F(ClientUserCrud, DeleteUserRemovesRow) {
    auto client = makeInMemoryClient();

    dbal::CreateUserInput input;
    input.username = "dave";
    input.email = "dave@example.com";
    input.role = "user";
    auto created = client.createUser(input);
    ASSERT_TRUE(created.isOk());

    auto deleted = client.deleteUser(created.value().id);
    ASSERT_TRUE(deleted.isOk());
    EXPECT_TRUE(deleted.value());

    auto fetched = client.getUser(created.value().id);
    EXPECT_TRUE(fetched.isError());
}

TEST_F(ClientUserCrud, ListUsersFiltersByUsernameUnlikeTheOldBrokenFilter) {
    // The old entities::user::list() only recognized "tenantId"/"role"
    // filter keys and silently ignored "username" -- this is the exact
    // scenario that used to leak an arbitrary user's row.
    auto client = makeInMemoryClient();

    dbal::CreateUserInput a;
    a.username = "eve";
    a.email = "eve@example.com";
    a.role = "user";
    ASSERT_TRUE(client.createUser(a).isOk());

    dbal::CreateUserInput b;
    b.username = "frank";
    b.email = "frank@example.com";
    b.role = "admin";
    ASSERT_TRUE(client.createUser(b).isOk());

    dbal::ListOptions options;
    options.filter["username"] = "frank";
    options.limit = 10;
    auto result = client.listUsers(options);
    ASSERT_TRUE(result.isOk());
    ASSERT_EQ(result.value().size(), 1u);
    EXPECT_EQ(result.value().front().username, "frank");
}

TEST_F(ClientUserCrud, GetUserRoleByUsernameNoLongerLeaksAnotherUsersRole) {
    // End-to-end regression for the bug caught by
    // ClientCredentialTenant.GetUserRoleByUsernameDefaultsToUserWhenNoRowExists:
    // a lookup for a username that doesn't exist must not return some other
    // real user's role just because that user happens to be first in the store.
    auto client = makeInMemoryClient();

    dbal::CreateUserInput input;
    input.username = "grace";
    input.email = "grace@example.com";
    input.role = "supergod";
    ASSERT_TRUE(client.createUser(input).isOk());

    auto role = client.getUserRoleByUsername("not-grace");
    ASSERT_TRUE(role.isOk());
    EXPECT_EQ(role.value(), "user");

    auto graceRole = client.getUserRoleByUsername("grace");
    ASSERT_TRUE(graceRole.isOk());
    EXPECT_EQ(graceRole.value(), "supergod");
}
