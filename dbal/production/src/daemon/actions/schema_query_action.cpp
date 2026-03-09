#include "schema_query_action.hpp"
#include "schema_loader_action.hpp"

namespace dbal {
namespace daemon {
namespace actions {

void SchemaQueryAction::handle_list(const std::string& registry_path,
                                    ResponseSender send_success,
                                    ErrorSender send_error) {
    try {
        auto registry = SchemaLoaderAction::load_registry(registry_path);
        auto pending = SchemaLoaderAction::get_pending_migrations(registry);

        ::Json::Value response;
        response["status"] = "ok";
        response["pendingCount"] = pending.size();
        response["migrations"] = pending;
        response["packages"] = registry["packages"];

        send_success(response);
    } catch (const std::exception& e) {
        send_error(std::string("Failed to load registry: ") + e.what(), 500);
    }
}

} // namespace actions
} // namespace daemon
} // namespace dbal
