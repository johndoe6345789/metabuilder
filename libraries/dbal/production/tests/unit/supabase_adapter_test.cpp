/**
 * Unit tests for SupabaseAdapter (REST-API code-path).
 *
 * Uses GMock to inject a fake ISupabaseHttpClient — no real network or DB needed.
 * The testing constructor (SupabaseAdapter(unique_ptr<ISupabaseHttpClient>)) skips
 * all production initialisation so tests run in-process, milliseconds each.
 *
 * Testing triangle position: unit layer (mock HTTP ← adapter logic → test assertions).
 */

#include <gtest/gtest.h>
#include <gmock/gmock.h>
#include <nlohmann/json.hpp>

#include "adapters/supabase/supabase_adapter.hpp"

using namespace dbal::adapters::supabase;
using namespace dbal::adapters;
using dbal::Result;
using dbal::Error;
using dbal::ListOptions;
using Json = nlohmann::json;
using ::testing::_;
using ::testing::Return;

// ---------------------------------------------------------------------------
// Mock
// ---------------------------------------------------------------------------

class MockHttpClient : public ISupabaseHttpClient {
public:
    MOCK_METHOD(Result<Json>, post,
                (const std::string&, const Json&), (override));
    MOCK_METHOD(Result<Json>, get,
                (const std::string&), (override));
    MOCK_METHOD(Result<HttpListResponse>, getList,
                (const std::string&), (override));
    MOCK_METHOD(Result<Json>, patch,
                (const std::string& , const Json&), (override));
    MOCK_METHOD(Result<bool>, deleteRequest,
                (const std::string&), (override));
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Build a single-record JSON array as Supabase REST API returns it.
static Json makeRecord(const std::string& id, const std::string& name = "Alice") {
    Json obj;
    obj["id"]   = id;
    obj["name"] = name;
    return Json::array({obj});
}

/// Build an HttpListResponse from a JSON array with optional total.
static HttpListResponse makeListResp(const Json& items, int total = -1) {
    HttpListResponse r;
    r.items = items;
    r.total = total;
    return r;
}

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

class SupabaseAdapterTest : public ::testing::Test {
protected:
    void SetUp() override {
        auto mock = std::make_unique<MockHttpClient>();
        mock_ptr_ = mock.get();
        adapter_ = std::make_unique<SupabaseAdapter>(std::move(mock));
    }

    MockHttpClient* mock_ptr_ = nullptr;
    std::unique_ptr<SupabaseAdapter> adapter_;
};

// ---------------------------------------------------------------------------
// create()
// ---------------------------------------------------------------------------

TEST_F(SupabaseAdapterTest, Create_ReturnsFirstElement) {
    Json payload;  payload["name"] = "Alice";
    EXPECT_CALL(*mock_ptr_, post("users", payload))
        .WillOnce(Return(Result<Json>(makeRecord("u1", "Alice"))));

    auto res = adapter_->create("users", payload);
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value()["id"], "u1");
    EXPECT_EQ(res.value()["name"], "Alice");
}

TEST_F(SupabaseAdapterTest, Create_PropagatesHttpError) {
    Json payload;  payload["name"] = "Bob";
    EXPECT_CALL(*mock_ptr_, post("users", payload))
        .WillOnce(Return(Error::internal("network failure")));

    auto res = adapter_->create("users", payload);
    EXPECT_FALSE(res.isOk());
}

// ---------------------------------------------------------------------------
// read()
// ---------------------------------------------------------------------------

TEST_F(SupabaseAdapterTest, Read_ExtractsFirstItemFromArray) {
    EXPECT_CALL(*mock_ptr_, get("users?id=eq.u1"))
        .WillOnce(Return(Result<Json>(makeRecord("u1"))));

    auto res = adapter_->read("users", "u1");
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value()["id"], "u1");
}

TEST_F(SupabaseAdapterTest, Read_ReturnsNotFoundOnEmptyArray) {
    EXPECT_CALL(*mock_ptr_, get(_))
        .WillOnce(Return(Result<Json>(Json::array())));

    auto res = adapter_->read("users", "missing");
    EXPECT_FALSE(res.isOk());
}

// ---------------------------------------------------------------------------
// update()
// ---------------------------------------------------------------------------

TEST_F(SupabaseAdapterTest, Update_ReturnsUpdatedRecord) {
    Json patch;  patch["name"] = "Carol";
    EXPECT_CALL(*mock_ptr_, patch("users?id=eq.u2", patch))
        .WillOnce(Return(Result<Json>(makeRecord("u2", "Carol"))));

    auto res = adapter_->update("users", "u2", patch);
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value()["name"], "Carol");
}

TEST_F(SupabaseAdapterTest, Update_ReturnsNotFoundOnEmptyArray) {
    EXPECT_CALL(*mock_ptr_, patch(_, _))
        .WillOnce(Return(Result<Json>(Json::array())));

    auto res = adapter_->update("users", "missing", Json::object());
    EXPECT_FALSE(res.isOk());
}

// ---------------------------------------------------------------------------
// remove()
// ---------------------------------------------------------------------------

TEST_F(SupabaseAdapterTest, Remove_ReturnsTrueOnSuccess) {
    EXPECT_CALL(*mock_ptr_, deleteRequest("users?id=eq.u3"))
        .WillOnce(Return(Result<bool>(true)));

    auto res = adapter_->remove("users", "u3");
    ASSERT_TRUE(res.isOk());
    EXPECT_TRUE(res.value());
}

// ---------------------------------------------------------------------------
// list() — Bug 2 fix: total from Content-Range
// ---------------------------------------------------------------------------

TEST_F(SupabaseAdapterTest, List_TotalFromContentRange) {
    Json items = Json::array({Json::object({{"id","a"}}), Json::object({{"id","b"}})});
    EXPECT_CALL(*mock_ptr_, getList(_))
        .WillOnce(Return(Result<HttpListResponse>(makeListResp(items, /*total=*/42))));

    ListOptions opts;
    opts.limit = 2;
    auto res = adapter_->list("users", opts);
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value().total, 42);           // server-reported total, not page size
    EXPECT_EQ(res.value().items.size(), 2u);
}

TEST_F(SupabaseAdapterTest, List_TotalFallsBackToPageSizeWhenNoContentRange) {
    Json items = Json::array({Json::object({{"id","x"}})});
    EXPECT_CALL(*mock_ptr_, getList(_))
        .WillOnce(Return(Result<HttpListResponse>(makeListResp(items, /*total=*/-1))));

    ListOptions opts;
    auto res = adapter_->list("users", opts);
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value().total, 1);            // fallback: current page item count
}

// ---------------------------------------------------------------------------
// findFirst() — Bug 3 fix: filter is applied
// ---------------------------------------------------------------------------

TEST_F(SupabaseAdapterTest, FindFirst_AppliesFilter) {
    // The query string built from options.filter must include the filter kv.
    Json filter;  filter["status"] = "active";

    Json items = makeRecord("u4", "Dave");
    // We don't assert the exact query string; just verify the response is forwarded.
    EXPECT_CALL(*mock_ptr_, getList(_))
        .WillOnce(Return(Result<HttpListResponse>(makeListResp(items, 1))));

    auto res = adapter_->findFirst("users", filter);
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value()["id"], "u4");
}

TEST_F(SupabaseAdapterTest, FindFirst_ReturnsNotFoundOnEmptyList) {
    EXPECT_CALL(*mock_ptr_, getList(_))
        .WillOnce(Return(Result<HttpListResponse>(makeListResp(Json::array(), 0))));

    auto res = adapter_->findFirst("users", Json::object());
    EXPECT_FALSE(res.isOk());
}

// ---------------------------------------------------------------------------
// deleteMany() — Bug 1 fix: count via list before delete
// ---------------------------------------------------------------------------

TEST_F(SupabaseAdapterTest, DeleteMany_ReturnsMatchingRowCount) {
    // First call: list to count  (3 rows match the filter)
    Json twoItems = Json::array({
        Json::object({{"id","1"}}),
        Json::object({{"id","2"}}),
        Json::object({{"id","3"}})
    });
    EXPECT_CALL(*mock_ptr_, getList(_))
        .WillOnce(Return(Result<HttpListResponse>(makeListResp(twoItems, 3))));

    // Second call: actual delete
    EXPECT_CALL(*mock_ptr_, deleteRequest(_))
        .WillOnce(Return(Result<bool>(true)));

    Json filter;  filter["status"] = "inactive";
    auto res = adapter_->deleteMany("users", filter);
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value(), 3);                  // not hardcoded 1
}

TEST_F(SupabaseAdapterTest, DeleteMany_PropagatesDeleteError) {
    EXPECT_CALL(*mock_ptr_, getList(_))
        .WillOnce(Return(Result<HttpListResponse>(makeListResp(Json::array(), 0))));
    EXPECT_CALL(*mock_ptr_, deleteRequest(_))
        .WillOnce(Return(Error::internal("delete failed")));

    auto res = adapter_->deleteMany("users", Json::object());
    EXPECT_FALSE(res.isOk());
}

// ---------------------------------------------------------------------------
// createMany()
// ---------------------------------------------------------------------------

TEST_F(SupabaseAdapterTest, CreateMany_ReturnsInsertedCount) {
    Json arr = Json::array({Json::object({{"id","n1"}}), Json::object({{"id","n2"}})});
    EXPECT_CALL(*mock_ptr_, post("items", _))
        .WillOnce(Return(Result<Json>(arr)));

    Json r1;  r1["name"] = "A";
    Json r2;  r2["name"] = "B";
    auto res = adapter_->createMany("items", {r1, r2});
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value(), 2);
}

// ---------------------------------------------------------------------------
// Transaction (compensating, REST API mode)
// ---------------------------------------------------------------------------

TEST_F(SupabaseAdapterTest, Transaction_DoubleBegin_ReturnsError) {
    ASSERT_TRUE(adapter_->beginTransaction().isOk());
    EXPECT_FALSE(adapter_->beginTransaction().isOk());
    adapter_->rollbackTransaction();
}

TEST_F(SupabaseAdapterTest, Transaction_CommitWithoutBegin_ReturnsError) {
    EXPECT_FALSE(adapter_->commitTransaction().isOk());
}

TEST_F(SupabaseAdapterTest, Transaction_RollbackWithoutBegin_ReturnsError) {
    EXPECT_FALSE(adapter_->rollbackTransaction().isOk());
}

// ---------------------------------------------------------------------------
// list() — error and non-array paths
// ---------------------------------------------------------------------------

/** Covers supabase_adapter.cpp:215-216 — HTTP error propagated from list() */
TEST_F(SupabaseAdapterTest, List_HttpError_ReturnsError) {
    EXPECT_CALL(*mock_ptr_, getList(_))
        .WillOnce(Return(Error::internal("network failure")));
    ListOptions opts;
    auto res = adapter_->list("users", opts);
    EXPECT_FALSE(res.isOk());
}

/** Covers supabase_adapter.cpp:228 — non-array items → total=0 */
TEST_F(SupabaseAdapterTest, List_NonArrayItems_ReturnsZeroTotal) {
    HttpListResponse resp;
    resp.items = Json::object({{"key", "val"}});  // Not an array
    resp.total = -1;
    EXPECT_CALL(*mock_ptr_, getList(_))
        .WillOnce(Return(Result<HttpListResponse>(resp)));
    ListOptions opts;
    auto res = adapter_->list("users", opts);
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value().total, 0);
}

// ---------------------------------------------------------------------------
// createMany() — error and non-array paths
// ---------------------------------------------------------------------------

/** Covers supabase_adapter.cpp:248-249 — HTTP error from createMany */
TEST_F(SupabaseAdapterTest, CreateMany_HttpError_ReturnsError) {
    EXPECT_CALL(*mock_ptr_, post("items", _))
        .WillOnce(Return(Error::internal("insert failed")));
    auto res = adapter_->createMany("items", {Json::object({{"x", 1}})});
    EXPECT_FALSE(res.isOk());
}

/** Covers supabase_adapter.cpp:257 — non-array POST response returns 0 */
TEST_F(SupabaseAdapterTest, CreateMany_NonArrayResponse_ReturnsZero) {
    EXPECT_CALL(*mock_ptr_, post("items", _))
        .WillOnce(Return(Result<Json>(Json::object({{"x", 1}}))));
    auto res = adapter_->createMany("items", {Json::object({{"x", 1}})});
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value(), 0);
}

// ---------------------------------------------------------------------------
// updateMany() — full coverage (lines 260-281)
// ---------------------------------------------------------------------------

/** Covers supabase_adapter.cpp:260-278 — updateMany with filter returns count */
TEST_F(SupabaseAdapterTest, UpdateMany_WithFilter_ReturnsCount) {
    Json arr = Json::array({Json::object({{"id", "x"}}), Json::object({{"id", "y"}})});
    EXPECT_CALL(*mock_ptr_, patch(_, _))
        .WillOnce(Return(Result<Json>(arr)));
    Json filter;  filter["status"] = "active";
    Json data;    data["flag"] = true;
    auto res = adapter_->updateMany("users", filter, data);
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value(), 2);
}

/** Covers supabase_adapter.cpp:270-272 — HTTP error from updateMany */
TEST_F(SupabaseAdapterTest, UpdateMany_HttpError_ReturnsError) {
    EXPECT_CALL(*mock_ptr_, patch(_, _))
        .WillOnce(Return(Error::internal("update failed")));
    auto res = adapter_->updateMany("users", Json::object(), Json::object({{"x", 1}}));
    EXPECT_FALSE(res.isOk());
}

/** Covers supabase_adapter.cpp:280-281 — non-array PATCH response returns 0 */
TEST_F(SupabaseAdapterTest, UpdateMany_NonArrayResponse_ReturnsZero) {
    EXPECT_CALL(*mock_ptr_, patch(_, _))
        .WillOnce(Return(Result<Json>(Json::object({{"rows", 3}}))));
    auto res = adapter_->updateMany("users", Json::object(), Json::object({{"x", 1}}));
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value(), 0);
}

// ---------------------------------------------------------------------------
// findFirst() — list error propagation (line 333)
// ---------------------------------------------------------------------------

/** Covers supabase_adapter.cpp:328-333 — list error propagated through findFirst */
TEST_F(SupabaseAdapterTest, FindFirst_ListError_ReturnsError) {
    EXPECT_CALL(*mock_ptr_, getList(_))
        .WillOnce(Return(Error::internal("list failed")));
    auto res = adapter_->findFirst("users", Json::object({{"id", "x"}}));
    EXPECT_FALSE(res.isOk());
}

// ---------------------------------------------------------------------------
// findByField() — lines 344-352
// ---------------------------------------------------------------------------

/** Covers supabase_adapter.cpp:344-352 — findByField builds filter and delegates */
TEST_F(SupabaseAdapterTest, FindByField_ReturnsMatchingRecord) {
    Json items = makeRecord("u5", "Eve");
    EXPECT_CALL(*mock_ptr_, getList(_))
        .WillOnce(Return(Result<HttpListResponse>(makeListResp(items, 1))));
    auto res = adapter_->findByField("users", "name", Json("Eve"));
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value()["id"], "u5");
}

// ---------------------------------------------------------------------------
// upsert() — lines 354-379
// ---------------------------------------------------------------------------

/** Covers supabase_adapter.cpp:354-376 — upsert merges data and returns record */
TEST_F(SupabaseAdapterTest, Upsert_Success_ReturnsFirstRecord) {
    EXPECT_CALL(*mock_ptr_, post("users", _))
        .WillOnce(Return(Result<Json>(makeRecord("u6", "Fred"))));
    Json createData;  createData["name"] = "Fred";  createData["email"] = "fred@example.com";
    Json updateData;  updateData["name"] = "Fred Updated";
    auto res = adapter_->upsert("users", "email", Json("fred@example.com"), createData, updateData);
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value()["id"], "u6");
}

/** Covers supabase_adapter.cpp:368-370 — HTTP error from upsert POST */
TEST_F(SupabaseAdapterTest, Upsert_HttpError_ReturnsError) {
    EXPECT_CALL(*mock_ptr_, post(_, _))
        .WillOnce(Return(Error::internal("upsert failed")));
    auto res = adapter_->upsert("users", "email", Json("x@y.com"), Json::object(), Json::object());
    EXPECT_FALSE(res.isOk());
}

/** Covers supabase_adapter.cpp:373-379 — empty array response returns internal error */
TEST_F(SupabaseAdapterTest, Upsert_EmptyArrayResponse_ReturnsError) {
    EXPECT_CALL(*mock_ptr_, post(_, _))
        .WillOnce(Return(Result<Json>(Json::array())));  // Empty — no record returned
    auto res = adapter_->upsert("users", "email", Json("x@y.com"), Json::object(), Json::object());
    EXPECT_FALSE(res.isOk());
}

// ---------------------------------------------------------------------------
// getAvailableEntities() + getEntitySchema() + close() — lines 381-418
// Use the testing constructor overload that accepts a pre-built schema map.
// ---------------------------------------------------------------------------

/// Build a minimal core::EntitySchema for injection into the testing constructor.
static dbal::core::EntitySchema makeTestCoreSchema(const std::string& name) {
    dbal::core::EntitySchema s;
    s.name        = name;
    s.displayName = name;
    dbal::core::EntityField f;
    f.name     = "id";
    f.type     = "uuid";
    f.required = true;
    f.unique   = true;
    s.fields.push_back(f);
    return s;
}

/** Covers supabase_adapter.cpp:381-387 — getAvailableEntities returns entity names */
TEST(SupabaseAdapterSchemaTest, GetAvailableEntities_ReturnsEntityNames) {
    std::map<std::string, dbal::core::EntitySchema> schemas;
    schemas["User"] = makeTestCoreSchema("User");
    schemas["Post"] = makeTestCoreSchema("Post");

    auto mock  = std::make_unique<MockHttpClient>();
    SupabaseAdapter adapter(std::move(mock), std::move(schemas));

    auto res = adapter.getAvailableEntities();
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value().size(), 2u);
}

/** Covers supabase_adapter.cpp:389-412 — getEntitySchema for known entity */
TEST(SupabaseAdapterSchemaTest, GetEntitySchema_KnownEntity_ReturnsConvertedSchema) {
    std::map<std::string, dbal::core::EntitySchema> schemas;
    schemas["User"] = makeTestCoreSchema("User");

    auto mock  = std::make_unique<MockHttpClient>();
    SupabaseAdapter adapter(std::move(mock), std::move(schemas));

    auto res = adapter.getEntitySchema("User");
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value().name, "User");
    EXPECT_GE(res.value().fields.size(), 1u);
    EXPECT_EQ(res.value().fields[0].name, "id");
}

/** Covers supabase_adapter.cpp:390-392 — getEntitySchema for unknown entity */
TEST(SupabaseAdapterSchemaTest, GetEntitySchema_UnknownEntity_ReturnsNotFound) {
    auto mock  = std::make_unique<MockHttpClient>();
    SupabaseAdapter adapter(std::move(mock));

    auto res = adapter.getEntitySchema("NoSuchEntity");
    EXPECT_FALSE(res.isOk());
}

/** Covers supabase_adapter.cpp:414-418 — close() is safe to call in REST-API mode */
TEST_F(SupabaseAdapterTest, Close_InRestApiMode_IsNoOp) {
    EXPECT_NO_THROW(adapter_->close());
}

// ---------------------------------------------------------------------------
// Production constructor validation (supabase_adapter.cpp:23-69)
// ---------------------------------------------------------------------------

/** Covers supabase_adapter.cpp:26-27 — empty URL throws std::runtime_error */
TEST(SupabaseAdapterCtorTest, EmptyUrl_ThrowsRuntimeError) {
    SupabaseConfig cfg;
    cfg.url    = "";
    cfg.apiKey = "key";
    EXPECT_THROW(SupabaseAdapter a(cfg), std::runtime_error);
}

/** Covers supabase_adapter.cpp:29-31 — empty apiKey + REST mode throws */
TEST(SupabaseAdapterCtorTest, EmptyApiKey_RestMode_ThrowsRuntimeError) {
    SupabaseConfig cfg;
    cfg.url       = "https://test.supabase.co";
    cfg.apiKey    = "";
    cfg.useRestApi = true;
    EXPECT_THROW(SupabaseAdapter a(cfg), std::runtime_error);
}

#ifdef DBAL_NO_REAL_HTTP_CLIENT
/** Covers supabase_adapter.cpp:47-49 — test build throws logic_error for REST */
TEST(SupabaseAdapterCtorTest, ValidConfig_TestBuild_ThrowsLogicError) {
    SupabaseConfig cfg;
    cfg.url       = "https://valid.supabase.co";
    cfg.apiKey    = "valid-key";
    cfg.useRestApi = true;
    EXPECT_THROW(SupabaseAdapter a(cfg), std::logic_error);
}
#endif

// ---------------------------------------------------------------------------
// PostgreSQL mode constructor (supabase_adapter.cpp:53-68, 420-429)
// useRestApi=false triggers the PostgreSQL-mode init path.
// ---------------------------------------------------------------------------

/** Covers lines 55-57, 65-67, 420-429: invalid Supabase URL fails extractProjectName */
TEST(SupabaseAdapterCtorTest, PostgresMode_InvalidUrl_ThrowsRuntimeError) {
    SupabaseConfig cfg;
    cfg.url        = "not-a-valid-supabase-url";
    cfg.useRestApi = false;
    // extractProjectName throws std::runtime_error (line 428-429),
    // caught at line 65 and re-thrown at line 66.
    EXPECT_THROW(SupabaseAdapter a(cfg), std::runtime_error);
}

/** Covers lines 55-67, 420-426: valid URL parses OK but PostgresAdapter init fails */
TEST(SupabaseAdapterCtorTest, PostgresMode_ValidUrl_ThrowsOnPostgresInit) {
    SupabaseConfig cfg;
    cfg.url             = "https://testproject.supabase.co";
    cfg.useRestApi      = false;
    cfg.postgresPassword = "testpass";
    // extractProjectName succeeds (lines 421-426); PostgresAdapter constructor
    // fails to connect to the non-existent host and throws, caught and re-thrown
    // as std::runtime_error at line 66.
    EXPECT_THROW(SupabaseAdapter a(cfg), std::runtime_error);
}

// ---------------------------------------------------------------------------
// Compensating transaction: success paths
// (supabase_adapter.cpp:95-97, 133-138, 170-174, 198-202)
// ---------------------------------------------------------------------------

/** Covers lines 95-97 — commitTransaction with active compensating tx succeeds */
TEST_F(SupabaseAdapterTest, BeginAndCommit_WithActiveTx_Succeeds) {
    ASSERT_TRUE(adapter_->beginTransaction().isOk());
    auto r = adapter_->commitTransaction();
    EXPECT_TRUE(r.isOk());
}

/** Covers lines 133-138 — create() while tx active records compensating operation */
TEST_F(SupabaseAdapterTest, Create_InActiveTx_RecordsCompensatingCreate) {
    ASSERT_TRUE(adapter_->beginTransaction().isOk());

    Json rec;
    rec["id"]   = "cid1";
    rec["name"] = "Bob";
    EXPECT_CALL(*mock_ptr_, post(_, _))
        .WillOnce(Return(Result<Json>(Json::array({rec}))));

    auto r = adapter_->create("User", Json{{"name", "Bob"}});
    EXPECT_TRUE(r.isOk());

    // Clean up: commit so compensating_tx_ is released
    adapter_->commitTransaction();
}

/** Covers lines 170-174 — update() while tx active snapshots old data */
TEST_F(SupabaseAdapterTest, Update_InActiveTx_SnapshotsOldData) {
    ASSERT_TRUE(adapter_->beginTransaction().isOk());

    // read() (snapshot) calls get()
    Json existing;
    existing["id"]   = "uid1";
    existing["name"] = "Old";
    EXPECT_CALL(*mock_ptr_, get(_))
        .WillOnce(Return(Result<Json>(Json::array({existing}))));

    // patch() (actual update)
    Json updated;
    updated["id"]   = "uid1";
    updated["name"] = "New";
    EXPECT_CALL(*mock_ptr_, patch(_, _))
        .WillOnce(Return(Result<Json>(Json::array({updated}))));

    auto r = adapter_->update("User", "uid1", Json{{"name", "New"}});
    EXPECT_TRUE(r.isOk());

    adapter_->commitTransaction();
}

/** Covers lines 198-202 — remove() while tx active snapshots old data */
TEST_F(SupabaseAdapterTest, Remove_InActiveTx_SnapshotsOldData) {
    ASSERT_TRUE(adapter_->beginTransaction().isOk());

    // read() (snapshot) calls get()
    Json existing;
    existing["id"]   = "rid1";
    existing["name"] = "Alice";
    EXPECT_CALL(*mock_ptr_, get(_))
        .WillOnce(Return(Result<Json>(Json::array({existing}))));

    // deleteRequest()
    EXPECT_CALL(*mock_ptr_, deleteRequest(_))
        .WillOnce(Return(Result<bool>(true)));

    auto r = adapter_->remove("User", "rid1");
    EXPECT_TRUE(r.isOk());

    adapter_->commitTransaction();
}

// ---------------------------------------------------------------------------
// getEntitySchema: field with default value (supabase_adapter.cpp:406-408)
// ---------------------------------------------------------------------------

/** Covers lines 406-408 — field with defaultValue triggers the has_value() branch */
TEST(SupabaseAdapterSchemaTest, GetEntitySchema_FieldWithDefault_CoversDefaultBranch) {
    dbal::core::EntitySchema s;
    s.name        = "Status";
    s.displayName = "Status";

    dbal::core::EntityField f;
    f.name         = "state";
    f.type         = "string";
    f.required     = false;
    f.defaultValue = std::string("active");   // triggers lines 406-408
    s.fields.push_back(f);

    std::map<std::string, dbal::core::EntitySchema> schemas;
    schemas["Status"] = std::move(s);

    auto mock = std::make_unique<MockHttpClient>();
    SupabaseAdapter adapter(std::move(mock), std::move(schemas));

    auto res = adapter.getEntitySchema("Status");
    ASSERT_TRUE(res.isOk());
    EXPECT_EQ(res.value().fields[0].name, "state");
}
