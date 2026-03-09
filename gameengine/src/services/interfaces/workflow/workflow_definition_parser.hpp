#pragma once

#include "services/interfaces/workflow_definition.hpp"
#include "services/interfaces/i_logger.hpp"

#include <rapidjson/document.h>

#include <filesystem>
#include <memory>

namespace sdl3cpp::services::impl {

class WorkflowDefinitionParser {
public:
    explicit WorkflowDefinitionParser(std::shared_ptr<ILogger> logger = nullptr);

    WorkflowDefinition ParseFile(const std::filesystem::path& path) const;

private:
    void ParseVariables(const rapidjson::Document& document,
                        WorkflowDefinition& workflow) const;

    std::vector<WorkflowStepDefinition> ParseNodes(
        const rapidjson::Document& document) const;

    std::shared_ptr<ILogger> logger_;
};

}  // namespace sdl3cpp::services::impl
