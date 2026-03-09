#pragma once
#include "workflow/wf_step.hpp"
#include <spdlog/spdlog.h>

namespace dbal::workflow::steps {

/**
 * dbal.log — Emit a log message at info level.
 * parameters: { "message": "Created ${event.userId}" }
 * The message is resolved against context before logging.
 */
class LogStep : public IWfStep {
public:
    std::string type() const override { return "dbal.log"; }
    void execute(const WfNode& node, WfContext& ctx, dbal::Client&) override {
        std::string msg = "workflow";
        if (node.parameters.contains("message")) {
            auto m = node.parameters["message"];
            msg = m.is_string() ? ctx.resolveStr(m.get<std::string>()) : m.dump();
        }
        spdlog::info("[workflow] {}", msg);
    }
};

} // namespace dbal::workflow::steps
