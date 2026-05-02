#include "services/interfaces/workflow/quake3/workflow_q3_menu_update_step.hpp"

#include <nlohmann/json.hpp>
#include <algorithm>
#include <string>

namespace sdl3cpp::services::impl {

WorkflowQ3MenuUpdateStep::WorkflowQ3MenuUpdateStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowQ3MenuUpdateStep::GetPluginId() const {
    return "q3.menu.update";
}

void WorkflowQ3MenuUpdateStep::Execute(const WorkflowStepDefinition& step, WorkflowContext& context) {
    bool open = context.GetBool("q3.menu_open", true);
    if (context.GetBool("input_key_escape_pressed", false)) {
        open = !open;
    }
    context.Set<bool>("q3.menu_open", open);

    auto maps = context.Get<nlohmann::json>("q3.maps", nlohmann::json::array());
    if (!maps.is_array() || maps.empty()) {
        maps = nlohmann::json::array({"q3dm7"});
    }

    int selected = context.Get<int>("q3.menu_selected_map", 0);
    selected = std::clamp(selected, 0, static_cast<int>(maps.size()) - 1);

    if (open) {
        if (context.GetBool("input_key_up_pressed", false)) {
            selected = (selected + static_cast<int>(maps.size()) - 1) % static_cast<int>(maps.size());
        }
        if (context.GetBool("input_key_down_pressed", false)) {
            selected = (selected + 1) % static_cast<int>(maps.size());
        }
        if (context.GetBool("input_key_enter_pressed", false)) {
            const std::string map = maps[selected].get<std::string>();
            context.Set<std::string>("q3.pending_map", map);
            if (logger_) logger_->Info("q3.menu.update: selected map " + map + " (restart with QUAKE3_MAP=" + map + ")");
        }
    }

    context.Set<int>("q3.menu_selected_map", selected);
}

}  // namespace sdl3cpp::services::impl
