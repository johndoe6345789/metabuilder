/**
 * @file get_workflow.hpp
 * @brief Get workflow by ID operation
 */
#ifndef DBAL_GET_WORKFLOW_HPP
#define DBAL_GET_WORKFLOW_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace workflow {

/**
 * Get a workflow by ID
 */
inline Result<Workflow> get(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Workflow ID cannot be empty");
    }
    
    auto it = store.workflows.find(id);
    if (it == store.workflows.end()) {
        return Error::notFound("Workflow not found: " + id);
    }
    
    return Result<Workflow>(it->second);
}

} // namespace workflow
} // namespace entities
} // namespace dbal

#endif
