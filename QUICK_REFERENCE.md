# Quick Reference: MetaBuilder Game Engine

## Current State (June 2026)

**Milestone**: Quake 3 Arena fully playable on the custom engine ✅
- BSP level loading with lightmap atlas and portal rendering
- Full player movement (pmove: gravity, jump, friction, acceleration)
- Weapons, ammo, damage, pickups, movers, triggers
- Bot AI with navigation
- HUD, crosshair, hitmarkers, weapon select, menus
- **212 registered workflow steps** total

---

## Build & Run

```bash
cd frontends/gameengine

# Build
cmake --build _build/Release --target sdl3_app

# Run Quake 3
./_build/Release/sdl3_app --bootstrap bootstrap_linux --game quake3

# Run screenshot capture
./_build/Release/sdl3_app --bootstrap bootstrap_linux --game quake3_screenshot

# Run default seed demo
./_build/Release/sdl3_app --bootstrap bootstrap_linux --game seed

# Run cube demo
./_build/Release/sdl3_app --bootstrap bootstrap_linux --game standalone_cubes

# macOS variants (bootstrap_mac)
./_build/Release/sdl3_app --bootstrap bootstrap_mac --game quake3
```

---

## Game Packages (12)

| Package | Purpose |
|---------|---------|
| `quake3` | Full Quake 3 Arena gameplay |
| `quake3_screenshot` | Automated screenshot capture for Q3 |
| `seed` | Default demo (entities, audio, graphics) |
| `standalone_cubes` | Cube rendering demo |
| `bootstrap_mac` | macOS bootstrap (SDL3 GPU init) |
| `bootstrap_linux` | Linux bootstrap |
| `bootstrap_windows` | Windows bootstrap |
| `engine_tester` | Test runner for engine validation |
| `asset_loader` | Asset loading benchmarks |
| `materialx` | MaterialX PBR rendering demo |
| `soundboard` | Audio system demo |
| `assets` | Shared asset package |

---

## Workflow Steps: 212 Registered

### Graphics (10)
- `graphics.gpu.init_viewport`, `graphics.gpu.init_renderer`, `graphics.gpu.init`
- `graphics.shader.load`, `graphics.shader.compile`, `graphics.pipeline.create`
- `graphics.buffer.create_vertex`, `graphics.buffer.create_index`
- `graphics.frame.begin`, `graphics.frame.end`

### Rendering (40+)
- `rendering.draw.submit`, `rendering.screenshot.request`
- `rendering.lighting.*` (directional, point, ambient)
- `rendering.shadows.*` (shadow maps, cascaded)
- `rendering.postfx.*` (TAA, SSAO, Bloom, tonemapping)
- `rendering.grid.*`, `rendering.deferred.*`
- `rendering.portal.*` (Q3 portal rendering)

### Q3 Gameplay (42)
- **pmove** (6): `q3.pmove.apply`, `q3.pmove.ground`, `q3.pmove.air`, `q3.pmove.friction`, `q3.pmove.jump`, `q3.pmove.step`
- **Weapons** (3): `q3.weapon.fire`, `q3.weapon.switch`, `q3.weapon.reload`
- **Missiles** (2): `q3.missile.spawn`, `q3.missile.update`
- **Damage** (4): `q3.damage.apply`, `q3.damage.radius`, `q3.damage.shield`, `q3.damage.kill`
- **Pickups** (3): `q3.pickup.check`, `q3.pickup.apply`, `q3.pickup.respawn`
- **Movers** (2): `q3.mover.update`, `q3.mover.trigger`
- **Triggers** (2): `q3.trigger.check`, `q3.trigger.fire`
- **Bots** (3): `q3.bot.think`, `q3.bot.aim`, `q3.bot.move`
- **HUD** (3): `q3.hud.draw`, `q3.hud.crosshair`, `q3.hud.hitmarker`
- **Nav** (1): `q3.nav.pathfind`
- **Ammo** (1): `q3.ammo.check`
- **Menus** (1): `q3.menu.update`

### Physics (5)
- `physics.world.create`, `physics.body.add`, `physics.world.step`
- `physics.fps.move`, `physics.transform.sync`

### Scene (8)
- `scene.create`, `scene.load`, `scene.update`, `scene.clear`, `scene.set_active`
- `scene.geometry.add`, `scene.geometry.remove`, `scene.get_bounds`

### Camera (5)
- `camera.setup`, `camera.fps.update`, `camera.look_at`, `camera.set_fov`, `camera.teleport`

### Input (5)
- `input.key.pressed`, `input.mouse.position`, `input.mouse.button.pressed`
- `input.gamepad.axis`, `input.gamepad.button.pressed`

### Audio (7)
- `audio.play`, `audio.pause`, `audio.resume`, `audio.seek`
- `audio.stop`, `audio.set_volume`, `audio.set_looping`

### Control Flow (5)
- `flow.if`, `flow.while`, `flow.for_each`, `flow.switch`, `flow.try_catch`

### Math (9)
- `math.add`, `math.sub`, `math.mul`, `math.div`
- `math.min`, `math.max`, `math.abs`, `math.round`, `math.clamp`

### String (10)
- `str.concat`, `str.split`, `str.join`, `str.upper`, `str.lower`
- `str.trim`, `str.replace`, `str.equals`, `str.contains`, `str.format`

### Logic (6)
- `logic.and`, `logic.or`, `logic.not`
- `logic.compare` (eq, gt, lt, gte, lte, ne)

### Collections (8)
- `col.append`, `col.count`, `col.filter`, `col.map`
- `col.reduce.sum`, `col.reduce.min`, `col.reduce.max`, `col.clear`

### Value / Utility (10)
- `val.assert`, `val.set_if`, `val.type_check`, `val.default`
- `val.literal`, `val.copy`, `val.clear`, plus model/texture loading

### Composition (2)
- `workflow.execute` (call another workflow), `workflow.exit`

---

## Architecture

```
JSON workflow (q3_game.json)
  └── workflow steps (212 registered)
        └── C++ implementations (~50-100 LOC each, testable in isolation)
              └── SDL3 GPU / OpenAL
```

**Key files**:
```
frontends/gameengine/
├── packages/              # Game packages (12)
│   ├── quake3/            # Q3 game definition + workflows
│   ├── bootstrap_linux/   # Platform bootstrap workflows
│   └── seed/              # Default demo workflows
├── src/
│   ├── services/impl/workflow/
│   │   ├── graphics/      # 10 graphics steps
│   │   ├── rendering/     # 40+ rendering steps
│   │   ├── q3/            # 42 Q3 gameplay steps (36 .cpp files)
│   │   ├── physics/       # 5 physics steps
│   │   ├── audio/         # 7 audio steps
│   │   └── frame/         # Core game loop steps
│   └── main.cpp           # Entry point
```

---

## Performance

| Metric | Value |
|--------|-------|
| Build time (full) | ~2 minutes |
| Frame rate (Quake 3) | 52+ FPS |
| Workflow step overhead | ~3-5ns per step |
| Total C++ files | 545 (289 .hpp + 256 .cpp) |
| Q3-specific C++ files | 36 |

---

**Last Updated**: June 25, 2026
**Status**: Production-ready — Quake 3 playable ✅
