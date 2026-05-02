#include "services/interfaces/workflow/quake3/workflow_q3_bots_update_step.hpp"
#include "services/interfaces/workflow/workflow_step_parameter_resolver.hpp"
#include "services/interfaces/workflow_context.hpp"

#include <glm/glm.hpp>
#include <nlohmann/json.hpp>
#include <cmath>
#include <string>

namespace sdl3cpp::services::impl {

WorkflowQ3BotsUpdateStep::WorkflowQ3BotsUpdateStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowQ3BotsUpdateStep::GetPluginId() const { return "q3.bots.update"; }

void WorkflowQ3BotsUpdateStep::Execute(const WorkflowStepDefinition& step, WorkflowContext& context) {
    auto* botsPtr = context.TryGet<nlohmann::json>("q3.bots");
    if (!botsPtr || !botsPtr->is_array() || botsPtr->empty()) return;

    WorkflowStepParameterResolver params;
    auto getNum = [&](const char* k, float def) -> float {
        const auto* p = params.FindParameter(step, k);
        return (p && p->type == WorkflowParameterValue::Type::Number) ? (float)p->numberValue : def;
    };

    const float chaseRange  = getNum("chase_range",   20.0f);
    const float shootRange  = getNum("shoot_range",    6.0f);
    const float moveSpeed   = getNum("move_speed",     3.0f);
    const int   legIdle     = (int)getNum("leg_idle",  162);  // Q3 keel defaults
    const int   legRun      = (int)getNum("leg_run",   167);
    const int   legRunCnt   = (int)getNum("leg_run_cnt", 8);
    const int   torsoStand  = (int)getNum("torso_stand", 101);
    const int   torsoAtk    = (int)getNum("torso_attack", 107);
    const int   torsoAtkCnt = (int)getNum("torso_atk_cnt", 6);
    const int   shootInterv = (int)getNum("shoot_interval", 30);  // frames

    // Player position from camera state
    const auto camState = context.Get<nlohmann::json>("camera.state", nlohmann::json::object());
    glm::vec3 playerPos(0.0f);
    if (camState.contains("position") && camState["position"].is_array()) {
        const auto& cp = camState["position"];
        if (cp.size() >= 3)
            playerPos = {cp[0].get<float>(), cp[1].get<float>(), cp[2].get<float>()};
    }

    const double dt    = context.GetDouble("frame.delta_time", 0.016);
    const double elapsed = context.GetDouble("frame.elapsed",  0.0);
    const int    globalFrame = (int)(elapsed * 60.0);  // ~60fps frame counter

    nlohmann::json bots = *botsPtr;
    nlohmann::json shots = nlohmann::json::array();

    for (auto& bot : bots) {
        if (bot.value("state", std::string{}) == "dead") continue;

        const auto& posJ = bot["pos"];
        glm::vec3 bpos(posJ[0].get<float>(), posJ[1].get<float>(), posJ[2].get<float>());

        const glm::vec3 toPlayer = playerPos - bpos;
        const float dist = std::sqrt(toPlayer.x * toPlayer.x +
                                     toPlayer.y * toPlayer.y +
                                     toPlayer.z * toPlayer.z);

        // Face player: yaw = atan2 of horizontal direction (XZ plane in Y-up)
        const float targetYaw = std::atan2(toPlayer.x, toPlayer.z);
        bot["yaw"] = targetYaw;

        // State transitions
        if (dist < shootRange) {
            bot["state"] = "shoot";
        } else if (dist < chaseRange) {
            bot["state"] = "chase";
        } else {
            bot["state"] = "idle";
        }

        const std::string state = bot["state"].get<std::string>();

        // Movement
        if (state == "chase" && dist > 0.5f) {
            const glm::vec3 dir = toPlayer / dist;
            bpos.x += dir.x * moveSpeed * (float)dt;
            bpos.z += dir.z * moveSpeed * (float)dt;
            // Keep Y from spawn (basic ground-snapping; proper would do physics)
            bot["pos"] = nlohmann::json::array({bpos.x, bpos.y, bpos.z});
        }

        // Animation frame selection
        const double fps = 15.0;
        const int baseFrame = (int)(elapsed * fps);
        if (state == "chase") {
            bot["leg_frame"] = legRun + (legRunCnt > 0 ? (baseFrame % legRunCnt) : 0);
            bot["torso_frame"] = torsoStand;
        } else if (state == "shoot") {
            bot["leg_frame"] = legIdle;
            bot["torso_frame"] = torsoAtk + (torsoAtkCnt > 0 ? (baseFrame % torsoAtkCnt) : 0);

            // Fire shot
            const int lastShot = bot.value("last_shot", 0);
            if (globalFrame >= lastShot + shootInterv) {
                bot["last_shot"] = globalFrame;
                shots.push_back({
                    {"bot_id", bot["id"]},
                    {"from",   bot["pos"]},
                    {"to",     nlohmann::json::array({playerPos.x, playerPos.y, playerPos.z})}
                });
            }
        } else {
            bot["leg_frame"]   = legIdle;
            bot["torso_frame"] = torsoStand;
        }
    }

    context.Set("q3.bots", bots);
    if (!shots.empty()) context.Set("q3.bot_shots", shots);
}

}  // namespace sdl3cpp::services::impl
