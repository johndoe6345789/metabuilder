#ifndef DBAL_CLIENT_HPP
#define DBAL_CLIENT_HPP

#include <memory>
#include <optional>
#include <string>
#include "types.hpp"
#include "errors.hpp"
#include "adapters/adapter.hpp"

namespace dbal {

struct ClientConfig {
    std::string mode;
    std::string adapter;
    std::string endpoint;
    std::string database_url;
    bool sandbox_enabled = true;
};

class Client {
public:
    explicit Client(const ClientConfig& config);
    ~Client();

    Client(const Client&) = delete;
    Client& operator=(const Client&) = delete;
    Client(Client&&) = default;
    Client& operator=(Client&&) = default;

    Result<User> createUser(const CreateUserInput& input);
    Result<User> getUser(const std::string& id);
    Result<User> updateUser(const std::string& id, const UpdateUserInput& input);
    Result<bool> deleteUser(const std::string& id);
    Result<std::vector<User>> listUsers(const ListOptions& options);
    Result<int> batchCreateUsers(const std::vector<CreateUserInput>& inputs);
    Result<int> batchUpdateUsers(const std::vector<UpdateUserBatchItem>& updates);
    Result<int> batchDeleteUsers(const std::vector<std::string>& ids);

    Result<std::vector<User>> searchUsers(const std::string& query, int limit = 20);
    Result<int> countUsers(const std::optional<UserRole>& role = std::nullopt);

    Result<bool> setCredential(const CreateCredentialInput& input);
    Result<bool> verifyCredential(const std::string& username, const std::string& password);
    Result<bool> setCredentialFirstLoginFlag(const std::string& username, bool first_login);
    Result<bool> getCredentialFirstLoginFlag(const std::string& username);
    Result<bool> deleteCredential(const std::string& username);

    Result<PageView> createPage(const CreatePageInput& input);
    Result<PageView> getPage(const std::string& id);
    Result<PageView> getPageBySlug(const std::string& slug);
    Result<PageView> updatePage(const std::string& id, const UpdatePageInput& input);
    Result<bool> deletePage(const std::string& id);
    Result<std::vector<PageView>> listPages(const ListOptions& options);
    Result<std::vector<PageView>> searchPages(const std::string& query, int limit = 20);

    Result<ComponentHierarchy> createComponent(const CreateComponentHierarchyInput& input);
    Result<ComponentHierarchy> getComponent(const std::string& id);
    Result<ComponentHierarchy> updateComponent(const std::string& id, const UpdateComponentHierarchyInput& input);
    Result<bool> deleteComponent(const std::string& id);
    Result<std::vector<ComponentHierarchy>> listComponents(const ListOptions& options);
    Result<std::vector<ComponentHierarchy>> getComponentTree(const std::string& page_id);
    Result<bool> reorderComponents(const std::vector<ComponentOrderUpdate>& updates);
    Result<ComponentHierarchy> moveComponent(const MoveComponentInput& input);
    Result<std::vector<ComponentHierarchy>> searchComponents(const std::string& query,
                                                             const std::optional<std::string>& page_id = std::nullopt,
                                                             int limit = 20);

    Result<Workflow> createWorkflow(const CreateWorkflowInput& input);
    Result<Workflow> getWorkflow(const std::string& id);
    Result<Workflow> updateWorkflow(const std::string& id, const UpdateWorkflowInput& input);
    Result<bool> deleteWorkflow(const std::string& id);
    Result<std::vector<Workflow>> listWorkflows(const ListOptions& options);

    Result<Session> createSession(const CreateSessionInput& input);
    Result<Session> getSession(const std::string& id);
    Result<Session> updateSession(const std::string& id, const UpdateSessionInput& input);
    Result<bool> deleteSession(const std::string& id);
    Result<std::vector<Session>> listSessions(const ListOptions& options);

    Result<LuaScript> createLuaScript(const CreateLuaScriptInput& input);
    Result<LuaScript> getLuaScript(const std::string& id);
    Result<LuaScript> updateLuaScript(const std::string& id, const UpdateLuaScriptInput& input);
    Result<bool> deleteLuaScript(const std::string& id);
    Result<std::vector<LuaScript>> listLuaScripts(const ListOptions& options);

    Result<Package> createPackage(const CreatePackageInput& input);
    Result<Package> getPackage(const std::string& id);
    Result<Package> updatePackage(const std::string& id, const UpdatePackageInput& input);
    Result<bool> deletePackage(const std::string& id);
    Result<std::vector<Package>> listPackages(const ListOptions& options);
    Result<int> batchCreatePackages(const std::vector<CreatePackageInput>& inputs);
    Result<int> batchUpdatePackages(const std::vector<UpdatePackageBatchItem>& updates);
    Result<int> batchDeletePackages(const std::vector<std::string>& ids);

    void close();

private:
    std::unique_ptr<adapters::Adapter> adapter_;
    ClientConfig config_;
};

}

#endif
