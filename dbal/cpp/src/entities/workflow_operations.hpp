/**
 * @file workflow_operations.hpp
 * @brief Workflow entity CRUD operations
 * 
 * Single-responsibility module for Workflow entity operations.
 */
#ifndef DBAL_WORKFLOW_OPERATIONS_HPP
#define DBAL_WORKFLOW_OPERATIONS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../store/in_memory_store.hpp"
#include "../validation/workflow_validation.hpp"

namespace dbal {
namespace entities {

/**
 * Create a new workflow in the store
 */
inline Result<Workflow> createWorkflow(InMemoryStore& store, const CreateWorkflowInput& input) {
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

/**
 * Get a workflow by ID
 */
inline Result<Workflow> getWorkflow(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Workflow ID cannot be empty");
    }

    auto it = store.workflows.find(id);
    if (it == store.workflows.end()) {
        return Error::notFound("Workflow not found: " + id);
    }

    return Result<Workflow>(it->second);
}

/**
 * Update an existing workflow
 */
inline Result<Workflow> updateWorkflow(InMemoryStore& store, const std::string& id, const UpdateWorkflowInput& input) {
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

/**
 * Delete a workflow by ID
 */
inline Result<bool> deleteWorkflow(InMemoryStore& store, const std::string& id) {
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

/**
 * List workflows with filtering and pagination
 */
inline Result<std::vector<Workflow>> listWorkflows(InMemoryStore& store, const ListOptions& options) {
    std::vector<Workflow> workflows;

    for (const auto& [id, workflow] : store.workflows) {
        bool matches = true;

        if (options.filter.find("is_active") != options.filter.end()) {
            bool filter_active = options.filter.at("is_active") == "true";
            if (workflow.is_active != filter_active) matches = false;
        }

        if (options.filter.find("trigger") != options.filter.end()) {
            if (workflow.trigger != options.filter.at("trigger")) matches = false;
        }

        if (options.filter.find("created_by") != options.filter.end()) {
            if (workflow.created_by != options.filter.at("created_by")) matches = false;
        }

        if (matches) {
            workflows.push_back(workflow);
        }
    }

    if (options.sort.find("name") != options.sort.end()) {
        std::sort(workflows.begin(), workflows.end(), [](const Workflow& a, const Workflow& b) {
            return a.name < b.name;
        });
    } else if (options.sort.find("created_at") != options.sort.end()) {
        std::sort(workflows.begin(), workflows.end(), [](const Workflow& a, const Workflow& b) {
            return a.created_at < b.created_at;
        });
    }

    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(workflows.size()));

    if (start < static_cast<int>(workflows.size())) {
        return Result<std::vector<Workflow>>(std::vector<Workflow>(workflows.begin() + start, workflows.begin() + end));
    }

    return Result<std::vector<Workflow>>(std::vector<Workflow>());
}

} // namespace entities
} // namespace dbal

#endif
