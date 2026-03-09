/**
 * @file client_entity_ops.cpp
 * @brief DBAL Client generic entity operations.
 *
 * These methods forward directly to the adapter's generic CRUD,
 * enabling any entity loaded from YAML schemas to be accessed
 * without entity-specific code.
 */
#include "dbal/client.hpp"

namespace dbal {

Result<nlohmann::json> Client::createEntity(const std::string& entityName, const nlohmann::json& data) {
    return adapter_->create(entityName, data);
}

Result<nlohmann::json> Client::getEntity(const std::string& entityName, const std::string& id) {
    return adapter_->read(entityName, id);
}

Result<nlohmann::json> Client::updateEntity(const std::string& entityName, const std::string& id, const nlohmann::json& data) {
    return adapter_->update(entityName, id, data);
}

Result<bool> Client::deleteEntity(const std::string& entityName, const std::string& id) {
    return adapter_->remove(entityName, id);
}

Result<adapters::ListResult<nlohmann::json>> Client::listEntities(const std::string& entityName, const ListOptions& options) {
    return adapter_->list(entityName, options);
}

Result<bool> Client::beginTransaction() {
    return adapter_->beginTransaction();
}

Result<bool> Client::commitTransaction() {
    return adapter_->commitTransaction();
}

Result<bool> Client::rollbackTransaction() {
    return adapter_->rollbackTransaction();
}

} // namespace dbal
