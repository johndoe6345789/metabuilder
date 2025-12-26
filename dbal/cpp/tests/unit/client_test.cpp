#include "dbal/client.hpp"
#include "dbal/errors.hpp"
#include <iostream>
#include <cassert>
#include <chrono>

void test_client_creation() {
    std::cout << "Testing client creation..." << std::endl;
    
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    config.sandbox_enabled = true;
    
    dbal::Client client(config);
    std::cout << "  ✓ Client created successfully" << std::endl;
}

void test_client_config_validation() {
    std::cout << "Testing config validation..." << std::endl;
    
    // Empty adapter should throw
    try {
        dbal::ClientConfig config;
        config.adapter = "";
        config.database_url = ":memory:";
        dbal::Client client(config);
        assert(false && "Should have thrown for empty adapter");
    } catch (const std::invalid_argument& e) {
        std::cout << "  ✓ Empty adapter validation works" << std::endl;
    }
    
    // Empty database URL should throw
    try {
        dbal::ClientConfig config;
        config.adapter = "sqlite";
        config.database_url = "";
        dbal::Client client(config);
        assert(false && "Should have thrown for empty database_url");
    } catch (const std::invalid_argument& e) {
        std::cout << "  ✓ Empty database_url validation works" << std::endl;
    }
}

void test_create_user() {
    std::cout << "Testing user creation..." << std::endl;
    
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    
    dbal::Client client(config);
    
    dbal::CreateUserInput input;
    input.username = "testuser";
    input.email = "test@example.com";
    input.role = dbal::UserRole::User;
    
    auto result = client.createUser(input);
    assert(result.isOk());
    assert(result.value().username == "testuser");
    assert(result.value().email == "test@example.com");
    assert(!result.value().id.empty());
    
    std::cout << "  ✓ User created with ID: " << result.value().id << std::endl;
}

void test_user_validation() {
    std::cout << "Testing user validation..." << std::endl;
    
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);
    
    // Invalid username
    dbal::CreateUserInput input1;
    input1.username = "invalid username!"; // spaces and special chars
    input1.email = "test@example.com";
    auto result1 = client.createUser(input1);
    assert(result1.isError());
    assert(result1.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Invalid username rejected" << std::endl;
    
    // Invalid email
    dbal::CreateUserInput input2;
    input2.username = "testuser";
    input2.email = "invalid-email";
    auto result2 = client.createUser(input2);
    assert(result2.isError());
    assert(result2.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Invalid email rejected" << std::endl;
}

void test_user_conflicts() {
    std::cout << "Testing user conflicts..." << std::endl;
    
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);
    
    // Create first user
    dbal::CreateUserInput input1;
    input1.username = "testuser";
    input1.email = "test@example.com";
    auto result1 = client.createUser(input1);
    assert(result1.isOk());
    
    // Try to create with same username
    dbal::CreateUserInput input2;
    input2.username = "testuser";
    input2.email = "different@example.com";
    auto result2 = client.createUser(input2);
    assert(result2.isError());
    assert(result2.error().code() == dbal::ErrorCode::Conflict);
    std::cout << "  ✓ Duplicate username rejected" << std::endl;
    
    // Try to create with same email
    dbal::CreateUserInput input3;
    input3.username = "different";
    input3.email = "test@example.com";
    auto result3 = client.createUser(input3);
    assert(result3.isError());
    assert(result3.error().code() == dbal::ErrorCode::Conflict);
    std::cout << "  ✓ Duplicate email rejected" << std::endl;
}

void test_get_user() {
    std::cout << "Testing get user..." << std::endl;
    
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);
    
    // Create user
    dbal::CreateUserInput input;
    input.username = "gettest";
    input.email = "gettest@example.com";
    auto createResult = client.createUser(input);
    assert(createResult.isOk());
    std::string userId = createResult.value().id;
    
    // Get existing user
    auto getResult = client.getUser(userId);
    assert(getResult.isOk());
    assert(getResult.value().username == "gettest");
    std::cout << "  ✓ Retrieved existing user" << std::endl;
    
    // Try to get non-existent user
    auto notFoundResult = client.getUser("nonexistent_id");
    assert(notFoundResult.isError());
    assert(notFoundResult.error().code() == dbal::ErrorCode::NotFound);
    std::cout << "  ✓ Not found for non-existent user" << std::endl;
}

void test_update_user() {
    std::cout << "Testing update user..." << std::endl;
    
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);
    
    // Create user
    dbal::CreateUserInput input;
    input.username = "updatetest";
    input.email = "update@example.com";
    auto createResult = client.createUser(input);
    assert(createResult.isOk());
    std::string userId = createResult.value().id;
    
    // Update username
    dbal::UpdateUserInput updateInput;
    updateInput.username = "updated_username";
    auto updateResult = client.updateUser(userId, updateInput);
    assert(updateResult.isOk());
    assert(updateResult.value().username == "updated_username");
    std::cout << "  ✓ Username updated successfully" << std::endl;
    
    // Verify update persisted
    auto getResult = client.getUser(userId);
    assert(getResult.isOk());
    assert(getResult.value().username == "updated_username");
    std::cout << "  ✓ Update persisted" << std::endl;
}

void test_delete_user() {
    std::cout << "Testing delete user..." << std::endl;
    
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);
    
    // Create user
    dbal::CreateUserInput input;
    input.username = "deletetest";
    input.email = "delete@example.com";
    auto createResult = client.createUser(input);
    assert(createResult.isOk());
    std::string userId = createResult.value().id;
    
    // Delete user
    auto deleteResult = client.deleteUser(userId);
    assert(deleteResult.isOk());
    std::cout << "  ✓ User deleted successfully" << std::endl;
    
    // Verify user is gone
    auto getResult = client.getUser(userId);
    assert(getResult.isError());
    assert(getResult.error().code() == dbal::ErrorCode::NotFound);
    std::cout << "  ✓ Deleted user not found" << std::endl;
}

void test_list_users() {
    std::cout << "Testing list users..." << std::endl;
    
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);
    
    // Create multiple users
    for (int i = 0; i < 5; i++) {
        dbal::CreateUserInput input;
        input.username = "listuser" + std::to_string(i);
        input.email = "listuser" + std::to_string(i) + "@example.com";
        input.role = (i < 2) ? dbal::UserRole::Admin : dbal::UserRole::User;
        client.createUser(input);
    }
    
    // List all users
    dbal::ListOptions options;
    auto listResult = client.listUsers(options);
    assert(listResult.isOk());
    assert(listResult.value().size() >= 5);
    std::cout << "  ✓ Listed " << listResult.value().size() << " users" << std::endl;
    
    // Test pagination
    dbal::ListOptions pageOptions;
    pageOptions.page = 1;
    pageOptions.limit = 2;
    auto pageResult = client.listUsers(pageOptions);
    assert(pageResult.isOk());
    assert(pageResult.value().size() == 2);
    std::cout << "  ✓ Pagination works (page 1, limit 2)" << std::endl;
}

void test_user_batch_operations() {
    std::cout << "Testing user batch operations..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    std::vector<dbal::CreateUserInput> users;
    dbal::CreateUserInput user1;
    user1.username = "batch_user_1";
    user1.email = "batch_user_1@example.com";
    users.push_back(user1);

    dbal::CreateUserInput user2;
    user2.username = "batch_user_2";
    user2.email = "batch_user_2@example.com";
    user2.role = dbal::UserRole::Admin;
    users.push_back(user2);

    auto createResult = client.batchCreateUsers(users);
    assert(createResult.isOk());
    assert(createResult.value() == 2);
    std::cout << "  ✓ Batch created users" << std::endl;

    dbal::ListOptions listOptions;
    listOptions.limit = 10;
    auto listResult = client.listUsers(listOptions);
    assert(listResult.isOk());
    assert(listResult.value().size() >= 2);

    std::vector<dbal::UpdateUserBatchItem> updates;
    dbal::UpdateUserBatchItem update1;
    update1.id = listResult.value()[0].id;
    update1.data.email = "batch_updated_1@example.com";
    updates.push_back(update1);

    dbal::UpdateUserBatchItem update2;
    update2.id = listResult.value()[1].id;
    update2.data.role = dbal::UserRole::God;
    updates.push_back(update2);

    auto updateResult = client.batchUpdateUsers(updates);
    assert(updateResult.isOk());
    assert(updateResult.value() == 2);
    std::cout << "  ✓ Batch updated users" << std::endl;

    std::vector<std::string> ids;
    ids.push_back(listResult.value()[0].id);
    ids.push_back(listResult.value()[1].id);

    auto deleteResult = client.batchDeleteUsers(ids);
    assert(deleteResult.isOk());
    assert(deleteResult.value() == 2);
    std::cout << "  ✓ Batch deleted users" << std::endl;
}

void test_page_crud() {
    std::cout << "Testing page CRUD operations..." << std::endl;
    
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);
    
    // Create page
    dbal::CreatePageInput input;
    input.slug = "test-page";
    input.title = "Test Page";
    input.description = "A test page";
    input.level = 2;
    input.is_active = true;
    
    auto createResult = client.createPage(input);
    assert(createResult.isOk());
    assert(createResult.value().slug == "test-page");
    std::string pageId = createResult.value().id;
    std::cout << "  ✓ Page created with ID: " << pageId << std::endl;
    
    // Get by ID
    auto getResult = client.getPage(pageId);
    assert(getResult.isOk());
    assert(getResult.value().title == "Test Page");
    std::cout << "  ✓ Retrieved page by ID" << std::endl;
    
    // Get by slug
    auto getBySlugResult = client.getPageBySlug("test-page");
    assert(getBySlugResult.isOk());
    assert(getBySlugResult.value().id == pageId);
    std::cout << "  ✓ Retrieved page by slug" << std::endl;
    
    // Update page
    dbal::UpdatePageInput updateInput;
    updateInput.title = "Updated Title";
    auto updateResult = client.updatePage(pageId, updateInput);
    assert(updateResult.isOk());
    assert(updateResult.value().title == "Updated Title");
    std::cout << "  ✓ Page updated" << std::endl;
    
    // Delete page
    auto deleteResult = client.deletePage(pageId);
    assert(deleteResult.isOk());
    
    // Verify deletion
    auto notFoundResult = client.getPage(pageId);
    assert(notFoundResult.isError());
    std::cout << "  ✓ Page deleted" << std::endl;
}

void test_page_validation() {
    std::cout << "Testing page validation..." << std::endl;
    
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);
    
    // Invalid slug (uppercase)
    dbal::CreatePageInput input1;
    input1.slug = "Invalid-Slug";
    input1.title = "Test";
    input1.level = 1;
    auto result1 = client.createPage(input1);
    assert(result1.isError());
    assert(result1.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Uppercase slug rejected" << std::endl;
    
    // Empty title
    dbal::CreatePageInput input2;
    input2.slug = "valid-slug";
    input2.title = "";
    input2.level = 1;
    auto result2 = client.createPage(input2);
    assert(result2.isError());
    assert(result2.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Empty title rejected" << std::endl;
    
    // Invalid level
    dbal::CreatePageInput input3;
    input3.slug = "valid-slug";
    input3.title = "Test";
    input3.level = 10;
    auto result3 = client.createPage(input3);
    assert(result3.isError());
    assert(result3.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Invalid level rejected" << std::endl;
}

void test_workflow_crud() {
    std::cout << "Testing workflow CRUD operations..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    // Create user for created_by reference
    dbal::CreateUserInput userInput;
    userInput.username = "workflow_owner";
    userInput.email = "workflow_owner@example.com";
    auto userResult = client.createUser(userInput);
    assert(userResult.isOk());

    // Create workflow
    dbal::CreateWorkflowInput input;
    input.name = "workflow-crud";
    input.description = "Test workflow";
    input.trigger = "schedule";
    input.trigger_config = {{"cron", "0 0 * * *"}};
    input.steps = {{"step1", "noop"}};
    input.is_active = true;
    input.created_by = userResult.value().id;

    auto createResult = client.createWorkflow(input);
    assert(createResult.isOk());
    assert(createResult.value().name == "workflow-crud");
    std::string workflowId = createResult.value().id;
    std::cout << "  ✓ Workflow created with ID: " << workflowId << std::endl;

    // Get by ID
    auto getResult = client.getWorkflow(workflowId);
    assert(getResult.isOk());
    assert(getResult.value().name == "workflow-crud");
    std::cout << "  ✓ Retrieved workflow by ID" << std::endl;

    // Update workflow
    dbal::UpdateWorkflowInput updateInput;
    updateInput.name = "workflow-crud-updated";
    updateInput.is_active = false;
    auto updateResult = client.updateWorkflow(workflowId, updateInput);
    assert(updateResult.isOk());
    assert(updateResult.value().name == "workflow-crud-updated");
    assert(updateResult.value().is_active == false);
    std::cout << "  ✓ Workflow updated" << std::endl;

    // List workflows
    dbal::ListOptions listOptions;
    listOptions.filter["is_active"] = "false";
    auto listResult = client.listWorkflows(listOptions);
    assert(listResult.isOk());
    assert(listResult.value().size() >= 1);
    std::cout << "  ✓ Listed workflows (filtered by is_active=false)" << std::endl;

    // Delete workflow
    auto deleteResult = client.deleteWorkflow(workflowId);
    assert(deleteResult.isOk());

    // Verify deletion
    auto notFoundResult = client.getWorkflow(workflowId);
    assert(notFoundResult.isError());
    std::cout << "  ✓ Workflow deleted" << std::endl;
}

void test_workflow_validation() {
    std::cout << "Testing workflow validation..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    // Create user for created_by reference
    dbal::CreateUserInput userInput;
    userInput.username = "workflow_validator";
    userInput.email = "workflow_validator@example.com";
    auto userResult = client.createUser(userInput);
    assert(userResult.isOk());

    // Invalid trigger
    dbal::CreateWorkflowInput input1;
    input1.name = "invalid-trigger";
    input1.trigger = "invalid";
    input1.trigger_config = {{"cron", "* * * * *"}};
    input1.steps = {{"step1", "noop"}};
    input1.created_by = userResult.value().id;
    auto result1 = client.createWorkflow(input1);
    assert(result1.isError());
    assert(result1.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Invalid trigger rejected" << std::endl;

    // Empty name
    dbal::CreateWorkflowInput input2;
    input2.name = "";
    input2.trigger = "manual";
    input2.trigger_config = {{"mode", "test"}};
    input2.steps = {{"step1", "noop"}};
    input2.created_by = userResult.value().id;
    auto result2 = client.createWorkflow(input2);
    assert(result2.isError());
    assert(result2.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Empty name rejected" << std::endl;

    // Duplicate name
    dbal::CreateWorkflowInput input3;
    input3.name = "workflow-duplicate";
    input3.trigger = "manual";
    input3.trigger_config = {{"mode", "test"}};
    input3.steps = {{"step1", "noop"}};
    input3.created_by = userResult.value().id;
    auto result3 = client.createWorkflow(input3);
    assert(result3.isOk());

    dbal::CreateWorkflowInput input4 = input3;
    input4.created_by = userResult.value().id;
    auto result4 = client.createWorkflow(input4);
    assert(result4.isError());
    assert(result4.error().code() == dbal::ErrorCode::Conflict);
    std::cout << "  ✓ Duplicate workflow name rejected" << std::endl;
}

void test_session_crud() {
    std::cout << "Testing session CRUD operations..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreateUserInput userInput;
    userInput.username = "session_owner";
    userInput.email = "session_owner@example.com";
    auto userResult = client.createUser(userInput);
    assert(userResult.isOk());

    dbal::CreateSessionInput input;
    input.user_id = userResult.value().id;
    input.token = "session-token";
    input.expires_at = std::chrono::system_clock::now() + std::chrono::hours(1);

    auto createResult = client.createSession(input);
    assert(createResult.isOk());
    std::string sessionId = createResult.value().id;
    std::cout << "  ✓ Session created with ID: " << sessionId << std::endl;

    auto getResult = client.getSession(sessionId);
    assert(getResult.isOk());
    assert(getResult.value().token == "session-token");
    std::cout << "  ✓ Retrieved session by ID" << std::endl;

    dbal::UpdateSessionInput updateInput;
    updateInput.last_activity = std::chrono::system_clock::now() + std::chrono::hours(2);
    auto updateResult = client.updateSession(sessionId, updateInput);
    assert(updateResult.isOk());
    std::cout << "  ✓ Session updated" << std::endl;

    dbal::ListOptions listOptions;
    listOptions.filter["user_id"] = userResult.value().id;
    auto listResult = client.listSessions(listOptions);
    assert(listResult.isOk());
    assert(listResult.value().size() >= 1);
    std::cout << "  ✓ Listed sessions (filtered by user_id)" << std::endl;

    auto deleteResult = client.deleteSession(sessionId);
    assert(deleteResult.isOk());

    auto notFoundResult = client.getSession(sessionId);
    assert(notFoundResult.isError());
    std::cout << "  ✓ Session deleted" << std::endl;
}

void test_session_validation() {
    std::cout << "Testing session validation..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreateUserInput userInput;
    userInput.username = "session_validator";
    userInput.email = "session_validator@example.com";
    auto userResult = client.createUser(userInput);
    assert(userResult.isOk());

    dbal::CreateSessionInput input1;
    input1.user_id = userResult.value().id;
    input1.token = "";
    input1.expires_at = std::chrono::system_clock::now() + std::chrono::hours(1);
    auto result1 = client.createSession(input1);
    assert(result1.isError());
    assert(result1.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Empty token rejected" << std::endl;

    dbal::CreateSessionInput input2;
    input2.user_id = userResult.value().id;
    input2.token = "dup-token";
    input2.expires_at = std::chrono::system_clock::now() + std::chrono::hours(1);
    auto result2 = client.createSession(input2);
    assert(result2.isOk());

    dbal::CreateSessionInput input3 = input2;
    auto result3 = client.createSession(input3);
    assert(result3.isError());
    assert(result3.error().code() == dbal::ErrorCode::Conflict);
    std::cout << "  ✓ Duplicate token rejected" << std::endl;
}

void test_lua_script_crud() {
    std::cout << "Testing Lua script CRUD operations..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreateUserInput userInput;
    userInput.username = "lua_owner";
    userInput.email = "lua_owner@example.com";
    auto userResult = client.createUser(userInput);
    assert(userResult.isOk());

    dbal::CreateLuaScriptInput input;
    input.name = "health_check";
    input.description = "Health check";
    input.code = "return true";
    input.is_sandboxed = true;
    input.allowed_globals = {"math"};
    input.timeout_ms = 1000;
    input.created_by = userResult.value().id;

    auto createResult = client.createLuaScript(input);
    assert(createResult.isOk());
    std::string scriptId = createResult.value().id;
    std::cout << "  ✓ Lua script created with ID: " << scriptId << std::endl;

    auto getResult = client.getLuaScript(scriptId);
    assert(getResult.isOk());
    assert(getResult.value().name == "health_check");
    std::cout << "  ✓ Retrieved Lua script by ID" << std::endl;

    dbal::UpdateLuaScriptInput updateInput;
    updateInput.timeout_ms = 2000;
    updateInput.is_sandboxed = false;
    auto updateResult = client.updateLuaScript(scriptId, updateInput);
    assert(updateResult.isOk());
    assert(updateResult.value().timeout_ms == 2000);
    std::cout << "  ✓ Lua script updated" << std::endl;

    dbal::ListOptions listOptions;
    listOptions.filter["is_sandboxed"] = "false";
    auto listResult = client.listLuaScripts(listOptions);
    assert(listResult.isOk());
    assert(listResult.value().size() >= 1);
    std::cout << "  ✓ Listed Lua scripts (filtered by is_sandboxed=false)" << std::endl;

    auto deleteResult = client.deleteLuaScript(scriptId);
    assert(deleteResult.isOk());

    auto notFoundResult = client.getLuaScript(scriptId);
    assert(notFoundResult.isError());
    std::cout << "  ✓ Lua script deleted" << std::endl;
}

void test_lua_script_validation() {
    std::cout << "Testing Lua script validation..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreateUserInput userInput;
    userInput.username = "lua_validator";
    userInput.email = "lua_validator@example.com";
    auto userResult = client.createUser(userInput);
    assert(userResult.isOk());

    dbal::CreateLuaScriptInput input1;
    input1.name = "invalid-timeout";
    input1.code = "return true";
    input1.is_sandboxed = true;
    input1.allowed_globals = {"math"};
    input1.timeout_ms = 50;
    input1.created_by = userResult.value().id;
    auto result1 = client.createLuaScript(input1);
    assert(result1.isError());
    assert(result1.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Invalid timeout rejected" << std::endl;

    dbal::CreateLuaScriptInput inputGlobals = input1;
    inputGlobals.name = "invalid-globals";
    inputGlobals.timeout_ms = 1000;
    inputGlobals.allowed_globals = {""};
    auto resultGlobals = client.createLuaScript(inputGlobals);
    assert(resultGlobals.isError());
    assert(resultGlobals.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Empty allowed_globals rejected" << std::endl;

    dbal::CreateLuaScriptInput inputForbiddenGlobals = input1;
    inputForbiddenGlobals.name = "forbidden-globals";
    inputForbiddenGlobals.timeout_ms = 1000;
    inputForbiddenGlobals.allowed_globals = {"os"};
    auto resultForbiddenGlobals = client.createLuaScript(inputForbiddenGlobals);
    assert(resultForbiddenGlobals.isError());
    assert(resultForbiddenGlobals.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Forbidden globals rejected" << std::endl;

    dbal::CreateLuaScriptInput input2;
    input2.name = "duplicate-script";
    input2.code = "return true";
    input2.is_sandboxed = true;
    input2.allowed_globals = {"math"};
    input2.timeout_ms = 1000;
    input2.created_by = userResult.value().id;
    auto result2 = client.createLuaScript(input2);
    assert(result2.isOk());

    dbal::CreateLuaScriptInput input3 = input2;
    auto result3 = client.createLuaScript(input3);
    assert(result3.isError());
    assert(result3.error().code() == dbal::ErrorCode::Conflict);
    std::cout << "  ✓ Duplicate script name rejected" << std::endl;

    dbal::CreateLuaScriptInput input4 = input2;
    input4.name = "dedupe-globals";
    input4.allowed_globals = {"math", "math", "print"};
    auto result4 = client.createLuaScript(input4);
    assert(result4.isOk());
    assert(result4.value().allowed_globals.size() == 2);
    std::cout << "  ✓ Allowed globals deduped" << std::endl;
}

void test_package_crud() {
    std::cout << "Testing package CRUD operations..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreateUserInput userInput;
    userInput.username = "package_owner";
    userInput.email = "package_owner@example.com";
    auto userResult = client.createUser(userInput);
    assert(userResult.isOk());

    dbal::CreatePackageInput input;
    input.name = "forum";
    input.version = "1.2.3";
    input.description = "Forum package";
    input.author = "MetaBuilder";
    input.manifest = {{"entry", "index.lua"}};
    input.is_installed = false;

    auto createResult = client.createPackage(input);
    assert(createResult.isOk());
    std::string packageId = createResult.value().id;
    std::cout << "  ✓ Package created with ID: " << packageId << std::endl;

    auto getResult = client.getPackage(packageId);
    assert(getResult.isOk());
    assert(getResult.value().name == "forum");
    std::cout << "  ✓ Retrieved package by ID" << std::endl;

    dbal::UpdatePackageInput updateInput;
    updateInput.is_installed = true;
    updateInput.installed_by = userResult.value().id;
    updateInput.installed_at = std::chrono::system_clock::now();
    auto updateResult = client.updatePackage(packageId, updateInput);
    assert(updateResult.isOk());
    assert(updateResult.value().is_installed == true);
    std::cout << "  ✓ Package updated" << std::endl;

    dbal::ListOptions listOptions;
    listOptions.filter["is_installed"] = "true";
    auto listResult = client.listPackages(listOptions);
    assert(listResult.isOk());
    assert(listResult.value().size() >= 1);
    std::cout << "  ✓ Listed packages (filtered by is_installed=true)" << std::endl;

    auto deleteResult = client.deletePackage(packageId);
    assert(deleteResult.isOk());

    auto notFoundResult = client.getPackage(packageId);
    assert(notFoundResult.isError());
    std::cout << "  ✓ Package deleted" << std::endl;
}

void test_package_validation() {
    std::cout << "Testing package validation..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreatePackageInput input1;
    input1.name = "invalid-package";
    input1.version = "bad";
    input1.author = "MetaBuilder";
    input1.manifest = {{"entry", "index.lua"}};
    auto result1 = client.createPackage(input1);
    assert(result1.isError());
    assert(result1.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Invalid semver rejected" << std::endl;

    dbal::CreatePackageInput input2;
    input2.name = "duplicate-package";
    input2.version = "1.0.0";
    input2.author = "MetaBuilder";
    input2.manifest = {{"entry", "index.lua"}};
    auto result2 = client.createPackage(input2);
    assert(result2.isOk());

    dbal::CreatePackageInput input3 = input2;
    auto result3 = client.createPackage(input3);
    assert(result3.isError());
    assert(result3.error().code() == dbal::ErrorCode::Conflict);
    std::cout << "  ✓ Duplicate package version rejected" << std::endl;
}

void test_package_batch_operations() {
    std::cout << "Testing package batch operations..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    std::vector<dbal::CreatePackageInput> packages;
    dbal::CreatePackageInput package1;
    package1.name = "batch-package-1";
    package1.version = "1.0.0";
    package1.author = "MetaBuilder";
    package1.manifest = {{"entry", "index.lua"}};
    packages.push_back(package1);

    dbal::CreatePackageInput package2;
    package2.name = "batch-package-2";
    package2.version = "2.0.0";
    package2.author = "MetaBuilder";
    package2.manifest = {{"entry", "chat.lua"}};
    packages.push_back(package2);

    auto createResult = client.batchCreatePackages(packages);
    assert(createResult.isOk());
    assert(createResult.value() == 2);
    std::cout << "  ✓ Batch created packages" << std::endl;

    dbal::ListOptions listOptions;
    listOptions.limit = 10;
    auto listResult = client.listPackages(listOptions);
    assert(listResult.isOk());
    assert(listResult.value().size() >= 2);

    std::vector<dbal::UpdatePackageBatchItem> updates;
    dbal::UpdatePackageBatchItem update1;
    update1.id = listResult.value()[0].id;
    update1.data.is_installed = true;
    updates.push_back(update1);

    dbal::UpdatePackageBatchItem update2;
    update2.id = listResult.value()[1].id;
    update2.data.is_installed = true;
    updates.push_back(update2);

    auto updateResult = client.batchUpdatePackages(updates);
    assert(updateResult.isOk());
    assert(updateResult.value() == 2);
    std::cout << "  ✓ Batch updated packages" << std::endl;

    std::vector<std::string> ids;
    ids.push_back(listResult.value()[0].id);
    ids.push_back(listResult.value()[1].id);

    auto deleteResult = client.batchDeletePackages(ids);
    assert(deleteResult.isOk());
    assert(deleteResult.value() == 2);
    std::cout << "  ✓ Batch deleted packages" << std::endl;
}

void test_error_handling() {
    std::cout << "Testing comprehensive error handling..." << std::endl;
    
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);
    
    // Empty ID validation
    auto result1 = client.getUser("");
    assert(result1.isError());
    assert(result1.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Empty ID validation works" << std::endl;
    
    // Not found error
    auto result2 = client.getUser("nonexistent");
    assert(result2.isError());
    assert(result2.error().code() == dbal::ErrorCode::NotFound);
    std::cout << "  ✓ Not found error works" << std::endl;
}

int main() {
    std::cout << "==================================================" << std::endl;
    std::cout << "Running Comprehensive DBAL Client Unit Tests" << std::endl;
    std::cout << "==================================================" << std::endl;
    std::cout << std::endl;
    
    try {
        test_client_creation();
        test_client_config_validation();
        test_create_user();
        test_user_validation();
        test_user_conflicts();
        test_get_user();
        test_update_user();
        test_delete_user();
        test_list_users();
        test_user_batch_operations();
        test_page_crud();
        test_page_validation();
        test_workflow_crud();
        test_workflow_validation();
        test_session_crud();
        test_session_validation();
        test_lua_script_crud();
        test_lua_script_validation();
        test_package_crud();
        test_package_validation();
        test_package_batch_operations();
        test_error_handling();
        
        std::cout << std::endl;
        std::cout << "==================================================" << std::endl;
        std::cout << "✅ All 22 test suites passed!" << std::endl;
        std::cout << "==================================================" << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cerr << std::endl;
        std::cerr << "❌ Test failed: " << e.what() << std::endl;
        return 1;
    }
}
