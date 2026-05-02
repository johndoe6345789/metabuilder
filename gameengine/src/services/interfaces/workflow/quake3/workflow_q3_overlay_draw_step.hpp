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
    void DrawSurface(WorkflowContext& context, uint32_t frameW, uint32_t frameH);
    void Render(SDL_GPUCommandBuffer* cmd, SDL_GPUTexture* swapchainTex,
                SDL_GPUDevice* device, uint32_t frameW, uint32_t frameH);

    // Render a string using the Q3 bigchars grid font (HUD use).
    void DrawQ3Text(float x, float y, const char* text, SDL_Color color, float scale = 1.0f);

    // Render a string using Q3's proportional font (font1_prop.tga).
    // center=true → x is the horizontal centre of the string.
    void DrawPropText(float x, float y, const char* text, SDL_Color color,
                      float scale = 1.0f, bool center = false);

    // Compute pixel width of a proportional string at scale=1.
    float PropStringWidth(const char* text) const;

    SDL_Texture* LoadTextureFromPk3(const std::string& pk3Path, const char* entry);

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

    // Menu textures loaded from PK3 (all 256×256 RGBA TGAs)
    bool          menu_tex_loaded_ = false;
    SDL_Texture*  bigchars_tex_    = nullptr;  // gfx/2d/bigchars.tga       – HUD grid font
    SDL_Texture*  prop_font_tex_   = nullptr;  // menu/art/font1_prop.tga   – proportional font
    SDL_Texture*  frame_bg_tex_    = nullptr;  // menu/art/cut_frame.tga    – panel background
    SDL_Texture*  frame_l_tex_     = nullptr;  // menu/art/frame1_l.tga     – left decoration
    SDL_Texture*  frame_r_tex_     = nullptr;  // menu/art/frame1_r.tga     – right decoration
    SDL_Texture*  frame2_l_tex_    = nullptr;  // menu/art/frame2_l.tga     – selection highlight

    static constexpr int kW = 640;
    static constexpr int kH = 360;
    static constexpr int kGlyphSrc   = 16;   // bigchars cell size in source texture
    static constexpr int kPropHeight = 27;   // Q3 PROP_HEIGHT
    static constexpr int kPropGap    = 3;    // Q3 PROP_GAP_WIDTH
    static constexpr int kPropSpace  = 8;    // Q3 PROP_SPACE_WIDTH
};

}  // namespace sdl3cpp::services::impl
