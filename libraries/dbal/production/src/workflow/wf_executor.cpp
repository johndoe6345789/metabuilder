#include "wf_executor.hpp"
#include <fstream>
#include <spdlog/spdlog.h>
#include <stdexcept>

namespace dbal::workflow {

void WfExecutor::registerStep(std::shared_ptr<IWfStep> step) {
    steps_[step->type()] = std::move(step);
}

std::vector<WfNode> WfExecutor::loadNodes(const std::string& path) {
    std::ifstream f(path);
    if (!f.is_open())
        throw std::runtime_error("workflow: cannot open '" + path + "'");
    nlohmann::json doc = nlohmann::json::parse(f);
    if (!doc.contains("nodes") || !doc["nodes"].is_array())
        throw std::runtime_error("workflow: '" + path + "' missing 'nodes' array");

    std::vector<WfNode> nodes;
    for (auto& n : doc["nodes"]) {
        WfNode node;
        node.id         = n.value("id", "");
        node.type       = n.value("type", "");
        node.parameters = n.value("parameters", nlohmann::json::object());
        node.outputs    = n.value("outputs", nlohmann::json::object());
        nodes.push_back(std::move(node));
    }
    return nodes;
}

void WfExecutor::execute(const std::string& workflow_path,
                         WfContext& ctx, dbal::Client& client) const {
    auto nodes = loadNodes(workflow_path);
    spdlog::info("[workflow] executing {} nodes: {}",
                 nodes.size(), workflow_path.substr(workflow_path.rfind('/') + 1));

    for (size_t i = 0; i < nodes.size(); ++i) {
        auto& node = nodes[i];
        auto it = steps_.find(node.type);
        if (it == steps_.end()) {
            spdlog::warn("[workflow] skipping unknown step type '{}' (id={})", node.type, node.id);
            continue;
        }
        // Resolve parameter templates against current context
        WfNode resolved = node;
        resolved.parameters = ctx.resolve(node.parameters);

        try {
            it->second->execute(resolved, ctx, client);
            spdlog::debug("[workflow] step {}/{} '{}' ok", i + 1, nodes.size(), node.type);
        } catch (const std::exception& e) {
            spdlog::error("[workflow] step '{}' (id={}) failed: {}", node.type, node.id, e.what());
            throw;
        }
    }
    spdlog::info("[workflow] completed {} nodes", nodes.size());
}

} // namespace dbal::workflow
