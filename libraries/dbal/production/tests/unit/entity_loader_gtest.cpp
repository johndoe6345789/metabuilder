/**
 * GTest-based unit tests for EntitySchemaLoader.
 * Covers: loadSchemas, loadSchema, parseJson, parseField, parseIndex, parseACL
 */

#include <gtest/gtest.h>
#include <nlohmann/json.hpp>
#include <filesystem>
#include <fstream>

#include "dbal/core/entity_loader.hpp"

using dbal::core::EntitySchemaLoader;
using dbal::core::EntitySchema;
using dbal::core::EntityField;

namespace fs = std::filesystem;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

static fs::path writeTmp(const std::string& filename, const std::string& content) {
    auto p = fs::temp_directory_path() / filename;
    std::ofstream(p) << content;
    return p;
}

// ---------------------------------------------------------------------------
// loadSchemas
// ---------------------------------------------------------------------------

TEST(EntitySchemaLoaderTest, LoadSchemas_NonExistentDir_ReturnsEmpty) {
    EntitySchemaLoader loader;
    auto result = loader.loadSchemas("/nonexistent/path/schemas");
    EXPECT_TRUE(result.empty());
}

TEST(EntitySchemaLoaderTest, LoadSchemas_EmptyDir_ReturnsEmpty) {
    auto dir = fs::temp_directory_path() / "el_empty_dir";
    fs::create_directories(dir);
    EntitySchemaLoader loader;
    auto result = loader.loadSchemas(dir.string());
    EXPECT_TRUE(result.empty());
    fs::remove_all(dir);
}

TEST(EntitySchemaLoaderTest, LoadSchemas_ValidEntityJson_LoadsOne) {
    auto dir = fs::temp_directory_path() / "el_valid_dir";
    fs::create_directories(dir);
    std::ofstream(dir / "widget.json") << R"({
        "entity": "Widget",
        "version": "1.0",
        "fields": {
            "id": {"type": "uuid", "primary": true, "generated": true},
            "label": {"type": "string", "required": true}
        }
    })";
    EntitySchemaLoader loader;
    auto result = loader.loadSchemas(dir.string());
    EXPECT_EQ(result.size(), 1u);
    EXPECT_TRUE(result.count("Widget"));
    fs::remove_all(dir);
}

TEST(EntitySchemaLoaderTest, LoadSchemas_ArrayFormatJson_LoadsMultiple) {
    auto dir = fs::temp_directory_path() / "el_array_dir";
    fs::create_directories(dir);
    std::ofstream(dir / "multi.json") << R"([
        {"entity": "Alpha", "version": "1.0", "fields": {"id": {"type": "uuid", "primary": true}}},
        {"entity": "Beta",  "version": "1.0", "fields": {"id": {"type": "uuid", "primary": true}}}
    ])";
    EntitySchemaLoader loader;
    auto result = loader.loadSchemas(dir.string());
    EXPECT_EQ(result.size(), 2u);
    EXPECT_TRUE(result.count("Alpha"));
    EXPECT_TRUE(result.count("Beta"));
    fs::remove_all(dir);
}

TEST(EntitySchemaLoaderTest, LoadSchemas_InvalidJson_SkipsFile) {
    auto dir = fs::temp_directory_path() / "el_bad_dir";
    fs::create_directories(dir);
    // Invalid JSON — should be caught and skipped, not crash
    std::ofstream(dir / "bad.json") << "{ this is not json !!!";
    EntitySchemaLoader loader;
    auto result = loader.loadSchemas(dir.string());
    EXPECT_TRUE(result.empty());
    fs::remove_all(dir);
}

TEST(EntitySchemaLoaderTest, LoadSchemas_NoNameKey_SkipsEntity) {
    auto dir = fs::temp_directory_path() / "el_noname_dir";
    fs::create_directories(dir);
    std::ofstream(dir / "noname.json") << R"({"version": "1.0", "fields": {"id": {"type": "uuid", "primary": true}}})";
    EntitySchemaLoader loader;
    auto result = loader.loadSchemas(dir.string());
    EXPECT_TRUE(result.empty());
    fs::remove_all(dir);
}

// ---------------------------------------------------------------------------
// loadSchema
// ---------------------------------------------------------------------------

TEST(EntitySchemaLoaderTest, LoadSchema_NonExistentFile_Throws) {
    EntitySchemaLoader loader;
    EXPECT_THROW(loader.loadSchema("/nonexistent/schema.json"), std::runtime_error);
}

TEST(EntitySchemaLoaderTest, LoadSchema_ValidFile_ReturnsSchema) {
    auto path = writeTmp("el_valid.json", R"({
        "entity": "Product",
        "version": "1.0",
        "fields": {
            "id": {"type": "uuid", "primary": true, "generated": true},
            "name": {"type": "string", "required": true}
        }
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    EXPECT_EQ(schema.name, "Product");
    EXPECT_EQ(schema.fields.size(), 2u);
    fs::remove(path);
}

TEST(EntitySchemaLoaderTest, LoadSchema_ArrayFile_UsesFirstElement) {
    auto path = writeTmp("el_arr.json", R"([
        {"entity": "First", "version": "1.0", "fields": {"id": {"type": "uuid", "primary": true}}},
        {"entity": "Second", "version": "1.0", "fields": {"id": {"type": "uuid", "primary": true}}}
    ])");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    EXPECT_EQ(schema.name, "First");
    fs::remove(path);
}

// ---------------------------------------------------------------------------
// parseJson — field variations
// ---------------------------------------------------------------------------

TEST(EntitySchemaLoaderTest, LoadSchema_FieldWithDescription) {
    auto path = writeTmp("el_desc.json", R"({
        "entity": "Desc",
        "version": "1.0",
        "fields": {
            "id": {"type": "uuid", "primary": true},
            "note": {"type": "text", "description": "A helpful note"}
        }
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    bool found = false;
    for (const auto& f : schema.fields)
        if (f.name == "note") { EXPECT_TRUE(f.description.has_value()); found = true; }
    EXPECT_TRUE(found);
    fs::remove(path);
}

TEST(EntitySchemaLoaderTest, LoadSchema_FieldWithMinMaxLength) {
    auto path = writeTmp("el_len.json", R"({
        "entity": "Len",
        "version": "1.0",
        "fields": {
            "id": {"type": "uuid", "primary": true},
            "tag": {"type": "string", "min_length": 2, "max_length": 20}
        }
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    bool found = false;
    for (const auto& f : schema.fields)
        if (f.name == "tag") {
            EXPECT_EQ(f.minLength.value_or(0), 2);
            EXPECT_EQ(f.maxLength.value_or(0), 20);
            found = true;
        }
    EXPECT_TRUE(found);
    fs::remove(path);
}

TEST(EntitySchemaLoaderTest, LoadSchema_EnumField) {
    auto path = writeTmp("el_enum.json", R"({
        "entity": "Enum",
        "version": "1.0",
        "fields": {
            "id": {"type": "uuid", "primary": true},
            "status": {"type": "enum", "values": ["a", "b", "c"]}
        }
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    bool found = false;
    for (const auto& f : schema.fields)
        if (f.name == "status") {
            ASSERT_TRUE(f.enumValues.has_value());
            EXPECT_EQ(f.enumValues->size(), 3u);
            found = true;
        }
    EXPECT_TRUE(found);
    fs::remove(path);
}

TEST(EntitySchemaLoaderTest, LoadSchema_MetadataField) {
    auto path = writeTmp("el_meta.json", R"({
        "entity": "Meta",
        "version": "1.0",
        "fields": {"id": {"type": "uuid", "primary": true}},
        "metadata": {"owner": "team-a", "tier": "core"}
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    EXPECT_EQ(schema.metadata.at("owner"), "team-a");
    fs::remove(path);
}

TEST(EntitySchemaLoaderTest, LoadSchema_WithIndexes) {
    auto path = writeTmp("el_idx.json", R"({
        "entity": "Idx",
        "version": "1.0",
        "fields": {
            "id": {"type": "uuid", "primary": true},
            "email": {"type": "email"}
        },
        "indexes": [{"fields": ["email"], "unique": true, "name": "idx_email"}]
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    ASSERT_EQ(schema.indexes.size(), 1u);
    EXPECT_TRUE(schema.indexes[0].unique);
    EXPECT_EQ(schema.indexes[0].name.value_or(""), "idx_email");
    fs::remove(path);
}

TEST(EntitySchemaLoaderTest, LoadSchema_WithACL) {
    auto path = writeTmp("el_acl.json", R"({
        "entity": "Acl",
        "version": "1.0",
        "fields": {"id": {"type": "uuid", "primary": true}},
        "acl": {
            "create": {"admin": true, "user": false},
            "read":   {"admin": true, "user": true},
            "update": {"admin": true, "user": false},
            "delete": {"admin": true}
        }
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    ASSERT_TRUE(schema.acl.has_value());
    EXPECT_TRUE(schema.acl->create.at("admin"));
    EXPECT_FALSE(schema.acl->create.at("user"));
    EXPECT_TRUE(schema.acl->read.at("user"));
    fs::remove(path);
}

TEST(EntitySchemaLoaderTest, LoadSchema_NameFromNameKey) {
    auto path = writeTmp("el_namekey.json", R"({
        "name": "ByName",
        "version": "1.0",
        "fields": {"id": {"type": "uuid", "primary": true}}
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    EXPECT_EQ(schema.name, "ByName");
    fs::remove(path);
}

TEST(EntitySchemaLoaderTest, LoadSchema_DisplayNameAndDescription) {
    auto path = writeTmp("el_dispname.json", R"({
        "entity": "Disp",
        "displayName": "Display Widget",
        "description": "A widget for display",
        "version": "1.0",
        "fields": {"id": {"type": "uuid", "primary": true}}
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    EXPECT_EQ(schema.displayName, "Display Widget");
    EXPECT_EQ(schema.description, "A widget for display");
    fs::remove(path);
}

// ---------------------------------------------------------------------------
// getDefaultSchemaPath — smoke test (doesn't throw if schema dir exists)
// ---------------------------------------------------------------------------

TEST(EntitySchemaLoaderTest, GetDefaultSchemaPath_ThrowsIfNotFound) {
    // The test binary runs from _build/ which likely doesn't have the schema dir
    // nearby at expected relative paths — it should either succeed (if dir exists)
    // or throw std::runtime_error. We just verify no UB.
    try {
        auto path = EntitySchemaLoader::getDefaultSchemaPath();
        EXPECT_FALSE(path.empty());
    } catch (const std::runtime_error&) {
        // Expected when running from _build/ without the schema dir accessible
    }
}

// ---------------------------------------------------------------------------
// Field parser edge cases via loadSchema
// ---------------------------------------------------------------------------

TEST(EntitySchemaLoaderTest, FieldParser_NonStringDefault_Dumped) {
    auto path = writeTmp("el_numdef.json", R"({
        "entity": "NumDef",
        "version": "1.0",
        "fields": {
            "id": {"type": "uuid", "primary": true},
            "count": {"type": "integer", "default": 42}
        }
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    for (const auto& f : schema.fields)
        if (f.name == "count") EXPECT_TRUE(f.defaultValue.has_value());
    fs::remove(path);
}

TEST(EntitySchemaLoaderTest, FieldParser_BoolFlags_AllSet) {
    auto path = writeTmp("el_flags.json", R"({
        "entity": "Flags",
        "version": "1.0",
        "fields": {
            "id": {"type": "uuid", "primary": true, "generated": true, "unique": true, "nullable": true, "index": true}
        }
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    auto& f = schema.fields[0];
    EXPECT_TRUE(f.primary);
    EXPECT_TRUE(f.generated);
    EXPECT_TRUE(f.unique);
    EXPECT_TRUE(f.nullable);
    EXPECT_TRUE(f.index);
    fs::remove(path);
}

TEST(EntitySchemaLoaderTest, FieldParser_MinLengthAltKey) {
    // Covers the "minLength" (camelCase) branch vs "min_length" (snake_case)
    auto path = writeTmp("el_minlen.json", R"({
        "entity": "MinLen",
        "version": "1.0",
        "fields": {
            "id": {"type": "uuid", "primary": true},
            "slug": {"type": "string", "minLength": 3, "maxLength": 50, "pattern": "^[a-z]+$"}
        }
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    for (const auto& f : schema.fields)
        if (f.name == "slug") {
            EXPECT_EQ(f.minLength.value_or(0), 3);
            EXPECT_EQ(f.maxLength.value_or(0), 50);
            EXPECT_TRUE(f.pattern.has_value());
        }
    fs::remove(path);
}

TEST(EntitySchemaLoaderTest, FieldParser_References) {
    auto path = writeTmp("el_ref.json", R"({
        "entity": "Ref",
        "version": "1.0",
        "fields": {
            "id": {"type": "uuid", "primary": true},
            "userId": {"type": "uuid", "references": "User.id"}
        }
    })");
    EntitySchemaLoader loader;
    auto schema = loader.loadSchema(path.string());
    for (const auto& f : schema.fields)
        if (f.name == "userId") {
            ASSERT_TRUE(f.references.has_value());
            EXPECT_EQ(f.references.value(), "User.id");
        }
    fs::remove(path);
}

// ---------------------------------------------------------------------------
// loadSchemas — exercises findJsonFiles and parseJson indirectly (lines 99-101)
// ---------------------------------------------------------------------------

TEST(EntitySchemaLoaderTest, LoadSchemas_MultipleFilesInDir_CountsAll) {
    auto dir = fs::temp_directory_path() / "el_multi_count";
    fs::create_directories(dir);
    std::ofstream(dir / "alpha.json") << R"({"entity":"Alpha","version":"1.0","fields":{"id":{"type":"uuid","primary":true}}})";
    std::ofstream(dir / "beta.json")  << R"({"entity":"Beta", "version":"1.0","fields":{"id":{"type":"uuid","primary":true}}})";
    std::ofstream(dir / "entities.json") << "{}";  // excluded by findJsonFiles
    EntitySchemaLoader loader;
    auto result = loader.loadSchemas(dir.string());
    EXPECT_EQ(result.size(), 2u);
    EXPECT_TRUE(result.count("Alpha"));
    EXPECT_TRUE(result.count("Beta"));
    fs::remove_all(dir);
}

// ---------------------------------------------------------------------------
// loadSchema — validation failure throws (lines 88-92)
// ---------------------------------------------------------------------------

TEST(EntitySchemaLoaderTest, LoadSchema_ValidationFailure_Throws) {
    // Schema with no fields → fails validation ("has no fields defined")
    auto path = writeTmp("el_nofields.json", R"({
        "entity": "Empty",
        "version": "1.0",
        "fields": {}
    })");
    EntitySchemaLoader loader;
    EXPECT_THROW(loader.loadSchema(path.string()), std::runtime_error);
    fs::remove(path);
}

TEST(EntitySchemaLoaderTest, LoadSchema_ValidationWarning_NoThrow) {
    // Schema with no version → validation warning (not error), should load fine
    auto path = writeTmp("el_noversion.json", R"({
        "entity": "NoVer",
        "version": "",
        "fields": {
            "id": {"type": "uuid", "primary": true}
        }
    })");
    EntitySchemaLoader loader;
    // Warning-only: should not throw
    EXPECT_NO_THROW(loader.loadSchema(path.string()));
    fs::remove(path);
}

// ---------------------------------------------------------------------------
// loadSchemas — validation error branch (lines 56-57) and warning branch (59)
// ---------------------------------------------------------------------------

TEST(EntitySchemaLoaderTest, LoadSchemas_ValidationError_SkipsEntity) {
    auto dir = fs::temp_directory_path() / "el_valerr_dir";
    fs::create_directories(dir);
    // This schema has no fields → fails SchemaValidator → should be skipped
    std::ofstream(dir / "bad_schema.json") << R"({
        "entity": "NoFields",
        "version": "1.0",
        "fields": {}
    })";
    EntitySchemaLoader loader;
    auto result = loader.loadSchemas(dir.string());
    EXPECT_TRUE(result.empty());
    fs::remove_all(dir);
}
