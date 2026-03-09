#include "services/interfaces/workflow/graphics/workflow_graphics_gpu_init_step.hpp"
#include "services/interfaces/workflow/workflow_step_io_resolver.hpp"

#include <SDL3/SDL_gpu.h>
#include <SDL3/SDL.h>
#include <nlohmann/json.hpp>
#include <stdexcept>

namespace sdl3cpp::services::impl {

WorkflowGraphicsGpuInitStep::WorkflowGraphicsGpuInitStep(
    std::shared_ptr<ILogger> logger,
    std::shared_ptr<IPlatformService> platform_service)
    : logger_(std::move(logger)),
      platform_service_(std::move(platform_service)) {}

std::string WorkflowGraphicsGpuInitStep::GetPluginId() const {
    return "graphics.gpu.init";
}

void WorkflowGraphicsGpuInitStep::Execute(const WorkflowStepDefinition& step, WorkflowContext& context) {
    WorkflowStepIoResolver resolver;
    const std::string viewportKey = resolver.GetRequiredInputKey(step, "viewport_config");
    const std::string rendererKey = resolver.GetRequiredInputKey(step, "selected_renderer");
    const std::string outputHandleKey = resolver.GetRequiredOutputKey(step, "gpu_handle");

    const auto* viewport_config = context.TryGet<nlohmann::json>(viewportKey);
    const auto* renderer_str = context.TryGet<std::string>(rendererKey);

    if (!viewport_config || !renderer_str) {
        throw std::runtime_error("graphics.gpu.init requires viewport_config and selected_renderer inputs");
    }

    uint32_t width = (*viewport_config)["width"];
    uint32_t height = (*viewport_config)["height"];
    std::string renderer = *renderer_str;

    // Map renderer string to SDL_GPUShaderFormat
    SDL_GPUShaderFormat shader_format;
    const char* driver_name = nullptr;

    if (renderer == "metal") {
        shader_format = SDL_GPU_SHADERFORMAT_MSL;
        driver_name = "metal";
    } else if (renderer == "vulkan") {
        shader_format = SDL_GPU_SHADERFORMAT_SPIRV;
        driver_name = "vulkan";
    } else if (renderer == "d3d12") {
        shader_format = SDL_GPU_SHADERFORMAT_DXIL;
        driver_name = "direct3d12";
    } else {
        // auto: accept all formats so SDL picks best available backend
        shader_format = static_cast<SDL_GPUShaderFormat>(
            SDL_GPU_SHADERFORMAT_SPIRV | SDL_GPU_SHADERFORMAT_MSL | SDL_GPU_SHADERFORMAT_DXIL);
    }

    // Create GPU device with preferred shader format
    SDL_GPUDevice* device = SDL_CreateGPUDevice(shader_format, true, driver_name);

    if (!device) {
        if (logger_) {
            logger_->Warn("graphics.gpu.init: Failed with " + renderer + ": " + std::string(SDL_GetError()));
        }

        // Fallback: let SDL auto-select
        device = SDL_CreateGPUDevice(
            SDL_GPU_SHADERFORMAT_SPIRV | SDL_GPU_SHADERFORMAT_MSL | SDL_GPU_SHADERFORMAT_DXIL,
            true, nullptr);

        if (!device) {
            throw std::runtime_error("graphics.gpu.init: SDL_CreateGPUDevice failed even with fallback: " +
                                     std::string(SDL_GetError()));
        }
    }

    // Claim the SDL window for GPU rendering
    SDL_Window* window = context.Get<SDL_Window*>("sdl_window", nullptr);
    if (!window) {
        SDL_DestroyGPUDevice(device);
        throw std::runtime_error("graphics.gpu.init: SDL window not found in context");
    }

    if (!SDL_ClaimWindowForGPUDevice(device, window)) {
        SDL_DestroyGPUDevice(device);
        throw std::runtime_error("graphics.gpu.init: SDL_ClaimWindowForGPUDevice failed: " +
                                 std::string(SDL_GetError()));
    }

    const char* device_driver = SDL_GetGPUDeviceDriver(device);
    if (logger_) {
        logger_->Trace("WorkflowGraphicsGpuInitStep", "Execute",
                       "width=" + std::to_string(width) +
                       ", height=" + std::to_string(height) +
                       ", driver=" + std::string(device_driver ? device_driver : "unknown"),
                       "GPU device initialized successfully");
    }

    // Store GPU device pointer in context for all downstream steps
    context.Set<SDL_GPUDevice*>("gpu_device", device);

    // Also store state as JSON for compatibility
    nlohmann::json gpu_state = {
        {"initialized", true},
        {"width", width},
        {"height", height},
        {"renderer", device_driver ? device_driver : renderer}
    };
    context.Set(outputHandleKey, gpu_state);
}

}  // namespace sdl3cpp::services::impl
