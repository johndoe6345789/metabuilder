#pragma once
#include "workflow/wf_step.hpp"
#include <stdexcept>

namespace dbal::workflow::steps {

/**
 * dbal.var.set — Set a context variable from a literal or resolved value.
 * parameters: { "key": "my_var", "value": "hello" }
 * The value is resolved (templates applied) before storing.
 */
class VarSetStep : public IWfStep {
public:
    std::string type() const override { return "dbal.var.set"; }
    void execute(const WfNode& node, WfContext& ctx, dbal::Client&) override {
        auto& p = node.parameters;
        if (!p.contains("key") || !p["key"].is_string())
            throw std::runtime_error("dbal.var.set: missing 'key' parameter");
        std::string key = p["key"].get<std::string>();
        nlohmann::json value = p.value("value", nlohmann::json{});
        ctx.set(key, ctx.resolve(value));
    }
};

} // namespace dbal::workflow::steps
