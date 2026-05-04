#include "services/interfaces/workflow/quake3/workflow_q3_hud_head_step.hpp"
#include "services/interfaces/workflow/rendering/rendering_types.hpp"
#include "services/interfaces/workflow/quake3/q3_overlay_utils.hpp"
#include "services/interfaces/workflow_context.hpp"

#include <SDL3/SDL_gpu.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <nlohmann/json.hpp>

#include <cmath>
#include <cstring>
#include <string>

namespace sdl3cpp::services::impl {

using namespace q3overlay;

WorkflowQ3HudHeadStep::WorkflowQ3HudHeadStep(std::shared_ptr<ILogger> l)
    : logger_(std::move(l)) {}

WorkflowQ3HudHeadStep::~WorkflowQ3HudHeadStep() {
    if (device_) {
        if (color_rt_) { SDL_ReleaseGPUTexture(device_, color_rt_); color_rt_ = nullptr; }
        if (depth_rt_) { SDL_ReleaseGPUTexture(device_, depth_rt_); depth_rt_ = nullptr; }
    }
}

std::string WorkflowQ3HudHeadStep::GetPluginId() const { return "q3.hud_head_render"; }

bool WorkflowQ3HudHeadStep::TryInitRT(SDL_GPUDevice* device) {
    device_ = device;

    SDL_GPUTextureCreateInfo ci{};
    ci.type               = SDL_GPU_TEXTURETYPE_2D;
    ci.width              = kHeadSz;
    ci.height             = kHeadSz;
    ci.layer_count_or_depth = 1;
    ci.num_levels         = 1;

    ci.format = SDL_GPU_TEXTUREFORMAT_R8G8B8A8_UNORM;
    ci.usage  = SDL_GPU_TEXTUREUSAGE_COLOR_TARGET | SDL_GPU_TEXTUREUSAGE_SAMPLER;
    color_rt_ = SDL_CreateGPUTexture(device, &ci);

    ci.format = SDL_GPU_TEXTUREFORMAT_D32_FLOAT;
    ci.usage  = SDL_GPU_TEXTUREUSAGE_DEPTH_STENCIL_TARGET;
    depth_rt_ = SDL_CreateGPUTexture(device, &ci);

    ready_ = color_rt_ && depth_rt_;
    if (logger_) logger_->Info("q3.hud_head_render: render target " +
                               std::string(ready_ ? "ready" : "FAILED"));
    return ready_;
}

// ---------------------------------------------------------------------------
// Draw all surfaces of a named MD3 into an already-bound render pass.
// ---------------------------------------------------------------------------
static void DrawHeadMd3(const std::string& prefix,
                        const glm::mat4& mvp, const glm::mat4& model,
                        const rendering::FragmentUniformData& fu,
                        SDL_GPURenderPass* pass, SDL_GPUCommandBuffer* cmd,
                        WorkflowContext& context) {
    const int nSurfs = context.Get<int>("q3.md3." + prefix + "_num_surfs", 0);
    if (nSurfs <= 0) return;

    rendering::VertexUniformData vu{};
    std::memcpy(vu.mvp,       glm::value_ptr(mvp),   sizeof(float) * 16);
    std::memcpy(vu.model_mat, glm::value_ptr(model), sizeof(float) * 16);
    vu.normal[1] = 1.0f;
    vu.uv_scale[0] = 1.0f; vu.uv_scale[1] = 1.0f;

    // Identity shadow VP — no shadows in portrait
    const glm::mat4 noShadow(1.0f);
    std::memcpy(vu.shadow_vp, glm::value_ptr(noShadow), sizeof(float) * 16);

    for (int s = 0; s < nSurfs; ++s) {
        const std::string sk = "q3.md3." + prefix + "_surf" + std::to_string(s);
        auto* vb = context.Get<SDL_GPUBuffer*>(sk + "_f0_vb", nullptr);  // frame 0
        auto* ib = context.Get<SDL_GPUBuffer*>(sk + "_ib",    nullptr);
        const int nIdx = context.Get<int>(sk + "_num_idx", 0);
        if (!vb || !ib || nIdx <= 0) continue;

        auto* tex  = context.Get<SDL_GPUTexture*>(sk + "_tex",  nullptr);
        auto* samp = context.Get<SDL_GPUSampler*>(sk + "_samp", nullptr);
        if (!tex || !samp) continue;

        // Bind albedo twice — slot 1 used as shadow map placeholder
        SDL_GPUTextureSamplerBinding bindings[2] = {{tex, samp}, {tex, samp}};
        SDL_BindGPUFragmentSamplers(pass, 0, bindings, 2);

        SDL_GPUBufferBinding vbb{vb, 0}; SDL_BindGPUVertexBuffers(pass, 0, &vbb, 1);
        SDL_GPUBufferBinding ibb{ib, 0}; SDL_BindGPUIndexBuffer(pass, &ibb, SDL_GPU_INDEXELEMENTSIZE_16BIT);
        SDL_PushGPUVertexUniformData(cmd, 0, &vu, sizeof(vu));
        SDL_PushGPUFragmentUniformData(cmd, 0, &fu, sizeof(fu));
        SDL_DrawGPUIndexedPrimitives(pass, (uint32_t)nIdx, 1, 0, 0, 0);
    }
}

// ---------------------------------------------------------------------------
void WorkflowQ3HudHeadStep::Execute(
        const WorkflowStepDefinition&, WorkflowContext& context) {
    if (context.GetBool("frame_skip", false)) return;
    if (context.GetBool("q3.menu_open", false)) return;

    auto* device = context.Get<SDL_GPUDevice*>("gpu_device", nullptr);
    auto* cmd    = context.Get<SDL_GPUCommandBuffer*>("gpu_command_buffer", nullptr);
    if (!device || !cmd) return;

    // Head model must be loaded
    if (context.Get<int>("q3.md3.head_num_surfs", 0) <= 0) return;

    auto* pipeline = context.Get<SDL_GPUGraphicsPipeline*>("gpu_pipeline_textured", nullptr);
    if (!pipeline) return;

    if (!ready_ && !TryInitRT(device)) return;

    // ── Build portrait camera ────────────────────────────────────────────────
    // Slow Y-axis rotation so the head gently spins — a quarter turn per ~300 frames.
    yaw_ += 0.021f;

    // The head model is centred near the origin.  Place a close-up camera
    // slightly above and in front; the head radius is ~0.15 world units.
    const float camDist = 0.45f;
    const glm::vec3 camPos(
        std::sin(yaw_) * camDist,
        0.06f,
        std::cos(yaw_) * camDist);

    const glm::mat4 view = glm::lookAt(camPos,
                                       glm::vec3(0.0f, 0.04f, 0.0f),
                                       glm::vec3(0.0f, 1.0f,  0.0f));
    const glm::mat4 proj = glm::perspective(
        glm::radians(55.0f), 1.0f /*square aspect*/, 0.01f, 10.0f);
    const glm::mat4 model(1.0f);  // head at world origin
    const glm::mat4 mvp = proj * view * model;

    rendering::FragmentUniformData fu{};
    fu.material[0] = 0.7f;  // roughness
    fu.material[1] = 0.0f;  // metallic
    // Soft front-right key light
    fu.light_dir[0] =  0.5f; fu.light_dir[1] = -0.7f; fu.light_dir[2] = -0.5f;
    fu.light_color[0] = 1.2f; fu.light_color[1] = 1.1f; fu.light_color[2] = 1.0f;
    fu.ambient[0] = fu.ambient[1] = fu.ambient[2] = 0.35f;

    // ── Offscreen render pass → color_rt_ ───────────────────────────────────
    SDL_GPUColorTargetInfo cti{};
    cti.texture    = color_rt_;
    cti.clear_color = {0.05f, 0.05f, 0.06f, 1.0f};  // near-black background
    cti.load_op    = SDL_GPU_LOADOP_CLEAR;
    cti.store_op   = SDL_GPU_STOREOP_STORE;

    SDL_GPUDepthStencilTargetInfo dti{};
    dti.texture    = depth_rt_;
    dti.clear_depth = 1.0f;
    dti.load_op    = SDL_GPU_LOADOP_CLEAR;
    dti.store_op   = SDL_GPU_STOREOP_DONT_CARE;

    SDL_GPURenderPass* pass = SDL_BeginGPURenderPass(cmd, &cti, 1, &dti);
    if (!pass) return;

    SDL_GPUViewport vp{};
    vp.x = 0; vp.y = 0;
    vp.w = kHeadSz; vp.h = kHeadSz;
    vp.min_depth = 0.0f; vp.max_depth = 1.0f;
    SDL_SetGPUViewport(pass, &vp);

    SDL_BindGPUGraphicsPipeline(pass, pipeline);
    DrawHeadMd3("head", mvp, model, fu, pass, cmd, context);

    SDL_EndGPURenderPass(pass);

    // ── Expose the render target so overlay.sw.end can blit it ──────────────
    context.Set<SDL_GPUTexture*>("overlay.head_gpu_tex", color_rt_);

    // ── Face rect in overlay-space (matches q3.hud layout) ──────────────────
    constexpr float kNS = 1.0f;
    constexpr float kNH = 32.f * kNS;

    const int health   = context.Get<int>("q3.player_health", 100);
    const float hNumW  = (health >= 100 ? 3 : health >= 10 ? 2 : 1) * 32.f * kNS;
    const float cluster = hNumW + 4.f + kNH;
    const float hx     = kW * 0.5f - cluster * 0.5f;

    context.Set<float>("hud.face_rect_x", hx + hNumW + 4.f);
    context.Set<float>("hud.face_rect_y", kH - kNH - 6.f);
    context.Set<float>("hud.face_rect_w", kNH);
    context.Set<float>("hud.face_rect_h", kNH);
}

}  // namespace sdl3cpp::services::impl
