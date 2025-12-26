/**
 * @file create_workflow.hpp
 * @brief Create workflow operation
 */
#ifndef DBAL_CREATE_WORKFLOW_HPP
#define DBAL_CREATE_WORKFLOW_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"
#include "../../validation/workflow_validation.hpp"

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
    if (!validation::isValidWorkflowTrigger(input.trigger)) {
        return Error::validationError("Trigger must be one of manual, schedule, event, webhook");
    }
    if (input.created_by.empty()) {
        return Error::validationError("created_by is required");
    }

    if (store.workflow_names.find(input.name) != store.workflow_names.end()) {
        return Error::conflict("Workflow name already exists: " + input.name);
    }

    Workflow workflow;
    workflow.id = store.generateId("workflow", ++store.workflow_counter);
    workflow.name = input.name;
    workflow.description = input.description;
    workflow.trigger = input.trigger;
    workflow.trigger_config = input.trigger_config;
    workflow.steps = input.steps;
    workflow.is_active = input.is_active;
    workflow.created_by = input.created_by;
    workflow.created_at = std::chrono::system_clock::now();
    workflow.updated_at = workflow.created_at;

    store.workflows[workflow.id] = workflow;
    store.workflow_names[workflow.name] = workflow.id;

    return Result<Workflow>(workflow);
}

} // namespace workflow
} // namespace entities
} // namespace dbal

#endif
