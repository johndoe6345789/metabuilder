#include "wf_engine.hpp"
#include "steps/uuid_step.hpp"
#include "steps/timestamp_step.hpp"
#include "steps/entity_create_step.hpp"
#include "steps/entity_get_step.hpp"
#include "steps/entity_list_step.hpp"
#include "steps/var_set_step.hpp"
#include "steps/log_step.hpp"
#include <spdlog/spdlog.h>
#include <nlohmann/json.hpp>
#include <fstream>
#include <thread>

namespace dbal::workflow {

WfEngine::WfEngine(const dbal::ClientConfig& client_config)
    : client_config_(client_config) {
    // Register all built-in DBAL workflow steps
    executor_.registerStep(std::make_shared<steps::UuidStep>());
    executor_.registerStep(std::make_shared<steps::TimestampStep>());
    executor_.registerStep(std::make_shared<steps::EntityCreateStep>());
    executor_.registerStep(std::make_shared<steps::EntityGetStep>());
    executor_.registerStep(std::make_shared<steps::EntityListStep>());
    executor_.registerStep(std::make_shared<steps::VarSetStep>());
    executor_.registerStep(std::make_shared<steps::LogStep>());
}

void WfEngine::loadConfig(const std::string& json_path) {
    try {
        std::ifstream f(json_path);
        if (!f.is_open()) throw std::runtime_error("Cannot open file");
        nlohmann::json root = nlohmann::json::parse(f);

        if (!root.contains("events") || !root["events"].is_array()) {
            spdlog::warn("[workflow] event_config has no 'events' list: {}", json_path);
            return;
        }
        for (const auto& entry : root["events"]) {
            std::string event    = entry.value("event",    std::string(""));
            std::string workflow = entry.value("workflow", std::string(""));
            if (!event.empty() && !workflow.empty()) {
                event_map_[event] = workflow;
                spdlog::debug("[workflow] registered: {} → {}", event, workflow);
            }
        }
        spdlog::info("[workflow] loaded {} event mappings from {}", event_map_.size(), json_path);
    } catch (const std::exception& e) {
        spdlog::error("[workflow] failed to load event config '{}': {}", json_path, e.what());
    }
}

void WfEngine::dispatchAsync(const std::string& event_name,
                              const nlohmann::json& entity_data) const {
    auto it = event_map_.find(event_name);
    if (it == event_map_.end()) return;

    std::string workflow_path = it->second;
    nlohmann::json data_copy  = entity_data; // copy for thread safety

    spdlog::debug("[workflow] dispatching async: {}", event_name);

    // Capture executor_ and client_config_ by value so the detached thread
    // owns everything it needs independently of `this`.
    WfExecutor exec_copy = executor_;
    dbal::ClientConfig cfg_copy = client_config_;

    std::thread([exec_copy = std::move(exec_copy), cfg_copy = std::move(cfg_copy),
                 workflow_path, data_copy, event_name]() mutable {
        try {
            WfContext ctx;
            ctx.set("event", data_copy); // accessible as ${event.userId}, ${event.tenantId}, etc.

            dbal::Client client(cfg_copy);
            exec_copy.execute(workflow_path, ctx, client);
            spdlog::info("[workflow] {} completed", event_name);
        } catch (const std::exception& e) {
            spdlog::error("[workflow] {} failed: {}", event_name, e.what());
        } catch (...) {
            spdlog::error("[workflow] {} failed: unknown error", event_name);
        }
    }).detach();
}

} // namespace dbal::workflow
