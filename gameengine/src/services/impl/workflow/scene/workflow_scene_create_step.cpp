#include "services/interfaces/workflow/scene/workflow_scene_create_step.hpp"

#include "services/interfaces/workflow/workflow_step_io_resolver.hpp"

#include <stdexcept>
#include <utility>
#include <uuid/uuid.h>

namespace sdl3cpp::services::impl {

WorkflowSceneCreateStep::WorkflowSceneCreateStep(std::shared_ptr<ISceneService> sceneService,
                                                 std::shared_ptr<ILogger> logger)
    : sceneService_(std::move(sceneService)),
      logger_(std::move(logger)) {}

std::string WorkflowSceneCreateStep::GetPluginId() const {
    return "scene.create";
}

void WorkflowSceneCreateStep::Execute(const WorkflowStepDefinition& step, WorkflowContext& context) {
    if (!sceneService_) {
        throw std::runtime_error("scene.create requires an ISceneService");
    }

    WorkflowStepIoResolver resolver;
    const std::string outputKey = resolver.GetRequiredOutputKey(step, "scene_id");

    // Generate a unique scene ID
    uuid_t uuid_val;
    uuid_generate(uuid_val);
    char uuid_str[37];
    uuid_unparse(uuid_val, uuid_str);
    std::string sceneId(uuid_str);

    // Store scene_id in context
    context.Set(outputKey, sceneId);

    if (logger_) {
        logger_->Trace("WorkflowSceneCreateStep", "Execute",
                       "scene_id=" + sceneId,
                       "Created new scene");
    }
}

}  // namespace sdl3cpp::services::impl
