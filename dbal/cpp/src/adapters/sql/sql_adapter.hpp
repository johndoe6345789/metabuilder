#ifndef DBAL_SQL_ADAPTER_HPP
#define DBAL_SQL_ADAPTER_HPP

#include "../../adapters/adapter.hpp"
#include "../../types.hpp"
#include "../../errors.hpp"
#include "sql_connection.hpp"

namespace dbal {
namespace adapters {
namespace sql {

class SqlAdapter : public Adapter {
public:
    explicit SqlAdapter(const SqlConnectionConfig& config, Dialect dialect)
        : pool_(config), dialect_(dialect) {}

    ~SqlAdapter() override = default;

    // Default implementations return not-implemented errors until the SQL
    // adapter is fully implemented for each entity.
    Result<User> createUser(const CreateUserInput& input) override {
        return Error::notImplemented("SQL adapter createUser");
    }

    Result<User> getUser(const std::string& id) override {
        return Error::notImplemented("SQL adapter getUser");
    }

    Result<User> updateUser(const std::string& id, const UpdateUserInput& input) override {
        return Error::notImplemented("SQL adapter updateUser");
    }

    Result<bool> deleteUser(const std::string& id) override {
        return Error::notImplemented("SQL adapter deleteUser");
    }

    Result<std::vector<User>> listUsers(const ListOptions& options) override {
        return Error::notImplemented("SQL adapter listUsers");
    }

    Result<PageView> createPage(const CreatePageInput& input) override {
        return Error::notImplemented("SQL adapter createPage");
    }

    Result<PageView> getPage(const std::string& id) override {
        return Error::notImplemented("SQL adapter getPage");
    }

    Result<PageView> updatePage(const std::string& id, const UpdatePageInput& input) override {
        return Error::notImplemented("SQL adapter updatePage");
    }

    Result<bool> deletePage(const std::string& id) override {
        return Error::notImplemented("SQL adapter deletePage");
    }

    Result<std::vector<PageView>> listPages(const ListOptions& options) override {
        return Error::notImplemented("SQL adapter listPages");
    }

    Result<Workflow> createWorkflow(const CreateWorkflowInput& input) override {
        return Error::notImplemented("SQL adapter createWorkflow");
    }

    Result<Workflow> getWorkflow(const std::string& id) override {
        return Error::notImplemented("SQL adapter getWorkflow");
    }

    Result<Workflow> updateWorkflow(const std::string& id, const UpdateWorkflowInput& input) override {
        return Error::notImplemented("SQL adapter updateWorkflow");
    }

    Result<bool> deleteWorkflow(const std::string& id) override {
        return Error::notImplemented("SQL adapter deleteWorkflow");
    }

    Result<std::vector<Workflow>> listWorkflows(const ListOptions& options) override {
        return Error::notImplemented("SQL adapter listWorkflows");
    }

    Result<Session> createSession(const CreateSessionInput& input) override {
        return Error::notImplemented("SQL adapter createSession");
    }

    Result<Session> getSession(const std::string& id) override {
        return Error::notImplemented("SQL adapter getSession");
    }

    Result<Session> updateSession(const std::string& id, const UpdateSessionInput& input) override {
        return Error::notImplemented("SQL adapter updateSession");
    }

    Result<bool> deleteSession(const std::string& id) override {
        return Error::notImplemented("SQL adapter deleteSession");
    }

    Result<std::vector<Session>> listSessions(const ListOptions& options) override {
        return Error::notImplemented("SQL adapter listSessions");
    }

    Result<LuaScript> createLuaScript(const CreateLuaScriptInput& input) override {
        return Error::notImplemented("SQL adapter createLuaScript");
    }

    Result<LuaScript> getLuaScript(const std::string& id) override {
        return Error::notImplemented("SQL adapter getLuaScript");
    }

    Result<LuaScript> updateLuaScript(const std::string& id, const UpdateLuaScriptInput& input) override {
        return Error::notImplemented("SQL adapter updateLuaScript");
    }

    Result<bool> deleteLuaScript(const std::string& id) override {
        return Error::notImplemented("SQL adapter deleteLuaScript");
    }

    Result<std::vector<LuaScript>> listLuaScripts(const ListOptions& options) override {
        return Error::notImplemented("SQL adapter listLuaScripts");
    }

    Result<Package> createPackage(const CreatePackageInput& input) override {
        return Error::notImplemented("SQL adapter createPackage");
    }

    Result<Package> getPackage(const std::string& id) override {
        return Error::notImplemented("SQL adapter getPackage");
    }

    Result<Package> updatePackage(const std::string& id, const UpdatePackageInput& input) override {
        return Error::notImplemented("SQL adapter updatePackage");
    }

    Result<bool> deletePackage(const std::string& id) override {
        return Error::notImplemented("SQL adapter deletePackage");
    }

    Result<std::vector<Package>> listPackages(const ListOptions& options) override {
        return Error::notImplemented("SQL adapter listPackages");
    }

    Result<int> batchCreatePackages(const std::vector<CreatePackageInput>& inputs) override {
        return Error::notImplemented("SQL adapter batchCreatePackages");
    }

    Result<int> batchUpdatePackages(const std::vector<UpdatePackageBatchItem>& updates) override {
        return Error::notImplemented("SQL adapter batchUpdatePackages");
    }

    Result<int> batchDeletePackages(const std::vector<std::string>& ids) override {
        return Error::notImplemented("SQL adapter batchDeletePackages");
    }

    void close() override {
        // Connections will tear down automatically via RAII in the pool.
    }

protected:
    SqlPool pool_;
    Dialect dialect_;
};

class PostgresAdapter : public SqlAdapter {
public:
    explicit PostgresAdapter(const SqlConnectionConfig& config)
        : SqlAdapter(config, Dialect::Postgres) {}
};

class MySQLAdapter : public SqlAdapter {
public:
    explicit MySQLAdapter(const SqlConnectionConfig& config)
        : SqlAdapter(config, Dialect::MySQL) {}
};

}
}
}

#endif
