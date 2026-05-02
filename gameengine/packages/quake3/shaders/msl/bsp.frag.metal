#include <metal_stdlib>
using namespace metal;

struct PBRUniforms {
    float4 u_lightDir;
    float4 u_lightColor;
    float4 u_ambient;
    float4 u_material;
    float4 u_flashPos;
    float4 u_flashDir;
    float4 u_flashColor;
};

struct FragmentInput {
    float4 position [[position]];
    float2 uv;
    float2 lightmapUv;
    float3 worldNormal;
    float3 worldPos;
    float3 cameraPos;
};

fragment float4 main0(
    FragmentInput in [[stage_in]],
    texture2d<float> albedoTex [[texture(0)]],
    sampler albedoSampler [[sampler(0)]],
    texture2d<float> shadowMap [[texture(1)]],
    sampler shadowSampler [[sampler(1)]],
    texture2d<float> lightmapTex [[texture(2)]],
    sampler lightmapSampler [[sampler(2)]],
    constant PBRUniforms& pbr [[buffer(0)]])
{
    (void)shadowMap;
    (void)shadowSampler;
    (void)in.worldNormal;
    (void)in.worldPos;
    (void)in.cameraPos;

    float3 albedo = albedoTex.sample(albedoSampler, in.uv).rgb;
    float3 lightmap = lightmapTex.sample(lightmapSampler, in.lightmapUv).rgb;
    float overbright = (pbr.u_material.z > 0.0) ? pbr.u_material.z : 2.0;
    float3 ambient = pbr.u_ambient.rgb * albedo;
    float exposure = (pbr.u_lightColor.a > 0.0) ? pbr.u_lightColor.a : 1.0;

    return float4((albedo * lightmap * overbright + ambient) * exposure, 1.0);
}
