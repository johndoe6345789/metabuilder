#include "services/interfaces/workflow/quake3/workflow_q3_hud_step.hpp"
#include "services/interfaces/workflow/quake3/q3_overlay_utils.hpp"
#include <SDL3/SDL_render.h>
namespace sdl3cpp::services::impl {
using namespace q3overlay;

WorkflowQ3HudStep::WorkflowQ3HudStep(std::shared_ptr<ILogger> l) : logger_(std::move(l)) {}
std::string WorkflowQ3HudStep::GetPluginId() const { return "q3.hud"; }

void WorkflowQ3HudStep::Execute(
        const WorkflowStepDefinition&, WorkflowContext& context) {
    if (!context.GetBool("overlay.ready", false)) return;
    if (context.GetBool("q3.menu_open", false)) return;

    auto* r = context.Get<SDL_Renderer*>("overlay.renderer", nullptr);
    if (!r) return;

    SDL_Texture* digits[11] = {};
    for (int i = 0; i < 11; ++i)
        digits[i] = context.Get<SDL_Texture*>("overlay.tex.num." + std::to_string(i), nullptr);

    auto* iArmor  = context.Get<SDL_Texture*>("overlay.tex.icon_armor",  nullptr);
    auto* iFace   = context.Get<SDL_Texture*>("overlay.tex.icon_face",   nullptr);
    auto* iWeapon = context.Get<SDL_Texture*>("overlay.tex.icon_weapon", nullptr);

    const int health = context.Get<int>("q3.player_health", 100);
    const int armor  = context.Get<int>("q3.player_armor",  0);
    const int ammo   = context.Get<int>("q3.player_ammo",   50);

    constexpr float kNS  = 1.0f;           // digit sprite scale  → 32×32 px (Q3A native)
    constexpr float kNH  = 32.f * kNS;    // digit height = 32 px
    constexpr float kHudY = kH - kNH - 6.f;

    auto drawIcon = [&](SDL_Texture* t, float x, float y, float w, float h) {
        if (!t) return;
        SDL_SetTextureAlphaMod(t, 255); SDL_SetTextureColorMod(t, 255, 255, 255);
        SDL_SetTextureBlendMode(t, SDL_BLENDMODE_BLEND);
        SDL_FRect dst{x, y, w, h}; SDL_RenderTexture(r, t, nullptr, &dst);
    };

    auto digitWidth = [&](int val) -> float {
        return (val >= 100 ? 3 : val >= 10 ? 2 : 1) * 32.f * kNS;
    };

    // ── Left cluster: [armor#] [armor icon] ─────────────────────────────────
    // Real Q3A: armor sits at far left, icon to its right.
    float cx = 10.f;
    cx = DrawHudNumber(r, digits, cx, kHudY, armor, kNS);
    drawIcon(iArmor, cx + 4.f, kHudY, kNH, kNH);

    // ── Center cluster: [health#] [face icon] ───────────────────────────────
    // Real Q3A: health number + mugshot centered on screen.
    {
        const float hNumW   = digitWidth(health);
        const float cluster = hNumW + 4.f + kNH;
        const float hx      = kW * 0.5f - cluster * 0.5f;
        DrawHudNumber(r, digits, hx, kHudY, health, kNS);
        drawIcon(iFace, hx + hNumW + 4.f, kHudY, kNH, kNH);
    }

    // ── Right cluster: [ammo#] [weapon icon] ─────────────────────────────────
    // Real Q3A: ammo number then weapon icon at far-right edge.
    {
        const float wIconW = iWeapon ? kNH : 0.f;
        const float aNumW  = digitWidth(ammo);
        const float rx     = kW - 10.f - wIconW - (wIconW > 0 ? 6.f : 0.f) - aNumW;
        DrawHudNumber(r, digits, rx, kHudY, ammo, kNS);
        drawIcon(iWeapon, rx + aNumW + 6.f, kHudY, wIconW, wIconW);
    }
}
} // namespace sdl3cpp::services::impl
