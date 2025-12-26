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
    if (input.name.empty() || input.name.length() > 100) {
        return Error::validationError("Name must be between 1 and 100 characters");
    }
    if (input.type.empty()) {
        return Error::validationError("Workflow type is required");
    }
    if (!validation::isValidWorkflowType(input.type)) {
        return Error::validationError("Invalid workflow type");
    }
    
    Workflow workflow;
    workflow.id = store.generateId("workflow", ++store.workflow_counter);
    workflow.name = input.name;
    workflow.description = input.description;
    workflow.type = input.type;
    workflow.config = input.config;
    workflow.is_active = input.is_active;
    workflow.created_at = std::chrono::system_clock::now();
    workflow.updated_at = workflow.created_at;
    
    store.workflows[workflow.id] = workflow;
    
    return Result<Workflow>(workflow);
}

} // namespace workflow
} // namespace entities
} // namespace dbal

#endif
