#ifndef DBAL_SCHEMA_QUERY_ACTION_HPP
#define DBAL_SCHEMA_QUERY_ACTION_HPP

#include <json/json.h>
#include <string>
#include <functional>

namespace dbal {
namespace daemon {
namespace actions {

using ResponseSender = std::function<void(const ::Json::Value&)>;
using ErrorSender = std::function<void(const std::string&, int)>;

/**
 * @brief Handles querying of loaded schemas and registry status
 *
 * Responsibilities:
 * - List pending migrations
 * - Query registry status
 * - Retrieve package definitions
 * - Return migration queue state
 */
class SchemaQueryAction {
public:
    /**
     * @brief Handle schema list/status request
     * Returns current registry state and pending migrations
     * @param registry_path Path to registry JSON file
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handle_list(const std::string& registry_path,
                           ResponseSender send_success,
                           ErrorSender send_error);

private:
    SchemaQueryAction() = delete;
};

} // namespace actions
} // namespace daemon
} // namespace dbal

#endif // DBAL_SCHEMA_QUERY_ACTION_HPP
