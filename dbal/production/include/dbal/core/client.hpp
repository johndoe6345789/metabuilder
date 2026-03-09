#ifndef DBAL_CLIENT_HPP
#define DBAL_CLIENT_HPP

#include <memory>
#include <map>
#include <optional>
#include <string>
#include <nlohmann/json.hpp>
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
    Result<int> countUsers(const std::optional<std::string>& role = std::nullopt);
    Result<int> updateManyUsers(const std::map<std::string, std::string>& filter,
                                const UpdateUserInput& updates);
    Result<int> deleteManyUsers(const std::map<std::string, std::string>& filter);

    Result<bool> setCredential(const CreateCredentialInput& input);
    Result<bool> verifyCredential(const std::string& username, const std::string& password);
    Result<bool> setCredentialFirstLoginFlag(const std::string& username, bool firstLogin);
    Result<bool> getCredentialFirstLoginFlag(const std::string& username);
    Result<bool> deleteCredential(const std::string& username);

    Result<PageConfig> createPage(const CreatePageInput& input);
    Result<PageConfig> getPage(const std::string& id);
    Result<PageConfig> getPageByPath(const std::string& path);
    Result<PageConfig> updatePage(const std::string& id, const UpdatePageInput& input);
    Result<bool> deletePage(const std::string& id);
    Result<std::vector<PageConfig>> listPages(const ListOptions& options);
    Result<std::vector<PageConfig>> searchPages(const std::string& query, int limit = 20);

    Result<ComponentNode> createComponent(const CreateComponentNodeInput& input);
    Result<ComponentNode> getComponent(const std::string& id);
    Result<ComponentNode> updateComponent(const std::string& id, const UpdateComponentNodeInput& input);
    Result<bool> deleteComponent(const std::string& id);
    Result<std::vector<ComponentNode>> listComponents(const ListOptions& options);
    Result<std::vector<ComponentNode>> getComponentTree(const std::string& pageId);
    Result<bool> reorderComponents(const std::vector<ComponentOrderUpdate>& updates);
    Result<ComponentNode> moveComponent(const MoveComponentInput& input);
    Result<std::vector<ComponentNode>> searchComponents(const std::string& query,
                                                             const std::optional<std::string>& pageId = std::nullopt,
                                                             int limit = 20);
    Result<std::vector<ComponentNode>> getComponentChildren(const std::string& parentId,
                                                                 const std::optional<std::string>& componentType = std::nullopt,
                                                                 int limit = 0);

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

    Result<InstalledPackage> createPackage(const CreatePackageInput& input);
    Result<InstalledPackage> getPackage(const std::string& id);
    Result<InstalledPackage> updatePackage(const std::string& id, const UpdatePackageInput& input);
    Result<bool> deletePackage(const std::string& id);
    Result<std::vector<InstalledPackage>> listPackages(const ListOptions& options);
    Result<int> batchCreatePackages(const std::vector<CreatePackageInput>& inputs);
    Result<int> batchUpdatePackages(const std::vector<UpdatePackageBatchItem>& updates);
    Result<int> batchDeletePackages(const std::vector<std::string>& ids);

    // ===== Generic Entity CRUD (works for ANY entity loaded from YAML) =====

    Result<nlohmann::json> createEntity(const std::string& entityName, const nlohmann::json& data);
    Result<nlohmann::json> getEntity(const std::string& entityName, const std::string& id);
    Result<nlohmann::json> updateEntity(const std::string& entityName, const std::string& id, const nlohmann::json& data);
    Result<bool> deleteEntity(const std::string& entityName, const std::string& id);
    Result<adapters::ListResult<nlohmann::json>> listEntities(const std::string& entityName, const ListOptions& options);

    // ===== Transaction Operations =====

    Result<bool> beginTransaction();
    Result<bool> commitTransaction();
    Result<bool> rollbackTransaction();

    adapters::Adapter& adapter() { return *adapter_; }

    void close();

private:
    std::unique_ptr<adapters::Adapter> adapter_;
    ClientConfig config_;
};

}

#endif
