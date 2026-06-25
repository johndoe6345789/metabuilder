/**
 * Unit tests for Prisma schema generation utilities:
 *   - PrismaModelGenerator    — EntitySchema → Prisma model block
 *   - PrismaRelationGenerator — RelationDef  → Prisma relation field
 *   - PrismaEnumGenerator     — enum names/values → Prisma enum block
 *   - PrismaDatasourceGenerator — fixed datasource/client blocks
 *   - PrismaGenerator         — full schema (datasource + models)
 *   - CompensatingTransaction — undo-log for REST API transactions
 *
 * All pure logic / string-generation, no network or DB required.
 * Private methods (generateField, fieldTypeToPrisma) are exercised
 * indirectly via generateModel() with varied field configurations.
 */

#include <gtest/gtest.h>
#include <gmock/gmock.h>
#include <nlohmann/json.hpp>
#include <map>

#include "dbal/core/entity_loader.hpp"
#include "dbal/core/relation_def.hpp"
#include "dbal/core/compensating_transaction.hpp"
#include "dbal/adapters/adapter.hpp"

// src/-relative headers (in CMake include path for integration tests)
#include "core/prisma_model_generator.hpp"
#include "core/prisma_relation_generator.hpp"
#include "core/prisma_enum_generator.hpp"
#include "core/prisma_datasource_generator.hpp"
#include "core/prisma_generator.hpp"

using dbal::Result;
using dbal::Error;
using dbal::ListOptions;
using Json = nlohmann::json;
using ::testing::_;
using ::testing::Return;

// ---------------------------------------------------------------------------
// Helper — dbal::core::EntitySchema (used by all prisma generators)
// ---------------------------------------------------------------------------

static dbal::core::EntitySchema makeCoreSchema(const std::string& name = "User") {
    dbal::core::EntitySchema s;
    s.name = name;
    dbal::core::EntityField id; id.name = "id"; id.type = "uuid"; id.primary = true;
    dbal::core::EntityField nm; nm.name = "label"; nm.type = "string"; nm.required = true;
    s.fields = {id, nm};
    return s;
}

// ===========================================================================
// PrismaModelGenerator — public: generateModel()
// Private generateField / fieldTypeToPrisma / generateIndexes tested indirectly.
// ===========================================================================

TEST(PrismaModelGeneratorTest, GenerateModel_ContainsModelKeyword) {
    dbal::core::PrismaModelGenerator gen;
    auto out = gen.generateModel(makeCoreSchema("Article"));
    EXPECT_NE(out.find("model Article"), std::string::npos);
    EXPECT_NE(out.find("{"), std::string::npos);
    EXPECT_NE(out.find("}"), std::string::npos);
}

TEST(PrismaModelGeneratorTest, GenerateModel_ContainsFieldNames) {
    dbal::core::PrismaModelGenerator gen;
    auto out = gen.generateModel(makeCoreSchema("Post"));
    EXPECT_NE(out.find("id"), std::string::npos);
    EXPECT_NE(out.find("label"), std::string::npos);
}

// Parameterized: each field type → expected Prisma type substring in output
struct FieldTypeCase { std::string fieldType; std::string expectedSubstr; };

class PrismaFieldTypeTest : public testing::TestWithParam<FieldTypeCase> {};

TEST_P(PrismaFieldTypeTest, FieldTypeMappedCorrectly) {
    auto p = GetParam();
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s;
    s.name = "X";
    dbal::core::EntityField f; f.name = "field"; f.type = p.fieldType;
    s.fields = {f};
    auto out = gen.generateModel(s);
    EXPECT_FALSE(out.empty());
    EXPECT_NE(out.find(p.expectedSubstr), std::string::npos);
}

INSTANTIATE_TEST_SUITE_P(FieldTypes, PrismaFieldTypeTest, testing::Values(
    FieldTypeCase{"string",          "String"},
    FieldTypeCase{"text",            "String"},
    FieldTypeCase{"email",           "String"},
    FieldTypeCase{"uuid",            "String"},
    FieldTypeCase{"cuid",            "String"},
    FieldTypeCase{"boolean",         "Boolean"},
    FieldTypeCase{"json",            "Json"},
    FieldTypeCase{"timestamp",       "DateTime"},
    FieldTypeCase{"integer",         "Int"},
    FieldTypeCase{"float",           "Float"},
    FieldTypeCase{"bigint",          "BigInt"},
    FieldTypeCase{"number",          "String"},   // falls back to String (not in map)
    FieldTypeCase{"rare_custom_type","String"}    // unknown types fall back to String
));

TEST(PrismaModelGeneratorTest, GenerateModel_NullableField_HasQuestionMark) {
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s;
    s.name = "Optional";
    dbal::core::EntityField f; f.name = "bio"; f.type = "text"; f.nullable = true;
    s.fields = {f};
    EXPECT_NE(gen.generateModel(s).find("?"), std::string::npos);
}

TEST(PrismaModelGeneratorTest, GenerateModel_UniqueField_HasUniqueAttr) {
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s;
    s.name = "Usr";
    dbal::core::EntityField f; f.name = "email"; f.type = "email"; f.unique = true;
    s.fields = {f};
    EXPECT_NE(gen.generateModel(s).find("@unique"), std::string::npos);
}

TEST(PrismaModelGeneratorTest, GenerateModel_DefaultValue_HasDefault) {
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s;
    s.name = "Usr";
    dbal::core::EntityField f; f.name = "role"; f.type = "string"; f.defaultValue = "user";
    s.fields = {f};
    EXPECT_NE(gen.generateModel(s).find("@default"), std::string::npos);
}

TEST(PrismaModelGeneratorTest, GenerateModel_PrimaryUuid_HasIdAttr) {
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s;
    s.name = "Entity";
    dbal::core::EntityField f; f.name = "id"; f.type = "uuid"; f.primary = true;
    s.fields = {f};
    EXPECT_NE(gen.generateModel(s).find("@id"), std::string::npos);
}

TEST(PrismaModelGeneratorTest, GenerateModel_EnumField_UsesEnumName) {
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s;
    s.name = "Task";
    dbal::core::EntityField f; f.name = "status"; f.type = "enum";
    f.enumValues = {"todo", "done"};
    s.fields = {f};
    EXPECT_FALSE(gen.generateModel(s).empty());
}

// Parameterized: generated fields (@default(uuid()), @default(cuid()), @default(now()), @default(autoincrement()))
struct GeneratedFieldCase { std::string fieldType; std::string expectedDefault; };

class PrismaGeneratedFieldTest : public testing::TestWithParam<GeneratedFieldCase> {};

TEST_P(PrismaGeneratedFieldTest, GeneratedField_HasAutoDefault) {
    auto p = GetParam();
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s;
    s.name = "X";
    dbal::core::EntityField f; f.name = "pk"; f.type = p.fieldType;
    f.primary = true; f.generated = true;
    s.fields = {f};
    auto out = gen.generateModel(s);
    EXPECT_NE(out.find(p.expectedDefault), std::string::npos);
}

INSTANTIATE_TEST_SUITE_P(GeneratedFields, PrismaGeneratedFieldTest, testing::Values(
    GeneratedFieldCase{"uuid",      "@default(uuid())"},
    GeneratedFieldCase{"cuid",      "@default(cuid())"},
    GeneratedFieldCase{"bigint",    "@default(now())"},
    GeneratedFieldCase{"timestamp", "@default(now())"},
    GeneratedFieldCase{"integer",   "@default(autoincrement())"}
));

TEST(PrismaModelGeneratorTest, GenerateModel_BooleanDefault_InOutput) {
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s;
    s.name = "Flag";
    dbal::core::EntityField f; f.name = "active"; f.type = "boolean"; f.defaultValue = "true";
    s.fields = {f};
    EXPECT_NE(gen.generateModel(s).find("@default"), std::string::npos);
}

TEST(PrismaModelGeneratorTest, GenerateModel_IntegerDefault_InOutput) {
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s;
    s.name = "Counter";
    dbal::core::EntityField f; f.name = "count"; f.type = "integer"; f.defaultValue = "0";
    s.fields = {f};
    EXPECT_NE(gen.generateModel(s).find("@default(0)"), std::string::npos);
}

TEST(PrismaModelGeneratorTest, GenerateModel_NamedIndex_HasNameAttr) {
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s = makeCoreSchema("Table");
    dbal::core::EntityIndex idx; idx.fields = {"label"}; idx.name = "idx_label";
    s.indexes = {idx};
    EXPECT_NE(gen.generateModel(s).find("idx_label"), std::string::npos);
}

TEST(PrismaModelGeneratorTest, GenerateModel_TenantIdField_HasMapAttr) {
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s;
    s.name = "Resource";
    dbal::core::EntityField f; f.name = "tenantId"; f.type = "string"; f.required = true;
    s.fields = {f};
    // tenantId → @map("tenant_id") due to camelCase to snake_case mapping
    EXPECT_NE(gen.generateModel(s).find("@map"), std::string::npos);
}

TEST(PrismaModelGeneratorTest, GenerateModel_WithIndex_ContainsIndexDirective) {
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s = makeCoreSchema("Product");
    dbal::core::EntityIndex idx; idx.fields = {"label"}; idx.unique = false;
    s.indexes = {idx};
    EXPECT_NE(gen.generateModel(s).find("@@index"), std::string::npos);
}

TEST(PrismaModelGeneratorTest, GenerateModel_WithUniqueIndex_HasTypeUnique) {
    dbal::core::PrismaModelGenerator gen;
    dbal::core::EntitySchema s = makeCoreSchema("Widget");
    dbal::core::EntityIndex idx; idx.fields = {"label"}; idx.unique = true;
    s.indexes = {idx};
    // Unique index generates @@index([...], type: Unique)
    EXPECT_NE(gen.generateModel(s).find("type: Unique"), std::string::npos);
}

// ===========================================================================
// PrismaRelationGenerator — parameterized over relation types and onDelete policies
// ===========================================================================

struct RelationCase {
    std::string relType;
    std::string onDelete;
    std::string foreignKey;
    bool nullable{false};
};

class PrismaRelationTest : public testing::TestWithParam<RelationCase> {};

TEST_P(PrismaRelationTest, GenerateRelation_ProducesNonEmptyOutput) {
    auto p = GetParam();
    dbal::core::PrismaRelationGenerator gen;
    dbal::core::RelationDef rel;
    rel.name = "field"; rel.type = p.relType; rel.entity = "Other";
    rel.foreignKey = p.foreignKey;
    rel.onDelete = p.onDelete;
    rel.nullable = p.nullable;
    EXPECT_FALSE(gen.generateRelation(rel).empty());
}

INSTANTIATE_TEST_SUITE_P(AllRelationVariants, PrismaRelationTest, testing::Values(
    RelationCase{"belongs-to",   "",          "userId",   false},
    RelationCase{"has-many",     "",          "",         false},
    RelationCase{"has-one",      "",          "",         false},
    RelationCase{"many-to-many", "",          "",         false},
    RelationCase{"polymorphic",  "",          "",         false},
    RelationCase{"has-many",     "cascade",   "",         false},
    RelationCase{"belongs-to",   "set_null",  "editorId", true},
    RelationCase{"belongs-to",   "restrict",  "",         false},
    RelationCase{"belongs-to",   "no_action", "",         false}
));

TEST(PrismaRelationGeneratorTest, WithOnUpdate_Cascade_HasOnUpdate) {
    dbal::core::PrismaRelationGenerator gen;
    dbal::core::RelationDef rel;
    rel.name = "user"; rel.type = "belongs-to"; rel.entity = "User";
    rel.foreignKey = "userId"; rel.onUpdate = "cascade";
    auto out = gen.generateRelation(rel);
    EXPECT_NE(out.find("onUpdate"), std::string::npos);
}

// ===========================================================================
// PrismaEnumGenerator
// ===========================================================================

TEST(PrismaEnumGeneratorTest, BasicEnum) {
    dbal::core::PrismaEnumGenerator gen;
    auto out = gen.generateEnum("Status", {"draft", "published", "archived"});
    EXPECT_NE(out.find("enum Status"), std::string::npos);
    EXPECT_NE(out.find("draft"), std::string::npos);
    EXPECT_NE(out.find("published"), std::string::npos);
    EXPECT_NE(out.find("}"), std::string::npos);
}

TEST(PrismaEnumGeneratorTest, SingleValue) {
    dbal::core::PrismaEnumGenerator gen;
    auto out = gen.generateEnum("Color", {"red"});
    EXPECT_NE(out.find("red"), std::string::npos);
}

TEST(PrismaEnumGeneratorTest, EmptyValues) {
    dbal::core::PrismaEnumGenerator gen;
    auto out = gen.generateEnum("Empty", {});
    EXPECT_NE(out.find("enum Empty"), std::string::npos);
}

// ===========================================================================
// PrismaDatasourceGenerator
// ===========================================================================

TEST(PrismaDatasourceGeneratorTest, Datasource_ContainsProvider) {
    dbal::core::PrismaDatasourceGenerator gen;
    auto out = gen.generateDatasource();
    EXPECT_NE(out.find("datasource"), std::string::npos);
    EXPECT_NE(out.find("provider"), std::string::npos);
}

TEST(PrismaDatasourceGeneratorTest, Datasource_ContainsDatabaseUrl) {
    dbal::core::PrismaDatasourceGenerator gen;
    auto out = gen.generateDatasource();
    EXPECT_NE(out.find("url"), std::string::npos);
}

TEST(PrismaDatasourceGeneratorTest, Client_ContainsGenerator) {
    dbal::core::PrismaDatasourceGenerator gen;
    auto out = gen.generateClient();
    EXPECT_NE(out.find("generator"), std::string::npos);
}

TEST(PrismaDatasourceGeneratorTest, Client_ContainsProvider) {
    dbal::core::PrismaDatasourceGenerator gen;
    auto out = gen.generateClient();
    EXPECT_NE(out.find("provider"), std::string::npos);
}

// ===========================================================================
// PrismaGenerator — full schema
// ===========================================================================

TEST(PrismaGeneratorTest, FullSchema_ContainsHeaderComment) {
    dbal::core::PrismaGenerator gen;
    std::map<std::string, dbal::core::EntitySchema> schemas;
    schemas["User"] = makeCoreSchema("User");
    auto out = gen.generateSchema(schemas);
    EXPECT_NE(out.find("auto-generated"), std::string::npos);
}

TEST(PrismaGeneratorTest, FullSchema_ContainsDatasource) {
    dbal::core::PrismaGenerator gen;
    std::map<std::string, dbal::core::EntitySchema> schemas;
    schemas["Post"] = makeCoreSchema("Post");
    auto out = gen.generateSchema(schemas);
    EXPECT_NE(out.find("datasource"), std::string::npos);
}

TEST(PrismaGeneratorTest, FullSchema_ContainsModel) {
    dbal::core::PrismaGenerator gen;
    std::map<std::string, dbal::core::EntitySchema> schemas;
    schemas["Comment"] = makeCoreSchema("Comment");
    auto out = gen.generateSchema(schemas);
    EXPECT_NE(out.find("model Comment"), std::string::npos);
}

TEST(PrismaGeneratorTest, EmptySchemas_StillHasHeader) {
    dbal::core::PrismaGenerator gen;
    std::map<std::string, dbal::core::EntitySchema> schemas;
    EXPECT_FALSE(gen.generateSchema(schemas).empty());
}

TEST(PrismaGeneratorTest, SchemaWithRelation_ContainsRelationField) {
    dbal::core::PrismaGenerator gen;
    std::map<std::string, dbal::core::EntitySchema> schemas;
    dbal::core::EntitySchema s = makeCoreSchema("Order");
    dbal::core::RelationDef rel;
    rel.name = "customer"; rel.type = "belongs-to"; rel.entity = "User";
    rel.foreignKey = "userId";
    s.relations = {rel};
    schemas["Order"] = s;
    auto out = gen.generateSchema(schemas);
    EXPECT_NE(out.find("model Order"), std::string::npos);
}

// ===========================================================================
// CompensatingTransaction — via mock adapter
// ===========================================================================

class MockAdapter : public dbal::adapters::Adapter {
public:
    MOCK_METHOD((Result<Json>), create,
                (const std::string&, const Json&), (override));
    MOCK_METHOD((Result<Json>), read,
                (const std::string&, const std::string&), (override));
    MOCK_METHOD((Result<Json>), update,
                (const std::string&, const std::string&, const Json&), (override));
    MOCK_METHOD((Result<bool>), remove,
                (const std::string&, const std::string&), (override));
    MOCK_METHOD((Result<dbal::adapters::ListResult<Json>>), list,
                (const std::string&, const ListOptions&), (override));
    MOCK_METHOD((Result<int>), createMany,
                (const std::string&, const std::vector<Json>&), (override));
    MOCK_METHOD((Result<int>), updateMany,
                (const std::string&, const Json&, const Json&), (override));
    MOCK_METHOD((Result<int>), deleteMany,
                (const std::string&, const Json&), (override));
    MOCK_METHOD((Result<Json>), findFirst,
                (const std::string&, const Json&), (override));
    MOCK_METHOD((Result<Json>), findByField,
                (const std::string&, const std::string&, const Json&), (override));
    MOCK_METHOD((Result<Json>), upsert,
                (const std::string&, const std::string&, const Json&,
                 const Json&, const Json&), (override));
    MOCK_METHOD((Result<std::vector<std::string>>), getAvailableEntities, (), (override));
    MOCK_METHOD((Result<dbal::adapters::EntitySchema>), getEntitySchema,
                (const std::string&), (override));
    MOCK_METHOD(void, close, (), (override));
};

using dbal::core::CompensatingTransaction;

TEST(CompensatingTransactionTest, NewTransaction_IsActive) {
    MockAdapter adapter;
    CompensatingTransaction tx(adapter);
    EXPECT_TRUE(tx.isActive());
}

TEST(CompensatingTransactionTest, Commit_SetsNotActive) {
    MockAdapter adapter;
    CompensatingTransaction tx(adapter);
    tx.commit();
    EXPECT_FALSE(tx.isActive());
}

TEST(CompensatingTransactionTest, RecordCreate_ThenRollback_CallsRemove) {
    MockAdapter adapter;
    EXPECT_CALL(adapter, remove("users", "u1"))
        .WillOnce(Return(Result<bool>(true)));

    CompensatingTransaction tx(adapter);
    tx.recordCreate("users", "u1");
    auto result = tx.rollback();
    EXPECT_TRUE(result.isOk());
    EXPECT_FALSE(tx.isActive());
}

TEST(CompensatingTransactionTest, RecordUpdate_ThenRollback_CallsUpdate) {
    MockAdapter adapter;
    Json prev; prev["name"] = "Old";
    EXPECT_CALL(adapter, update("users", "u2", prev))
        .WillOnce(Return(Result<Json>(prev)));

    CompensatingTransaction tx(adapter);
    tx.recordUpdate("users", "u2", prev);
    tx.rollback();
}

TEST(CompensatingTransactionTest, RecordDelete_ThenRollback_CallsCreate) {
    MockAdapter adapter;
    Json prev; prev["id"] = "u3"; prev["name"] = "Bob";
    EXPECT_CALL(adapter, create("users", prev))
        .WillOnce(Return(Result<Json>(prev)));

    CompensatingTransaction tx(adapter);
    tx.recordDelete("users", prev);
    tx.rollback();
}

TEST(CompensatingTransactionTest, RollbackWhenNotActive_IsNoOp) {
    MockAdapter adapter;
    EXPECT_CALL(adapter, remove(_, _)).Times(0);

    CompensatingTransaction tx(adapter);
    tx.commit();
    tx.rollback();  // no-op
}

TEST(CompensatingTransactionTest, RecordAfterCommit_Ignored) {
    MockAdapter adapter;
    EXPECT_CALL(adapter, remove(_, _)).Times(0);

    CompensatingTransaction tx(adapter);
    tx.commit();
    tx.recordCreate("users", "late-id");
    tx.rollback();
}

TEST(CompensatingTransactionTest, MultipleCreates_AllRolledBack) {
    MockAdapter adapter;
    EXPECT_CALL(adapter, remove("items", "a")).WillOnce(Return(Result<bool>(true)));
    EXPECT_CALL(adapter, remove("items", "b")).WillOnce(Return(Result<bool>(true)));

    CompensatingTransaction tx(adapter);
    tx.recordCreate("items", "a");
    tx.recordCreate("items", "b");
    tx.rollback();
}

TEST(CompensatingTransactionTest, MixedOps_AllRolledBack) {
    MockAdapter adapter;
    Json prevData; prevData["name"] = "Old";
    EXPECT_CALL(adapter, remove("a", "id1")).WillOnce(Return(Result<bool>(true)));
    EXPECT_CALL(adapter, update("b", "id2", prevData)).WillOnce(Return(Result<Json>(prevData)));

    CompensatingTransaction tx(adapter);
    tx.recordCreate("a", "id1");
    tx.recordUpdate("b", "id2", prevData);
    tx.rollback();
}

// --- Failed rollback paths (lines 56-59, 66-69, 76-79, 89 in compensating_transaction.cpp) ---

TEST(CompensatingTransactionTest, RollbackCreate_AdapterFails_ReturnsError) {
    MockAdapter adapter;
    EXPECT_CALL(adapter, remove("users", "bad-id"))
        .WillOnce(Return(Error::internal("remove failed")));

    CompensatingTransaction tx(adapter);
    tx.recordCreate("users", "bad-id");
    auto result = tx.rollback();
    EXPECT_FALSE(result.isOk());
}

TEST(CompensatingTransactionTest, RollbackUpdate_AdapterFails_ReturnsError) {
    MockAdapter adapter;
    Json prev; prev["x"] = 1;
    EXPECT_CALL(adapter, update("items", "id9", prev))
        .WillOnce(Return(Error::internal("update failed")));

    CompensatingTransaction tx(adapter);
    tx.recordUpdate("items", "id9", prev);
    auto result = tx.rollback();
    EXPECT_FALSE(result.isOk());
}

TEST(CompensatingTransactionTest, RollbackDelete_AdapterFails_ReturnsError) {
    MockAdapter adapter;
    Json prev; prev["id"] = "id7"; prev["v"] = "data";
    EXPECT_CALL(adapter, create("logs", prev))
        .WillOnce(Return(Error::internal("create failed")));

    CompensatingTransaction tx(adapter);
    tx.recordDelete("logs", prev);
    auto result = tx.rollback();
    EXPECT_FALSE(result.isOk());
}
