#pragma once
#include "workflow/wf_step.hpp"
#include "dbal/core/types.hpp"
#include <stdexcept>

namespace dbal::workflow::steps {

/**
 * dbal.entity.list — List entities with optional filters.
 * parameters: { "entity": "EntityName",
 *               "filter": { "userId": "${event.userId}" },
 *               "limit": 50 }
 * outputs: { "items": "ctx_variable_name" }  (stores array of entity JSON)
 */
class EntityListStep : public IWfStep {
public:
    std::string type() const override { return "dbal.entity.list"; }
    void execute(const WfNode& node, WfContext& ctx, dbal::Client& client) override {
        auto& p = node.parameters;
        if (!p.contains("entity") || !p["entity"].is_string())
            throw std::runtime_error("dbal.entity.list: missing 'entity' parameter");
        std::string entity = p["entity"].get<std::string>();

        ListOptions opts;
        if (p.contains("limit") && p["limit"].is_number())
            opts.limit = p["limit"].get<int>();
        if (p.contains("filter") && p["filter"].is_object()) {
            for (auto& [k, v] : p["filter"].items()) {
                if (v.is_string()) opts.filter[k] = v.get<std::string>();
            }
        }

        auto result = client.listEntities(entity, opts);
        if (!result.isOk())
            throw std::runtime_error("dbal.entity.list [" + entity + "]: " +
                                     std::string(result.error().what()));

        nlohmann::json items = nlohmann::json::array();
        for (auto& item : result.value().items) items.push_back(item);

        if (node.outputs.is_object()) {
            for (auto& [k, v] : node.outputs.items()) {
                if (v.is_string()) ctx.set(v.get<std::string>(), items);
            }
        }
    }
};

} // namespace dbal::workflow::steps
