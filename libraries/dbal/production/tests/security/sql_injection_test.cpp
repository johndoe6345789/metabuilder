/**
 * @file sql_injection_test.cpp
 * @brief Security tests: verify SqlWhereBuilder rejects SQL injection attempts.
 *
 * These tests probe the field-name validation layer. Values are always bound
 * parameters so value-injection is tested separately (implicitly safe by design).
 *
 * Test strategy: "try security holes" — adversarial inputs through every entry point.
 */

#include <gtest/gtest.h>
#include <unordered_set>
#include <stdexcept>
#include "adapters/sql/sql_where_builder.hpp"

using namespace dbal::adapters::sql;
using namespace dbal;

// Snippet schema fields for validation
static const std::unordered_set<std::string> SNIPPET_FIELDS = {
    "id", "title", "description", "code", "language", "category",
    "namespaceId", "hasPreview", "functionName", "inputParameters",
    "files", "entryPoint", "isTemplate", "createdAt", "updatedAt",
    "userId", "tenantId", "shareToken"
};

// ===== Field Name Injection Tests =====

TEST(SqlInjectionTest, RejectsDropTableInFieldName) {
    std::vector<FilterCondition> conditions = {{"'; DROP TABLE Snippet--", FilterOp::Eq, "test"}};
    std::vector<SqlParam> params;
    int idx = 1;
    EXPECT_THROW(
        SqlWhereBuilder::build(conditions, {}, {}, SNIPPET_FIELDS, "postgresql", params, idx),
        std::invalid_argument
    );
}

TEST(SqlInjectionTest, RejectsOrTautologyInFieldName) {
    // Classic: 1=1 OR 1=1 as field name
    std::vector<FilterCondition> conditions = {{"1=1 OR 1=1", FilterOp::Eq, "test"}};
    std::vector<SqlParam> params;
    int idx = 1;
    EXPECT_THROW(
        SqlWhereBuilder::build(conditions, {}, {}, SNIPPET_FIELDS, "postgresql", params, idx),
        std::invalid_argument
    );
}

TEST(SqlInjectionTest, RejectsUnionSelectInFieldName) {
    std::vector<FilterCondition> conditions = {{"id UNION SELECT * FROM users--", FilterOp::Eq, "x"}};
    std::vector<SqlParam> params;
    int idx = 1;
    EXPECT_THROW(
        SqlWhereBuilder::build(conditions, {}, {}, SNIPPET_FIELDS, "postgresql", params, idx),
        std::invalid_argument
    );
}

TEST(SqlInjectionTest, RejectsFieldNameWithSemicolon) {
    std::vector<FilterCondition> conditions = {{"title; DROP TABLE Snippet", FilterOp::Eq, "test"}};
    std::vector<SqlParam> params;
    int idx = 1;
    EXPECT_THROW(
        SqlWhereBuilder::build(conditions, {}, {}, SNIPPET_FIELDS, "postgresql", params, idx),
        std::invalid_argument
    );
}

TEST(SqlInjectionTest, RejectsEmptyFieldName) {
    std::vector<FilterCondition> conditions = {{"", FilterOp::Eq, "value"}};
    std::vector<SqlParam> params;
    int idx = 1;
    EXPECT_THROW(
        SqlWhereBuilder::build(conditions, {}, {}, SNIPPET_FIELDS, "postgresql", params, idx),
        std::invalid_argument
    );
}

TEST(SqlInjectionTest, RejectsUnknownField) {
    std::vector<FilterCondition> conditions = {{"password_hash", FilterOp::Eq, "test"}};
    std::vector<SqlParam> params;
    int idx = 1;
    EXPECT_THROW(
        SqlWhereBuilder::build(conditions, {}, {}, SNIPPET_FIELDS, "postgresql", params, idx),
        std::invalid_argument
    );
}

// ===== Sort Field Injection Tests =====

TEST(SqlInjectionTest, RejectsDropTableInSortField) {
    std::map<std::string, std::string> sort = {{"createdAt; DROP TABLE Snippet--", "asc"}};
    EXPECT_THROW(
        SqlWhereBuilder::buildOrderBy(sort, SNIPPET_FIELDS, "createdAt", "postgresql"),
        std::invalid_argument
    );
}

TEST(SqlInjectionTest, RejectsUnknownSortField) {
    std::map<std::string, std::string> sort = {{"admin_password", "asc"}};
    EXPECT_THROW(
        SqlWhereBuilder::buildOrderBy(sort, SNIPPET_FIELDS, "createdAt", "postgresql"),
        std::invalid_argument
    );
}

// ===== OR Group Field Injection Tests =====

TEST(SqlInjectionTest, RejectsInjectionInOrGroupField) {
    FilterGroup grp;
    grp.conditions.push_back({"title' OR '1'='1", FilterOp::Eq, "test"});
    std::vector<SqlParam> params;
    int idx = 1;
    EXPECT_THROW(
        SqlWhereBuilder::build({}, {grp}, {}, SNIPPET_FIELDS, "postgresql", params, idx),
        std::invalid_argument
    );
}

// ===== Aggregate Field Injection Tests =====

TEST(SqlInjectionTest, RejectsInjectionInAggregateField) {
    std::vector<AggregateSpec> aggs = {{AggFunc::Count, "id; DROP TABLE Snippet--", "total"}};
    EXPECT_THROW(
        SqlWhereBuilder::buildAggregateSelect(aggs, {}, SNIPPET_FIELDS, "postgresql"),
        std::invalid_argument
    );
}

TEST(SqlInjectionTest, RejectsInjectionInGroupByField) {
    EXPECT_THROW(
        SqlWhereBuilder::buildGroupBy({"language; DROP TABLE--"}, SNIPPET_FIELDS, "postgresql"),
        std::invalid_argument
    );
}

// ===== Value Injection (Values are Always Bound — No Injection Possible) =====

TEST(SqlInjectionTest, ValueWithSqlInjectionIsBoundSafely) {
    // The SQL injection is in the VALUE — this should NOT throw.
    // The value goes to params (bound), not into the SQL string.
    std::vector<FilterCondition> conditions = {{"title", FilterOp::Eq, "'; DROP TABLE Snippet--"}};
    std::vector<SqlParam> params;
    int idx = 1;
    std::string where = SqlWhereBuilder::build(conditions, {}, {}, SNIPPET_FIELDS, "postgresql", params, idx);

    // WHERE clause should use $1 placeholder, not the raw value
    EXPECT_NE(where.find("$1"), std::string::npos);
    EXPECT_EQ(where.find("DROP"), std::string::npos);

    // Injected value is in params, bound safely
    ASSERT_EQ(params.size(), 1u);
    EXPECT_EQ(params[0].value, "'; DROP TABLE Snippet--");
}

TEST(SqlInjectionTest, LikeValueWithWildcardIsBoundSafely) {
    std::vector<FilterCondition> conditions = {{"title", FilterOp::Like, "%'; DELETE FROM Snippet--%"}};
    std::vector<SqlParam> params;
    int idx = 1;
    std::string where = SqlWhereBuilder::build(conditions, {}, {}, SNIPPET_FIELDS, "postgresql", params, idx);

    // DELETE should never appear in the WHERE clause SQL string
    EXPECT_EQ(where.find("DELETE"), std::string::npos);
    ASSERT_EQ(params.size(), 1u);
    EXPECT_EQ(params[0].value, "%'; DELETE FROM Snippet--%");
}

// ===== Valid Field Names Pass =====

TEST(SqlInjectionTest, ValidFieldNamesPass) {
    std::vector<FilterCondition> conditions = {
        {"title",     FilterOp::Like, "hello%"},
        {"language",  FilterOp::Eq,   "python"},
        {"createdAt", FilterOp::Gt,   "1700000000"},
        {"userId",    FilterOp::Eq,   "user-123"},
    };
    std::vector<SqlParam> params;
    int idx = 1;
    EXPECT_NO_THROW(
        SqlWhereBuilder::build(conditions, {}, {}, SNIPPET_FIELDS, "postgresql", params, idx)
    );
    EXPECT_EQ(params.size(), 4u);
}

TEST(SqlInjectionTest, LegacyFilterFieldValidated) {
    // Legacy equality filter (map<string,string>) also validates field names
    std::map<std::string, std::string> legacy = {
        {"title; DROP TABLE--", "test"}
    };
    std::vector<SqlParam> params;
    int idx = 1;
    EXPECT_THROW(
        SqlWhereBuilder::build({}, {}, legacy, SNIPPET_FIELDS, "postgresql", params, idx),
        std::invalid_argument
    );
}

// ===== Dialect-Specific Quote Tests =====

TEST(SqlInjectionTest, PostgresQuotesWithDoubleQuotes) {
    const std::string q = SqlWhereBuilder::quoteId("title", "postgresql");
    EXPECT_EQ(q, "\"title\"");
}

TEST(SqlInjectionTest, MySqlQuotesWithBackticks) {
    const std::string q = SqlWhereBuilder::quoteId("title", "mysql");
    EXPECT_EQ(q, "`title`");
}
