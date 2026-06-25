#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>

namespace dbal {
namespace core {
namespace loaders {

/**
 * @brief Handles JSON file parsing and discovery
 */
class JsonParser {
public:
    /** Load JSON file, throws std::runtime_error on failure */
    nlohmann::json loadFile(const std::string& filePath);

    /** Recursively find all .json files in dir (excludes entities.json metadata) */
    std::vector<std::string> findJsonFiles(const std::string& dir);

    bool fileExists(const std::string& filePath);
};

}  // namespace loaders
}  // namespace core
}  // namespace dbal
