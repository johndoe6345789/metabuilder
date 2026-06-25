#ifndef DBAL_SCHEMA_VALIDATOR_ACTION_HPP
#define DBAL_SCHEMA_VALIDATOR_ACTION_HPP

#include <json/json.h>
#include <string>
#include <functional>

namespace dbal {
namespace daemon {
namespace actions {

using ResponseSender = std::function<void(const ::Json::Value&)>;
using ErrorSender = std::function<void(const std::string&, int)>;

/**
 * @brief Handles validation and approval/rejection of schema migrations
 *
 * Responsibilities:
 * - Validate schema changes against business rules
 * - Approve pending migrations
 * - Reject pending migrations
 * - Track approval/rejection timestamps
 */
class SchemaValidatorAction {
public:
    /**
     * @brief Handle schema approval request
     * @param registry_path Path to registry JSON file
     * @param id Migration ID or "all" to approve all pending
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handle_approve(const std::string& registry_path,
                               const std::string& id,
                               ResponseSender send_success,
                               ErrorSender send_error);

    /**
     * @brief Handle schema rejection request
     * @param registry_path Path to registry JSON file
     * @param id Migration ID to reject
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handle_reject(const std::string& registry_path,
                              const std::string& id,
                              ResponseSender send_success,
                              ErrorSender send_error);

    /**
     * @brief Get current ISO timestamp
     * @return ISO 8601 formatted timestamp string
     */
    static std::string get_iso_timestamp();

private:
    SchemaValidatorAction() = delete;
};

} // namespace actions
} // namespace daemon
} // namespace dbal

#endif // DBAL_SCHEMA_VALIDATOR_ACTION_HPP
