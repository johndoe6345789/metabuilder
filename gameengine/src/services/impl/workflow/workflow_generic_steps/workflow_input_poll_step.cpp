#include "services/interfaces/workflow/workflow_generic_steps/workflow_input_poll_step.hpp"
#include "services/interfaces/workflow_step_definition.hpp"
#include "services/interfaces/workflow_context.hpp"

#include <SDL3/SDL.h>
#include <nlohmann/json.hpp>
#include <utility>

namespace sdl3cpp::services::impl {

WorkflowInputPollStep::WorkflowInputPollStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowInputPollStep::GetPluginId() const {
    return "input.poll";
}

void WorkflowInputPollStep::Execute(
    const WorkflowStepDefinition& step, WorkflowContext& context) {

    float mouseRelX = 0.0f, mouseRelY = 0.0f;

    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        switch (event.type) {
            case SDL_EVENT_QUIT:
                context.Set<bool>("game_running", false);
                break;
            case SDL_EVENT_KEY_DOWN:
                if (event.key.key == SDLK_ESCAPE) {
                    context.Set<bool>("game_running", false);
                }
                break;
            case SDL_EVENT_MOUSE_MOTION:
                mouseRelX += event.motion.xrel;
                mouseRelY += event.motion.yrel;
                break;
        }
    }

    // Store accumulated mouse motion for this frame
    context.Set<float>("input_mouse_rel_x", mouseRelX);
    context.Set<float>("input_mouse_rel_y", mouseRelY);

    // Read keyboard state (snapshot, not event-based)
    const bool* keyState = SDL_GetKeyboardState(nullptr);
    if (keyState) {
        context.Set<bool>("input_key_w", keyState[SDL_SCANCODE_W]);
        context.Set<bool>("input_key_a", keyState[SDL_SCANCODE_A]);
        context.Set<bool>("input_key_s", keyState[SDL_SCANCODE_S]);
        context.Set<bool>("input_key_d", keyState[SDL_SCANCODE_D]);
        context.Set<bool>("input_key_space", keyState[SDL_SCANCODE_SPACE]);
        context.Set<bool>("input_key_shift", keyState[SDL_SCANCODE_LSHIFT]);
    }
}

}  // namespace sdl3cpp::services::impl
