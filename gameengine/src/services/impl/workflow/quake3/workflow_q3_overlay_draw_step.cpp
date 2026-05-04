#include "services/interfaces/workflow/quake3/workflow_q3_overlay_draw_step.hpp"

#include <SDL3/SDL.h>
#include <nlohmann/json.hpp>
#include <stb_image.h>
#include <zip.h>

#include <algorithm>
#include <cctype>
#include <cstring>
#include <fstream>
#include <sstream>
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
        if (bigchars_tex_)    SDL_DestroyTexture(bigchars_tex_);
        if (prop_font_tex_)   SDL_DestroyTexture(prop_font_tex_);
        if (prop_glo_tex_)    SDL_DestroyTexture(prop_glo_tex_);
        if (frame_bg_tex_)    SDL_DestroyTexture(frame_bg_tex_);
        if (frame_l_tex_)     SDL_DestroyTexture(frame_l_tex_);
        if (frame_r_tex_)     SDL_DestroyTexture(frame_r_tex_);
        if (frame2_l_tex_)    SDL_DestroyTexture(frame2_l_tex_);
        for (auto* t : num_digits_) if (t) SDL_DestroyTexture(t);
        if (icon_armor_tex_)  SDL_DestroyTexture(icon_armor_tex_);
        if (icon_health_tex_) SDL_DestroyTexture(icon_health_tex_);
        if (icon_face_tex_)   SDL_DestroyTexture(icon_face_tex_);
        if (icon_ammo_tex_)   SDL_DestroyTexture(icon_ammo_tex_);
        if (icon_crosshair_)  SDL_DestroyTexture(icon_crosshair_);
        if (btn_back_tex_)    SDL_DestroyTexture(btn_back_tex_);
        if (btn_fight_tex_)   SDL_DestroyTexture(btn_fight_tex_);
        if (btn_skirmish_tex_)SDL_DestroyTexture(btn_skirmish_tex_);
        if (btn_arrow_l_tex_) SDL_DestroyTexture(btn_arrow_l_tex_);
        if (btn_arrow_r_tex_) SDL_DestroyTexture(btn_arrow_r_tex_);
        for (auto& [k, v] : levelshot_cache_) if (v) SDL_DestroyTexture(v);
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
    menu_tex_loaded_ = true;  // set early so we don't retry on failure

    bigchars_tex_  = LoadTextureFromPk3(pk3Path, "gfx/2d/bigchars.tga");
    prop_font_tex_ = LoadTextureFromPk3(pk3Path, "menu/art/font1_prop.tga");
    prop_glo_tex_  = LoadTextureFromPk3(pk3Path, "menu/art/font1_prop_glo.tga");
    frame_bg_tex_  = LoadTextureFromPk3(pk3Path, "menu/art/cut_frame.tga");
    frame_l_tex_   = LoadTextureFromPk3(pk3Path, "menu/art/frame1_l.tga");
    frame_r_tex_   = LoadTextureFromPk3(pk3Path, "menu/art/frame1_r.tga");
    frame2_l_tex_  = LoadTextureFromPk3(pk3Path, "menu/art/frame2_l.tga");

    // HUD large-number sprites (gfx/2d/numbers/*_32b.tga, each 32x32)
    static const char* kDigitNames[11] = {
        "gfx/2d/numbers/zero_32b.tga",  "gfx/2d/numbers/one_32b.tga",
        "gfx/2d/numbers/two_32b.tga",   "gfx/2d/numbers/three_32b.tga",
        "gfx/2d/numbers/four_32b.tga",  "gfx/2d/numbers/five_32b.tga",
        "gfx/2d/numbers/six_32b.tga",   "gfx/2d/numbers/seven_32b.tga",
        "gfx/2d/numbers/eight_32b.tga", "gfx/2d/numbers/nine_32b.tga",
        "gfx/2d/numbers/minus_32b.tga"
    };
    for (int i = 0; i < 11; ++i)
        num_digits_[i] = LoadTextureFromPk3(pk3Path, kDigitNames[i]);

    // HUD icon sprites
    icon_armor_tex_  = LoadTextureFromPk3(pk3Path, "icons/iconr_yellow.tga");
    icon_health_tex_ = LoadTextureFromPk3(pk3Path, "icons/iconh_red.tga");
    icon_face_tex_   = LoadTextureFromPk3(pk3Path, "models/players/keel/icon_default.tga");
    icon_ammo_tex_   = LoadTextureFromPk3(pk3Path, "icons/icona_machinegun.tga");
    icon_crosshair_  = LoadTextureFromPk3(pk3Path, "gfx/2d/crosshaira.tga");

    // Map-select buttons and nav arrows
    btn_back_tex_     = LoadTextureFromPk3(pk3Path, "menu/art/back_0.tga");
    btn_fight_tex_    = LoadTextureFromPk3(pk3Path, "menu/art/fight_0.tga");
    btn_skirmish_tex_ = LoadTextureFromPk3(pk3Path, "menu/art/skirmish_0.tga");
    btn_arrow_l_tex_  = LoadTextureFromPk3(pk3Path, "menu/art/gs_arrows_l.tga");
    btn_arrow_r_tex_  = LoadTextureFromPk3(pk3Path, "menu/art/gs_arrows_r.tga");

    ParseArenas(pk3Path);

    if (logger_) {
        logger_->Info(std::string("q3.overlay: textures loaded — "
            "nums:") + (num_digits_[0] ? "ok" : "MISS") +
            " armor:" + (icon_armor_tex_ ? "ok" : "MISS") +
            " face:"  + (icon_face_tex_  ? "ok" : "MISS") +
            " fight:" + (btn_fight_tex_  ? "ok" : "MISS") +
            " arenas:" + std::to_string(arena_data_.size()));
    }
}

// ---------------------------------------------------------------------------
// Parse scripts/arenas.txt from the PK3 for map long-names and bot opponents
// ---------------------------------------------------------------------------

void WorkflowQ3OverlayDrawStep::ParseArenas(const std::string& pk3Path) {
    if (arena_data_loaded_) return;
    arena_data_loaded_ = true;

    int err = 0;
    zip_t* arc = zip_open(pk3Path.c_str(), ZIP_RDONLY, &err);
    if (!arc) return;

    zip_stat_t st;
    if (zip_stat(arc, "scripts/arenas.txt", 0, &st) != 0) { zip_close(arc); return; }
    std::vector<char> buf(st.size + 1, '\0');
    zip_file_t* zf = zip_fopen(arc, "scripts/arenas.txt", 0);
    if (zf) { zip_fread(zf, buf.data(), st.size); zip_fclose(zf); }
    zip_close(arc);

    // Simple tokenizer: split on '{' '}' and parse key/value pairs
    std::string text(buf.data());
    size_t pos = 0;
    while ((pos = text.find('{', pos)) != std::string::npos) {
        size_t end = text.find('}', pos);
        if (end == std::string::npos) break;
        std::string block = text.substr(pos + 1, end - pos - 1);
        pos = end + 1;

        // Extract key-value pairs (Q3 config format: key "value")
        std::string mapName, longName, bots;
        std::istringstream ss(block);
        std::string tok;
        while (ss >> tok) {
            auto readVal = [&]() -> std::string {
                std::string val;
                ss >> std::ws;
                if (ss.peek() == '"') {
                    ss.get();
                    std::getline(ss, val, '"');
                } else { ss >> val; }
                return val;
            };
            if (tok == "map")      mapName  = readVal();
            else if (tok == "longname") longName = readVal();
            else if (tok == "bots")     bots     = readVal();
        }
        if (!mapName.empty()) {
            // Store under lowercase key
            std::string key = mapName;
            std::transform(key.begin(), key.end(), key.begin(), ::tolower);
            // First bot only
            std::string firstBot = bots.substr(0, bots.find(' '));
            arena_data_[key] = { longName, firstBot };
        }
    }
}

// ---------------------------------------------------------------------------
// Load or retrieve a cached levelshot texture for a map name
// ---------------------------------------------------------------------------

SDL_Texture* WorkflowQ3OverlayDrawStep::LoadOrGetLevelshot(
        const std::string& mapName, const std::string& pk3Path) {
    // Levelshot paths use uppercase names (e.g. levelshots/Q3DM7.jpg)
    std::string key = mapName;
    std::transform(key.begin(), key.end(), key.begin(), ::toupper);

    auto it = levelshot_cache_.find(key);
    if (it != levelshot_cache_.end()) return it->second;

    // Try uppercase then lowercase
    std::string upperPath = "levelshots/" + key + ".jpg";
    std::string lowerPath = "levelshots/" + mapName + ".jpg";
    SDL_Texture* tex = LoadTextureFromPk3(pk3Path, upperPath.c_str());
    if (!tex) tex = LoadTextureFromPk3(pk3Path, lowerPath.c_str());
    levelshot_cache_[key] = tex;
    return tex;
}

// ---------------------------------------------------------------------------
// Draw an integer using the number sprites; returns x position after last digit
// ---------------------------------------------------------------------------

float WorkflowQ3OverlayDrawStep::DrawHudNumber(
        float x, float y, int value, float scale) {
    if (!renderer_) return x;
    // Convert to string; use minus sprite for negative values
    std::string s;
    if (value < 0) { s = "-"; s += std::to_string(-value); }
    else           { s = std::to_string(value); }

    const float dw = 32.f * scale;
    float cx = x;
    for (char c : s) {
        int idx = (c == '-') ? 10 : (c - '0');
        if (idx < 0 || idx > 10) { cx += dw; continue; }
        if (SDL_Texture* t = num_digits_[idx]) {
            SDL_SetTextureColorMod(t, 255, 220, 60);  // Q3A gold tint
            SDL_SetTextureAlphaMod(t, 255);
            SDL_SetTextureBlendMode(t, SDL_BLENDMODE_BLEND);
            SDL_FRect dst{cx, y, dw, dw};
            SDL_RenderTexture(renderer_, t, nullptr, &dst);
        }
        cx += dw;
    }
    return cx;
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
// Q3A "Choose Level" / map-select screen
// ---------------------------------------------------------------------------

void WorkflowQ3OverlayDrawStep::DrawMapSelectScreen(
        WorkflowContext& context, const std::string& pk3Path) {
    constexpr float kCX = kW * 0.5f;

    // ── "CHOOSE LEVEL" title ─────────────────────────────────────────────
    // Q3A uses bigchars font at large scale for this heading.
    DrawQ3Text(kCX - 96.f, 12.f, "CHOOSE LEVEL", {200, 50, 20, 255}, 1.0f);

    // ── Determine which map is selected and load its levelshot ───────────
    const auto maps  = context.Get<nlohmann::json>("q3.maps", nlohmann::json::array({"q3dm7"}));
    const int  sel   = context.Get<int>("q3.menu_selected_item", 0);
    const int  nMaps = static_cast<int>(maps.size());
    const int  idx   = (nMaps > 0) ? std::max(0, std::min(sel, nMaps-1)) : 0;

    std::string mapName;
    if (nMaps > 0) mapName = maps[(size_t)idx].get<std::string>();

    // Levelshot image — centred, bordered in Q3A orange-red
    constexpr float kLW = 162.f, kLH = 162.f;
    constexpr float kLX = (kW - kLW) * 0.5f;
    constexpr float kLY = 58.f;

    SDL_Texture* shot = (!mapName.empty() && !pk3Path.empty())
        ? LoadOrGetLevelshot(mapName, pk3Path) : nullptr;

    if (shot) {
        SDL_FRect dst{kLX, kLY, kLW, kLH};
        SDL_SetTextureAlphaMod(shot, 255);
        SDL_SetTextureColorMod(shot, 255, 255, 255);
        SDL_SetTextureBlendMode(shot, SDL_BLENDMODE_NONE);
        SDL_RenderTexture(renderer_, shot, nullptr, &dst);
    } else {
        SDL_SetRenderDrawColor(renderer_, 30, 20, 15, 255);
        SDL_FRect fbk{kLX, kLY, kLW, kLH};
        SDL_RenderFillRect(renderer_, &fbk);
    }
    // Red border
    SDL_SetRenderDrawColor(renderer_, 180, 50, 20, 255);
    SDL_FRect border{kLX - 2.f, kLY - 2.f, kLW + 4.f, kLH + 4.f};
    SDL_RenderRect(renderer_, &border);

    // Map name label under image (e.g. "Q3DM7")
    std::string mapUpper = mapName;
    std::transform(mapUpper.begin(), mapUpper.end(), mapUpper.begin(), ::toupper);
    DrawPropText(kCX, kLY + kLH + 6.f, mapUpper.c_str(), {255, 200, 50, 255}, 0.7f, true);

    // Long name from arenas.txt (e.g. "TEMPLE OF RETRIBUTION")
    std::string mapKey = mapName;
    std::transform(mapKey.begin(), mapKey.end(), mapKey.begin(), ::tolower);
    auto aIt = arena_data_.find(mapKey);
    if (aIt != arena_data_.end() && !aIt->second.longname.empty()) {
        std::string longUpper = mapUpper + ": " + aIt->second.longname;
        std::transform(longUpper.begin(), longUpper.end(), longUpper.begin(), ::toupper);
        DrawPropText(kCX, kLY + kLH + 34.f, longUpper.c_str(), {200, 130, 40, 255}, 0.75f, true);
    }

    // ── Opponent bot icon + name ─────────────────────────────────────────
    float botY = kLY + kLH + 76.f;
    if (aIt != arena_data_.end() && !aIt->second.bot.empty()) {
        const std::string botName = aIt->second.bot;
        std::string botKey = botName;
        std::transform(botKey.begin(), botKey.end(), botKey.begin(), ::tolower);
        const std::string iconPath = "models/players/" + botKey + "/icon_default.tga";
        SDL_Texture* botIcon = LoadOrGetLevelshot("bot_" + botKey, pk3Path);
        if (!botIcon) {
            // Try loading from pk3 directly (not a levelshot — use raw loader)
            botIcon = LoadTextureFromPk3(pk3Path, iconPath.c_str());
            if (botIcon) levelshot_cache_["bot_" + botKey] = botIcon;
        }
        if (botIcon) {
            SDL_FRect dst{kCX - 22.f, botY, 44.f, 44.f};
            SDL_SetTextureAlphaMod(botIcon, 255);
            SDL_SetTextureColorMod(botIcon, 255, 255, 255);
            SDL_SetTextureBlendMode(botIcon, SDL_BLENDMODE_BLEND);
            SDL_RenderTexture(renderer_, botIcon, nullptr, &dst);
        }
        std::string botUpper = botName;
        std::transform(botUpper.begin(), botUpper.end(), botUpper.begin(), ::toupper);
        DrawPropText(kCX, botY + 48.f, botUpper.c_str(), {180, 130, 50, 220}, 0.65f, true);
        botY += 80.f;
    }

    // ── Navigation arrows (left / right) ─────────────────────────────────
    constexpr float kArrowY = kLY + kLH * 0.5f - 16.f;
    if (btn_arrow_l_tex_ && idx > 0) {
        SDL_FRect dst{8.f, kArrowY, 64.f, 32.f};
        SDL_RenderTexture(renderer_, btn_arrow_l_tex_, nullptr, &dst);
    }
    if (btn_arrow_r_tex_ && idx < nMaps - 1) {
        SDL_FRect dst{kW - 72.f, kArrowY, 64.f, 32.f};
        SDL_RenderTexture(renderer_, btn_arrow_r_tex_, nullptr, &dst);
    }

    // ── Bottom buttons: BACK  SKIRMISH  FIGHT ────────────────────────────
    constexpr float kBtnY = static_cast<float>(kH) - 52.f;
    constexpr float kBtnW = 128.f, kBtnH = 46.f;
    auto drawBtn = [&](SDL_Texture* t, float x) {
        if (!t) return;
        SDL_SetTextureAlphaMod(t, 255);
        SDL_SetTextureColorMod(t, 255, 255, 255);
        SDL_SetTextureBlendMode(t, SDL_BLENDMODE_BLEND);
        SDL_FRect dst{x, kBtnY, kBtnW, kBtnH};
        SDL_RenderTexture(renderer_, t, nullptr, &dst);
    };
    drawBtn(btn_back_tex_,     kW * 0.12f - kBtnW * 0.5f);
    drawBtn(btn_skirmish_tex_, kW * 0.50f - kBtnW * 0.5f);
    drawBtn(btn_fight_tex_,    kW * 0.88f - kBtnW * 0.5f);
}

// ---------------------------------------------------------------------------
// Software-render the overlay surface each frame
// ---------------------------------------------------------------------------

void WorkflowQ3OverlayDrawStep::DrawSurface(
        WorkflowContext& context, uint32_t /*frameW*/, uint32_t /*frameH*/) {
    SDL_SetRenderDrawColor(renderer_, 0, 0, 0, 0);
    SDL_RenderClear(renderer_);
    SDL_SetRenderDrawBlendMode(renderer_, SDL_BLENDMODE_BLEND);

    // ---- HUD (always visible unless menu is open) -----------------------
    const bool menuOpen = context.GetBool("q3.menu_open", false);

    if (!menuOpen) {
        const auto bspCfg2 = context.Get<nlohmann::json>("bsp_config", nlohmann::json{});
        const std::string pk3hud = bspCfg2.value("pk3_path", std::string(""));
        if (!menu_tex_loaded_ && !pk3hud.empty()) TryLoadMenuTextures(pk3hud);

        const int health = context.Get<int>("q3.player_health", 100);
        const int armor  = context.Get<int>("q3.player_armor",  0);
        const int ammo   = context.Get<int>("q3.player_ammo",   50);

        // ── Large number HUD — bottom-left (matches Q3A layout) ────────────
        // Scale 1.75 → each digit 56×56 px.  Bottom edge at kH-6.
        constexpr float kNS   = 1.75f;        // number sprite scale
        constexpr float kNH   = 32.f * kNS;   // digit height = 56 px
        constexpr float kHudY = kH - kNH - 6.f;
        constexpr float kIS   = 1.25f;        // icon scale: 32×1.25 = 40 px

        // Armor value (left)
        float cx = 10.f;
        cx = DrawHudNumber(cx, kHudY, armor, kNS);
        // Armor icon immediately after digits
        if (icon_armor_tex_) {
            SDL_SetTextureAlphaMod(icon_armor_tex_, 255);
            SDL_SetTextureColorMod(icon_armor_tex_, 255, 255, 255);
            SDL_SetTextureBlendMode(icon_armor_tex_, SDL_BLENDMODE_BLEND);
            SDL_FRect dst{cx + 4.f, kHudY + (kNH - 32.f*kIS)*0.5f, 32.f*kIS, 32.f*kIS};
            SDL_RenderTexture(renderer_, icon_armor_tex_, nullptr, &dst);
        }
        cx += 4.f + 32.f*kIS + 14.f;

        // Health value
        cx = DrawHudNumber(cx, kHudY, health, kNS);
        // Face icon after health digits
        if (icon_face_tex_) {
            SDL_SetTextureAlphaMod(icon_face_tex_, 255);
            SDL_SetTextureColorMod(icon_face_tex_, 255, 255, 255);
            SDL_SetTextureBlendMode(icon_face_tex_, SDL_BLENDMODE_BLEND);
            SDL_FRect dst{cx + 4.f, kHudY, kNH, kNH};  // face is 64×64 → scaled to digit height
            SDL_RenderTexture(renderer_, icon_face_tex_, nullptr, &dst);
        }

        // ── Ammo / weapon — bottom-right ────────────────────────────────────
        // Show ammo icon + ammo count right-aligned at kW-10
        const float ammoNumW = (ammo >= 100 ? 3 : ammo >= 10 ? 2 : 1) * 32.f * kNS;
        const float ammoIconW = icon_ammo_tex_ ? 32.f * kIS : 0.f;
        const float ammoX = kW - 10.f - ammoNumW - ammoIconW - 8.f;
        if (icon_ammo_tex_) {
            SDL_SetTextureAlphaMod(icon_ammo_tex_, 255);
            SDL_SetTextureColorMod(icon_ammo_tex_, 255, 255, 255);
            SDL_SetTextureBlendMode(icon_ammo_tex_, SDL_BLENDMODE_BLEND);
            SDL_FRect dst{ammoX, kHudY + (kNH - 32.f*kIS)*0.5f, 32.f*kIS, 32.f*kIS};
            SDL_RenderTexture(renderer_, icon_ammo_tex_, nullptr, &dst);
        }
        DrawHudNumber(ammoX + ammoIconW + 6.f, kHudY, ammo, kNS);

        // ── Crosshair ────────────────────────────────────────────────────────
        constexpr float kCHSize = 24.f;
        const float chx = (kW - kCHSize) * 0.5f;
        const float chy = (kH - kCHSize) * 0.5f;
        if (icon_crosshair_) {
            SDL_SetTextureAlphaMod(icon_crosshair_, 200);
            SDL_SetTextureColorMod(icon_crosshair_, 255, 255, 255);
            SDL_SetTextureBlendMode(icon_crosshair_, SDL_BLENDMODE_BLEND);
            SDL_FRect dst{chx, chy, kCHSize, kCHSize};
            SDL_RenderTexture(renderer_, icon_crosshair_, nullptr, &dst);
        } else {
            // Fallback dot crosshair
            SDL_SetRenderDrawColor(renderer_, 255, 255, 255, 200);
            SDL_FRect dot{(kW - 4.f) * 0.5f, (kH - 4.f) * 0.5f, 4.f, 4.f};
            SDL_RenderFillRect(renderer_, &dot);
        }

        // ── Hit marker ───────────────────────────────────────────────────────
        const uint32_t frame2 = static_cast<uint32_t>(context.GetDouble("loop.iteration", 0.0));
        if (frame2 < context.Get<uint32_t>("q3.hit_marker_until_frame", 0u)) {
            SDL_SetRenderDrawColor(renderer_, 255, 80, 55, 255);
            SDL_RenderLine(renderer_, 308, 172, 320, 160);
            SDL_RenderLine(renderer_, 332, 172, 320, 160);
            SDL_RenderLine(renderer_, 308, 188, 320, 200);
            SDL_RenderLine(renderer_, 332, 188, 320, 200);
        }

        // ── Muzzle flash ─────────────────────────────────────────────────────
        const uint32_t frame3 = static_cast<uint32_t>(context.GetDouble("loop.iteration", 0.0));
        if (frame3 < context.Get<uint32_t>("q3.weapon_flash_until_frame", 0u)) {
            SDL_SetRenderDrawColor(renderer_, 255, 200, 60, 180);
            SDL_FRect flash{kW - 40.f, kH * 0.58f, 24.f, 40.f};
            SDL_RenderFillRect(renderer_, &flash);
        }
    }

    // ---- Menu screens (full-screen overlays) --------------------------------
    if (menuOpen) {
        const auto bspCfg = context.Get<nlohmann::json>("bsp_config", nlohmann::json{});
        const std::string pk3 = bspCfg.value("pk3_path", std::string(""));
        if (!menu_tex_loaded_ && !pk3.empty()) TryLoadMenuTextures(pk3);

        const std::string screen = context.Get<std::string>("q3.menu_screen", "main");

        // Black background for all menu screens
        SDL_SetRenderDrawColor(renderer_, 0, 0, 0, 255);
        SDL_FRect bg{0, 0, static_cast<float>(kW), static_cast<float>(kH)};
        SDL_RenderFillRect(renderer_, &bg);

        if (screen == "map_select") {
            DrawMapSelectScreen(context, pk3);
        } else {
            // ── Q3A main menu (ring + title + item list) ──────────────────
            constexpr float kRingY = 120.f, kRingH = 185.f, kHalf = kW * 0.5f;
            if (frame_l_tex_) {
                SDL_SetTextureAlphaMod(frame_l_tex_, 255);
                SDL_FRect d{0.f, kRingY, kHalf, kRingH};
                SDL_RenderTexture(renderer_, frame_l_tex_, nullptr, &d);
            }
            if (frame_r_tex_) {
                SDL_SetTextureAlphaMod(frame_r_tex_, 255);
                SDL_FRect d{kHalf, kRingY, kHalf, kRingH};
                SDL_RenderTexture(renderer_, frame_r_tex_, nullptr, &d);
            }

            constexpr float kCX = kW * 0.5f;
            constexpr float kTY = 20.f, kTS = 1.5f, kSS = 1.1f;
            const float kSY = kTY + kPropHeight * kTS + 2.f;
            if (prop_glo_tex_) {
                SDL_Texture* sv = prop_font_tex_; prop_font_tex_ = prop_glo_tex_;
                DrawPropText(kCX+2.f, kTY+2.f, "QUAKE III", {255,80,0,120}, kTS, true);
                DrawPropText(kCX+2.f, kSY+2.f, "ARENA",     {255,80,0,120}, kSS, true);
                prop_font_tex_ = sv;
            }
            DrawPropText(kCX, kTY, "QUAKE III", {255,200,50,255}, kTS, true);
            DrawPropText(kCX, kSY, "ARENA",     {220,100,10,255}, kSS, true);

            const auto items   = context.Get<nlohmann::json>("q3.menu_items", nlohmann::json::array());
            const int  sel     = context.Get<int>("q3.menu_selected_item", 0);
            const int  nItems  = static_cast<int>(items.size());
            constexpr float kIS = 1.0f, kIStep = kPropHeight * kIS + 8.f, kITop = 185.f;

            for (int i = 0; i < nItems; ++i) {
                const std::string lbl = items[i].value("label", "");
                const float iy = kITop + i * kIStep;
                if (i == sel) {
                    if (prop_glo_tex_) {
                        SDL_Texture* sv = prop_font_tex_; prop_font_tex_ = prop_glo_tex_;
                        for (float ox : {-1.f, 1.f})
                            DrawPropText(kCX+ox, iy, lbl.c_str(), {255,180,0,100}, kIS, true);
                        prop_font_tex_ = sv;
                    }
                    DrawPropText(kCX, iy, lbl.c_str(), {255,220,80,255}, kIS, true);
                } else {
                    DrawPropText(kCX, iy, lbl.c_str(), {200,55,35,210}, kIS, true);
                }
            }
            DrawPropText(kCX, static_cast<float>(kH-18),
                         "Quake III Arena(c) 1999-2000, Id Software, Inc.",
                         {180,50,30,200}, 0.42f, true);
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
