#include "dbal/client.hpp"
#include "entities/index.hpp"
#include "store/in_memory_store.hpp"
#include <stdexcept>

namespace dbal {

Client::Client(const ClientConfig& config) : config_(config) {
    if (config.adapter.empty()) {
        throw std::invalid_argument("Adapter type must be specified");
    }
    if (config.database_url.empty()) {
        throw std::invalid_argument("Database URL must be specified");
    }
}

Client::~Client() {
    close();
}

Result<User> Client::createUser(const CreateUserInput& input) {
    return entities::user::create(getStore(), input);
}

Result<User> Client::getUser(const std::string& id) {
    return entities::user::get(getStore(), id);
}

Result<User> Client::updateUser(const std::string& id, const UpdateUserInput& input) {
    return entities::user::update(getStore(), id, input);
}

Result<bool> Client::deleteUser(const std::string& id) {
    return entities::user::remove(getStore(), id);
}

Result<std::vector<User>> Client::listUsers(const ListOptions& options) {
    return entities::user::list(getStore(), options);
}

Result<int> Client::batchCreateUsers(const std::vector<CreateUserInput>& inputs) {
    return entities::user::batchCreate(getStore(), inputs);
}

Result<int> Client::batchUpdateUsers(const std::vector<UpdateUserBatchItem>& updates) {
    return entities::user::batchUpdate(getStore(), updates);
}

Result<int> Client::batchDeleteUsers(const std::vector<std::string>& ids) {
    return entities::user::batchDelete(getStore(), ids);
}

Result<PageView> Client::createPage(const CreatePageInput& input) {
    return entities::page::create(getStore(), input);
}

Result<PageView> Client::getPage(const std::string& id) {
    return entities::page::get(getStore(), id);
}

Result<PageView> Client::getPageBySlug(const std::string& slug) {
    return entities::page::getBySlug(getStore(), slug);
}

Result<PageView> Client::updatePage(const std::string& id, const UpdatePageInput& input) {
    return entities::page::update(getStore(), id, input);
}

Result<bool> Client::deletePage(const std::string& id) {
    return entities::page::remove(getStore(), id);
}

Result<std::vector<PageView>> Client::listPages(const ListOptions& options) {
    return entities::page::list(getStore(), options);
}

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

Result<LuaScript> Client::createLuaScript(const CreateLuaScriptInput& input) {
    return entities::lua_script::create(getStore(), input);
}

Result<LuaScript> Client::getLuaScript(const std::string& id) {
    return entities::lua_script::get(getStore(), id);
}

Result<LuaScript> Client::updateLuaScript(const std::string& id, const UpdateLuaScriptInput& input) {
    return entities::lua_script::update(getStore(), id, input);
}

Result<bool> Client::deleteLuaScript(const std::string& id) {
    return entities::lua_script::remove(getStore(), id);
}

Result<std::vector<LuaScript>> Client::listLuaScripts(const ListOptions& options) {
    return entities::lua_script::list(getStore(), options);
}

Result<Package> Client::createPackage(const CreatePackageInput& input) {
    return entities::package::create(getStore(), input);
}

Result<Package> Client::getPackage(const std::string& id) {
    return entities::package::get(getStore(), id);
}

Result<Package> Client::updatePackage(const std::string& id, const UpdatePackageInput& input) {
    return entities::package::update(getStore(), id, input);
}

Result<bool> Client::deletePackage(const std::string& id) {
    return entities::package::remove(getStore(), id);
}

Result<std::vector<Package>> Client::listPackages(const ListOptions& options) {
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

void Client::close() {
    // For in-memory implementation, optionally clear store.
}

} // namespace dbal
