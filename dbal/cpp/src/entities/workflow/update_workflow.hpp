/**
 * @file update_workflow.hpp
 * @brief Update workflow operation
 */
#ifndef DBAL_UPDATE_WORKFLOW_HPP
#define DBAL_UPDATE_WORKFLOW_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../store/in_memory_store.hpp"
#include "../../validation/workflow_validation.hpp"

namespace dbal {
namespace entities {
namespace workflow {

/**
 * Update an existing workflow
 */
inline Result<Workflow> update(InMemoryStore& store, const std::string& id, const UpdateWorkflowInput& input) {
    if (id.empty()) {
        return Error::validationError("Workflow ID cannot be empty");
    }

    auto it = store.workflows.find(id);
    if (it == store.workflows.end()) {
        return Error::notFound("Workflow not found: " + id);
    }

    Workflow& workflow = it->second;
    std::string old_name = workflow.name;

    if (input.name.has_value()) {
        if (!validation::isValidWorkflowName(input.name.value())) {
            return Error::validationError("Workflow name must be 1-255 characters");
        }
        auto name_it = store.workflow_names.find(input.name.value());
        if (name_it != store.workflow_names.end() && name_it->second != id) {
            return Error::conflict("Workflow name already exists: " + input.name.value());
        }
        store.workflow_names.erase(old_name);
        store.workflow_names[input.name.value()] = id;
        workflow.name = input.name.value();
    }

    if (input.description.has_value()) {
        workflow.description = input.description.value();
    }

    if (input.trigger.has_value()) {
        if (!validation::isValidWorkflowTrigger(input.trigger.value())) {
            return Error::validationError("Trigger must be one of manual, schedule, event, webhook");
        }
        workflow.trigger = input.trigger.value();
    }

    if (input.trigger_config.has_value()) {
        workflow.trigger_config = input.trigger_config.value();
    }

    if (input.steps.has_value()) {
        workflow.steps = input.steps.value();
    }

    if (input.is_active.has_value()) {
        workflow.is_active = input.is_active.value();
    }

    if (input.created_by.has_value()) {
        if (input.created_by.value().empty()) {
            return Error::validationError("created_by is required");
        }
        workflow.created_by = input.created_by.value();
    }

    workflow.updated_at = std::chrono::system_clock::now();

    return Result<Workflow>(workflow);
}

} // namespace workflow
} // namespace entities
} // namespace dbal

#endif
