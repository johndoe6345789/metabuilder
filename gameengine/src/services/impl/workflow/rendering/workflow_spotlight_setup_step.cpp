#include "services/interfaces/workflow/rendering/workflow_spotlight_setup_step.hpp"
#include "services/interfaces/workflow/workflow_step_parameter_resolver.hpp"

#include <glm/glm.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <nlohmann/json.hpp>
#include <cmath>

namespace sdl3cpp::services::impl {

WorkflowSpotlightSetupStep::WorkflowSpotlightSetupStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowSpotlightSetupStep::GetPluginId() const {
    return "spotlight.setup";
}

void WorkflowSpotlightSetupStep::Execute(const WorkflowStepDefinition& step, WorkflowContext& context) {
    WorkflowStepParameterResolver params;

    auto getNum = [&](const char* name, float def) -> float {
        const auto* p = params.FindParameter(step, name);
        return (p && p->type == WorkflowParameterValue::Type::Number) ? static_cast<float>(p->numberValue) : def;
    };
    auto getStr = [&](const char* name, const std::string& def) -> std::string {
        const auto* p = params.FindParameter(step, name);
        return (p && p->type == WorkflowParameterValue::Type::String) ? p->stringValue : def;
    };

    std::string attach = getStr("attach", "camera");
    float inner_cone = getNum("inner_cone", 12.0f);
    float outer_cone = getNum("outer_cone", 25.0f);
    float intensity = getNum("intensity", 2.5f);
    float range = getNum("range", 20.0f);
    float color_r = getNum("color_r", 1.0f);
    float color_g = getNum("color_g", 0.95f);
    float color_b = getNum("color_b", 0.85f);
    float offset_x = getNum("offset_x", 0.0f);
    float offset_y = getNum("offset_y", 0.0f);
    float offset_z = getNum("offset_z", 0.0f);

    nlohmann::json spotlight;
    spotlight["inner_cone"] = inner_cone;
    spotlight["outer_cone"] = outer_cone;
    spotlight["intensity"] = intensity;
    spotlight["range"] = range;
    spotlight["color"] = {color_r, color_g, color_b};
    spotlight["attach"] = attach;
    spotlight["offset"] = {offset_x, offset_y, offset_z};

    // If attached to camera, position and direction will be filled per-frame
    // by the render.prepare step reading camera state.
    // For static spotlights, set explicit position/direction params.
    if (attach == "camera") {
        // Will be updated each frame in render.prepare from camera state
        spotlight["position"] = {0, 0, 0};
        spotlight["direction"] = {0, 0, -1};
    } else {
        spotlight["position"] = {
            getNum("pos_x", 0.0f),
            getNum("pos_y", 0.0f),
            getNum("pos_z", 0.0f)
        };
        spotlight["direction"] = {
            getNum("dir_x", 0.0f),
            getNum("dir_y", -1.0f),
            getNum("dir_z", 0.0f)
        };
    }

    context.Set("spotlight.state", spotlight);
}

}  // namespace sdl3cpp::services::impl
