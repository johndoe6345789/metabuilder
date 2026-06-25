/**
 * @file sql_where_builder_test.cpp
 * @brief Unit tests for SqlWhereBuilder — operator coverage, parameterization, dialects.
 */

#include <gtest/gtest.h>
#include <unordered_set>
#include "adapters/sql/sql_where_builder.hpp"

using namespace dbal::adapters::sql;
using namespace dbal;

static const std::unordered_set<std::string> FIELDS = {
    "id", "title", "language", "createdAt", "userId", "tenantId", "isTemplate"
};

// Helper: build WHERE from a single typed condition
static std::string buildSingle(const FilterCondition& cond,
                                std::vector<SqlParam>& params,
                                const std::string& dialect = "postgresql") {
    int idx = 1;
    return SqlWhereBuilder::build({cond}, {}, {}, FIELDS, dialect, params, idx);
}

// ===== Basic operator coverage =====

TEST(SqlWhereBuilder, EqProducesEqualsClause) {
    std::vector<SqlParam> params;
    auto where = buildSingle({"language", FilterOp::Eq, "python"}, params);
    EXPECT_EQ(where, "WHERE \"language\" = $1");
    ASSERT_EQ(params.size(), 1u);
    EXPECT_EQ(params[0].value, "python");
}

TEST(SqlWhereBuilder, NeProducesNotEqualsClause) {
    std::vector<SqlParam> params;
    auto where = buildSingle({"language", FilterOp::Ne, "python"}, params);
    EXPECT_EQ(where, "WHERE \"language\" <> $1");
}

TEST(SqlWhereBuilder, LtProducesLessThan) {
    std::vector<SqlParam> params;
    auto where = buildSingle({"createdAt", FilterOp::Lt, "1700000000"}, params);
    EXPECT_EQ(where, "WHERE \"createdAt\" < $1");
}

TEST(SqlWhereBuilder, GtProducesGreaterThan) {
    std::vector<SqlParam> params;
    auto where = buildSingle({"createdAt", FilterOp::Gt, "1700000000"}, params);
    EXPECT_EQ(where, "WHERE \"createdAt\" > $1");
}

TEST(SqlWhereBuilder, LikeProducesLikeClause) {
    std::vector<SqlParam> params;
    auto where = buildSingle({"title", FilterOp::Like, "hello%"}, params);
    EXPECT_EQ(where, "WHERE \"title\" LIKE $1");
    EXPECT_EQ(params[0].value, "hello%");
}

TEST(SqlWhereBuilder, ILikePostgresUsesILIKE) {
    std::vector<SqlParam> params;
    auto where = buildSingle({"title", FilterOp::ILike, "hello%"}, params, "postgresql");
    EXPECT_NE(where.find("ILIKE"), std::string::npos);
}

TEST(SqlWhereBuilder, ILikeSqliteUsesLowerLike) {
    std::vector<SqlParam> params;
    auto where = buildSingle({"title", FilterOp::ILike, "hello%"}, params, "sqlite");
    EXPECT_NE(where.find("LOWER"), std::string::npos);
    EXPECT_EQ(where.find("ILIKE"), std::string::npos);
}

TEST(SqlWhereBuilder, IsNullProducesIsNull) {
    std::vector<SqlParam> params;
    auto where = buildSingle({"tenantId", FilterOp::IsNull, ""}, params);
    EXPECT_EQ(where, "WHERE \"tenantId\" IS NULL");
    EXPECT_EQ(params.size(), 0u);  // No param needed
}

TEST(SqlWhereBuilder, IsNotNullProducesIsNotNull) {
    std::vector<SqlParam> params;
    auto where = buildSingle({"tenantId", FilterOp::IsNotNull, ""}, params);
    EXPECT_EQ(where, "WHERE \"tenantId\" IS NOT NULL");
}

TEST(SqlWhereBuilder, InProducesInClause) {
    std::vector<SqlParam> params;
    FilterCondition cond;
    cond.field  = "language";
    cond.op     = FilterOp::In;
    cond.values = {"python", "typescript", "javascript"};
    auto where = buildSingle(cond, params);
    EXPECT_NE(where.find("IN"), std::string::npos);
    EXPECT_NE(where.find("$1"), std::string::npos);
    EXPECT_NE(where.find("$2"), std::string::npos);
    EXPECT_NE(where.find("$3"), std::string::npos);
    EXPECT_EQ(params.size(), 3u);
    EXPECT_EQ(params[0].value, "python");
}

TEST(SqlWhereBuilder, BetweenProducesBetweenClause) {
    std::vector<SqlParam> params;
    FilterCondition cond;
    cond.field  = "createdAt";
    cond.op     = FilterOp::Between;
    cond.values = {"1700000000", "1800000000"};
    auto where = buildSingle(cond, params);
    EXPECT_NE(where.find("BETWEEN"), std::string::npos);
    EXPECT_EQ(params.size(), 2u);
}

// ===== Multi-condition AND joining =====

TEST(SqlWhereBuilder, MultipleConditionsAreAndJoined) {
    std::vector<FilterCondition> conds = {
        {"language", FilterOp::Eq,  "python"},
        {"userId",   FilterOp::Eq,  "user-123"},
    };
    std::vector<SqlParam> params;
    int idx = 1;
    auto where = SqlWhereBuilder::build(conds, {}, {}, FIELDS, "postgresql", params, idx);
    EXPECT_NE(where.find(" AND "), std::string::npos);
    EXPECT_EQ(params.size(), 2u);
}

// ===== OR groups =====

TEST(SqlWhereBuilder, OrGroupIsParenthesised) {
    FilterGroup grp;
    grp.conditions.push_back({"language", FilterOp::Eq, "python"});
    grp.conditions.push_back({"language", FilterOp::Eq, "typescript"});

    std::vector<SqlParam> params;
    int idx = 1;
    auto where = SqlWhereBuilder::build({}, {grp}, {}, FIELDS, "postgresql", params, idx);

    EXPECT_NE(where.find("("), std::string::npos);
    EXPECT_NE(where.find(" OR "), std::string::npos);
    EXPECT_EQ(params.size(), 2u);
}

// ===== Legacy equality filter =====

TEST(SqlWhereBuilder, LegacyFilterProducesEquality) {
    std::map<std::string, std::string> legacy = {{"language", "python"}};
    std::vector<SqlParam> params;
    int idx = 1;
    auto where = SqlWhereBuilder::build({}, {}, legacy, FIELDS, "postgresql", params, idx);
    EXPECT_NE(where.find("\"language\""), std::string::npos);
    EXPECT_NE(where.find("$1"), std::string::npos);
    EXPECT_EQ(params[0].value, "python");
}

// ===== ORDER BY =====

TEST(SqlWhereBuilder, OrderByWithValidField) {
    std::map<std::string, std::string> sort = {{"createdAt", "desc"}};
    auto ob = SqlWhereBuilder::buildOrderBy(sort, FIELDS, "createdAt", "postgresql");
    EXPECT_EQ(ob, "ORDER BY \"createdAt\" DESC");
}

TEST(SqlWhereBuilder, OrderByDefaultWhenEmpty) {
    std::map<std::string, std::string> sort;
    auto ob = SqlWhereBuilder::buildOrderBy(sort, FIELDS, "createdAt", "postgresql");
    EXPECT_EQ(ob, "ORDER BY \"createdAt\" DESC");
}

TEST(SqlWhereBuilder, OrderByAscDirection) {
    std::map<std::string, std::string> sort = {{"title", "asc"}};
    auto ob = SqlWhereBuilder::buildOrderBy(sort, FIELDS, "createdAt", "postgresql");
    EXPECT_NE(ob.find("ASC"), std::string::npos);
}

// ===== GROUP BY =====

TEST(SqlWhereBuilder, GroupByWithValidField) {
    auto gb = SqlWhereBuilder::buildGroupBy({"language"}, FIELDS, "postgresql");
    EXPECT_EQ(gb, "GROUP BY \"language\"");
}

// ===== Aggregations =====

TEST(SqlWhereBuilder, CountAggregateProducesCountStar) {
    std::vector<AggregateSpec> aggs = {{AggFunc::Count, "id", "total"}};
    auto sel = SqlWhereBuilder::buildAggregateSelect(aggs, {}, FIELDS, "postgresql");
    EXPECT_NE(sel.find("COUNT"), std::string::npos);
    EXPECT_NE(sel.find("\"total\""), std::string::npos);
}

TEST(SqlWhereBuilder, AggregateWithGroupByIncludesGroupByField) {
    std::vector<AggregateSpec> aggs = {{AggFunc::Count, "id", "count"}};
    auto sel = SqlWhereBuilder::buildAggregateSelect(aggs, {"language"}, FIELDS, "postgresql");
    EXPECT_NE(sel.find("\"language\""), std::string::npos);
}

// ===== MySQL dialect =====

TEST(SqlWhereBuilder, MySqlUsesQuestionMarkPlaceholder) {
    std::vector<SqlParam> params;
    auto where = buildSingle({"language", FilterOp::Eq, "python"}, params, "mysql");
    EXPECT_NE(where.find("?"), std::string::npos);
    EXPECT_EQ(where.find("$1"), std::string::npos);
}

TEST(SqlWhereBuilder, MySqlUsesBacktickQuoting) {
    std::vector<SqlParam> params;
    auto where = buildSingle({"language", FilterOp::Eq, "python"}, params, "mysql");
    EXPECT_NE(where.find("`language`"), std::string::npos);
}

// ===== Empty input =====

TEST(SqlWhereBuilder, EmptyInputProducesEmptyString) {
    std::vector<SqlParam> params;
    int idx = 1;
    auto where = SqlWhereBuilder::build({}, {}, {}, FIELDS, "postgresql", params, idx);
    EXPECT_EQ(where, "");
    EXPECT_EQ(params.size(), 0u);
}
