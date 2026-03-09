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

    // Read move speed from parameters
    WorkflowStepParameterResolver paramResolver;
    float moveSpeed = 6.0f;
    float jumpForce = 5.0f;

    if (const auto* p = paramResolver.FindParameter(step, "move_speed")) {
        if (p->type == WorkflowParameterValue::Type::Number) moveSpeed = static_cast<float>(p->numberValue);
    }
    if (const auto* p = paramResolver.FindParameter(step, "jump_force")) {
        if (p->type == WorkflowParameterValue::Type::Number) jumpForce = static_cast<float>(p->numberValue);
    }

    // Read input state from context (set by input.poll)
    bool keyW = context.GetBool("input_key_w", false);
    bool keyA = context.GetBool("input_key_a", false);
    bool keyS = context.GetBool("input_key_s", false);
    bool keyD = context.GetBool("input_key_d", false);
    bool keySpace = context.GetBool("input_key_space", false);

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

    // Normalize horizontal movement
    float len = std::sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0.001f) {
        moveX = (moveX / len) * moveSpeed;
        moveZ = (moveZ / len) * moveSpeed;
    }

    // Preserve vertical velocity (gravity)
    btVector3 currentVel = body->getLinearVelocity();
    body->setLinearVelocity(btVector3(moveX, currentVel.y(), moveZ));

    // Jump - only if approximately grounded (vertical velocity near zero)
    if (keySpace && std::abs(currentVel.y()) < 0.1f) {
        body->applyCentralImpulse(btVector3(0, jumpForce, 0));
    }

    body->activate(true);
}

}  // namespace sdl3cpp::services::impl
