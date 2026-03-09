/**
 * Unit tests for Supabase utility classes.
 *
 * Covers:
 *   - SupabaseQueryBuilder — PostgREST filter / pagination / sort / list query assembly
 *   - SupabaseAuthManager  — token management and authentication state
 *   - SupabaseRlsManager   — tenant header building
 *
 * All pure-logic, no network required.
 */

#include <gtest/gtest.h>
#include <nlohmann/json.hpp>
#include <map>

#include "adapters/supabase/supabase_query_builder.hpp"
#include "adapters/supabase/supabase_auth_manager.hpp"
#include "adapters/supabase/supabase_rls_manager.hpp"

using namespace dbal::adapters::supabase;
using Json = nlohmann::json;

// ---------------------------------------------------------------------------
// SupabaseQueryBuilder — buildFilterQuery
// ---------------------------------------------------------------------------

TEST(SupabaseQueryBuilderTest, BuildFilterQuery_SingleString) {
    Json filter;
    filter["status"] = "active";
    auto q = SupabaseQueryBuilder::buildFilterQuery(filter);
    EXPECT_EQ(q, "status=eq.active");
}

TEST(SupabaseQueryBuilderTest, BuildFilterQuery_MultipleKeys) {
    Json filter;
    filter["a"] = "1";
    filter["b"] = "2";
    auto q = SupabaseQueryBuilder::buildFilterQuery(filter);
    EXPECT_NE(q.find("a=eq.1"), std::string::npos);
    EXPECT_NE(q.find("b=eq.2"), std::string::npos);
    EXPECT_NE(q.find("&"), std::string::npos);
}

TEST(SupabaseQueryBuilderTest, BuildFilterQuery_IntegerValue) {
    Json filter;
    filter["age"] = 25;
    auto q = SupabaseQueryBuilder::buildFilterQuery(filter);
    EXPECT_NE(q.find("age=eq.25"), std::string::npos);
}

TEST(SupabaseQueryBuilderTest, BuildFilterQuery_BooleanValue) {
    Json filter;
    filter["enabled"] = true;
    auto q = SupabaseQueryBuilder::buildFilterQuery(filter);
    EXPECT_NE(q.find("enabled=eq.true"), std::string::npos);
}

TEST(SupabaseQueryBuilderTest, BuildFilterQuery_FloatValue) {
    Json filter;
    filter["score"] = 3.14;
    auto q = SupabaseQueryBuilder::buildFilterQuery(filter);
    EXPECT_NE(q.find("score=eq."), std::string::npos);
}

TEST(SupabaseQueryBuilderTest, BuildFilterQuery_Empty_ReturnsEmpty) {
    auto q = SupabaseQueryBuilder::buildFilterQuery(Json::object());
    EXPECT_TRUE(q.empty());
}

// ---------------------------------------------------------------------------
// SupabaseQueryBuilder — buildPaginationQuery
// ---------------------------------------------------------------------------

TEST(SupabaseQueryBuilderTest, BuildPaginationQuery_FirstPage) {
    auto q = SupabaseQueryBuilder::buildPaginationQuery(10, 1);
    EXPECT_EQ(q, "limit=10&offset=0");
}

TEST(SupabaseQueryBuilderTest, BuildPaginationQuery_SecondPage) {
    auto q = SupabaseQueryBuilder::buildPaginationQuery(20, 2);
    EXPECT_EQ(q, "limit=20&offset=20");
}

TEST(SupabaseQueryBuilderTest, BuildPaginationQuery_ThirdPage) {
    auto q = SupabaseQueryBuilder::buildPaginationQuery(5, 3);
    EXPECT_EQ(q, "limit=5&offset=10");
}

// ---------------------------------------------------------------------------
// SupabaseQueryBuilder — buildSortQuery
// ---------------------------------------------------------------------------

TEST(SupabaseQueryBuilderTest, BuildSortQuery_Ascending) {
    std::map<std::string, std::string> sort = {{"name", "asc"}};
    auto q = SupabaseQueryBuilder::buildSortQuery(sort);
    EXPECT_EQ(q, "order=name.asc");
}

TEST(SupabaseQueryBuilderTest, BuildSortQuery_Descending) {
    std::map<std::string, std::string> sort = {{"createdAt", "desc"}};
    auto q = SupabaseQueryBuilder::buildSortQuery(sort);
    EXPECT_EQ(q, "order=createdAt.desc");
}

TEST(SupabaseQueryBuilderTest, BuildSortQuery_DefaultsToAsc) {
    std::map<std::string, std::string> sort = {{"age", "invalid"}};
    auto q = SupabaseQueryBuilder::buildSortQuery(sort);
    EXPECT_NE(q.find("order=age.asc"), std::string::npos);
}

// ---------------------------------------------------------------------------
// SupabaseQueryBuilder — buildListQuery
// ---------------------------------------------------------------------------

TEST(SupabaseQueryBuilderTest, BuildListQuery_NoFilter) {
    dbal::ListOptions opts;
    opts.limit = 10;
    opts.page  = 1;
    auto q = SupabaseQueryBuilder::buildListQuery("users", opts);
    EXPECT_EQ(q.substr(0, 5), "users");
    EXPECT_NE(q.find("limit=10"), std::string::npos);
    EXPECT_EQ(q.find("eq."), std::string::npos);  // no filter
}

TEST(SupabaseQueryBuilderTest, BuildListQuery_WithFilter) {
    dbal::ListOptions opts;
    opts.filter["role"] = "admin";
    opts.limit = 5;
    opts.page  = 1;
    auto q = SupabaseQueryBuilder::buildListQuery("users", opts);
    EXPECT_NE(q.find("role=eq.admin"), std::string::npos);
    EXPECT_NE(q.find("limit=5"), std::string::npos);
}

TEST(SupabaseQueryBuilderTest, BuildListQuery_WithSort) {
    dbal::ListOptions opts;
    opts.sort["name"] = "asc";
    opts.limit = 20;
    auto q = SupabaseQueryBuilder::buildListQuery("products", opts);
    EXPECT_NE(q.find("order=name.asc"), std::string::npos);
}

TEST(SupabaseQueryBuilderTest, BuildListQuery_DefaultLimit20) {
    dbal::ListOptions opts;  // default limit == 20
    auto q = SupabaseQueryBuilder::buildListQuery("things", opts);
    EXPECT_NE(q.find("limit=20"), std::string::npos);
}

// ---------------------------------------------------------------------------
// SupabaseQueryBuilder — buildReadQuery / buildIdFilterQuery
// ---------------------------------------------------------------------------

TEST(SupabaseQueryBuilderTest, BuildReadQuery) {
    auto q = SupabaseQueryBuilder::buildReadQuery("orders", "ord-123");
    EXPECT_EQ(q, "orders?id=eq.ord-123");
}

TEST(SupabaseQueryBuilderTest, BuildIdFilterQuery_SameAsReadQuery) {
    auto read = SupabaseQueryBuilder::buildReadQuery("items",    "x");
    auto id   = SupabaseQueryBuilder::buildIdFilterQuery("items", "x");
    EXPECT_EQ(read, id);
}

// ---------------------------------------------------------------------------
// SupabaseQueryBuilder — escapeValue
// ---------------------------------------------------------------------------

TEST(SupabaseQueryBuilderTest, EscapeValue_Null_DumpsNull) {
    Json nullVal = nullptr;
    // null is escaped via the Json::dump() path
    Json filter;
    filter["x"] = nullVal;
    auto q = SupabaseQueryBuilder::buildFilterQuery(filter);
    EXPECT_NE(q.find("x=eq."), std::string::npos);
}

// ---------------------------------------------------------------------------
// SupabaseAuthManager
// ---------------------------------------------------------------------------

TEST(SupabaseAuthManagerTest, InitialToken_IsApiKey) {
    SupabaseAuthManager mgr("https://project.supabase.co", "my-api-key");
    EXPECT_EQ(mgr.getAuthToken(), "my-api-key");
}

TEST(SupabaseAuthManagerTest, IsAuthenticated_TrueByDefault) {
    SupabaseAuthManager mgr("https://project.supabase.co", "my-api-key");
    EXPECT_TRUE(mgr.isAuthenticated());
}

TEST(SupabaseAuthManagerTest, SetAuthToken_UpdatesToken) {
    SupabaseAuthManager mgr("https://project.supabase.co", "api-key");
    mgr.setAuthToken("user-jwt-token");
    EXPECT_EQ(mgr.getAuthToken(), "user-jwt-token");
    EXPECT_TRUE(mgr.isAuthenticated());
}

TEST(SupabaseAuthManagerTest, SetAuthToken_EmptyToken_SetsNotAuthenticated) {
    SupabaseAuthManager mgr("https://project.supabase.co", "api-key");
    mgr.setAuthToken("");
    EXPECT_FALSE(mgr.isAuthenticated());
}

TEST(SupabaseAuthManagerTest, ClearAuth_RevertsToApiKey) {
    SupabaseAuthManager mgr("https://project.supabase.co", "original-key");
    mgr.setAuthToken("temp-token");
    mgr.clearAuth();
    EXPECT_EQ(mgr.getAuthToken(), "original-key");
    EXPECT_TRUE(mgr.isAuthenticated());
}

// ---------------------------------------------------------------------------
// SupabaseRlsManager
// ---------------------------------------------------------------------------

TEST(SupabaseRlsManagerTest, BuildTenantHeaders_ContainsTenantId) {
    SupabaseRlsManager mgr;
    auto headers = mgr.buildTenantHeaders("tenant-abc");
    ASSERT_TRUE(headers.contains("X-Tenant-Id"));
    EXPECT_EQ(headers["X-Tenant-Id"].get<std::string>(), "tenant-abc");
}

TEST(SupabaseRlsManagerTest, BuildTenantHeaders_EmptyTenantId_NoHeader) {
    // Empty tenant id: implementation omits the header (no RLS context to inject)
    SupabaseRlsManager mgr;
    auto headers = mgr.buildTenantHeaders("");
    EXPECT_FALSE(headers.contains("X-Tenant-Id"));
}
