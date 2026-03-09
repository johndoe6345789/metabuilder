#include "services/interfaces/workflow/rendering/workflow_postfx_composite_step.hpp"
#include "services/interfaces/workflow/workflow_step_parameter_resolver.hpp"

#include <SDL3/SDL_gpu.h>
#include <stdexcept>

namespace sdl3cpp::services::impl {

WorkflowPostfxCompositeStep::WorkflowPostfxCompositeStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowPostfxCompositeStep::GetPluginId() const {
    return "postfx.composite";
}

void WorkflowPostfxCompositeStep::Execute(
    const WorkflowStepDefinition& step, WorkflowContext& context) {

    if (context.GetBool("frame_skip", false)) return;

    auto* cmd = context.Get<SDL_GPUCommandBuffer*>("gpu_command_buffer", nullptr);
    auto* pipeline = context.Get<SDL_GPUGraphicsPipeline*>("postfx_composite_pipeline", nullptr);
    auto* hdr_texture = context.Get<SDL_GPUTexture*>("postfx_hdr_texture", nullptr);
    auto* sampler = context.Get<SDL_GPUSampler*>("postfx_linear_sampler", nullptr);
    auto* swapchain_tex = context.Get<SDL_GPUTexture*>("postfx_swapchain_texture", nullptr);

    if (!cmd || !pipeline || !hdr_texture || !sampler || !swapchain_tex) {
        if (logger_) logger_->Warn("postfx.composite: Missing required resources");
        // Fall through to submit whatever we have
        if (cmd) {
            SDL_SubmitGPUCommandBuffer(cmd);
            context.Remove("gpu_command_buffer");
        }
        return;
    }

    // Begin render pass targeting swapchain
    SDL_GPUColorTargetInfo colorTarget = {};
    colorTarget.texture = swapchain_tex;
    colorTarget.load_op = SDL_GPU_LOADOP_DONT_CARE;
    colorTarget.store_op = SDL_GPU_STOREOP_STORE;

    SDL_GPURenderPass* pass = SDL_BeginGPURenderPass(cmd, &colorTarget, 1, nullptr);
    if (!pass) {
        SDL_SubmitGPUCommandBuffer(cmd);
        context.Remove("gpu_command_buffer");
        return;
    }

    // Bind composite pipeline (fullscreen triangle, no vertex buffer)
    SDL_BindGPUGraphicsPipeline(pass, pipeline);

    // Bind HDR + SSAO + Bloom textures for sampling
    auto* ssao_texture = context.Get<SDL_GPUTexture*>("postfx_ssao_texture", nullptr);
    auto* bloom_texture = context.Get<SDL_GPUTexture*>("postfx_bloom_result_texture", nullptr);

    SDL_GPUTextureSamplerBinding bindings[3] = {};
    bindings[0].texture = hdr_texture;
    bindings[0].sampler = sampler;
    bindings[1].texture = ssao_texture ? ssao_texture : hdr_texture;
    bindings[1].sampler = sampler;
    bindings[2].texture = bloom_texture ? bloom_texture : hdr_texture;
    bindings[2].sampler = sampler;
    SDL_BindGPUFragmentSamplers(pass, 0, bindings, 3);

    // Draw fullscreen triangle (3 vertices, no vertex buffer)
    SDL_DrawGPUPrimitives(pass, 3, 1, 0, 0);

    SDL_EndGPURenderPass(pass);

    // Submit command buffer and clean up
    SDL_SubmitGPUCommandBuffer(cmd);
    context.Remove("gpu_command_buffer");
    context.Remove("postfx_swapchain_texture");

    // Increment frame counter (same responsibility as frame.gpu.end)
    auto frameNum = context.Get<uint32_t>("frame_number", 0u);
    context.Set<uint32_t>("frame_number", frameNum + 1);
}

}  // namespace sdl3cpp::services::impl
