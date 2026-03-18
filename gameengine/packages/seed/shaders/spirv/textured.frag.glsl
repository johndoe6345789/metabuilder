#version 450

// PBR Cook-Torrance + Spotlight + Volumetric Light Beam + PCF Shadows
// Outputs linear HDR — tonemapping handled by postfx composite

const float PI = 3.14159265359;

// SDL3 GPU: set=3 for fragment uniform buffers
layout(set = 3, binding = 0) uniform PBRUniforms {
    vec4 u_lightDir;      // xyz = direction (toward scene), w = unused
    vec4 u_lightColor;    // rgb = light color * intensity, a = exposure
    vec4 u_ambient;       // rgb = ambient color * intensity, a = unused
    vec4 u_material;      // x = roughness, y = metallic, zw = unused
    vec4 u_flashPos;      // xyz = position, w = cos(inner cone angle)
    vec4 u_flashDir;      // xyz = direction, w = cos(outer cone angle)
    vec4 u_flashColor;    // rgb = color * intensity, a = range
};

// SDL3 GPU: set=2 for fragment combined image samplers
layout(set = 2, binding = 0) uniform sampler2D albedoTex;
layout(set = 2, binding = 1) uniform sampler2D shadowMap;

layout(location = 0) in vec2 v_uv;
layout(location = 1) in vec3 v_worldNormal;
layout(location = 2) in vec3 v_worldPos;
layout(location = 3) in vec3 v_cameraPos;
layout(location = 4) in vec4 v_shadowPos;

layout(location = 0) out vec4 o_color;

float D_GGX(float NdotH, float roughness) {
    float a  = roughness * roughness;
    float a2 = a * a;
    float d  = NdotH * NdotH * (a2 - 1.0) + 1.0;
    return a2 / (PI * d * d);
}

float G_SchlickGGX(float NdotX, float roughness) {
    float r = roughness + 1.0;
    float k = (r * r) / 8.0;
    return NdotX / (NdotX * (1.0 - k) + k);
}

float G_Smith(float NdotV, float NdotL, float roughness) {
    return G_SchlickGGX(NdotV, roughness) * G_SchlickGGX(NdotL, roughness);
}

vec3 F_Schlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

float ComputeShadowPCF(vec4 shadowPos, float NdotL) {
    vec3 ndc = shadowPos.xyz / shadowPos.w;
    vec2 shadowUV = ndc.xy * 0.5 + 0.5;
    shadowUV.y = 1.0 - shadowUV.y;

    if (shadowUV.x < 0.0 || shadowUV.x > 1.0 || shadowUV.y < 0.0 || shadowUV.y > 1.0)
        return 1.0;

    float currentDepth = ndc.z;
    float bias = max(0.005 * (1.0 - NdotL), 0.001);

    vec2 texelSize = vec2(1.0) / vec2(textureSize(shadowMap, 0));
    float shadow = 0.0;
    for (int y = -2; y <= 2; ++y) {
        for (int x = -2; x <= 2; ++x) {
            vec2 offset = vec2(float(x), float(y)) * texelSize;
            float sampleDepth = texture(shadowMap, shadowUV + offset).r;
            shadow += (currentDepth - bias > sampleDepth) ? 0.0 : 1.0;
        }
    }
    shadow /= 25.0;
    return mix(0.12, 1.0, shadow);
}

// Spotlight cone attenuation
float SpotlightAtten(vec3 lightToFrag, vec3 spotDir, float cosInner, float cosOuter) {
    float cosAngle = dot(normalize(lightToFrag), spotDir);
    return clamp((cosAngle - cosOuter) / max(cosInner - cosOuter, 0.001), 0.0, 1.0);
}

// Volumetric light beam: ray march from camera to surface through spotlight cone
// Simulates light scattering through dust particles in the air
vec3 VolumetricBeam(vec3 camPos, vec3 fragPos, vec3 flashPos, vec3 flashDir,
                    float cosInner, float cosOuter, vec3 flashColor, float flashRange) {
    const int NUM_STEPS = 16;
    const float FOG_DENSITY = 0.007;  // dust density in the air

    vec3 rayDir = fragPos - camPos;
    float rayLen = length(rayDir);
    float stepSize = rayLen / float(NUM_STEPS);

    // Dithered start offset to reduce banding artifacts
    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);

    vec3 accumulated = vec3(0.0);
    for (int i = 0; i < NUM_STEPS; ++i) {
        float t = (float(i) + dither) * stepSize;
        vec3 samplePos = camPos + normalize(rayDir) * t;

        // Check if this point in space is inside the spotlight cone
        vec3 toSample = samplePos - flashPos;
        float dist = length(toSample);

        // Distance attenuation
        float distAtten = clamp(1.0 - dist / flashRange, 0.0, 1.0);
        distAtten *= distAtten;

        // Cone attenuation
        float cosAngle = dot(normalize(toSample), flashDir);
        float coneAtten = clamp((cosAngle - cosOuter) / max(cosInner - cosOuter, 0.001), 0.0, 1.0);

        // Mie-like forward scattering: brighter when looking into the beam
        float viewDot = max(dot(normalize(rayDir), flashDir), 0.0);
        float scatter = mix(1.0, 3.0, viewDot * viewDot);

        accumulated += flashColor * distAtten * coneAtten * scatter * FOG_DENSITY * stepSize;
    }

    return accumulated;
}

void main() {
    vec3 albedo    = texture(albedoTex, v_uv).rgb;
    float roughness = u_material.x;
    float metallic  = u_material.y;
    float exposure  = u_lightColor.a;

    vec3 N = normalize(v_worldNormal);
    vec3 V = normalize(v_cameraPos - v_worldPos);
    float NdotV = max(dot(N, V), 0.001);

    vec3 F0 = mix(vec3(0.04), albedo, metallic);
    vec3 kD_base = (1.0 - metallic) * albedo / PI;

    // === Directional light (sun/fill) ===
    vec3 L = normalize(-u_lightDir.xyz);
    float rawNdotL = dot(N, L);
    float NdotL = max(rawNdotL, 0.0);
    float wrapLight = max(rawNdotL * 0.5 + 0.5, 0.0);

    vec3 H = normalize(V + L);
    float NdotH = max(dot(N, H), 0.0);
    float HdotV = max(dot(H, V), 0.0);

    float D = D_GGX(NdotH, roughness);
    float G = G_Smith(NdotV, NdotL, roughness);
    vec3  F = F_Schlick(HdotV, F0);
    vec3 spec = (D * G * F) / max(4.0 * NdotV * NdotL, 0.001);
    vec3 diff = (vec3(1.0) - F) * kD_base;

    float shadow = ComputeShadowPCF(v_shadowPos, NdotL);
    vec3 Lo = (diff * wrapLight + spec * NdotL) * u_lightColor.rgb * shadow;

    // === Spotlight (flashlight / torch) ===
    float flashRange = u_flashColor.a;
    vec3 volumetric = vec3(0.0);

    if (flashRange > 0.0) {
        vec3 spotDir = normalize(u_flashDir.xyz);

        // Surface lighting from spotlight
        vec3 lightToFrag = v_worldPos - u_flashPos.xyz;
        float dist = length(lightToFrag);
        float atten = clamp(1.0 - dist / flashRange, 0.0, 1.0);
        atten *= atten;

        float spot = SpotlightAtten(lightToFrag, spotDir, u_flashPos.w, u_flashDir.w);

        vec3 Lf = normalize(-lightToFrag);
        float NdotLf = max(dot(N, Lf), 0.0);
        vec3 Hf = normalize(V + Lf);
        float NdotHf = max(dot(N, Hf), 0.0);
        float HdotVf = max(dot(Hf, V), 0.0);

        float Df = D_GGX(NdotHf, roughness);
        float Gf = G_Smith(NdotV, NdotLf, roughness);
        vec3  Ff = F_Schlick(HdotVf, F0);
        vec3 specF = (Df * Gf * Ff) / max(4.0 * NdotV * NdotLf, 0.001);
        vec3 diffF = (vec3(1.0) - Ff) * kD_base;

        Lo += (diffF + specF) * NdotLf * u_flashColor.rgb * atten * spot;

        // Volumetric light beam through dusty air
        volumetric = VolumetricBeam(v_cameraPos, v_worldPos, u_flashPos.xyz,
                                     spotDir, u_flashPos.w, u_flashDir.w,
                                     u_flashColor.rgb, flashRange);
    }

    // === Ambient ===
    vec3 ambient = u_ambient.rgb * albedo;

    // Combine surface + volumetric fog (fog is additive, not affected by surface)
    vec3 color = (Lo + ambient) * exposure + volumetric;
    o_color = vec4(color, 1.0);
}
