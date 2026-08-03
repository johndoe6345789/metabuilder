/**
 * @file refresh_token_revoke_test.cpp
 * @brief Regression test for RefreshTokenStore::revoke(), added for
 *        /oidc/logout to revoke a single presented refresh token without
 *        treating it as reuse (which would revoke its whole rotation
 *        family -- rotate()'s existing, correct behavior for an actual
 *        reuse/leak scenario, but wrong for a normal logout).
 */

#include <gtest/gtest.h>
#include "dbal/client.hpp"
#include "oidc/tokens/refresh_token_store.hpp"
#include "../helpers/real_schema_env.hpp"

using dbal::oidc::tokens::RefreshTokenRequest;
using dbal::oidc::tokens::RefreshTokenStore;

namespace {

dbal::Client makeInMemoryClient() {
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = "sqlite://:memory:";
    return dbal::Client(config);
}

RefreshTokenRequest makeRequest() {
    RefreshTokenRequest req;
    req.clientId = "pastebin-web";
    req.userId = "alice";
    req.tenantId = "pastebin";
    req.scope = "openid profile offline_access";
    return req;
}

class RefreshTokenRevoke : public ::testing::Test {
protected:
    dbal_test::RealSchemaEnvGuard schema_env_;
};

} // namespace

TEST_F(RefreshTokenRevoke, RevokingAValidTokenSucceeds) {
    auto client = makeInMemoryClient();
    RefreshTokenStore store(client);

    auto issued = store.issue(makeRequest(), /*ttlSeconds=*/1209600);
    ASSERT_TRUE(issued.isOk());

    auto revoked = store.revoke(issued.value());
    ASSERT_TRUE(revoked.isOk());
    EXPECT_TRUE(revoked.value());
}

TEST_F(RefreshTokenRevoke, RevokedTokenCanNoLongerBeRotated) {
    auto client = makeInMemoryClient();
    RefreshTokenStore store(client);

    auto issued = store.issue(makeRequest(), 1209600);
    ASSERT_TRUE(issued.isOk());
    ASSERT_TRUE(store.revoke(issued.value()).isOk());

    // rotate() treats a revoked token as presented-twice (reuse signal),
    // which is the existing, correct security behavior -- a revoked token
    // must not be usable to mint fresh tokens, whether it was revoked by
    // an explicit logout or by reuse-detection.
    auto rotated = store.rotate(issued.value(), "pastebin-web");
    EXPECT_TRUE(rotated.isError());
}

TEST_F(RefreshTokenRevoke, RevokingAnUnknownTokenIsIdempotentNotAnError) {
    // Logout must not fail just because the token was already gone
    // (already used, already revoked, or simply never existed).
    auto client = makeInMemoryClient();
    RefreshTokenStore store(client);

    auto revoked = store.revoke("this-token-was-never-issued");
    ASSERT_TRUE(revoked.isOk());
    EXPECT_TRUE(revoked.value());
}

TEST_F(RefreshTokenRevoke, RevokingAnAlreadyRevokedTokenIsIdempotent) {
    auto client = makeInMemoryClient();
    RefreshTokenStore store(client);

    auto issued = store.issue(makeRequest(), 1209600);
    ASSERT_TRUE(issued.isOk());
    ASSERT_TRUE(store.revoke(issued.value()).isOk());

    auto secondRevoke = store.revoke(issued.value());
    ASSERT_TRUE(secondRevoke.isOk());
    EXPECT_TRUE(secondRevoke.value());
}

TEST_F(RefreshTokenRevoke, RevokingOneTokenDoesNotRevokeItsWholeFamily) {
    // The key behavioral difference from rotate()'s reuse-detection path:
    // a normal logout revoking one token must not take down every other
    // still-valid token in the same rotation chain.
    auto client = makeInMemoryClient();
    RefreshTokenStore store(client);

    auto first = store.issue(makeRequest(), 1209600);
    ASSERT_TRUE(first.isOk());

    auto rotated = store.rotate(first.value(), "pastebin-web");
    ASSERT_TRUE(rotated.isOk());

    RefreshTokenRequest nextReq = makeRequest();
    nextReq.familyId = rotated.value().familyId;
    nextReq.parentId = rotated.value().tokenId;
    auto second = store.issue(nextReq, 1209600);
    ASSERT_TRUE(second.isOk());

    // Revoke only the second (current) token via the new logout path.
    ASSERT_TRUE(store.revoke(second.value()).isOk());

    // A third token issued in the same family should still be usable --
    // if revoke() had (incorrectly) called revokeFamily(), this would fail.
    RefreshTokenRequest thirdReq = makeRequest();
    thirdReq.familyId = rotated.value().familyId;
    auto third = store.issue(thirdReq, 1209600);
    ASSERT_TRUE(third.isOk());
    auto thirdRotated = store.rotate(third.value(), "pastebin-web");
    EXPECT_TRUE(thirdRotated.isOk());
}
