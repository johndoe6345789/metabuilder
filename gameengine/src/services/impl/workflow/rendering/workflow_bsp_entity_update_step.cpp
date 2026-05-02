#include "services/interfaces/workflow/rendering/workflow_bsp_entity_update_step.hpp"

#include <btBulletDynamicsCommon.h>
#include <nlohmann/json.hpp>

#include <algorithm>
#include <cmath>
#include <string>

namespace sdl3cpp::services::impl {

namespace {

bool HasPrefix(const std::string& value, const std::string& prefix) {
    return value.rfind(prefix, 0) == 0;
}

bool IsPickupClass(const std::string& classname) {
    return HasPrefix(classname, "weapon_") ||
           HasPrefix(classname, "ammo_") ||
           HasPrefix(classname, "item_") ||
           HasPrefix(classname, "holdable_");
}

bool ReadVec3(const nlohmann::json& value, btVector3& out) {
    if (!value.is_array() || value.size() != 3) return false;
    out = btVector3(value[0].get<float>(), value[1].get<float>(), value[2].get<float>());
    return true;
}

bool InBounds(const btVector3& p, const nlohmann::json& bounds, float pad) {
    if (!bounds.is_object() || !bounds.contains("min") || !bounds.contains("max")) return false;
    btVector3 mn, mx;
    if (!ReadVec3(bounds["min"], mn) || !ReadVec3(bounds["max"], mx)) return false;
    return p.x() >= mn.x() - pad && p.x() <= mx.x() + pad &&
           p.y() >= mn.y() - pad && p.y() <= mx.y() + pad &&
           p.z() >= mn.z() - pad && p.z() <= mx.z() + pad;
}

void TeleportBody(btRigidBody* body, const btVector3& dest) {
    btTransform xform;
    xform.setIdentity();
    xform.setOrigin(dest);
    body->setWorldTransform(xform);
    if (body->getMotionState()) body->getMotionState()->setWorldTransform(xform);
    body->setLinearVelocity(btVector3(0, 0, 0));
    body->setAngularVelocity(btVector3(0, 0, 0));
    body->clearForces();
    body->activate(true);
}

btVector3 JumpPadVelocity(const btVector3& from, const btVector3& target) {
    constexpr float kGravity = 9.81f;
    const btVector3 delta = target - from;
    const float horiz = std::sqrt(delta.x() * delta.x() + delta.z() * delta.z());
    const float t = std::clamp(horiz / 18.0f, 0.55f, 1.20f);
    return btVector3(delta.x() / t,
                     (delta.y() + 0.5f * kGravity * t * t) / t,
                     delta.z() / t);
}

}  // namespace

WorkflowBspEntityUpdateStep::WorkflowBspEntityUpdateStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowBspEntityUpdateStep::GetPluginId() const {
    return "bsp.entities.update";
}

void WorkflowBspEntityUpdateStep::Execute(const WorkflowStepDefinition& step, WorkflowContext& context) {
    const auto* entities = context.TryGet<nlohmann::json>("bsp.entities");
    if (!entities || !entities->is_array()) return;

    const std::string playerName = context.GetString("physics_player_body", "");
    if (playerName.empty()) return;

    auto* body = context.Get<btRigidBody*>("physics_body_" + playerName, nullptr);
    if (!body) return;

    btTransform xform;
    body->getMotionState()->getWorldTransform(xform);
    const btVector3 playerPos = xform.getOrigin();
    const uint32_t frame = static_cast<uint32_t>(context.GetDouble("loop.iteration", 0.0));

    auto collected = context.Get<nlohmann::json>("q3.collected", nlohmann::json::object());
    auto inventory = context.Get<nlohmann::json>("q3.inventory", nlohmann::json::object());
    auto cooldowns = context.Get<nlohmann::json>("q3.trigger_cooldowns", nlohmann::json::object());

    auto setInventoryFlag = [&](const std::string& key) {
        inventory[key] = true;
        if (HasPrefix(key, "weapon_")) {
            context.Set<std::string>("q3.current_weapon", key);
        }
    };

    for (const auto& ent : *entities) {
        const std::string classname = ent.value("classname", std::string{});
        const std::string id = ent.value("id", std::string{});

        if (IsPickupClass(classname)) {
            if (id.empty() || collected.value(id, false)) continue;
            btVector3 itemPos;
            if (!ent.contains("position") || !ReadVec3(ent["position"], itemPos)) continue;
            if ((itemPos - playerPos).length2() > 1.2f * 1.2f) continue;

            collected[id] = true;
            setInventoryFlag(classname);
            if (logger_) logger_->Info("bsp.entities.update: picked up " + classname);
            continue;
        }

        if (classname != "trigger_push" && classname != "trigger_teleport") continue;
        if (!ent.contains("bounds") || !InBounds(playerPos, ent["bounds"], 0.15f)) continue;

        const uint32_t lastFrame = cooldowns.value(id, 0u);
        const uint32_t cooldownFrames = classname == "trigger_teleport" ? 45u : 15u;
        if (lastFrame != 0u && frame < lastFrame + cooldownFrames) continue;
        cooldowns[id] = frame == 0u ? 1u : frame;

        btVector3 target;
        if (!ent.contains("target_position") || !ReadVec3(ent["target_position"], target)) continue;

        if (classname == "trigger_teleport") {
            target += btVector3(0, 1.0f, 0);
            TeleportBody(body, target);
            if (logger_) logger_->Info("bsp.entities.update: teleported player via " + id);
        } else {
            body->setLinearVelocity(JumpPadVelocity(playerPos, target));
            body->activate(true);
            if (logger_) logger_->Info("bsp.entities.update: jump pad launch via " + id);
        }
    }

    context.Set("q3.collected", collected);
    context.Set("q3.inventory", inventory);
    context.Set("q3.trigger_cooldowns", cooldowns);
}

}  // namespace sdl3cpp::services::impl
