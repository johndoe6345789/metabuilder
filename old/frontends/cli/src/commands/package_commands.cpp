#include "package_commands.h"
#include "../lua/lua_runner.h"

#include <algorithm>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <sstream>

namespace fs = std::filesystem;

namespace {

void print_package_help() {
    std::cout << R"(Usage: metabuilder-cli package <command> [options]

Commands:
  list                          List available packages with scripts
  run <package> <script> [args] Run a Lua script from a package
  generate <package_id> [opts]  Generate a new package

Generate options:
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

Examples:
  metabuilder-cli package list
  metabuilder-cli package run codegen_studio package_template
  metabuilder-cli package generate my_forum --category social --with-schema --entities Thread,Post
)";
}

fs::path find_packages_dir() {
    // Check environment variable first
    const char* env_path = std::getenv("METABUILDER_PACKAGES");
    if (env_path && fs::exists(env_path)) {
        return env_path;
    }

    // Try relative to current directory
    if (fs::exists("packages")) {
        return fs::absolute("packages");
    }

    // Try relative to executable
    // (would need to pass argv[0] for this)
    
    return {};
}

std::vector<std::string> split_csv(const std::string& str) {
    std::vector<std::string> result;
    std::stringstream ss(str);
    std::string item;
    while (std::getline(ss, item, ',')) {
        // Trim
        item.erase(0, item.find_first_not_of(" \t"));
        item.erase(item.find_last_not_of(" \t") + 1);
        if (!item.empty()) {
            result.push_back(item);
        }
    }
    return result;
}

int handle_list(const fs::path& packages_dir) {
    std::cout << "Available packages with scripts:\n\n";
    
    int count = 0;
    for (const auto& entry : fs::directory_iterator(packages_dir)) {
        if (!entry.is_directory()) continue;
        
        auto scripts_path = entry.path() / "seed" / "scripts";
        if (!fs::exists(scripts_path)) continue;
        
        std::cout << "  " << entry.path().filename().string() << "\n";
        
        // List available scripts/modules
        for (const auto& script : fs::directory_iterator(scripts_path)) {
            if (script.is_directory()) {
                auto init = script.path() / "init.lua";
                if (fs::exists(init)) {
                    std::cout << "    - " << script.path().filename().string() << "\n";
                }
            } else if (script.path().extension() == ".lua") {
                auto name = script.path().stem().string();
                if (name != "init") {
                    std::cout << "    - " << name << "\n";
                }
            }
        }
        ++count;
    }
    
    if (count == 0) {
        std::cout << "  (no packages with scripts found)\n";
    }
    
    return 0;
}

int handle_run(const fs::path& packages_dir, const std::vector<std::string>& args) {
    if (args.size() < 4) {
        std::cerr << "Usage: metabuilder-cli package run <package> <script> [function] [args...]\n";
        return 1;
    }

    const auto& package_id = args[2];
    const auto& script_name = args[3];
    std::string func_name = args.size() > 4 ? args[4] : "main";

    lua::LuaRunner runner(packages_dir);
    
    if (!runner.load_module(package_id, script_name)) {
        std::cerr << "Error: " << runner.last_error() << "\n";
        return 1;
    }

    // Build config from remaining args
    lua::LuaConfig config;
    for (size_t i = 5; i < args.size(); ++i) {
        const auto& arg = args[i];
        if (arg.substr(0, 2) == "--" && i + 1 < args.size()) {
            auto key = arg.substr(2);
            auto value = args[++i];
            config[key] = value;
        }
    }

    auto result = runner.call(func_name, config);
    
    if (!result.success) {
        std::cerr << "Error: " << result.error << "\n";
        return 1;
    }

    if (!result.output.empty()) {
        std::cout << result.output << "\n";
    }

    return 0;
}

int handle_generate(const fs::path& packages_dir, const std::vector<std::string>& args) {
    if (args.size() < 3) {
        std::cerr << "Usage: metabuilder-cli package generate <package_id> [options]\n";
        return 1;
    }

    const auto& package_id = args[2];
    
    // Validate package_id format
    if (package_id.empty() || !std::isalpha(package_id[0])) {
        std::cerr << "Error: package_id must start with a letter\n";
        return 1;
    }
    for (char c : package_id) {
        if (!std::isalnum(c) && c != '_') {
            std::cerr << "Error: package_id must contain only letters, numbers, and underscores\n";
            return 1;
        }
        if (std::isupper(c)) {
            std::cerr << "Error: package_id must be lowercase\n";
            return 1;
        }
    }

    // Parse options
    lua::LuaConfig config;
    config["packageId"] = package_id;
    config["category"] = std::string("ui");
    config["minLevel"] = int64_t(2);
    config["primary"] = true;
    config["withSchema"] = false;
    config["withTests"] = true;
    config["withComponents"] = false;
    
    bool dry_run = false;
    std::string output_dir = packages_dir.string();

    for (size_t i = 3; i < args.size(); ++i) {
        const auto& arg = args[i];
        
        if (arg == "--name" && i + 1 < args.size()) {
            config["name"] = args[++i];
        } else if (arg == "--description" && i + 1 < args.size()) {
            config["description"] = args[++i];
        } else if (arg == "--category" && i + 1 < args.size()) {
            config["category"] = args[++i];
        } else if (arg == "--min-level" && i + 1 < args.size()) {
            config["minLevel"] = int64_t(std::stoi(args[++i]));
        } else if (arg == "--primary") {
            config["primary"] = true;
        } else if (arg == "--dependency") {
            config["primary"] = false;
        } else if (arg == "--with-schema") {
            config["withSchema"] = true;
        } else if (arg == "--entities" && i + 1 < args.size()) {
            config["entities"] = split_csv(args[++i]);
        } else if (arg == "--with-components") {
            config["withComponents"] = true;
        } else if (arg == "--components" && i + 1 < args.size()) {
            config["components"] = split_csv(args[++i]);
        } else if (arg == "--deps" && i + 1 < args.size()) {
            config["dependencies"] = split_csv(args[++i]);
        } else if (arg == "--output" && i + 1 < args.size()) {
            output_dir = args[++i];
        } else if (arg == "--dry-run") {
            dry_run = true;
        }
    }

    // Load package_template module from codegen_studio
    lua::LuaRunner runner(packages_dir);
    
    if (!runner.load_module("codegen_studio", "package_template")) {
        std::cerr << "Error: Could not load package_template module\n";
        std::cerr << "  " << runner.last_error() << "\n";
        std::cerr << "  Make sure you're running from the MetaBuilder project root\n";
        return 1;
    }

    // Validate config
    auto validation = runner.validate("validate_config", config);
    if (!validation.valid) {
        std::cerr << "Validation failed:\n";
        for (const auto& err : validation.errors) {
            std::cerr << "  - " << err << "\n";
        }
        return 1;
    }

    // Generate files
    auto result = runner.call("generate", config);
    
    if (!result.success) {
        std::cerr << "Error generating package: " << result.error << "\n";
        return 1;
    }

    if (result.files.empty()) {
        std::cerr << "Error: No files generated\n";
        return 1;
    }

    // Check if package already exists
    fs::path package_path = fs::path(output_dir) / package_id;
    if (fs::exists(package_path) && !dry_run) {
        std::cerr << "Error: Package directory already exists: " << package_path << "\n";
        return 1;
    }

    if (dry_run) {
        std::cout << "Would generate " << result.files.size() << " files in " << package_path << ":\n\n";
        for (const auto& file : result.files) {
            std::cout << "  " << file.path << " (" << file.content.size() << " bytes)\n";
        }
        return 0;
    }

    // Write files
    std::cout << "Generating package: " << package_id << "\n";
    std::cout << "  Location: " << package_path << "\n\n";

    int written = 0;
    for (const auto& file : result.files) {
        fs::path full_path = package_path / file.path;
        fs::path dir = full_path.parent_path();
        
        if (!dir.empty() && !fs::exists(dir)) {
            fs::create_directories(dir);
        }
        
        std::ofstream out(full_path, std::ios::binary);
        if (!out) {
            std::cerr << "  Error writing: " << file.path << "\n";
            continue;
        }
        
        out << file.content;
        out.close();
        
        std::cout << "  Created: " << file.path << "\n";
        ++written;
    }

    std::cout << "\n✅ Package '" << package_id << "' created successfully!\n";
    std::cout << "   Files: " << written << "\n";
    std::cout << "\nNext steps:\n";
    std::cout << "  1. Review generated files in " << package_path << "\n";
    std::cout << "  2. Add package-specific logic to seed/scripts/\n";
    std::cout << "  3. Run: npm run packages:index\n";
    
    return 0;
}

} // namespace

namespace commands {

int handle_package(const std::vector<std::string>& args) {
    if (args.size() < 2 || args[1] == "help" || args[1] == "--help") {
        print_package_help();
        return 0;
    }

    auto packages_dir = find_packages_dir();
    if (packages_dir.empty()) {
        std::cerr << "Error: Could not find packages directory\n";
        std::cerr << "Run from the MetaBuilder project root or set METABUILDER_PACKAGES\n";
        return 1;
    }

    const auto& subcommand = args[1];

    if (subcommand == "list") {
        return handle_list(packages_dir);
    }
    
    if (subcommand == "run") {
        return handle_run(packages_dir, args);
    }
    
    if (subcommand == "generate") {
        return handle_generate(packages_dir, args);
    }

    std::cerr << "Unknown package subcommand: " << subcommand << "\n";
    print_package_help();
    return 1;
}

} // namespace commands
