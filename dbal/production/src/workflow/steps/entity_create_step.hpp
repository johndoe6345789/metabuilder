#pragma once
#include "workflow/wf_step.hpp"
#include <spdlog/spdlog.h>
#include <stdexcept>

namespace dbal::workflow::steps {

/**
 * dbal.entity.create — Create an entity via the DBAL client.
 * parameters: { "entity": "EntityName", "data": { ... } }
 * outputs: { "result": "ctx_variable_name" }  (stores created entity JSON)
 */
class EntityCreateStep : public IWfStep {
public:
    std::string type() const override { return "dbal.entity.create"; }
    void execute(const WfNode& node, WfContext& ctx, dbal::Client& client) override {
        auto& p = node.parameters;
        if (!p.contains("entity") || !p["entity"].is_string())
            throw std::runtime_error("dbal.entity.create: missing 'entity' parameter");
        std::string entity = p["entity"].get<std::string>();
        nlohmann::json data = p.value("data", nlohmann::json::object());

        auto result = client.createEntity(entity, data);
        if (!result.isOk())
            throw std::runtime_error("dbal.entity.create [" + entity + "]: " +
                                     std::string(result.error().what()));

        spdlog::debug("[workflow] created {} id={}", entity,
                      result.value().value("id", std::string("?")));

        if (node.outputs.is_object()) {
            for (auto& [k, v] : node.outputs.items()) {
                if (v.is_string()) ctx.set(v.get<std::string>(), result.value());
            }
        }
    }
};

} // namespace dbal::workflow::steps
