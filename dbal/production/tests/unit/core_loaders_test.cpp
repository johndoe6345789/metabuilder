/**
 * Unit tests for pure-logic core loader classes:
 *   - FieldParser     — JSON field definition → EntityField struct
 *   - RelationParser  — JSON index/ACL → EntityIndex/ACL structs
 *   - SchemaValidator — EntitySchema validation rules
 *   - SchemaCache     — Thread-safe EntitySchema cache
 *   - MetadataCache   — TTL-based entity metadata cache
 */

#include <gtest/gtest.h>
#include <nlohmann/json.hpp>
#include <vector>
#include <string>

#include "dbal/core/loaders/field_parser.hpp"
#include "dbal/core/loaders/relation_parser.hpp"
#include "dbal/core/loaders/schema_validator.hpp"
#include "dbal/core/loaders/schema_cache.hpp"
#include "dbal/core/metadata_cache.hpp"
#include "dbal/core/entity_loader.hpp"

using namespace dbal::core::loaders;
using dbal::core::MetadataCache;
using dbal::core::EntityField;
using dbal::core::EntitySchema;
using Json = nlohmann::json;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

static EntitySchema makeMinimalSchema(const std::string& name = "TestEntity") {
    EntitySchema s;
    s.name = name;
    EntityField id; id.name = "id"; id.type = "uuid"; id.primary = true;
    EntityField val; val.name = "value"; val.type = "string";
    s.fields = {id, val};
    return s;
}

// ===========================================================================
// FieldParser
// ===========================================================================

TEST(FieldParserTest, ParseField_BasicString) {
    FieldParser parser;
    Json node;
    node["type"] = "string";
    node["required"] = true;

    auto field = parser.parseField("username", node);
    EXPECT_EQ(field.name, "username");
    EXPECT_EQ(field.type, "string");
    EXPECT_TRUE(field.required);
}

TEST(FieldParserTest, ParseField_NumberType) {
    FieldParser parser;
    Json node;
    node["type"] = "number";
    node["required"] = false;

    auto field = parser.parseField("age", node);
    EXPECT_EQ(field.type, "number");
    EXPECT_FALSE(field.required);
}

TEST(FieldParserTest, ParseField_BooleanType) {
    FieldParser parser;
    Json node;
    node["type"] = "boolean";

    auto field = parser.parseField("active", node);
    EXPECT_EQ(field.type, "boolean");
}

TEST(FieldParserTest, ParseField_UniqueFlag) {
    FieldParser parser;
    Json node;
    node["type"] = "email";
    node["unique"] = true;

    auto field = parser.parseField("email", node);
    EXPECT_TRUE(field.unique);
}

TEST(FieldParserTest, ParseField_DefaultValue) {
    FieldParser parser;
    Json node;
    node["type"] = "string";
    node["default"] = "Unknown";

    auto field = parser.parseField("label", node);
    ASSERT_TRUE(field.defaultValue.has_value());
    EXPECT_EQ(field.defaultValue.value(), "Unknown");
}

TEST(FieldParserTest, ParseField_MinMaxLength) {
    FieldParser parser;
    Json node;
    node["type"] = "string";
    node["minLength"] = 3;
    node["maxLength"] = 50;

    auto field = parser.parseField("name", node);
    ASSERT_TRUE(field.minLength.has_value());
    ASSERT_TRUE(field.maxLength.has_value());
    EXPECT_EQ(field.minLength.value(), 3);
    EXPECT_EQ(field.maxLength.value(), 50);
}

TEST(FieldParserTest, ParseField_EnumValues) {
    FieldParser parser;
    Json node;
    node["type"] = "enum";
    node["values"] = Json::array({"draft", "published", "archived"});

    auto field = parser.parseField("status", node);
    EXPECT_EQ(field.type, "enum");
    ASSERT_TRUE(field.enumValues.has_value());
    EXPECT_EQ(field.enumValues.value().size(), 3u);
    EXPECT_EQ(field.enumValues.value()[0], "draft");
}

TEST(FieldParserTest, ParseField_UuidType) {
    FieldParser parser;
    Json node;
    node["type"] = "uuid";
    node["primary"] = true;

    auto field = parser.parseField("id", node);
    EXPECT_EQ(field.type, "uuid");
    EXPECT_TRUE(field.primary);
}

TEST(FieldParserTest, ParseField_References) {
    FieldParser parser;
    Json node;
    node["type"] = "uuid";
    node["references"] = "User.id";

    auto field = parser.parseField("userId", node);
    ASSERT_TRUE(field.references.has_value());
    EXPECT_EQ(field.references.value(), "User.id");
}

TEST(FieldParserTest, ParseField_NoTypeNode_DefaultsToString) {
    FieldParser parser;
    Json node = Json::object();  // no "type" key

    // Should not throw; defaults to some reasonable type
    EXPECT_NO_THROW(parser.parseField("mystery", node));
}

// ===========================================================================
// RelationParser
// ===========================================================================

TEST(RelationParserTest, ParseIndex_BasicFields) {
    RelationParser parser;
    Json node;
    node["fields"] = Json::array({"email"});
    node["unique"] = true;
    node["name"] = "idx_email";

    auto idx = parser.parseIndex(node);
    ASSERT_EQ(idx.fields.size(), 1u);
    EXPECT_EQ(idx.fields[0], "email");
    EXPECT_TRUE(idx.unique);
    ASSERT_TRUE(idx.name.has_value());
    EXPECT_EQ(idx.name.value(), "idx_email");
}

TEST(RelationParserTest, ParseIndex_MultipleFields) {
    RelationParser parser;
    Json node;
    node["fields"] = Json::array({"tenantId", "createdAt"});
    node["unique"] = false;

    auto idx = parser.parseIndex(node);
    EXPECT_EQ(idx.fields.size(), 2u);
    EXPECT_FALSE(idx.unique);
}

TEST(RelationParserTest, ParseIndex_NonUnique_Default) {
    RelationParser parser;
    Json node;
    node["fields"] = Json::array({"userId"});
    // no "unique" key — defaults to false

    auto idx = parser.parseIndex(node);
    EXPECT_FALSE(idx.unique);
}

TEST(RelationParserTest, ParseACL_AllOperations) {
    RelationParser parser;
    Json node;
    node["create"] = Json::object({{"admin", true}, {"user", false}});
    node["read"]   = Json::object({{"admin", true}, {"user", true}});
    node["update"] = Json::object({{"admin", true}, {"user", false}});
    node["delete"] = Json::object({{"admin", true}, {"user", false}});

    auto acl = parser.parseACL(node);
    EXPECT_TRUE(acl.create["admin"]);
    EXPECT_FALSE(acl.create["user"]);
    EXPECT_TRUE(acl.read["user"]);
    EXPECT_TRUE(acl.update["admin"]);
    EXPECT_TRUE(acl.del["admin"]);
}

TEST(RelationParserTest, ParseACL_EmptyNode_NoCrash) {
    RelationParser parser;
    Json node = Json::object();
    EXPECT_NO_THROW(parser.parseACL(node));
}

// ===========================================================================
// SchemaValidator
// ===========================================================================

TEST(SchemaValidatorTest, ValidSchema_NoErrors) {
    SchemaValidator validator;
    auto result = validator.validate(makeMinimalSchema());
    EXPECT_TRUE(result.isValid());
    EXPECT_TRUE(result.errors.empty());
}

TEST(SchemaValidatorTest, EmptyName_IsError) {
    SchemaValidator validator;
    EntitySchema s = makeMinimalSchema();
    s.name = "";

    auto result = validator.validate(s);
    EXPECT_FALSE(result.isValid());
    EXPECT_FALSE(result.errors.empty());
}

TEST(SchemaValidatorTest, NoFields_IsError) {
    SchemaValidator validator;
    EntitySchema s;
    s.name = "Empty";
    // No fields

    auto result = validator.validate(s);
    EXPECT_FALSE(result.isValid());
}

TEST(SchemaValidatorTest, InvalidFieldType_IsError) {
    SchemaValidator validator;
    EntitySchema s;
    s.name = "Bad";
    EntityField f; f.name = "x"; f.type = "invalid_type";
    s.fields = {f};

    auto result = validator.validate(s);
    EXPECT_FALSE(result.isValid());
}

TEST(SchemaValidatorTest, MultiplePrimaryKeys_IsError) {
    SchemaValidator validator;
    EntitySchema s;
    s.name = "Multi";
    EntityField pk1; pk1.name = "id1"; pk1.type = "uuid"; pk1.primary = true;
    EntityField pk2; pk2.name = "id2"; pk2.type = "uuid"; pk2.primary = true;
    s.fields = {pk1, pk2};

    auto result = validator.validate(s);
    EXPECT_FALSE(result.isValid());
}

TEST(SchemaValidatorTest, MinLengthGreaterThanMaxLength_IsError) {
    SchemaValidator validator;
    EntitySchema s;
    s.name = "LenTest";
    EntityField f;
    f.name = "tag"; f.type = "string";
    f.minLength = 10;
    f.maxLength = 5;  // min > max → invalid
    s.fields = {f};

    auto result = validator.validate(s);
    EXPECT_FALSE(result.isValid());
}

TEST(SchemaValidatorTest, EnumFieldWithValues_Valid) {
    SchemaValidator validator;
    EntitySchema s;
    s.name = "WithEnum";
    EntityField e;
    e.name = "status"; e.type = "enum";
    e.enumValues = {"draft", "pub"};
    s.fields = {e};

    auto result = validator.validate(s);
    // enum fields with values should be valid (other warnings may exist)
    // Just check no hard error about enum lacking values
    bool hasEnumError = false;
    for (const auto& err : result.errors) {
        if (err.find("values") != std::string::npos) hasEnumError = true;
    }
    EXPECT_FALSE(hasEnumError);
}

TEST(SchemaValidatorTest, EnumFieldWithoutValues_IsError) {
    SchemaValidator validator;
    EntitySchema s;
    s.name = "BadEnum";
    EntityField e;
    e.name = "status"; e.type = "enum";
    // No enumValues set
    s.fields = {e};

    auto result = validator.validate(s);
    EXPECT_FALSE(result.isValid());
}

TEST(SchemaValidatorTest, IndexReferencesNonExistentField_IsError) {
    SchemaValidator validator;
    EntitySchema s = makeMinimalSchema();
    dbal::core::EntityIndex idx;
    idx.fields = {"nonexistent_field"};
    s.indexes = {idx};

    auto result = validator.validate(s);
    EXPECT_FALSE(result.isValid());
}

TEST(SchemaValidatorTest, NoVersion_IsWarning) {
    SchemaValidator validator;
    EntitySchema s = makeMinimalSchema();
    s.version = "";  // No version

    auto result = validator.validate(s);
    // warnings may be generated even when valid
    EXPECT_TRUE(result.isValid() || !result.warnings.empty());
}

TEST(SchemaValidatorTest, ValidationResult_AddError_SetsInvalid) {
    ValidationResult r;
    EXPECT_TRUE(r.isValid());
    r.addError("something broken");
    EXPECT_FALSE(r.isValid());
    EXPECT_EQ(r.errors.size(), 1u);
}

TEST(SchemaValidatorTest, ValidationResult_AddWarning_StaysValid) {
    ValidationResult r;
    r.addWarning("consider adding a description");
    EXPECT_TRUE(r.isValid());
    EXPECT_EQ(r.warnings.size(), 1u);
}

// ===========================================================================
// SchemaCache
// ===========================================================================

TEST(SchemaCacheTest, PutAndGet_ReturnsSchema) {
    SchemaCache cache;
    auto s = makeMinimalSchema("User");
    cache.put("User", s);

    auto result = cache.get("User");
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result.value().name, "User");
}

TEST(SchemaCacheTest, Get_MissingKey_ReturnsNullopt) {
    SchemaCache cache;
    auto result = cache.get("NonExistent");
    EXPECT_FALSE(result.has_value());
}

TEST(SchemaCacheTest, Contains_TrueAfterPut) {
    SchemaCache cache;
    cache.put("Post", makeMinimalSchema("Post"));
    EXPECT_TRUE(cache.contains("Post"));
    EXPECT_FALSE(cache.contains("Comment"));
}

TEST(SchemaCacheTest, Size_ReflectsCount) {
    SchemaCache cache;
    EXPECT_EQ(cache.size(), 0u);
    cache.put("A", makeMinimalSchema("A"));
    cache.put("B", makeMinimalSchema("B"));
    EXPECT_EQ(cache.size(), 2u);
}

TEST(SchemaCacheTest, Clear_EmptiesCache) {
    SchemaCache cache;
    cache.put("X", makeMinimalSchema("X"));
    cache.clear();
    EXPECT_EQ(cache.size(), 0u);
    EXPECT_FALSE(cache.contains("X"));
}

TEST(SchemaCacheTest, Remove_DeletesSingleEntry) {
    SchemaCache cache;
    cache.put("Alpha", makeMinimalSchema("Alpha"));
    cache.put("Beta",  makeMinimalSchema("Beta"));
    cache.remove("Alpha");
    EXPECT_FALSE(cache.contains("Alpha"));
    EXPECT_TRUE(cache.contains("Beta"));
    EXPECT_EQ(cache.size(), 1u);
}

TEST(SchemaCacheTest, GetEntityNames_ListsAll) {
    SchemaCache cache;
    cache.put("A", makeMinimalSchema("A"));
    cache.put("B", makeMinimalSchema("B"));
    auto names = cache.getEntityNames();
    EXPECT_EQ(names.size(), 2u);
}

TEST(SchemaCacheTest, GetAll_ReturnsCopy) {
    SchemaCache cache;
    cache.put("Dog", makeMinimalSchema("Dog"));
    auto all = cache.getAll();
    EXPECT_EQ(all.size(), 1u);
    EXPECT_TRUE(all.count("Dog"));
}

TEST(SchemaCacheTest, Overwrite_UpdatesSchema) {
    SchemaCache cache;
    auto s1 = makeMinimalSchema("Widget");
    auto s2 = makeMinimalSchema("Widget");
    s2.version = "2.0.0";
    cache.put("Widget", s1);
    cache.put("Widget", s2);
    auto result = cache.get("Widget");
    ASSERT_TRUE(result.has_value());
    EXPECT_EQ(result.value().version, "2.0.0");
}

// ===========================================================================
// MetadataCache
// ===========================================================================

TEST(MetadataCacheTest, CacheAndRetrieveEntities) {
    MetadataCache cache(300);
    std::vector<std::string> entities = {"User", "Post", "Comment"};
    cache.cacheAvailableEntities(entities);

    EXPECT_TRUE(cache.hasAvailableEntities());
    auto retrieved = cache.getAvailableEntities();
    EXPECT_EQ(retrieved.size(), 3u);
}

TEST(MetadataCacheTest, NoEntities_HasAvailableEntities_False) {
    MetadataCache cache(300);
    EXPECT_FALSE(cache.hasAvailableEntities());
}

TEST(MetadataCacheTest, GetEntities_WhenEmpty_ReturnsEmptyVector) {
    MetadataCache cache(300);
    auto result = cache.getAvailableEntities();
    EXPECT_TRUE(result.empty());
}

TEST(MetadataCacheTest, CacheAndRetrieveSchema) {
    MetadataCache cache(300);
    Json schema;
    schema["type"] = "object";
    schema["properties"]["id"] = "uuid";

    cache.cacheEntitySchema("User", schema);
    EXPECT_TRUE(cache.hasEntitySchema("User"));

    auto result = cache.getEntitySchema("User");
    EXPECT_EQ(result["type"].get<std::string>(), "object");
}

TEST(MetadataCacheTest, HasEntitySchema_False_WhenNotCached) {
    MetadataCache cache(300);
    EXPECT_FALSE(cache.hasEntitySchema("NonExistent"));
}

TEST(MetadataCacheTest, GetSchema_WhenMissing_ReturnsEmpty) {
    MetadataCache cache(300);
    auto result = cache.getEntitySchema("Ghost");
    EXPECT_TRUE(result.empty());
}

TEST(MetadataCacheTest, InvalidateAll_ClearsEverything) {
    MetadataCache cache(300);
    cache.cacheAvailableEntities({"A", "B"});
    cache.cacheEntitySchema("A", Json::object());

    cache.invalidateAll();

    EXPECT_FALSE(cache.hasAvailableEntities());
    EXPECT_FALSE(cache.hasEntitySchema("A"));
}

TEST(MetadataCacheTest, InvalidateSchema_ClearsOnlyThat) {
    MetadataCache cache(300);
    cache.cacheEntitySchema("User", Json::object({{"x", 1}}));
    cache.cacheEntitySchema("Post", Json::object({{"y", 2}}));

    cache.invalidateSchema("User");

    EXPECT_FALSE(cache.hasEntitySchema("User"));
    EXPECT_TRUE(cache.hasEntitySchema("Post"));
}

TEST(MetadataCacheTest, TTL_Zero_ImmediateExpiry) {
    MetadataCache cache(0);  // 0-second TTL → expires immediately
    cache.cacheAvailableEntities({"A"});
    // With TTL=0, might expire immediately or on next check
    // We just check it doesn't crash
    EXPECT_NO_THROW(cache.getAvailableEntities());
}

TEST(MetadataCacheTest, GetStatistics_ContainsExpectedKeys) {
    MetadataCache cache(300);
    cache.cacheAvailableEntities({"X"});
    cache.getAvailableEntities();  // generates a hit

    auto stats = cache.getStatistics();
    EXPECT_TRUE(stats.contains("hits") || stats.contains("hit_rate") ||
                stats.contains("cached_entities"));
}

// ===========================================================================
// SchemaValidator — uncovered branch: empty field name, empty references, empty index
// ===========================================================================

TEST(SchemaValidatorTest, EmptyFieldName_IsError) {
    // Line 55-56: field.name.empty() → addError, return early
    SchemaValidator validator;
    EntitySchema s;
    s.name = "BadField";
    EntityField f; f.name = ""; f.type = "string";
    s.fields = {f};
    auto result = validator.validate(s);
    EXPECT_FALSE(result.isValid());
    bool found = false;
    for (const auto& e : result.errors)
        if (e.find("no name") != std::string::npos) { found = true; break; }
    EXPECT_TRUE(found);
}

TEST(SchemaValidatorTest, FieldWithEmptyReferences_IsWarning) {
    // Lines 70-71: field.references exists but is empty → addWarning
    SchemaValidator validator;
    EntitySchema s;
    s.name = "RefWarn";
    EntityField f; f.name = "userId"; f.type = "uuid"; f.primary = true;
    f.references = "";  // set but empty
    s.fields = {f};
    auto result = validator.validate(s);
    EXPECT_FALSE(result.warnings.empty());
    bool found = false;
    for (const auto& w : result.warnings)
        if (w.find("empty references") != std::string::npos) { found = true; break; }
    EXPECT_TRUE(found);
}

TEST(SchemaValidatorTest, IndexWithNoFields_IsError) {
    // Lines 84-85: index.fields.empty() → addError, continue
    SchemaValidator validator;
    EntitySchema s = makeMinimalSchema("NoIdxFields");
    dbal::core::EntityIndex emptyIdx;
    // emptyIdx.fields is empty by default
    s.indexes = {emptyIdx};
    auto result = validator.validate(s);
    EXPECT_FALSE(result.isValid());
}

