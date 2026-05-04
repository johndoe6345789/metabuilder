#pragma once

#include "services/interfaces/i_workflow_step.hpp"
#include "services/interfaces/i_logger.hpp"
#include "services/interfaces/workflow_context.hpp"

#include <SDL3/SDL_gpu.h>
#include <SDL3/SDL_render.h>
#include <SDL3/SDL_surface.h>
#include <cstdint>
#include <memory>
#include <string>
#include <unordered_map>

namespace sdl3cpp::services::impl {

class WorkflowQ3OverlayDrawStep final : public IWorkflowStep {
public:
    explicit WorkflowQ3OverlayDrawStep(std::shared_ptr<ILogger> logger);
    ~WorkflowQ3OverlayDrawStep();

    std::string GetPluginId() const override;
    void Execute(const WorkflowStepDefinition& step, WorkflowContext& context) override;

private:
    void TryInit(SDL_GPUDevice* device, SDL_Window* window);
    void TryLoadMenuTextures(const std::string& pk3Path);
    void ParseArenas(const std::string& pk3Path);
    void DrawSurface(WorkflowContext& context, uint32_t frameW, uint32_t frameH);
    void DrawMapSelectScreen(WorkflowContext& context, const std::string& pk3Path);
    void Render(SDL_GPUCommandBuffer* cmd, SDL_GPUTexture* swapchainTex,
                SDL_GPUDevice* device, uint32_t frameW, uint32_t frameH);

    // Render a string using the Q3 bigchars grid font.
    void DrawQ3Text(float x, float y, const char* text, SDL_Color color, float scale = 1.0f);

    // Render a string using Q3's proportional font (font1_prop.tga).
    // center=true → x is the horizontal centre of the string.
    void DrawPropText(float x, float y, const char* text, SDL_Color color,
                      float scale = 1.0f, bool center = false);

    // Draw an integer value using the gfx/2d/numbers/* sprites.
    // Returns the x position just past the last digit.
    float DrawHudNumber(float x, float y, int value, float scale);

    // Compute pixel width of a proportional string at scale=1.
    float PropStringWidth(const char* text) const;

    SDL_Texture* LoadTextureFromPk3(const std::string& pk3Path, const char* entry);
    SDL_Texture* LoadOrGetLevelshot(const std::string& mapName, const std::string& pk3Path);

    std::shared_ptr<ILogger> logger_;

    // GPU overlay pipeline state
    bool ready_        = false;
    bool disabled_     = false;
    bool vbuf_uploaded_= false;
    SDL_GPUDevice*            device_   = nullptr;
    SDL_GPUGraphicsPipeline*  pipeline_ = nullptr;
    SDL_GPUTexture*           tex_      = nullptr;
    SDL_GPUTransferBuffer*    transfer_ = nullptr;
    SDL_GPUBuffer*            vtx_buf_  = nullptr;
    SDL_GPUSampler*           sampler_  = nullptr;
    SDL_Surface*              surface_  = nullptr;
    SDL_Renderer*             renderer_ = nullptr;

    // Menu / font textures loaded from PK3
    bool          menu_tex_loaded_ = false;
    SDL_Texture*  bigchars_tex_    = nullptr;  // gfx/2d/bigchars.tga
    SDL_Texture*  prop_font_tex_   = nullptr;  // menu/art/font1_prop.tga
    SDL_Texture*  prop_glo_tex_    = nullptr;  // menu/art/font1_prop_glo.tga
    SDL_Texture*  frame_bg_tex_    = nullptr;  // menu/art/cut_frame.tga
    SDL_Texture*  frame_l_tex_     = nullptr;  // menu/art/frame1_l.tga  (left ring half)
    SDL_Texture*  frame_r_tex_     = nullptr;  // menu/art/frame1_r.tga  (right ring half)
    SDL_Texture*  frame2_l_tex_    = nullptr;  // menu/art/frame2_l.tga

    // HUD number sprites: indices 0-9 = digits, index 10 = minus sign
    SDL_Texture*  num_digits_[11]   = {};

    // HUD icon textures
    SDL_Texture*  icon_armor_tex_   = nullptr;  // icons/iconr_yellow.tga
    SDL_Texture*  icon_health_tex_  = nullptr;  // icons/iconh_red.tga
    SDL_Texture*  icon_face_tex_    = nullptr;  // models/players/keel/icon_default.tga
    SDL_Texture*  icon_ammo_tex_    = nullptr;  // icons/icona_machinegun.tga
    SDL_Texture*  icon_crosshair_   = nullptr;  // gfx/2d/crosshaira.tga

    // Map-select UI textures
    SDL_Texture*  btn_back_tex_     = nullptr;  // menu/art/back_0.tga
    SDL_Texture*  btn_fight_tex_    = nullptr;  // menu/art/fight_0.tga
    SDL_Texture*  btn_skirmish_tex_ = nullptr;  // menu/art/skirmish_0.tga
    SDL_Texture*  btn_arrow_l_tex_  = nullptr;  // menu/art/gs_arrows_l.tga
    SDL_Texture*  btn_arrow_r_tex_  = nullptr;  // menu/art/gs_arrows_r.tga

    // Levelshot cache: uppercase map name → software SDL_Texture
    std::unordered_map<std::string, SDL_Texture*> levelshot_cache_;

    // Arena metadata parsed from scripts/arenas.txt
    struct ArenaInfo { std::string longname; std::string bot; };
    std::unordered_map<std::string, ArenaInfo> arena_data_;  // key = lowercase map name
    bool arena_data_loaded_ = false;

    static constexpr int kW = 640;
    static constexpr int kH = 360;
    static constexpr int kGlyphSrc   = 16;   // bigchars cell size in source texture
    static constexpr int kPropHeight = 27;   // Q3 PROP_HEIGHT
    static constexpr int kPropGap    = 3;    // Q3 PROP_GAP_WIDTH
    static constexpr int kPropSpace  = 8;    // Q3 PROP_SPACE_WIDTH
};

}  // namespace sdl3cpp::services::impl
