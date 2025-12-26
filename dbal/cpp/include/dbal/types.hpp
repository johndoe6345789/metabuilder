#ifndef DBAL_TYPES_HPP
#define DBAL_TYPES_HPP

#include <string>
#include <vector>
#include <map>
#include <optional>
#include <chrono>

namespace dbal {

using Timestamp = std::chrono::system_clock::time_point;
using Json = std::map<std::string, std::string>;

enum class UserRole {
    User,
    Admin,
    God,
    SuperGod
};

struct User {
    std::string id;
    std::string username;
    std::string email;
    UserRole role;
    Timestamp created_at;
    Timestamp updated_at;
};

struct CreateUserInput {
    std::string username;
    std::string email;
    UserRole role = UserRole::User;
};

struct UpdateUserInput {
    std::optional<std::string> username;
    std::optional<std::string> email;
    std::optional<UserRole> role;
};

struct UpdateUserBatchItem {
    std::string id;
    UpdateUserInput data;
};

struct PageView {
    std::string id;
    std::string slug;
    std::string title;
    std::optional<std::string> description;
    int level;
    Json layout;
    bool is_active;
    Timestamp created_at;
    Timestamp updated_at;
};

struct CreatePageInput {
    std::string slug;
    std::string title;
    std::optional<std::string> description;
    int level;
    Json layout;
    bool is_active = true;
};

struct UpdatePageInput {
    std::optional<std::string> slug;
    std::optional<std::string> title;
    std::optional<std::string> description;
    std::optional<int> level;
    std::optional<Json> layout;
    std::optional<bool> is_active;
};

struct Workflow {
    std::string id;
    std::string name;
    std::optional<std::string> description;
    std::string trigger;
    Json trigger_config;
    Json steps;
    bool is_active;
    std::string created_by;
    Timestamp created_at;
    Timestamp updated_at;
};

struct CreateWorkflowInput {
    std::string name;
    std::optional<std::string> description;
    std::string trigger;
    Json trigger_config;
    Json steps;
    bool is_active = true;
    std::string created_by;
};

struct UpdateWorkflowInput {
    std::optional<std::string> name;
    std::optional<std::string> description;
    std::optional<std::string> trigger;
    std::optional<Json> trigger_config;
    std::optional<Json> steps;
    std::optional<bool> is_active;
    std::optional<std::string> created_by;
};

struct Session {
    std::string id;
    std::string user_id;
    std::string token;
    Timestamp expires_at;
    Timestamp created_at;
    Timestamp last_activity;
};

struct CreateSessionInput {
    std::string user_id;
    std::string token;
    Timestamp expires_at;
};

struct UpdateSessionInput {
    std::optional<std::string> user_id;
    std::optional<std::string> token;
    std::optional<Timestamp> expires_at;
    std::optional<Timestamp> last_activity;
};

struct LuaScript {
    std::string id;
    std::string name;
    std::optional<std::string> description;
    std::string code;
    bool is_sandboxed;
    std::vector<std::string> allowed_globals;
    int timeout_ms;
    std::string created_by;
    Timestamp created_at;
    Timestamp updated_at;
};

struct CreateLuaScriptInput {
    std::string name;
    std::optional<std::string> description;
    std::string code;
    bool is_sandboxed = true;
    std::vector<std::string> allowed_globals;
    int timeout_ms = 5000;
    std::string created_by;
};

struct UpdateLuaScriptInput {
    std::optional<std::string> name;
    std::optional<std::string> description;
    std::optional<std::string> code;
    std::optional<bool> is_sandboxed;
    std::optional<std::vector<std::string>> allowed_globals;
    std::optional<int> timeout_ms;
    std::optional<std::string> created_by;
};

struct Package {
    std::string id;
    std::string name;
    std::string version;
    std::optional<std::string> description;
    std::string author;
    Json manifest;
    bool is_installed;
    std::optional<Timestamp> installed_at;
    std::optional<std::string> installed_by;
    Timestamp created_at;
    Timestamp updated_at;
};

struct CreatePackageInput {
    std::string name;
    std::string version;
    std::optional<std::string> description;
    std::string author;
    Json manifest;
    bool is_installed = false;
    std::optional<Timestamp> installed_at;
    std::optional<std::string> installed_by;
};

struct UpdatePackageInput {
    std::optional<std::string> name;
    std::optional<std::string> version;
    std::optional<std::string> description;
    std::optional<std::string> author;
    std::optional<Json> manifest;
    std::optional<bool> is_installed;
    std::optional<Timestamp> installed_at;
    std::optional<std::string> installed_by;
};

struct UpdatePackageBatchItem {
    std::string id;
    UpdatePackageInput data;
};

struct ListOptions {
    std::map<std::string, std::string> filter;
    std::map<std::string, std::string> sort;
    int page = 1;
    int limit = 20;
};

template<typename T>
struct ListResult {
    std::vector<T> data;
    int total;
    int page;
    int limit;
    bool has_more;
};

}

#endif
