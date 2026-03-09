#include "services/interfaces/workflow/workflow_generic_steps/workflow_physics_step_step.hpp"
#include "services/interfaces/workflow/workflow_step_parameter_resolver.hpp"
#include "services/interfaces/workflow_step_definition.hpp"
#include "services/interfaces/workflow_context.hpp"

#include <btBulletDynamicsCommon.h>
#include <stdexcept>
#include <utility>

namespace sdl3cpp::services::impl {

WorkflowPhysicsStepStep::WorkflowPhysicsStepStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowPhysicsStepStep::GetPluginId() const {
    return "physics.step";
}

void WorkflowPhysicsStepStep::Execute(
    const WorkflowStepDefinition& step, WorkflowContext& context) {

    auto* world = context.Get<btDiscreteDynamicsWorld*>("physics_world", nullptr);
    if (!world) {
        throw std::runtime_error("physics.step: No physics world (run physics.world.create first)");
    }

    WorkflowStepParameterResolver paramResolver;
    float dt = 1.0f / 60.0f;
    int maxSubSteps = 10;

    if (const auto* p = paramResolver.FindParameter(step, "delta_time")) {
        if (p->type == WorkflowParameterValue::Type::Number) dt = static_cast<float>(p->numberValue);
    }
    if (const auto* p = paramResolver.FindParameter(step, "max_sub_steps")) {
        if (p->type == WorkflowParameterValue::Type::Number) maxSubSteps = static_cast<int>(p->numberValue);
    }

    world->stepSimulation(dt, maxSubSteps);
}

}  // namespace sdl3cpp::services::impl
