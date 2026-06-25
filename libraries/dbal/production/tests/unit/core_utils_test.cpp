/**
 * Unit tests for pure-logic core utility classes (parameterized where repetitive):
 *   - ErrorFormatter       — HTTP status / JSON formatting
 *   - ConnectionValidator  — URL validation and protocol extraction
 *   - ClientConfigManager  — Configuration validation and parameter storage
 *   - ErrorLogger          — Log-level mapping, context formatting, smoke logging
 *   - JsonParser           — JSON file loading and directory scanning
 *   - PrismaFileWriter     — Temp-file writing for Prisma schemas
 *   - OperationExecutor    — Adapter-wrapping executor (construction)
 */

#include <gtest/gtest.h>
#include <nlohmann/json.hpp>
#include <stdexcept>
#include <filesystem>
#include <fstream>

#include "dbal/core/error_formatter.hpp"
#include "dbal/core/connection_validator.hpp"
#include "dbal/core/client_config.hpp"
#include "dbal/core/error_logger.hpp"
#include "dbal/core/loaders/json_parser.hpp"
#include "dbal/core/operation_executor.hpp"
#include "dbal/adapters/adapter.hpp"
#include "core/prisma_file_writer.hpp"
#include "core/prisma_generator.hpp"
#include "config/env_parser.hpp"

using dbal::Error;
using dbal::ErrorCode;
using dbal::ErrorFormatter;
using dbal::ErrorLogger;
using dbal::core::ConnectionValidator;
using dbal::core::ClientConfigManager;
using dbal::core::loaders::JsonParser;
using dbal::core::OperationExecutor;
using Json = nlohmann::json;

// ===========================================================================
// ErrorFormatter — parameterized HTTP status mapping
// ===========================================================================

struct ErrorCodeStatusCase { ErrorCode code; int status; };

class ErrorHttpStatusTest : public testing::TestWithParam<ErrorCodeStatusCase> {};

TEST_P(ErrorHttpStatusTest, MapsToCorrectHttpStatus) {
    auto p = GetParam();
    EXPECT_EQ(ErrorFormatter::toHttpStatus(p.code), p.status);
}

INSTANTIATE_TEST_SUITE_P(AllErrorCodes, ErrorHttpStatusTest, testing::Values(
    ErrorCodeStatusCase{ErrorCode::NotFound,               404},
    ErrorCodeStatusCase{ErrorCode::Conflict,               409},
    ErrorCodeStatusCase{ErrorCode::Unauthorized,           401},
    ErrorCodeStatusCase{ErrorCode::Forbidden,              403},
    ErrorCodeStatusCase{ErrorCode::ValidationError,        422},
    ErrorCodeStatusCase{ErrorCode::RateLimitExceeded,      429},
    ErrorCodeStatusCase{ErrorCode::InternalError,          500},
    ErrorCodeStatusCase{ErrorCode::Timeout,                504},
    ErrorCodeStatusCase{ErrorCode::DatabaseError,          503},
    ErrorCodeStatusCase{ErrorCode::CapabilityNotSupported, 501}
));

TEST(ErrorFormatterTest, ToHttpStatus_FromError_DelegatesToErrorCode) {
    EXPECT_EQ(ErrorFormatter::toHttpStatus(Error::notFound("x")), 404);
}

TEST(ErrorFormatterTest, ToJson_ContainsErrorKey) {
    EXPECT_TRUE(ErrorFormatter::toJson(Error::notFound("user"), true).contains("error"));
}

TEST(ErrorFormatterTest, ToJson_StatusCodeMatches) {
    EXPECT_EQ(ErrorFormatter::toJson(Error::notFound("x"), true)["error"]["code"].get<int>(), 404);
}

TEST(ErrorFormatterTest, ToJson_MessagePresent) {
    EXPECT_FALSE(ErrorFormatter::toJson(Error::notFound("user"), true)["error"]["message"]
                     .get<std::string>().empty());
}

TEST(ErrorFormatterTest, ToJsonString_NotEmpty) {
    auto s = ErrorFormatter::toJsonString(Error::internal("boom"), false, true);
    EXPECT_FALSE(s.empty());
    EXPECT_NE(s.find("{"), std::string::npos);
}

TEST(ErrorFormatterTest, ToJsonString_Pretty_HasNewlines) {
    EXPECT_NE(ErrorFormatter::toJsonString(Error::notFound("x"), true, true).find("\n"),
              std::string::npos);
}

// ErrorFormatter — parameterized error type name mapping
struct ErrorTypeNameCase { ErrorCode code; std::string name; };

class ErrorTypeNameTest : public testing::TestWithParam<ErrorTypeNameCase> {};

TEST_P(ErrorTypeNameTest, GetErrorTypeNameReturnsExpected) {
    auto p = GetParam();
    EXPECT_EQ(ErrorFormatter::getErrorTypeName(p.code), p.name);
}

INSTANTIATE_TEST_SUITE_P(AllErrorTypeNames, ErrorTypeNameTest, testing::Values(
    ErrorTypeNameCase{ErrorCode::NotFound,        "NotFound"},
    ErrorTypeNameCase{ErrorCode::ValidationError, "ValidationError"},
    ErrorTypeNameCase{ErrorCode::InternalError,   "InternalError"},
    ErrorTypeNameCase{ErrorCode::Unauthorized,    "Unauthorized"},
    ErrorTypeNameCase{ErrorCode::Forbidden,       "Forbidden"},
    ErrorTypeNameCase{ErrorCode::DatabaseError,   "DatabaseError"},
    ErrorTypeNameCase{ErrorCode::Timeout,         "Timeout"},
    ErrorTypeNameCase{ErrorCode::Conflict,        "Conflict"}
));

// ===========================================================================
// ConnectionValidator — parameterized URL validation
// ===========================================================================

struct UrlValidCase { std::string url; bool valid; std::string adapter; };

class ConnectionValidateTest : public testing::TestWithParam<UrlValidCase> {};

TEST_P(ConnectionValidateTest, ValidateReturnsExpectedResult) {
    auto p = GetParam();
    auto result = ConnectionValidator::validate(p.url);
    EXPECT_EQ(result.is_valid, p.valid);
    if (p.valid && !p.adapter.empty()) EXPECT_EQ(result.adapter_type, p.adapter);
    if (!p.valid) EXPECT_FALSE(result.error_message.empty());
}

INSTANTIATE_TEST_SUITE_P(UrlCases, ConnectionValidateTest, testing::Values(
    UrlValidCase{"sqlite://:memory:",                           true,  "sqlite"},
    UrlValidCase{"sqlite:///tmp/test.db",                      true,  "sqlite"},
    UrlValidCase{"postgresql://user:pass@localhost:5432/mydb", true,  "postgres"},
    UrlValidCase{"mysql://user:pass@localhost:3306/mydb",      true,  "mysql"},
    UrlValidCase{"foobar://host/db",                           false, ""},
    UrlValidCase{"",                                           false, ""}
));

TEST(ConnectionValidatorTest, HasValidFormat_WithProtocol_True) {
    EXPECT_TRUE(ConnectionValidator::hasValidFormat("sqlite://db.sqlite"));
    EXPECT_TRUE(ConnectionValidator::hasValidFormat("postgresql://host/db"));
}

TEST(ConnectionValidatorTest, HasValidFormat_NoProtocol_False) {
    EXPECT_FALSE(ConnectionValidator::hasValidFormat("no-colon-slash-slash"));
    EXPECT_FALSE(ConnectionValidator::hasValidFormat(""));
}

struct ExtractProtocolCase { std::string url; std::string proto; };

class ExtractProtocolTest : public testing::TestWithParam<ExtractProtocolCase> {};

TEST_P(ExtractProtocolTest, ExtractsLowercaseProtocol) {
    auto p = GetParam();
    EXPECT_EQ(ConnectionValidator::extractProtocol(p.url), p.proto);
}

INSTANTIATE_TEST_SUITE_P(Protocols, ExtractProtocolTest, testing::Values(
    ExtractProtocolCase{"SQLite://db",       "sqlite"},
    ExtractProtocolCase{"POSTGRESQL://host", "postgresql"},
    ExtractProtocolCase{"MySQL://host",      "mysql"},
    ExtractProtocolCase{"nodatabase",        ""}
));

TEST(ConnectionValidatorTest, ValidateSQLite_Memory_Valid) {
    EXPECT_TRUE(ConnectionValidator::validateSQLite("sqlite://:memory:").is_valid);
}

TEST(ConnectionValidatorTest, ValidatePostgreSQL_Valid) {
    EXPECT_TRUE(ConnectionValidator::validatePostgreSQL(
        "postgresql://user:pass@localhost:5432/db").is_valid);
}

TEST(ConnectionValidatorTest, ValidateMySQL_Valid) {
    EXPECT_TRUE(ConnectionValidator::validateMySQL("mysql://user@localhost:3306/mydb").is_valid);
}

TEST(ConnectionValidatorTest, ValidationResult_SuccessFactory) {
    auto r = dbal::core::ValidationResult::success("sqlite", "sqlite://x");
    EXPECT_TRUE(r.is_valid);
    EXPECT_EQ(r.adapter_type, "sqlite");
    EXPECT_TRUE(r.error_message.empty());
}

TEST(ConnectionValidatorTest, ValidationResult_FailureFactory) {
    auto r = dbal::core::ValidationResult::failure("bad url");
    EXPECT_FALSE(r.is_valid);
    EXPECT_EQ(r.error_message, "bad url");
}

// ===========================================================================
// ClientConfigManager
// ===========================================================================

TEST(ClientConfigManagerTest, ValidConstruction_Dev_SQLite) {
    EXPECT_NO_THROW(ClientConfigManager("dev", "sqlite", "", "sqlite://:memory:", false));
}

TEST(ClientConfigManagerTest, ValidConstruction_Prod_Postgres) {
    EXPECT_NO_THROW(ClientConfigManager("prod", "postgres", "",
                                        "postgresql://user:pass@localhost/db", true));
}

struct InvalidConfigCase { std::string mode; std::string adapter; std::string url; };

class ClientConfigInvalidTest : public testing::TestWithParam<InvalidConfigCase> {};

TEST_P(ClientConfigInvalidTest, ThrowsOnInvalidInput) {
    auto p = GetParam();
    EXPECT_THROW(ClientConfigManager(p.mode, p.adapter, "", p.url, false), std::invalid_argument);
}

INSTANTIATE_TEST_SUITE_P(InvalidConfigs, ClientConfigInvalidTest, testing::Values(
    InvalidConfigCase{"invalid", "sqlite", "sqlite://:memory:"},
    InvalidConfigCase{"dev",     "sqlite", ""}
));

TEST(ClientConfigManagerTest, GetAdapter_ReturnsSqlite) {
    EXPECT_EQ(ClientConfigManager("dev","sqlite","","sqlite://:memory:",false).getAdapter(), "sqlite");
}

TEST(ClientConfigManagerTest, GetDatabaseUrl_Stored) {
    EXPECT_EQ(ClientConfigManager("dev","sqlite","","sqlite://:memory:",false).getDatabaseUrl(),
              "sqlite://:memory:");
}

TEST(ClientConfigManagerTest, GetEndpoint_ReturnsStored) {
    EXPECT_EQ(ClientConfigManager("dev","sqlite","http://localhost:8080","sqlite://:memory:",false)
                  .getEndpoint(), "http://localhost:8080");
}

TEST(ClientConfigManagerTest, IsSandboxEnabled_ReflectsFlag) {
    EXPECT_TRUE(ClientConfigManager("dev","sqlite","","sqlite://:memory:",true).isSandboxEnabled());
    EXPECT_FALSE(ClientConfigManager("dev","sqlite","","sqlite://:memory:",false).isSandboxEnabled());
}

TEST(ClientConfigManagerTest, SetGetHasParameter) {
    ClientConfigManager mgr("dev","sqlite","","sqlite://:memory:",false);
    EXPECT_FALSE(mgr.hasParameter("timeout"));
    mgr.setParameter("timeout", "30");
    EXPECT_TRUE(mgr.hasParameter("timeout"));
    EXPECT_EQ(mgr.getParameter("timeout"), "30");
    EXPECT_EQ(mgr.getParameter("nonexistent"), "");
}

TEST(ClientConfigManagerTest, GetParameters_ReturnsAllSet) {
    ClientConfigManager mgr("dev","sqlite","","sqlite://:memory:",false);
    mgr.setParameter("a","1"); mgr.setParameter("b","2");
    EXPECT_EQ(mgr.getParameters().size(), 2u);
}

TEST(ClientConfigManagerTest, Validate_ValidConfig_NoThrow) {
    EXPECT_NO_THROW(ClientConfigManager("dev","sqlite","","sqlite://:memory:",false).validate());
}

TEST(ClientConfigManagerTest, EmptyMode_IsValid_NoThrow) {
    // Line 50: empty mode → early return, no throw
    EXPECT_NO_THROW(ClientConfigManager("", "sqlite", "", "sqlite://:memory:", false));
}

TEST(ClientConfigManagerTest, EmptyAdapter_Throws) {
    // Line 68: empty adapter → throws invalid_argument
    EXPECT_THROW(ClientConfigManager("dev", "", "", "sqlite://:memory:", false),
                 std::invalid_argument);
}

TEST(ClientConfigManagerTest, InvalidUrlFormat_Throws) {
    // Line 82: non-empty but malformed URL fails ConnectionValidator::validate()
    EXPECT_THROW(ClientConfigManager("dev", "sqlite", "", "not-a-url", false),
                 std::invalid_argument);
}

TEST(ClientConfigManagerTest, AdapterUrlMismatch_Throws) {
    // Lines 91-92: adapter type doesn't match URL protocol (not a pg alias pair)
    EXPECT_THROW(ClientConfigManager("dev", "mysql", "", "sqlite://:memory:", false),
                 std::invalid_argument);
}

// ===========================================================================
// ErrorLogger — parameterized log-level mapping + smoke logging
// ===========================================================================

struct LogLevelCase { ErrorCode code; spdlog::level::level_enum expected; };

class ErrorLogLevelTest : public testing::TestWithParam<LogLevelCase> {};

TEST_P(ErrorLogLevelTest, GetLogLevelReturnsExpected) {
    auto p = GetParam();
    EXPECT_EQ(ErrorLogger::getLogLevel(p.code), p.expected);
}

INSTANTIATE_TEST_SUITE_P(AllLogLevels, ErrorLogLevelTest, testing::Values(
    LogLevelCase{ErrorCode::InternalError,          spdlog::level::critical},
    LogLevelCase{ErrorCode::DatabaseError,          spdlog::level::critical},
    LogLevelCase{ErrorCode::MaliciousCodeDetected,  spdlog::level::critical},
    LogLevelCase{ErrorCode::Timeout,                spdlog::level::err},
    LogLevelCase{ErrorCode::SandboxViolation,       spdlog::level::err},
    LogLevelCase{ErrorCode::NotFound,               spdlog::level::warn},
    LogLevelCase{ErrorCode::Conflict,               spdlog::level::warn},
    LogLevelCase{ErrorCode::ValidationError,        spdlog::level::warn},
    LogLevelCase{ErrorCode::RateLimitExceeded,      spdlog::level::warn},
    LogLevelCase{ErrorCode::CapabilityNotSupported, spdlog::level::warn},
    LogLevelCase{ErrorCode::Unauthorized,           spdlog::level::warn},
    LogLevelCase{ErrorCode::Forbidden,              spdlog::level::warn}
));

TEST(ErrorLoggerTest, FormatContext_Empty_ReturnsEmpty) {
    EXPECT_TRUE(ErrorLogger::formatContext({}).empty());
}

TEST(ErrorLoggerTest, FormatContext_SingleKey_ContainsKV) {
    auto s = ErrorLogger::formatContext({{"userId","123"}});
    EXPECT_NE(s.find("userId"), std::string::npos);
    EXPECT_NE(s.find("123"), std::string::npos);
}

TEST(ErrorLoggerTest, FormatContext_MultipleKeys_CommaSeparated) {
    auto s = ErrorLogger::formatContext({{"a","1"},{"b","2"}});
    EXPECT_NE(s.find(","), std::string::npos);
}

TEST(ErrorLoggerTest, Log_WithContextAndOperation_NoThrow) {
    EXPECT_NO_THROW(ErrorLogger::log(Error::notFound("x"), "testOp", {{"key","val"}}));
}

TEST(ErrorLoggerTest, Log_WithEmptyContext_NoThrow) {
    EXPECT_NO_THROW(ErrorLogger::log(Error::notFound("x"), "testOp"));
}

TEST(ErrorLoggerTest, Log_Minimal_NoThrow) {
    EXPECT_NO_THROW(ErrorLogger::log(Error::internal("boom")));
}

TEST(ErrorLoggerTest, LogException_WithContext_NoThrow) {
    std::runtime_error ex("test");
    EXPECT_NO_THROW(ErrorLogger::logException(ex, "testOp", {{"entity","User"}}));
}

TEST(ErrorLoggerTest, LogException_EmptyContext_NoThrow) {
    std::runtime_error ex("test");
    EXPECT_NO_THROW(ErrorLogger::logException(ex, "testOp"));
}

// ===========================================================================
// JsonParser — file loading and directory scanning
// ===========================================================================

TEST(JsonParserTest, FileExists_NonExistent_ReturnsFalse) {
    JsonParser parser;
    EXPECT_FALSE(parser.fileExists("/nonexistent/path/file.json"));
}

TEST(JsonParserTest, FileExists_ExistingFile_ReturnsTrue) {
    JsonParser parser;
    auto tmp = std::filesystem::temp_directory_path() / "dbal_test_exists.json";
    std::ofstream(tmp) << "{}";
    EXPECT_TRUE(parser.fileExists(tmp.string()));
    std::filesystem::remove(tmp);
}

TEST(JsonParserTest, LoadFile_NonExistent_Throws) {
    JsonParser parser;
    EXPECT_THROW(parser.loadFile("/nonexistent/file.json"), std::runtime_error);
}

TEST(JsonParserTest, LoadFile_ValidJson_ReturnsObject) {
    JsonParser parser;
    auto tmp = std::filesystem::temp_directory_path() / "dbal_test_load.json";
    std::ofstream(tmp) << R"({"key":"value"})";
    auto j = parser.loadFile(tmp.string());
    EXPECT_EQ(j["key"], "value");
    std::filesystem::remove(tmp);
}

TEST(JsonParserTest, LoadFile_InvalidJson_Throws) {
    JsonParser parser;
    auto tmp = std::filesystem::temp_directory_path() / "dbal_test_bad.json";
    std::ofstream(tmp) << "{ not valid json }}}";
    EXPECT_THROW(parser.loadFile(tmp.string()), std::runtime_error);
    std::filesystem::remove(tmp);
}

TEST(JsonParserTest, FindJsonFiles_NonExistentDir_ReturnsEmpty) {
    JsonParser parser;
    EXPECT_TRUE(parser.findJsonFiles("/nonexistent/dir").empty());
}

TEST(JsonParserTest, FindJsonFiles_EmptyDir_ReturnsEmpty) {
    JsonParser parser;
    auto dir = std::filesystem::temp_directory_path() / "dbal_empty_scan";
    std::filesystem::create_directories(dir);
    EXPECT_TRUE(parser.findJsonFiles(dir.string()).empty());
    std::filesystem::remove_all(dir);
}

TEST(JsonParserTest, FindJsonFiles_SkipsEntitiesJson_AndNonJson) {
    JsonParser parser;
    auto dir = std::filesystem::temp_directory_path() / "dbal_json_scan";
    std::filesystem::create_directories(dir);
    std::ofstream(dir / "one.json") << "{}";
    std::ofstream(dir / "two.json") << "{}";
    std::ofstream(dir / "entities.json") << "{}";  // excluded
    std::ofstream(dir / "readme.txt") << "skip";   // excluded
    auto files = parser.findJsonFiles(dir.string());
    EXPECT_EQ(files.size(), 2u);
    std::filesystem::remove_all(dir);
}

// ===========================================================================
// PrismaFileWriter — temp-file generation
// ===========================================================================

TEST(PrismaFileWriterTest, GetTempDir_ReturnsExistingDir) {
    auto dir = dbal::core::PrismaFileWriter::getTempDir();
    EXPECT_TRUE(std::filesystem::exists(dir));
    EXPECT_TRUE(std::filesystem::is_directory(dir));
}

TEST(PrismaFileWriterTest, WriteToTempFile_CreatesFile) {
    auto path = dbal::core::PrismaFileWriter::writeToTempFile("// test schema");
    EXPECT_TRUE(std::filesystem::exists(path));
    std::ifstream f(path);
    std::string content((std::istreambuf_iterator<char>(f)),
                         std::istreambuf_iterator<char>());
    EXPECT_NE(content.find("// test schema"), std::string::npos);
}

TEST(PrismaFileWriterTest, WriteToTempFile_IsSchemaPrismaFile) {
    auto path = dbal::core::PrismaFileWriter::writeToTempFile("datasource db {}");
    EXPECT_EQ(path.filename().string(), "schema.prisma");
}

// ===========================================================================
// OperationExecutor — construction smoke test
// ===========================================================================

TEST(OperationExecutorTest, ConstructWithNullAdapter_NoThrow) {
    EXPECT_NO_THROW(OperationExecutor exec(nullptr));
}

// ===========================================================================
// Error factory methods — sandboxViolation and maliciousCode (errors.cpp coverage)
// ===========================================================================

TEST(ErrorFactoryTest, SandboxViolation_HasCorrectCode) {
    auto e = dbal::Error::sandboxViolation("script tried to escape");
    EXPECT_EQ(e.code(), dbal::ErrorCode::SandboxViolation);
}

TEST(ErrorFactoryTest, MaliciousCode_HasCorrectCode) {
    auto e = dbal::Error::maliciousCode("injection detected");
    EXPECT_EQ(e.code(), dbal::ErrorCode::MaliciousCodeDetected);
}

// ===========================================================================
// ErrorFormatter — remaining type name branches
// ===========================================================================

TEST(ErrorFormatterTest, GetErrorTypeName_SandboxViolation) {
    EXPECT_EQ(ErrorFormatter::getErrorTypeName(ErrorCode::SandboxViolation), "SandboxViolation");
}

TEST(ErrorFormatterTest, GetErrorTypeName_MaliciousCodeDetected) {
    EXPECT_EQ(ErrorFormatter::getErrorTypeName(ErrorCode::MaliciousCodeDetected), "MaliciousCodeDetected");
}

TEST(ErrorFormatterTest, GetErrorTypeName_RateLimitExceeded) {
    EXPECT_EQ(ErrorFormatter::getErrorTypeName(ErrorCode::RateLimitExceeded), "RateLimitExceeded");
}

TEST(ErrorFormatterTest, GetErrorTypeName_CapabilityNotSupported) {
    EXPECT_EQ(ErrorFormatter::getErrorTypeName(ErrorCode::CapabilityNotSupported), "CapabilityNotSupported");
}

TEST(ErrorFormatterTest, ToJson_NoDetails_NoMessageKey) {
    auto j = ErrorFormatter::toJson(Error::notFound("x"), false);
    EXPECT_FALSE(j["error"].contains("message"));
}

// ===========================================================================
// ConnectionValidator — uncovered branches
// ===========================================================================

TEST(ConnectionValidatorTest, ValidateMySQL_InvalidFormat_Fails) {
    EXPECT_FALSE(ConnectionValidator::validateMySQL("mysql://").is_valid);
}

TEST(ConnectionValidatorTest, ValidatePostgreSQL_InvalidFormat_Fails) {
    EXPECT_FALSE(ConnectionValidator::validatePostgreSQL("not-a-url").is_valid);
}

TEST(ConnectionValidatorTest, ValidateSQLite_EmptyPath_Fails) {
    // sqlite:// with no path
    EXPECT_FALSE(ConnectionValidator::validateSQLite("sqlite://").is_valid);
}

TEST(ConnectionValidatorTest, Validate_UnsupportedProtocol_Fails) {
    auto r = ConnectionValidator::validate("redis://localhost:6379/0");
    EXPECT_FALSE(r.is_valid);
    EXPECT_NE(r.error_message.find("Unsupported"), std::string::npos);
}

// ===========================================================================
// PrismaGenerator — writeToTempFile and getTempDir via PrismaGenerator wrapper
// ===========================================================================

TEST(PrismaGeneratorTest, WriteToTempFile_CreatesFile) {
    dbal::core::PrismaGenerator gen;
    auto path = gen.writeToTempFile("// test");
    EXPECT_TRUE(std::filesystem::exists(path));
}

TEST(PrismaGeneratorTest, GetTempDir_ReturnsDir) {
    dbal::core::PrismaGenerator gen;
    EXPECT_TRUE(std::filesystem::is_directory(gen.getTempDir()));
}

// ===========================================================================
// ConnectionValidator — uncovered branches (lines 36, 53 in connection_validator.cpp)
// ===========================================================================

TEST(ConnectionValidatorTest, ValidateSQLite_NoColonSlash_Fails) {
    // Calls validateSQLite directly with a URL missing "://"
    // → hits line 36: "Invalid SQLite URL format"
    EXPECT_FALSE(ConnectionValidator::validateSQLite("sqlite_no_colon_slash").is_valid);
}

TEST(ConnectionValidatorTest, ValidateSQLite_PathWithNullChar_Fails) {
    // Path with embedded null character → isValidPath returns false → line 53
    const char raw[] = {'s','q','l','i','t','e',':','/','/','g','o','o','d','\0','b','a','d'};
    std::string url(raw, sizeof(raw));
    auto result = ConnectionValidator::validateSQLite(url);
    EXPECT_FALSE(result.is_valid);
}

// ===========================================================================
// JsonParser — fileExists with directory path (line 45 short-circuit branch)
// ===========================================================================

TEST(JsonParserTest, FileExists_DirectoryPath_ReturnsFalse) {
    // fs::exists() returns true but fs::is_regular_file() returns false (it's a dir)
    JsonParser parser;
    auto dir = std::filesystem::temp_directory_path() / "dbal_test_isdir";
    std::filesystem::create_directories(dir);
    EXPECT_FALSE(parser.fileExists(dir.string()));
    std::filesystem::remove_all(dir);
}

// ===========================================================================
// PrismaFileWriter — getTempDir creates directory when it doesn't exist (lines 28-29)
// ===========================================================================

TEST(PrismaFileWriterTest, GetTempDir_CreatesWhenMissing) {
    // Remove the temp dir, then call getTempDir — exercises create_directories branch
    auto dir = dbal::core::PrismaFileWriter::getTempDir();
    std::filesystem::remove_all(dir);  // delete it
    EXPECT_FALSE(std::filesystem::exists(dir));
    auto dir2 = dbal::core::PrismaFileWriter::getTempDir();  // should recreate
    EXPECT_TRUE(std::filesystem::exists(dir2));
    EXPECT_TRUE(std::filesystem::is_directory(dir2));
}

// ===========================================================================
// EnvParser — error paths (env_parser.hpp lines 22-23, 51-56)
// ===========================================================================

using dbal::config::EnvParser;

/** Covers env_parser.hpp:22-23 — getRequired() throws when env var is not set */
TEST(EnvParserTest, GetRequired_MissingVar_Throws) {
    // Use a name that is guaranteed not to be set in any test env
    EXPECT_THROW(EnvParser::getRequired("DBAL_UNIT_TEST_MISSING_VAR_XYZ_123456"),
                 std::runtime_error);
}

/** Covers env_parser.hpp:22-23 — getRequired() throws even for empty-string var */
TEST(EnvParserTest, GetRequired_EmptyVar_Throws) {
    setenv("DBAL_UNIT_TEST_EMPTY_VAR", "", 1);
    EXPECT_THROW(EnvParser::getRequired("DBAL_UNIT_TEST_EMPTY_VAR"), std::runtime_error);
    unsetenv("DBAL_UNIT_TEST_EMPTY_VAR");
}

/** Covers env_parser.hpp:51-53 — getInt() invalid_argument catch branch */
TEST(EnvParserTest, GetInt_InvalidValue_ReturnsDefault) {
    setenv("DBAL_UNIT_TEST_INT_VAR", "not_a_number", 1);
    int result = EnvParser::getInt("DBAL_UNIT_TEST_INT_VAR", 42);
    EXPECT_EQ(result, 42);
    unsetenv("DBAL_UNIT_TEST_INT_VAR");
}

/** Covers env_parser.hpp:54-56 — getInt() out_of_range catch branch */
TEST(EnvParserTest, GetInt_OutOfRange_ReturnsDefault) {
    setenv("DBAL_UNIT_TEST_INT_VAR", "999999999999999999999", 1);
    int result = EnvParser::getInt("DBAL_UNIT_TEST_INT_VAR", 7);
    EXPECT_EQ(result, 7);
    unsetenv("DBAL_UNIT_TEST_INT_VAR");
}
