#ifndef DBAL_RPC_SCHEMA_ACTIONS_HPP
#define DBAL_RPC_SCHEMA_ACTIONS_HPP

#include <functional>
#include <json/json.h>
#include <string>

namespace dbal {
namespace daemon {
namespace rpc {

using ResponseSender = std::function<void(const ::Json::Value&)>;
using ErrorSender = std::function<void(const std::string&, int)>;

/**
 * @brief Handle schema list/status request
 * Returns current registry state and pending migrations
 */
void handle_schema_list(const std::string& registry_path,
                        ResponseSender send_success,
                        ErrorSender send_error);

/**
 * @brief Handle schema scan request
 * Scans packages directory for schema changes
 */
void handle_schema_scan(const std::string& registry_path,
                        const std::string& packages_path,
                        ResponseSender send_success,
                        ErrorSender send_error);

/**
 * @brief Handle schema approve request
 * @param id Migration ID or "all" to approve all pending
 */
void handle_schema_approve(const std::string& registry_path,
                           const std::string& id,
                           ResponseSender send_success,
                           ErrorSender send_error);

/**
 * @brief Handle schema reject request
 */
void handle_schema_reject(const std::string& registry_path,
                          const std::string& id,
                          ResponseSender send_success,
                          ErrorSender send_error);

/**
 * @brief Handle schema generate request
 * Generates Prisma fragment from approved migrations
 */
void handle_schema_generate(const std::string& registry_path,
                            const std::string& output_path,
                            ResponseSender send_success,
                            ErrorSender send_error);

} // namespace rpc
} // namespace daemon
} // namespace dbal

#endif // DBAL_RPC_SCHEMA_ACTIONS_HPP
