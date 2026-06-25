/**
 * @file create_workflow.hpp
 * @brief Create workflow operation
 */
#ifndef DBAL_CREATE_WORKFLOW_HPP
#define DBAL_CREATE_WORKFLOW_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../../../validation/entity/workflow_validation.hpp"

namespace dbal {
namespace entities {
namespace workflow {

/**
 * Create a new workflow in the store
 */
inline Result<Workflow> create(InMemoryStore& store, const CreateWorkflowInput& input) {
    if (!validation::isValidWorkflowName(input.name)) {
        return Error::validationError("Workflow name must be 1-255 characters");
    }
    if (store.workflow_names.find(input.name) != store.workflow_names.end()) {
        return Error::conflict("Workflow name already exists: " + input.name);
    }

    Workflow workflow;
    workflow.id = store.generateId("workflow", ++store.workflow_counter);
    workflow.tenantId = input.tenantId;
    workflow.name = input.name;
    workflow.description = input.description;
    workflow.nodes = input.nodes;
    workflow.edges = input.edges;
    workflow.enabled = input.enabled;
    workflow.version = input.version;
    workflow.createdAt = input.createdAt.value_or(std::chrono::system_clock::now());
    workflow.updatedAt = input.updatedAt;
    workflow.createdBy = input.createdBy;

    store.workflows[workflow.id] = workflow;
    store.workflow_names[workflow.name] = workflow.id;

    return Result<Workflow>(workflow);
}

} // namespace workflow
} // namespace entities
} // namespace dbal

#endif
