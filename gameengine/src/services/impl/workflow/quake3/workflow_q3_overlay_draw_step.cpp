#include "services/interfaces/workflow/quake3/workflow_q3_overlay_draw_step.hpp"

#include <SDL3/SDL.h>
#include <nlohmann/json.hpp>

#include <cstring>
#include <fstream>
#include <string>
#include <vector>

namespace sdl3cpp::services::impl {

namespace {

std::vector<uint8_t> LoadBinary(const char* path) {
    std::ifstream f(path, std::ios::binary | std::ios::ate);
    if (!f.is_open()) return {};
    auto size = f.tellg();
    std::vector<uint8_t> data(static_cast<size_t>(size));
    f.seekg(0);
    f.read(reinterpret_cast<char*>(data.data()), size);
    return data;
}

void Text(SDL_Renderer* r, float x, float y, const char* text, SDL_Color color) {
    SDL_SetRenderDrawColor(r, color.r, color.g, color.b, color.a);
    SDL_RenderDebugText(r, x, y, text);
}

}  // namespace

WorkflowQ3OverlayDrawStep::WorkflowQ3OverlayDrawStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

WorkflowQ3OverlayDrawStep::~WorkflowQ3OverlayDrawStep() {
    if (renderer_) SDL_DestroyRenderer(renderer_);
    if (surface_) SDL_DestroySurface(surface_);
    if (device_) {
        if (sampler_) SDL_ReleaseGPUSampler(device_, sampler_);
        if (vtx_buf_) SDL_ReleaseGPUBuffer(device_, vtx_buf_);
        if (transfer_) SDL_ReleaseGPUTransferBuffer(device_, transfer_);
        if (tex_) SDL_ReleaseGPUTexture(device_, tex_);
        if (pipeline_) SDL_ReleaseGPUGraphicsPipeline(device_, pipeline_);
    }
}

std::string WorkflowQ3OverlayDrawStep::GetPluginId() const {
    return "q3.overlay.draw";
}

void WorkflowQ3OverlayDrawStep::TryInit(SDL_GPUDevice* device, SDL_Window* window) {
    if (disabled_ || ready_) return;
    device_ = device;

    const char* driver = SDL_GetGPUDeviceDriver(device);
    const std::string driverName = driver ? driver : "";
    SDL_GPUShaderFormat shaderFormat = SDL_GPU_SHADERFORMAT_INVALID;
    std::vector<uint8_t> vert;
    std::vector<uint8_t> frag;
    const char* entry = "main";
    if (driverName == "metal") {
        shaderFormat = SDL_GPU_SHADERFORMAT_MSL;
        vert = LoadBinary("packages/quake3/shaders/msl/overlay.vert.metal");
        frag = LoadBinary("packages/quake3/shaders/msl/overlay.frag.metal");
        entry = "main0";
    } else if (driverName == "vulkan") {
        shaderFormat = SDL_GPU_SHADERFORMAT_SPIRV;
        vert = LoadBinary("packages/quake3/shaders/spirv/overlay.vert.spv");
        frag = LoadBinary("packages/quake3/shaders/spirv/overlay.frag.spv");
    } else {
        disabled_ = true;
        return;
    }
    if (vert.empty() || frag.empty()) {
        disabled_ = true;
        return;
    }

    SDL_GPUShaderCreateInfo vsi = {};
    vsi.code = vert.data();
    vsi.code_size = vert.size();
    vsi.entrypoint = entry;
    vsi.format = shaderFormat;
    vsi.stage = SDL_GPU_SHADERSTAGE_VERTEX;
    SDL_GPUShaderCreateInfo fsi = {};
    fsi.code = frag.data();
    fsi.code_size = frag.size();
    fsi.entrypoint = entry;
    fsi.format = shaderFormat;
    fsi.stage = SDL_GPU_SHADERSTAGE_FRAGMENT;
    fsi.num_samplers = 1;
    auto* vs = SDL_CreateGPUShader(device, &vsi);
    auto* fs = SDL_CreateGPUShader(device, &fsi);
    if (!vs || !fs) {
        if (vs) SDL_ReleaseGPUShader(device, vs);
        if (fs) SDL_ReleaseGPUShader(device, fs);
        disabled_ = true;
        return;
    }

    SDL_GPUVertexBufferDescription vbd = {};
    vbd.slot = 0;
    vbd.pitch = sizeof(float) * 5;
    vbd.input_rate = SDL_GPU_VERTEXINPUTRATE_VERTEX;
    SDL_GPUVertexAttribute attrs[2] = {};
    attrs[0] = {0, 0, SDL_GPU_VERTEXELEMENTFORMAT_FLOAT3, 0};
    attrs[1] = {1, 0, SDL_GPU_VERTEXELEMENTFORMAT_FLOAT2, sizeof(float) * 3};
    SDL_GPUVertexInputState vis = {};
    vis.vertex_buffer_descriptions = &vbd;
    vis.num_vertex_buffers = 1;
    vis.vertex_attributes = attrs;
    vis.num_vertex_attributes = 2;

    SDL_GPUColorTargetDescription ctd = {};
    ctd.format = window ? SDL_GetGPUSwapchainTextureFormat(device, window) : SDL_GPU_TEXTUREFORMAT_B8G8R8A8_UNORM;
    ctd.blend_state.enable_blend = true;
    ctd.blend_state.src_color_blendfactor = SDL_GPU_BLENDFACTOR_SRC_ALPHA;
    ctd.blend_state.dst_color_blendfactor = SDL_GPU_BLENDFACTOR_ONE_MINUS_SRC_ALPHA;
    ctd.blend_state.color_blend_op = SDL_GPU_BLENDOP_ADD;
    ctd.blend_state.src_alpha_blendfactor = SDL_GPU_BLENDFACTOR_ONE;
    ctd.blend_state.dst_alpha_blendfactor = SDL_GPU_BLENDFACTOR_ZERO;
    ctd.blend_state.alpha_blend_op = SDL_GPU_BLENDOP_ADD;

    SDL_GPUGraphicsPipelineCreateInfo pci = {};
    pci.vertex_shader = vs;
    pci.fragment_shader = fs;
    pci.vertex_input_state = vis;
    pci.primitive_type = SDL_GPU_PRIMITIVETYPE_TRIANGLELIST;
    pci.rasterizer_state.fill_mode = SDL_GPU_FILLMODE_FILL;
    pci.rasterizer_state.cull_mode = SDL_GPU_CULLMODE_NONE;
    pci.rasterizer_state.front_face = SDL_GPU_FRONTFACE_COUNTER_CLOCKWISE;
    pci.depth_stencil_state.enable_depth_test = false;
    pci.depth_stencil_state.enable_depth_write = false;
    pci.target_info.num_color_targets = 1;
    pci.target_info.color_target_descriptions = &ctd;
    pipeline_ = SDL_CreateGPUGraphicsPipeline(device, &pci);
    SDL_ReleaseGPUShader(device, vs);
    SDL_ReleaseGPUShader(device, fs);
    if (!pipeline_) {
        disabled_ = true;
        return;
    }

    SDL_GPUTextureCreateInfo tci = {};
    tci.type = SDL_GPU_TEXTURETYPE_2D;
    tci.format = SDL_GPU_TEXTUREFORMAT_R8G8B8A8_UNORM;
    tci.width = kW;
    tci.height = kH;
    tci.layer_count_or_depth = 1;
    tci.num_levels = 1;
    tci.usage = SDL_GPU_TEXTUREUSAGE_SAMPLER;
    tex_ = SDL_CreateGPUTexture(device, &tci);
    SDL_GPUTransferBufferCreateInfo tbci = {};
    tbci.usage = SDL_GPU_TRANSFERBUFFERUSAGE_UPLOAD;
    tbci.size = kW * kH * 4;
    transfer_ = SDL_CreateGPUTransferBuffer(device, &tbci);
    SDL_GPUBufferCreateInfo bci = {};
    bci.usage = SDL_GPU_BUFFERUSAGE_VERTEX;
    bci.size = 6u * 5u * static_cast<uint32_t>(sizeof(float));
    vtx_buf_ = SDL_CreateGPUBuffer(device, &bci);
    SDL_GPUSamplerCreateInfo sci = {};
    sci.min_filter = SDL_GPU_FILTER_NEAREST;
    sci.mag_filter = SDL_GPU_FILTER_NEAREST;
    sci.mipmap_mode = SDL_GPU_SAMPLERMIPMAPMODE_NEAREST;
    sci.address_mode_u = SDL_GPU_SAMPLERADDRESSMODE_CLAMP_TO_EDGE;
    sci.address_mode_v = SDL_GPU_SAMPLERADDRESSMODE_CLAMP_TO_EDGE;
    sampler_ = SDL_CreateGPUSampler(device, &sci);
    surface_ = SDL_CreateSurface(kW, kH, SDL_PIXELFORMAT_RGBA32);
    renderer_ = surface_ ? SDL_CreateSoftwareRenderer(surface_) : nullptr;
    ready_ = tex_ && transfer_ && vtx_buf_ && sampler_ && surface_ && renderer_;
}

void WorkflowQ3OverlayDrawStep::DrawSurface(WorkflowContext& context, uint32_t frameW, uint32_t frameH) {
    SDL_SetRenderDrawColor(renderer_, 0, 0, 0, 0);
    SDL_RenderClear(renderer_);

    SDL_SetRenderDrawBlendMode(renderer_, SDL_BLENDMODE_BLEND);
    SDL_FRect hudBg{12, static_cast<float>(kH - 44), 230, 28};
    SDL_SetRenderDrawColor(renderer_, 0, 0, 0, 150);
    SDL_RenderFillRect(renderer_, &hudBg);

    const std::string weapon = context.Get<std::string>("q3.current_weapon", "weapon_machinegun");
    const int shots = context.Get<int>("q3.shots_fired", 0);
    const int damage = context.Get<int>("q3.damage_done", 0);
    std::string hud = "WEAPON " + weapon.substr(7) + "   SHOTS " + std::to_string(shots) +
                      "   DAMAGE " + std::to_string(damage);
    Text(renderer_, 20, static_cast<float>(kH - 36), hud.c_str(), SDL_Color{255, 216, 64, 255});
    Text(renderer_, static_cast<float>(kW / 2 - 4), static_cast<float>(kH / 2 - 4), "+", SDL_Color{255, 255, 255, 220});

    const uint32_t frame = static_cast<uint32_t>(context.GetDouble("loop.iteration", 0.0));
    const bool flashing = frame < context.Get<uint32_t>("q3.weapon_flash_until_frame", 0u);
    const bool hitMarker = frame < context.Get<uint32_t>("q3.hit_marker_until_frame", 0u);

    SDL_SetRenderDrawColor(renderer_, 34, 34, 38, 235);
    SDL_FRect gunBody{410, 278, 168, 46};
    SDL_RenderFillRect(renderer_, &gunBody);
    SDL_SetRenderDrawColor(renderer_, 92, 96, 110, 255);
    SDL_RenderRect(renderer_, &gunBody);
    SDL_SetRenderDrawColor(renderer_, 20, 20, 22, 255);
    SDL_FRect grip{452, 318, 36, 30};
    SDL_RenderFillRect(renderer_, &grip);
    SDL_FRect barrel{568, 291, 54, 18};
    SDL_RenderFillRect(renderer_, &barrel);
    SDL_SetRenderDrawColor(renderer_, 255, 210, 70, 255);
    SDL_RenderLine(renderer_, 424, 290, 550, 290);
    Text(renderer_, 430, 300, weapon.substr(7).c_str(), SDL_Color{220, 235, 255, 255});
    if (flashing) {
        SDL_SetRenderDrawColor(renderer_, 255, 190, 50, 230);
        SDL_FRect flash{616, 284, 18, 32};
        SDL_RenderFillRect(renderer_, &flash);
        SDL_RenderLine(renderer_, 615, 300, 638, 276);
        SDL_RenderLine(renderer_, 615, 300, 638, 324);
    }
    if (hitMarker) {
        SDL_SetRenderDrawColor(renderer_, 255, 80, 55, 255);
        SDL_RenderLine(renderer_, 308, 172, 320, 160);
        SDL_RenderLine(renderer_, 332, 172, 320, 160);
        SDL_RenderLine(renderer_, 308, 188, 320, 200);
        SDL_RenderLine(renderer_, 332, 188, 320, 200);
        Text(renderer_, 300, 204, "HIT", SDL_Color{255, 92, 64, 255});
    }

    if (context.GetBool("q3.menu_open", false)) {
        SDL_FRect panel{120, 42, 400, 250};
        SDL_SetRenderDrawColor(renderer_, 0, 0, 0, 210);
        SDL_RenderFillRect(renderer_, &panel);
        SDL_SetRenderDrawColor(renderer_, 40, 120, 220, 255);
        SDL_RenderRect(renderer_, &panel);
        Text(renderer_, 170, 62, "QUAKE III ARENA", SDL_Color{255, 216, 64, 255});
        Text(renderer_, 160, 88, "SKIRMISH / MAP SELECTION", SDL_Color{180, 220, 255, 255});

        auto maps = context.Get<nlohmann::json>("q3.maps", nlohmann::json::array());
        int selected = context.Get<int>("q3.menu_selected_map", 0);
        for (int i = 0; i < 8 && i < static_cast<int>(maps.size()); ++i) {
            int idx = (selected / 8) * 8 + i;
            if (idx >= static_cast<int>(maps.size())) break;
            std::string line = (idx == selected ? "> " : "  ") + maps[idx].get<std::string>();
            Text(renderer_, 176, 122 + i * 16, line.c_str(),
                 idx == selected ? SDL_Color{255, 255, 255, 255} : SDL_Color{140, 190, 240, 255});
        }
        Text(renderer_, 154, 266, "UP/DOWN SELECT  ENTER SET MAP  ESC RESUME  Q QUIT", SDL_Color{180, 180, 180, 255});
        auto pending = context.Get<std::string>("q3.pending_map", "");
        if (!pending.empty()) {
            std::string msg = "NEXT START: QUAKE3_MAP=" + pending;
            Text(renderer_, 160, 246, msg.c_str(), SDL_Color{255, 170, 80, 255});
        }
    }

    SDL_RenderPresent(renderer_);
}

void WorkflowQ3OverlayDrawStep::Render(SDL_GPUCommandBuffer* cmd, SDL_GPUTexture* swapchainTex,
                                       SDL_GPUDevice* device, uint32_t frameW, uint32_t frameH) {
    void* mapped = SDL_MapGPUTransferBuffer(device, transfer_, false);
    if (!mapped) return;
    std::memcpy(mapped, surface_->pixels, kW * kH * 4);
    SDL_UnmapGPUTransferBuffer(device, transfer_);

    auto* copy = SDL_BeginGPUCopyPass(cmd);
    if (copy) {
        SDL_GPUTextureTransferInfo src = {};
        src.transfer_buffer = transfer_;
        src.pixels_per_row = kW;
        src.rows_per_layer = kH;
        SDL_GPUTextureRegion dst = {};
        dst.texture = tex_;
        dst.w = kW;
        dst.h = kH;
        dst.d = 1;
        SDL_UploadToGPUTexture(copy, &src, &dst, false);
        SDL_EndGPUCopyPass(copy);
    }

    if (!vbuf_uploaded_) {
        const float verts[6][5] = {
            {-1,  1, 0, 0, 0}, { 1,  1, 0, 1, 0}, { 1, -1, 0, 1, 1},
            {-1,  1, 0, 0, 0}, { 1, -1, 0, 1, 1}, {-1, -1, 0, 0, 1},
        };
        const uint32_t size = sizeof(verts);
        SDL_GPUTransferBufferCreateInfo tb = {};
        tb.usage = SDL_GPU_TRANSFERBUFFERUSAGE_UPLOAD;
        tb.size = size;
        auto* tmp = SDL_CreateGPUTransferBuffer(device, &tb);
        if (tmp) {
            void* ptr = SDL_MapGPUTransferBuffer(device, tmp, false);
            if (ptr) {
                std::memcpy(ptr, verts, size);
                SDL_UnmapGPUTransferBuffer(device, tmp);
            }
            auto* cp = SDL_BeginGPUCopyPass(cmd);
            if (cp) {
                SDL_GPUTransferBufferLocation src = {tmp, 0};
                SDL_GPUBufferRegion dst = {vtx_buf_, 0, size};
                SDL_UploadToGPUBuffer(cp, &src, &dst, false);
                SDL_EndGPUCopyPass(cp);
            }
            SDL_ReleaseGPUTransferBuffer(device, tmp);
        }
        vbuf_uploaded_ = true;
    }

    SDL_GPUColorTargetInfo target = {};
    target.texture = swapchainTex;
    target.load_op = SDL_GPU_LOADOP_LOAD;
    target.store_op = SDL_GPU_STOREOP_STORE;
    auto* pass = SDL_BeginGPURenderPass(cmd, &target, 1, nullptr);
    if (!pass) return;
    SDL_BindGPUGraphicsPipeline(pass, pipeline_);
    SDL_GPUBufferBinding vb = {vtx_buf_, 0};
    SDL_BindGPUVertexBuffers(pass, 0, &vb, 1);
    SDL_GPUTextureSamplerBinding ts = {tex_, sampler_};
    SDL_BindGPUFragmentSamplers(pass, 0, &ts, 1);
    SDL_DrawGPUPrimitives(pass, 6, 1, 0, 0);
    SDL_EndGPURenderPass(pass);
}

void WorkflowQ3OverlayDrawStep::Execute(const WorkflowStepDefinition& step, WorkflowContext& context) {
    if (context.GetBool("frame_skip", false)) return;
    auto* cmd = context.Get<SDL_GPUCommandBuffer*>("gpu_command_buffer", nullptr);
    auto* swapchain = context.Get<SDL_GPUTexture*>("gpu_swapchain_texture", nullptr);
    auto* device = context.Get<SDL_GPUDevice*>("gpu_device", nullptr);
    if (!cmd || !swapchain || !device) return;
    if (!ready_) TryInit(device, context.Get<SDL_Window*>("sdl_window", nullptr));
    if (!ready_) return;
    const auto fw = context.Get<uint32_t>("frame_width", 1280u);
    const auto fh = context.Get<uint32_t>("frame_height", 960u);
    DrawSurface(context, fw, fh);
    Render(cmd, swapchain, device, fw, fh);
}

}  // namespace sdl3cpp::services::impl
