#pragma once
#include "workflow/wf_step.hpp"
#include <ctime>

namespace dbal::workflow::steps {

/**
 * dbal.timestamp — Store current Unix timestamp in milliseconds.
 * outputs: { "ts": "ctx_variable_name" }
 */
class TimestampStep : public IWfStep {
public:
    std::string type() const override { return "dbal.timestamp"; }
    void execute(const WfNode& node, WfContext& ctx, dbal::Client&) override {
        long long ts = static_cast<long long>(std::time(nullptr)) * 1000LL;
        if (node.outputs.is_object()) {
            for (auto& [k, v] : node.outputs.items()) {
                if (v.is_string()) ctx.set(v.get<std::string>(), ts);
            }
        }
    }
};

} // namespace dbal::workflow::steps
