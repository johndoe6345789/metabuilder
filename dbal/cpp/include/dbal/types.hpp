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
