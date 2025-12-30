/**
 * Command-line argument parser
 */

#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <sstream>

namespace tools {

class ArgParser {
public:
    ArgParser(int argc, char* argv[]) {
        parse(argc, argv);
    }

    /**
     * Get positional argument by index (0-based, excludes flags)
     */
    std::string get_positional(size_t index) const {
        return index < positional_.size() ? positional_[index] : "";
    }

    /**
     * Get option value by name (e.g., --name value)
     */
    std::string get_option(const std::string& name, const std::string& default_value = "") const {
        auto it = options_.find(name);
        return it != options_.end() ? it->second : default_value;
    }

    /**
     * Get integer option
     */
    int get_int_option(const std::string& name, int default_value = 0) const {
        auto value = get_option(name);
        if (value.empty()) return default_value;
        try {
            return std::stoi(value);
        } catch (...) {
            return default_value;
        }
    }

    /**
     * Check if flag is present (e.g., --dry-run)
     */
    bool has_flag(const std::string& name) const {
        return flags_.count(name) > 0;
    }

    /**
     * Get comma-separated list option
     */
    std::vector<std::string> get_list_option(const std::string& name) const {
        auto value = get_option(name);
        if (value.empty()) return {};
        
        std::vector<std::string> result;
        std::stringstream ss(value);
        std::string item;
        
        while (std::getline(ss, item, ',')) {
            // Trim whitespace
            item.erase(0, item.find_first_not_of(" \t"));
            item.erase(item.find_last_not_of(" \t") + 1);
            if (!item.empty()) {
                result.push_back(item);
            }
        }
        
        return result;
    }

    /**
     * Get all positional arguments
     */
    const std::vector<std::string>& positional_args() const {
        return positional_;
    }

private:
    std::vector<std::string> positional_;
    std::unordered_map<std::string, std::string> options_;
    std::unordered_set<std::string> flags_;

    // Options that take values
    const std::unordered_set<std::string> value_options_ = {
        "name", "description", "category", "min-level",
        "entities", "components", "deps", "output"
    };

    void parse(int argc, char* argv[]) {
        for (int i = 1; i < argc; ++i) {
            std::string arg = argv[i];
            
            if (arg.substr(0, 2) == "--") {
                auto name = arg.substr(2);
                
                // Check if this option takes a value
                if (value_options_.count(name) && i + 1 < argc) {
                    options_[name] = argv[++i];
                } else {
                    flags_.insert(name);
                }
            } else if (arg[0] == '-') {
                // Short flag (e.g., -h, -v)
                flags_.insert(arg.substr(1));
            } else {
                positional_.push_back(arg);
            }
        }
    }
};

} // namespace tools
