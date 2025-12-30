/**
 * Package Template Generator CLI
 * 
 * C++ CLI that executes Lua scripts to generate MetaBuilder package scaffolding.
 * 
 * Usage:
 *   package_generator new <package_id> [options]
 *   package_generator quick <package_id> [options]
 *   package_generator list-categories
 *   package_generator validate <config.json>
 * 
 * Examples:
 *   package_generator new my_package --category tools --min-level 3
 *   package_generator quick my_widget --dependency
 *   package_generator new my_forum --with-schema --entities Thread,Post
 */

#include <iostream>
#include <string>
#include <vector>
#include <filesystem>
#include <fstream>
#include <sstream>

#include "lua_runner.hpp"
#include "arg_parser.hpp"
#include "file_writer.hpp"

namespace fs = std::filesystem;

constexpr const char* VERSION = "1.0.0";
constexpr const char* PROGRAM_NAME = "package_generator";

void print_help() {
    std::cout << R"(
Package Template Generator v)" << VERSION << R"(

USAGE:
    )" << PROGRAM_NAME << R"( <command> [options]

COMMANDS:
    new <package_id>        Create a new package with full scaffolding
    quick <package_id>      Create a minimal package quickly
    list-categories         List available package categories
    validate <file>         Validate a package config JSON file
    help                    Show this help message

OPTIONS:
    --name <name>           Display name (default: derived from package_id)
    --description <desc>    Package description
    --category <cat>        Package category (default: ui)
    --min-level <n>         Minimum access level 0-6 (default: 2)
    --primary               Package can own routes (default)
    --dependency            Package is dependency-only
    --with-schema           Include database schema scaffolding
    --entities <e1,e2>      Entity names for schema (comma-separated)
    --with-components       Include component scaffolding
    --components <c1,c2>    Component names (comma-separated)
    --deps <d1,d2>          Package dependencies (comma-separated)
    --output <dir>          Output directory (default: ./packages)
    --dry-run               Preview files without writing

CATEGORIES:
    ui, editors, tools, social, media, gaming,
    admin, config, core, demo, development, managers

EXAMPLES:
    )" << PROGRAM_NAME << R"( new my_package
    )" << PROGRAM_NAME << R"( new my_forum --with-schema --entities Thread,Post,Reply
    )" << PROGRAM_NAME << R"( quick my_widget --dependency --category ui
    )" << PROGRAM_NAME << R"( new dashboard --with-components --components StatCard,Chart

)";
}

void print_version() {
    std::cout << PROGRAM_NAME << " version " << VERSION << std::endl;
}

int cmd_new(const tools::ArgParser& args, tools::LuaRunner& lua) {
    auto package_id = args.get_positional(1);
    if (package_id.empty()) {
        std::cerr << "Error: package_id is required\n";
        std::cerr << "Usage: " << PROGRAM_NAME << " new <package_id> [options]\n";
        return 1;
    }

    // Build config table for Lua
    tools::LuaConfig config;
    config.set("packageId", package_id);
    config.set("name", args.get_option("name", ""));
    config.set("description", args.get_option("description", ""));
    config.set("category", args.get_option("category", "ui"));
    config.set("minLevel", args.get_int_option("min-level", 2));
    config.set("primary", !args.has_flag("dependency"));
    config.set("withSchema", args.has_flag("with-schema"));
    config.set("withTests", true);
    config.set("withComponents", args.has_flag("with-components"));
    
    // Parse comma-separated lists
    config.set_list("entities", args.get_list_option("entities"));
    config.set_list("components", args.get_list_option("components"));
    config.set_list("dependencies", args.get_list_option("deps"));

    // Validate config via Lua
    auto validation = lua.call<tools::ValidationResult>("package_template.validate_config", config);
    if (!validation.valid) {
        std::cerr << "Validation failed:\n";
        for (const auto& err : validation.errors) {
            std::cerr << "  - " << err << "\n";
        }
        return 1;
    }

    // Generate files
    auto files = lua.call<tools::GeneratedFiles>("package_template.generate", config);
    
    if (args.has_flag("dry-run")) {
        std::cout << "Would generate " << files.size() << " files:\n";
        for (const auto& file : files) {
            std::cout << "  " << file.path << " (" << file.content.size() << " bytes)\n";
        }
        return 0;
    }

    // Write files
    auto output_dir = args.get_option("output", "packages");
    auto package_path = fs::path(output_dir) / package_id;
    
    if (fs::exists(package_path)) {
        std::cerr << "Error: Package directory already exists: " << package_path << "\n";
        return 1;
    }

    tools::FileWriter writer(package_path);
    int written = writer.write_all(files);
    
    std::cout << "\n✅ Package '" << package_id << "' created successfully!\n";
    std::cout << "   Location: " << package_path << "\n";
    std::cout << "   Files: " << written << "\n";
    std::cout << "\nNext steps:\n";
    std::cout << "  1. Review generated files in " << package_path << "\n";
    std::cout << "  2. Add package-specific logic to seed/scripts/\n";
    std::cout << "  3. Run tests: npm run test:package " << package_id << "\n";
    
    return 0;
}

int cmd_quick(const tools::ArgParser& args, tools::LuaRunner& lua) {
    auto package_id = args.get_positional(1);
    if (package_id.empty()) {
        std::cerr << "Error: package_id is required\n";
        return 1;
    }

    // Minimal config
    tools::LuaConfig config;
    config.set("packageId", package_id);
    config.set("category", args.get_option("category", "ui"));
    config.set("minLevel", args.get_int_option("min-level", 2));
    config.set("primary", !args.has_flag("dependency"));
    config.set("withSchema", false);
    config.set("withTests", false);
    config.set("withComponents", false);

    auto files = lua.call<tools::GeneratedFiles>("package_template.generate_quick", config);
    
    if (args.has_flag("dry-run")) {
        std::cout << "Would generate " << files.size() << " files:\n";
        for (const auto& file : files) {
            std::cout << "  " << file.path << "\n";
        }
        return 0;
    }

    auto output_dir = args.get_option("output", "packages");
    auto package_path = fs::path(output_dir) / package_id;
    
    if (fs::exists(package_path)) {
        std::cerr << "Error: Package directory already exists: " << package_path << "\n";
        return 1;
    }

    tools::FileWriter writer(package_path);
    writer.write_all(files);
    
    std::cout << "✅ Package '" << package_id << "' created (quick mode)\n";
    return 0;
}

int cmd_list_categories(tools::LuaRunner& lua) {
    auto categories = lua.call<std::vector<std::string>>("package_template.get_categories");
    
    std::cout << "Available package categories:\n\n";
    for (const auto& cat : categories) {
        std::cout << "  - " << cat << "\n";
    }
    return 0;
}

int cmd_validate(const tools::ArgParser& args, tools::LuaRunner& lua) {
    auto config_file = args.get_positional(1);
    if (config_file.empty()) {
        std::cerr << "Error: config file path is required\n";
        return 1;
    }

    if (!fs::exists(config_file)) {
        std::cerr << "Error: File not found: " << config_file << "\n";
        return 1;
    }

    // Read JSON config
    std::ifstream file(config_file);
    std::stringstream buffer;
    buffer << file.rdbuf();
    
    auto config = tools::LuaConfig::from_json(buffer.str());
    auto validation = lua.call<tools::ValidationResult>("package_template.validate_config", config);
    
    if (validation.valid) {
        std::cout << "✅ Configuration is valid\n";
        return 0;
    } else {
        std::cout << "❌ Configuration has errors:\n";
        for (const auto& err : validation.errors) {
            std::cout << "  - " << err << "\n";
        }
        return 1;
    }
}

int main(int argc, char* argv[]) {
    tools::ArgParser args(argc, argv);
    
    if (args.has_flag("help") || args.has_flag("h") || argc < 2) {
        print_help();
        return 0;
    }
    
    if (args.has_flag("version") || args.has_flag("v")) {
        print_version();
        return 0;
    }

    auto command = args.get_positional(0);
    
    // Initialize Lua runner with package scripts path
    auto scripts_path = fs::current_path() / "packages" / "codegen_studio" / "seed" / "scripts";
    if (!fs::exists(scripts_path)) {
        // Try relative to executable
        auto exe_path = fs::path(argv[0]).parent_path();
        scripts_path = exe_path / ".." / ".." / "packages" / "codegen_studio" / "seed" / "scripts";
    }
    
    tools::LuaRunner lua(scripts_path);
    
    if (!lua.load_module("package_template")) {
        std::cerr << "Error: Failed to load package_template module\n";
        std::cerr << "Looked in: " << scripts_path << "\n";
        return 1;
    }

    if (command == "new") {
        return cmd_new(args, lua);
    } else if (command == "quick") {
        return cmd_quick(args, lua);
    } else if (command == "list-categories") {
        return cmd_list_categories(lua);
    } else if (command == "validate") {
        return cmd_validate(args, lua);
    } else if (command == "help") {
        print_help();
        return 0;
    } else {
        std::cerr << "Unknown command: " << command << "\n";
        std::cerr << "Run '" << PROGRAM_NAME << " help' for usage\n";
        return 1;
    }
}
