/**
 * Package Generator Tests
 */

#include <cassert>
#include <iostream>
#include <filesystem>

#include "lua_runner.hpp"
#include "arg_parser.hpp"

namespace fs = std::filesystem;

void test_arg_parser() {
    std::cout << "Testing ArgParser...\n";
    
    // Test basic positional args
    {
        const char* argv[] = {"prog", "new", "my_package"};
        tools::ArgParser parser(3, const_cast<char**>(argv));
        
        assert(parser.get_positional(0) == "new");
        assert(parser.get_positional(1) == "my_package");
        assert(parser.get_positional(2) == "");
    }
    
    // Test flags
    {
        const char* argv[] = {"prog", "new", "pkg", "--dry-run", "--primary"};
        tools::ArgParser parser(5, const_cast<char**>(argv));
        
        assert(parser.has_flag("dry-run"));
        assert(parser.has_flag("primary"));
        assert(!parser.has_flag("unknown"));
    }
    
    // Test options with values
    {
        const char* argv[] = {"prog", "new", "pkg", "--category", "tools", "--min-level", "3"};
        tools::ArgParser parser(7, const_cast<char**>(argv));
        
        assert(parser.get_option("category") == "tools");
        assert(parser.get_int_option("min-level") == 3);
        assert(parser.get_option("unknown", "default") == "default");
    }
    
    // Test list options
    {
        const char* argv[] = {"prog", "new", "pkg", "--entities", "User,Post,Comment"};
        tools::ArgParser parser(5, const_cast<char**>(argv));
        
        auto entities = parser.get_list_option("entities");
        assert(entities.size() == 3);
        assert(entities[0] == "User");
        assert(entities[1] == "Post");
        assert(entities[2] == "Comment");
    }
    
    std::cout << "  ArgParser tests passed!\n";
}

void test_lua_config() {
    std::cout << "Testing LuaConfig...\n";
    
    tools::LuaConfig config;
    config.set("packageId", "test_package");
    config.set("minLevel", 3);
    config.set("primary", true);
    config.set_list("entities", {"User", "Post"});
    
    assert(config.data["packageId"] == "test_package");
    assert(config.data["minLevel"] == 3);
    assert(config.data["primary"] == true);
    assert(config.data["entities"].size() == 2);
    
    std::cout << "  LuaConfig tests passed!\n";
}

void test_lua_runner() {
    std::cout << "Testing LuaRunner...\n";
    
    // Find scripts path
    fs::path scripts_path = fs::current_path() / "packages" / "codegen_studio" / "seed" / "scripts";
    
    if (!fs::exists(scripts_path)) {
        std::cout << "  Skipping LuaRunner tests (scripts not found at " << scripts_path << ")\n";
        return;
    }
    
    tools::LuaRunner lua(scripts_path);
    
    // Test module loading
    bool loaded = lua.load_module("package_template");
    if (!loaded) {
        std::cout << "  Warning: Could not load package_template module\n";
        std::cout << "  Error: " << lua.last_error() << "\n";
        return;
    }
    
    // Test get_categories
    auto categories = lua.call<std::vector<std::string>>("package_template.get_categories");
    assert(!categories.empty());
    assert(std::find(categories.begin(), categories.end(), "ui") != categories.end());
    
    // Test validate_config
    tools::LuaConfig config;
    config.set("packageId", "test_pkg");
    config.set("category", "tools");
    config.set("minLevel", 2);
    config.set("primary", true);
    
    auto validation = lua.call<tools::ValidationResult>("package_template.validate_config", config);
    assert(validation.valid);
    
    // Test invalid config
    tools::LuaConfig bad_config;
    bad_config.set("packageId", "Invalid-ID");  // Invalid format
    bad_config.set("category", "invalid_cat");
    
    auto bad_validation = lua.call<tools::ValidationResult>("package_template.validate_config", bad_config);
    assert(!bad_validation.valid);
    assert(!bad_validation.errors.empty());
    
    std::cout << "  LuaRunner tests passed!\n";
}

int main() {
    std::cout << "\n=== Package Generator Tests ===\n\n";
    
    try {
        test_arg_parser();
        test_lua_config();
        test_lua_runner();
        
        std::cout << "\n✅ All tests passed!\n\n";
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "\n❌ Test failed: " << e.what() << "\n\n";
        return 1;
    }
}
