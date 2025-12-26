#ifndef DBAL_SQL_ADAPTER_HPP
#define DBAL_SQL_ADAPTER_HPP

#include <algorithm>
#include <cctype>
#include <chrono>
#include <cstdlib>
#include <map>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>

#include "../../adapters/adapter.hpp"
#include "../../types.hpp"
#include "../../errors.hpp"
#include "sql_connection.hpp"
#include "../../runtime/requests_client.hpp"

namespace dbal {
namespace adapters {
namespace sql {

struct SqlParam {
    std::string name;
    std::string value;
};

struct SqlRow {
    std::map<std::string, std::string> columns;
};

struct SqlError {
    enum class Code {
        UniqueViolation,
        ForeignKeyViolation,
        NotFound,
        Timeout,
        ConnectionLost,
        Unknown
    };

    Code code;
    std::string message;
};

class SqlAdapter : public Adapter {
public:
    explicit SqlAdapter(const SqlConnectionConfig& config, Dialect dialect)
        : pool_(config), dialect_(dialect) {}

    ~SqlAdapter() override = default;

    Result<User> createUser(const CreateUserInput& input) override {
        auto conn = pool_.acquire();
        if (!conn) {
            return Error::internal("Unable to acquire SQL connection");
        }
        ConnectionGuard guard(pool_, conn);

        const std::string sql = "INSERT INTO users (username, email, role) "
                                "VALUES (" + placeholder(1) + ", " + placeholder(2) + ", " + placeholder(3) + ") "
                                "RETURNING " + userFields();
        const std::vector<SqlParam> params = {
            {"username", input.username},
            {"email", input.email},
            {"role", userRoleToString(input.role)}
        };

        try {
            const auto rows = executeQuery(conn, sql, params);
            if (rows.empty()) {
                return Error::internal("SQL insert returned no rows");
            }
            return mapRowToUser(rows.front());
        } catch (const SqlError& err) {
            return mapSqlError(err);
        }
    }

    Result<User> getUser(const std::string& id) override {
        auto conn = pool_.acquire();
        if (!conn) {
            return Error::internal("Unable to acquire SQL connection");
        }
        ConnectionGuard guard(pool_, conn);

        const std::string sql = "SELECT " + userFields() +
                                " FROM users WHERE id = " + placeholder(1);
        const std::vector<SqlParam> params = {{"id", id}};

        try {
            const auto rows = executeQuery(conn, sql, params);
            if (rows.empty()) {
                return Error::notFound("User not found");
            }
            return mapRowToUser(rows.front());
        } catch (const SqlError& err) {
            return mapSqlError(err);
        }
    }

    Result<User> updateUser(const std::string& id, const UpdateUserInput& input) override {
        auto conn = pool_.acquire();
        if (!conn) {
            return Error::internal("Unable to acquire SQL connection");
        }
        ConnectionGuard guard(pool_, conn);

        std::vector<std::string> setFragments;
        std::vector<SqlParam> params;
        params.reserve(4);
        params.push_back({"id", id});

        int paramIndex = 2;
        if (input.username) {
            setFragments.push_back("username = " + placeholder(paramIndex++));
            params.push_back({"username", *input.username});
        }
        if (input.email) {
            setFragments.push_back("email = " + placeholder(paramIndex++));
            params.push_back({"email", *input.email});
        }
        if (input.role) {
            setFragments.push_back("role = " + placeholder(paramIndex++));
            params.push_back({"role", userRoleToString(*input.role)});
        }

        if (setFragments.empty()) {
            return Error::validationError("No update fields supplied");
        }

        const std::string sql = "UPDATE users SET " + joinFragments(setFragments, ", ") +
                                " WHERE id = " + placeholder(1) +
                                " RETURNING " + userFields();

        try {
            const auto rows = executeQuery(conn, sql, params);
            if (rows.empty()) {
                return Error::notFound("User not found");
            }
            return mapRowToUser(rows.front());
        } catch (const SqlError& err) {
            return mapSqlError(err);
        }
    }

    Result<bool> deleteUser(const std::string& id) override {
        auto conn = pool_.acquire();
        if (!conn) {
            return Error::internal("Unable to acquire SQL connection");
        }
        ConnectionGuard guard(pool_, conn);

        const std::string sql = "DELETE FROM users WHERE id = " + placeholder(1);
        const std::vector<SqlParam> params = {{"id", id}};

        try {
            const int affected = executeNonQuery(conn, sql, params);
            if (affected == 0) {
                return Error::notFound("User not found");
            }
            return Result<bool>(true);
        } catch (const SqlError& err) {
            return mapSqlError(err);
        }
    }

    Result<std::vector<User>> listUsers(const ListOptions& options) override {
        auto conn = pool_.acquire();
        if (!conn) {
            return Error::internal("Unable to acquire SQL connection");
        }
        ConnectionGuard guard(pool_, conn);

        const int limit = options.limit > 0 ? options.limit : 50;
        const int offset = options.page > 1 ? (options.page - 1) * limit : 0;
        const std::string sql = "SELECT " + userFields() +
                                " FROM users ORDER BY created_at DESC LIMIT " + placeholder(1) +
                                " OFFSET " + placeholder(2);
        const std::vector<SqlParam> params = {
            {"limit", std::to_string(limit)},
            {"offset", std::to_string(offset)}
        };

        try {
            const auto rows = executeQuery(conn, sql, params);
            std::vector<User> users;
            users.reserve(rows.size());
            for (const auto& row : rows) {
                users.push_back(mapRowToUser(row));
            }
            return Result<std::vector<User>>(users);
        } catch (const SqlError& err) {
            return mapSqlError(err);
        }
    }

    Result<PageView> createPage(const CreatePageInput& input) override {
        (void)input;
        return Error::notImplemented("SQL adapter createPage");
    }

    Result<PageView> getPage(const std::string& id) override {
        (void)id;
        return Error::notImplemented("SQL adapter getPage");
    }

    Result<PageView> updatePage(const std::string& id, const UpdatePageInput& input) override {
        (void)id;
        (void)input;
        return Error::notImplemented("SQL adapter updatePage");
    }

    Result<bool> deletePage(const std::string& id) override {
        (void)id;
        return Error::notImplemented("SQL adapter deletePage");
    }

    Result<std::vector<PageView>> listPages(const ListOptions& options) override {
        (void)options;
        return Error::notImplemented("SQL adapter listPages");
    }

    Result<Workflow> createWorkflow(const CreateWorkflowInput& input) override {
        (void)input;
        return Error::notImplemented("SQL adapter createWorkflow");
    }

    Result<Workflow> getWorkflow(const std::string& id) override {
        (void)id;
        return Error::notImplemented("SQL adapter getWorkflow");
    }

    Result<Workflow> updateWorkflow(const std::string& id, const UpdateWorkflowInput& input) override {
        (void)id;
        (void)input;
        return Error::notImplemented("SQL adapter updateWorkflow");
    }

    Result<bool> deleteWorkflow(const std::string& id) override {
        (void)id;
        return Error::notImplemented("SQL adapter deleteWorkflow");
    }

    Result<std::vector<Workflow>> listWorkflows(const ListOptions& options) override {
        (void)options;
        return Error::notImplemented("SQL adapter listWorkflows");
    }

    Result<Session> createSession(const CreateSessionInput& input) override {
        (void)input;
        return Error::notImplemented("SQL adapter createSession");
    }

    Result<Session> getSession(const std::string& id) override {
        (void)id;
        return Error::notImplemented("SQL adapter getSession");
    }

    Result<Session> updateSession(const std::string& id, const UpdateSessionInput& input) override {
        (void)id;
        (void)input;
        return Error::notImplemented("SQL adapter updateSession");
    }

    Result<bool> deleteSession(const std::string& id) override {
        (void)id;
        return Error::notImplemented("SQL adapter deleteSession");
    }

    Result<std::vector<Session>> listSessions(const ListOptions& options) override {
        (void)options;
        return Error::notImplemented("SQL adapter listSessions");
    }

    Result<LuaScript> createLuaScript(const CreateLuaScriptInput& input) override {
        (void)input;
        return Error::notImplemented("SQL adapter createLuaScript");
    }

    Result<LuaScript> getLuaScript(const std::string& id) override {
        (void)id;
        return Error::notImplemented("SQL adapter getLuaScript");
    }

    Result<LuaScript> updateLuaScript(const std::string& id, const UpdateLuaScriptInput& input) override {
        (void)id;
        (void)input;
        return Error::notImplemented("SQL adapter updateLuaScript");
    }

    Result<bool> deleteLuaScript(const std::string& id) override {
        (void)id;
        return Error::notImplemented("SQL adapter deleteLuaScript");
    }

    Result<std::vector<LuaScript>> listLuaScripts(const ListOptions& options) override {
        (void)options;
        return Error::notImplemented("SQL adapter listLuaScripts");
    }

    Result<Package> createPackage(const CreatePackageInput& input) override {
        (void)input;
        return Error::notImplemented("SQL adapter createPackage");
    }

    Result<Package> getPackage(const std::string& id) override {
        (void)id;
        return Error::notImplemented("SQL adapter getPackage");
    }

    Result<Package> updatePackage(const std::string& id, const UpdatePackageInput& input) override {
        (void)id;
        (void)input;
        return Error::notImplemented("SQL adapter updatePackage");
    }

    Result<bool> deletePackage(const std::string& id) override {
        (void)id;
        return Error::notImplemented("SQL adapter deletePackage");
    }

    Result<std::vector<Package>> listPackages(const ListOptions& options) override {
        (void)options;
        return Error::notImplemented("SQL adapter listPackages");
    }

    Result<int> batchCreatePackages(const std::vector<CreatePackageInput>& inputs) override {
        (void)inputs;
        return Error::notImplemented("SQL adapter batchCreatePackages");
    }

    Result<int> batchUpdatePackages(const std::vector<UpdatePackageBatchItem>& updates) override {
        (void)updates;
        return Error::notImplemented("SQL adapter batchUpdatePackages");
    }

    Result<int> batchDeletePackages(const std::vector<std::string>& ids) override {
        (void)ids;
        return Error::notImplemented("SQL adapter batchDeletePackages");
    }

    void close() override {
        // Connections will tear down automatically via RAII in the pool.
    }

protected:
    struct ConnectionGuard {
        SqlPool& pool;
        SqlConnection* connection;
        ConnectionGuard(SqlPool& pool_, SqlConnection* connection_)
            : pool(pool_), connection(connection_) {}
        ~ConnectionGuard() {
            if (connection) {
                pool.release(connection);
            }
        }
    };

    std::vector<SqlRow> executeQuery(SqlConnection* connection,
                                     const std::string& sql,
                                     const std::vector<SqlParam>& params) {
        return runQuery(connection, sql, params);
    }

    int executeNonQuery(SqlConnection* connection,
                        const std::string& sql,
                        const std::vector<SqlParam>& params) {
        return runNonQuery(connection, sql, params);
    }

    virtual std::vector<SqlRow> runQuery(SqlConnection*,
                                         const std::string&,
                                         const std::vector<SqlParam>&) {
        throw SqlError{SqlError::Code::Unknown, "SQL execution not implemented"};
    }

    virtual int runNonQuery(SqlConnection*,
                            const std::string&,
                            const std::vector<SqlParam>&) {
        throw SqlError{SqlError::Code::Unknown, "SQL execution not implemented"};
    }

    static Error mapSqlError(const SqlError& error) {
        switch (error.code) {
            case SqlError::Code::UniqueViolation:
                return Error::conflict(error.message);
            case SqlError::Code::ForeignKeyViolation:
                return Error::validationError(error.message);
            case SqlError::Code::NotFound:
                return Error::notFound(error.message);
            case SqlError::Code::Timeout:
            case SqlError::Code::ConnectionLost:
                return Error::internal(error.message);
            default:
                return Error::internal(error.message);
        }
    }

    static User mapRowToUser(const SqlRow& row) {
        User user;
        user.id = columnValue(row, "id");
        user.username = columnValue(row, "username");
        user.email = columnValue(row, "email");
        user.role = parseUserRole(columnValue(row, "role"));
        user.created_at = parseTimestamp(columnValue(row, "created_at"));
        user.updated_at = parseTimestamp(columnValue(row, "updated_at"));
        return user;
    }

    static std::string columnValue(const SqlRow& row, const std::string& key) {
        const auto itr = row.columns.find(key);
        return itr != row.columns.end() ? itr->second : "";
    }

    static Timestamp parseTimestamp(const std::string& value) {
        if (value.empty()) {
            return std::chrono::system_clock::now();
        }
        try {
            const auto seconds = std::stoll(value);
            return Timestamp(std::chrono::seconds(seconds));
        } catch (...) {
            return std::chrono::system_clock::now();
        }
    }

    static UserRole parseUserRole(const std::string& value) {
        auto lower = value;
        std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
        if (lower == "admin") return UserRole::Admin;
        if (lower == "god") return UserRole::God;
        if (lower == "supergod") return UserRole::SuperGod;
        return UserRole::User;
    }

    static std::string userRoleToString(UserRole role) {
        switch (role) {
            case UserRole::Admin:
                return "admin";
            case UserRole::God:
                return "god";
            case UserRole::SuperGod:
                return "supergod";
            default:
                return "user";
        }
    }

    static std::string joinFragments(const std::vector<std::string>& fragments, const std::string& separator) {
        std::ostringstream out;
        for (size_t i = 0; i < fragments.size(); ++i) {
            if (i > 0) {
                out << separator;
            }
            out << fragments[i];
        }
        return out.str();
    }

    static std::string userFields() {
        return "id, username, email, role, created_at, updated_at";
    }

    std::string placeholder(size_t index) const {
        if (dialect_ == Dialect::Postgres || dialect_ == Dialect::Prisma) {
            return "$" + std::to_string(index);
        }
        return "?";
    }

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

class PrismaAdapter : public SqlAdapter {
public:
    explicit PrismaAdapter(const SqlConnectionConfig& config)
        : SqlAdapter(config, Dialect::Prisma) {}
};

class NativePrismaAdapter : public SqlAdapter {
public:
    explicit NativePrismaAdapter(const SqlConnectionConfig& config)
        : SqlAdapter(config, Dialect::Prisma), requestsClient_("http://localhost:3000") {}

    std::vector<SqlRow> runQuery(SqlConnection* connection,
                                 const std::string& sql,
                                 const std::vector<SqlParam>& params) override {
        (void)connection;
        const auto payload = buildPayload(sql, params, "query");
        const auto response = requestsClient_.post("/api/native-prisma", payload.dump(), {{"Content-Type", "application/json"}});
        if (response.statusCode != 200) {
            throw SqlError{SqlError::Code::Unknown, "Native Prisma bridge request failed"};
        }
        std::vector<SqlRow> rows;
        const auto& rowsJson = response.json["rows"];
        if (!rowsJson.isNull() && rowsJson.isArray()) {
            for (const auto& entry : rowsJson) {
                SqlRow row;
                for (const auto& [key, value] : entry.items()) {
                    row.columns[key] = value.isString() ? value.get<std::string>() : value.dump();
                }
                rows.push_back(std::move(row));
            }
        }
        return rows;
    }

    int runNonQuery(SqlConnection* connection,
                    const std::string& sql,
                    const std::vector<SqlParam>& params) override {
        (void)connection;
        const auto payload = buildPayload(sql, params, "nonquery");
        const auto response = requestsClient_.post("/api/native-prisma", payload.dump(), {{"Content-Type", "application/json"}});
        if (response.statusCode != 200) {
            throw SqlError{SqlError::Code::Unknown, "Native Prisma bridge request failed"};
        }
        if (response.json.isMember("affected")) {
            return response.json["affected"].asInt();
        }
        return 0;
    }

private:
    runtime::RequestsClient requestsClient_;

    drogon::Json::Value buildPayload(const std::string& sql,
                                     const std::vector<SqlParam>& params,
                                     const std::string& type) const {
        drogon::Json::Value payload;
        payload["sql"] = sql;
        payload["type"] = type;
        payload["params"] = drogon::Json::Value::array();
        for (const auto& param : params) {
            payload["params"].push_back(param.value);
        }
        return payload;
    }
};

}
}
}

#endif
