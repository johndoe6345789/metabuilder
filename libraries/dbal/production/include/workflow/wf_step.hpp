#pragma once
#include <nlohmann/json.hpp>
#include <string>
#include "workflow/wf_context.hpp"
#include "dbal/core/client.hpp"

namespace dbal::workflow {

/**
 * A single node in a workflow definition.
 * Parameters may contain "${var}" template strings resolved before execution.
 * Outputs map step result keys to context variable names.
 *
 * Example:
 *   { "id": "uuid-ns1", "type": "dbal.uuid", "outputs": {"id": "ns_default_id"} }
 *   { "id": "ns-default", "type": "dbal.entity.create",
 *     "parameters": { "entity": "Namespace",
 *                     "data": { "id": "${ns_default_id}", ... } } }
 */
struct WfNode {
    std::string id;
    std::string type;          // step plugin ID, e.g. "dbal.entity.create"
    nlohmann::json parameters; // static config (templates resolved before execute)
    nlohmann::json outputs;    // result wiring: { "result_key": "ctx_var_name" }
};

/**
 * Interface for workflow steps, mirroring the gameengine IWorkflowStep pattern
 * but with nlohmann::json context and direct dbal::Client access.
 */
class IWfStep {
public:
    virtual ~IWfStep() = default;
    virtual std::string type() const = 0;
    // Parameters in node are pre-resolved against ctx before this is called.
    virtual void execute(const WfNode& node, WfContext& ctx, dbal::Client& client) = 0;
};

} // namespace dbal::workflow
