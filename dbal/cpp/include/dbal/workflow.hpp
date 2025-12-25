#ifndef DBAL_WORKFLOW_HPP
#define DBAL_WORKFLOW_HPP

#include <optional>
#include <string>
#include "types.hpp"

namespace dbal {

struct Workflow {
    std::string id;
    std::string name;
    std::optional<std::string> description;
    std::string trigger;
    Json trigger_config;
    Json steps;
    bool is_active;
    std::string created_by;
    Timestamp created_at;
    Timestamp updated_at;
};

struct CreateWorkflowInput {
    std::string name;
    std::optional<std::string> description;
    std::string trigger;
    Json trigger_config;
    Json steps;
    bool is_active = true;
    std::string created_by;
};

struct UpdateWorkflowInput {
    std::optional<std::string> name;
    std::optional<std::string> description;
    std::optional<std::string> trigger;
    std::optional<Json> trigger_config;
    std::optional<Json> steps;
    std::optional<bool> is_active;
    std::optional<std::string> created_by;
};

}

#endif
