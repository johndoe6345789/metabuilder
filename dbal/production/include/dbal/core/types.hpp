#ifndef DBAL_TYPES_HPP
#define DBAL_TYPES_HPP

#include "types.generated.hpp"

#include <optional>
#include <string>
#include <vector>
#include <map>

namespace dbal {

struct CreateUserInput {
    std::string username;
    std::string email;
    std::string role;
    std::optional<std::string> profilePicture;
    std::optional<std::string> bio;
    std::optional<Timestamp> createdAt;
    std::optional<std::string> tenantId;
    std::optional<bool> isInstanceOwner;
    std::optional<Timestamp> passwordChangeTimestamp;
    std::optional<bool> firstLogin;
};

struct UpdateUserInput {
    std::optional<std::string> username;
    std::optional<std::string> email;
    std::optional<std::string> role;
    std::optional<std::string> profilePicture;
    std::optional<std::string> bio;
    std::optional<std::string> tenantId;
    std::optional<bool> isInstanceOwner;
    std::optional<Timestamp> passwordChangeTimestamp;
    std::optional<bool> firstLogin;
};

struct UpdateUserBatchItem {
    std::string id;
    UpdateUserInput data;
};

struct CreateCredentialInput {
    std::string username;
    std::string passwordHash;
};

struct UpdateCredentialInput {
    std::optional<std::string> passwordHash;
};

struct CreatePageInput {
    std::optional<std::string> tenantId;
    std::optional<std::string> packageId;
    std::string path;
    std::string title;
    std::optional<std::string> description;
    std::optional<std::string> icon;
    std::optional<std::string> component;
    std::string componentTree;
    int level;
    bool requiresAuth;
    std::optional<std::string> requiredRole;
    std::optional<std::string> parentPath;
    int sortOrder = 0;
    bool isPublished = true;
    std::optional<std::string> params;
    std::optional<std::string> meta;
};

struct UpdatePageInput {
    std::optional<std::string> tenantId;
    std::optional<std::string> packageId;
    std::optional<std::string> path;
    std::optional<std::string> title;
    std::optional<std::string> description;
    std::optional<std::string> icon;
    std::optional<std::string> component;
    std::optional<std::string> componentTree;
    std::optional<int> level;
    std::optional<bool> requiresAuth;
    std::optional<std::string> requiredRole;
    std::optional<std::string> parentPath;
    std::optional<int> sortOrder;
    std::optional<bool> isPublished;
    std::optional<std::string> params;
    std::optional<std::string> meta;
};

struct CreateComponentNodeInput {
    std::string pageId;
    std::optional<std::string> parentId;
    std::string type;
    std::string childIds;
    int order = 0;
};

struct UpdateComponentNodeInput {
    std::optional<std::string> parentId;
    std::optional<std::string> type;
    std::optional<std::string> childIds;
    std::optional<int> order;
};

struct ComponentOrderUpdate {
    std::string id;
    int order = 0;
};

struct MoveComponentInput {
    std::string id;
    std::string newParentId;
    int order = 0;
};

struct CreateWorkflowInput {
    std::optional<std::string> tenantId;
    std::string name;
    std::optional<std::string> description;
    std::string nodes;
    std::string edges;
    bool enabled;
    int version = 1;
    std::optional<Timestamp> createdAt;
    std::optional<Timestamp> updatedAt;
    std::optional<std::string> createdBy;
};

struct UpdateWorkflowInput {
    std::optional<std::string> tenantId;
    std::optional<std::string> name;
    std::optional<std::string> description;
    std::optional<std::string> nodes;
    std::optional<std::string> edges;
    std::optional<bool> enabled;
    std::optional<int> version;
    std::optional<Timestamp> createdAt;
    std::optional<Timestamp> updatedAt;
    std::optional<std::string> createdBy;
};

struct CreateSessionInput {
    std::string userId;
    std::string token;
    Timestamp expiresAt;
    std::optional<Timestamp> createdAt;
    std::optional<Timestamp> lastActivity;
    std::optional<std::string> ipAddress;
    std::optional<std::string> userAgent;
};

struct UpdateSessionInput {
    std::optional<std::string> userId;
    std::optional<std::string> token;
    std::optional<Timestamp> expiresAt;
    std::optional<Timestamp> lastActivity;
    std::optional<std::string> ipAddress;
    std::optional<std::string> userAgent;
};

struct CreatePackageInput {
    std::string packageId;
    std::optional<std::string> tenantId;
    std::optional<Timestamp> installedAt;
    std::string version;
    bool enabled;
    std::optional<std::string> config;
};

struct UpdatePackageInput {
    std::optional<std::string> tenantId;
    std::optional<Timestamp> installedAt;
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
    bool hasMore;
};

}  // namespace dbal

#endif  // DBAL_TYPES_HPP
