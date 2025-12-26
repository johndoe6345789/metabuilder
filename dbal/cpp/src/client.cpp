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
    std::map<std::string, Workflow> workflows;
    std::map<std::string, std::string> workflow_names; // name -> id mapping
    std::map<std::string, Session> sessions;
    std::map<std::string, std::string> session_tokens; // token -> id mapping
    std::map<std::string, LuaScript> lua_scripts;
    std::map<std::string, std::string> lua_script_names; // name -> id mapping
    std::map<std::string, Package> packages;
    std::map<std::string, std::string> package_keys; // name@version -> id mapping
    int user_counter = 0;
    int page_counter = 0;
    int workflow_counter = 0;
    int session_counter = 0;
    int lua_script_counter = 0;
    int package_counter = 0;
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

static bool isValidWorkflowName(const std::string& name) {
    return !name.empty() && name.length() <= 255;
}

static bool isValidWorkflowTrigger(const std::string& trigger) {
    static const std::array<std::string, 4> allowed = {"manual", "schedule", "event", "webhook"};
    return std::find(allowed.begin(), allowed.end(), trigger) != allowed.end();
}

static bool isValidLuaScriptName(const std::string& name) {
    return !name.empty() && name.length() <= 255;
}

static bool isValidLuaScriptCode(const std::string& code) {
    return !code.empty();
}

static bool isValidLuaTimeout(int timeout_ms) {
    return timeout_ms >= 100 && timeout_ms <= 30000;
}

static bool isValidPackageName(const std::string& name) {
    return !name.empty() && name.length() <= 255;
}

static bool isValidSemver(const std::string& version) {
    static const std::regex semver_pattern(R"(^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$)");
    return std::regex_match(version, semver_pattern);
}

static std::string packageKey(const std::string& name, const std::string& version) {
    return name + "@" + version;
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

Result<int> Client::batchCreateUsers(const std::vector<CreateUserInput>& inputs) {
    if (inputs.empty()) {
        return Result<int>(0);
    }

    std::vector<std::string> created_ids;
    for (const auto& input : inputs) {
        auto result = createUser(input);
        if (result.isError()) {
            auto& store = getStore();
            for (const auto& id : created_ids) {
                store.users.erase(id);
            }
            return result.error();
        }
        created_ids.push_back(result.value().id);
    }

    return Result<int>(static_cast<int>(created_ids.size()));
}

Result<int> Client::batchUpdateUsers(const std::vector<UpdateUserBatchItem>& updates) {
    if (updates.empty()) {
        return Result<int>(0);
    }

    int updated = 0;
    for (const auto& item : updates) {
        auto result = updateUser(item.id, item.data);
        if (result.isError()) {
            return result.error();
        }
        updated++;
    }

    return Result<int>(updated);
}

Result<int> Client::batchDeleteUsers(const std::vector<std::string>& ids) {
    if (ids.empty()) {
        return Result<int>(0);
    }

    int deleted = 0;
    for (const auto& id : ids) {
        auto result = deleteUser(id);
        if (result.isError()) {
            return result.error();
        }
        deleted++;
    }

    return Result<int>(deleted);
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

Result<Workflow> Client::createWorkflow(const CreateWorkflowInput& input) {
    if (!isValidWorkflowName(input.name)) {
        return Error::validationError("Workflow name must be 1-255 characters");
    }
    if (!isValidWorkflowTrigger(input.trigger)) {
        return Error::validationError("Trigger must be one of manual, schedule, event, webhook");
    }
    if (input.created_by.empty()) {
        return Error::validationError("created_by is required");
    }

    auto& store = getStore();

    if (store.workflow_names.find(input.name) != store.workflow_names.end()) {
        return Error::conflict("Workflow name already exists: " + input.name);
    }

    Workflow workflow;
    workflow.id = generateId("workflow", ++store.workflow_counter);
    workflow.name = input.name;
    workflow.description = input.description;
    workflow.trigger = input.trigger;
    workflow.trigger_config = input.trigger_config;
    workflow.steps = input.steps;
    workflow.is_active = input.is_active;
    workflow.created_by = input.created_by;
    workflow.created_at = std::chrono::system_clock::now();
    workflow.updated_at = workflow.created_at;

    store.workflows[workflow.id] = workflow;
    store.workflow_names[workflow.name] = workflow.id;

    return Result<Workflow>(workflow);
}

Result<Workflow> Client::getWorkflow(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Workflow ID cannot be empty");
    }

    auto& store = getStore();
    auto it = store.workflows.find(id);

    if (it == store.workflows.end()) {
        return Error::notFound("Workflow not found: " + id);
    }

    return Result<Workflow>(it->second);
}

Result<Workflow> Client::updateWorkflow(const std::string& id, const UpdateWorkflowInput& input) {
    if (id.empty()) {
        return Error::validationError("Workflow ID cannot be empty");
    }

    auto& store = getStore();
    auto it = store.workflows.find(id);

    if (it == store.workflows.end()) {
        return Error::notFound("Workflow not found: " + id);
    }

    Workflow& workflow = it->second;
    std::string old_name = workflow.name;

    if (input.name.has_value()) {
        if (!isValidWorkflowName(input.name.value())) {
            return Error::validationError("Workflow name must be 1-255 characters");
        }
        auto name_it = store.workflow_names.find(input.name.value());
        if (name_it != store.workflow_names.end() && name_it->second != id) {
            return Error::conflict("Workflow name already exists: " + input.name.value());
        }
        store.workflow_names.erase(old_name);
        store.workflow_names[input.name.value()] = id;
        workflow.name = input.name.value();
    }

    if (input.description.has_value()) {
        workflow.description = input.description.value();
    }

    if (input.trigger.has_value()) {
        if (!isValidWorkflowTrigger(input.trigger.value())) {
            return Error::validationError("Trigger must be one of manual, schedule, event, webhook");
        }
        workflow.trigger = input.trigger.value();
    }

    if (input.trigger_config.has_value()) {
        workflow.trigger_config = input.trigger_config.value();
    }

    if (input.steps.has_value()) {
        workflow.steps = input.steps.value();
    }

    if (input.is_active.has_value()) {
        workflow.is_active = input.is_active.value();
    }

    if (input.created_by.has_value()) {
        if (input.created_by.value().empty()) {
            return Error::validationError("created_by is required");
        }
        workflow.created_by = input.created_by.value();
    }

    workflow.updated_at = std::chrono::system_clock::now();

    return Result<Workflow>(workflow);
}

Result<bool> Client::deleteWorkflow(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Workflow ID cannot be empty");
    }

    auto& store = getStore();
    auto it = store.workflows.find(id);

    if (it == store.workflows.end()) {
        return Error::notFound("Workflow not found: " + id);
    }

    store.workflow_names.erase(it->second.name);
    store.workflows.erase(it);

    return Result<bool>(true);
}

Result<std::vector<Workflow>> Client::listWorkflows(const ListOptions& options) {
    auto& store = getStore();
    std::vector<Workflow> workflows;

    for (const auto& [id, workflow] : store.workflows) {
        bool matches = true;

        if (options.filter.find("is_active") != options.filter.end()) {
            bool filter_active = options.filter.at("is_active") == "true";
            if (workflow.is_active != filter_active) matches = false;
        }

        if (options.filter.find("trigger") != options.filter.end()) {
            if (workflow.trigger != options.filter.at("trigger")) matches = false;
        }

        if (options.filter.find("created_by") != options.filter.end()) {
            if (workflow.created_by != options.filter.at("created_by")) matches = false;
        }

        if (matches) {
            workflows.push_back(workflow);
        }
    }

    if (options.sort.find("name") != options.sort.end()) {
        std::sort(workflows.begin(), workflows.end(), [](const Workflow& a, const Workflow& b) {
            return a.name < b.name;
        });
    } else if (options.sort.find("created_at") != options.sort.end()) {
        std::sort(workflows.begin(), workflows.end(), [](const Workflow& a, const Workflow& b) {
            return a.created_at < b.created_at;
        });
    }

    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(workflows.size()));

    if (start < static_cast<int>(workflows.size())) {
        return Result<std::vector<Workflow>>(std::vector<Workflow>(workflows.begin() + start, workflows.begin() + end));
    }

    return Result<std::vector<Workflow>>(std::vector<Workflow>());
}

Result<Session> Client::createSession(const CreateSessionInput& input) {
    if (input.user_id.empty()) {
        return Error::validationError("user_id is required");
    }
    if (input.token.empty()) {
        return Error::validationError("token is required");
    }

    auto& store = getStore();
    if (store.users.find(input.user_id) == store.users.end()) {
        return Error::validationError("User not found: " + input.user_id);
    }
    if (store.session_tokens.find(input.token) != store.session_tokens.end()) {
        return Error::conflict("Session token already exists: " + input.token);
    }

    Session session;
    session.id = generateId("session", ++store.session_counter);
    session.user_id = input.user_id;
    session.token = input.token;
    session.expires_at = input.expires_at;
    session.created_at = std::chrono::system_clock::now();
    session.last_activity = session.created_at;

    store.sessions[session.id] = session;
    store.session_tokens[session.token] = session.id;

    return Result<Session>(session);
}

Result<Session> Client::getSession(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Session ID cannot be empty");
    }

    auto& store = getStore();
    auto it = store.sessions.find(id);

    if (it == store.sessions.end()) {
        return Error::notFound("Session not found: " + id);
    }

    auto now = std::chrono::system_clock::now();
    if (it->second.expires_at <= now) {
        store.session_tokens.erase(it->second.token);
        store.sessions.erase(it);
        return Error::notFound("Session expired: " + id);
    }

    return Result<Session>(it->second);
}

Result<Session> Client::updateSession(const std::string& id, const UpdateSessionInput& input) {
    if (id.empty()) {
        return Error::validationError("Session ID cannot be empty");
    }

    auto& store = getStore();
    auto it = store.sessions.find(id);

    if (it == store.sessions.end()) {
        return Error::notFound("Session not found: " + id);
    }

    Session& session = it->second;

    if (input.user_id.has_value()) {
        if (input.user_id.value().empty()) {
            return Error::validationError("user_id is required");
        }
        if (store.users.find(input.user_id.value()) == store.users.end()) {
            return Error::validationError("User not found: " + input.user_id.value());
        }
        session.user_id = input.user_id.value();
    }

    if (input.token.has_value()) {
        if (input.token.value().empty()) {
            return Error::validationError("token is required");
        }
        auto token_it = store.session_tokens.find(input.token.value());
        if (token_it != store.session_tokens.end() && token_it->second != id) {
            return Error::conflict("Session token already exists: " + input.token.value());
        }
        store.session_tokens.erase(session.token);
        store.session_tokens[input.token.value()] = id;
        session.token = input.token.value();
    }

    if (input.expires_at.has_value()) {
        session.expires_at = input.expires_at.value();
    }

    if (input.last_activity.has_value()) {
        session.last_activity = input.last_activity.value();
    }

    return Result<Session>(session);
}

Result<bool> Client::deleteSession(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Session ID cannot be empty");
    }

    auto& store = getStore();
    auto it = store.sessions.find(id);

    if (it == store.sessions.end()) {
        return Error::notFound("Session not found: " + id);
    }

    store.session_tokens.erase(it->second.token);
    store.sessions.erase(it);

    return Result<bool>(true);
}

Result<std::vector<Session>> Client::listSessions(const ListOptions& options) {
    auto& store = getStore();
    auto now = std::chrono::system_clock::now();
    std::vector<std::string> expired_sessions;

    for (const auto& [id, session] : store.sessions) {
        if (session.expires_at <= now) {
            expired_sessions.push_back(id);
        }
    }

    for (const auto& id : expired_sessions) {
        auto expired_it = store.sessions.find(id);
        if (expired_it == store.sessions.end()) {
            continue;
        }
        store.session_tokens.erase(expired_it->second.token);
        store.sessions.erase(expired_it);
    }

    std::vector<Session> sessions;

    for (const auto& [id, session] : store.sessions) {
        bool matches = true;

        if (options.filter.find("user_id") != options.filter.end()) {
            if (session.user_id != options.filter.at("user_id")) matches = false;
        }

        if (options.filter.find("token") != options.filter.end()) {
            if (session.token != options.filter.at("token")) matches = false;
        }

        if (matches) {
            sessions.push_back(session);
        }
    }

    if (options.sort.find("created_at") != options.sort.end()) {
        std::sort(sessions.begin(), sessions.end(), [](const Session& a, const Session& b) {
            return a.created_at < b.created_at;
        });
    } else if (options.sort.find("expires_at") != options.sort.end()) {
        std::sort(sessions.begin(), sessions.end(), [](const Session& a, const Session& b) {
            return a.expires_at < b.expires_at;
        });
    }

    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(sessions.size()));

    if (start < static_cast<int>(sessions.size())) {
        return Result<std::vector<Session>>(std::vector<Session>(sessions.begin() + start, sessions.begin() + end));
    }

    return Result<std::vector<Session>>(std::vector<Session>());
}

Result<LuaScript> Client::createLuaScript(const CreateLuaScriptInput& input) {
    if (!isValidLuaScriptName(input.name)) {
        return Error::validationError("Lua script name must be 1-255 characters");
    }
    if (!isValidLuaScriptCode(input.code)) {
        return Error::validationError("Lua script code must be a non-empty string");
    }
    if (!isValidLuaTimeout(input.timeout_ms)) {
        return Error::validationError("Timeout must be between 100 and 30000 ms");
    }
    if (input.created_by.empty()) {
        return Error::validationError("created_by is required");
    }

    for (const auto& entry : input.allowed_globals) {
        if (entry.empty()) {
            return Error::validationError("allowed_globals must contain non-empty strings");
        }
    }

    auto& store = getStore();
    if (store.lua_script_names.find(input.name) != store.lua_script_names.end()) {
        return Error::conflict("Lua script name already exists: " + input.name);
    }

    LuaScript script;
    script.id = generateId("lua", ++store.lua_script_counter);
    script.name = input.name;
    script.description = input.description;
    script.code = input.code;
    script.is_sandboxed = input.is_sandboxed;
    script.allowed_globals = input.allowed_globals;
    script.timeout_ms = input.timeout_ms;
    script.created_by = input.created_by;
    script.created_at = std::chrono::system_clock::now();
    script.updated_at = script.created_at;

    store.lua_scripts[script.id] = script;
    store.lua_script_names[script.name] = script.id;

    return Result<LuaScript>(script);
}

Result<LuaScript> Client::getLuaScript(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Lua script ID cannot be empty");
    }

    auto& store = getStore();
    auto it = store.lua_scripts.find(id);

    if (it == store.lua_scripts.end()) {
        return Error::notFound("Lua script not found: " + id);
    }

    return Result<LuaScript>(it->second);
}

Result<LuaScript> Client::updateLuaScript(const std::string& id, const UpdateLuaScriptInput& input) {
    if (id.empty()) {
        return Error::validationError("Lua script ID cannot be empty");
    }

    auto& store = getStore();
    auto it = store.lua_scripts.find(id);

    if (it == store.lua_scripts.end()) {
        return Error::notFound("Lua script not found: " + id);
    }

    LuaScript& script = it->second;
    std::string old_name = script.name;

    if (input.name.has_value()) {
        if (!isValidLuaScriptName(input.name.value())) {
            return Error::validationError("Lua script name must be 1-255 characters");
        }
        auto name_it = store.lua_script_names.find(input.name.value());
        if (name_it != store.lua_script_names.end() && name_it->second != id) {
            return Error::conflict("Lua script name already exists: " + input.name.value());
        }
        store.lua_script_names.erase(old_name);
        store.lua_script_names[input.name.value()] = id;
        script.name = input.name.value();
    }

    if (input.description.has_value()) {
        script.description = input.description.value();
    }

    if (input.code.has_value()) {
        if (!isValidLuaScriptCode(input.code.value())) {
            return Error::validationError("Lua script code must be a non-empty string");
        }
        script.code = input.code.value();
    }

    if (input.is_sandboxed.has_value()) {
        script.is_sandboxed = input.is_sandboxed.value();
    }

    if (input.allowed_globals.has_value()) {
        for (const auto& entry : input.allowed_globals.value()) {
            if (entry.empty()) {
                return Error::validationError("allowed_globals must contain non-empty strings");
            }
        }
        script.allowed_globals = input.allowed_globals.value();
    }

    if (input.timeout_ms.has_value()) {
        if (!isValidLuaTimeout(input.timeout_ms.value())) {
            return Error::validationError("Timeout must be between 100 and 30000 ms");
        }
        script.timeout_ms = input.timeout_ms.value();
    }

    if (input.created_by.has_value()) {
        if (input.created_by.value().empty()) {
            return Error::validationError("created_by is required");
        }
        script.created_by = input.created_by.value();
    }

    script.updated_at = std::chrono::system_clock::now();

    return Result<LuaScript>(script);
}

Result<bool> Client::deleteLuaScript(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Lua script ID cannot be empty");
    }

    auto& store = getStore();
    auto it = store.lua_scripts.find(id);

    if (it == store.lua_scripts.end()) {
        return Error::notFound("Lua script not found: " + id);
    }

    store.lua_script_names.erase(it->second.name);
    store.lua_scripts.erase(it);

    return Result<bool>(true);
}

Result<std::vector<LuaScript>> Client::listLuaScripts(const ListOptions& options) {
    auto& store = getStore();
    std::vector<LuaScript> scripts;

    for (const auto& [id, script] : store.lua_scripts) {
        bool matches = true;

        if (options.filter.find("created_by") != options.filter.end()) {
            if (script.created_by != options.filter.at("created_by")) matches = false;
        }

        if (options.filter.find("is_sandboxed") != options.filter.end()) {
            bool filter_sandboxed = options.filter.at("is_sandboxed") == "true";
            if (script.is_sandboxed != filter_sandboxed) matches = false;
        }

        if (matches) {
            scripts.push_back(script);
        }
    }

    if (options.sort.find("name") != options.sort.end()) {
        std::sort(scripts.begin(), scripts.end(), [](const LuaScript& a, const LuaScript& b) {
            return a.name < b.name;
        });
    } else if (options.sort.find("created_at") != options.sort.end()) {
        std::sort(scripts.begin(), scripts.end(), [](const LuaScript& a, const LuaScript& b) {
            return a.created_at < b.created_at;
        });
    }

    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(scripts.size()));

    if (start < static_cast<int>(scripts.size())) {
        return Result<std::vector<LuaScript>>(std::vector<LuaScript>(scripts.begin() + start, scripts.begin() + end));
    }

    return Result<std::vector<LuaScript>>(std::vector<LuaScript>());
}

Result<Package> Client::createPackage(const CreatePackageInput& input) {
    if (!isValidPackageName(input.name)) {
        return Error::validationError("Package name must be 1-255 characters");
    }
    if (!isValidSemver(input.version)) {
        return Error::validationError("Version must be valid semver");
    }
    if (input.author.empty()) {
        return Error::validationError("author is required");
    }

    auto& store = getStore();
    std::string key = packageKey(input.name, input.version);
    if (store.package_keys.find(key) != store.package_keys.end()) {
        return Error::conflict("Package name+version already exists: " + key);
    }

    Package package;
    package.id = generateId("package", ++store.package_counter);
    package.name = input.name;
    package.version = input.version;
    package.description = input.description;
    package.author = input.author;
    package.manifest = input.manifest;
    package.is_installed = input.is_installed;
    package.installed_at = input.installed_at;
    package.installed_by = input.installed_by;
    package.created_at = std::chrono::system_clock::now();
    package.updated_at = package.created_at;

    store.packages[package.id] = package;
    store.package_keys[key] = package.id;

    return Result<Package>(package);
}

Result<Package> Client::getPackage(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Package ID cannot be empty");
    }

    auto& store = getStore();
    auto it = store.packages.find(id);

    if (it == store.packages.end()) {
        return Error::notFound("Package not found: " + id);
    }

    return Result<Package>(it->second);
}

Result<Package> Client::updatePackage(const std::string& id, const UpdatePackageInput& input) {
    if (id.empty()) {
        return Error::validationError("Package ID cannot be empty");
    }

    auto& store = getStore();
    auto it = store.packages.find(id);

    if (it == store.packages.end()) {
        return Error::notFound("Package not found: " + id);
    }

    Package& package = it->second;

    std::string next_name = input.name.value_or(package.name);
    std::string next_version = input.version.value_or(package.version);

    if (!isValidPackageName(next_name)) {
        return Error::validationError("Package name must be 1-255 characters");
    }
    if (!isValidSemver(next_version)) {
        return Error::validationError("Version must be valid semver");
    }

    std::string current_key = packageKey(package.name, package.version);
    std::string next_key = packageKey(next_name, next_version);

    if (next_key != current_key) {
        auto key_it = store.package_keys.find(next_key);
        if (key_it != store.package_keys.end() && key_it->second != id) {
            return Error::conflict("Package name+version already exists: " + next_key);
        }
        store.package_keys.erase(current_key);
        store.package_keys[next_key] = id;
    }

    package.name = next_name;
    package.version = next_version;

    if (input.description.has_value()) {
        package.description = input.description.value();
    }

    if (input.author.has_value()) {
        if (input.author.value().empty()) {
            return Error::validationError("author is required");
        }
        package.author = input.author.value();
    }

    if (input.manifest.has_value()) {
        package.manifest = input.manifest.value();
    }

    if (input.is_installed.has_value()) {
        package.is_installed = input.is_installed.value();
    }

    if (input.installed_at.has_value()) {
        package.installed_at = input.installed_at.value();
    }

    if (input.installed_by.has_value()) {
        if (input.installed_by.value().empty()) {
            return Error::validationError("installed_by is required");
        }
        package.installed_by = input.installed_by.value();
    }

    package.updated_at = std::chrono::system_clock::now();

    return Result<Package>(package);
}

Result<bool> Client::deletePackage(const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Package ID cannot be empty");
    }

    auto& store = getStore();
    auto it = store.packages.find(id);

    if (it == store.packages.end()) {
        return Error::notFound("Package not found: " + id);
    }

    store.package_keys.erase(packageKey(it->second.name, it->second.version));
    store.packages.erase(it);

    return Result<bool>(true);
}

Result<std::vector<Package>> Client::listPackages(const ListOptions& options) {
    auto& store = getStore();
    std::vector<Package> packages;

    for (const auto& [id, package] : store.packages) {
        bool matches = true;

        if (options.filter.find("name") != options.filter.end()) {
            if (package.name != options.filter.at("name")) matches = false;
        }

        if (options.filter.find("version") != options.filter.end()) {
            if (package.version != options.filter.at("version")) matches = false;
        }

        if (options.filter.find("author") != options.filter.end()) {
            if (package.author != options.filter.at("author")) matches = false;
        }

        if (options.filter.find("is_installed") != options.filter.end()) {
            bool filter_installed = options.filter.at("is_installed") == "true";
            if (package.is_installed != filter_installed) matches = false;
        }

        if (matches) {
            packages.push_back(package);
        }
    }

    if (options.sort.find("name") != options.sort.end()) {
        std::sort(packages.begin(), packages.end(), [](const Package& a, const Package& b) {
            return a.name < b.name;
        });
    } else if (options.sort.find("created_at") != options.sort.end()) {
        std::sort(packages.begin(), packages.end(), [](const Package& a, const Package& b) {
            return a.created_at < b.created_at;
        });
    }

    int start = (options.page - 1) * options.limit;
    int end = std::min(start + options.limit, static_cast<int>(packages.size()));

    if (start < static_cast<int>(packages.size())) {
        return Result<std::vector<Package>>(std::vector<Package>(packages.begin() + start, packages.begin() + end));
    }

    return Result<std::vector<Package>>(std::vector<Package>());
}

Result<int> Client::batchCreatePackages(const std::vector<CreatePackageInput>& inputs) {
    if (inputs.empty()) {
        return Result<int>(0);
    }

    std::vector<std::string> created_ids;
    for (const auto& input : inputs) {
        auto result = createPackage(input);
        if (result.isError()) {
            auto& store = getStore();
            for (const auto& id : created_ids) {
                auto it = store.packages.find(id);
                if (it != store.packages.end()) {
                    store.package_keys.erase(packageKey(it->second.name, it->second.version));
                    store.packages.erase(it);
                }
            }
            return result.error();
        }
        created_ids.push_back(result.value().id);
    }

    return Result<int>(static_cast<int>(created_ids.size()));
}

Result<int> Client::batchUpdatePackages(const std::vector<UpdatePackageBatchItem>& updates) {
    if (updates.empty()) {
        return Result<int>(0);
    }

    int updated = 0;
    for (const auto& item : updates) {
        auto result = updatePackage(item.id, item.data);
        if (result.isError()) {
            return result.error();
        }
        updated++;
    }

    return Result<int>(updated);
}

Result<int> Client::batchDeletePackages(const std::vector<std::string>& ids) {
    if (ids.empty()) {
        return Result<int>(0);
    }

    int deleted = 0;
    for (const auto& id : ids) {
        auto result = deletePackage(id);
        if (result.isError()) {
            return result.error();
        }
        deleted++;
    }

    return Result<int>(deleted);
}

void Client::close() {
    // For in-memory implementation, optionally clear store
    // auto& store = getStore();
    // store.users.clear();
    // store.pages.clear();
    // store.page_slugs.clear();
}

}
