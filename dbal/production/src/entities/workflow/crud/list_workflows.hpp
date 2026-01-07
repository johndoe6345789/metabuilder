/**
 * @file list_workflows.hpp
 * @brief List workflows with filtering and pagination
 */
#ifndef DBAL_LIST_WORKFLOWS_HPP
#define DBAL_LIST_WORKFLOWS_HPP

#include "dbal/types.hpp"
#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include <algorithm>

namespace dbal {
namespace entities {
namespace workflow {

/**
 * List workflows with filtering and pagination
 */
inline Result<std::vector<Workflow>> list(InMemoryStore& store, const ListOptions& options) {
    std::vector<Workflow> workflows;

    for (const auto& [id, workflow] : store.workflows) {
        bool matches = true;

        if (options.filter.find("enabled") != options.filter.end()) {
            bool filter_enabled = options.filter.at("enabled") == "true";
            if (workflow.enabled != filter_enabled) matches = false;
        }

        if (options.filter.find("tenant_id") != options.filter.end()) {
            if (!workflow.tenant_id.has_value() || workflow.tenant_id.value() != options.filter.at("tenant_id")) {
                matches = false;
            }
        }

        if (options.filter.find("created_by") != options.filter.end()) {
            if (!workflow.created_by.has_value() || workflow.created_by.value() != options.filter.at("created_by")) {
                matches = false;
            }
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
            return a.created_at.value_or(std::chrono::system_clock::time_point()) <
                b.created_at.value_or(std::chrono::system_clock::time_point());
        });
    }

    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(workflows.size()));

    if (start < static_cast<int>(workflows.size())) {
        return Result<std::vector<Workflow>>(std::vector<Workflow>(workflows.begin() + start, workflows.begin() + end));
    }

    return Result<std::vector<Workflow>>(std::vector<Workflow>());
}

} // namespace workflow
} // namespace entities
} // namespace dbal

#endif
