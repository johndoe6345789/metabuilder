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
    
    if (input.name.has_value()) {
        if (input.name.value().empty() || input.name.value().length() > 100) {
            return Error::validationError("Name must be between 1 and 100 characters");
        }
        workflow.name = input.name.value();
    }
    
    if (input.type.has_value()) {
        if (!validation::isValidWorkflowType(input.type.value())) {
            return Error::validationError("Invalid workflow type");
        }
        workflow.type = input.type.value();
    }
    
    if (input.description.has_value()) workflow.description = input.description.value();
    if (input.config.has_value()) workflow.config = input.config.value();
    if (input.is_active.has_value()) workflow.is_active = input.is_active.value();
    
    workflow.updated_at = std::chrono::system_clock::now();
    return Result<Workflow>(workflow);
}

} // namespace workflow
} // namespace entities
} // namespace dbal

#endif
