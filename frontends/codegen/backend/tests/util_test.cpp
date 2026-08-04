#include "../src/util.hpp"

#include <gtest/gtest.h>
#include <cstdlib>
#include <fstream>

using namespace codegen_backend;

TEST(EnvOr, ReturnsFallbackWhenUnset) {
    unsetenv("CODEGEN_BACKEND_TEST_VAR");
    EXPECT_EQ(envOr("CODEGEN_BACKEND_TEST_VAR", "fallback"), "fallback");
}

TEST(EnvOr, ReturnsSetValue) {
    setenv("CODEGEN_BACKEND_TEST_VAR", "actual", 1);
    EXPECT_EQ(envOr("CODEGEN_BACKEND_TEST_VAR", "fallback"), "actual");
    unsetenv("CODEGEN_BACKEND_TEST_VAR");
}

TEST(EnvOr, TreatsEmptyStringAsUnset) {
    setenv("CODEGEN_BACKEND_TEST_VAR", "", 1);
    EXPECT_EQ(envOr("CODEGEN_BACKEND_TEST_VAR", "fallback"), "fallback");
    unsetenv("CODEGEN_BACKEND_TEST_VAR");
}

TEST(EnvInt, ParsesSetValue) {
    setenv("CODEGEN_BACKEND_TEST_INT", "42", 1);
    EXPECT_EQ(envInt("CODEGEN_BACKEND_TEST_INT", 7), 42);
    unsetenv("CODEGEN_BACKEND_TEST_INT");
}

TEST(EnvInt, ReturnsFallbackWhenUnset) {
    unsetenv("CODEGEN_BACKEND_TEST_INT");
    EXPECT_EQ(envInt("CODEGEN_BACKEND_TEST_INT", 7), 7);
}

TEST(NowIso, ProducesUtcIso8601Shape) {
    // "YYYY-MM-DDTHH:MM:SSZ" -- 20 chars, fixed 'T'/'Z' positions.
    auto s = nowIso();
    ASSERT_EQ(s.size(), 20u);
    EXPECT_EQ(s[4], '-');
    EXPECT_EQ(s[7], '-');
    EXPECT_EQ(s[10], 'T');
    EXPECT_EQ(s[13], ':');
    EXPECT_EQ(s[16], ':');
    EXPECT_EQ(s[19], 'Z');
}

TEST(JsonRoundTrip, ObjectSurvivesParseAndSerialize) {
    Json::Value original;
    original["name"] = "test";
    original["count"] = 3;
    original["nested"]["flag"] = true;

    auto text = jsonText(original);
    auto reparsed = parseJson(text);

    EXPECT_EQ(reparsed["name"].asString(), "test");
    EXPECT_EQ(reparsed["count"].asInt(), 3);
    EXPECT_TRUE(reparsed["nested"]["flag"].asBool());
}

TEST(ParseJson, ThrowsOnInvalidJson) {
    EXPECT_THROW(parseJson("{not valid json"), std::runtime_error);
}

TEST(SqlStatements, SplitsOnSemicolons) {
    auto stmts = sqlStatements("SELECT 1; SELECT 2;");
    ASSERT_EQ(stmts.size(), 2u);
    EXPECT_EQ(stmts[0], "SELECT 1");
    EXPECT_EQ(stmts[1], " SELECT 2");
}

TEST(SqlStatements, IgnoresSemicolonsInsideSingleQuotedStrings) {
    // The exact case this parser exists for: a migration file with a
    // string literal containing a semicolon must not be split mid-literal.
    auto stmts = sqlStatements("INSERT INTO t (v) VALUES ('a;b'); SELECT 1;");
    ASSERT_EQ(stmts.size(), 2u);
    EXPECT_EQ(stmts[0], "INSERT INTO t (v) VALUES ('a;b')");
    EXPECT_EQ(stmts[1], " SELECT 1");
}

TEST(SqlStatements, SkipsBlankAndWhitespaceOnlyStatements) {
    auto stmts = sqlStatements("SELECT 1;   ;\n\t;SELECT 2;");
    ASSERT_EQ(stmts.size(), 2u);
    EXPECT_EQ(stmts[0], "SELECT 1");
}

TEST(SqlStatements, EmptyInputProducesNoStatements) {
    EXPECT_TRUE(sqlStatements("").empty());
    EXPECT_TRUE(sqlStatements("   \n  ").empty());
}

TEST(SqlStatements, TrailingStatementWithoutSemicolonIsIncluded) {
    auto stmts = sqlStatements("SELECT 1; SELECT 2");
    ASSERT_EQ(stmts.size(), 2u);
    EXPECT_EQ(stmts[1], " SELECT 2");
}

TEST(ReadFile, ThrowsWhenFileDoesNotExist) {
    EXPECT_THROW(readFile("/nonexistent/path/that/should/not/exist.sql"),
                 std::runtime_error);
}

TEST(ReadFile, ReturnsFullFileContents) {
    auto path = std::filesystem::temp_directory_path() / "codegen_backend_readfile_test.txt";
    {
        std::ofstream out(path);
        out << "line one\nline two\n";
    }
    EXPECT_EQ(readFile(path), "line one\nline two\n");
    std::filesystem::remove(path);
}
