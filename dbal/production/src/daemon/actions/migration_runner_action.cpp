#include "migration_runner_action.hpp"
#include "schema_loader_action.hpp"

#include <filesystem>

namespace fs = std::filesystem;

namespace dbal {
namespace daemon {
namespace actions {

void MigrationRunnerAction::handle_scan(const std::string& registry_path,
                                        const std::string& packages_path,
                                        ResponseSender send_success,
                                        ErrorSender send_error) {
    try {
        auto registry = SchemaLoaderAction::load_registry(registry_path);

        int scanned = 0;
        int queued = 0;
        ::Json::Value errors(::Json::arrayValue);

        if (!fs::exists(packages_path)) {
            send_error("Packages directory not found: " + packages_path, 404);
            return;
        }

        for (const auto& entry : fs::directory_iterator(packages_path)) {
            if (!entry.is_directory()) continue;

            const std::string pkg_name = entry.path().filename().string();
            const fs::path schema_path = entry.path() / "seed" / "schema" / "entities.json";

            if (!fs::exists(schema_path)) continue;

            scanned++;

            // JSON parsing can be done with nlohmann/json
            // For now, just detect that schema exists and queue for review
            // The actual parsing is done by the Next.js API
        }

        SchemaLoaderAction::save_registry(registry, registry_path);

        ::Json::Value response;
        response["status"] = "ok";
        response["action"] = "scan";
        response["packagesScanned"] = scanned;
        response["changesQueued"] = queued;
        response["errors"] = errors;
        response["note"] = "Full schema parsing delegated to Next.js API";

        send_success(response);
    } catch (const std::exception& e) {
        send_error(std::string("Scan failed: ") + e.what(), 500);
    }
}

} // namespace actions
} // namespace daemon
} // namespace dbal
