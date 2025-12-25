#include "dbal/client.hpp"
#include <stdexcept>
#include <map>
#include <algorithm>
#include <regex>
#include <array>

namespace dbal {

// In-memory store for mock implementation
struct InMemoryStore {
    std::map<std::string, User> users;
    std::map<std::string, PageView> pages;
    std::map<std::string, std::string> page_slugs; // slug -> id mapping
    int user_counter = 0;
    int page_counter = 0;
};

static InMemoryStore& getStore() {
    static InMemoryStore store;
    return store;
}

// Validation helpers
static bool isValidEmail(const std::string& email) {
    static const std::regex email_pattern(R"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})");
    return std::regex_match(email, email_pattern);
}

static bool isValidUsername(const std::string& username) {
    if (username.empty() || username.length() > 50) return false;
    static const std::regex username_pattern(R"([a-zA-Z0-9_-]+)");
    return std::regex_match(username, username_pattern);
}

static bool isValidSlug(const std::string& slug) {
    if (slug.empty() || slug.length() > 100) return false;
    static const std::regex slug_pattern(R"([a-z0-9-]+)");
    return std::regex_match(slug, slug_pattern);
}

static std::string generateId(const std::string& prefix, int counter) {
    char buffer[64];
    snprintf(buffer, sizeof(buffer), "%s_%08d", prefix.c_str(), counter);
    return std::string(buffer);
}

Client::Client(const ClientConfig& config) : config_(config) {
    // Validate configuration
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
    // Validation
    if (!isValidUsername(input.username)) {
        return Error::validationError("Invalid username format (alphanumeric, underscore, hyphen only)");
    }
    if (!isValidEmail(input.email)) {
        return Error::validationError("Invalid email format");
    }
    
    auto& store = getStore();
    
    // Check for duplicate username
    for (const auto& [id, user] : store.users) {
        if (user.username == input.username) {
            return Error::conflict("Username already exists: " + input.username);
        }
        if (user.email == input.email) {
            return Error::conflict("Email already exists: " + input.email);
        }
    }
    
    // Create user
    User user;
    user.id = generateId("user", ++store.user_counter);
    user.username = input.username;
    user.email = input.email;
    user.role = input.role;
    user.created_at = std::chrono::system_clock::now();
    user.updated_at = user.created_at;
    
    store.users[user.id] = user;
    
    return Result<User>(user);
}

Result<User> Client::getUser(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("User ID cannot be empty");
    }
    
    auto& store = getStore();
    auto it = store.users.find(id);
    
    if (it == store.users.end()) {
        return Error::notFound("User not found: " + id);
    }
    
    return Result<User>(it->second);
}

Result<User> Client::updateUser(const std::string& id, const UpdateUserInput& input) {
    if (id.empty()) {
        return Error::validationError("User ID cannot be empty");
    }
    
    auto& store = getStore();
    auto it = store.users.find(id);
    
    if (it == store.users.end()) {
        return Error::notFound("User not found: " + id);
    }
    
    User& user = it->second;
    
    // Validate and check conflicts
    if (input.username.has_value()) {
        if (!isValidUsername(input.username.value())) {
            return Error::validationError("Invalid username format");
        }
        // Check for username conflict
        for (const auto& [uid, u] : store.users) {
            if (uid != id && u.username == input.username.value()) {
                return Error::conflict("Username already exists: " + input.username.value());
            }
        }
        user.username = input.username.value();
    }
    
    if (input.email.has_value()) {
        if (!isValidEmail(input.email.value())) {
            return Error::validationError("Invalid email format");
        }
        // Check for email conflict
        for (const auto& [uid, u] : store.users) {
            if (uid != id && u.email == input.email.value()) {
                return Error::conflict("Email already exists: " + input.email.value());
            }
        }
        user.email = input.email.value();
    }
    
    if (input.role.has_value()) {
        user.role = input.role.value();
    }
    
    user.updated_at = std::chrono::system_clock::now();
    
    return Result<User>(user);
}

Result<bool> Client::deleteUser(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("User ID cannot be empty");
    }
    
    auto& store = getStore();
    auto it = store.users.find(id);
    
    if (it == store.users.end()) {
        return Error::notFound("User not found: " + id);
    }
    
    store.users.erase(it);
    return Result<bool>(true);
}

Result<std::vector<User>> Client::listUsers(const ListOptions& options) {
    auto& store = getStore();
    std::vector<User> users;
    
    for (const auto& [id, user] : store.users) {
        // Apply filters if provided
        bool matches = true;
        
        if (options.filter.find("role") != options.filter.end()) {
            std::string role_str = options.filter.at("role");
            // Simple role filtering
            if (role_str == "admin" && user.role != UserRole::Admin) matches = false;
            if (role_str == "user" && user.role != UserRole::User) matches = false;
        }
        
        if (matches) {
            users.push_back(user);
        }
    }
    
    // Apply sorting
    if (options.sort.find("username") != options.sort.end()) {
        std::sort(users.begin(), users.end(), [](const User& a, const User& b) {
            return a.username < b.username;
        });
    }
    
    // Apply pagination
    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(users.size()));
    
    if (start < static_cast<int>(users.size())) {
        return Result<std::vector<User>>(std::vector<User>(users.begin() + start, users.begin() + end));
    }
    
    return Result<std::vector<User>>(std::vector<User>());
}

Result<PageView> Client::createPage(const CreatePageInput& input) {
    // Validation
    if (!isValidSlug(input.slug)) {
        return Error::validationError("Invalid slug format (lowercase, alphanumeric, hyphens only)");
    }
    if (input.title.empty() || input.title.length() > 200) {
        return Error::validationError("Title must be between 1 and 200 characters");
    }
    if (input.level < 0 || input.level > 5) {
        return Error::validationError("Level must be between 0 and 5");
    }
    
    auto& store = getStore();
    
    // Check for duplicate slug
    if (store.page_slugs.find(input.slug) != store.page_slugs.end()) {
        return Error::conflict("Page with slug already exists: " + input.slug);
    }
    
    // Create page
    PageView page;
    page.id = generateId("page", ++store.page_counter);
    page.slug = input.slug;
    page.title = input.title;
    page.description = input.description;
    page.level = input.level;
    page.layout = input.layout;
    page.is_active = input.is_active;
    page.created_at = std::chrono::system_clock::now();
    page.updated_at = page.created_at;
    
    store.pages[page.id] = page;
    store.page_slugs[page.slug] = page.id;
    
    return Result<PageView>(page);
}

Result<PageView> Client::getPage(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Page ID cannot be empty");
    }
    
    auto& store = getStore();
    auto it = store.pages.find(id);
    
    if (it == store.pages.end()) {
        return Error::notFound("Page not found: " + id);
    }
    
    return Result<PageView>(it->second);
}

Result<PageView> Client::getPageBySlug(const std::string& slug) {
    if (slug.empty()) {
        return Error::validationError("Slug cannot be empty");
    }
    
    auto& store = getStore();
    auto it = store.page_slugs.find(slug);
    
    if (it == store.page_slugs.end()) {
        return Error::notFound("Page not found with slug: " + slug);
    }
    
    return getPage(it->second);
}

Result<PageView> Client::updatePage(const std::string& id, const UpdatePageInput& input) {
    if (id.empty()) {
        return Error::validationError("Page ID cannot be empty");
    }
    
    auto& store = getStore();
    auto it = store.pages.find(id);
    
    if (it == store.pages.end()) {
        return Error::notFound("Page not found: " + id);
    }
    
    PageView& page = it->second;
    std::string old_slug = page.slug;
    
    // Validate and update fields
    if (input.slug.has_value()) {
        if (!isValidSlug(input.slug.value())) {
            return Error::validationError("Invalid slug format");
        }
        // Check for slug conflict
        auto slug_it = store.page_slugs.find(input.slug.value());
        if (slug_it != store.page_slugs.end() && slug_it->second != id) {
            return Error::conflict("Slug already exists: " + input.slug.value());
        }
        // Update slug mapping
        store.page_slugs.erase(old_slug);
        store.page_slugs[input.slug.value()] = id;
        page.slug = input.slug.value();
    }
    
    if (input.title.has_value()) {
        if (input.title.value().empty() || input.title.value().length() > 200) {
            return Error::validationError("Title must be between 1 and 200 characters");
        }
        page.title = input.title.value();
    }
    
    if (input.description.has_value()) {
        page.description = input.description.value();
    }
    
    if (input.level.has_value()) {
        if (input.level.value() < 0 || input.level.value() > 5) {
            return Error::validationError("Level must be between 0 and 5");
        }
        page.level = input.level.value();
    }
    
    if (input.layout.has_value()) {
        page.layout = input.layout.value();
    }
    
    if (input.is_active.has_value()) {
        page.is_active = input.is_active.value();
    }
    
    page.updated_at = std::chrono::system_clock::now();
    
    return Result<PageView>(page);
}

Result<bool> Client::deletePage(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Page ID cannot be empty");
    }
    
    auto& store = getStore();
    auto it = store.pages.find(id);
    
    if (it == store.pages.end()) {
        return Error::notFound("Page not found: " + id);
    }
    
    // Remove slug mapping
    store.page_slugs.erase(it->second.slug);
    store.pages.erase(it);
    
    return Result<bool>(true);
}

Result<std::vector<PageView>> Client::listPages(const ListOptions& options) {
    auto& store = getStore();
    std::vector<PageView> pages;
    
    for (const auto& [id, page] : store.pages) {
        // Apply filters
        bool matches = true;
        
        if (options.filter.find("is_active") != options.filter.end()) {
            bool filter_active = options.filter.at("is_active") == "true";
            if (page.is_active != filter_active) matches = false;
        }
        
        if (options.filter.find("level") != options.filter.end()) {
            int filter_level = std::stoi(options.filter.at("level"));
            if (page.level != filter_level) matches = false;
        }
        
        if (matches) {
            pages.push_back(page);
        }
    }
    
    // Apply sorting
    if (options.sort.find("title") != options.sort.end()) {
        std::sort(pages.begin(), pages.end(), [](const PageView& a, const PageView& b) {
            return a.title < b.title;
        });
    } else if (options.sort.find("created_at") != options.sort.end()) {
        std::sort(pages.begin(), pages.end(), [](const PageView& a, const PageView& b) {
            return a.created_at < b.created_at;
        });
    }
    
    // Apply pagination
    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(pages.size()));
    
    if (start < static_cast<int>(pages.size())) {
        return Result<std::vector<PageView>>(std::vector<PageView>(pages.begin() + start, pages.begin() + end));
    }
    
    return Result<std::vector<PageView>>(std::vector<PageView>());
}

void Client::close() {
    // For in-memory implementation, optionally clear store
    // auto& store = getStore();
    // store.users.clear();
    // store.pages.clear();
    // store.page_slugs.clear();
}

}
