#include "services/interfaces/workflow/quake3/workflow_q3_weapon_update_step.hpp"

#include <btBulletDynamicsCommon.h>
#include <glm/glm.hpp>
#include <nlohmann/json.hpp>

#include <array>
#include <string>

namespace sdl3cpp::services::impl {

namespace {

const std::array<const char*, 9> kWeapons = {
    "weapon_gauntlet",
    "weapon_machinegun",
    "weapon_shotgun",
    "weapon_grenadelauncher",
    "weapon_rocketlauncher",
    "weapon_lightning",
    "weapon_railgun",
    "weapon_plasmagun",
    "weapon_bfg"
};

bool HasWeapon(const nlohmann::json& inventory, const std::string& weapon) {
    return weapon == "weapon_gauntlet" ||
           weapon == "weapon_machinegun" ||
           inventory.value(weapon, false);
}

}  // namespace

WorkflowQ3WeaponUpdateStep::WorkflowQ3WeaponUpdateStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowQ3WeaponUpdateStep::GetPluginId() const {
    return "q3.weapon.update";
}

void WorkflowQ3WeaponUpdateStep::Execute(const WorkflowStepDefinition& step, WorkflowContext& context) {
    auto inventory = context.Get<nlohmann::json>("q3.inventory", nlohmann::json::object());
    inventory["weapon_gauntlet"] = true;
    inventory["weapon_machinegun"] = true;

    std::string current = context.Get<std::string>("q3.current_weapon", "weapon_machinegun");
    for (size_t i = 0; i < kWeapons.size(); ++i) {
        if (!context.GetBool("input_key_" + std::to_string(i + 1), false)) continue;
        const std::string requested = kWeapons[i];
        if (HasWeapon(inventory, requested)) {
            current = requested;
            context.Set<std::string>("q3.current_weapon", current);
        }
    }

    const bool fireHeld = context.GetBool("input_mouse_left", false);
    const bool firePressed = context.GetBool("input_mouse_left_pressed", false);
    const uint32_t frame = static_cast<uint32_t>(context.GetDouble("loop.iteration", 0.0));
    uint32_t lastFire = context.Get<uint32_t>("q3.weapon_last_fire_frame", 0u);
    const uint32_t interval = current == "weapon_machinegun" ? 8u :
                              current == "weapon_lightning" ? 3u :
                              current == "weapon_gauntlet" ? 18u :
                              28u;

    bool wantsFire = firePressed || (fireHeld && current == "weapon_machinegun") || (fireHeld && current == "weapon_lightning");
    if (context.GetBool("movement_active", true) && wantsFire && (lastFire == 0u || frame >= lastFire + interval)) {
        lastFire = frame == 0u ? 1u : frame;
        context.Set<uint32_t>("q3.weapon_last_fire_frame", lastFire);
        context.Set<uint32_t>("q3.weapon_flash_until_frame", lastFire + 4u);
        context.Set<int>("q3.shots_fired", context.Get<int>("q3.shots_fired", 0) + 1);
        context.Set<bool>("q3.last_shot_hit", false);

        auto* world = context.Get<btDiscreteDynamicsWorld*>("physics_world", nullptr);
        auto cameraState = context.Get<nlohmann::json>("camera.state", nlohmann::json::object());
        if (world && cameraState.contains("position") && cameraState.contains("front")) {
            const auto pos = cameraState["position"];
            const auto front = cameraState["front"];
            btVector3 from(pos[0].get<float>(), pos[1].get<float>(), pos[2].get<float>());
            btVector3 dir(front[0].get<float>(), front[1].get<float>(), front[2].get<float>());
            btVector3 to = from + dir.normalized() * 120.0f;
            btCollisionWorld::ClosestRayResultCallback hit(from, to);
            world->rayTest(from, to, hit);
            context.Set<bool>("q3.last_shot_hit", hit.hasHit());
            if (hit.hasHit()) {
                context.Set<uint32_t>("q3.hit_marker_until_frame", lastFire + 10u);
                context.Set<int>("q3.damage_done", context.Get<int>("q3.damage_done", 0) + (
                    current == "weapon_railgun" ? 100 :
                    current == "weapon_rocketlauncher" ? 100 :
                    current == "weapon_shotgun" ? 80 :
                    current == "weapon_plasmagun" ? 20 :
                    current == "weapon_machinegun" ? 7 : 15));
                context.Set("q3.last_shot_position", nlohmann::json::array({
                    hit.m_hitPointWorld.x(), hit.m_hitPointWorld.y(), hit.m_hitPointWorld.z()
                }));
            }
        }

        if (logger_) logger_->Info("q3.weapon.update: fired " + current);
    }

    context.Set("q3.inventory", inventory);
    context.Set<std::string>("q3.current_weapon", current);
}

}  // namespace sdl3cpp::services::impl
