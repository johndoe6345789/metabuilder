/**
 * @file client_page_component_ops.cpp
 * @brief DBAL Client page and component entity operations.
 *
 * This file contains operations for:
 * - Page CRUD (create, get, getByPath, update, delete, list, search)
 * - Component CRUD (create, get, update, delete, list)
 * - Component tree operations (getTree, reorder, move)
 * - Component queries (search, getChildren)
 */
#include "dbal/client.hpp"
#include "entities/index.hpp"
#include "store/in_memory_store.hpp"

namespace dbal {

// ============================================================================
// Page Operations
// ============================================================================

Result<PageConfig> Client::createPage(const CreatePageInput& input) {
    return entities::page::create(getStore(), input);
}

Result<PageConfig> Client::getPage(const std::string& id) {
    return entities::page::get(getStore(), id);
}

Result<PageConfig> Client::getPageByPath(const std::string& path) {
    return entities::page::getByPath(getStore(), path);
}

Result<PageConfig> Client::updatePage(const std::string& id, const UpdatePageInput& input) {
    return entities::page::update(getStore(), id, input);
}

Result<bool> Client::deletePage(const std::string& id) {
    return entities::page::remove(getStore(), id);
}

Result<std::vector<PageConfig>> Client::listPages(const ListOptions& options) {
    return entities::page::list(getStore(), options);
}

Result<std::vector<PageConfig>> Client::searchPages(const std::string& query, int limit) {
    return entities::page::search(getStore(), query, limit);
}

// ============================================================================
// Component Operations
// ============================================================================

Result<ComponentNode> Client::createComponent(const CreateComponentNodeInput& input) {
    return entities::component::create(getStore(), input);
}

Result<ComponentNode> Client::getComponent(const std::string& id) {
    return entities::component::get(getStore(), id);
}

Result<ComponentNode> Client::updateComponent(const std::string& id, const UpdateComponentNodeInput& input) {
    return entities::component::update(getStore(), id, input);
}

Result<bool> Client::deleteComponent(const std::string& id) {
    return entities::component::remove(getStore(), id);
}

Result<std::vector<ComponentNode>> Client::listComponents(const ListOptions& options) {
    return entities::component::list(getStore(), options);
}

Result<std::vector<ComponentNode>> Client::getComponentTree(const std::string& pageId) {
    return entities::component::getTree(getStore(), pageId);
}

Result<bool> Client::reorderComponents(const std::vector<ComponentOrderUpdate>& updates) {
    return entities::component::reorder(getStore(), updates);
}

Result<ComponentNode> Client::moveComponent(const MoveComponentInput& input) {
    return entities::component::move(getStore(), input);
}

Result<std::vector<ComponentNode>> Client::searchComponents(const std::string& query,
                                                            const std::optional<std::string>& pageId,
                                                            int limit) {
    return entities::component::search(getStore(), query, pageId, limit);
}

Result<std::vector<ComponentNode>> Client::getComponentChildren(const std::string& parentId,
                                                                const std::optional<std::string>& componentType,
                                                                int limit) {
    return entities::component::getChildren(getStore(), parentId, componentType, limit);
}

} // namespace dbal
