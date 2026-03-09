#pragma once
#include "wf_executor.hpp"
#include "dbal/core/client.hpp"
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>

namespace dbal::workflow {

/**
 * WorkflowEngine — maps DBAL CRUD events to workflow files and dispatches them.
 *
 * Loaded from YAML event config (DBAL_EVENT_CONFIG env var):
 *   events:
 *     - event: "pastebin.User.created"
 *       workflow: "/app/schemas/workflows/pastebin/on_user_created.json"
 *
 * Dispatch is non-blocking: each workflow runs in a detached std::thread
 * with its own dbal::Client instance. Errors are logged, never propagated.
 */
class WfEngine {
public:
    explicit WfEngine(const dbal::ClientConfig& client_config);

    // Load event→workflow mappings from YAML file
    void loadConfig(const std::string& yaml_path);

    // Fire-and-forget: if event_name is mapped, run its workflow async.
    // entity_data is the created/updated entity JSON from the CRUD handler.
    void dispatchAsync(const std::string& event_name,
                       const nlohmann::json& entity_data) const;

    bool hasEvent(const std::string& event_name) const {
        return event_map_.count(event_name) > 0;
    }

private:
    dbal::ClientConfig client_config_;
    WfExecutor executor_;
    std::unordered_map<std::string, std::string> event_map_; // event → workflow path
};

} // namespace dbal::workflow
