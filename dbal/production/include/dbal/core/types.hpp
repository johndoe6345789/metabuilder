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
    std::string tenant_id;
    std::string username;
    std::string email;
    UserRole role;
    Timestamp created_at;
    Timestamp updated_at;
};

struct CreateUserInput {
    std::string tenant_id;
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

struct Credential {
    std::string id;
    std::string username;
    std::string password_hash;
    bool first_login;
    Timestamp created_at;
    Timestamp updated_at;
};

struct CreateCredentialInput {
    std::string username;
    std::string password_hash;
    bool first_login = true;
};

struct UpdateCredentialInput {
    std::optional<std::string> password_hash;
    std::optional<bool> first_login;
};

struct PageConfig {
    std::string id;
    std::optional<std::string> tenant_id;
    std::optional<std::string> package_id;
    std::string path;
    std::string title;
    std::optional<std::string> description;
    std::optional<std::string> icon;
    std::optional<std::string> component;
    std::string component_tree;
    int level;
    bool requires_auth;
    std::optional<std::string> required_role;
    std::optional<std::string> parent_path;
    int sort_order = 0;
    bool is_published = true;
    std::optional<std::string> params;
    std::optional<std::string> meta;
    Timestamp created_at;
    Timestamp updated_at;
};

struct CreatePageInput {
    std::optional<std::string> tenant_id;
    std::optional<std::string> package_id;
    std::string path;
    std::string title;
    std::optional<std::string> description;
    std::optional<std::string> icon;
    std::optional<std::string> component;
    std::string component_tree;
    int level;
    bool requires_auth;
    std::optional<std::string> required_role;
    std::optional<std::string> parent_path;
    int sort_order = 0;
    bool is_published = true;
    std::optional<std::string> params;
    std::optional<std::string> meta;
};

struct UpdatePageInput {
    std::optional<std::string> tenant_id;
    std::optional<std::string> package_id;
    std::optional<std::string> path;
    std::optional<std::string> title;
    std::optional<std::string> description;
    std::optional<std::string> icon;
    std::optional<std::string> component;
    std::optional<std::string> component_tree;
    std::optional<int> level;
    std::optional<bool> requires_auth;
    std::optional<std::string> required_role;
    std::optional<std::string> parent_path;
    std::optional<int> sort_order;
    std::optional<bool> is_published;
    std::optional<std::string> params;
    std::optional<std::string> meta;
};

struct ComponentNode {
    std::string id;
    std::string page_id;
    std::optional<std::string> parent_id;
    std::string type;
    std::string child_ids;
    int order = 0;
    Timestamp created_at;
    Timestamp updated_at;
};

struct CreateComponentNodeInput {
    std::string page_id;
    std::optional<std::string> parent_id;
    std::string type;
    std::string child_ids;
    int order = 0;
};

struct UpdateComponentNodeInput {
    std::optional<std::string> parent_id;
    std::optional<std::string> type;
    std::optional<std::string> child_ids;
    std::optional<int> order;
};

struct ComponentOrderUpdate {
    std::string id;
    int order = 0;
};

struct MoveComponentInput {
    std::string id;
    std::string new_parent_id;
    int order = 0;
};

struct Workflow {
    std::string id;
    std::optional<std::string> tenant_id;
    std::string name;
    std::optional<std::string> description;
    std::string nodes;
    std::string edges;
    bool enabled;
    int version = 1;
    std::optional<Timestamp> created_at;
    std::optional<Timestamp> updated_at;
    std::optional<std::string> created_by;
};

struct CreateWorkflowInput {
    std::optional<std::string> tenant_id;
    std::string name;
    std::optional<std::string> description;
    std::string nodes;
    std::string edges;
    bool enabled;
    int version = 1;
    std::optional<Timestamp> created_at;
    std::optional<Timestamp> updated_at;
    std::optional<std::string> created_by;
};

struct UpdateWorkflowInput {
    std::optional<std::string> tenant_id;
    std::optional<std::string> name;
    std::optional<std::string> description;
    std::optional<std::string> nodes;
    std::optional<std::string> edges;
    std::optional<bool> enabled;
    std::optional<int> version;
    std::optional<Timestamp> created_at;
    std::optional<Timestamp> updated_at;
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

struct InstalledPackage {
    std::string package_id;
    std::optional<std::string> tenant_id;
    Timestamp installed_at;
    std::string version;
    bool enabled;
    std::optional<std::string> config;
    Timestamp created_at;
    Timestamp updated_at;
};

struct CreatePackageInput {
    std::string package_id;
    std::optional<std::string> tenant_id;
    Timestamp installed_at;
    std::string version;
    bool enabled;
    std::optional<std::string> config;
};

struct UpdatePackageInput {
    std::optional<std::string> tenant_id;
    std::optional<Timestamp> installed_at;
    std::optional<std::string> version;
    std::optional<bool> enabled;
    std::optional<std::string> config;
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
