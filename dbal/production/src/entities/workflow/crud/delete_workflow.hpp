/**
 * @file delete_workflow.hpp
 * @brief Delete workflow operation
 */
#ifndef DBAL_DELETE_WORKFLOW_HPP
#define DBAL_DELETE_WORKFLOW_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace workflow {

/**
 * Delete a workflow by ID
 */
inline Result<bool> remove(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Workflow ID cannot be empty");
    }

    auto it = store.workflows.find(id);
    if (it == store.workflows.end()) {
        return Error::notFound("Workflow not found: " + id);
    }

    store.workflow_names.erase(it->second.name);
    store.workflows.erase(it);

    return Result<bool>(true);
}

} // namespace workflow
} // namespace entities
} // namespace dbal

#endif
