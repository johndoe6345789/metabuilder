/**
 * @file update_workflow.hpp
 * @brief Update workflow operation
 */
#ifndef DBAL_UPDATE_WORKFLOW_HPP
#define DBAL_UPDATE_WORKFLOW_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../../../validation/entity/workflow_validation.hpp"

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

    if (input.nodes.has_value()) {
        workflow.nodes = input.nodes.value();
    }

    if (input.edges.has_value()) {
        workflow.edges = input.edges.value();
    }

    if (input.enabled.has_value()) {
        workflow.enabled = input.enabled.value();
    }

    if (input.version.has_value()) {
        workflow.version = input.version.value();
    }

    if (input.createdBy.has_value()) {
        workflow.createdBy = input.createdBy.value();
    }

    if (input.createdAt.has_value()) {
        workflow.createdAt = input.createdAt.value();
    }

    if (input.updatedAt.has_value()) {
        workflow.updatedAt = input.updatedAt.value();
    }

    if (input.tenantId.has_value()) {
        workflow.tenantId = input.tenantId.value();
    }

    return Result<Workflow>(workflow);
}

} // namespace workflow
} // namespace entities
} // namespace dbal

#endif
