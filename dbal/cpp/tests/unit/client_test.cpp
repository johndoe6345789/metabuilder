#include "dbal/client.hpp"
#include "dbal/errors.hpp"
#include <iostream>
#include <cassert>
#include <chrono>
#include <vector>

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

void test_credential_crud() {
    std::cout << "Testing credential lifecycle..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreateUserInput userInput;
    userInput.username = "cred_user";
    userInput.email = "cred_user@example.com";
    auto userResult = client.createUser(userInput);
    assert(userResult.isOk());

    dbal::CreateCredentialInput credentialInput;
    credentialInput.username = userInput.username;
    credentialInput.password_hash = "hash123";

    auto setResult = client.setCredential(credentialInput);
    assert(setResult.isOk());
    std::cout << "  ✓ Credential stored" << std::endl;

    auto verifyResult = client.verifyCredential(userInput.username, "hash123");
    assert(verifyResult.isOk());
    std::cout << "  ✓ Verified credential" << std::endl;

    auto invalidVerify = client.verifyCredential(userInput.username, "wrong");
    assert(invalidVerify.isError());
    assert(invalidVerify.error().code() == dbal::ErrorCode::Unauthorized);
    std::cout << "  ✓ Unauthorized for wrong password" << std::endl;

    credentialInput.password_hash = "hash456";
    auto updateResult = client.setCredential(credentialInput);
    assert(updateResult.isOk());
    std::cout << "  ✓ Credential updated" << std::endl;

    auto flagResult = client.setCredentialFirstLoginFlag(userInput.username, false);
    assert(flagResult.isOk());
    auto firstLogin = client.getCredentialFirstLoginFlag(userInput.username);
    assert(firstLogin.isOk());
    assert(firstLogin.value() == false);
    std::cout << "  ✓ First login flag toggled" << std::endl;

    auto deleteResult = client.deleteCredential(userInput.username);
    assert(deleteResult.isOk());
    std::cout << "  ✓ Credential deleted" << std::endl;

    auto missingFlag = client.getCredentialFirstLoginFlag(userInput.username);
    assert(missingFlag.isError());
    assert(missingFlag.error().code() == dbal::ErrorCode::NotFound);
    std::cout << "  ✓ Deleted credential no longer accessible" << std::endl;
}

void test_credential_validation() {
    std::cout << "Testing credential validation..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreateCredentialInput missingUser;
    missingUser.username = "missing_user";
    missingUser.password_hash = "hash";
    auto missingResult = client.setCredential(missingUser);
    assert(missingResult.isError());
    assert(missingResult.error().code() == dbal::ErrorCode::NotFound);
    std::cout << "  ✓ Missing user rejected" << std::endl;

    dbal::CreateUserInput userInput;
    userInput.username = "validation_user";
    userInput.email = "validation_user@example.com";
    auto userResult = client.createUser(userInput);
    assert(userResult.isOk());

    dbal::CreateCredentialInput invalidPassword;
    invalidPassword.username = userInput.username;
    invalidPassword.password_hash = "";
    auto invalidResult = client.setCredential(invalidPassword);
    assert(invalidResult.isError());
    assert(invalidResult.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Empty password hash rejected" << std::endl;
}

void test_user_search() {
    std::cout << "Testing user search..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreateUserInput user1;
    user1.username = "search_alpha";
    user1.email = "alpha@example.com";
    auto result1 = client.createUser(user1);
    assert(result1.isOk());

    dbal::CreateUserInput user2;
    user2.username = "search_beta";
    user2.email = "beta@examples.com";
    auto result2 = client.createUser(user2);
    assert(result2.isOk());

    auto found = client.searchUsers("search", 10);
    assert(found.isOk());
    assert(found.value().size() >= 2);
    std::cout << "  ✓ Search matched multiple users" << std::endl;

    auto caseInsensitive = client.searchUsers("SEARCH_BETA", 10);
    assert(caseInsensitive.isOk());
    assert(caseInsensitive.value().size() == 1);
    assert(caseInsensitive.value()[0].username == "search_beta");
    std::cout << "  ✓ Search is case-insensitive" << std::endl;

    auto limited = client.searchUsers("search", 1);
    assert(limited.isOk());
    assert(limited.value().size() == 1);
    std::cout << "  ✓ Search respects limit" << std::endl;
}

void test_user_count() {
    std::cout << "Testing user count..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreateUserInput user;
    user.username = "count_user";
    user.email = "count@example.com";
    auto result = client.createUser(user);
    assert(result.isOk());

    dbal::CreateUserInput admin;
    admin.username = "count_admin";
    admin.email = "count_admin@example.com";
    admin.role = dbal::UserRole::Admin;
    auto adminResult = client.createUser(admin);
    assert(adminResult.isOk());

    auto totalCount = client.countUsers();
    assert(totalCount.isOk());
    assert(totalCount.value() >= 2);
    std::cout << "  ✓ Total user count matches" << std::endl;

    auto adminCount = client.countUsers(dbal::UserRole::Admin);
    assert(adminCount.isOk());
    assert(adminCount.value() >= 1);
    std::cout << "  ✓ Admin count matches" << std::endl;
}

void test_user_bulk_filters() {
    std::cout << "Testing bulk user filters..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreateUserInput user1;
    user1.username = "bulk_user_1";
    user1.email = "bulk_user_1@example.com";
    auto res1 = client.createUser(user1);
    assert(res1.isOk());

    dbal::CreateUserInput user2;
    user2.username = "bulk_user_2";
    user2.email = "bulk_user_2@example.com";
    auto res2 = client.createUser(user2);
    assert(res2.isOk());

    dbal::CreateUserInput admin;
    admin.username = "bulk_admin";
    admin.email = "bulk_admin@example.com";
    admin.role = dbal::UserRole::Admin;
    auto adminRes = client.createUser(admin);
    assert(adminRes.isOk());

    dbal::UpdateUserInput update;
    update.role = dbal::UserRole::Admin;
    std::map<std::string, std::string> filter;
    filter["role"] = "user";
    auto updateMany = client.updateManyUsers(filter, update);
    assert(updateMany.isOk());
    assert(updateMany.value() >= 2);
    std::cout << "  ✓ Bulk update applied" << std::endl;

    auto adminCount = client.countUsers(dbal::UserRole::Admin);
    assert(adminCount.isOk());
    assert(adminCount.value() >= 3);

    std::map<std::string, std::string> deleteFilter;
    deleteFilter["role"] = "admin";
    auto deleteMany = client.deleteManyUsers(deleteFilter);
    assert(deleteMany.isOk());
    assert(deleteMany.value() >= 3);
    auto remainingAdmin = client.countUsers(dbal::UserRole::Admin);
    assert(remainingAdmin.isOk());
    assert(remainingAdmin.value() == 0);
    std::cout << "  ✓ Bulk delete removed updated admins" << std::endl;
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

void test_page_search() {
    std::cout << "Testing page search..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreatePageInput page1;
    page1.slug = "search-page";
    page1.title = "Search Page";
    page1.level = 1;
    page1.layout = {{"row", "one"}};
    page1.is_active = true;
    auto result1 = client.createPage(page1);
    assert(result1.isOk());

    dbal::CreatePageInput page2;
    page2.slug = "other-page";
    page2.title = "Other Search";
    page2.level = 1;
    page2.layout = {{"row", "two"}};
    page2.is_active = true;
    auto result2 = client.createPage(page2);
    assert(result2.isOk());

    auto matches = client.searchPages("search", 10);
    assert(matches.isOk());
    assert(matches.value().size() >= 2);
    std::cout << "  ✓ Search finds both pages" << std::endl;

    auto limited = client.searchPages("search", 1);
    assert(limited.isOk());
    assert(limited.value().size() == 1);
    std::cout << "  ✓ Search respects limit" << std::endl;

    auto caseInsensitive = client.searchPages("SEARCH", 10);
    assert(caseInsensitive.isOk());
    assert(!caseInsensitive.value().empty());
    std::cout << "  ✓ Search is case-insensitive" << std::endl;
}

void test_component_crud() {
    std::cout << "Testing component CRUD operations..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreatePageInput pageInput;
    pageInput.slug = "component-page";
    pageInput.title = "Component Page";
    pageInput.level = 1;
    pageInput.layout = {{"region", "root"}};
    pageInput.is_active = true;

    auto pageResult = client.createPage(pageInput);
    assert(pageResult.isOk());
    std::string pageId = pageResult.value().id;

    dbal::CreateComponentHierarchyInput rootInput;
    rootInput.page_id = pageId;
    rootInput.component_type = "Container";
    rootInput.order = 0;
    rootInput.props = {{"role", "root"}};

    auto rootResult = client.createComponent(rootInput);
    assert(rootResult.isOk());
    std::string rootId = rootResult.value().id;
    std::cout << "  ✓ Root component created" << std::endl;

    dbal::CreateComponentHierarchyInput childInput;
    childInput.page_id = pageId;
    childInput.parent_id = rootId;
    childInput.component_type = "Button";
    childInput.order = 1;
    childInput.props = {{"label", "Click"}};

    auto childResult = client.createComponent(childInput);
    assert(childResult.isOk());
    std::string childId = childResult.value().id;
    std::cout << "  ✓ First child component created" << std::endl;

    dbal::CreateComponentHierarchyInput siblingInput;
    siblingInput.page_id = pageId;
    siblingInput.parent_id = rootId;
    siblingInput.component_type = "Text";
    siblingInput.order = 3;
    siblingInput.props = {{"content", "sidebar"}};

    auto siblingResult = client.createComponent(siblingInput);
    assert(siblingResult.isOk());
    std::string siblingId = siblingResult.value().id;
    std::cout << "  ✓ Second child component created" << std::endl;

    dbal::UpdateComponentHierarchyInput updateInput;
    updateInput.order = 2;
    auto updateResult = client.updateComponent(childId, updateInput);
    assert(updateResult.isOk());
    assert(updateResult.value().order == 2);
    std::cout << "  ✓ Component order updated" << std::endl;

    auto treeResult = client.getComponentTree(pageId);
    assert(treeResult.isOk());
    assert(treeResult.value().size() == 3);
    std::cout << "  ✓ Retrieved component tree" << std::endl;

    dbal::ListOptions parentFilter;
    parentFilter.filter["pageId"] = pageId;
    parentFilter.filter["parent_id"] = rootId;
    auto parentList = client.listComponents(parentFilter);
    assert(parentList.isOk());
    assert(parentList.value().size() == 2);
    std::cout << "  ✓ Parent filter works" << std::endl;

    dbal::ListOptions typeFilter;
    typeFilter.filter["pageId"] = pageId;
    typeFilter.filter["component_type"] = "Text";
    auto typeList = client.listComponents(typeFilter);
    assert(typeList.isOk());
    assert(!typeList.value().empty());
    for (const auto& entry : typeList.value()) {
        assert(entry.component_type == "Text");
    }
    std::cout << "  ✓ Component type filter works" << std::endl;

    std::vector<ComponentOrderUpdate> reorderUpdates = {
        {childId, 5},
        {siblingId, 1},
    };
    auto reorderResult = client.reorderComponents(reorderUpdates);
    assert(reorderResult.isOk());
    auto childAfter = client.getComponent(childId);
    auto siblingAfter = client.getComponent(siblingId);
    assert(childAfter.isOk() && childAfter.value().order == 5);
    assert(siblingAfter.isOk() && siblingAfter.value().order == 1);
    std::cout << "  ✓ Components reordered" << std::endl;

    dbal::CreateComponentHierarchyInput otherRootInput;
    otherRootInput.page_id = pageId;
    otherRootInput.component_type = "Sidebar";
    otherRootInput.order = 0;
    otherRootInput.props = {{"region", "secondary"}};

    auto otherRootResult = client.createComponent(otherRootInput);
    assert(otherRootResult.isOk());
    std::string otherRootId = otherRootResult.value().id;
    std::cout << "  ✓ Secondary root created" << std::endl;

    dbal::MoveComponentInput moveInput;
    moveInput.id = siblingId;
    moveInput.new_parent_id = otherRootId;
    moveInput.order = 0;
    auto moveResult = client.moveComponent(moveInput);
    assert(moveResult.isOk());
    auto movedSibling = client.getComponent(siblingId);
    assert(movedSibling.isOk());
    assert(movedSibling.value().parent_id.has_value());
    assert(movedSibling.value().parent_id.value() == otherRootId);
    assert(movedSibling.value().order == 0);
    std::cout << "  ✓ Component moved to new parent" << std::endl;

    auto deleteResult = client.deleteComponent(rootId);
    assert(deleteResult.isOk());
    auto childLookup = client.getComponent(childId);
    assert(childLookup.isError());
    assert(childLookup.error().code() == dbal::ErrorCode::NotFound);
    std::cout << "  ✓ Cascading delete removed first child" << std::endl;

    auto stillExists = client.getComponent(siblingId);
    assert(stillExists.isOk());
    std::cout << "  ✓ Moved sibling survived root deletion" << std::endl;
}

void test_component_validation() {
    std::cout << "Testing component validation..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreatePageInput pageInput;
    pageInput.slug = "component-validation";
    pageInput.title = "Component Validation";
    pageInput.level = 1;
    pageInput.layout = {{"mode", "validate"}};
    pageInput.is_active = true;

    auto pageResult = client.createPage(pageInput);
    assert(pageResult.isOk());
    std::string pageId = pageResult.value().id;

    dbal::CreateComponentHierarchyInput missingPage;
    missingPage.page_id = "missing-page";
    missingPage.component_type = "Leaf";
    missingPage.order = 0;
    missingPage.props = {{"key", "value"}};
    auto missingResult = client.createComponent(missingPage);
    assert(missingResult.isError());
    assert(missingResult.error().code() == dbal::ErrorCode::NotFound);
    std::cout << "  ✓ Missing page rejected" << std::endl;

    dbal::CreateComponentHierarchyInput longType;
    longType.page_id = pageId;
    longType.component_type = std::string(101, 'x');
    longType.order = 0;
    longType.props = {{"key", "value"}};
    auto longResult = client.createComponent(longType);
    assert(longResult.isError());
    assert(longResult.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Oversized component type rejected" << std::endl;

    dbal::CreateComponentHierarchyInput badOrder;
    badOrder.page_id = pageId;
    badOrder.component_type = "Leaf";
    badOrder.order = -1;
    badOrder.props = {{"key", "value"}};
    auto orderResult = client.createComponent(badOrder);
    assert(orderResult.isError());
    assert(orderResult.error().code() == dbal::ErrorCode::ValidationError);
    std::cout << "  ✓ Negative order rejected" << std::endl;
}

void test_component_search() {
    std::cout << "Testing component search..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreatePageInput pageInput;
    pageInput.slug = "component-search";
    pageInput.title = "Component Search";
    pageInput.level = 1;
    pageInput.layout = {{"row", "search"}};
    pageInput.is_active = true;
    auto pageResult = client.createPage(pageInput);
    assert(pageResult.isOk());
    std::string pageId = pageResult.value().id;

    dbal::CreateComponentHierarchyInput targetInput;
    targetInput.page_id = pageId;
    targetInput.component_type = "SearchButton";
    targetInput.order = 0;
    targetInput.props = {{"payload", "find-me"}};
    auto targetResult = client.createComponent(targetInput);
    assert(targetResult.isOk());
    std::string targetId = targetResult.value().id;

    auto typeSearch = client.searchComponents("searchbutton", pageId);
    assert(typeSearch.isOk());
    assert(!typeSearch.value().empty());
    bool foundType = std::any_of(typeSearch.value().begin(), typeSearch.value().end(), [&](const dbal::ComponentHierarchy& entry) {
        return entry.id == targetId;
    });
    assert(foundType);
    std::cout << "  ✓ Component type search works" << std::endl;

    auto propSearch = client.searchComponents("find-me", pageId);
    assert(propSearch.isOk());
    bool foundProp = std::any_of(propSearch.value().begin(), propSearch.value().end(), [&](const dbal::ComponentHierarchy& entry) {
        return entry.id == targetId;
    });
    assert(foundProp);
    std::cout << "  ✓ Component prop search works" << std::endl;
}

void test_component_children() {
    std::cout << "Testing component children retrieval..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreatePageInput pageInput;
    pageInput.slug = "component-children";
    pageInput.title = "Component Children";
    pageInput.level = 1;
    pageInput.layout = {{"tree", "root"}};
    pageInput.is_active = true;
    auto pageResult = client.createPage(pageInput);
    assert(pageResult.isOk());
    std::string pageId = pageResult.value().id;

    dbal::CreateComponentHierarchyInput rootInput;
    rootInput.page_id = pageId;
    rootInput.component_type = "Root";
    rootInput.order = 0;
    rootInput.props = {{"depth", "0"}};
    auto rootResult = client.createComponent(rootInput);
    assert(rootResult.isOk());
    std::string rootId = rootResult.value().id;

    dbal::CreateComponentHierarchyInput childInput;
    childInput.page_id = pageId;
    childInput.parent_id = rootId;
    childInput.component_type = "Child";
    childInput.order = 0;
    childInput.props = {{"depth", "1"}};
    auto childResult = client.createComponent(childInput);
    assert(childResult.isOk());
    std::string childId = childResult.value().id;

    dbal::CreateComponentHierarchyInput grandchildInput;
    grandchildInput.page_id = pageId;
    grandchildInput.parent_id = childId;
    grandchildInput.component_type = "Grandchild";
    grandchildInput.order = 0;
    grandchildInput.props = {{"depth", "2"}};
    auto grandchildResult = client.createComponent(grandchildInput);
    assert(grandchildResult.isOk());

    auto rootChildren = client.getComponentChildren(rootId);
    assert(rootChildren.isOk());
    assert(rootChildren.value().size() == 1);
    assert(rootChildren.value()[0].id == childId);
    std::cout << "  ✓ Retrieved direct children of root" << std::endl;

    auto childChildren = client.getComponentChildren(childId);
    assert(childChildren.isOk());
    assert(childChildren.value().size() == 1);
    assert(childChildren.value()[0].component_type == "Grandchild");
    std::cout << "  ✓ Retrieved grandchildren for child" << std::endl;

    auto missing = client.getComponentChildren("nonexistent");
    assert(missing.isError());
    assert(missing.error().code() == dbal::ErrorCode::NotFound);
    std::cout << "  ✓ Missing component returns not found" << std::endl;
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

void test_lua_script_search() {
    std::cout << "Testing Lua script search..." << std::endl;

    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    dbal::Client client(config);

    dbal::CreateUserInput userInput;
    userInput.username = "lua_search_owner";
    userInput.email = "lua_search_owner@example.com";
    auto userResult = client.createUser(userInput);
    assert(userResult.isOk());

    dbal::CreateLuaScriptInput scriptInput;
    scriptInput.name = "search_script";
    scriptInput.code = "return 'search'";
    scriptInput.allowed_globals = {"math"};
    scriptInput.created_by = userResult.value().id;
    auto createResult = client.createLuaScript(scriptInput);
    assert(createResult.isOk());

    dbal::CreateLuaScriptInput otherInput = scriptInput;
    otherInput.name = "other_script";
    otherInput.code = "return 'other'";
    auto otherResult = client.createLuaScript(otherInput);
    assert(otherResult.isOk());

    auto searchResult = client.searchLuaScripts("search", userResult.value().id, 10);
    assert(searchResult.isOk());
    assert(searchResult.value().size() == 1);
    std::cout << "  ✓ Script name search works" << std::endl;

    auto codeSearch = client.searchLuaScripts("return 'other'", std::nullopt, 10);
    assert(codeSearch.isOk());
    assert(codeSearch.value().size() >= 1);
    std::cout << "  ✓ Script code search works" << std::endl;
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
        test_user_search();
        test_user_count();
        test_user_bulk_filters();
        test_credential_crud();
        test_credential_validation();
        test_get_user();
        test_update_user();
        test_delete_user();
        test_list_users();
        test_user_batch_operations();
        test_page_crud();
        test_page_validation();
        test_page_search();
        test_component_crud();
        test_component_validation();
        test_component_search();
        test_component_children();
        test_workflow_crud();
        test_workflow_validation();
        test_session_crud();
        test_session_validation();
        test_lua_script_crud();
        test_lua_script_validation();
        test_lua_script_search();
        test_package_crud();
        test_package_validation();
        test_package_batch_operations();
        test_error_handling();
        
        std::cout << std::endl;
        std::cout << "==================================================" << std::endl;
        std::cout << "✅ All 33 test suites passed!" << std::endl;
        std::cout << "==================================================" << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cerr << std::endl;
        std::cerr << "❌ Test failed: " << e.what() << std::endl;
        return 1;
    }
}
