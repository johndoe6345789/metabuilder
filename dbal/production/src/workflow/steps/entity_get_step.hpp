#pragma once
#include "workflow/wf_step.hpp"
#include <spdlog/spdlog.h>
#include <stdexcept>

namespace dbal::workflow::steps {

/**
 * dbal.entity.get — Fetch a single entity by ID.
 * parameters: { "entity": "EntityName", "id": "entity-uuid-or-${var}" }
 * outputs: { "result": "ctx_variable_name" }
 */
class EntityGetStep : public IWfStep {
public:
    std::string type() const override { return "dbal.entity.get"; }
    void execute(const WfNode& node, WfContext& ctx, dbal::Client& client) override {
        auto& p = node.parameters;
        if (!p.contains("entity") || !p["entity"].is_string())
            throw std::runtime_error("dbal.entity.get: missing 'entity' parameter");
        if (!p.contains("id"))
            throw std::runtime_error("dbal.entity.get: missing 'id' parameter");

        std::string entity = p["entity"].get<std::string>();
        std::string id = p["id"].is_string() ? p["id"].get<std::string>() : p["id"].dump();

        auto result = client.getEntity(entity, id);
        if (!result.isOk())
            throw std::runtime_error("dbal.entity.get [" + entity + "/" + id + "]: " +
                                     std::string(result.error().what()));

        if (node.outputs.is_object()) {
            for (auto& [k, v] : node.outputs.items()) {
                if (v.is_string()) ctx.set(v.get<std::string>(), result.value());
            }
        }
    }
};

} // namespace dbal::workflow::steps
