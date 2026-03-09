#include "dbal/core/loaders/json_parser.hpp"
#include <filesystem>
#include <fstream>
#include <spdlog/spdlog.h>

namespace fs = std::filesystem;

namespace dbal {
namespace core {
namespace loaders {

nlohmann::json JsonParser::loadFile(const std::string& filePath) {
    if (!fs::exists(filePath)) {
        throw std::runtime_error("JSON file does not exist: " + filePath);
    }
    try {
        std::ifstream f(filePath);
        return nlohmann::json::parse(f);
    } catch (const nlohmann::json::parse_error& e) {
        throw std::runtime_error("Failed to parse JSON file " + filePath + ": " + e.what());
    }
}

std::vector<std::string> JsonParser::findJsonFiles(const std::string& dir) {
    std::vector<std::string> files;
    if (!fs::exists(dir) || !fs::is_directory(dir)) return files;

    try {
        for (const auto& entry : fs::recursive_directory_iterator(dir)) {
            if (!entry.is_regular_file()) continue;
            const auto& path = entry.path();
            if (path.extension() != ".json") continue;
            // Skip the root entities.json metadata file
            if (path.filename() == "entities.json") continue;
            files.push_back(path.string());
        }
    } catch (const fs::filesystem_error& e) {
        spdlog::error("Error scanning directory {}: {}", dir, e.what());
    }
    return files;
}

bool JsonParser::fileExists(const std::string& filePath) {
    return fs::exists(filePath) && fs::is_regular_file(filePath);
}

}  // namespace loaders
}  // namespace core
}  // namespace dbal
