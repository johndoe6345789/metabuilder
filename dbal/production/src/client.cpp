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

Result<std::vector<User>> Client::searchUsers(const std::string& query, int limit) {
    return entities::user::search(getStore(), query, limit);
}

Result<int> Client::countUsers(const std::optional<UserRole>& role) {
    return entities::user::count(getStore(), role);
}

Result<int> Client::updateManyUsers(const std::map<std::string, std::string>& filter,
                                   const UpdateUserInput& updates) {
    return entities::user::updateMany(getStore(), filter, updates);
}

Result<int> Client::deleteManyUsers(const std::map<std::string, std::string>& filter) {
    return entities::user::deleteMany(getStore(), filter);
}

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

Result<std::vector<ComponentNode>> Client::getComponentTree(const std::string& page_id) {
    return entities::component::getTree(getStore(), page_id);
}

Result<bool> Client::reorderComponents(const std::vector<ComponentOrderUpdate>& updates) {
    return entities::component::reorder(getStore(), updates);
}

Result<ComponentNode> Client::moveComponent(const MoveComponentInput& input) {
    return entities::component::move(getStore(), input);
}

Result<std::vector<ComponentNode>> Client::searchComponents(const std::string& query,
                                                                 const std::optional<std::string>& page_id,
                                                                 int limit) {
    return entities::component::search(getStore(), query, page_id, limit);
}

Result<std::vector<ComponentNode>> Client::getComponentChildren(const std::string& parent_id,
                                                                     const std::optional<std::string>& component_type,
                                                                     int limit) {
    return entities::component::getChildren(getStore(), parent_id, component_type, limit);
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

Result<std::vector<LuaScript>> Client::searchLuaScripts(const std::string& query,
                                                        const std::optional<std::string>& created_by,
                                                        int limit) {
    return entities::lua_script::search(getStore(), query, created_by, limit);
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
