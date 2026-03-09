#include "rpc_schema_actions.hpp"
#include "actions/schema_loader_action.hpp"
#include "actions/schema_validator_action.hpp"
#include "actions/table_creator_action.hpp"
#include "actions/migration_runner_action.hpp"
#include "actions/schema_query_action.hpp"

namespace dbal {
namespace daemon {
namespace rpc {

void handle_schema_list(const std::string& registry_path,
                        ResponseSender send_success,
                        ErrorSender send_error) {
    actions::SchemaQueryAction::handle_list(registry_path, send_success, send_error);
}

void handle_schema_scan(const std::string& registry_path,
                        const std::string& packages_path,
                        ResponseSender send_success,
                        ErrorSender send_error) {
    actions::MigrationRunnerAction::handle_scan(registry_path, packages_path, send_success, send_error);
}

void handle_schema_approve(const std::string& registry_path,
                           const std::string& id,
                           ResponseSender send_success,
                           ErrorSender send_error) {
    actions::SchemaValidatorAction::handle_approve(registry_path, id, send_success, send_error);
}

void handle_schema_reject(const std::string& registry_path,
                          const std::string& id,
                          ResponseSender send_success,
                          ErrorSender send_error) {
    actions::SchemaValidatorAction::handle_reject(registry_path, id, send_success, send_error);
}

void handle_schema_generate(const std::string& registry_path,
                            const std::string& output_path,
                            ResponseSender send_success,
                            ErrorSender send_error) {
    actions::TableCreatorAction::handle_generate(registry_path, output_path, send_success, send_error);
}

} // namespace rpc
} // namespace daemon
} // namespace dbal
