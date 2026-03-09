/**
 * @file schema_loader_test.cpp
 * @brief Unit tests for SchemaLoader: relations, query config, field parsing.
 * Uses the header-only SchemaLoader — no DB driver needed.
 */

#include <gtest/gtest.h>
#include <fstream>
#include <filesystem>
#include <nlohmann/json.hpp>
#include "adapters/schema_loader.hpp"

using namespace dbal::adapters;

class SchemaLoaderTest : public ::testing::Test {
protected:
    std::filesystem::path tmp_dir;

    void SetUp() override {
        tmp_dir = std::filesystem::temp_directory_path() / "dbal_schema_test";
        std::filesystem::create_directories(tmp_dir);
    }

    void TearDown() override {
        std::filesystem::remove_all(tmp_dir);
    }

    std::string writeSchema(const nlohmann::json& schema) {
        const std::string name = schema.value("entity", std::string("Test"));
        const std::string path = (tmp_dir / (name + ".json")).string();
        std::ofstream f(path);
        f << schema.dump(2);
        return path;
    }
};

// ===== Basic field parsing =====

TEST_F(SchemaLoaderTest, LoadsEntityName) {
    auto path = writeSchema({
        {"entity", "Snippet"},
        {"fields", {{"id", {{"type","uuid"},{"primary",true},{"required",true}}}}}
    });
    auto entity = SchemaLoader::loadFromFile(path);
    ASSERT_TRUE(entity.has_value());
    EXPECT_EQ(entity->name, "Snippet");
}

TEST_F(SchemaLoaderTest, LoadsRequiredField) {
    auto path = writeSchema({
        {"entity", "Snippet"},
        {"fields", {
            {"id",    {{"type","uuid"},  {"primary",true}, {"required",true}}},
            {"title", {{"type","string"},{"required",true},{"min_length",1},{"max_length",255}}}
        }}
    });
    auto entity = SchemaLoader::loadFromFile(path);
    ASSERT_TRUE(entity.has_value());
    ASSERT_EQ(entity->fields.size(), 2u);

    const auto* title = [&]() -> const FieldDefinition* {
        for (const auto& f : entity->fields) if (f.name == "title") return &f;
        return nullptr;
    }();
    ASSERT_NE(title, nullptr);
    EXPECT_TRUE(title->required);
    EXPECT_EQ(title->min_length, std::optional<int>(1));
    EXPECT_EQ(title->max_length, std::optional<int>(255));
}

TEST_F(SchemaLoaderTest, SkipsRelationshipTypeFields) {
    auto path = writeSchema({
        {"entity", "Test"},
        {"fields", {
            {"id",   {{"type","uuid"},{"primary",true}}},
            {"link", {{"type","relationship"}}}  // should be skipped
        }}
    });
    auto entity = SchemaLoader::loadFromFile(path);
    ASSERT_TRUE(entity.has_value());
    EXPECT_EQ(entity->fields.size(), 1u);  // only "id"
}

// ===== Relation parsing =====

TEST_F(SchemaLoaderTest, ParsesRelationsSection) {
    auto path = writeSchema({
        {"entity", "Namespace"},
        {"fields", {{"id", {{"type","uuid"},{"primary",true}}}}},
        {"relations", {
            {"snippets", {
                {"type",        "has-many"},
                {"entity",      "Snippet"},
                {"foreign_key", "namespaceId"},
                {"cascade_delete", true}
            }}
        }}
    });
    auto entity = SchemaLoader::loadFromFile(path);
    ASSERT_TRUE(entity.has_value());
    ASSERT_EQ(entity->relations.size(), 1u);
    EXPECT_EQ(entity->relations[0].name, "snippets");
    EXPECT_EQ(entity->relations[0].type, "has-many");
    EXPECT_EQ(entity->relations[0].entity, "Snippet");
    EXPECT_EQ(entity->relations[0].foreign_key, "namespaceId");
    EXPECT_TRUE(entity->relations[0].cascade_delete);
}

TEST_F(SchemaLoaderTest, SkipsRelationWithMissingEntity) {
    auto path = writeSchema({
        {"entity", "Test"},
        {"fields", {{"id", {{"type","uuid"}}}}},
        {"relations", {
            {"broken_rel", {{"type","has-many"}}}  // no "entity" key — should be skipped
        }}
    });
    auto entity = SchemaLoader::loadFromFile(path);
    ASSERT_TRUE(entity.has_value());
    EXPECT_EQ(entity->relations.size(), 0u);
}

// ===== Query config parsing =====

TEST_F(SchemaLoaderTest, ParsesQueryConfig) {
    auto path = writeSchema({
        {"entity", "Snippet"},
        {"fields", {{"id", {{"type","uuid"}}}}},
        {"query", {
            {"allowed_operators", {"eq","gt","lt","like","in"}},
            {"allowed_group_by",  {"language","category"}},
            {"allowed_includes",  {"namespace"}},
            {"max_results",       500},
            {"timeout_ms",        5000}
        }}
    });
    auto entity = SchemaLoader::loadFromFile(path);
    ASSERT_TRUE(entity.has_value());
    EXPECT_EQ(entity->query_config.max_results, 500);
    EXPECT_EQ(entity->query_config.timeout_ms, 5000);
    ASSERT_EQ(entity->query_config.allowed_operators.size(), 5u);
    EXPECT_EQ(entity->query_config.allowed_operators[0], "eq");
    ASSERT_EQ(entity->query_config.allowed_includes.size(), 1u);
    EXPECT_EQ(entity->query_config.allowed_includes[0], "namespace");
}

TEST_F(SchemaLoaderTest, MissingQuerySectionUsesDefaults) {
    auto path = writeSchema({{"entity","Test"},{"fields",{{"id",{{"type","uuid"}}}}}});
    auto entity = SchemaLoader::loadFromFile(path);
    ASSERT_TRUE(entity.has_value());
    EXPECT_EQ(entity->query_config.max_results, 1000);  // default
    EXPECT_EQ(entity->query_config.timeout_ms,  0);     // default
    EXPECT_TRUE(entity->query_config.allowed_operators.empty());
}

// ===== Index parsing =====

TEST_F(SchemaLoaderTest, ParsesCompositeUniqueIndex) {
    auto path = writeSchema({
        {"entity", "Namespace"},
        {"fields", {{"id",{{"type","uuid"}}},{"userId",{{"type","string"}}},{"name",{{"type","string"}}}}},
        {"indexes", {{{"fields",{"userId","name"}},{"unique",true}}}}
    });
    auto entity = SchemaLoader::loadFromFile(path);
    ASSERT_TRUE(entity.has_value());
    ASSERT_EQ(entity->indexes.size(), 1u);
    EXPECT_TRUE(entity->indexes[0].unique);
    ASSERT_EQ(entity->indexes[0].fields.size(), 2u);
    EXPECT_EQ(entity->indexes[0].fields[0], "userId");
    EXPECT_EQ(entity->indexes[0].fields[1], "name");
}

// ===== loadFromDirectory =====

TEST_F(SchemaLoaderTest, LoadsMultipleEntitiesFromDirectory) {
    {
        std::ofstream f((tmp_dir / "Snippet.json").string());
        f << R"({"entity":"Snippet","fields":{"id":{"type":"uuid","primary":true}}})";
    }
    {
        std::ofstream f((tmp_dir / "Namespace.json").string());
        f << R"({"entity":"Namespace","fields":{"id":{"type":"uuid","primary":true}}})";
    }
    auto entities = SchemaLoader::loadFromDirectory(tmp_dir.string());
    EXPECT_EQ(entities.size(), 2u);
}

TEST_F(SchemaLoaderTest, SkipsEntitiesJsonIndex) {
    // entities.json is ignored by loadFromDirectory
    {
        std::ofstream f((tmp_dir / "entities.json").string());
        f << R"([{"entity":"ShouldSkip","fields":{}}])";
    }
    {
        std::ofstream f((tmp_dir / "Snippet.json").string());
        f << R"({"entity":"Snippet","fields":{"id":{"type":"uuid"}}})";
    }
    auto entities = SchemaLoader::loadFromDirectory(tmp_dir.string());
    for (const auto& e : entities) {
        EXPECT_NE(e.name, "ShouldSkip");
    }
    EXPECT_EQ(entities.size(), 1u);
}
