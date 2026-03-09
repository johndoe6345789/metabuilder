/**
 * Unit tests for SqlResultParser and ErrorTranslator.
 *
 * Kept in a separate TU from sql_utils_test.cpp because sql_result_parser.hpp
 * and sql_query_builder.hpp both inject conflicting EntitySchema using-declarations
 * into namespace dbal::adapters::sql and cannot be included in the same file.
 */

#include <gtest/gtest.h>
#include <nlohmann/json.hpp>
#include <sqlite3.h>

#include "sql/sql_result_parser.hpp"
#include "dbal/core/error_translator.hpp"

using namespace dbal::adapters::sql;
using dbal::Error;
using dbal::ErrorCode;
using Json = nlohmann::json;

// ---------------------------------------------------------------------------
// Helper — dbal::adapters::EntitySchema (used by SqlResultParser)
// ---------------------------------------------------------------------------

static dbal::adapters::EntitySchema makeSchema(const std::string& name,
                                               const std::vector<std::string>& fieldNames,
                                               const std::string& fieldType = "string") {
    dbal::adapters::EntitySchema s;
    s.name = name;
    for (const auto& fn : fieldNames) {
        dbal::adapters::EntityField f;
        f.name = fn;
        f.type = fieldType;
        f.required = false;
        s.fields.push_back(f);
    }
    return s;
}

// ---------------------------------------------------------------------------
// SqlResultParser
// ---------------------------------------------------------------------------

TEST(SqlResultParserTest, RowToJson_StringField) {
    auto schema = makeSchema("items", {"id", "name"}, "string");
    SqlRow row;
    row.columns["id"]   = "abc";
    row.columns["name"] = "Widget";

    auto json = SqlResultParser::rowToJson(row, schema);
    EXPECT_EQ(json["name"].get<std::string>(), "Widget");
}

TEST(SqlResultParserTest, RowToJson_NumericField) {
    dbal::adapters::EntitySchema schema;
    schema.name = "items";
    dbal::adapters::EntityField idField;   idField.name  = "id";  idField.type  = "string";
    dbal::adapters::EntityField numField;  numField.name = "qty"; numField.type = "number";
    schema.fields = {idField, numField};

    SqlRow row;
    row.columns["id"]  = "x";
    row.columns["qty"] = "99";

    auto json = SqlResultParser::rowToJson(row, schema);
    EXPECT_EQ(json["qty"].get<int64_t>(), 99LL);
}

TEST(SqlResultParserTest, RowToJson_BooleanField) {
    dbal::adapters::EntitySchema schema;
    schema.name = "flags";
    dbal::adapters::EntityField f; f.name = "active"; f.type = "boolean"; f.required = false;
    schema.fields = {f};

    SqlRow row;  row.columns["active"] = "1";
    EXPECT_TRUE(SqlResultParser::rowToJson(row, schema)["active"].get<bool>());
}

TEST(SqlResultParserTest, RowToJson_MissingColumn_NullForOptional) {
    dbal::adapters::EntitySchema schema;
    schema.name = "t";
    dbal::adapters::EntityField f; f.name = "desc"; f.type = "string"; f.required = false;
    schema.fields = {f};

    SqlRow row;  // no "desc" column
    EXPECT_TRUE(SqlResultParser::rowToJson(row, schema)["desc"].is_null());
}

TEST(SqlResultParserTest, RowsToJson_MultipleRows) {
    auto schema = makeSchema("t", {"id", "name"}, "string");
    SqlRow r1;  r1.columns["id"] = "1"; r1.columns["name"] = "A";
    SqlRow r2;  r2.columns["id"] = "2"; r2.columns["name"] = "B";

    auto results = SqlResultParser::rowsToJson({r1, r2}, schema);
    ASSERT_EQ(results.size(), 2u);
    EXPECT_EQ(results[0]["name"].get<std::string>(), "A");
    EXPECT_EQ(results[1]["name"].get<std::string>(), "B");
}

TEST(SqlResultParserTest, JsonToParams_SkipsIdAndCreatedAt) {
    auto schema = makeSchema("items", {"id", "createdAt", "title"}, "string");
    Json data;
    data["id"]        = "uuid-x";
    data["createdAt"] = "2024-01-01";
    data["title"]     = "Hello";

    auto params = SqlResultParser::jsonToParams(schema, data, "");
    ASSERT_EQ(params.size(), 1u);
    EXPECT_EQ(params[0].first,  "title");
    EXPECT_EQ(params[0].second, "Hello");
}

TEST(SqlResultParserTest, JsonToParams_PrependId) {
    auto schema = makeSchema("items", {"id", "title"}, "string");
    Json data;  data["title"] = "World";

    auto params = SqlResultParser::jsonToParams(schema, data, "uuid-99");
    ASSERT_GE(params.size(), 1u);
    EXPECT_EQ(params[0].first,  "id");
    EXPECT_EQ(params[0].second, "uuid-99");
}

// ---------------------------------------------------------------------------
// ErrorTranslator
// ---------------------------------------------------------------------------

TEST(ErrorTranslatorTest, FromSQLite_Constraint_IsConflict) {
    auto err = dbal::ErrorTranslator::fromSQLite(SQLITE_CONSTRAINT, "dup", "");
    EXPECT_EQ(err.code(), ErrorCode::Conflict);
}

TEST(ErrorTranslatorTest, FromSQLite_Locked_IsDatabaseError) {
    auto err = dbal::ErrorTranslator::fromSQLite(SQLITE_LOCKED, "locked", "");
    EXPECT_EQ(err.code(), ErrorCode::DatabaseError);
}

TEST(ErrorTranslatorTest, FromSQLite_Readonly_IsForbidden) {
    auto err = dbal::ErrorTranslator::fromSQLite(SQLITE_READONLY, "ro", "");
    EXPECT_EQ(err.code(), ErrorCode::Forbidden);
}

TEST(ErrorTranslatorTest, FromSQLite_Corrupt_IsDatabaseError) {
    auto err = dbal::ErrorTranslator::fromSQLite(SQLITE_CORRUPT, "corrupt", "");
    EXPECT_EQ(err.code(), ErrorCode::DatabaseError);
}

TEST(ErrorTranslatorTest, FromSQLite_Unknown_IsInternal) {
    auto err = dbal::ErrorTranslator::fromSQLite(999, "unknown", "");
    EXPECT_EQ(err.code(), ErrorCode::InternalError);
}

TEST(ErrorTranslatorTest, FromSQLite_AppendContext) {
    auto err = dbal::ErrorTranslator::fromSQLite(SQLITE_NOMEM, "oom", "MyOp");
    EXPECT_NE(std::string(err.what()).find("MyOp"), std::string::npos);
}

TEST(ErrorTranslatorTest, FromPostgres_UniqueViolation_IsConflict) {
    auto err = dbal::ErrorTranslator::fromPostgres("23505", "dup key", "");
    EXPECT_EQ(err.code(), ErrorCode::Conflict);
}

TEST(ErrorTranslatorTest, FromPostgres_ForeignKey_IsConflict) {
    auto err = dbal::ErrorTranslator::fromPostgres("23503", "fk", "");
    EXPECT_EQ(err.code(), ErrorCode::Conflict);
}

TEST(ErrorTranslatorTest, FromPostgres_OtherConstraint_IsValidation) {
    auto err = dbal::ErrorTranslator::fromPostgres("23000", "constraint", "");
    EXPECT_EQ(err.code(), ErrorCode::ValidationError);
}

TEST(ErrorTranslatorTest, FromPostgres_InsufficientPriv_IsForbidden) {
    auto err = dbal::ErrorTranslator::fromPostgres("42501", "no priv", "");
    EXPECT_EQ(err.code(), ErrorCode::Forbidden);
}

TEST(ErrorTranslatorTest, FromPostgres_SyntaxError_IsValidation) {
    auto err = dbal::ErrorTranslator::fromPostgres("42000", "syntax", "");
    EXPECT_EQ(err.code(), ErrorCode::ValidationError);
}

TEST(ErrorTranslatorTest, FromPostgres_ConnectionException_IsDatabase) {
    auto err = dbal::ErrorTranslator::fromPostgres("08000", "conn", "");
    EXPECT_EQ(err.code(), ErrorCode::DatabaseError);
}

TEST(ErrorTranslatorTest, FromPostgres_Timeout_IsTimeout) {
    auto err = dbal::ErrorTranslator::fromPostgres("57014", "cancel", "");
    EXPECT_EQ(err.code(), ErrorCode::Timeout);
}

TEST(ErrorTranslatorTest, FromPostgres_Unknown_IsInternal) {
    auto err = dbal::ErrorTranslator::fromPostgres("99999", "?", "");
    EXPECT_EQ(err.code(), ErrorCode::InternalError);
}

TEST(ErrorTranslatorTest, FromMySQL_DupEntry_IsConflict) {
    auto err = dbal::ErrorTranslator::fromMySQL(1062, "dup", "");
    EXPECT_EQ(err.code(), ErrorCode::Conflict);
}

TEST(ErrorTranslatorTest, FromMySQL_NoSuchTable_IsNotFound) {
    auto err = dbal::ErrorTranslator::fromMySQL(1146, "no table", "");
    EXPECT_EQ(err.code(), ErrorCode::NotFound);
}

TEST(ErrorTranslatorTest, FromMySQL_AccessDenied_IsForbidden) {
    auto err = dbal::ErrorTranslator::fromMySQL(1045, "access denied", "");
    EXPECT_EQ(err.code(), ErrorCode::Forbidden);
}

TEST(ErrorTranslatorTest, FromMySQL_Deadlock_IsTimeout) {
    auto err = dbal::ErrorTranslator::fromMySQL(1213, "deadlock", "");
    EXPECT_EQ(err.code(), ErrorCode::Timeout);
}

TEST(ErrorTranslatorTest, FromMySQL_ConnectionError_IsDatabase) {
    auto err = dbal::ErrorTranslator::fromMySQL(2002, "conn", "");
    EXPECT_EQ(err.code(), ErrorCode::DatabaseError);
}

TEST(ErrorTranslatorTest, FromMySQL_Unknown_IsInternal) {
    auto err = dbal::ErrorTranslator::fromMySQL(9999, "?", "");
    EXPECT_EQ(err.code(), ErrorCode::InternalError);
}

TEST(ErrorTranslatorTest, FromMongoDB_DuplicateKey_IsConflict) {
    auto err = dbal::ErrorTranslator::fromMongoDB(11000, "dup", "");
    EXPECT_EQ(err.code(), ErrorCode::Conflict);
}

TEST(ErrorTranslatorTest, FromMongoDB_NamespaceNotFound_IsNotFound) {
    auto err = dbal::ErrorTranslator::fromMongoDB(26, "ns", "");
    EXPECT_EQ(err.code(), ErrorCode::NotFound);
}

TEST(ErrorTranslatorTest, FromMongoDB_Unauthorized_IsUnauthorized) {
    auto err = dbal::ErrorTranslator::fromMongoDB(13, "unauth", "");
    EXPECT_EQ(err.code(), ErrorCode::Unauthorized);
}

TEST(ErrorTranslatorTest, FromMongoDB_Timeout_IsTimeout) {
    auto err = dbal::ErrorTranslator::fromMongoDB(50, "timeout", "");
    EXPECT_EQ(err.code(), ErrorCode::Timeout);
}

TEST(ErrorTranslatorTest, FromMongoDB_NetworkError_IsDatabase) {
    auto err = dbal::ErrorTranslator::fromMongoDB(6, "network", "");
    EXPECT_EQ(err.code(), ErrorCode::DatabaseError);
}

TEST(ErrorTranslatorTest, FromHttpStatus_400_IsValidation) {
    EXPECT_EQ(dbal::ErrorTranslator::fromHttpStatus(400, "").code(), ErrorCode::ValidationError);
}

TEST(ErrorTranslatorTest, FromHttpStatus_401_IsUnauthorized) {
    EXPECT_EQ(dbal::ErrorTranslator::fromHttpStatus(401, "").code(), ErrorCode::Unauthorized);
}

TEST(ErrorTranslatorTest, FromHttpStatus_403_IsForbidden) {
    EXPECT_EQ(dbal::ErrorTranslator::fromHttpStatus(403, "").code(), ErrorCode::Forbidden);
}

TEST(ErrorTranslatorTest, FromHttpStatus_404_IsNotFound) {
    EXPECT_EQ(dbal::ErrorTranslator::fromHttpStatus(404, "").code(), ErrorCode::NotFound);
}

TEST(ErrorTranslatorTest, FromHttpStatus_409_IsConflict) {
    EXPECT_EQ(dbal::ErrorTranslator::fromHttpStatus(409, "").code(), ErrorCode::Conflict);
}

TEST(ErrorTranslatorTest, FromHttpStatus_429_IsRateLimit) {
    EXPECT_EQ(dbal::ErrorTranslator::fromHttpStatus(429, "").code(), ErrorCode::RateLimitExceeded);
}

TEST(ErrorTranslatorTest, FromHttpStatus_503_IsDatabase) {
    EXPECT_EQ(dbal::ErrorTranslator::fromHttpStatus(503, "").code(), ErrorCode::DatabaseError);
}

TEST(ErrorTranslatorTest, FromHttpStatus_504_IsTimeout) {
    EXPECT_EQ(dbal::ErrorTranslator::fromHttpStatus(504, "").code(), ErrorCode::Timeout);
}

TEST(ErrorTranslatorTest, FromHttpStatus_501_IsCapabilityNotSupported) {
    EXPECT_EQ(dbal::ErrorTranslator::fromHttpStatus(501, "").code(), ErrorCode::CapabilityNotSupported);
}

TEST(ErrorTranslatorTest, FromRuntimeError_IsInternal) {
    auto err = dbal::ErrorTranslator::fromRuntimeError(std::runtime_error("boom"), "ctx");
    EXPECT_EQ(err.code(), ErrorCode::InternalError);
    EXPECT_NE(std::string(err.what()).find("ctx"), std::string::npos);
}

// Additional SQLite branches not yet covered
TEST(ErrorTranslatorTest, FromSQLite_NotFound_IsNotFound) {
    auto err = dbal::ErrorTranslator::fromSQLite(SQLITE_NOTFOUND, "not found", "");
    EXPECT_EQ(err.code(), ErrorCode::NotFound);
}

TEST(ErrorTranslatorTest, FromSQLite_Busy_IsDatabaseError) {
    auto err = dbal::ErrorTranslator::fromSQLite(SQLITE_BUSY, "busy", "");
    EXPECT_EQ(err.code(), ErrorCode::DatabaseError);
}

TEST(ErrorTranslatorTest, FromSQLite_CantOpen_IsDatabaseError) {
    auto err = dbal::ErrorTranslator::fromSQLite(SQLITE_CANTOPEN, "cantopen", "");
    EXPECT_EQ(err.code(), ErrorCode::DatabaseError);
}

TEST(ErrorTranslatorTest, FromSQLite_NotADb_IsDatabaseError) {
    auto err = dbal::ErrorTranslator::fromSQLite(SQLITE_NOTADB, "notadb", "");
    EXPECT_EQ(err.code(), ErrorCode::DatabaseError);
}

TEST(ErrorTranslatorTest, FromSQLite_ConstraintUnique_IsConflict) {
    auto err = dbal::ErrorTranslator::fromSQLite(SQLITE_CONSTRAINT_UNIQUE, "dup", "");
    EXPECT_EQ(err.code(), ErrorCode::Conflict);
}

TEST(ErrorTranslatorTest, FromSQLite_ConstraintPrimaryKey_IsConflict) {
    auto err = dbal::ErrorTranslator::fromSQLite(SQLITE_CONSTRAINT_PRIMARYKEY, "pk", "");
    EXPECT_EQ(err.code(), ErrorCode::Conflict);
}

// Additional MySQL branches
TEST(ErrorTranslatorTest, FromMySQL_DupEntryWithKeyName_IsConflict) {
    auto err = dbal::ErrorTranslator::fromMySQL(1586, "dup", "");
    EXPECT_EQ(err.code(), ErrorCode::Conflict);
}

TEST(ErrorTranslatorTest, FromMySQL_TableAccessDenied_IsForbidden) {
    auto err = dbal::ErrorTranslator::fromMySQL(1142, "access", "");
    EXPECT_EQ(err.code(), ErrorCode::Forbidden);
}

TEST(ErrorTranslatorTest, FromMySQL_LockWaitTimeout_IsTimeout) {
    auto err = dbal::ErrorTranslator::fromMySQL(1205, "timeout", "");
    EXPECT_EQ(err.code(), ErrorCode::Timeout);
}

TEST(ErrorTranslatorTest, FromMySQL_ConnHostError_IsDatabase) {
    auto err = dbal::ErrorTranslator::fromMySQL(2003, "conn", "");
    EXPECT_EQ(err.code(), ErrorCode::DatabaseError);
}

TEST(ErrorTranslatorTest, FromMySQL_BadFieldError_IsNotFound) {
    auto err = dbal::ErrorTranslator::fromMySQL(1054, "field", "");
    EXPECT_EQ(err.code(), ErrorCode::NotFound);
}

TEST(ErrorTranslatorTest, FromMySQL_ServerGoneError_IsDatabase) {
    auto err = dbal::ErrorTranslator::fromMySQL(2006, "gone", "");
    EXPECT_EQ(err.code(), ErrorCode::DatabaseError);
}

// Additional MongoDB branches
TEST(ErrorTranslatorTest, FromMongoDB_DuplicateKeyOnUpdate_IsConflict) {
    auto err = dbal::ErrorTranslator::fromMongoDB(11001, "dup", "");
    EXPECT_EQ(err.code(), ErrorCode::Conflict);
}

TEST(ErrorTranslatorTest, FromMongoDB_AuthFailed_IsUnauthorized) {
    auto err = dbal::ErrorTranslator::fromMongoDB(18, "auth", "");
    EXPECT_EQ(err.code(), ErrorCode::Unauthorized);
}

TEST(ErrorTranslatorTest, FromMongoDB_NetworkTimeout_IsDatabase) {
    auto err = dbal::ErrorTranslator::fromMongoDB(89, "timeout", "");
    EXPECT_EQ(err.code(), ErrorCode::DatabaseError);
}

TEST(ErrorTranslatorTest, FromMongoDB_Unknown_IsInternal) {
    auto err = dbal::ErrorTranslator::fromMongoDB(99999, "?", "");
    EXPECT_EQ(err.code(), ErrorCode::InternalError);
}

// Additional HTTP status branches
TEST(ErrorTranslatorTest, FromHttpStatus_422_IsValidationError) {
    EXPECT_EQ(dbal::ErrorTranslator::fromHttpStatus(422, "").code(), ErrorCode::ValidationError);
}

TEST(ErrorTranslatorTest, FromHttpStatus_500_IsInternalError) {
    EXPECT_EQ(dbal::ErrorTranslator::fromHttpStatus(500, "").code(), ErrorCode::InternalError);
}

TEST(ErrorTranslatorTest, FromHttpStatus_418_IsInternal_Default) {
    EXPECT_EQ(dbal::ErrorTranslator::fromHttpStatus(418, "").code(), ErrorCode::InternalError);
}

// ---------------------------------------------------------------------------
// SqlResultParser — uncovered branches (lines 57-58, 67-75 in sql_result_parser.cpp)
// ---------------------------------------------------------------------------

TEST(SqlResultParserTest, ParseValue_RequiredField_EmptyValue_ReturnsString) {
    // Line 57-58: value.empty() && !field.required → nullptr
    // When required=true and value is empty, falls through to type dispatch
    dbal::adapters::EntitySchema schema;
    schema.name = "t";
    dbal::adapters::EntityField f; f.name = "code"; f.type = "string"; f.required = true;
    schema.fields = {f};

    SqlRow row; row.columns["code"] = "";
    auto j = SqlResultParser::rowToJson(row, schema);
    // required + empty string → empty string (not null)
    EXPECT_TRUE(j["code"].is_string());
}

TEST(SqlResultParserTest, ParseValue_IntegerField_InvalidString_ReturnsNull) {
    // Lines 67-68: std::invalid_argument catch → nullptr
    dbal::adapters::EntitySchema schema;
    schema.name = "t";
    dbal::adapters::EntityField f; f.name = "qty"; f.type = "integer"; f.required = false;
    schema.fields = {f};

    SqlRow row; row.columns["qty"] = "not_a_number";
    auto j = SqlResultParser::rowToJson(row, schema);
    EXPECT_TRUE(j["qty"].is_null());
}

TEST(SqlResultParserTest, ParseValue_BigintField_NonEmptyValue_ReturnsInt) {
    // Line 64-66: bigint branch → int64
    dbal::adapters::EntitySchema schema;
    schema.name = "t";
    dbal::adapters::EntityField f; f.name = "size"; f.type = "bigint"; f.required = false;
    schema.fields = {f};

    SqlRow row; row.columns["size"] = "9876543210";
    auto j = SqlResultParser::rowToJson(row, schema);
    EXPECT_EQ(j["size"].get<int64_t>(), 9876543210LL);
}

