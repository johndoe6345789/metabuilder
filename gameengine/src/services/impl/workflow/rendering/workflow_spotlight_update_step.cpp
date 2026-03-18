#include "services/interfaces/workflow/rendering/workflow_spotlight_update_step.hpp"
#include "services/interfaces/workflow/rendering/rendering_types.hpp"

#include <glm/glm.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <nlohmann/json.hpp>
#include <cmath>

namespace sdl3cpp::services::impl {

WorkflowSpotlightUpdateStep::WorkflowSpotlightUpdateStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowSpotlightUpdateStep::GetPluginId() const {
    return "spotlight.update";
}

void WorkflowSpotlightUpdateStep::Execute(const WorkflowStepDefinition& step, WorkflowContext& context) {
    const auto* spot = context.TryGet<nlohmann::json>("spotlight.state");
    if (!spot) return;

    auto fu = context.Get<rendering::FragmentUniformData>("render.frag_uniforms", rendering::FragmentUniformData{});

    std::string attach = spot->value("attach", "camera");
    auto offset = spot->value("offset", std::vector<float>{0, 0, 0});
    glm::vec3 off(offset.size() > 0 ? offset[0] : 0,
                  offset.size() > 1 ? offset[1] : 0,
                  offset.size() > 2 ? offset[2] : 0);

    glm::vec3 spotPos, spotDir;

    if (attach == "camera") {
        auto viewMatrix = context.Get<glm::mat4>("render.view_matrix", glm::mat4(1.0f));
        auto cameraPos = context.Get<glm::vec3>("render.camera_pos", glm::vec3(0.0f));

        glm::vec3 camRight = glm::vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        glm::vec3 camUp = glm::vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        glm::vec3 camFwd = -glm::vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);

        spotPos = cameraPos + camRight * off.x + camUp * off.y + camFwd * (-off.z);

        // Aim toward a far point on camera center axis (natural torch aim)
        float aimDist = spot->value("aim_distance", 50.0f);
        glm::vec3 aimTarget = cameraPos + camFwd * aimDist;
        spotDir = glm::normalize(aimTarget - spotPos);
    } else {
        auto p = spot->value("position", std::vector<float>{0, 0, 0});
        auto d = spot->value("direction", std::vector<float>{0, 0, -1});
        spotPos = glm::vec3(p[0], p[1], p[2]) + off;
        spotDir = glm::normalize(glm::vec3(d[0], d[1], d[2]));
    }

    fu.flash_pos[0] = spotPos.x;
    fu.flash_pos[1] = spotPos.y;
    fu.flash_pos[2] = spotPos.z;
    fu.flash_pos[3] = std::cos(glm::radians(spot->value("inner_cone", 12.0f)));
    fu.flash_dir[0] = spotDir.x;
    fu.flash_dir[1] = spotDir.y;
    fu.flash_dir[2] = spotDir.z;
    fu.flash_dir[3] = std::cos(glm::radians(spot->value("outer_cone", 25.0f)));

    auto col = spot->value("color", std::vector<float>{1, 1, 1});
    float intensity = spot->value("intensity", 2.5f);
    fu.flash_color[0] = (col.size() > 0 ? col[0] : 1.0f) * intensity;
    fu.flash_color[1] = (col.size() > 1 ? col[1] : 1.0f) * intensity;
    fu.flash_color[2] = (col.size() > 2 ? col[2] : 1.0f) * intensity;
    fu.flash_color[3] = spot->value("range", 20.0f);

    context.Set<rendering::FragmentUniformData>("render.frag_uniforms", fu);
}

}  // namespace sdl3cpp::services::impl
