#pragma once

#include "services/interfaces/i_workflow_step.hpp"
#include "services/interfaces/i_logger.hpp"
#include "services/interfaces/workflow_context.hpp"

#include <SDL3/SDL_gpu.h>
#include <SDL3/SDL_render.h>
#include <SDL3/SDL_surface.h>
#include <cstdint>
#include <memory>

namespace sdl3cpp::services::impl {

class WorkflowQ3OverlayDrawStep final : public IWorkflowStep {
public:
    explicit WorkflowQ3OverlayDrawStep(std::shared_ptr<ILogger> logger);
    ~WorkflowQ3OverlayDrawStep();

    std::string GetPluginId() const override;
    void Execute(const WorkflowStepDefinition& step, WorkflowContext& context) override;

private:
    void TryInit(SDL_GPUDevice* device, SDL_Window* window);
    void DrawSurface(WorkflowContext& context, uint32_t frameW, uint32_t frameH);
    void Render(SDL_GPUCommandBuffer* cmd, SDL_GPUTexture* swapchainTex,
                SDL_GPUDevice* device, uint32_t frameW, uint32_t frameH);

    std::shared_ptr<ILogger> logger_;
    bool ready_ = false;
    bool disabled_ = false;
    bool vbuf_uploaded_ = false;
    SDL_GPUDevice* device_ = nullptr;
    SDL_GPUGraphicsPipeline* pipeline_ = nullptr;
    SDL_GPUTexture* tex_ = nullptr;
    SDL_GPUTransferBuffer* transfer_ = nullptr;
    SDL_GPUBuffer* vtx_buf_ = nullptr;
    SDL_GPUSampler* sampler_ = nullptr;
    SDL_Surface* surface_ = nullptr;
    SDL_Renderer* renderer_ = nullptr;

    static constexpr int kW = 640;
    static constexpr int kH = 360;
};

}  // namespace sdl3cpp::services::impl
