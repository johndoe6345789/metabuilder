#include "schema_validator_action.hpp"
#include "schema_loader_action.hpp"

#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>

namespace dbal {
namespace daemon {
namespace actions {

std::string SchemaValidatorAction::get_iso_timestamp() {
    auto now = std::chrono::system_clock::now();
    auto time_t_now = std::chrono::system_clock::to_time_t(now);
    std::tm tm_now{};
#ifdef _WIN32
    gmtime_s(&tm_now, &time_t_now);
#else
    gmtime_r(&time_t_now, &tm_now);
#endif
    std::ostringstream oss;
    oss << std::put_time(&tm_now, "%Y-%m-%dT%H:%M:%SZ");
    return oss.str();
}

void SchemaValidatorAction::handle_approve(const std::string& registry_path,
                                           const std::string& id,
                                           ResponseSender send_success,
                                           ErrorSender send_error) {
    try {
        auto registry = SchemaLoaderAction::load_registry(registry_path);
        auto& queue = registry["migrationQueue"];

        int approved_count = 0;
        const std::string timestamp = get_iso_timestamp();

        for (auto& migration : queue) {
            if (migration["status"].asString() != "pending") continue;

            if (id == "all" || migration["id"].asString() == id) {
                migration["status"] = "approved";
                migration["approvedAt"] = timestamp;
                approved_count++;

                if (id != "all") break;
            }
        }

        if (approved_count == 0 && id != "all") {
            send_error("Migration not found: " + id, 404);
            return;
        }

        SchemaLoaderAction::save_registry(registry, registry_path);

        ::Json::Value response;
        response["status"] = "ok";
        response["action"] = "approve";
        response["approved"] = approved_count;
        response["message"] = "Approved " + std::to_string(approved_count) + " migration(s)";

        send_success(response);
    } catch (const std::exception& e) {
        send_error(std::string("Approve failed: ") + e.what(), 500);
    }
}

void SchemaValidatorAction::handle_reject(const std::string& registry_path,
                                          const std::string& id,
                                          ResponseSender send_success,
                                          ErrorSender send_error) {
    try {
        auto registry = SchemaLoaderAction::load_registry(registry_path);
        auto& queue = registry["migrationQueue"];

        bool found = false;

        for (auto& migration : queue) {
            if (migration["id"].asString() == id && migration["status"].asString() == "pending") {
                migration["status"] = "rejected";
                found = true;
                break;
            }
        }

        if (!found) {
            send_error("Migration not found or not pending: " + id, 404);
            return;
        }

        SchemaLoaderAction::save_registry(registry, registry_path);

        ::Json::Value response;
        response["status"] = "ok";
        response["action"] = "reject";
        response["id"] = id;
        response["message"] = "Rejected migration " + id;

        send_success(response);
    } catch (const std::exception& e) {
        send_error(std::string("Reject failed: ") + e.what(), 500);
    }
}

} // namespace actions
} // namespace daemon
} // namespace dbal
