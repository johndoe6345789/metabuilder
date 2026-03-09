/**
 * @file client_misc_ops.cpp
 * @brief DBAL Client miscellaneous entity operations.
 *
 * This file contains operations for:
 * - Credential operations (set, verify, firstLogin management, delete)
 * - Workflow operations (CRUD: create, get, update, delete, list)
 * - Session operations (CRUD: create, get, update, delete, list)
 * - Package operations (CRUD + batch: create, get, update, delete, list, batchCreate/Update/Delete)
 */
#include "dbal/client.hpp"
#include "entities/index.hpp"
#include "store/in_memory_store.hpp"

namespace dbal {

// ============================================================================
// Credential Operations
// ============================================================================

Result<bool> Client::setCredential(const CreateCredentialInput& input) {
    return entities::credential::set(getStore(), input);
}

Result<bool> Client::verifyCredential(const std::string& username, const std::string& password) {
    return entities::credential::verify(getStore(), username, password);
}

Result<bool> Client::setCredentialFirstLoginFlag(const std::string& username, bool flag) {
    return entities::credential::setFirstLogin(getStore(), username, flag);
}

Result<bool> Client::getCredentialFirstLoginFlag(const std::string& username) {
    return entities::credential::getFirstLogin(getStore(), username);
}

Result<bool> Client::deleteCredential(const std::string& username) {
    return entities::credential::remove(getStore(), username);
}

// ============================================================================
// Workflow Operations
// ============================================================================

Result<Workflow> Client::createWorkflow(const CreateWorkflowInput& input) {
    return entities::workflow::create(getStore(), input);
}

Result<Workflow> Client::getWorkflow(const std::string& id) {
    return entities::workflow::get(getStore(), id);
}

Result<Workflow> Client::updateWorkflow(const std::string& id, const UpdateWorkflowInput& input) {
    return entities::workflow::update(getStore(), id, input);
}

Result<bool> Client::deleteWorkflow(const std::string& id) {
    return entities::workflow::remove(getStore(), id);
}

Result<std::vector<Workflow>> Client::listWorkflows(const ListOptions& options) {
    return entities::workflow::list(getStore(), options);
}

// ============================================================================
// Session Operations
// ============================================================================

Result<Session> Client::createSession(const CreateSessionInput& input) {
    return entities::session::create(getStore(), input);
}

Result<Session> Client::getSession(const std::string& id) {
    return entities::session::get(getStore(), id);
}

Result<Session> Client::updateSession(const std::string& id, const UpdateSessionInput& input) {
    return entities::session::update(getStore(), id, input);
}

Result<bool> Client::deleteSession(const std::string& id) {
    return entities::session::remove(getStore(), id);
}

Result<std::vector<Session>> Client::listSessions(const ListOptions& options) {
    return entities::session::list(getStore(), options);
}

// ============================================================================
// Package Operations
// ============================================================================

Result<InstalledPackage> Client::createPackage(const CreatePackageInput& input) {
    return entities::package::create(getStore(), input);
}

Result<InstalledPackage> Client::getPackage(const std::string& id) {
    return entities::package::get(getStore(), id);
}

Result<InstalledPackage> Client::updatePackage(const std::string& id, const UpdatePackageInput& input) {
    return entities::package::update(getStore(), id, input);
}

Result<bool> Client::deletePackage(const std::string& id) {
    return entities::package::remove(getStore(), id);
}

Result<std::vector<InstalledPackage>> Client::listPackages(const ListOptions& options) {
    return entities::package::list(getStore(), options);
}

Result<int> Client::batchCreatePackages(const std::vector<CreatePackageInput>& inputs) {
    return entities::package::batchCreate(getStore(), inputs);
}

Result<int> Client::batchUpdatePackages(const std::vector<UpdatePackageBatchItem>& updates) {
    return entities::package::batchUpdate(getStore(), updates);
}

Result<int> Client::batchDeletePackages(const std::vector<std::string>& ids) {
    return entities::package::batchDelete(getStore(), ids);
}

} // namespace dbal
