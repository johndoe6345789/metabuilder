/**
 * @file schema_acl_registry_test.cpp
 * @brief Phase 2 gate: schema.acl.system enforcement must apply to entities
 *        that declare it (Credential) and must NOT affect entities that
 *        don't (regression check against Session and an ordinary entity).
 */

#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>

#include "core/schema_acl_registry.hpp"

using dbal::core::SchemaAclRegistry;

namespace {

// Build a tiny throwaway schema directory so this test doesn't depend on
// the real shared/api/schema tree (and stays correct if that tree changes).
class TempSchemaDir {
public:
    TempSchemaDir() {
        dir_ = std::filesystem::temp_directory_path() / "dbal_test_schema_acl_dir";
        std::filesystem::remove_all(dir_);
        std::filesystem::create_directories(dir_);
    }
    ~TempSchemaDir() { std::filesystem::remove_all(dir_); }

    void writeSchema(const std::string& filename, const std::string& json) {
        std::ofstream out(dir_ / filename);
        out << json;
    }

    std::string path() const { return dir_.string(); }

private:
    std::filesystem::path dir_;
};

} // namespace

TEST(SchemaAclRegistry, SystemOnlyEntityIsFlagged) {
    TempSchemaDir dir;
    dir.writeSchema("Credential.json", R"({
        "entity": "Credential",
        "fields": { "username": { "type": "string" }, "passwordHash": { "type": "string", "sensitive": true } },
        "acl": {
            "create": { "system": true },
            "read":   { "system": true },
            "update": { "system": true },
            "delete": { "system": true }
        }
    })");

    SchemaAclRegistry registry(dir.path());
    EXPECT_TRUE(registry.isSystemOnly("Credential", "create"));
    EXPECT_TRUE(registry.isSystemOnly("Credential", "read"));
    EXPECT_TRUE(registry.isSystemOnly("Credential", "update"));
    EXPECT_TRUE(registry.isSystemOnly("Credential", "delete"));
}

TEST(SchemaAclRegistry, OrdinaryEntityIsNotFlagged) {
    TempSchemaDir dir;
    dir.writeSchema("Snippet.json", R"({
        "entity": "Snippet",
        "fields": { "title": { "type": "string" } }
    })");

    SchemaAclRegistry registry(dir.path());
    EXPECT_FALSE(registry.isSystemOnly("Snippet", "create"));
    EXPECT_FALSE(registry.isSystemOnly("Snippet", "read"));
    EXPECT_FALSE(registry.isSystemOnly("Snippet", "update"));
    EXPECT_FALSE(registry.isSystemOnly("Snippet", "delete"));
}

TEST(SchemaAclRegistry, PartialAclOnlyFlagsDeclaredOperations) {
    TempSchemaDir dir;
    // Only "create" is system-only — read/update/delete should stay open,
    // proving this isn't an all-or-nothing per-entity flag.
    dir.writeSchema("Partial.json", R"({
        "entity": "Partial",
        "fields": { "id": { "type": "string" } },
        "acl": { "create": { "system": true } }
    })");

    SchemaAclRegistry registry(dir.path());
    EXPECT_TRUE(registry.isSystemOnly("Partial", "create"));
    EXPECT_FALSE(registry.isSystemOnly("Partial", "read"));
    EXPECT_FALSE(registry.isSystemOnly("Partial", "update"));
    EXPECT_FALSE(registry.isSystemOnly("Partial", "delete"));
}

TEST(SchemaAclRegistry, UnknownEntityIsNotFlagged) {
    TempSchemaDir dir;
    dir.writeSchema("Snippet.json", R"({"entity": "Snippet", "fields": {"title": {"type": "string"}}})");

    SchemaAclRegistry registry(dir.path());
    EXPECT_FALSE(registry.isSystemOnly("DoesNotExist", "read"));
}
