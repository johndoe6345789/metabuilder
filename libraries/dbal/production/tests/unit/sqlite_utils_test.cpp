/**
 * Unit tests for SQLiteTypeConverter and SQLiteQueryBuilder.
 *
 * These classes live in src/adapters/sqlite/ and are included via the
 * src/adapters include path that is already configured for integration tests.
 */

#include <gtest/gtest.h>
#include <nlohmann/json.hpp>
#include <vector>
#include <string>

#include "sqlite/sqlite_type_converter.hpp"
#include "sqlite/sqlite_query_builder.hpp"
#include "dbal/core/entity_loader.hpp"
#include "dbal/types.hpp"

using dbal::adapters::sqlite::SQLiteTypeConverter;
using dbal::adapters::sqlite::SQLiteQueryBuilder;
using dbal::core::EntitySchema;
using dbal::core::EntityField;
using dbal::ListOptions;
using dbal::FilterCondition;
using dbal::FilterOp;
using Json = nlohmann::json;

// ---------------------------------------------------------------------------
// Helper — build a minimal EntitySchema
// ---------------------------------------------------------------------------

static EntitySchema makeSchema(const std::string& name,
                               const std::vector<std::string>& fieldNames,
                               const std::string& type = "string",
                               bool generated = false) {
    EntitySchema s;
    s.name = name;
    for (const auto& fn : fieldNames) {
        EntityField f;
        f.name = fn;
        f.type = type;
        f.generated = (generated && fn == "id");
    }
    return s;
}

static EntitySchema makeSchemaWithFields(
        const std::string& name,
        const std::vector<std::pair<std::string, std::string>>& fields) {
    EntitySchema s;
    s.name = name;
    for (const auto& [fn, ft] : fields) {
        EntityField f;
        f.name = fn;
        f.type = ft;
    }
    return s;
}

// ===========================================================================
// SQLiteTypeConverter
// ===========================================================================

TEST(SQLiteTypeConverterTest, JsonValueToString_Null_ReturnsSentinel) {
    auto result = SQLiteTypeConverter::jsonValueToString(nullptr);
    // The null sentinel is a non-empty internal string
    EXPECT_FALSE(result.empty());
}

TEST(SQLiteTypeConverterTest, JsonValueToString_BoolTrue_Returns1) {
    EXPECT_EQ(SQLiteTypeConverter::jsonValueToString(true), "1");
}

TEST(SQLiteTypeConverterTest, JsonValueToString_BoolFalse_Returns0) {
    EXPECT_EQ(SQLiteTypeConverter::jsonValueToString(false), "0");
}

TEST(SQLiteTypeConverterTest, JsonValueToString_Int64) {
    EXPECT_EQ(SQLiteTypeConverter::jsonValueToString(Json(42)), "42");
}

TEST(SQLiteTypeConverterTest, JsonValueToString_String) {
    EXPECT_EQ(SQLiteTypeConverter::jsonValueToString(Json("hello")), "hello");
}

TEST(SQLiteTypeConverterTest, JsonValueToString_Object_Dumps) {
    Json obj;
    obj["key"] = "val";
    EXPECT_FALSE(SQLiteTypeConverter::jsonValueToString(obj).empty());
}

TEST(SQLiteTypeConverterTest, JsonValueToString_Array_Dumps) {
    Json arr = Json::array({"a", "b"});
    EXPECT_FALSE(SQLiteTypeConverter::jsonValueToString(arr).empty());
}

TEST(SQLiteTypeConverterTest, JsonToValues_SkipsGeneratedField) {
    EntitySchema s = makeSchema("things", {"id"}, "uuid", /*generated=*/true);
    Json data; // no "id" key
    auto values = SQLiteTypeConverter::jsonToValues(s, data, "");
    EXPECT_TRUE(values.empty());
}

TEST(SQLiteTypeConverterTest, JsonToValues_WithPrependId) {
    EntitySchema s;
    s.name = "t";
    EntityField f; f.name = "name"; f.type = "string";
    s.fields = {f};
    Json data;
    data["name"] = "Alice";
    auto values = SQLiteTypeConverter::jsonToValues(s, data, "uuid-1");
    ASSERT_EQ(values.size(), 2u);
    EXPECT_EQ(values[0], "uuid-1");
    EXPECT_EQ(values[1], "Alice");
}

TEST(SQLiteTypeConverterTest, JsonToValues_GeneratedFieldInData_Included) {
    EntitySchema s;
    s.name = "t";
    EntityField f; f.name = "id"; f.type = "uuid"; f.generated = true;
    s.fields = {f};
    Json data;
    data["id"] = "my-uuid";
    auto values = SQLiteTypeConverter::jsonToValues(s, data, "");
    ASSERT_EQ(values.size(), 1u);
    EXPECT_EQ(values[0], "my-uuid");
}

TEST(SQLiteTypeConverterTest, BuildUpdateParams_SkipsIdAndCreatedAt) {
    EntitySchema s;
    s.name = "t";
    EntityField id; id.name = "id"; id.type = "uuid";
    EntityField ca; ca.name = "createdAt"; ca.type = "timestamp";
    EntityField nm; nm.name = "name"; nm.type = "string";
    s.fields = {id, ca, nm};
    Json data;
    data["id"] = "x";
    data["createdAt"] = "2024-01-01";
    data["name"] = "Bob";
    auto values = SQLiteTypeConverter::buildUpdateParams(s, data, "uuid-99");
    // "name" value + id value; id/createdAt skipped in SET
    ASSERT_EQ(values.size(), 2u);
    EXPECT_EQ(values[0], "Bob");
    EXPECT_EQ(values[1], "uuid-99");
}

TEST(SQLiteTypeConverterTest, BuildUpdateManyParams_SetThenWhere) {
    EntitySchema s;
    s.name = "t";
    EntityField nm; nm.name = "name"; nm.type = "string";
    s.fields = {nm};
    Json filter; filter["active"] = "1";
    Json data; data["name"] = "New";
    auto values = SQLiteTypeConverter::buildUpdateManyParams(s, filter, data);
    ASSERT_EQ(values.size(), 2u);
    EXPECT_EQ(values[0], "New");
}

TEST(SQLiteTypeConverterTest, BuildDeleteManyParams_ReturnsFilterValues) {
    Json filter; filter["status"] = "deleted"; filter["active"] = "0";
    auto values = SQLiteTypeConverter::buildDeleteManyParams(filter);
    EXPECT_EQ(values.size(), 2u);
}

TEST(SQLiteTypeConverterTest, BuildFindParams_ReturnsFilterValues) {
    Json filter; filter["email"] = "test@example.com";
    auto values = SQLiteTypeConverter::buildFindParams(filter);
    ASSERT_EQ(values.size(), 1u);
    EXPECT_EQ(values[0], "test@example.com");
}

TEST(SQLiteTypeConverterTest, BuildListParams_LimitAndOffset) {
    ListOptions opts;
    opts.limit = 20;
    opts.page = 2;
    auto values = SQLiteTypeConverter::buildListParams(opts);
    // Last two values are LIMIT and OFFSET
    ASSERT_GE(values.size(), 2u);
    EXPECT_EQ(values[values.size()-2], "20");
    EXPECT_EQ(values[values.size()-1], "20"); // offset = (2-1)*20 = 20
}

TEST(SQLiteTypeConverterTest, BuildListParams_DefaultLimit) {
    // limit=0 triggers the default-50 branch in buildListParams
    ListOptions opts;
    opts.limit = 0;
    opts.page = 1;
    auto values = SQLiteTypeConverter::buildListParams(opts);
    EXPECT_EQ(values[values.size()-2], "50");
    EXPECT_EQ(values[values.size()-1], "0");
}

TEST(SQLiteTypeConverterTest, BuildListParams_WithLegacyFilter) {
    ListOptions opts;
    opts.filter["status"] = "active";
    opts.limit = 10;
    auto values = SQLiteTypeConverter::buildListParams(opts);
    ASSERT_GE(values.size(), 3u);
    EXPECT_EQ(values[0], "active");
}

TEST(SQLiteTypeConverterTest, BuildListParams_WithCondition_Eq) {
    ListOptions opts;
    opts.limit = 10;
    FilterCondition c;
    c.field = "name"; c.op = FilterOp::Eq; c.value = "Alice";
    opts.conditions = {c};
    auto values = SQLiteTypeConverter::buildListParams(opts);
    ASSERT_GE(values.size(), 3u);
    EXPECT_EQ(values[0], "Alice");
}

TEST(SQLiteTypeConverterTest, BuildListParams_IsNull_NoBoundParam) {
    ListOptions opts;
    opts.limit = 10;
    FilterCondition c;
    c.field = "name"; c.op = FilterOp::IsNull;
    opts.conditions = {c};
    auto values = SQLiteTypeConverter::buildListParams(opts);
    // IsNull has no bound param, only LIMIT and OFFSET
    EXPECT_EQ(values.size(), 2u);
}

TEST(SQLiteTypeConverterTest, BuildListParams_IsNotNull_NoBoundParam) {
    ListOptions opts;
    opts.limit = 10;
    FilterCondition c;
    c.field = "name"; c.op = FilterOp::IsNotNull;
    opts.conditions = {c};
    auto values = SQLiteTypeConverter::buildListParams(opts);
    EXPECT_EQ(values.size(), 2u);
}

TEST(SQLiteTypeConverterTest, BuildListParams_In_MultipleValues) {
    ListOptions opts;
    opts.limit = 10;
    FilterCondition c;
    c.field = "status"; c.op = FilterOp::In; c.values = {"a", "b", "c"};
    opts.conditions = {c};
    auto values = SQLiteTypeConverter::buildListParams(opts);
    ASSERT_GE(values.size(), 5u); // 3 values + LIMIT + OFFSET
    EXPECT_EQ(values[0], "a");
    EXPECT_EQ(values[1], "b");
    EXPECT_EQ(values[2], "c");
}

TEST(SQLiteTypeConverterTest, BuildListParams_NotIn_MultipleValues) {
    ListOptions opts;
    opts.limit = 10;
    FilterCondition c;
    c.field = "status"; c.op = FilterOp::NotIn; c.values = {"x", "y"};
    opts.conditions = {c};
    auto values = SQLiteTypeConverter::buildListParams(opts);
    ASSERT_GE(values.size(), 4u);
    EXPECT_EQ(values[0], "x");
    EXPECT_EQ(values[1], "y");
}

TEST(SQLiteTypeConverterTest, BuildListParams_Between_TwoValues) {
    ListOptions opts;
    opts.limit = 10;
    FilterCondition c;
    c.field = "age"; c.op = FilterOp::Between; c.values = {"18", "65"};
    opts.conditions = {c};
    auto values = SQLiteTypeConverter::buildListParams(opts);
    ASSERT_GE(values.size(), 4u);
    EXPECT_EQ(values[0], "18");
    EXPECT_EQ(values[1], "65");
}

TEST(SQLiteTypeConverterTest, BuildCountParams_WithCondition) {
    ListOptions opts;
    FilterCondition c;
    c.field = "status"; c.op = FilterOp::Eq; c.value = "active";
    opts.conditions = {c};
    auto values = SQLiteTypeConverter::buildCountParams(opts);
    ASSERT_EQ(values.size(), 1u);
    EXPECT_EQ(values[0], "active");
}

TEST(SQLiteTypeConverterTest, BuildCountParams_WithOrGroup) {
    ListOptions opts;
    dbal::FilterGroup grp;
    FilterCondition c1; c1.field = "status"; c1.op = FilterOp::Eq; c1.value = "a";
    FilterCondition c2; c2.field = "status"; c2.op = FilterOp::Eq; c2.value = "b";
    grp.conditions = {c1, c2};
    opts.filter_groups = {grp};
    auto values = SQLiteTypeConverter::buildCountParams(opts);
    EXPECT_EQ(values.size(), 2u);
}

// ===========================================================================
// SQLiteQueryBuilder
// ===========================================================================

TEST(SQLiteQueryBuilderTest, QuoteId_WrapsWithDoubleQuotes) {
    EXPECT_EQ(SQLiteQueryBuilder::quoteId("name"), "\"name\"");
}

TEST(SQLiteQueryBuilderTest, ToLowerSnakeCase_PascalCase) {
    EXPECT_EQ(SQLiteQueryBuilder::toLowerSnakeCase("UserProfile"), "user_profile");
    EXPECT_EQ(SQLiteQueryBuilder::toLowerSnakeCase("createdAt"), "created_at");
    EXPECT_EQ(SQLiteQueryBuilder::toLowerSnakeCase("id"), "id");
}

TEST(SQLiteQueryBuilderTest, ToLowerSnakeCase_AlreadyLower) {
    EXPECT_EQ(SQLiteQueryBuilder::toLowerSnakeCase("name"), "name");
}

TEST(SQLiteQueryBuilderTest, JoinFragments_Empty_ReturnsEmpty) {
    EXPECT_EQ(SQLiteQueryBuilder::joinFragments({}, ", "), "");
}

TEST(SQLiteQueryBuilderTest, JoinFragments_Single_NoSeparator) {
    EXPECT_EQ(SQLiteQueryBuilder::joinFragments({"a"}, ", "), "a");
}

TEST(SQLiteQueryBuilderTest, JoinFragments_Multiple_JoinedCorrectly) {
    EXPECT_EQ(SQLiteQueryBuilder::joinFragments({"a", "b", "c"}, ", "), "a, b, c");
}

TEST(SQLiteQueryBuilderTest, BuildInsertQuery_BasicFields) {
    EntitySchema s;
    s.name = "users";
    EntityField id; id.name = "id"; id.type = "uuid"; id.generated = false;
    EntityField nm; nm.name = "name"; nm.type = "string";
    s.fields = {id, nm};
    Json data;
    data["id"] = "x";
    data["name"] = "Alice";
    auto sql = SQLiteQueryBuilder::buildInsertQuery(s, data);
    EXPECT_NE(sql.find("INSERT INTO"), std::string::npos);
    EXPECT_NE(sql.find("users"), std::string::npos);
    EXPECT_NE(sql.find("?"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildInsertQuery_SkipsGeneratedFieldNotInData) {
    EntitySchema s;
    s.name = "items";
    EntityField id; id.name = "id"; id.type = "uuid"; id.generated = true;
    EntityField nm; nm.name = "name"; nm.type = "string";
    s.fields = {id, nm};
    Json data;
    data["name"] = "Widget"; // no "id"
    auto sql = SQLiteQueryBuilder::buildInsertQuery(s, data);
    EXPECT_NE(sql.find("name"), std::string::npos);
    // "id" should not appear since it's generated and not in data
    EXPECT_EQ(sql.find("\"id\""), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildSelectQuery_NoFilter) {
    EntitySchema s;
    s.name = "products";
    EntityField id; id.name = "id"; id.type = "uuid";
    EntityField nm; nm.name = "name"; nm.type = "string";
    s.fields = {id, nm};
    auto sql = SQLiteQueryBuilder::buildSelectQuery(s, Json::object());
    EXPECT_NE(sql.find("SELECT"), std::string::npos);
    EXPECT_NE(sql.find("FROM"), std::string::npos);
    EXPECT_EQ(sql.find("WHERE"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildSelectQuery_WithFilter) {
    EntitySchema s;
    s.name = "products";
    EntityField id; id.name = "id"; id.type = "uuid";
    s.fields = {id};
    Json filter; filter["id"] = "abc";
    auto sql = SQLiteQueryBuilder::buildSelectQuery(s, filter);
    EXPECT_NE(sql.find("WHERE"), std::string::npos);
    EXPECT_NE(sql.find("?"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildUpdateQuery_BasicFields) {
    EntitySchema s;
    s.name = "users";
    EntityField id; id.name = "id"; id.type = "uuid";
    EntityField nm; nm.name = "name"; nm.type = "string";
    s.fields = {id, nm};
    Json data; data["name"] = "Bob";
    auto sql = SQLiteQueryBuilder::buildUpdateQuery(s, "uuid-1", data);
    EXPECT_NE(sql.find("UPDATE"), std::string::npos);
    EXPECT_NE(sql.find("users"), std::string::npos);
    EXPECT_NE(sql.find("SET"), std::string::npos);
    EXPECT_NE(sql.find("WHERE"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildUpdateQuery_NoUpdatableFields_ReturnsEmpty) {
    EntitySchema s;
    s.name = "users";
    EntityField id; id.name = "id"; id.type = "uuid";
    EntityField ca; ca.name = "createdAt"; ca.type = "timestamp";
    s.fields = {id, ca};
    Json data; // no updatable fields
    auto sql = SQLiteQueryBuilder::buildUpdateQuery(s, "uuid-1", data);
    EXPECT_TRUE(sql.empty());
}

TEST(SQLiteQueryBuilderTest, BuildDeleteQuery) {
    EntitySchema s;
    s.name = "sessions";
    auto sql = SQLiteQueryBuilder::buildDeleteQuery(s, "sid-1");
    EXPECT_NE(sql.find("DELETE FROM"), std::string::npos);
    EXPECT_NE(sql.find("sessions"), std::string::npos);
    EXPECT_NE(sql.find("WHERE"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildListQuery_BasicPagination) {
    EntitySchema s;
    s.name = "items";
    EntityField id; id.name = "id"; id.type = "uuid";
    s.fields = {id};
    ListOptions opts;
    opts.limit = 10;
    opts.page = 2;
    auto sql = SQLiteQueryBuilder::buildListQuery(s, opts);
    EXPECT_NE(sql.find("SELECT"), std::string::npos);
    EXPECT_NE(sql.find("LIMIT"), std::string::npos);
    EXPECT_NE(sql.find("OFFSET"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildListQuery_WithLegacyFilter) {
    EntitySchema s;
    s.name = "users";
    EntityField st; st.name = "status"; st.type = "string";
    s.fields = {st};
    ListOptions opts;
    opts.filter["status"] = "active";
    opts.limit = 20;
    auto sql = SQLiteQueryBuilder::buildListQuery(s, opts);
    EXPECT_NE(sql.find("WHERE"), std::string::npos);
    EXPECT_NE(sql.find("?"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildListQuery_WithSort) {
    EntitySchema s;
    s.name = "posts";
    EntityField id; id.name = "id"; id.type = "uuid";
    s.fields = {id};
    ListOptions opts;
    opts.limit = 10;
    opts.sort["id"] = "asc";
    auto sql = SQLiteQueryBuilder::buildListQuery(s, opts);
    EXPECT_NE(sql.find("ORDER BY"), std::string::npos);
    EXPECT_NE(sql.find("ASC"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildListQuery_SortDesc) {
    EntitySchema s;
    s.name = "posts";
    EntityField id; id.name = "id"; id.type = "uuid";
    s.fields = {id};
    ListOptions opts;
    opts.limit = 10;
    opts.sort["id"] = "desc";
    auto sql = SQLiteQueryBuilder::buildListQuery(s, opts);
    EXPECT_NE(sql.find("DESC"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildListQuery_WithOrGroup) {
    EntitySchema s;
    s.name = "items";
    EntityField st; st.name = "status"; st.type = "string";
    s.fields = {st};
    ListOptions opts;
    opts.limit = 10;
    dbal::FilterGroup grp;
    FilterCondition c1; c1.field = "status"; c1.op = FilterOp::Eq; c1.value = "a";
    FilterCondition c2; c2.field = "status"; c2.op = FilterOp::Eq; c2.value = "b";
    grp.conditions = {c1, c2};
    opts.filter_groups = {grp};
    auto sql = SQLiteQueryBuilder::buildListQuery(s, opts);
    EXPECT_NE(sql.find("OR"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildListQuery_WithGroupBy) {
    EntitySchema s;
    s.name = "orders";
    EntityField st; st.name = "status"; st.type = "string";
    s.fields = {st};
    ListOptions opts;
    opts.limit = 10;
    opts.group_by = {"status"};
    auto sql = SQLiteQueryBuilder::buildListQuery(s, opts);
    EXPECT_NE(sql.find("GROUP BY"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildListQuery_WithAggregates) {
    EntitySchema s;
    s.name = "sales";
    EntityField amt; amt.name = "amount"; amt.type = "number";
    s.fields = {amt};
    ListOptions opts;
    opts.limit = 10;
    dbal::AggregateSpec agg;
    agg.func = dbal::AggFunc::Sum;
    agg.field = "amount";
    agg.alias = "total";
    opts.aggregates = {agg};
    auto sql = SQLiteQueryBuilder::buildListQuery(s, opts);
    EXPECT_NE(sql.find("SUM"), std::string::npos);
    EXPECT_NE(sql.find("total"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildListQuery_AggregateCount) {
    EntitySchema s;
    s.name = "t";
    EntityField id; id.name = "id"; id.type = "uuid";
    s.fields = {id};
    ListOptions opts;
    opts.limit = 10;
    dbal::AggregateSpec agg;
    agg.func = dbal::AggFunc::Count;
    agg.field = "id";
    agg.alias = "cnt";
    opts.aggregates = {agg};
    auto sql = SQLiteQueryBuilder::buildListQuery(s, opts);
    EXPECT_NE(sql.find("COUNT"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildListQuery_AggregateAvg) {
    EntitySchema s;
    s.name = "t";
    EntityField sc; sc.name = "score"; sc.type = "number";
    s.fields = {sc};
    ListOptions opts;
    opts.limit = 10;
    dbal::AggregateSpec agg;
    agg.func = dbal::AggFunc::Avg;
    agg.field = "score";
    agg.alias = "avg_score";
    opts.aggregates = {agg};
    auto sql = SQLiteQueryBuilder::buildListQuery(s, opts);
    EXPECT_NE(sql.find("AVG"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildListQuery_AggregateMin) {
    EntitySchema s;
    s.name = "t";
    EntityField sc; sc.name = "score"; sc.type = "number";
    s.fields = {sc};
    ListOptions opts;
    opts.limit = 10;
    dbal::AggregateSpec agg;
    agg.func = dbal::AggFunc::Min;
    agg.field = "score";
    agg.alias = "min_score";
    opts.aggregates = {agg};
    auto sql = SQLiteQueryBuilder::buildListQuery(s, opts);
    EXPECT_NE(sql.find("MIN"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildListQuery_AggregateMax) {
    EntitySchema s;
    s.name = "t";
    EntityField sc; sc.name = "score"; sc.type = "number";
    s.fields = {sc};
    ListOptions opts;
    opts.limit = 10;
    dbal::AggregateSpec agg;
    agg.func = dbal::AggFunc::Max;
    agg.field = "score";
    agg.alias = "max_score";
    opts.aggregates = {agg};
    auto sql = SQLiteQueryBuilder::buildListQuery(s, opts);
    EXPECT_NE(sql.find("MAX"), std::string::npos);
}

// ---------------------------------------------------------------------------
// conditionToSql — each FilterOp branch
// ---------------------------------------------------------------------------

struct ConditionSqlCase {
    FilterOp op;
    std::string expectedFragment;
    std::vector<std::string> values;
    std::string value;
};

class ConditionToSqlTest : public testing::TestWithParam<ConditionSqlCase> {};

TEST_P(ConditionToSqlTest, ProducesExpectedFragment) {
    auto p = GetParam();
    FilterCondition c;
    c.field = "col";
    c.op = p.op;
    c.value = p.value;
    c.values = p.values;
    auto sql = SQLiteQueryBuilder::conditionToSql(c);
    EXPECT_NE(sql.find(p.expectedFragment), std::string::npos);
}

INSTANTIATE_TEST_SUITE_P(AllOps, ConditionToSqlTest, testing::Values(
    ConditionSqlCase{FilterOp::Eq,        "= ?",          {}, "x"},
    ConditionSqlCase{FilterOp::Ne,        "!= ?",         {}, "x"},
    ConditionSqlCase{FilterOp::Lt,        "< ?",          {}, "x"},
    ConditionSqlCase{FilterOp::Lte,       "<= ?",         {}, "x"},
    ConditionSqlCase{FilterOp::Gt,        "> ?",          {}, "x"},
    ConditionSqlCase{FilterOp::Gte,       ">= ?",         {}, "x"},
    ConditionSqlCase{FilterOp::Like,      "LIKE ?",       {}, "x"},
    ConditionSqlCase{FilterOp::ILike,     "LOWER",        {}, "x"},
    ConditionSqlCase{FilterOp::IsNull,    "IS NULL",      {}, ""},
    ConditionSqlCase{FilterOp::IsNotNull, "IS NOT NULL",  {}, ""},
    ConditionSqlCase{FilterOp::In,        "IN",           {"a","b"}, ""},
    ConditionSqlCase{FilterOp::NotIn,     "NOT IN",       {"a","b"}, ""},
    ConditionSqlCase{FilterOp::Between,   "BETWEEN",      {}, "x"}
));

// ---------------------------------------------------------------------------
// buildCountQuery
// ---------------------------------------------------------------------------

TEST(SQLiteQueryBuilderTest, BuildCountQuery_Basic) {
    EntitySchema s;
    s.name = "widgets";
    EntityField id; id.name = "id"; id.type = "uuid";
    s.fields = {id};
    ListOptions opts;
    auto sql = SQLiteQueryBuilder::buildCountQuery(s, opts);
    EXPECT_NE(sql.find("COUNT(*)"), std::string::npos);
    EXPECT_NE(sql.find("widgets"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildCountQuery_WithFilter) {
    EntitySchema s;
    s.name = "t";
    EntityField id; id.name = "id"; id.type = "uuid";
    s.fields = {id};
    ListOptions opts;
    opts.filter["status"] = "active";
    auto sql = SQLiteQueryBuilder::buildCountQuery(s, opts);
    EXPECT_NE(sql.find("WHERE"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildCountQuery_WithGroupBy) {
    EntitySchema s;
    s.name = "t";
    EntityField st; st.name = "status"; st.type = "string";
    s.fields = {st};
    ListOptions opts;
    opts.group_by = {"status"};
    auto sql = SQLiteQueryBuilder::buildCountQuery(s, opts);
    EXPECT_NE(sql.find("GROUP BY"), std::string::npos);
}

// ---------------------------------------------------------------------------
// buildUpdateManyQuery / buildDeleteManyQuery / buildFindFirstQuery
// ---------------------------------------------------------------------------

TEST(SQLiteQueryBuilderTest, BuildUpdateManyQuery_Basic) {
    EntitySchema s;
    s.name = "users";
    EntityField nm; nm.name = "name"; nm.type = "string";
    s.fields = {nm};
    Json filter; filter["active"] = "1";
    Json data; data["name"] = "New";
    auto sql = SQLiteQueryBuilder::buildUpdateManyQuery(s, filter, data);
    EXPECT_NE(sql.find("UPDATE"), std::string::npos);
    EXPECT_NE(sql.find("users"), std::string::npos);
    EXPECT_NE(sql.find("WHERE"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildUpdateManyQuery_NoFields_ReturnsEmpty) {
    EntitySchema s;
    s.name = "users";
    Json filter; filter["active"] = "1";
    Json data; // no fields
    auto sql = SQLiteQueryBuilder::buildUpdateManyQuery(s, filter, data);
    EXPECT_TRUE(sql.empty());
}

TEST(SQLiteQueryBuilderTest, BuildDeleteManyQuery_WithFilter) {
    EntitySchema s;
    s.name = "logs";
    Json filter; filter["level"] = "debug";
    auto sql = SQLiteQueryBuilder::buildDeleteManyQuery(s, filter);
    EXPECT_NE(sql.find("DELETE FROM"), std::string::npos);
    EXPECT_NE(sql.find("logs"), std::string::npos);
    EXPECT_NE(sql.find("WHERE"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildDeleteManyQuery_NoFilter) {
    EntitySchema s;
    s.name = "logs";
    Json filter = Json::object();
    auto sql = SQLiteQueryBuilder::buildDeleteManyQuery(s, filter);
    EXPECT_NE(sql.find("DELETE FROM"), std::string::npos);
    EXPECT_NE(sql.find("logs"), std::string::npos);
    EXPECT_EQ(sql.find("WHERE"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildFindFirstQuery_WithFilter) {
    EntitySchema s;
    s.name = "users";
    EntityField id; id.name = "id"; id.type = "uuid";
    s.fields = {id};
    Json filter; filter["email"] = "x@y.com";
    auto sql = SQLiteQueryBuilder::buildFindFirstQuery(s, filter);
    EXPECT_NE(sql.find("SELECT"), std::string::npos);
    EXPECT_NE(sql.find("LIMIT 1"), std::string::npos);
    EXPECT_NE(sql.find("WHERE"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildFindFirstQuery_NoFilter) {
    EntitySchema s;
    s.name = "users";
    EntityField id; id.name = "id"; id.type = "uuid";
    s.fields = {id};
    auto sql = SQLiteQueryBuilder::buildFindFirstQuery(s, Json::object());
    EXPECT_NE(sql.find("LIMIT 1"), std::string::npos);
    EXPECT_EQ(sql.find("WHERE"), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildFieldList_MultipleFields) {
    EntitySchema s;
    s.name = "t";
    EntityField id; id.name = "id"; id.type = "uuid";
    EntityField nm; nm.name = "name"; nm.type = "string";
    s.fields = {id, nm};
    auto fl = SQLiteQueryBuilder::buildFieldList(s);
    EXPECT_NE(fl.find("\"id\""), std::string::npos);
    EXPECT_NE(fl.find("\"name\""), std::string::npos);
    EXPECT_NE(fl.find(", "), std::string::npos);
}

TEST(SQLiteQueryBuilderTest, BuildCountQuery_WithOrGroup) {
    EntitySchema s;
    s.name = "t";
    EntityField id; id.name = "id"; id.type = "uuid";
    s.fields = {id};
    ListOptions opts;
    dbal::FilterGroup grp;
    FilterCondition c1; c1.field = "status"; c1.op = FilterOp::Eq; c1.value = "a";
    grp.conditions = {c1};
    opts.filter_groups = {grp};
    auto sql = SQLiteQueryBuilder::buildCountQuery(s, opts);
    EXPECT_NE(sql.find("WHERE"), std::string::npos);
}
