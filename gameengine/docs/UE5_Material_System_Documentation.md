# Unreal Engine 5 Material System Documentation
## For MaterialX and bgfx Integration

This documentation explains how UE5's material system works, with specific focus on helping you integrate MaterialX shader graphs with bgfx rendering.

---

## Table of Contents
1. [Material System Architecture](#material-system-architecture)
2. [Material Definitions and Representation](#material-definitions-and-representation)
3. [Shader Generation Pipeline](#shader-generation-pipeline)
4. [GBuffer Encoding](#gbuffer-encoding)
5. [Shader Permutations](#shader-permutations)
6. [BRDF and Lighting Integration](#brdf-and-lighting-integration)
7. [Shading Models](#shading-models)
8. [MaterialX Integration Strategy](#materialx-integration-strategy)
9. [bgfx Implementation Guide](#bgfx-implementation-guide)
10. [Key Files Reference](#key-files-reference)

---

## Material System Architecture

UE5 uses a node-based material editor that generates optimized HLSL shaders. The pipeline is:

```
Material Graph (Artist) → HLSL Code Generation → Shader Compilation → Runtime Rendering
```

For your MaterialX + bgfx engine:
```
MaterialX Graph → Custom Translator → GLSL/HLSL/Metal → bgfx Shader Compilation → Runtime
```

### Key Concepts

**Three-Layer Material System:**

1. **Material Asset** (`UMaterial`) - The high-level definition
   - Material properties (blend mode, shading model, etc.)
   - Expression graph (node network)
   - Default parameter values

2. **Material Instance** (`UMaterialInstance`) - Runtime variations
   - Overrides parameters (colors, scalars, textures)
   - No recompilation needed
   - Lightweight for creating variations

3. **Material Render Proxy** (`FMaterialRenderProxy`) - Per-draw state
   - Binds to specific mesh instance
   - Provides per-instance parameters
   - Used during actual rendering

**Key File:** `Engine/Source/Runtime/Engine/Public/Materials/Material.h`

---

## Material Definitions and Representation

### Core Material Inputs

UE5 materials define these standard inputs (maps directly to MaterialX concept):

```cpp
// From Engine/Source/Runtime/Engine/Public/Materials/Material.h

struct UMaterial
{
    // PBR Material Inputs
    FColorMaterialInput BaseColor;           // Albedo/diffuse color
    FScalarMaterialInput Metallic;           // 0 = dielectric, 1 = metal
    FScalarMaterialInput Specular;           // Specular reflectance (usually 0.5)
    FScalarMaterialInput Roughness;          // 0 = smooth, 1 = rough
    FScalarMaterialInput Anisotropy;         // -1 to 1, anisotropic reflection

    // Normals and Displacement
    FVectorMaterialInput Normal;             // Tangent-space normal map
    FVectorMaterialInput Tangent;            // For anisotropic materials
    FVectorMaterialInput WorldPositionOffset; // Vertex displacement

    // Emission and Special
    FColorMaterialInput EmissiveColor;       // Self-illumination
    FScalarMaterialInput Opacity;            // For translucent materials
    FScalarMaterialInput OpacityMask;        // For masked materials

    // Subsurface (for skin, wax, etc.)
    FColorMaterialInput SubsurfaceColor;

    // Clear Coat (for car paint, etc.)
    FScalarMaterialInput ClearCoat;
    FScalarMaterialInput ClearCoatRoughness;

    // Ambient Occlusion
    FScalarMaterialInput AmbientOcclusion;

    // Refraction (for glass, water)
    FScalarMaterialInput Refraction;

    // Custom data (shading model specific)
    FVectorMaterialInput CustomData0;
    FVectorMaterialInput CustomData1;
};
```

### Material Properties

```cpp
// Material Domain - What type of material is this?
enum EMaterialDomain
{
    MD_Surface,           // Standard surface material (99% of materials)
    MD_DeferredDecal,     // Projected decal
    MD_LightFunction,     // Light cookie/gobo
    MD_Volume,            // Volumetric material (fog, clouds)
    MD_PostProcess,       // Post-process effect
    MD_UI,                // User interface
    MD_RuntimeVirtualTexture // Runtime virtual texture output
};

// Blend Mode - How does this material composite?
enum EBlendMode
{
    BLEND_Opaque,         // Solid, no transparency
    BLEND_Masked,         // Binary transparency (alpha test)
    BLEND_Translucent,    // Alpha blending
    BLEND_Additive,       // Additive blending (particles, effects)
    BLEND_Modulate,       // Multiplicative blending
    BLEND_AlphaComposite, // Pre-multiplied alpha
    BLEND_AlphaHoldout    // Compositing holdout
};

// Shading Model - Which BRDF to use?
enum EMaterialShadingModel
{
    MSM_DefaultLit,       // Standard PBR (GGX)
    MSM_Subsurface,       // Subsurface scattering
    MSM_PreintegratedSkin,// Optimized skin shading
    MSM_ClearCoat,        // Dual-layer (coat + base)
    MSM_SubsurfaceProfile,// Profile-based SSS
    MSM_TwoSidedFoliage,  // Leaf/plant shading
    MSM_Hair,             // Anisotropic hair
    MSM_Cloth,            // Fabric with fuzz
    MSM_Eye,              // Eye with iris/cornea
    MSM_SingleLayerWater, // Water surface
    MSM_ThinTranslucent   // Thin translucent surfaces
};
```

**Key File:** `Engine/Source/Runtime/Engine/Public/MaterialShared.h`

### MaterialX Mapping

MaterialX nodes map to UE5 material inputs as follows:

| MaterialX Node | UE5 Material Input | Notes |
|----------------|-------------------|-------|
| `<standard_surface>` | Base material | Core PBR node |
| `base_color` | BaseColor | RGB color |
| `metalness` | Metallic | 0-1 scalar |
| `specular_roughness` | Roughness | 0-1 scalar |
| `normal` | Normal | Tangent-space XYZ |
| `emission` | EmissiveColor | RGB color |
| `coat` | ClearCoat | 0-1 scalar |
| `coat_roughness` | ClearCoatRoughness | 0-1 scalar |
| `transmission` | Opacity (inverted) | For translucent |
| `subsurface` | SubsurfaceColor | RGB color |

**Your Workflow:**
1. Parse MaterialX document (XML or JSON metadata)
2. Build expression graph
3. Generate shader code for bgfx
4. Extract parameters for runtime editing

---

## Shader Generation Pipeline

UE5 converts the material graph to HLSL code through `FHLSLMaterialTranslator`.

**Key File:** `Engine/Source/Runtime/Engine/Private/Materials/HLSLMaterialTranslator.cpp` (695KB!)

### Translation Process

```
Material Expression Graph
    ↓
[1] Traverse nodes starting from outputs (BaseColor, Roughness, etc.)
    ↓
[2] Generate HLSL code for each node
    ↓
[3] Optimize (constant folding, dead code elimination)
    ↓
[4] Fill MaterialTemplate.ush with generated code
    ↓
[5] Compile with shader compiler (DXC/FXC)
    ↓
Final Shader Bytecode
```

### Material Template

UE5 uses a template file that gets filled in during compilation:

**File:** `Engine/Shaders/Private/MaterialTemplate.ush`

```hlsl
// Simplified example of MaterialTemplate.ush

// Platform includes
#include "/Engine/Private/Common.ush"
#include "/Engine/Private/BRDF.ush"
#include "/Engine/Private/ShadingModels.ush"

// Generated material parameter declarations
// %MATERIAL_PARAMETERS%
// Example output:
// Texture2D Material_Texture2D_0;
// SamplerState Material_Texture2D_0Sampler;
// float4 Material_ScalarParameter_0;

// Material attributes structure
struct FMaterialPixelParameters
{
    float3 WorldPosition;
    float3 WorldNormal;
    float3 WorldTangent;
    float2 TexCoords[NUM_MATERIAL_TEXCOORDS];
    float4 VertexColor;
    // ... more
};

// Generated pixel shader code
void CalcPixelMaterialInputs(inout FMaterialPixelParameters Parameters)
{
    // %PIXEL_SHADER_CODE%
    // This is where your material graph gets inserted
    // Example generated code:

    // BaseColor = Texture2DSample(Material_Texture2D_0, UV)
    float3 Local0 = Texture2DSample(Material_Texture2D_0,
                                    Material_Texture2D_0Sampler,
                                    Parameters.TexCoords[0]).rgb;

    // Roughness = ScalarParameter * 0.5
    float Local1 = Material_ScalarParameter_0.x * 0.5;

    // Write to output structure
    PixelMaterialInputs.BaseColor = Local0;
    PixelMaterialInputs.Roughness = Local1;
    PixelMaterialInputs.Metallic = 0.0;
    PixelMaterialInputs.Specular = 0.5;
    // ... more outputs
}
```

### Code Generation Example

For a simple material graph:
```
Texture2D (BaseColorTexture) → Multiply (by Color Parameter) → BaseColor Output
```

Generated HLSL:
```hlsl
// Parameter declarations
Texture2D Material_Texture2D_0;          // BaseColorTexture
SamplerState Material_Texture2D_0Sampler;
float4 Material_VectorParameter_0;        // Color Parameter

// In CalcPixelMaterialInputs():
float3 Local0 = Texture2DSample(Material_Texture2D_0,
                                Material_Texture2D_0Sampler,
                                Parameters.TexCoords[0]).rgb;

float3 Local1 = Local0 * Material_VectorParameter_0.rgb;

PixelMaterialInputs.BaseColor = Local1;
```

### For Your MaterialX Engine

You'll need similar translation:

```python
# Pseudo-code for MaterialX to GLSL/HLSL
class MaterialXTranslator:
    def translate_graph(self, materialx_doc):
        # 1. Parse MaterialX document
        graph = parse_materialx(materialx_doc)

        # 2. Topological sort (dependencies first)
        sorted_nodes = topological_sort(graph)

        # 3. Generate shader code
        shader_code = ShaderCode()

        for node in sorted_nodes:
            if node.type == 'image':
                shader_code.add_texture(node.name, node.file)
                shader_code.add_sample(f"{node.output} = texture2D({node.name}, uv);")

            elif node.type == 'multiply':
                shader_code.add_operation(f"{node.output} = {node.input1} * {node.input2};")

            elif node.type == 'standard_surface':
                # This is the output node
                shader_code.set_output('baseColor', node.inputs['base_color'])
                shader_code.set_output('roughness', node.inputs['specular_roughness'])
                # ... etc

        # 4. Generate final shader with bgfx conventions
        return generate_bgfx_shader(shader_code)
```

**Key File for Reference:** `Engine/Source/Runtime/Engine/Private/Materials/MaterialExpressions.cpp`
- Contains code generation for every material node type
- ~16,000 lines showing how each node generates HLSL

---

## GBuffer Encoding

UE5 uses deferred rendering, storing material properties in the GBuffer (multiple render targets).

**Key File:** `Engine/Shaders/Private/DeferredShadingCommon.ush`

### GBuffer Data Structure

```cpp
struct FGBufferData
{
    // Geometric properties
    half3 WorldNormal;        // Unit vector in world space
    half3 WorldTangent;       // For anisotropic materials

    // PBR properties (from material)
    half3 BaseColor;          // Albedo (RGB)
    half3 DiffuseColor;       // Derived: BaseColor * (1 - Metallic)
    half3 SpecularColor;      // Derived: lerp(0.04, BaseColor, Metallic)
    half Metallic;            // 0 = dielectric, 1 = metal
    half Specular;            // Specular intensity (0.5 default)
    half Roughness;           // Surface roughness (0-1)
    half Anisotropy;          // Anisotropic highlight (-1 to 1)

    // Lighting modifiers
    half GBufferAO;           // Ambient occlusion from material

    // Shading model
    uint ShadingModelID;      // Which BRDF to use

    // Custom data (shading model specific)
    float4 CustomData;        // Meaning depends on ShadingModelID

    // Advanced
    uint SelectiveOutputMask; // Which outputs are written
    half PerObjectGBufferData;// Per-object data
    half4 PrecomputedShadowFactors; // Static lighting

    // Depth
    float Depth;              // Linear depth

    // Indirect lighting
    half IndirectIrradiance;  // Baked lighting
};
```

### GBuffer Layout (Multiple Render Targets)

UE5 writes to 5-6 render targets simultaneously:

```hlsl
// Pixel shader outputs
struct FGBufferOutput
{
    // RT0: SceneColor (RGB = lit color, A = unused or AO)
    float4 OutTarget0 : SV_Target0;

    // RT1: GBufferA (RGB = Normal, A = PerObjectData)
    float4 OutTarget1 : SV_Target1;

    // RT2: GBufferB (R = Metallic, G = Specular, B = Roughness, A = ShadingModelID)
    float4 OutTarget2 : SV_Target2;

    // RT3: GBufferC (RGB = BaseColor, A = AO)
    float4 OutTarget3 : SV_Target3;

    // RT4: GBufferD (RGBA = CustomData, shading model specific)
    float4 OutTarget4 : SV_Target4;

    // RT5: GBufferE (RGBA = PrecomputedShadowFactors)
    float4 OutTarget5 : SV_Target5;

    // RT6: GBufferF (RGB = Tangent, A = Anisotropy) - Optional
    float4 OutTarget6 : SV_Target6;
};
```

### Encoding Functions

**Normal Encoding (Octahedron):**
```hlsl
// From Common.ush
// Encodes unit vector to 2 components (saves space)
float2 EncodeNormal(float3 N)
{
    N /= (abs(N.x) + abs(N.y) + abs(N.z));
    float2 p = N.z >= 0.0 ? N.xy : (1.0 - abs(N.yx)) * (N.xy >= 0.0 ? 1.0 : -1.0);
    return p * 0.5 + 0.5; // Map to [0,1]
}

float3 DecodeNormal(float2 p)
{
    p = p * 2.0 - 1.0;
    float3 N = float3(p.x, p.y, 1.0 - abs(p.x) - abs(p.y));
    float t = max(-N.z, 0.0);
    N.x += N.x >= 0.0 ? -t : t;
    N.y += N.y >= 0.0 ? -t : t;
    return normalize(N);
}
```

**GBuffer Encoding:**
```hlsl
// From DeferredShadingCommon.ush
void EncodeGBuffer(FGBufferData GBuffer, out FGBufferOutput Output)
{
    // GBufferA: Normal + per-object data
    Output.OutTarget1.rgb = EncodeNormal(GBuffer.WorldNormal);
    Output.OutTarget1.a = GBuffer.PerObjectGBufferData;

    // GBufferB: Material properties
    Output.OutTarget2.r = GBuffer.Metallic;
    Output.OutTarget2.g = GBuffer.Specular;
    Output.OutTarget2.b = GBuffer.Roughness;
    Output.OutTarget2.a = EncodeShadingModelIdAndSelectiveOutputMask(
        GBuffer.ShadingModelID,
        GBuffer.SelectiveOutputMask
    );

    // GBufferC: Base color + AO
    Output.OutTarget3.rgb = EncodeBaseColor(GBuffer.BaseColor);
    Output.OutTarget3.a = GBuffer.GBufferAO;

    // GBufferD: Custom data
    Output.OutTarget4 = GBuffer.CustomData;

    // GBufferE: Precomputed shadows
    Output.OutTarget5 = GBuffer.PrecomputedShadowFactors;

    // GBufferF: Tangent + Anisotropy (if enabled)
    #if MATERIAL_ANISOTROPY
    Output.OutTarget6.rgb = EncodeNormal(GBuffer.WorldTangent);
    Output.OutTarget6.a = GBuffer.Anisotropy * 0.5 + 0.5;
    #endif
}
```

### Custom Data Encoding (Shading Model Specific)

Different shading models use CustomData differently:

```hlsl
// From ShadingModelsMaterial.ush

// Default Lit: CustomData is unused
CustomData = float4(0, 0, 0, 0);

// Subsurface: RGB = Subsurface Color, A = Opacity
CustomData.rgb = EncodeSubsurfaceColor(SubsurfaceColor);
CustomData.a = Opacity;

// Clear Coat: R = Coat amount, G = Coat roughness
CustomData.x = ClearCoat;
CustomData.y = ClearCoatRoughness;

// Cloth: RGB = Fuzz color, A = Cloth amount
CustomData.rgb = EncodeSubsurfaceColor(FuzzColor);
CustomData.a = Cloth;

// Hair: Complex encoding for hair-specific parameters
CustomData.x = Backlit;
CustomData.y = 0; // Unused
CustomData.z = 0; // Unused
CustomData.w = 0; // Unused

// Eye: Iris data
CustomData.x = SubsurfaceProfile;
CustomData.w = 1.0 - IrisMask;
CustomData.yz = IrisNormal; // Compressed
```

### For Your bgfx Engine

Design your GBuffer based on what you need:

**Minimal GBuffer (3 RTs):**
```
RT0: SceneColor (RGB) + AO (A)
RT1: Normal (RGB, octahedron-encoded in RG) + Roughness (B) + Metallic (A)
RT2: BaseColor (RGB) + Specular (A)
```

**Standard GBuffer (4 RTs):**
```
RT0: SceneColor (RGB) + unused (A)
RT1: Normal (RG, octahedron) + unused (B) + PerObjectData (A)
RT2: Metallic (R) + Specular (G) + Roughness (B) + ShadingModelID (A)
RT3: BaseColor (RGB) + AO (A)
```

**Full Featured (5-6 RTs):**
- Add RT4 for CustomData
- Add RT5 for baked lighting
- Add RT6 for anisotropic tangents

**bgfx GBuffer Setup:**
```cpp
// Create MRT framebuffer
bgfx::TextureHandle gbuffer[4];
gbuffer[0] = bgfx::createTexture2D(width, height, false, 1, bgfx::TextureFormat::RGBA16F); // SceneColor
gbuffer[1] = bgfx::createTexture2D(width, height, false, 1, bgfx::TextureFormat::RGBA8);   // Normal+Data
gbuffer[2] = bgfx::createTexture2D(width, height, false, 1, bgfx::TextureFormat::RGBA8);   // Material
gbuffer[3] = bgfx::createTexture2D(width, height, false, 1, bgfx::TextureFormat::RGBA8);   // BaseColor+AO

bgfx::FrameBufferHandle gbufferFB = bgfx::createFrameBuffer(4, gbuffer, true);
```

---

## Shader Permutations

UE5 pre-compiles thousands of shader variants to handle different material configurations.

### Permutation Dimensions

Shaders vary based on:

1. **Material Properties:**
   - Blend Mode (Opaque, Masked, Translucent, etc.)
   - Shading Model (DefaultLit, Subsurface, ClearCoat, etc.)
   - Material Domain (Surface, Decal, PostProcess, etc.)

2. **Material Features:**
   - Uses Normal Map? (yes/no)
   - Uses Vertex Color? (yes/no)
   - Uses World Position Offset? (yes/no)
   - Num Texture Coordinates (0-8)
   - Num Custom Vertex Interpolators (0-8)

3. **Platform/Quality:**
   - Feature Level (ES3.1, SM5, SM6)
   - Quality Level (Low, Medium, High, Epic)
   - Platform (PC, Console, Mobile)

4. **Vertex Factory:**
   - Static Mesh
   - Skeletal Mesh
   - Instanced Static Mesh
   - Niagara (particles)
   - etc.

### Permutation Defines

**File:** `Engine/Shaders/Private/MaterialTemplate.ush`

```hlsl
// Material blend mode
#define MATERIALBLENDING_OPAQUE 0
#define MATERIALBLENDING_MASKED 1
#define MATERIALBLENDING_TRANSLUCENT 2
#define MATERIALBLENDING_ADDITIVE 3
#define MATERIALBLENDING_MODULATE 4

// Current material uses:
#define MATERIAL_BLENDING_MODE MATERIALBLENDING_OPAQUE

// Shading model
#define MATERIAL_SHADINGMODEL_DEFAULT_LIT 1
#define MATERIAL_SHADINGMODEL_SUBSURFACE 1
#define MATERIAL_SHADINGMODEL_CLEAR_COAT 1
// ... etc (one is set to 1, rest to 0)

// Material features
#define NUM_MATERIAL_TEXCOORDS 2
#define NUM_CUSTOM_VERTEX_INTERPOLATORS 0
#define USES_WORLD_POSITION_OFFSET 1
#define MATERIAL_USES_ANISOTROPY 0
#define MATERIAL_TANGENTSPACENORMAL 1

// Platform
#define FEATURE_LEVEL FEATURE_LEVEL_SM5
#define PLATFORM_SUPPORTS_SRV_UB 1
```

### Uber Shader vs. Permutations

**UE5 Approach (Static Permutations):**
```hlsl
// Compile-time branching
#if MATERIAL_SHADINGMODEL_SUBSURFACE
    // Subsurface-specific code
    float3 SubsurfaceLighting = CalculateSubsurface(...);
#elif MATERIAL_SHADINGMODEL_CLEAR_COAT
    // Clear coat-specific code
    float3 CoatLighting = CalculateClearCoat(...);
#else
    // Default lit
    float3 Lighting = CalculateDefaultLit(...);
#endif
```

Pros: Optimal code for each variant, no runtime branching
Cons: Thousands of shaders, long compile times, large disk space

**Alternative Approach (Uber Shaders):**
```hlsl
// Runtime branching
uniform int u_shadingModel;

if (u_shadingModel == SHADINGMODEL_SUBSURFACE) {
    return CalculateSubsurface(...);
} else if (u_shadingModel == SHADINGMODEL_CLEARCOAT) {
    return CalculateClearCoat(...);
} else {
    return CalculateDefaultLit(...);
}
```

Pros: Fewer shaders, fast iteration
Cons: Runtime branching overhead, less optimal code

### For Your Engine

**Recommended Hybrid Approach:**

Static permutations for major variants:
- Blend mode (Opaque vs. Translucent)
- Vertex deformation (yes/no)
- Major shading models

Dynamic branching for minor features:
- Texture usage
- Parameter variations
- Quality levels

```cpp
// Example: Generate permutations
std::vector<ShaderPermutation> GenerateMaterialPermutations(const MaterialX& mtlx)
{
    std::vector<ShaderPermutation> permutations;

    // Static: Blend mode
    for (auto blend : {Opaque, Masked, Translucent}) {
        // Static: Shading model
        for (auto model : {DefaultLit, Subsurface, ClearCoat}) {
            // Only generate valid combinations
            if (IsValidCombination(blend, model, mtlx)) {
                ShaderPermutation perm;
                perm.defines["BLEND_MODE"] = blend;
                perm.defines["SHADING_MODEL"] = model;
                perm.source = GenerateShaderSource(mtlx, perm.defines);
                permutations.push_back(perm);
            }
        }
    }

    return permutations;
}
```

**bgfx Shader Variants:**
```cpp
// bgfx supports shader variants via defines
bgfx::ShaderHandle compileBgfxShader(const char* source, const char* defines)
{
    const bgfx::Memory* mem = bgfx::copy(source, strlen(source) + 1);

    bgfx::ShaderHandle shader = bgfx::createShader(mem);
    bgfx::setName(shader, "MaterialShader");

    return shader;
}

// Compile permutations
std::map<uint32_t, bgfx::ProgramHandle> shaderCache;

uint32_t key = (blendMode << 16) | (shadingModel << 8) | features;
if (shaderCache.find(key) == shaderCache.end()) {
    std::string defines = GenerateDefines(blendMode, shadingModel, features);
    bgfx::ShaderHandle vs = compileBgfxShader(vertexSource, defines.c_str());
    bgfx::ShaderHandle fs = compileBgfxShader(fragmentSource, defines.c_str());
    shaderCache[key] = bgfx::createProgram(vs, fs, true);
}
```

---

## BRDF and Lighting Integration

UE5 uses physically-based rendering with the GGX microfacet BRDF.

**Key File:** `Engine/Shaders/Private/BRDF.ush`

### BRDF Context

```hlsl
struct BxDFContext
{
    float NoV;  // Normal · View
    float NoL;  // Normal · Light
    float VoL;  // View · Light
    float NoH;  // Normal · Half
    float VoH;  // View · Half

    // For anisotropic materials
    float XoV, XoL, XoH;  // Tangent dot products
    float YoV, YoL, YoH;  // Bitangent dot products
};

BxDFContext Init(float3 N, float3 V, float3 L)
{
    BxDFContext Context;
    Context.NoV = saturate(dot(N, V));
    Context.NoL = saturate(dot(N, L));
    Context.VoL = dot(V, L);

    float3 H = normalize(V + L);
    Context.NoH = saturate(dot(N, H));
    Context.VoH = saturate(dot(V, H));

    return Context;
}
```

### Diffuse BRDF

```hlsl
// Lambert (simplest, cheapest)
float3 Diffuse_Lambert(float3 DiffuseColor)
{
    return DiffuseColor * (1.0 / PI);
}

// Disney's Burley (more realistic, retro-reflection)
float3 Diffuse_Burley(float3 DiffuseColor, float Roughness, float NoV, float NoL, float VoH)
{
    float FD90 = 0.5 + 2.0 * VoH * VoH * Roughness;
    float FdV = 1.0 + (FD90 - 1.0) * Pow5(1.0 - NoV);
    float FdL = 1.0 + (FD90 - 1.0) * Pow5(1.0 - NoL);
    return DiffuseColor * ((1.0 / PI) * FdV * FdL);
}

// UE5 default for rough surfaces
float3 Diffuse_GGX_Rough(float3 DiffuseColor, float Roughness, float NoV, float NoL, float VoH, float NoH)
{
    // More complex, accounts for microfacet multiple scattering
    // See BRDF.ush line 128
}
```

### Specular BRDF (GGX Microfacet)

Complete GGX BRDF:
```
f_specular = (D * G * F) / (4 * NoV * NoL)

Where:
  D = Normal Distribution Function (GGX/Trowbridge-Reitz)
  G = Geometric Shadowing/Masking (Smith)
  F = Fresnel (Schlick approximation)
```

**Normal Distribution (D):**
```hlsl
// GGX / Trowbridge-Reitz
float D_GGX(float Roughness, float NoH)
{
    float a = Roughness * Roughness;
    float a2 = a * a;
    float d = (NoH * a2 - NoH) * NoH + 1.0;
    return a2 / (PI * d * d);
}

// Anisotropic GGX
float D_GGXaniso(float RoughnessX, float RoughnessY, float NoH, float XoH, float YoH)
{
    float ax = RoughnessX * RoughnessX;
    float ay = RoughnessY * RoughnessY;
    float a2 = ax * ay;
    float3 V = float3(ay * XoH, ax * YoH, a2 * NoH);
    float S = dot(V, V);
    return (1.0 / PI) * a2 * Square(a2 / S);
}
```

**Visibility/Geometry (G, split into V):**
```hlsl
// Smith Joint Approximation (Height-Correlated)
float Vis_SmithJointApprox(float Roughness, float NoV, float NoL)
{
    float a = Roughness * Roughness;
    float Vis_SmithV = NoL * (NoV * (1.0 - a) + a);
    float Vis_SmithL = NoV * (NoL * (1.0 - a) + a);
    return 0.5 * rcp(Vis_SmithV + Vis_SmithL);
    // Note: Includes 1/(4*NoV*NoL) from BRDF denominator
}

// Anisotropic Visibility
float Vis_SmithJointAniso(float ax, float ay, float NoV, float NoL,
                          float XoV, float XoL, float YoV, float YoL)
{
    // More complex, see BRDF.ush line 258
}
```

**Fresnel (F):**
```hlsl
// Schlick approximation
float3 F_Schlick(float3 SpecularColor, float VoH)
{
    float Fc = Pow5(1.0 - VoH);
    return Fc + (1.0 - Fc) * SpecularColor;
}

// With roughness (for environment reflections)
float3 EnvBRDFApprox(float3 SpecularColor, float Roughness, float NoV)
{
    // Pre-integrated environment BRDF
    // Uses lookup texture or analytical approximation
    float4 c0 = float4(-1.0, -0.0275, -0.572, 0.022);
    float4 c1 = float4(1.0, 0.0425, 1.04, -0.04);
    float4 r = Roughness * c0 + c1;
    float a004 = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
    float2 AB = float2(-1.04, 1.04) * a004 + r.zw;
    return SpecularColor * AB.x + AB.y;
}
```

### Complete Default Lit Shading

```hlsl
float3 StandardShading(FGBufferData GBuffer, float3 L, float3 V, float3 N, float3 LightColor)
{
    // Setup context
    BxDFContext Context = Init(N, V, L);

    // Derived properties
    float3 DiffuseColor = GBuffer.BaseColor * (1.0 - GBuffer.Metallic);
    float3 SpecularColor = lerp(0.04, GBuffer.BaseColor, GBuffer.Metallic);
    float Roughness = max(GBuffer.Roughness, 0.02); // Clamp min

    // Diffuse
    float3 Diffuse = Diffuse_Burley(DiffuseColor, Roughness,
                                     Context.NoV, Context.NoL, Context.VoH);

    // Specular
    float D = D_GGX(Roughness, Context.NoH);
    float Vis = Vis_SmithJointApprox(Roughness, Context.NoV, Context.NoL);
    float3 F = F_Schlick(SpecularColor, Context.VoH);
    float3 Specular = (D * Vis) * F;

    // Combine
    float3 Lighting = (Diffuse + Specular) * LightColor * Context.NoL;

    return Lighting;
}
```

### For Your Engine

Implement this exact BRDF for physically-accurate results:

```glsl
// GLSL version for bgfx
vec3 StandardBRDF(vec3 N, vec3 V, vec3 L,
                  vec3 baseColor, float metallic, float roughness)
{
    vec3 H = normalize(V + L);

    float NoV = max(dot(N, V), 0.0);
    float NoL = max(dot(N, L), 0.0);
    float NoH = max(dot(N, H), 0.0);
    float VoH = max(dot(V, H), 0.0);

    // Derive colors
    vec3 diffuseColor = baseColor * (1.0 - metallic);
    vec3 specularColor = mix(vec3(0.04), baseColor, metallic);

    // Diffuse: Burley
    float FD90 = 0.5 + 2.0 * VoH * VoH * roughness;
    float FdV = 1.0 + (FD90 - 1.0) * pow(1.0 - NoV, 5.0);
    float FdL = 1.0 + (FD90 - 1.0) * pow(1.0 - NoL, 5.0);
    vec3 diffuse = diffuseColor * (1.0 / 3.14159) * FdV * FdL;

    // Specular: GGX
    float a = roughness * roughness;
    float a2 = a * a;

    // D
    float denom = (NoH * a2 - NoH) * NoH + 1.0;
    float D = a2 / (3.14159 * denom * denom);

    // Vis (includes G/4*NoV*NoL)
    float k = a * 0.5;
    float vis = 0.5 / ((NoL * (NoV * (1.0 - k) + k) +
                        NoV * (NoL * (1.0 - k) + k)));

    // F
    float Fc = pow(1.0 - VoH, 5.0);
    vec3 F = specularColor + (1.0 - specularColor) * Fc;

    vec3 specular = D * vis * F;

    return (diffuse + specular) * NoL;
}
```

---

## Shading Models

UE5 supports multiple shading models beyond standard PBR.

**Key File:** `Engine/Shaders/Private/ShadingModels.ush`

### 1. Default Lit (Standard PBR)

Already covered in BRDF section. This is your baseline.

### 2. Subsurface Scattering

For skin, wax, marble, etc.

```hlsl
FDirectLighting SubsurfaceBxDF(FGBufferData GBuffer, float3 N, float3 V, float3 L)
{
    // Front lighting (standard)
    BxDFContext Context = Init(N, V, L);

    // Dual specular lobes for skin
    float Lobe0Roughness = max(GBuffer.Roughness, 0.02);
    float Lobe1Roughness = max(GBuffer.Roughness * 0.5, 0.02);

    float D0 = D_GGX(Lobe0Roughness, Context.NoH);
    float D1 = D_GGX(Lobe1Roughness, Context.NoH);
    float D = lerp(D0, D1, 0.5);

    // Rest is same as DefaultLit but with dual lobe

    // Transmission (back lighting)
    float BackNoL = max(0, -dot(N, L));
    float3 Transmission = GBuffer.SubsurfaceColor * BackNoL;

    Lighting.Diffuse = FrontDiffuse;
    Lighting.Specular = FrontSpecular;
    Lighting.Transmission = Transmission;

    return Lighting;
}
```

**CustomData for Subsurface:**
```hlsl
// In pixel shader:
GBuffer.CustomData.rgb = EncodeSubsurfaceColor(SubsurfaceColor);
GBuffer.CustomData.a = Opacity;

// In lighting shader:
float3 SubsurfaceColor = DecodeSubsurfaceColor(GBuffer.CustomData.rgb);
float Opacity = GBuffer.CustomData.a;
```

### 3. Clear Coat

For car paint, plastic coatings, lacquered wood.

```hlsl
FDirectLighting ClearCoatBxDF(FGBufferData GBuffer, float3 N, float3 V, float3 L)
{
    // Two layers: coat (on top) + base (underneath)

    float ClearCoat = GBuffer.CustomData.x;
    float ClearCoatRoughness = GBuffer.CustomData.y;

    // Top coat layer (fixed IOR = 1.5, F0 = 0.04)
    BxDFContext CoatContext = Init(N, V, L);

    float D_Coat = D_GGX(ClearCoatRoughness, CoatContext.NoH);
    float Vis_Coat = Vis_SmithJointApprox(ClearCoatRoughness,
                                          CoatContext.NoV, CoatContext.NoL);
    float F_Coat = F_Schlick(0.04, CoatContext.VoH);

    float3 CoatSpec = ClearCoat * (D_Coat * Vis_Coat * F_Coat);

    // Base layer (attenuated by coat transmission)
    float3 FresnelTransmission = (1.0 - F_Coat) * (1.0 - F_Coat);

    // Refract V and L through coat (simplified: use original)
    float3 BaseDiffuse = Diffuse_Lambert(GBuffer.DiffuseColor);

    float D_Base = D_GGX(GBuffer.Roughness, CoatContext.NoH);
    float Vis_Base = Vis_SmithJointApprox(GBuffer.Roughness,
                                          CoatContext.NoV, CoatContext.NoL);
    float3 F_Base = F_Schlick(GBuffer.SpecularColor, CoatContext.VoH);
    float3 BaseSpec = (D_Base * Vis_Base) * F_Base;

    Lighting.Diffuse = FresnelTransmission * BaseDiffuse;
    Lighting.Specular = CoatSpec + FresnelTransmission * BaseSpec;

    return Lighting;
}
```

### 4. Two-Sided Foliage

For leaves, plants.

```hlsl
FDirectLighting TwoSidedFoliageBxDF(FGBufferData GBuffer, float3 N, float3 V, float3 L)
{
    // Front side: standard lighting
    float NoL = saturate(dot(N, L));
    float3 FrontLighting = StandardShading(...) * NoL;

    // Back side: wrapped diffuse + subsurface
    float Wrap = 0.5; // Adjustable
    float BackNoL = saturate((-dot(N, L) + Wrap) / Square(1.0 + Wrap));

    float3 BackLighting = GBuffer.SubsurfaceColor * BackNoL;

    Lighting.Diffuse = GBuffer.DiffuseColor * (FrontLighting + BackLighting);
    Lighting.Specular = FrontSpecular;

    return Lighting;
}
```

### 5. Cloth

For fabric, velvet.

```hlsl
FDirectLighting ClothBxDF(FGBufferData GBuffer, float3 N, float3 V, float3 L)
{
    // Two specular lobes:
    // 1. Standard GGX for base
    // 2. Inverted GGX for fuzz/fabric sheen

    BxDFContext Context = Init(N, V, L);

    // Base specular
    float D1 = D_GGX(GBuffer.Roughness, Context.NoH);
    float Vis1 = Vis_Cloth(Context.NoV, Context.NoL); // Modified visibility
    float3 F1 = F_Schlick(GBuffer.SpecularColor, Context.VoH);
    float3 Spec1 = (D1 * Vis1) * F1;

    // Fuzz specular (inverted GGX)
    float D2 = D_InvGGX(Pow4(GBuffer.Roughness), Context.NoH);
    float Vis2 = Vis_Cloth(Context.NoV, Context.NoL);
    float3 FuzzColor = GBuffer.CustomData.rgb;
    float3 F2 = F_Schlick(FuzzColor, Context.VoH);
    float3 Spec2 = (D2 * Vis2) * F2;

    float Cloth = GBuffer.CustomData.a;

    Lighting.Specular = lerp(Spec1, Spec2, Cloth);
    Lighting.Diffuse = Diffuse_Lambert(GBuffer.DiffuseColor);

    return Lighting;
}
```

### Shading Model Selection

In your lighting pass:

```hlsl
// Read shading model from GBuffer
uint ShadingModel = GBuffer.ShadingModelID;

// Dispatch to appropriate function
float3 Lighting;
switch (ShadingModel)
{
    case SHADINGMODELID_DEFAULT_LIT:
        Lighting = DefaultLitBxDF(GBuffer, N, V, L);
        break;

    case SHADINGMODELID_SUBSURFACE:
        Lighting = SubsurfaceBxDF(GBuffer, N, V, L);
        break;

    case SHADINGMODELID_CLEAR_COAT:
        Lighting = ClearCoatBxDF(GBuffer, N, V, L);
        break;

    case SHADINGMODELID_TWOSIDED_FOLIAGE:
        Lighting = TwoSidedFoliageBxDF(GBuffer, N, V, L);
        break;

    case SHADINGMODELID_CLOTH:
        Lighting = ClothBxDF(GBuffer, N, V, L);
        break;

    default:
        Lighting = DefaultLitBxDF(GBuffer, N, V, L);
        break;
}
```

---

## MaterialX Integration Strategy

MaterialX is an open standard for material description, perfect for your engine.

### MaterialX to Engine Pipeline

```
MaterialX Document (.mtlx)
    ↓
[Parse] MaterialXCore library
    ↓
[Analyze] Build node graph, determine outputs
    ↓
[Generate] Translate to GLSL/HLSL for bgfx
    ↓
[Compile] bgfx shader compilation
    ↓
[Runtime] Bind parameters, render
```

### MaterialX Standard Surface Mapping

MaterialX `<standard_surface>` node maps to UE5 materials:

```xml
<!-- MaterialX example -->
<standard_surface name="MyMaterial" type="surfaceshader">
  <input name="base" type="float" value="1.0" />
  <input name="base_color" type="color3" value="0.8, 0.8, 0.8" />
  <input name="metalness" type="float" value="0.0" />
  <input name="specular" type="float" value="0.5" />
  <input name="specular_roughness" type="float" value="0.3" />
  <input name="specular_IOR" type="float" value="1.5" />
  <input name="normal" type="vector3" nodename="normal_map" />
  <input name="coat" type="float" value="0.0" />
  <input name="emission" type="float" value="0.0" />
  <input name="emission_color" type="color3" value="0, 0, 0" />
</standard_surface>
```

Translation to your engine:
```cpp
struct Material
{
    vec3 baseColor;         // base * base_color
    float metallic;         // metalness
    float roughness;        // specular_roughness
    float specular;         // specular
    vec3 normal;            // normal (tangent space)
    float clearCoat;        // coat
    float clearCoatRough;   // coat_roughness
    vec3 emissive;          // emission * emission_color
    float opacity;          // opacity (for translucent)
};
```

### Code Generation from MaterialX

```cpp
class MaterialXCodeGen
{
public:
    std::string GenerateShader(MaterialX::DocumentPtr doc)
    {
        // 1. Find shader nodes
        auto shaderNodes = MaterialX::findRenderableElements(doc);

        for (auto node : shaderNodes)
        {
            if (node->getCategory() == "standard_surface")
            {
                return GenerateStandardSurface(node);
            }
        }
    }

private:
    std::string GenerateStandardSurface(MaterialX::NodePtr node)
    {
        std::stringstream code;

        // Header
        code << "// Generated from MaterialX\n";
        code << "#include \"common.sh\"\n\n";

        // Parameters
        code << "// Material Parameters\n";
        for (auto input : node->getInputs())
        {
            code << GenerateParameter(input);
        }

        // Main function
        code << "void main()\n{\n";
        code << "    // Sample inputs\n";

        // For each connected input, generate sampling code
        auto baseColorInput = node->getInput("base_color");
        if (baseColorInput->getConnectedNode())
        {
            // It's connected to a texture or node
            code << "    vec3 baseColor = "
                 << GenerateNodeCode(baseColorInput->getConnectedNode())
                 << ";\n";
        }
        else
        {
            // It's a constant
            auto value = baseColorInput->getValue();
            code << "    vec3 baseColor = vec3" << ValueToString(value) << ";\n";
        }

        // ... repeat for all inputs

        // Write to GBuffer
        code << "    // Write GBuffer\n";
        code << "    gl_FragData[0] = vec4(baseColor, 1.0);\n";
        code << "    gl_FragData[1] = vec4(encodeNormal(normal), roughness, metallic);\n";
        code << "}\n";

        return code.str();
    }
};
```

### Parameter Binding with LUA

You mentioned using LUA - perfect for dynamic parameter control:

```lua
-- material_config.lua
material = {
    name = "MyPBRMaterial",
    materialx = "materials/pbr_metal.mtlx",

    parameters = {
        baseColor = {1.0, 0.8, 0.6},
        metallic = 1.0,
        roughness = 0.3,

        textures = {
            baseColorMap = "textures/metal_albedo.png",
            normalMap = "textures/metal_normal.png",
            roughnessMap = "textures/metal_roughness.png"
        }
    },

    shadingModel = "DefaultLit",
    blendMode = "Opaque"
}
```

C++ integration:
```cpp
class MaterialInstance
{
    bgfx::ProgramHandle shader;
    bgfx::UniformHandle u_baseColor;
    bgfx::UniformHandle u_roughness;
    bgfx::UniformHandle u_metallic;

    std::map<std::string, bgfx::TextureHandle> textures;

    void LoadFromLua(lua_State* L, const char* scriptPath)
    {
        // Load LUA script
        luaL_dofile(L, scriptPath);

        // Get material table
        lua_getglobal(L, "material");

        // Read parameters
        lua_getfield(L, -1, "parameters");
        {
            // baseColor
            lua_getfield(L, -1, "baseColor");
            params.baseColor = ReadVec3(L);
            lua_pop(L, 1);

            // metallic
            lua_getfield(L, -1, "metallic");
            params.metallic = lua_tonumber(L, -1);
            lua_pop(L, 1);

            // Textures
            lua_getfield(L, -1, "textures");
            {
                lua_getfield(L, -1, "baseColorMap");
                const char* path = lua_tostring(L, -1);
                textures["baseColorMap"] = LoadTexture(path);
                lua_pop(L, 1);
            }
            lua_pop(L, 1);
        }
        lua_pop(L, 1);
    }

    void Bind()
    {
        bgfx::setUniform(u_baseColor, &params.baseColor);
        bgfx::setUniform(u_roughness, &params.roughness);
        bgfx::setUniform(u_metallic, &params.metallic);

        for (auto& [name, texture] : textures)
        {
            uint8_t stage = GetTextureStage(name);
            bgfx::setTexture(stage, GetSamplerHandle(name), texture);
        }
    }
};
```

### JSON Metadata for Workflow

```json
{
  "material": {
    "name": "PBR_Metal",
    "version": "1.0",
    "materialx_source": "materials/pbr_metal.mtlx",

    "properties": {
      "shadingModel": "DefaultLit",
      "blendMode": "Opaque",
      "twoSided": false,
      "castsShadows": true
    },

    "parameters": {
      "baseColor": {
        "type": "color",
        "default": [0.8, 0.8, 0.8],
        "ui": {
          "displayName": "Base Color",
          "group": "Surface"
        }
      },
      "roughness": {
        "type": "scalar",
        "default": 0.5,
        "range": [0.0, 1.0],
        "ui": {
          "displayName": "Roughness",
          "group": "Surface"
        }
      }
    },

    "textures": {
      "baseColorMap": {
        "type": "texture2d",
        "default": "textures/default_white.png",
        "srgb": true
      },
      "normalMap": {
        "type": "texture2d",
        "default": "textures/default_normal.png",
        "srgb": false
      }
    },

    "workflow": {
      "editor": "MaterialX Graph Editor",
      "exportFormats": ["mtlx", "glsl", "hlsl"],
      "preprocessSteps": ["validate", "optimize", "compile"]
    }
  }
}
```

---

## bgfx Implementation Guide

bgfx is an excellent choice for cross-platform rendering.

### GBuffer Pass with bgfx

```cpp
// Setup GBuffer framebuffer
class GBufferRenderer
{
    bgfx::FrameBufferHandle gbufferFB;
    bgfx::TextureHandle gbufferTextures[4];

    void Init(uint16_t width, uint16_t height)
    {
        // RT0: Base Color + AO
        gbufferTextures[0] = bgfx::createTexture2D(
            width, height, false, 1,
            bgfx::TextureFormat::RGBA8,
            BGFX_TEXTURE_RT | BGFX_SAMPLER_U_CLAMP | BGFX_SAMPLER_V_CLAMP
        );

        // RT1: Normal (octahedron) + Roughness + Metallic
        gbufferTextures[1] = bgfx::createTexture2D(
            width, height, false, 1,
            bgfx::TextureFormat::RGBA8,
            BGFX_TEXTURE_RT | BGFX_SAMPLER_U_CLAMP | BGFX_SAMPLER_V_CLAMP
        );

        // RT2: Emissive + Specular
        gbufferTextures[2] = bgfx::createTexture2D(
            width, height, false, 1,
            bgfx::TextureFormat::RGBA16F,
            BGFX_TEXTURE_RT | BGFX_SAMPLER_U_CLAMP | BGFX_SAMPLER_V_CLAMP
        );

        // RT3: Custom Data (shading model specific)
        gbufferTextures[3] = bgfx::createTexture2D(
            width, height, false, 1,
            bgfx::TextureFormat::RGBA8,
            BGFX_TEXTURE_RT | BGFX_SAMPLER_U_CLAMP | BGFX_SAMPLER_V_CLAMP
        );

        // Depth buffer
        bgfx::TextureHandle depthTexture = bgfx::createTexture2D(
            width, height, false, 1,
            bgfx::TextureFormat::D24S8,
            BGFX_TEXTURE_RT
        );

        // Create framebuffer with all attachments
        bgfx::Attachment attachments[5];
        for (int i = 0; i < 4; ++i) {
            attachments[i].init(gbufferTextures[i]);
        }
        attachments[4].init(depthTexture);

        gbufferFB = bgfx::createFrameBuffer(5, attachments, false);
    }

    void RenderGBuffer(const std::vector<RenderObject>& objects)
    {
        // Set GBuffer as render target
        bgfx::setViewFrameBuffer(VIEW_GBUFFER, gbufferFB);
        bgfx::setViewClear(VIEW_GBUFFER,
                          BGFX_CLEAR_COLOR | BGFX_CLEAR_DEPTH,
                          0x000000ff, 1.0f, 0);

        // Set viewport
        bgfx::setViewRect(VIEW_GBUFFER, 0, 0, width, height);

        // Render each object
        for (const auto& obj : objects)
        {
            // Set transform
            bgfx::setTransform(obj.transform);

            // Set vertex/index buffers
            bgfx::setVertexBuffer(0, obj.vertexBuffer);
            bgfx::setIndexBuffer(obj.indexBuffer);

            // Bind material parameters
            obj.material->Bind();

            // Set render state
            uint64_t state = BGFX_STATE_WRITE_RGB
                           | BGFX_STATE_WRITE_A
                           | BGFX_STATE_WRITE_Z
                           | BGFX_STATE_DEPTH_TEST_LESS
                           | BGFX_STATE_MSAA;

            bgfx::setState(state);

            // Submit draw call
            bgfx::submit(VIEW_GBUFFER, obj.material->GetShader());
        }
    }
};
```

### Lighting Pass with bgfx

```cpp
class DeferredLightingRenderer
{
    bgfx::ProgramHandle lightingShader;
    bgfx::UniformHandle s_gbuffer0;
    bgfx::UniformHandle s_gbuffer1;
    bgfx::UniformHandle s_gbuffer2;
    bgfx::UniformHandle s_gbuffer3;
    bgfx::UniformHandle s_depth;

    void RenderLighting(GBufferRenderer& gbuffer)
    {
        // Bind GBuffer textures
        bgfx::setTexture(0, s_gbuffer0, gbuffer.GetTexture(0));
        bgfx::setTexture(1, s_gbuffer1, gbuffer.GetTexture(1));
        bgfx::setTexture(2, s_gbuffer2, gbuffer.GetTexture(2));
        bgfx::setTexture(3, s_gbuffer3, gbuffer.GetTexture(3));
        bgfx::setTexture(4, s_depth, gbuffer.GetDepthTexture());

        // Bind lighting parameters
        bgfx::setUniform(u_lightDirection, &lightDir);
        bgfx::setUniform(u_lightColor, &lightColor);
        bgfx::setUniform(u_cameraPosition, &cameraPos);

        // Fullscreen quad
        screenSpaceQuad(width, height);

        // Render state
        uint64_t state = BGFX_STATE_WRITE_RGB
                       | BGFX_STATE_WRITE_A
                       | BGFX_STATE_DEPTH_TEST_EQUAL;

        bgfx::setState(state);

        // Submit
        bgfx::submit(VIEW_LIGHTING, lightingShader);
    }
};
```

### Material Shader (GLSL for bgfx)

```glsl
// vs_material.sc (Vertex Shader)
$input a_position, a_normal, a_tangent, a_texcoord0
$output v_worldPos, v_normal, v_tangent, v_bitangent, v_texcoord0

#include <bgfx_shader.sh>

uniform mat4 u_model;

void main()
{
    vec4 worldPos = mul(u_model, vec4(a_position, 1.0));
    v_worldPos = worldPos.xyz;

    v_normal = mul(u_model, vec4(a_normal, 0.0)).xyz;
    v_tangent = mul(u_model, vec4(a_tangent.xyz, 0.0)).xyz;
    v_bitangent = cross(v_normal, v_tangent) * a_tangent.w;

    v_texcoord0 = a_texcoord0;

    gl_Position = mul(u_viewProj, worldPos);
}
```

```glsl
// fs_material.sc (Fragment Shader - GBuffer output)
$input v_worldPos, v_normal, v_tangent, v_bitangent, v_texcoord0

#include <bgfx_shader.sh>

// Material parameters
uniform vec4 u_baseColor;
uniform vec4 u_materialParams; // x=roughness, y=metallic, z=specular, w=ao

// Textures
SAMPLER2D(s_baseColorMap, 0);
SAMPLER2D(s_normalMap, 1);
SAMPLER2D(s_roughnessMap, 2);

// GBuffer outputs
layout(location = 0) out vec4 gbuffer0; // BaseColor + AO
layout(location = 1) out vec4 gbuffer1; // Normal + Roughness + Metallic
layout(location = 2) out vec4 gbuffer2; // Emissive + Specular
layout(location = 3) out vec4 gbuffer3; // CustomData

// Helper: Encode normal (octahedron)
vec2 encodeNormal(vec3 n)
{
    n /= (abs(n.x) + abs(n.y) + abs(n.z));
    vec2 p = n.z >= 0.0 ? n.xy : (1.0 - abs(n.yx)) * sign(n.xy);
    return p * 0.5 + 0.5;
}

void main()
{
    // Sample textures
    vec3 baseColor = texture2D(s_baseColorMap, v_texcoord0).rgb * u_baseColor.rgb;
    float roughness = texture2D(s_roughnessMap, v_texcoord0).r * u_materialParams.x;
    float metallic = u_materialParams.y;
    float specular = u_materialParams.z;
    float ao = u_materialParams.w;

    // Sample and transform normal
    vec3 tangentNormal = texture2D(s_normalMap, v_texcoord0).xyz * 2.0 - 1.0;
    mat3 TBN = mat3(normalize(v_tangent),
                     normalize(v_bitangent),
                     normalize(v_normal));
    vec3 worldNormal = normalize(TBN * tangentNormal);

    // Encode to GBuffer
    gbuffer0 = vec4(baseColor, ao);
    gbuffer1 = vec4(encodeNormal(worldNormal), roughness, metallic);
    gbuffer2 = vec4(0.0, 0.0, 0.0, specular); // No emissive
    gbuffer3 = vec4(0.0); // No custom data for DefaultLit
}
```

---

## Key Files Reference

### C++ Source Files

**Material System:**
- `Engine/Source/Runtime/Engine/Public/Materials/Material.h` - UMaterial class
- `Engine/Source/Runtime/Engine/Public/MaterialShared.h` - Runtime material types
- `Engine/Source/Runtime/Engine/Private/Materials/HLSLMaterialTranslator.cpp` - Code generation (695KB)
- `Engine/Source/Runtime/Engine/Private/Materials/MaterialExpressions.cpp` - Node implementations (16,000 lines)
- `Engine/Source/Runtime/Renderer/Public/MaterialShader.h` - Material shader base class
- `Engine/Source/Runtime/Engine/Public/MaterialShaderType.h` - Shader type system

**Shading and BRDF:**
- `Engine/Source/Runtime/Renderer/Private/BasePassRendering.cpp` - GBuffer generation
- `Engine/Source/Runtime/Renderer/Private/LightRendering.cpp` - Deferred lighting

### Shader Files

**Material Shaders:**
- `Engine/Shaders/Private/MaterialTemplate.ush` - Main template
- `Engine/Shaders/Private/BRDF.ush` - BRDF functions (D, G, F)
- `Engine/Shaders/Private/ShadingModels.ush` - Shading model implementations
- `Engine/Shaders/Private/ShadingModelsMaterial.ush` - Material-side shading model code

**GBuffer and Deferred:**
- `Engine/Shaders/Private/DeferredShadingCommon.ush` - GBuffer structure and encoding
- `Engine/Shaders/Private/DeferredLightingCommon.ush` - Lighting calculations

**Utilities:**
- `Engine/Shaders/Private/Common.ush` - Common utilities (normal encoding, etc.)

---

## Summary

**For Your MaterialX + bgfx Engine:**

1. **Material Definition**: Use MaterialX for artist-friendly material authoring
2. **Code Generation**: Translate MaterialX graphs to GLSL/HLSL for bgfx
3. **GBuffer Design**: Start with 3-4 render targets (BaseColor, Normal/Material, Emissive, CustomData)
4. **BRDF**: Implement GGX microfacet BRDF exactly as UE5 does
5. **Shading Models**: Start with DefaultLit, add Subsurface/ClearCoat as needed
6. **Permutations**: Use hybrid approach (static for major features, dynamic for minor)
7. **Parameters**: Use LUA for material instances, JSON for metadata/workflow
8. **bgfx Integration**: Use MRT framebuffers for GBuffer, compute shaders for post-processing

The UE5 material system is battle-tested on thousands of shipped games. Following its architecture will give you a solid, extensible foundation.
