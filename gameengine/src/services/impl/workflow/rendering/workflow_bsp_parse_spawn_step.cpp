#include "services/interfaces/workflow/rendering/workflow_bsp_parse_spawn_step.hpp"
#include "services/interfaces/workflow/rendering/bsp_types.hpp"
#include "services/interfaces/workflow/workflow_step_parameter_resolver.hpp"

#include <nlohmann/json.hpp>
#include <cstdio>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

namespace sdl3cpp::services::impl {

WorkflowBspParseSpawnStep::WorkflowBspParseSpawnStep(std::shared_ptr<ILogger> logger)
    : logger_(std::move(logger)) {}

std::string WorkflowBspParseSpawnStep::GetPluginId() const {
    return "bsp.parse_spawn";
}

void WorkflowBspParseSpawnStep::Execute(const WorkflowStepDefinition& step, WorkflowContext& context) {
    auto bspDataPtr = context.Get<std::shared_ptr<std::vector<uint8_t>>>("bsp_raw_data", nullptr);
    if (!bspDataPtr) throw std::runtime_error("bsp.parse_spawn: bsp_raw_data not in context");

    auto bspConfig = context.Get<nlohmann::json>("bsp_config", nlohmann::json{});
    float scale = bspConfig.value("scale", 1.0f / 32.0f);

    const auto& bspData = *bspDataPtr;
    auto* lumps = reinterpret_cast<const BspLump*>(bspData.data() + sizeof(BspHeader));
    const auto& entLump = lumps[LUMP_ENTITIES];
    std::string entities(reinterpret_cast<const char*>(bspData.data() + entLump.offset), entLump.length);

    float spawnX = 0, spawnY = 5, spawnZ = 0;
    float spawnAngle = 0;

    size_t pos = entities.find("info_player_deathmatch");
    if (pos != std::string::npos) {
        size_t blockStart = entities.rfind('{', pos);
        size_t blockEnd = entities.find('}', pos);
        if (blockStart != std::string::npos && blockEnd != std::string::npos) {
            std::string block = entities.substr(blockStart, blockEnd - blockStart);

            size_t oPos = block.find("\"origin\"");
            if (oPos != std::string::npos) {
                size_t qStart = block.find('"', oPos + 8);
                size_t qEnd = block.find('"', qStart + 1);
                if (qStart != std::string::npos && qEnd != std::string::npos) {
                    std::string origin = block.substr(qStart + 1, qEnd - qStart - 1);
                    float ox = 0, oy = 0, oz = 0;
                    if (std::sscanf(origin.c_str(), "%f %f %f", &ox, &oy, &oz) == 3) {
                        spawnX = ox * scale;
                        spawnY = oz * scale + 1.0f;
                        spawnZ = -oy * scale;
                    }
                }
            }

            size_t aPos = block.find("\"angle\"");
            if (aPos != std::string::npos) {
                size_t qStart = block.find('"', aPos + 7);
                size_t qEnd = block.find('"', qStart + 1);
                if (qStart != std::string::npos && qEnd != std::string::npos) {
                    spawnAngle = std::stof(block.substr(qStart + 1, qEnd - qStart - 1));
                }
            }
        }
    }

    context.Set("bsp.spawn", nlohmann::json{
        {"x", spawnX}, {"y", spawnY}, {"z", spawnZ}, {"angle", spawnAngle}
    });

    if (logger_) {
        logger_->Info("bsp.parse_spawn: Spawn at (" + std::to_string(spawnX) + ", " +
                     std::to_string(spawnY) + ", " + std::to_string(spawnZ) +
                     ") angle=" + std::to_string(spawnAngle));
    }
}

}  // namespace sdl3cpp::services::impl
