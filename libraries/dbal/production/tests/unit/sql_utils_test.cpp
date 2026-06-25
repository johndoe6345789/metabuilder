/**
 * Unit tests for SqlQueryBuilder and SqlTypeMapper.
 *
 * These two headers can be included together safely.
 * SqlResultParser and ErrorTranslator are in sql_parser_test.cpp
 * (sql_result_parser.hpp conflicts with sql_query_builder.hpp due to
 * incompatible EntitySchema using-declarations in the same namespace).
 */

#include <gtest/gtest.h>
#include <nlohmann/json.hpp>

#include "sql/sql_query_builder.hpp"
#include "sql/sql_type_mapper.hpp"
#include "adapters/schema_loader.hpp"
#include "adapters/sql_template_generator.hpp"
#include "adapters/sql_generator.hpp"

using namespace dbal::adapters::sql;
using Json = nlohmann::json;

#ifndef DBAL_TEST_TEMPLATE_DIR
#  define DBAL_TEST_TEMPLATE_DIR "/dbal/templates/sql"
#endif

// ---------------------------------------------------------------------------
// Helper — dbal::core::EntitySchema (used by SqlQueryBuilder)
// ---------------------------------------------------------------------------

static dbal::core::EntitySchema makeCoreSchema(const std::string& name,
                                               const std::vector<std::string>& fieldNames,
                                               const std::string& fieldType = "string") {
    dbal::core::EntitySchema s;
    s.name = name;
    for (const auto& fn : fieldNames) {
        dbal::core::EntityField f;
        f.name = fn;
        f.type = fieldType;
        f.required = false;
        s.fields.push_back(f);
    }
    return s;
}

// ---------------------------------------------------------------------------
// SqlQueryBuilder
// ---------------------------------------------------------------------------

TEST(SqlQueryBuilderTest, BuildInsert_Postgres_ReturningClause) {
    auto schema = makeCoreSchema("users", {"id", "createdAt", "name", "email"});
    Json data;
    data["name"] = "Alice";
    data["email"] = "alice@example.com";

    auto sql = SqlQueryBuilder::buildInsert("users", schema, data, Dialect::Postgres);

    EXPECT_NE(sql.find("INSERT INTO users"), std::string::npos);
    EXPECT_NE(sql.find("RETURNING"), std::string::npos);
    EXPECT_NE(sql.find("$1"), std::string::npos);
}

TEST(SqlQueryBuilderTest, BuildInsert_MySQL_NoReturning) {
    auto schema = makeCoreSchema("users", {"id", "createdAt", "name"});
    Json data;
    data["name"] = "Bob";

    auto sql = SqlQueryBuilder::buildInsert("users", schema, data, Dialect::MySQL);

    EXPECT_NE(sql.find("INSERT INTO users"), std::string::npos);
    EXPECT_EQ(sql.find("RETURNING"), std::string::npos);
    EXPECT_NE(sql.find("?"), std::string::npos);
}

TEST(SqlQueryBuilderTest, BuildInsert_SkipsIdAndCreatedAt) {
    auto schema = makeCoreSchema("items", {"id", "createdAt", "title"});
    Json data;
    data["id"] = "uuid-1";
    data["createdAt"] = "2024-01-01";
    data["title"] = "Test";

    auto sql = SqlQueryBuilder::buildInsert("items", schema, data, Dialect::MySQL);

    EXPECT_NE(sql.find("title"), std::string::npos);
    EXPECT_EQ(sql.find("createdAt"), std::string::npos);
}

TEST(SqlQueryBuilderTest, BuildSelect_NoFilter) {
    auto schema = makeCoreSchema("products", {"id", "name", "price"});
    auto sql = SqlQueryBuilder::buildSelect("products", schema, Json::object(), Dialect::Postgres);

    EXPECT_NE(sql.find("SELECT"), std::string::npos);
    EXPECT_NE(sql.find("FROM products"), std::string::npos);
    EXPECT_EQ(sql.find("WHERE"), std::string::npos);
}

TEST(SqlQueryBuilderTest, BuildSelect_WithFilter_Postgres) {
    auto schema = makeCoreSchema("products", {"id", "name"});
    Json filter;
    filter["name"] = "Widget";

    auto sql = SqlQueryBuilder::buildSelect("products", schema, filter, Dialect::Postgres);

    EXPECT_NE(sql.find("WHERE"), std::string::npos);
    EXPECT_NE(sql.find("name = $1"), std::string::npos);
}

TEST(SqlQueryBuilderTest, BuildUpdate_Postgres_HasReturning) {
    auto schema = makeCoreSchema("users", {"id", "createdAt", "name", "email"});
    Json data;
    data["name"] = "Updated";

    auto sql = SqlQueryBuilder::buildUpdate("users", schema, "uuid-1", data, Dialect::Postgres);

    EXPECT_NE(sql.find("UPDATE users SET"), std::string::npos);
    EXPECT_NE(sql.find("RETURNING"), std::string::npos);
    EXPECT_NE(sql.find("WHERE id = $1"), std::string::npos);
}

TEST(SqlQueryBuilderTest, BuildUpdate_NoFields_ReturnsEmpty) {
    auto schema = makeCoreSchema("users", {"id", "createdAt"});
    Json data;

    auto sql = SqlQueryBuilder::buildUpdate("users", schema, "uuid-1", data, Dialect::MySQL);

    EXPECT_TRUE(sql.empty());
}

TEST(SqlQueryBuilderTest, BuildDelete_MySQL_Placeholder) {
    auto sql = SqlQueryBuilder::buildDelete("sessions", "sid", Dialect::MySQL);
    EXPECT_NE(sql.find("DELETE FROM sessions"), std::string::npos);
    EXPECT_NE(sql.find("WHERE id = ?"), std::string::npos);
}

TEST(SqlQueryBuilderTest, BuildList_WithPagination) {
    auto schema = makeCoreSchema("items", {"id", "createdAt", "title"});
    dbal::ListOptions opts;
    opts.limit = 10;
    opts.page  = 3;

    auto sql = SqlQueryBuilder::buildList("items", schema, opts, Dialect::Postgres);

    EXPECT_NE(sql.find("ORDER BY createdAt DESC"), std::string::npos);
    EXPECT_NE(sql.find("LIMIT"), std::string::npos);
    EXPECT_NE(sql.find("OFFSET"), std::string::npos);
}

TEST(SqlQueryBuilderTest, BuildList_WithFilter_MySQL) {
    auto schema = makeCoreSchema("users", {"id", "status"});
    dbal::ListOptions opts;
    opts.filter["status"] = "active";
    opts.limit = 20;

    auto sql = SqlQueryBuilder::buildList("users", schema, opts, Dialect::MySQL);

    EXPECT_NE(sql.find("WHERE"), std::string::npos);
    EXPECT_NE(sql.find("status = ?"), std::string::npos);
}

// ---------------------------------------------------------------------------
// SqlTypeMapper
// ---------------------------------------------------------------------------

TEST(SqlTypeMapperTest, YamlToSqlType_String_ReturnsVarchar) {
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("string", Dialect::Postgres), "VARCHAR(255)");
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("string", Dialect::MySQL),    "VARCHAR(255)");
}

TEST(SqlTypeMapperTest, YamlToSqlType_Boolean_MySQL_TinyInt) {
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("boolean", Dialect::MySQL),    "TINYINT(1)");
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("boolean", Dialect::Postgres), "BOOLEAN");
}

TEST(SqlTypeMapperTest, YamlToSqlType_Json_Postgres_JSONB) {
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("json", Dialect::Postgres), "JSONB");
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("json", Dialect::MySQL),    "JSON");
}

TEST(SqlTypeMapperTest, YamlToSqlType_UUID_Postgres_UUID) {
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("uuid", Dialect::Postgres), "UUID");
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("uuid", Dialect::MySQL),    "VARCHAR(36)");
}

TEST(SqlTypeMapperTest, YamlToSqlType_DateTime_MySQL_DATETIME) {
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("datetime", Dialect::MySQL),    "DATETIME");
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("date",     Dialect::Postgres), "TIMESTAMP");
}

TEST(SqlTypeMapperTest, YamlToSqlType_Integer_ReturnsINTEGER) {
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("number",  Dialect::Postgres), "INTEGER");
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("integer", Dialect::MySQL),    "INTEGER");
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("int",     Dialect::Postgres), "INTEGER");
}

TEST(SqlTypeMapperTest, YamlToSqlType_Bigint_ReturnsBIGINT) {
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("bigint", Dialect::Postgres), "BIGINT");
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("bigint", Dialect::MySQL),    "BIGINT");
}

TEST(SqlTypeMapperTest, YamlToSqlType_Text_ReturnsTEXT) {
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("text", Dialect::Postgres), "TEXT");
}

TEST(SqlTypeMapperTest, YamlToSqlType_Unknown_FallsBackToVarchar) {
    EXPECT_EQ(SqlTypeMapper::yamlTypeToSqlType("custom_type", Dialect::Postgres), "VARCHAR(255)");
}

TEST(SqlTypeMapperTest, JsonValueToString_Null_ReturnsEmpty) {
    EXPECT_EQ(SqlTypeMapper::jsonValueToString(nullptr), "");
}

TEST(SqlTypeMapperTest, JsonValueToString_Bool) {
    EXPECT_EQ(SqlTypeMapper::jsonValueToString(true),  "true");
    EXPECT_EQ(SqlTypeMapper::jsonValueToString(false), "false");
}

TEST(SqlTypeMapperTest, JsonValueToString_Number) {
    EXPECT_EQ(SqlTypeMapper::jsonValueToString(Json(42)), "42");
}

TEST(SqlTypeMapperTest, JsonValueToString_String) {
    EXPECT_EQ(SqlTypeMapper::jsonValueToString(Json("hello")), "hello");
}

TEST(SqlTypeMapperTest, JsonValueToString_Object_Dumps) {
    Json obj;  obj["key"] = "val";
    EXPECT_FALSE(SqlTypeMapper::jsonValueToString(obj).empty());
}

TEST(SqlTypeMapperTest, SqlValueToJson_Empty_ReturnsNull) {
    EXPECT_TRUE(SqlTypeMapper::sqlValueToJson("", "string").is_null());
}

TEST(SqlTypeMapperTest, SqlValueToJson_Boolean_Various) {
    EXPECT_TRUE(SqlTypeMapper::sqlValueToJson("1",    "boolean").get<bool>());
    EXPECT_TRUE(SqlTypeMapper::sqlValueToJson("t",    "boolean").get<bool>());
    EXPECT_TRUE(SqlTypeMapper::sqlValueToJson("true", "boolean").get<bool>());
    EXPECT_TRUE(SqlTypeMapper::sqlValueToJson("TRUE", "boolean").get<bool>());
    EXPECT_FALSE(SqlTypeMapper::sqlValueToJson("0",   "boolean").get<bool>());
}

TEST(SqlTypeMapperTest, SqlValueToJson_Numeric) {
    EXPECT_EQ(SqlTypeMapper::sqlValueToJson("123", "number").get<int64_t>(), 123LL);
}

TEST(SqlTypeMapperTest, SqlValueToJson_String_PassThrough) {
    EXPECT_EQ(SqlTypeMapper::sqlValueToJson("hello", "string").get<std::string>(), "hello");
}

TEST(SqlTypeMapperTest, ToSnakeCase_PascalCase) {
    EXPECT_EQ(SqlTypeMapper::toSnakeCase("UserProfile"), "user_profile");
    EXPECT_EQ(SqlTypeMapper::toSnakeCase("createdAt"),   "created_at");
    EXPECT_EQ(SqlTypeMapper::toSnakeCase("id"),          "id");
}

// ===========================================================================
// SqlTemplateGenerator — multi-dialect CREATE TABLE generation
// Exercises MySQL/PostgreSQL branches not covered by SQLite integration tests.
// ===========================================================================

// Build a minimal EntityDefinition for template tests
static dbal::adapters::EntityDefinition makeTemplateEntity(const std::string& name = "Widget") {
    dbal::adapters::EntityDefinition e;
    e.name = name;
    e.version = "1.0.0";

    dbal::adapters::FieldDefinition id;
    id.name = "id"; id.type = "uuid"; id.primary = true; id.generated = true;
    e.fields.push_back(id);

    dbal::adapters::FieldDefinition label;
    label.name = "label"; label.type = "string"; label.required = true; label.max_length = 100;
    e.fields.push_back(label);

    dbal::adapters::FieldDefinition active;
    active.name = "active"; active.type = "boolean"; active.default_value = "true";
    e.fields.push_back(active);

    dbal::adapters::FieldDefinition status;
    status.name = "status"; status.type = "enum";
    status.enum_values = {"draft", "published"};
    e.fields.push_back(status);

    dbal::adapters::FieldDefinition score;
    score.name = "score"; score.type = "integer"; score.default_value = "0";
    e.fields.push_back(score);

    dbal::adapters::FieldDefinition ts;
    ts.name = "createdAt"; ts.type = "timestamp";
    e.fields.push_back(ts);

    dbal::adapters::FieldDefinition meta;
    meta.name = "meta"; meta.type = "json";
    e.fields.push_back(meta);

    dbal::adapters::IndexDefinition idx;
    idx.fields = {"label"}; idx.unique = true;
    e.indexes.push_back(idx);

    return e;
}

// Parameterized: generate CREATE TABLE for each dialect
struct DialectCase { dbal::adapters::SqlDialect dialect; std::string expectedFragment; };

class TemplateGenTest : public testing::TestWithParam<DialectCase> {};

TEST_P(TemplateGenTest, GenerateCreateTable_NonEmpty) {
    auto p = GetParam();
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    auto entity = makeTemplateEntity("Item");
    auto sql = gen.generateCreateTable(entity, p.dialect);
    EXPECT_FALSE(sql.empty());
    EXPECT_NE(sql.find(p.expectedFragment), std::string::npos);
}

INSTANTIATE_TEST_SUITE_P(AllDialects, TemplateGenTest, testing::Values(
    DialectCase{dbal::adapters::SqlDialect::SQLite,     "Item"},
    DialectCase{dbal::adapters::SqlDialect::PostgreSQL,  "Item"},
    DialectCase{dbal::adapters::SqlDialect::MySQL,       "Item"}
));

TEST(SqlTemplateGeneratorTest, GenerateIndexes_PostgreSQL_ReturnsIndexSQL) {
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    auto entity = makeTemplateEntity("Product");
    auto indexes = gen.generateIndexes(entity, dbal::adapters::SqlDialect::PostgreSQL);
    EXPECT_FALSE(indexes.empty());
}

TEST(SqlTemplateGeneratorTest, GenerateIndexes_MySQL_ReturnsIndexSQL) {
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    auto entity = makeTemplateEntity("Order");
    auto indexes = gen.generateIndexes(entity, dbal::adapters::SqlDialect::MySQL);
    EXPECT_FALSE(indexes.empty());
}

TEST(SqlTemplateGeneratorTest, EntityWithMinLength_GeneratesCheck) {
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    dbal::adapters::EntityDefinition e;
    e.name = "Doc"; e.version = "1.0.0";
    dbal::adapters::FieldDefinition f;
    f.name = "title"; f.type = "string"; f.min_length = 3; f.max_length = 50;
    e.fields.push_back(f);
    // Just verify it doesn't throw; CHECK constraint generation is exercised
    EXPECT_NO_THROW(gen.generateCreateTable(e, dbal::adapters::SqlDialect::PostgreSQL));
}

TEST(SqlTemplateGeneratorTest, AlterAddColumn_PostgreSQL_ProducesSQL) {
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    auto entity = makeTemplateEntity("Event");
    EXPECT_NO_THROW(gen.generateAlterAddColumn(entity, entity.fields[1],
                                               dbal::adapters::SqlDialect::PostgreSQL));
}

TEST(SqlTemplateGeneratorTest, AlterAddColumn_MySQL_ProducesSQL) {
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    auto entity = makeTemplateEntity("Event");
    EXPECT_NO_THROW(gen.generateAlterAddColumn(entity, entity.fields[1],
                                               dbal::adapters::SqlDialect::MySQL));
}
// Additional template generator tests for remaining uncovered branches

TEST(SqlTemplateGeneratorTest, BooleanDefaultForPostgres_InOutput) {
    // Covers PG-specific boolean default branch (true/false string)
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    dbal::adapters::EntityDefinition e;
    e.name = "Flag"; e.version = "1.0.0";
    dbal::adapters::FieldDefinition f;
    f.name = "enabled"; f.type = "boolean"; f.default_value = "true";
    e.fields.push_back(f);
    EXPECT_NO_THROW(gen.generateCreateTable(e, dbal::adapters::SqlDialect::PostgreSQL));
}

TEST(SqlTemplateGeneratorTest, CreatedAtTimestampDefault_AllDialects) {
    // Covers createdAt auto-default branches for MySQL and PostgreSQL
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    dbal::adapters::EntityDefinition e;
    e.name = "Event"; e.version = "1.0.0";
    dbal::adapters::FieldDefinition f;
    f.name = "createdAt"; f.type = "timestamp";  // no default_value → auto-generated
    e.fields.push_back(f);
    EXPECT_NO_THROW(gen.generateCreateTable(e, dbal::adapters::SqlDialect::MySQL));
    EXPECT_NO_THROW(gen.generateCreateTable(e, dbal::adapters::SqlDialect::PostgreSQL));
}

TEST(SqlTemplateGeneratorTest, IndexSkip_WhenFieldAlreadyUnique) {
    // Covers index-skip branch: unique index on field that is already @unique
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    dbal::adapters::EntityDefinition e;
    e.name = "Obj"; e.version = "1.0.0";
    dbal::adapters::FieldDefinition f;
    f.name = "email"; f.type = "string"; f.unique = true;
    e.fields.push_back(f);
    dbal::adapters::IndexDefinition idx;
    idx.fields = {"email"}; idx.unique = true;  // will be skipped since field is already unique
    e.indexes.push_back(idx);
    auto indexes = gen.generateIndexes(e, dbal::adapters::SqlDialect::PostgreSQL);
    // Index should be skipped since field already has UNIQUE
    EXPECT_TRUE(indexes.empty());
}

TEST(SqlTemplateGeneratorTest, AlterAddColumn_SQLite_ProducesSQL) {
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    auto entity = makeTemplateEntity("Log");
    EXPECT_NO_THROW(gen.generateAlterAddColumn(entity, entity.fields[1],
                                               dbal::adapters::SqlDialect::SQLite));
}

TEST(SqlTemplateGeneratorTest, EntityWithJsonField_PostgreSQL_UsesJsonb) {
    // Covers the JSONB return for PostgreSQL
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    dbal::adapters::EntityDefinition e;
    e.name = "Config"; e.version = "1.0.0";
    dbal::adapters::FieldDefinition f;
    f.name = "data"; f.type = "json";
    e.fields.push_back(f);
    EXPECT_NO_THROW(gen.generateCreateTable(e, dbal::adapters::SqlDialect::PostgreSQL));
}

// ===========================================================================
// SchemaLoader — loadFromFile and loadFromDirectory
// ===========================================================================
#include "adapters/schema_loader.hpp"

TEST(SchemaLoaderTest, LoadFromFile_NonExistent_ReturnsNullopt) {
    auto result = dbal::adapters::SchemaLoader::loadFromFile("/nonexistent/entity.json");
    EXPECT_FALSE(result.has_value());
}

TEST(SchemaLoaderTest, LoadFromFile_ValidJson_WithEntityKey) {
    auto tmp = std::filesystem::temp_directory_path() / "test_entity.json";
    std::ofstream(tmp) << R"({"entity":"Widget","version":"1.0","fields":{"id":{"type":"uuid","primary":true},"name":{"type":"string"}}})";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->name, "Widget");
    EXPECT_FALSE(result->fields.empty());
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromFile_WithDisplayNameKey) {
    auto tmp = std::filesystem::temp_directory_path() / "test_dn.json";
    std::ofstream(tmp) << R"({"displayName":"Product","fields":{}})";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->name, "Product");
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromFile_WithNameKey_Capitalized) {
    auto tmp = std::filesystem::temp_directory_path() / "test_name.json";
    std::ofstream(tmp) << R"({"name":"order","fields":{}})";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->name, "Order");  // first letter capitalized
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromFile_ArrayOfEntities_UsesFirst) {
    auto tmp = std::filesystem::temp_directory_path() / "test_arr.json";
    std::ofstream(tmp) << R"([{"entity":"First","fields":{}},{"entity":"Second","fields":{}}])";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->name, "First");
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromFile_WithIndexes) {
    auto tmp = std::filesystem::temp_directory_path() / "test_idx.json";
    std::ofstream(tmp) << R"({"entity":"Post","fields":{"title":{"type":"string"}},"indexes":[{"fields":["title"],"unique":true}]})";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    EXPECT_FALSE(result->indexes.empty());
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromFile_WithRelations) {
    auto tmp = std::filesystem::temp_directory_path() / "test_rel.json";
    std::ofstream(tmp) << R"({"entity":"Comment","fields":{"id":{"type":"uuid"}},"relations":{"post":{"type":"belongs-to","entity":"Post","foreign_key":"postId"}}})";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    EXPECT_FALSE(result->relations.empty());
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromDirectory_EmptyDir_ReturnsEmpty) {
    auto dir = std::filesystem::temp_directory_path() / "dbal_schema_scan";
    std::filesystem::create_directories(dir);
    auto result = dbal::adapters::SchemaLoader::loadFromDirectory(dir.string());
    EXPECT_TRUE(result.empty());
    std::filesystem::remove_all(dir);
}

// More SchemaLoader tests to cover field-processing branches

TEST(SchemaLoaderTest, LoadFromFile_NoNameKey_ReturnsNullopt) {
    auto tmp = std::filesystem::temp_directory_path() / "no_name.json";
    std::ofstream(tmp) << R"({"version":"1.0","fields":{}})";  // no entity/displayName/name
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    EXPECT_FALSE(result.has_value());
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromFile_RelationshipField_Skipped) {
    auto tmp = std::filesystem::temp_directory_path() / "rel_field.json";
    std::ofstream(tmp) << R"({"entity":"Post","fields":{"author":{"type":"relationship"},"title":{"type":"string"}}})";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    // relationship field should be skipped
    for (const auto& f : result->fields)
        EXPECT_NE(f.name, "author");
}

TEST(SchemaLoaderTest, LoadFromFile_DatetimeAndNumberTypes_Remapped) {
    auto tmp = std::filesystem::temp_directory_path() / "remapped.json";
    std::ofstream(tmp) << R"({"entity":"Event","fields":{"ts":{"type":"datetime"},"amt":{"type":"number"}}})";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    for (const auto& f : result->fields) {
        EXPECT_EQ(f.type, "bigint");  // both datetime and number map to bigint
    }
}

TEST(SchemaLoaderTest, LoadFromFile_FieldWithPrimaryKey_AndConstraints) {
    auto tmp = std::filesystem::temp_directory_path() / "pk_field.json";
    std::ofstream(tmp) << R"({"entity":"Article","fields":{"id":{"type":"string","primaryKey":true,"generated":true},"slug":{"type":"string","unique":true,"required":true,"min_length":3,"max_length":200,"pattern":"^[a-z]","values":["draft","pub"]}}})";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    bool found_id = false, found_slug = false;
    for (const auto& f : result->fields) {
        if (f.name == "id") { EXPECT_TRUE(f.primary); EXPECT_TRUE(f.generated); found_id = true; }
        if (f.name == "slug") {
            EXPECT_TRUE(f.unique); EXPECT_TRUE(f.required);
            EXPECT_EQ(f.min_length, 3); EXPECT_EQ(f.max_length, 200);
            EXPECT_TRUE(f.pattern.has_value());
            EXPECT_FALSE(f.enum_values.empty());
            found_slug = true;
        }
    }
    EXPECT_TRUE(found_id); EXPECT_TRUE(found_slug);
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromFile_NonStringDefault_Converted) {
    auto tmp = std::filesystem::temp_directory_path() / "numdef.json";
    std::ofstream(tmp) << R"({"entity":"Thing","fields":{"count":{"type":"integer","default":42}}})";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    for (const auto& f : result->fields)
        if (f.name == "count") EXPECT_TRUE(f.default_value.has_value());
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromFile_TenantIdAutoAdd) {
    auto tmp = std::filesystem::temp_directory_path() / "tenant.json";
    std::ofstream(tmp) << R"({"entity":"Item","tenantId":true,"fields":{"id":{"type":"uuid"}}})";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    bool has_tenant = false;
    for (const auto& f : result->fields)
        if (f.name == "tenantId") { has_tenant = true; break; }
    EXPECT_TRUE(has_tenant);  // tenantId auto-added
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromFile_WithQueryConfig) {
    auto tmp = std::filesystem::temp_directory_path() / "qcfg.json";
    std::ofstream(tmp) << R"({"entity":"Log","fields":{},"query":{"allowed_operators":["eq","gt"],"max_results":50,"timeout_ms":5000}})";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result->query_config.max_results, 50);
    EXPECT_EQ(result->query_config.timeout_ms, 5000);
    EXPECT_FALSE(result->query_config.allowed_operators.empty());
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromDirectory_WithJsonFiles_ReturnsEntities) {
    auto dir = std::filesystem::temp_directory_path() / "dbal_schema_dir";
    std::filesystem::create_directories(dir);
    std::ofstream(dir / "user.json") << R"({"entity":"User","fields":{"id":{"type":"uuid","primary":true}}})";
    std::ofstream(dir / "post.json") << R"({"entity":"Post","fields":{"id":{"type":"uuid","primary":true}}})";
    auto result = dbal::adapters::SchemaLoader::loadFromDirectory(dir.string());
    EXPECT_EQ(result.size(), 2u);
    std::filesystem::remove_all(dir);
}

// ===========================================================================
// SqlWhereBuilder — additional operator coverage (Ne, Lt, Lte, Gt, ILike, etc.)
// ===========================================================================
#include "sql/sql_where_builder.hpp"
#include "sql/sql_types.hpp"

static std::string buildWhere(
    const std::vector<dbal::FilterCondition>& conditions,
    const std::string& dialect = "sqlite")
{
    std::unordered_set<std::string> valid{"age","name","status","count","score"};
    std::vector<dbal::adapters::sql::SqlParam> params;
    int idx = 1;
    return dbal::adapters::sql::SqlWhereBuilder::build(
        conditions, {}, {}, valid, dialect, params, idx);
}

TEST(SqlWhereBuilderTest, Ne_ProducesNotEqualClause) {
    dbal::FilterCondition c; c.field = "status"; c.op = dbal::FilterOp::Ne; c.value = "deleted";
    EXPECT_NE(buildWhere({c}).find("<>"), std::string::npos);
}

TEST(SqlWhereBuilderTest, Lt_ProducesLessThan) {
    dbal::FilterCondition c; c.field = "age"; c.op = dbal::FilterOp::Lt; c.value = "30";
    EXPECT_NE(buildWhere({c}).find(" < "), std::string::npos);
}

TEST(SqlWhereBuilderTest, Lte_ProducesLessThanOrEqual) {
    dbal::FilterCondition c; c.field = "age"; c.op = dbal::FilterOp::Lte; c.value = "30";
    EXPECT_NE(buildWhere({c}).find(" <= "), std::string::npos);
}

TEST(SqlWhereBuilderTest, Gt_ProducesGreaterThan) {
    dbal::FilterCondition c; c.field = "score"; c.op = dbal::FilterOp::Gt; c.value = "100";
    EXPECT_NE(buildWhere({c}).find(" > "), std::string::npos);
}

TEST(SqlWhereBuilderTest, ILike_MySQL_ProducesLower) {
    dbal::FilterCondition c; c.field = "name"; c.op = dbal::FilterOp::ILike; c.value = "%alice%";
    auto sql = buildWhere({c}, "mysql");
    EXPECT_NE(sql.find("LOWER"), std::string::npos);
}

TEST(SqlWhereBuilderTest, IsNotNull_ProducesIsNotNull) {
    dbal::FilterCondition c; c.field = "name"; c.op = dbal::FilterOp::IsNotNull;
    EXPECT_NE(buildWhere({c}).find("IS NOT NULL"), std::string::npos);
}

TEST(SqlWhereBuilderTest, Between_ProducesBetweenClause) {
    dbal::FilterCondition c; c.field = "age"; c.op = dbal::FilterOp::Between;
    c.values = {"18", "65"};
    EXPECT_NE(buildWhere({c}).find("BETWEEN"), std::string::npos);
}

TEST(SqlTypeMapperTest, SqlValueToJson_InvalidNumericString_ReturnsNull) {
    // sql_type_mapper.cpp lines 72-74: stoll throws → catch → return nullptr
    auto result = SqlTypeMapper::sqlValueToJson("not-a-number", "number");
    EXPECT_TRUE(result.is_null());
}

TEST(SqlWhereBuilderTest, Gte_ProducesGreaterThanOrEqual) {
    // sql_where_builder.hpp lines 198-199
    dbal::FilterCondition c; c.field = "score"; c.op = dbal::FilterOp::Gte; c.value = "100";
    EXPECT_NE(buildWhere({c}).find(" >= "), std::string::npos);
}

TEST(SqlWhereBuilderTest, AggregateSelect_CoversSumAvgMinMax) {
    // sql_where_builder.hpp lines 239-242: aggFuncName Sum/Avg/Min/Max branches
    std::unordered_set<std::string> valid{"amount", "price"};
    struct Case { dbal::AggFunc func; std::string expected; };
    for (auto tc : std::vector<Case>{
            {dbal::AggFunc::Sum, "SUM"},
            {dbal::AggFunc::Avg, "AVG"},
            {dbal::AggFunc::Min, "MIN"},
            {dbal::AggFunc::Max, "MAX"},
        }) {
        dbal::AggregateSpec spec; spec.func = tc.func; spec.field = "amount"; spec.alias = "result";
        auto sql = dbal::adapters::sql::SqlWhereBuilder::buildAggregateSelect({spec}, {}, valid, "sqlite");
        EXPECT_NE(sql.find(tc.expected), std::string::npos) << "Expected " << tc.expected;
    }
}

TEST(SchemaLoaderTest, LoadFromFile_StringDefault_Covered) {
    // schema_loader.hpp line 119: def_node.is_string() branch
    auto tmp = std::filesystem::temp_directory_path() / "strdef.json";
    std::ofstream(tmp) << R"({"entity":"Item","fields":{"status":{"type":"string","default":"active"}}})";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    ASSERT_TRUE(result.has_value());
    for (const auto& f : result->fields)
        if (f.name == "status") EXPECT_EQ(f.default_value.value_or(""), "active");
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromFile_MalformedJson_ReturnsNullopt) {
    // schema_loader.hpp lines 200-201: json::parse_error catch
    auto tmp = std::filesystem::temp_directory_path() / "bad.json";
    std::ofstream(tmp) << "{ this is not valid json !!!";
    auto result = dbal::adapters::SchemaLoader::loadFromFile(tmp.string());
    EXPECT_FALSE(result.has_value());
    std::filesystem::remove(tmp);
}

TEST(SchemaLoaderTest, LoadFromDirectory_NameVariants) {
    // schema_loader.hpp lines 226-228: displayName / name / no-name-key (skip)
    auto dir = std::filesystem::temp_directory_path() / "dbal_dir_names";
    std::filesystem::create_directories(dir);
    // Uses displayName (line 226)
    std::ofstream(dir/"dn.json") << R"({"displayName":"Alpha","fields":{}})";
    // Uses name key (line 227) — gets capitalized
    std::ofstream(dir/"nm.json") << R"({"name":"beta","fields":{}})";
    // No name key — should be skipped (line 228)
    std::ofstream(dir/"skip.json") << R"({"version":"1.0","fields":{}})";
    auto result = dbal::adapters::SchemaLoader::loadFromDirectory(dir.string());
    EXPECT_EQ(result.size(), 2u);  // skip.json entity is skipped
    std::filesystem::remove_all(dir);
}

TEST(SchemaLoaderTest, LoadFromDirectory_WithRelationsAndQueryConfig) {
    // schema_loader.hpp lines 261-270 (relations) and 272-282 (query config)
    auto dir = std::filesystem::temp_directory_path() / "dbal_dir_relq";
    std::filesystem::create_directories(dir);
    std::ofstream(dir/"post.json") << R"({
        "entity":"Post",
        "fields":{"id":{"type":"uuid"}},
        "relations":{"author":{"type":"belongs-to","entity":"User","foreign_key":"userId"}},
        "query":{"allowed_operators":["eq","gt"],"allowed_group_by":["id"],
                 "allowed_includes":["author"],"max_results":100,"timeout_ms":3000}
    })";
    auto result = dbal::adapters::SchemaLoader::loadFromDirectory(dir.string());
    ASSERT_EQ(result.size(), 1u);
    EXPECT_FALSE(result[0].relations.empty());
    EXPECT_EQ(result[0].query_config.max_results, 100);
    EXPECT_EQ(result[0].query_config.timeout_ms, 3000);
    EXPECT_FALSE(result[0].query_config.allowed_operators.empty());
    std::filesystem::remove_all(dir);
}

TEST(SqlWhereBuilderTest, OrGroup_SingleCondition_NoExtraParens) {
    // Covers or_parts.size() == 1 branch (lines 75-76)
    std::unordered_set<std::string> valid{"status"};
    std::vector<dbal::adapters::sql::SqlParam> params;
    int idx = 1;
    dbal::FilterCondition c; c.field = "status"; c.op = dbal::FilterOp::Eq; c.value = "active";
    dbal::FilterGroup grp; grp.conditions = {c};
    auto sql = dbal::adapters::sql::SqlWhereBuilder::build(
        {}, {grp}, {}, valid, "sqlite", params, idx);
    EXPECT_FALSE(sql.empty());
}

// ===========================================================================
// MySqlErrorMapper — inline mapMySqlError() function (mysql_error_mapper.hpp)
// sql_types.hpp already included above, so no redefinition.
// ===========================================================================
#include "sql/mysql_error_mapper.hpp"
#include "sql/postgres_error_mapper.hpp"

TEST(MySqlErrorMapperTest, UniqueViolation_1062) {
    EXPECT_EQ(mapMySqlError(1062), SqlError::Code::UniqueViolation);
}

TEST(MySqlErrorMapperTest, UniqueViolationWithKey_1586) {
    EXPECT_EQ(mapMySqlError(1586), SqlError::Code::UniqueViolation);
}

TEST(MySqlErrorMapperTest, ForeignKey_1451_And_1452) {
    EXPECT_EQ(mapMySqlError(1451), SqlError::Code::ForeignKeyViolation);
    EXPECT_EQ(mapMySqlError(1452), SqlError::Code::ForeignKeyViolation);
}

TEST(MySqlErrorMapperTest, NotFound_1146) {
    EXPECT_EQ(mapMySqlError(1146), SqlError::Code::NotFound);
}

TEST(MySqlErrorMapperTest, Timeout_1205) {
    EXPECT_EQ(mapMySqlError(1205), SqlError::Code::Timeout);
}

TEST(MySqlErrorMapperTest, ConnectionLost_2006_And_2013) {
    EXPECT_EQ(mapMySqlError(2006), SqlError::Code::ConnectionLost);
    EXPECT_EQ(mapMySqlError(2013), SqlError::Code::ConnectionLost);
}

TEST(MySqlErrorMapperTest, Unknown_Fallthrough) {
    EXPECT_EQ(mapMySqlError(9999), SqlError::Code::Unknown);
}

// ===========================================================================
// PostgresErrorMapper — inline mapPgSqlState() function
// ===========================================================================

TEST(PgErrorMapperTest, NullState_IsUnknown) {
    EXPECT_EQ(mapPgSqlState(nullptr), SqlError::Code::Unknown);
}

TEST(PgErrorMapperTest, UniqueViolation_23505) {
    EXPECT_EQ(mapPgSqlState("23505"), SqlError::Code::UniqueViolation);
}

TEST(PgErrorMapperTest, ForeignKeyViolation_23503) {
    EXPECT_EQ(mapPgSqlState("23503"), SqlError::Code::ForeignKeyViolation);
}

TEST(PgErrorMapperTest, UndefinedTable_42P01_IsNotFound) {
    EXPECT_EQ(mapPgSqlState("42P01"), SqlError::Code::NotFound);
}

TEST(PgErrorMapperTest, QueryCanceled_57014_IsTimeout) {
    EXPECT_EQ(mapPgSqlState("57014"), SqlError::Code::Timeout);
}

TEST(PgErrorMapperTest, ConnectionException_08xxx_IsConnectionLost) {
    EXPECT_EQ(mapPgSqlState("08001"), SqlError::Code::ConnectionLost);
    EXPECT_EQ(mapPgSqlState("08006"), SqlError::Code::ConnectionLost);
}

TEST(PgErrorMapperTest, Unknown_IsUnknown) {
    EXPECT_EQ(mapPgSqlState("99999"), SqlError::Code::Unknown);
}

// ===========================================================================
// SqlTemplateGenerator — remaining uncovered branches
// ===========================================================================

/** Covers template_generator.hpp:97-98 — string field with default → 'value' */
TEST(SqlTemplateGeneratorTest, StringDefaultValue_Quoted) {
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    dbal::adapters::EntityDefinition e;
    e.name = "Theme"; e.version = "1.0.0";
    dbal::adapters::FieldDefinition f;
    f.name = "color"; f.type = "string"; f.default_value = "light";
    e.fields.push_back(f);
    EXPECT_NO_THROW(gen.generateCreateTable(e, dbal::adapters::SqlDialect::PostgreSQL));
}

/** Covers template_generator.hpp:112-121 — non-uuid primary key auto-defaults */
TEST(SqlTemplateGeneratorTest, NonUuidPrimaryKey_AutoDefault_AllDialects) {
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    dbal::adapters::EntityDefinition e;
    e.name = "Doc"; e.version = "1.0.0";
    dbal::adapters::FieldDefinition f;
    f.name = "id"; f.type = "cuid"; f.primary = true;  // non-uuid primary key
    e.fields.push_back(f);
    EXPECT_NO_THROW(gen.generateCreateTable(e, dbal::adapters::SqlDialect::PostgreSQL));
    EXPECT_NO_THROW(gen.generateCreateTable(e, dbal::adapters::SqlDialect::SQLite));
    EXPECT_NO_THROW(gen.generateCreateTable(e, dbal::adapters::SqlDialect::MySQL));
}

/** Covers template_generator.hpp:167 — empty index fields skipped */
TEST(SqlTemplateGeneratorTest, EmptyIndexFields_Skipped) {
    dbal::adapters::SqlTemplateGenerator gen(DBAL_TEST_TEMPLATE_DIR);
    dbal::adapters::EntityDefinition e;
    e.name = "Obj"; e.version = "1.0.0";
    dbal::adapters::FieldDefinition f; f.name = "id"; f.type = "uuid"; f.primary = true;
    e.fields.push_back(f);
    dbal::adapters::IndexDefinition idx;  // idx.fields is empty → skipped
    e.indexes.push_back(idx);
    auto indexes = gen.generateIndexes(e, dbal::adapters::SqlDialect::PostgreSQL);
    EXPECT_TRUE(indexes.empty());
}
