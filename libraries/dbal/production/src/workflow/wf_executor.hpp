#pragma once
#include "workflow/wf_context.hpp"
#include "workflow/wf_step.hpp"
#include "dbal/core/client.hpp"
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

namespace dbal::workflow {

class WfExecutor {
public:
    void registerStep(std::shared_ptr<IWfStep> step);

    // Load workflow JSON from file and execute all nodes in array order.
    // Parameters in each node are resolved against ctx before the step runs.
    // Unknown step types are skipped with a warning (same as gameengine executor).
    void execute(const std::string& workflow_path, WfContext& ctx, dbal::Client& client) const;

private:
    std::unordered_map<std::string, std::shared_ptr<IWfStep>> steps_;

    static std::vector<WfNode> loadNodes(const std::string& path);
};

} // namespace dbal::workflow
