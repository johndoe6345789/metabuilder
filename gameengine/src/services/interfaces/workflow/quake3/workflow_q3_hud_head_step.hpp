#pragma once
#include "services/interfaces/i_workflow_step.hpp"
#include "services/interfaces/i_logger.hpp"
#include "services/interfaces/workflow_context.hpp"
#include <SDL3/SDL_gpu.h>
#include <memory>
#include <string>

namespace sdl3cpp::services::impl {

// Renders the player head MD3 model to a small (kHeadSz x kHeadSz) GPU render
// target each frame and stores it in context as "overlay.head_gpu_tex".
// overlay.sw.end reads that texture and blits it at "hud.face_rect_*" position.
class WorkflowQ3HudHeadStep final : public IWorkflowStep {
public:
    explicit WorkflowQ3HudHeadStep(std::shared_ptr<ILogger> logger);
    ~WorkflowQ3HudHeadStep();
    std::string GetPluginId() const override;
    void Execute(const WorkflowStepDefinition& step, WorkflowContext& context) override;

    static constexpr int kHeadSz = 64;  // square render target size

private:
    bool TryInitRT(SDL_GPUDevice* device);

    std::shared_ptr<ILogger> logger_;
    SDL_GPUDevice*  device_   = nullptr;
    SDL_GPUTexture* color_rt_ = nullptr;
    SDL_GPUTexture* depth_rt_ = nullptr;
    bool            ready_    = false;
    float           yaw_      = 0.0f;   // slow portrait rotation (radians)
};

}  // namespace sdl3cpp::services::impl
