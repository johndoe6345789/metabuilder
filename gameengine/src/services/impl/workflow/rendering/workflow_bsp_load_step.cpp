#include "services/interfaces/workflow/rendering/workflow_bsp_load_step.hpp"
#include "services/interfaces/workflow/workflow_step_parameter_resolver.hpp"

#include <SDL3/SDL_gpu.h>
#include <btBulletDynamicsCommon.h>
#include <nlohmann/json.hpp>
#include <zip.h>
#include <cstring>
#include <cmath>
#include <fstream>
#include <stdexcept>
#include <vector>
#include <string>
#include <algorithm>

namespace sdl3cpp::services::impl {

// Q3 BSP file format structures
#pragma pack(push, 1)

struct BspHeader {
    char magic[4];    // "IBSP"
    int32_t version;  // 0x2E (46) for Q3
};

struct BspLump {
    int32_t offset;
    int32_t length;
};

// Lump indices
enum {
    LUMP_ENTITIES = 0,
    LUMP_TEXTURES = 1,
    LUMP_PLANES = 2,
    LUMP_NODES = 3,
    LUMP_LEAFS = 4,
    LUMP_LEAFFACES = 5,
    LUMP_LEAFBRUSHES = 6,
    LUMP_MODELS = 7,
    LUMP_BRUSHES = 8,
    LUMP_BRUSHSIDES = 9,
    LUMP_VERTICES = 10,
    LUMP_MESHVERTS = 11,
    LUMP_EFFECTS = 12,
    LUMP_FACES = 13,
    LUMP_LIGHTMAPS = 14,
    LUMP_LIGHTVOLS = 15,
    LUMP_VISDATA = 16,
    NUM_LUMPS = 17
};

struct BspVertex {
    float position[3];
    float texcoord[2][2];  // [0]=surface, [1]=lightmap
    float normal[3];
    uint8_t color[4];
};

struct BspFace {
    int32_t texture;
    int32_t effect;
    int32_t type;          // 1=polygon, 2=patch, 3=mesh, 4=billboard
    int32_t vertex;
    int32_t n_vertices;
    int32_t meshvert;
    int32_t n_meshverts;
    int32_t lm_index;
    int32_t lm_start[2];
    int32_t lm_size[2];
    float lm_origin[3];
    float lm_vecs[2][3];
    float normal[3];
    int32_t size[2];       // patch dimensions
};

struct BspTexture {
    char name[64];
    int32_t flags;
    int32_t contents;
};

#pragma pack(pop)

WorkflowBspLoadStep::WorkflowBspLoadStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowBspLoadStep::GetPluginId() const {
    return "bsp.load";
}

void WorkflowBspLoadStep::Execute(const WorkflowStepDefinition& step, WorkflowContext& context) {
    WorkflowStepParameterResolver params;

    auto getStr = [&](const char* name, const std::string& def) -> std::string {
        const auto* p = params.FindParameter(step, name);
        if (p && p->type == WorkflowParameterValue::Type::String) return p->stringValue;
        auto it = step.inputs.find(name);
        if (it != step.inputs.end()) {
            const auto* ctx = context.TryGet<std::string>(it->second);
            if (ctx) return *ctx;
        }
        return def;
    };
    auto getNum = [&](const char* name, float def) -> float {
        const auto* p = params.FindParameter(step, name);
        return (p && p->type == WorkflowParameterValue::Type::Number) ? static_cast<float>(p->numberValue) : def;
    };

    const std::string pk3_path = getStr("pk3_path", "");
    const std::string map_name = getStr("map_name", "q3dm17");
    const float scale = getNum("scale", 1.0f / 32.0f);  // Q3 units to meters (32 units = 1m)

    if (pk3_path.empty()) {
        throw std::runtime_error("bsp.load: 'pk3_path' parameter required");
    }

    SDL_GPUDevice* device = context.Get<SDL_GPUDevice*>("gpu_device", nullptr);
    if (!device) throw std::runtime_error("bsp.load: GPU device not found");

    // Open pk3 (zip) and extract BSP
    int zip_err = 0;
    zip_t* archive = zip_open(pk3_path.c_str(), ZIP_RDONLY, &zip_err);
    if (!archive) {
        throw std::runtime_error("bsp.load: Failed to open pk3: " + pk3_path);
    }

    std::string bsp_entry = "maps/" + map_name + ".bsp";
    zip_stat_t st;
    if (zip_stat(archive, bsp_entry.c_str(), 0, &st) != 0) {
        zip_close(archive);
        throw std::runtime_error("bsp.load: Map '" + bsp_entry + "' not found in " + pk3_path);
    }

    std::vector<uint8_t> bspData(st.size);
    zip_file_t* zf = zip_fopen(archive, bsp_entry.c_str(), 0);
    if (!zf) {
        zip_close(archive);
        throw std::runtime_error("bsp.load: Failed to open " + bsp_entry);
    }
    zip_fread(zf, bspData.data(), st.size);
    zip_fclose(zf);
    zip_close(archive);

    if (logger_) {
        logger_->Info("bsp.load: Read " + bsp_entry + " (" + std::to_string(bspData.size()) + " bytes)");
    }

    // Parse BSP header
    if (bspData.size() < sizeof(BspHeader) + sizeof(BspLump) * NUM_LUMPS) {
        throw std::runtime_error("bsp.load: BSP file too small");
    }

    auto* header = reinterpret_cast<const BspHeader*>(bspData.data());
    if (std::memcmp(header->magic, "IBSP", 4) != 0 || header->version != 46) {
        throw std::runtime_error("bsp.load: Not a valid Q3 BSP (magic/version mismatch)");
    }

    auto* lumps = reinterpret_cast<const BspLump*>(bspData.data() + sizeof(BspHeader));

    // Extract vertices
    const auto& vtxLump = lumps[LUMP_VERTICES];
    int numVertices = vtxLump.length / static_cast<int>(sizeof(BspVertex));
    auto* bspVertices = reinterpret_cast<const BspVertex*>(bspData.data() + vtxLump.offset);

    // Extract faces
    const auto& faceLump = lumps[LUMP_FACES];
    int numFaces = faceLump.length / static_cast<int>(sizeof(BspFace));
    auto* bspFaces = reinterpret_cast<const BspFace*>(bspData.data() + faceLump.offset);

    // Extract mesh vertices (index offsets)
    const auto& mvLump = lumps[LUMP_MESHVERTS];
    int numMeshVerts = mvLump.length / 4;
    auto* meshVerts = reinterpret_cast<const int32_t*>(bspData.data() + mvLump.offset);

    // Extract textures
    const auto& texLump = lumps[LUMP_TEXTURES];
    int numTextures = texLump.length / static_cast<int>(sizeof(BspTexture));
    auto* bspTextures = reinterpret_cast<const BspTexture*>(bspData.data() + texLump.offset);

    // Convert to our vertex format: float3 pos + float2 uv = 20 bytes
    struct PosUvVertex { float x, y, z, u, v; };

    std::vector<PosUvVertex> vertices;
    std::vector<uint16_t> indices;
    vertices.reserve(numVertices);

    // Convert Q3 vertices (swap Y/Z for Q3→OpenGL coordinate system)
    for (int i = 0; i < numVertices; ++i) {
        PosUvVertex v;
        v.x = bspVertices[i].position[0] * scale;
        v.y = bspVertices[i].position[2] * scale;  // Q3 Z-up → Y-up
        v.z = -bspVertices[i].position[1] * scale;  // Q3 Y → -Z
        v.u = bspVertices[i].texcoord[0][0];
        v.v = bspVertices[i].texcoord[0][1];
        vertices.push_back(v);
    }

    // Build indices from faces (type 1=polygon, type 3=mesh - both use meshverts)
    int skippedPatches = 0;
    for (int f = 0; f < numFaces; ++f) {
        const auto& face = bspFaces[f];

        // Skip sky, trigger, clip textures
        if (face.texture >= 0 && face.texture < numTextures) {
            const auto& tex = bspTextures[face.texture];
            if (tex.contents & 0x200000) continue;  // CONTENTS_TRANSLUCENT
            std::string texName(tex.name);
            if (texName.find("sky") != std::string::npos) continue;
            if (texName.find("clip") != std::string::npos) continue;
            if (texName.find("trigger") != std::string::npos) continue;
            if (texName.find("hint") != std::string::npos) continue;
            if (texName.find("caulk") != std::string::npos) continue;
        }

        if (face.type == 1 || face.type == 3) {
            // Polygon or mesh face - use meshvert indices
            for (int mv = 0; mv < face.n_meshverts; ++mv) {
                int idx = face.vertex + meshVerts[face.meshvert + mv];
                if (idx >= 0 && idx < static_cast<int>(vertices.size()) && idx <= 65535) {
                    indices.push_back(static_cast<uint16_t>(idx));
                }
            }
        } else if (face.type == 2) {
            skippedPatches++;
            // TODO: tessellate bezier patches
        }
    }

    if (logger_) {
        logger_->Info("bsp.load: " + std::to_string(numVertices) + " vertices, " +
                     std::to_string(indices.size()) + " indices, " +
                     std::to_string(numFaces) + " faces (" +
                     std::to_string(skippedPatches) + " patches skipped)");
    }

    if (vertices.empty() || indices.empty()) {
        throw std::runtime_error("bsp.load: No renderable geometry found");
    }

    // Upload to GPU as a single mesh
    uint32_t vtxSize = static_cast<uint32_t>(vertices.size() * sizeof(PosUvVertex));
    uint32_t idxSize = static_cast<uint32_t>(indices.size() * sizeof(uint16_t));

    SDL_GPUBufferCreateInfo vbInfo = {};
    vbInfo.usage = SDL_GPU_BUFFERUSAGE_VERTEX;
    vbInfo.size = vtxSize;
    SDL_GPUBuffer* vb = SDL_CreateGPUBuffer(device, &vbInfo);

    SDL_GPUBufferCreateInfo ibInfo = {};
    ibInfo.usage = SDL_GPU_BUFFERUSAGE_INDEX;
    ibInfo.size = idxSize;
    SDL_GPUBuffer* ib = SDL_CreateGPUBuffer(device, &ibInfo);

    SDL_GPUTransferBufferCreateInfo tbInfo = {};
    tbInfo.usage = SDL_GPU_TRANSFERBUFFERUSAGE_UPLOAD;
    tbInfo.size = vtxSize + idxSize;
    SDL_GPUTransferBuffer* tb = SDL_CreateGPUTransferBuffer(device, &tbInfo);

    auto* mapped = static_cast<uint8_t*>(SDL_MapGPUTransferBuffer(device, tb, false));
    std::memcpy(mapped, vertices.data(), vtxSize);
    std::memcpy(mapped + vtxSize, indices.data(), idxSize);
    SDL_UnmapGPUTransferBuffer(device, tb);

    SDL_GPUCommandBuffer* cmd = SDL_AcquireGPUCommandBuffer(device);
    SDL_GPUCopyPass* cp = SDL_BeginGPUCopyPass(cmd);

    SDL_GPUTransferBufferLocation srcV = {}; srcV.transfer_buffer = tb;
    SDL_GPUBufferRegion dstV = {}; dstV.buffer = vb; dstV.size = vtxSize;
    SDL_UploadToGPUBuffer(cp, &srcV, &dstV, false);

    SDL_GPUTransferBufferLocation srcI = {}; srcI.transfer_buffer = tb; srcI.offset = vtxSize;
    SDL_GPUBufferRegion dstI = {}; dstI.buffer = ib; dstI.size = idxSize;
    SDL_UploadToGPUBuffer(cp, &srcI, &dstI, false);

    SDL_EndGPUCopyPass(cp);
    SDL_SubmitGPUCommandBuffer(cmd);
    SDL_ReleaseGPUTransferBuffer(device, tb);

    // Store as map mesh (compatible with draw.map)
    std::string meshName = "bsp_" + map_name;
    context.Set<SDL_GPUBuffer*>("plane_" + meshName + "_vb", vb);
    context.Set<SDL_GPUBuffer*>("plane_" + meshName + "_ib", ib);
    context.Set("plane_" + meshName, nlohmann::json{
        {"vertex_count", vertices.size()},
        {"index_count", indices.size()},
        {"stride", 20}
    });

    // Create Bullet physics triangle mesh from BSP geometry
    auto* world = context.Get<btDiscreteDynamicsWorld*>("physics_world", nullptr);
    if (world) {
        auto* triMesh = new btTriangleMesh();
        for (size_t i = 0; i + 2 < indices.size(); i += 3) {
            const auto& v0 = vertices[indices[i]];
            const auto& v1 = vertices[indices[i + 1]];
            const auto& v2 = vertices[indices[i + 2]];
            triMesh->addTriangle(
                btVector3(v0.x, v0.y, v0.z),
                btVector3(v1.x, v1.y, v1.z),
                btVector3(v2.x, v2.y, v2.z));
        }

        auto* triShape = new btBvhTriangleMeshShape(triMesh, true);
        btTransform startTransform;
        startTransform.setIdentity();
        auto* motionState = new btDefaultMotionState(startTransform);
        btRigidBody::btRigidBodyConstructionInfo rbInfo(0.0f, motionState, triShape);
        auto* body = new btRigidBody(rbInfo);
        world->addRigidBody(body);
        context.Set<btRigidBody*>("physics_body_bsp_" + map_name, body);

        if (logger_) {
            logger_->Info("bsp.load: Created collision mesh (" +
                         std::to_string(triMesh->getNumTriangles()) + " triangles)");
        }
    }

    // Store as map.nodes array for draw.map compatibility
    nlohmann::json mapNodes = nlohmann::json::array();
    mapNodes.push_back({
        {"name", meshName},
        {"index_count", indices.size()}
    });
    context.Set("map.nodes", mapNodes);

    if (logger_) {
        logger_->Info("bsp.load: '" + map_name + "' ready (" +
                     std::to_string(vertices.size()) + " verts, " +
                     std::to_string(indices.size() / 3) + " triangles)");
    }
}

}  // namespace sdl3cpp::services::impl
