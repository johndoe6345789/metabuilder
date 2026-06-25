#ifndef DBAL_MIGRATION_RUNNER_ACTION_HPP
#define DBAL_MIGRATION_RUNNER_ACTION_HPP

#include <json/json.h>
#include <string>
#include <functional>

namespace dbal {
namespace daemon {
namespace actions {

using ResponseSender = std::function<void(const ::Json::Value&)>;
using ErrorSender = std::function<void(const std::string&, int)>;

/**
 * @brief Handles scanning and queueing of schema migrations
 *
 * Responsibilities:
 * - Scan packages directory for entity schema files
 * - Detect schema changes
 * - Queue changes for review
 * - Track scan statistics
 */
class MigrationRunnerAction {
public:
    /**
     * @brief Handle schema scan request
     * Scans packages directory for schema changes
     * @param registry_path Path to registry JSON file
     * @param packages_path Path to packages directory
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handle_scan(const std::string& registry_path,
                           const std::string& packages_path,
                           ResponseSender send_success,
                           ErrorSender send_error);

private:
    MigrationRunnerAction() = delete;
};

} // namespace actions
} // namespace daemon
} // namespace dbal

#endif // DBAL_MIGRATION_RUNNER_ACTION_HPP
