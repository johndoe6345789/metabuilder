#include "dbal/client.hpp"
#include "dbal/errors.hpp"
#include <iostream>
#include <cassert>

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
        test_page_crud();
        test_page_validation();
        test_error_handling();
        
        std::cout << std::endl;
        std::cout << "==================================================" << std::endl;
        std::cout << "✅ All 12 test suites passed!" << std::endl;
        std::cout << "==================================================" << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cerr << std::endl;
        std::cerr << "❌ Test failed: " << e.what() << std::endl;
        return 1;
    }
}
