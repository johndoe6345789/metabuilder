#include "dbal/client.hpp"
#include "dbal/errors.hpp"
#include <iostream>
#include <cassert>

void test_client_creation() {
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    config.sandbox_enabled = true;
    
    dbal::Client client(config);
    std::cout << "✓ Client creation test passed" << std::endl;
}

void test_create_user() {
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
    
    std::cout << "✓ Create user test passed" << std::endl;
}

void test_error_handling() {
    dbal::ClientConfig config;
    config.adapter = "sqlite";
    config.database_url = ":memory:";
    
    dbal::Client client(config);
    
    auto result = client.getUser("nonexistent");
    assert(result.isError());
    assert(result.error().code() == dbal::ErrorCode::NotFound);
    
    std::cout << "✓ Error handling test passed" << std::endl;
}

int main() {
    std::cout << "Running DBAL Client Unit Tests..." << std::endl;
    std::cout << std::endl;
    
    try {
        test_client_creation();
        test_create_user();
        test_error_handling();
        
        std::cout << std::endl;
        std::cout << "All unit tests passed!" << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Test failed: " << e.what() << std::endl;
        return 1;
    }
}
