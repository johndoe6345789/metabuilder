#include "services/interfaces/workflow/quake3/workflow_q3_overlay_draw_step.hpp"

#include <SDL3/SDL.h>
#include <nlohmann/json.hpp>
#include <stb_image.h>
#include <zip.h>

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

}  // namespace

// ---------------------------------------------------------------------------
// Construction / destruction
// ---------------------------------------------------------------------------

WorkflowQ3OverlayDrawStep::WorkflowQ3OverlayDrawStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

WorkflowQ3OverlayDrawStep::~WorkflowQ3OverlayDrawStep() {
    if (renderer_) {
        if (bigchars_tex_)  SDL_DestroyTexture(bigchars_tex_);
        if (prop_font_tex_) SDL_DestroyTexture(prop_font_tex_);
        if (frame_bg_tex_)  SDL_DestroyTexture(frame_bg_tex_);
        if (frame_l_tex_)   SDL_DestroyTexture(frame_l_tex_);
        if (frame_r_tex_)   SDL_DestroyTexture(frame_r_tex_);
        if (frame2_l_tex_)  SDL_DestroyTexture(frame2_l_tex_);
        SDL_DestroyRenderer(renderer_);
    }
    if (surface_) SDL_DestroySurface(surface_);
    if (device_) {
        if (sampler_)   SDL_ReleaseGPUSampler(device_, sampler_);
        if (vtx_buf_)   SDL_ReleaseGPUBuffer(device_, vtx_buf_);
        if (transfer_)  SDL_ReleaseGPUTransferBuffer(device_, transfer_);
        if (tex_)       SDL_ReleaseGPUTexture(device_, tex_);
        if (pipeline_)  SDL_ReleaseGPUGraphicsPipeline(device_, pipeline_);
    }
}

std::string WorkflowQ3OverlayDrawStep::GetPluginId() const {
    return "q3.overlay.draw";
}

// ---------------------------------------------------------------------------
// GPU pipeline init (unchanged from before)
// ---------------------------------------------------------------------------

void WorkflowQ3OverlayDrawStep::TryInit(SDL_GPUDevice* device, SDL_Window* window) {
    if (disabled_ || ready_) return;
    device_ = device;

    const char* driver = SDL_GetGPUDeviceDriver(device);
    const std::string driverName = driver ? driver : "";
    SDL_GPUShaderFormat shaderFormat = SDL_GPU_SHADERFORMAT_INVALID;
    std::vector<uint8_t> vert, frag;
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
        disabled_ = true; return;
    }
    if (vert.empty() || frag.empty()) { disabled_ = true; return; }

    SDL_GPUShaderCreateInfo vsi = {};
    vsi.code = vert.data(); vsi.code_size = vert.size();
    vsi.entrypoint = entry; vsi.format = shaderFormat;
    vsi.stage = SDL_GPU_SHADERSTAGE_VERTEX;
    SDL_GPUShaderCreateInfo fsi = {};
    fsi.code = frag.data(); fsi.code_size = frag.size();
    fsi.entrypoint = entry; fsi.format = shaderFormat;
    fsi.stage = SDL_GPU_SHADERSTAGE_FRAGMENT;
    fsi.num_samplers = 1;
    auto* vs = SDL_CreateGPUShader(device, &vsi);
    auto* fs = SDL_CreateGPUShader(device, &fsi);
    if (!vs || !fs) {
        if (vs) SDL_ReleaseGPUShader(device, vs);
        if (fs) SDL_ReleaseGPUShader(device, fs);
        disabled_ = true; return;
    }

    SDL_GPUVertexBufferDescription vbd = {};
    vbd.slot = 0; vbd.pitch = sizeof(float) * 5;
    vbd.input_rate = SDL_GPU_VERTEXINPUTRATE_VERTEX;
    SDL_GPUVertexAttribute attrs[2] = {};
    attrs[0] = {0, 0, SDL_GPU_VERTEXELEMENTFORMAT_FLOAT3, 0};
    attrs[1] = {1, 0, SDL_GPU_VERTEXELEMENTFORMAT_FLOAT2, sizeof(float) * 3};
    SDL_GPUVertexInputState vis = {};
    vis.vertex_buffer_descriptions = &vbd; vis.num_vertex_buffers = 1;
    vis.vertex_attributes = attrs;         vis.num_vertex_attributes = 2;

    SDL_GPUColorTargetDescription ctd = {};
    ctd.format = window
        ? SDL_GetGPUSwapchainTextureFormat(device, window)
        : SDL_GPU_TEXTUREFORMAT_B8G8R8A8_UNORM;
    ctd.blend_state.enable_blend = true;
    ctd.blend_state.src_color_blendfactor = SDL_GPU_BLENDFACTOR_SRC_ALPHA;
    ctd.blend_state.dst_color_blendfactor = SDL_GPU_BLENDFACTOR_ONE_MINUS_SRC_ALPHA;
    ctd.blend_state.color_blend_op = SDL_GPU_BLENDOP_ADD;
    ctd.blend_state.src_alpha_blendfactor = SDL_GPU_BLENDFACTOR_ONE;
    ctd.blend_state.dst_alpha_blendfactor = SDL_GPU_BLENDFACTOR_ZERO;
    ctd.blend_state.alpha_blend_op = SDL_GPU_BLENDOP_ADD;

    SDL_GPUGraphicsPipelineCreateInfo pci = {};
    pci.vertex_shader = vs; pci.fragment_shader = fs;
    pci.vertex_input_state = vis;
    pci.primitive_type = SDL_GPU_PRIMITIVETYPE_TRIANGLELIST;
    pci.rasterizer_state.fill_mode  = SDL_GPU_FILLMODE_FILL;
    pci.rasterizer_state.cull_mode  = SDL_GPU_CULLMODE_NONE;
    pci.rasterizer_state.front_face = SDL_GPU_FRONTFACE_COUNTER_CLOCKWISE;
    pci.depth_stencil_state.enable_depth_test  = false;
    pci.depth_stencil_state.enable_depth_write = false;
    pci.target_info.num_color_targets = 1;
    pci.target_info.color_target_descriptions = &ctd;
    pipeline_ = SDL_CreateGPUGraphicsPipeline(device, &pci);
    SDL_ReleaseGPUShader(device, vs);
    SDL_ReleaseGPUShader(device, fs);
    if (!pipeline_) { disabled_ = true; return; }

    SDL_GPUTextureCreateInfo tci = {};
    tci.type = SDL_GPU_TEXTURETYPE_2D;
    tci.format = SDL_GPU_TEXTUREFORMAT_R8G8B8A8_UNORM;
    tci.width = kW; tci.height = kH;
    tci.layer_count_or_depth = 1; tci.num_levels = 1;
    tci.usage = SDL_GPU_TEXTUREUSAGE_SAMPLER;
    tex_ = SDL_CreateGPUTexture(device, &tci);

    SDL_GPUTransferBufferCreateInfo tbci = {};
    tbci.usage = SDL_GPU_TRANSFERBUFFERUSAGE_UPLOAD;
    tbci.size  = kW * kH * 4;
    transfer_ = SDL_CreateGPUTransferBuffer(device, &tbci);

    SDL_GPUBufferCreateInfo bci = {};
    bci.usage = SDL_GPU_BUFFERUSAGE_VERTEX;
    bci.size  = 6u * 5u * static_cast<uint32_t>(sizeof(float));
    vtx_buf_ = SDL_CreateGPUBuffer(device, &bci);

    SDL_GPUSamplerCreateInfo sci = {};
    sci.min_filter     = SDL_GPU_FILTER_NEAREST;
    sci.mag_filter     = SDL_GPU_FILTER_NEAREST;
    sci.mipmap_mode    = SDL_GPU_SAMPLERMIPMAPMODE_NEAREST;
    sci.address_mode_u = SDL_GPU_SAMPLERADDRESSMODE_CLAMP_TO_EDGE;
    sci.address_mode_v = SDL_GPU_SAMPLERADDRESSMODE_CLAMP_TO_EDGE;
    sampler_ = SDL_CreateGPUSampler(device, &sci);

    surface_  = SDL_CreateSurface(kW, kH, SDL_PIXELFORMAT_RGBA32);
    renderer_ = surface_ ? SDL_CreateSoftwareRenderer(surface_) : nullptr;
    ready_ = tex_ && transfer_ && vtx_buf_ && sampler_ && surface_ && renderer_;
}

// ---------------------------------------------------------------------------
// Load a texture from inside a PK3 (zip) archive using stb_image
// ---------------------------------------------------------------------------

SDL_Texture* WorkflowQ3OverlayDrawStep::LoadTextureFromPk3(
        const std::string& pk3Path, const char* entry) {
    if (pk3Path.empty() || !renderer_) return nullptr;

    int zip_err = 0;
    zip_t* arc = zip_open(pk3Path.c_str(), ZIP_RDONLY, &zip_err);
    if (!arc) return nullptr;

    zip_stat_t st;
    if (zip_stat(arc, entry, 0, &st) != 0) { zip_close(arc); return nullptr; }

    std::vector<uint8_t> buf(st.size);
    zip_file_t* zf = zip_fopen(arc, entry, 0);
    if (!zf) { zip_close(arc); return nullptr; }
    zip_fread(zf, buf.data(), st.size);
    zip_fclose(zf);
    zip_close(arc);

    int w = 0, h = 0, ch = 0;
    unsigned char* px = stbi_load_from_memory(buf.data(),
        static_cast<int>(buf.size()), &w, &h, &ch, 4);
    if (!px) return nullptr;

    SDL_Surface* surf = SDL_CreateSurfaceFrom(
        w, h, SDL_PIXELFORMAT_RGBA32, px, w * 4);
    SDL_Texture* tex = surf ? SDL_CreateTextureFromSurface(renderer_, surf) : nullptr;
    if (surf) SDL_DestroySurface(surf);
    stbi_image_free(px);
    return tex;
}

// ---------------------------------------------------------------------------
// Lazy-load all menu textures from the same PK3 as the current BSP
// ---------------------------------------------------------------------------

void WorkflowQ3OverlayDrawStep::TryLoadMenuTextures(const std::string& pk3Path) {
    if (menu_tex_loaded_) return;
    menu_tex_loaded_ = true;   // set early so we don't retry on failure

    // HUD grid font (bigchars): 256×256, 16×16 cell grid
    bigchars_tex_  = LoadTextureFromPk3(pk3Path, "gfx/2d/bigchars.tga");

    // Proportional font used for all in-game menu text
    prop_font_tex_ = LoadTextureFromPk3(pk3Path, "menu/art/font1_prop.tga");

    // Panel background — cut_frame has the distinctive Q3 diagonal-cut corners
    frame_bg_tex_  = LoadTextureFromPk3(pk3Path, "menu/art/cut_frame.tga");

    // Left and right frame edge decorations
    frame_l_tex_   = LoadTextureFromPk3(pk3Path, "menu/art/frame1_l.tga");
    frame_r_tex_   = LoadTextureFromPk3(pk3Path, "menu/art/frame1_r.tga");

    // Selection highlight strip
    frame2_l_tex_  = LoadTextureFromPk3(pk3Path, "menu/art/frame2_l.tga");

    if (logger_) {
        logger_->Info(std::string("q3.overlay: menu textures — "
            "prop:") + (prop_font_tex_ ? "ok" : "MISSING") +
            " cut_frame:" + (frame_bg_tex_ ? "ok" : "MISSING") +
            " frame_l:" + (frame_l_tex_ ? "ok" : "MISSING") +
            " frame_r:" + (frame_r_tex_ ? "ok" : "MISSING") +
            " frame2_l:" + (frame2_l_tex_ ? "ok" : "MISSING") +
            " bigchars:" + (bigchars_tex_ ? "ok" : "MISSING"));
    }
}

// ---------------------------------------------------------------------------
// Q3 bitmap-font text renderer
// In bigchars.tga each ASCII character N occupies the cell:
//   col = N % 16,  row = N / 16   (16 columns × 16 rows, each cell 16×16 px)
// ---------------------------------------------------------------------------

void WorkflowQ3OverlayDrawStep::DrawQ3Text(
        float x, float y, const char* text, SDL_Color color, float scale) {
    if (!text || !renderer_) return;

    if (bigchars_tex_) {
        SDL_SetTextureColorMod(bigchars_tex_, color.r, color.g, color.b);
        SDL_SetTextureAlphaMod(bigchars_tex_, color.a);
        SDL_SetTextureBlendMode(bigchars_tex_, SDL_BLENDMODE_BLEND);

        const float cw = kGlyphSrc * scale;
        const float ch = kGlyphSrc * scale;
        float cx = x;
        for (const char* p = text; *p; ++p) {
            const int code = static_cast<unsigned char>(*p);
            SDL_FRect src  = { static_cast<float>((code % 16) * kGlyphSrc),
                               static_cast<float>((code / 16) * kGlyphSrc),
                               static_cast<float>(kGlyphSrc),
                               static_cast<float>(kGlyphSrc) };
            SDL_FRect dst  = { cx, y, cw, ch };
            SDL_RenderTexture(renderer_, bigchars_tex_, &src, &dst);
            cx += cw;
        }
    } else {
        // Fallback: built-in debug text
        SDL_SetRenderDrawColor(renderer_, color.r, color.g, color.b, color.a);
        SDL_RenderDebugText(renderer_, x, y, text);
    }
}

// ---------------------------------------------------------------------------
// Q3 proportional font renderer (font1_prop.tga)
// Source: ioquake3 code/q3_ui/ui_atoms.c  propMap[128][3] = {src_x, src_y, width}
// PROP_HEIGHT=27, PROP_GAP_WIDTH=3, PROP_SPACE_WIDTH=8
// ---------------------------------------------------------------------------

static const int kPropMap[128][3] = {
    {0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},
    {0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},
    {0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},
    {0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},{0,0,-1},
    // 32 space
    {0, 0, 8},
    // 33 !  34 "   35 #   36 $   37 %   38 &   39 '
    {11,122,7},{154,181,14},{55,122,17},{79,122,18},{101,122,23},{153,122,18},{9,93,7},
    // 40 (  41 )  42 *   43 +  44 ,  45 -   46 .  47 /
    {207,122,8},{230,122,9},{177,122,18},{30,152,18},{85,181,7},{34,93,11},{110,181,6},{130,152,14},
    // 48-57: 0-9
    {22,64,17},{41,64,12},{58,64,17},{78,64,18},{98,64,19},{120,64,18},{141,64,18},{204,64,16},{162,64,17},{182,64,18},
    // 58 :  59 ;  60 <   61 =   62 >   63 ?   64 @
    {59,181,7},{35,181,7},{203,152,14},{56,93,14},{228,152,14},{177,181,18},{28,122,22},
    // 65-90: A-Z
    {5,4,18},{27,4,18},{48,4,18},{69,4,17},{90,4,13},{106,4,13},{121,4,18},{143,4,17},
    {164,4,8},{175,4,16},{195,4,18},{216,4,12},{230,4,23},{6,34,18},{27,34,18},{48,34,18},
    {68,34,18},{90,34,17},{110,34,18},{130,34,14},{146,34,18},{166,34,19},{185,34,29},
    {215,34,18},{234,34,18},{5,64,14},
    // 91 [  92 \  93 ]  94 ^   95 _   96 `
    {60,152,7},{106,151,13},{83,152,7},{128,122,17},{4,152,21},{134,181,5},
    // 97-122: a-z (map to uppercase in prop font)
    {5,4,18},{27,4,18},{48,4,18},{69,4,17},{90,4,13},{106,4,13},{121,4,18},{143,4,17},
    {164,4,8},{175,4,16},{195,4,18},{216,4,12},{230,4,23},{6,34,18},{27,34,18},{48,34,18},
    {68,34,18},{90,34,17},{110,34,18},{130,34,14},{146,34,18},{166,34,19},{185,34,29},
    {215,34,18},{234,34,18},{5,64,14},
    // 123 {  124 |  125 }  126 ~  127 DEL
    {153,152,13},{11,181,5},{180,152,13},{79,93,17},{0,0,-1}
};

float WorkflowQ3OverlayDrawStep::PropStringWidth(const char* text) const {
    if (!text) return 0.f;
    float w = 0.f;
    for (const char* p = text; *p; ++p) {
        const int ch = static_cast<unsigned char>(*p) & 127;
        const int cw = kPropMap[ch][2];
        if (cw == -1) continue;
        w += static_cast<float>(cw == 8 ? 8 : cw + kPropGap);
    }
    return w - kPropGap;  // no trailing gap
}

void WorkflowQ3OverlayDrawStep::DrawPropText(
        float x, float y, const char* text, SDL_Color color, float scale, bool center) {
    if (!text || !renderer_) return;

    SDL_Texture* fnt = prop_font_tex_ ? prop_font_tex_ : nullptr;
    if (!fnt) {
        // Fallback to debug text if prop font failed to load
        SDL_SetRenderDrawColor(renderer_, color.r, color.g, color.b, color.a);
        SDL_RenderDebugText(renderer_, x, y, text);
        return;
    }

    if (center)
        x -= PropStringWidth(text) * scale * 0.5f;

    SDL_SetTextureColorMod(fnt, color.r, color.g, color.b);
    SDL_SetTextureAlphaMod(fnt, color.a);
    SDL_SetTextureBlendMode(fnt, SDL_BLENDMODE_BLEND);

    float cx = x;
    for (const char* p = text; *p; ++p) {
        const int ch  = static_cast<unsigned char>(*p) & 127;
        const int cw  = kPropMap[ch][2];
        if (cw == -1) continue;
        if (cw == kPropSpace) { cx += kPropSpace * scale; continue; }
        SDL_FRect src = { static_cast<float>(kPropMap[ch][0]),
                          static_cast<float>(kPropMap[ch][1]),
                          static_cast<float>(cw),
                          static_cast<float>(kPropHeight) };
        SDL_FRect dst = { cx, y, cw * scale, kPropHeight * scale };
        SDL_RenderTexture(renderer_, fnt, &src, &dst);
        cx += (cw + kPropGap) * scale;
    }
}

// ---------------------------------------------------------------------------
// Software-render the overlay surface each frame
// ---------------------------------------------------------------------------

void WorkflowQ3OverlayDrawStep::DrawSurface(
        WorkflowContext& context, uint32_t /*frameW*/, uint32_t /*frameH*/) {
    SDL_SetRenderDrawColor(renderer_, 0, 0, 0, 0);
    SDL_RenderClear(renderer_);
    SDL_SetRenderDrawBlendMode(renderer_, SDL_BLENDMODE_BLEND);

    // ---- HUD (always visible) ----------------------------------------
    const std::string weapon = context.Get<std::string>("q3.current_weapon", "weapon_machinegun");
    const int shots  = context.Get<int>("q3.shots_fired", 0);
    const int damage = context.Get<int>("q3.damage_done", 0);

    SDL_FRect hudBg{12, static_cast<float>(kH - 44), 230, 28};
    SDL_SetRenderDrawColor(renderer_, 0, 0, 0, 150);
    SDL_RenderFillRect(renderer_, &hudBg);

    const std::string weapName = weapon.size() > 7 ? weapon.substr(7) : weapon;
    const std::string hud = "WEAPON " + weapName +
        "   SHOTS " + std::to_string(shots) + "   DAMAGE " + std::to_string(damage);
    DrawQ3Text(20, static_cast<float>(kH - 36), hud.c_str(), {255, 216, 64, 255}, 0.5f);

    // Crosshair
    DrawQ3Text(static_cast<float>(kW / 2 - 4), static_cast<float>(kH / 2 - 4),
               "+", {255, 255, 255, 220}, 0.5f);

    const uint32_t frame = static_cast<uint32_t>(context.GetDouble("loop.iteration", 0.0));
    const bool flashing  = frame < context.Get<uint32_t>("q3.weapon_flash_until_frame", 0u);
    const bool hitMarker = frame < context.Get<uint32_t>("q3.hit_marker_until_frame", 0u);

    // Gun silhouette
    SDL_SetRenderDrawColor(renderer_, 34, 34, 38, 235);
    SDL_FRect gunBody{410, 278, 168, 46}; SDL_RenderFillRect(renderer_, &gunBody);
    SDL_SetRenderDrawColor(renderer_, 92, 96, 110, 255);
    SDL_RenderRect(renderer_, &gunBody);
    SDL_SetRenderDrawColor(renderer_, 20, 20, 22, 255);
    SDL_FRect grip{452, 318, 36, 30}; SDL_RenderFillRect(renderer_, &grip);
    SDL_FRect barrel{568, 291, 54, 18}; SDL_RenderFillRect(renderer_, &barrel);
    SDL_SetRenderDrawColor(renderer_, 255, 210, 70, 255);
    SDL_RenderLine(renderer_, 424, 290, 550, 290);
    DrawQ3Text(430, 300, weapName.c_str(), {220, 235, 255, 255}, 0.5f);
    if (flashing) {
        SDL_SetRenderDrawColor(renderer_, 255, 190, 50, 230);
        SDL_FRect flash{616, 284, 18, 32}; SDL_RenderFillRect(renderer_, &flash);
        SDL_RenderLine(renderer_, 615, 300, 638, 276);
        SDL_RenderLine(renderer_, 615, 300, 638, 324);
    }
    if (hitMarker) {
        SDL_SetRenderDrawColor(renderer_, 255, 80, 55, 255);
        SDL_RenderLine(renderer_, 308, 172, 320, 160); SDL_RenderLine(renderer_, 332, 172, 320, 160);
        SDL_RenderLine(renderer_, 308, 188, 320, 200); SDL_RenderLine(renderer_, 332, 188, 320, 200);
        DrawQ3Text(300, 204, "HIT", {255, 92, 64, 255}, 0.5f);
    }

    // ---- In-game menu (ioquake3 style, centered) -------------------------
    if (context.GetBool("q3.menu_open", false)) {
        const auto bspCfg = context.Get<nlohmann::json>("bsp_config", nlohmann::json{});
        const std::string pk3 = bspCfg.value("pk3_path", std::string(""));
        if (!menu_tex_loaded_ && !pk3.empty())
            TryLoadMenuTextures(pk3);

        // Full-screen dark tint — same as Q3's colour 0 0 0 0.75
        SDL_SetRenderDrawColor(renderer_, 0, 0, 0, 192);
        SDL_FRect tint{0, 0, static_cast<float>(kW), static_cast<float>(kH)};
        SDL_RenderFillRect(renderer_, &tint);

        // ---- Panel geometry (matches Q3 virtual 640×480 scaled to 640×360) ----
        // Q3 in-game menu: cut_frame panel ~356×256 centred around x=320,y=240
        // We scale y: 256*(360/480)=192 → round to 220 for comfort
        constexpr float PW  = 340.f;
        constexpr float PH  = 260.f;
        constexpr float PX  = (kW - PW) / 2.f;   // centred horizontally
        constexpr float PY  = (kH - PH) / 2.f;   // centred vertically
        constexpr float DEC = 48.f;               // width of frame1_l / frame1_r decorations

        // Panel background: cut_frame.tga (semi-transparent RGBA TGA)
        if (frame_bg_tex_) {
            SDL_FRect dst{PX, PY, PW, PH};
            SDL_SetTextureAlphaMod(frame_bg_tex_, 245);
            SDL_RenderTexture(renderer_, frame_bg_tex_, nullptr, &dst);
        } else {
            SDL_SetRenderDrawColor(renderer_, 16, 12, 8, 230);
            SDL_FRect fb{PX, PY, PW, PH}; SDL_RenderFillRect(renderer_, &fb);
        }

        // Left decoration strip (frame1_l)
        if (frame_l_tex_) {
            SDL_FRect dst{PX - DEC, PY, DEC, PH};
            SDL_RenderTexture(renderer_, frame_l_tex_, nullptr, &dst);
        }
        // Right decoration strip (frame1_r)
        if (frame_r_tex_) {
            SDL_FRect dst{PX + PW, PY, DEC, PH};
            SDL_RenderTexture(renderer_, frame_r_tex_, nullptr, &dst);
        }

        // Title — prop font, large (scale 0.9), orange-yellow, centred
        const std::string title = context.Get<std::string>("q3.menu_title", "QUAKE III ARENA");
        constexpr float kTitleScale = 0.9f;
        const float titleY = PY + 14.f;
        DrawPropText(PX + PW * 0.5f, titleY, title.c_str(), {255, 210, 0, 255},
                     kTitleScale, /*center=*/true);

        // Separator line below title
        SDL_SetRenderDrawColor(renderer_, 200, 120, 20, 200);
        const float sepY = titleY + kPropHeight * kTitleScale + 4.f;
        SDL_RenderLine(renderer_,
            static_cast<int>(PX + 12), static_cast<int>(sepY),
            static_cast<int>(PX + PW - 12), static_cast<int>(sepY));

        // ---- Menu items --------------------------------------------------
        const auto items = context.Get<nlohmann::json>("q3.menu_items", nlohmann::json::array());
        const int sel = context.Get<int>("q3.menu_selected_item", 0);
        const int numItems = static_cast<int>(items.size());

        constexpr float kItemScale  = 0.75f;   // Q3 PROP_SMALL_SIZE_SCALE
        constexpr float kItemStep   = static_cast<float>(kPropHeight) * kItemScale + 6.f;
        const float     itemsTop    = sepY + 10.f;
        constexpr int   kVisible    = 10;
        const int       page        = sel / kVisible;

        for (int i = 0; i < kVisible; ++i) {
            const int idx = page * kVisible + i;
            if (idx >= numItems) break;
            const std::string label = items[idx].value("label", "");
            const float iy = itemsTop + i * kItemStep;

            if (idx == sel) {
                // Selection highlight: frame2_l.tga stretched as a strip, or fallback rect
                if (frame2_l_tex_) {
                    SDL_FRect gdst{PX + 8.f, iy - 2.f, PW - 16.f, kPropHeight * kItemScale + 4.f};
                    SDL_SetTextureAlphaMod(frame2_l_tex_, 180);
                    SDL_RenderTexture(renderer_, frame2_l_tex_, nullptr, &gdst);
                } else {
                    SDL_SetRenderDrawColor(renderer_, 80, 55, 10, 140);
                    SDL_FRect hi{PX + 8.f, iy - 2.f, PW - 16.f, kPropHeight * kItemScale + 4.f};
                    SDL_RenderFillRect(renderer_, &hi);
                }
                // Selected: bright orange-white, centred
                DrawPropText(PX + PW * 0.5f, iy, label.c_str(),
                             {255, 210, 60, 255}, kItemScale, /*center=*/true);
            } else {
                // Unselected: muted olive-green, centred
                DrawPropText(PX + PW * 0.5f, iy, label.c_str(),
                             {160, 160, 100, 200}, kItemScale, /*center=*/true);
            }
        }

        // Bottom divider + current map name
        const float botY = PY + PH - 24.f;
        SDL_SetRenderDrawColor(renderer_, 200, 120, 20, 120);
        SDL_RenderLine(renderer_,
            static_cast<int>(PX + 12), static_cast<int>(botY),
            static_cast<int>(PX + PW - 12), static_cast<int>(botY));

        const std::string curMap = bspCfg.value("map_name", std::string(""));
        if (!curMap.empty()) {
            DrawPropText(PX + PW * 0.5f, botY + 4.f, curMap.c_str(),
                         {120, 200, 120, 200}, 0.55f, /*center=*/true);
        }
    }

    SDL_RenderPresent(renderer_);

    // ---- Screenshot (CPU path: surface is already in RAM) --------------------
    const auto* ssPath = context.TryGet<std::string>("screenshot_output_path");
    if (ssPath && !ssPath->empty() && surface_) {
        if (SDL_SaveBMP(surface_, ssPath->c_str()) == true) {
            if (logger_) logger_->Info("q3.overlay: screenshot saved to " + *ssPath);
            context.Set<bool>("screenshot_saved", true);
        } else {
            if (logger_) logger_->Warn("q3.overlay: SDL_SaveBMP failed for " + *ssPath);
            context.Set<bool>("screenshot_saved", false);
        }
        // Clear the path so we only save once
        context.Set<std::string>("screenshot_output_path", std::string(""));
    }
}

// ---------------------------------------------------------------------------
// Upload surface → GPU texture → full-screen quad
// ---------------------------------------------------------------------------

void WorkflowQ3OverlayDrawStep::Render(
        SDL_GPUCommandBuffer* cmd, SDL_GPUTexture* swapchainTex,
        SDL_GPUDevice* device, uint32_t /*frameW*/, uint32_t /*frameH*/) {
    void* mapped = SDL_MapGPUTransferBuffer(device, transfer_, false);
    if (!mapped) return;
    std::memcpy(mapped, surface_->pixels, kW * kH * 4);
    SDL_UnmapGPUTransferBuffer(device, transfer_);

    auto* copy = SDL_BeginGPUCopyPass(cmd);
    if (copy) {
        SDL_GPUTextureTransferInfo src = {};
        src.transfer_buffer = transfer_;
        src.pixels_per_row  = kW;
        src.rows_per_layer  = kH;
        SDL_GPUTextureRegion dst = {};
        dst.texture = tex_; dst.w = kW; dst.h = kH; dst.d = 1;
        SDL_UploadToGPUTexture(copy, &src, &dst, false);
        SDL_EndGPUCopyPass(copy);
    }

    if (!vbuf_uploaded_) {
        const float verts[6][5] = {
            {-1, 1,0,0,0},{1,1,0,1,0},{1,-1,0,1,1},
            {-1,1,0,0,0},{1,-1,0,1,1},{-1,-1,0,0,1},
        };
        const uint32_t sz = sizeof(verts);
        SDL_GPUTransferBufferCreateInfo tb = {};
        tb.usage = SDL_GPU_TRANSFERBUFFERUSAGE_UPLOAD; tb.size = sz;
        auto* tmp = SDL_CreateGPUTransferBuffer(device, &tb);
        if (tmp) {
            void* ptr = SDL_MapGPUTransferBuffer(device, tmp, false);
            if (ptr) { std::memcpy(ptr, verts, sz); SDL_UnmapGPUTransferBuffer(device, tmp); }
            auto* cp = SDL_BeginGPUCopyPass(cmd);
            if (cp) {
                SDL_GPUTransferBufferLocation s = {tmp, 0};
                SDL_GPUBufferRegion d = {vtx_buf_, 0, sz};
                SDL_UploadToGPUBuffer(cp, &s, &d, false);
                SDL_EndGPUCopyPass(cp);
            }
            SDL_ReleaseGPUTransferBuffer(device, tmp);
        }
        vbuf_uploaded_ = true;
    }

    SDL_GPUColorTargetInfo target = {};
    target.texture  = swapchainTex;
    target.load_op  = SDL_GPU_LOADOP_LOAD;
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

// ---------------------------------------------------------------------------

void WorkflowQ3OverlayDrawStep::Execute(
        const WorkflowStepDefinition& step, WorkflowContext& context) {
    if (context.GetBool("frame_skip", false)) return;
    auto* cmd       = context.Get<SDL_GPUCommandBuffer*>("gpu_command_buffer", nullptr);
    auto* swapchain = context.Get<SDL_GPUTexture*>("gpu_swapchain_texture", nullptr);
    auto* device    = context.Get<SDL_GPUDevice*>("gpu_device", nullptr);
    if (!cmd || !swapchain || !device) return;
    if (!ready_) TryInit(device, context.Get<SDL_Window*>("sdl_window", nullptr));
    if (!ready_) return;
    const auto fw = context.Get<uint32_t>("frame_width",  1280u);
    const auto fh = context.Get<uint32_t>("frame_height", 960u);
    DrawSurface(context, fw, fh);
    Render(cmd, swapchain, device, fw, fh);
}

}  // namespace sdl3cpp::services::impl
