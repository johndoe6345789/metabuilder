#include "services/interfaces/workflow/rendering/workflow_render_prepare_step.hpp"
#include "services/interfaces/workflow/rendering/rendering_types.hpp"

#include <glm/glm.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <nlohmann/json.hpp>
#include <vector>

namespace sdl3cpp::services::impl {

WorkflowRenderPrepareStep::WorkflowRenderPrepareStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowRenderPrepareStep::GetPluginId() const {
    return "render.prepare";
}

void WorkflowRenderPrepareStep::Execute(const WorkflowStepDefinition& step, WorkflowContext& context) {
    // --- Camera state ---
    glm::mat4 viewMatrix(1.0f);
    glm::mat4 projMatrix(1.0f);

    const auto* cam_json = context.TryGet<nlohmann::json>("camera.state");
    if (cam_json) {
        if (cam_json->contains("view")) {
            auto v = (*cam_json)["view"].get<std::vector<float>>();
            if (v.size() == 16) viewMatrix = glm::make_mat4(v.data());
        }
        if (cam_json->contains("projection")) {
            auto p = (*cam_json)["projection"].get<std::vector<float>>();
            if (p.size() == 16) projMatrix = glm::make_mat4(p.data());
        }
    }

    glm::vec3 cameraPos = glm::vec3(glm::inverse(viewMatrix)[3]);

    context.Set<glm::mat4>("render.view_matrix", viewMatrix);
    context.Set<glm::mat4>("render.proj_matrix", projMatrix);
    context.Set<glm::vec3>("render.camera_pos", cameraPos);

    // --- Shadow state ---
    glm::mat4 shadowVP(1.0f);

    const auto* shadow_json = context.TryGet<nlohmann::json>("shadow.state");
    if (shadow_json && shadow_json->contains("light_vp")) {
        auto vp = (*shadow_json)["light_vp"].get<std::vector<float>>();
        if (vp.size() == 16) shadowVP = glm::make_mat4(vp.data());
    }

    context.Set<glm::mat4>("render.shadow_vp", shadowVP);

    // --- Fragment uniforms from lighting ---
    rendering::FragmentUniformData fu = {};

    // Defaults: downward white light, subtle ambient, full exposure
    fu.light_dir[1] = -1.0f;
    fu.light_color[0] = 1.0f;
    fu.light_color[1] = 1.0f;
    fu.light_color[2] = 1.0f;
    fu.light_color[3] = 1.0f;   // exposure
    fu.ambient[0] = 0.2f;
    fu.ambient[1] = 0.2f;
    fu.ambient[2] = 0.2f;
    fu.material[0] = 0.8f;      // roughness default
    fu.material[1] = 0.0f;      // metallic default

    const auto* lighting = context.TryGet<nlohmann::json>("lighting.directional");
    if (lighting) {
        if (lighting->contains("direction")) {
            auto dir = (*lighting)["direction"].get<std::vector<float>>();
            if (dir.size() >= 3) {
                fu.light_dir[0] = dir[0];
                fu.light_dir[1] = dir[1];
                fu.light_dir[2] = dir[2];
            }
        }
        if (lighting->contains("color")) {
            auto col = (*lighting)["color"].get<std::vector<float>>();
            if (col.size() >= 3) {
                fu.light_color[0] = col[0];
                fu.light_color[1] = col[1];
                fu.light_color[2] = col[2];
            }
        }
        if (lighting->contains("ambient")) {
            auto amb = (*lighting)["ambient"].get<std::vector<float>>();
            if (amb.size() >= 3) {
                fu.ambient[0] = amb[0];
                fu.ambient[1] = amb[1];
                fu.ambient[2] = amb[2];
            }
        }
        fu.light_color[3] = lighting->value("exposure", 1.0f);
    }

    // --- Spotlight / flashlight (reads from context, set by spotlight.setup step) ---
    const auto* spot = context.TryGet<nlohmann::json>("spotlight.state");
    if (spot) {
        std::string attach = spot->value("attach", "camera");
        glm::vec3 spotPos, spotDir;
        auto offset = spot->value("offset", std::vector<float>{0,0,0});
        glm::vec3 off(offset.size()>0?offset[0]:0, offset.size()>1?offset[1]:0, offset.size()>2?offset[2]:0);

        if (attach == "camera") {
            spotPos = cameraPos + off;
            spotDir = -glm::vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
        } else {
            auto p = spot->value("position", std::vector<float>{0,0,0});
            auto d = spot->value("direction", std::vector<float>{0,0,-1});
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
        auto col = spot->value("color", std::vector<float>{1,1,1});
        float spotIntensity = spot->value("intensity", 2.5f);
        fu.flash_color[0] = (col.size() > 0 ? col[0] : 1.0f) * spotIntensity;
        fu.flash_color[1] = (col.size() > 1 ? col[1] : 1.0f) * spotIntensity;
        fu.flash_color[2] = (col.size() > 2 ? col[2] : 1.0f) * spotIntensity;
        fu.flash_color[3] = spot->value("range", 20.0f);
    }

    context.Set<rendering::FragmentUniformData>("render.frag_uniforms", fu);

    if (logger_) {
        logger_->Trace("WorkflowRenderPrepareStep", "Execute",
                       "cam=(" + std::to_string(cameraPos.x) + "," +
                       std::to_string(cameraPos.y) + "," +
                       std::to_string(cameraPos.z) + ")",
                       "Render state prepared");
    }
}

}  // namespace sdl3cpp::services::impl
