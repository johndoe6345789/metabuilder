#ifndef DBAL_ADAPTER_HPP
#define DBAL_ADAPTER_HPP

#include <string>
#include <vector>
#include "../types.hpp"
#include "../errors.hpp"

namespace dbal {
namespace adapters {

class Adapter {
public:
    virtual ~Adapter() = default;
    
    virtual Result<User> createUser(const CreateUserInput& input) = 0;
    virtual Result<User> getUser(const std::string& id) = 0;
    virtual Result<User> updateUser(const std::string& id, const UpdateUserInput& input) = 0;
    virtual Result<bool> deleteUser(const std::string& id) = 0;
    virtual Result<std::vector<User>> listUsers(const ListOptions& options) = 0;
    
    virtual Result<PageView> createPage(const CreatePageInput& input) = 0;
    virtual Result<PageView> getPage(const std::string& id) = 0;
    virtual Result<PageView> updatePage(const std::string& id, const UpdatePageInput& input) = 0;
    virtual Result<bool> deletePage(const std::string& id) = 0;
    virtual Result<std::vector<PageView>> listPages(const ListOptions& options) = 0;

    virtual Result<Workflow> createWorkflow(const CreateWorkflowInput& input) = 0;
    virtual Result<Workflow> getWorkflow(const std::string& id) = 0;
    virtual Result<Workflow> updateWorkflow(const std::string& id, const UpdateWorkflowInput& input) = 0;
    virtual Result<bool> deleteWorkflow(const std::string& id) = 0;
    virtual Result<std::vector<Workflow>> listWorkflows(const ListOptions& options) = 0;

    virtual Result<Session> createSession(const CreateSessionInput& input) = 0;
    virtual Result<Session> getSession(const std::string& id) = 0;
    virtual Result<Session> updateSession(const std::string& id, const UpdateSessionInput& input) = 0;
    virtual Result<bool> deleteSession(const std::string& id) = 0;
    virtual Result<std::vector<Session>> listSessions(const ListOptions& options) = 0;

    virtual Result<LuaScript> createLuaScript(const CreateLuaScriptInput& input) = 0;
    virtual Result<LuaScript> getLuaScript(const std::string& id) = 0;
    virtual Result<LuaScript> updateLuaScript(const std::string& id, const UpdateLuaScriptInput& input) = 0;
    virtual Result<bool> deleteLuaScript(const std::string& id) = 0;
    virtual Result<std::vector<LuaScript>> listLuaScripts(const ListOptions& options) = 0;

    virtual Result<Package> createPackage(const CreatePackageInput& input) = 0;
    virtual Result<Package> getPackage(const std::string& id) = 0;
    virtual Result<Package> updatePackage(const std::string& id, const UpdatePackageInput& input) = 0;
    virtual Result<bool> deletePackage(const std::string& id) = 0;
    virtual Result<std::vector<Package>> listPackages(const ListOptions& options) = 0;
    
    virtual void close() = 0;
};

}
}

#endif
