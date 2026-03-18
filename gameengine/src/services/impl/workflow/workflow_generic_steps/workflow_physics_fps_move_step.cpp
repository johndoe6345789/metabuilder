#include "services/interfaces/workflow/workflow_generic_steps/workflow_physics_fps_move_step.hpp"
#include "services/interfaces/workflow/workflow_step_parameter_resolver.hpp"
#include "services/interfaces/workflow_step_definition.hpp"
#include "services/interfaces/workflow_context.hpp"

#include <btBulletDynamicsCommon.h>
#include <cmath>
#include <stdexcept>
#include <utility>

namespace sdl3cpp::services::impl {

WorkflowPhysicsFpsMoveStep::WorkflowPhysicsFpsMoveStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowPhysicsFpsMoveStep::GetPluginId() const {
    return "physics.fps.move";
}

void WorkflowPhysicsFpsMoveStep::Execute(
    const WorkflowStepDefinition& step, WorkflowContext& context) {

    // Get player body
    auto playerName = context.GetString("physics_player_body", "");
    if (playerName.empty()) return;

    auto* body = context.Get<btRigidBody*>("physics_body_" + playerName, nullptr);
    if (!body) return;

    // Read parameters from workflow JSON
    WorkflowStepParameterResolver paramResolver;
    auto getNum = [&](const char* name, float def) -> float {
        const auto* p = paramResolver.FindParameter(step, name);
        return (p && p->type == WorkflowParameterValue::Type::Number) ? static_cast<float>(p->numberValue) : def;
    };

    const float moveSpeed = getNum("move_speed", 6.0f);
    const float sprintMultiplier = getNum("sprint_multiplier", 1.8f);
    const float crouchMultiplier = getNum("crouch_multiplier", 0.4f);
    const float jumpForce = getNum("jump_force", 5.0f);
    const float crouchHeight = getNum("crouch_height", 0.8f);
    const float standHeight = getNum("stand_height", 1.6f);
    const float airControl = getNum("air_control", 0.3f);
    const float gravityScale = getNum("gravity_scale", 1.0f);

    // Read input state from context (set by input.poll)
    bool keyW = context.GetBool("input_key_w", false);
    bool keyA = context.GetBool("input_key_a", false);
    bool keyS = context.GetBool("input_key_s", false);
    bool keyD = context.GetBool("input_key_d", false);
    bool keySpace = context.GetBool("input_key_space", false);
    bool keyShift = context.GetBool("input_key_shift", false);
    bool keyCtrl = context.GetBool("input_key_ctrl", false);

    // Read camera yaw (set by camera.fps.update from previous frame)
    float yaw = context.Get<float>("camera_yaw", 0.0f);

    // Calculate forward/right vectors from yaw
    float sinY = std::sin(yaw);
    float cosY = std::cos(yaw);
    float forwardX = -sinY;
    float forwardZ = -cosY;
    float rightX = cosY;
    float rightZ = -sinY;

    // Build movement direction
    float moveX = 0.0f, moveZ = 0.0f;
    if (keyW) { moveX += forwardX; moveZ += forwardZ; }
    if (keyS) { moveX -= forwardX; moveZ -= forwardZ; }
    if (keyA) { moveX -= rightX;   moveZ -= rightZ; }
    if (keyD) { moveX += rightX;   moveZ += rightZ; }

    // Apply sprint/crouch speed modifiers
    float speed = moveSpeed;
    if (keyCtrl) {
        speed *= crouchMultiplier;
    } else if (keyShift) {
        speed *= sprintMultiplier;
    }

    // Normalize horizontal movement
    float len = std::sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0.001f) {
        moveX = (moveX / len) * speed;
        moveZ = (moveZ / len) * speed;
    }

    // Check grounded state via raycast
    btVector3 currentVel = body->getLinearVelocity();
    bool grounded = false;
    auto* world = context.Get<btDiscreteDynamicsWorld*>("physics_world", nullptr);
    if (world) {
        btTransform bodyTransform;
        body->getMotionState()->getWorldTransform(bodyTransform);
        btVector3 from = bodyTransform.getOrigin();
        btVector3 to = from + btVector3(0, -1.2f, 0);
        btCollisionWorld::ClosestRayResultCallback rayResult(from, to);
        world->rayTest(from, to, rayResult);
        grounded = rayResult.hasHit();
    }

    if (grounded) {
        // Full ground control
        body->setLinearVelocity(btVector3(moveX, currentVel.y(), moveZ));
    } else {
        // Air control: blend input with current horizontal velocity (Quake-style)
        float curX = currentVel.x();
        float curZ = currentVel.z();
        float newX = curX + (moveX - curX) * airControl;
        float newZ = curZ + (moveZ - curZ) * airControl;
        body->setLinearVelocity(btVector3(newX, currentVel.y(), newZ));

        // Extra downward gravity for snappy Quake-style landing
        if (currentVel.y() < 0.0f) {
            body->applyCentralForce(btVector3(0, -9.81f * body->getMass() * (gravityScale - 1.0f), 0));
        }
    }

    // Jump - hold space for higher jump, release early for short hop
    bool wasJumping = context.GetBool("player_jumping", false);
    float jumpTime = context.Get<float>("player_jump_time", 0.0f);
    float jumpDuration = getNum("jump_duration", 1.2f);
    float jumpHeight = getNum("jump_height", 3.5f);

    if (keySpace && !keyCtrl && grounded && !wasJumping) {
        context.Set<bool>("player_jumping", true);
        context.Set<float>("player_jump_time", 0.0f);
        jumpTime = 0.0f;
    }

    if (context.GetBool("player_jumping", false)) {
        float dt = 1.0f / 60.0f;
        jumpTime += dt;
        context.Set<float>("player_jump_time", jumpTime);

        // Keep rising while space is held and under max duration
        if (keySpace && jumpTime < jumpDuration) {
            float t = jumpTime / jumpDuration;
            float upSpeed = (jumpHeight / jumpDuration) * (1.0f - t * t);
            btVector3 vel = body->getLinearVelocity();
            body->setLinearVelocity(btVector3(vel.x(), upSpeed, vel.z()));
        } else {
            // Released space or hit max duration - start falling
            context.Set<bool>("player_jumping", false);
        }
    }

    if (grounded && !keySpace) {
        context.Set<bool>("player_jumping", false);
    }

    // Crouch: smoothly lerp eye height for natural feel
    float targetHeight = keyCtrl ? crouchHeight : standHeight;
    float currentHeight = context.Get<float>("camera_eye_height", standHeight);
    float lerpSpeed = 8.0f;  // units per second (fast but smooth)
    float dt = context.Get<float>("physics_dt", 1.0f / 60.0f);
    float newHeight = currentHeight + (targetHeight - currentHeight) * std::min(lerpSpeed * dt, 1.0f);
    context.Set<float>("camera_eye_height", newHeight);
    context.Set<bool>("player_crouching", keyCtrl);
    context.Set<bool>("player_sprinting", keyShift && !keyCtrl);

    body->activate(true);
}

}  // namespace sdl3cpp::services::impl
