/**
 * @file seed_loader_action.hpp
 * @brief Loads seed data from JSON files into the database via generic entity CRUD
 */

#pragma once

#include <string>
#include <vector>
#include <set>
#include <nlohmann/json.hpp>
#include "dbal/core/client.hpp"

namespace dbal {
namespace daemon {
namespace actions {

struct SeedResult {
    std::string entity;
    int inserted = 0;
    int skipped = 0;
    int failed = 0;
    std::vector<std::string> errors;
};

struct SeedSummary {
    bool success = true;
    int total_inserted = 0;
    int total_skipped = 0;
    int total_failed = 0;
    std::vector<SeedResult> results;
    std::vector<std::string> errors;
};

class SeedLoaderAction {
public:
    static SeedSummary loadSeeds(Client& client, const std::string& seed_dir, bool force = false);
    static std::vector<SeedResult> loadSeedFile(Client& client, const std::string& file_path, bool force = false);
    static std::string getDefaultSeedDir();

private:
    static void applyCurrentTimestamps(nlohmann::json& record, const std::string& timestamp_field);
    static std::vector<std::string> getSeedLoadOrder();
};

} // namespace actions
} // namespace daemon
} // namespace dbal
