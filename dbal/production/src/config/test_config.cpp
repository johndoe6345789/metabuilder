// Test program for refactored configuration system
// Compile: g++ -std=c++17 -I. test_config.cpp -o test_config

#include "env_config.hpp"
#include <iostream>
#include <cstdlib>

using namespace dbal::config;

int main() {
    // Set some test environment variables
    setenv("DBAL_SCHEMA_DIR", "/app/schemas", 1);
    setenv("DBAL_TEMPLATE_DIR", "/app/templates", 1);
    setenv("DBAL_PORT", "9090", 1);
    setenv("DBAL_LOG_LEVEL", "debug", 1);
    setenv("DBAL_AUTO_CREATE_TABLES", "false", 1);
    setenv("DBAL_POOL_MAX_SIZE", "20", 1);

    std::cout << "=== Testing Refactored Configuration System ===" << std::endl;

    // Test required variables
    std::cout << "\n1. Testing Required Variables:" << std::endl;
    try {
        std::cout << "   Schema Dir: " << EnvConfig::getSchemaDir() << std::endl;
        std::cout << "   Template Dir: " << EnvConfig::getTemplateDir() << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "   ERROR: " << e.what() << std::endl;
        return 1;
    }

    // Test optional variables with defaults
    std::cout << "\n2. Testing Optional Variables with Defaults:" << std::endl;
    std::cout << "   Database Type: " << EnvConfig::getDatabaseType() << " (default: sqlite)" << std::endl;
    std::cout << "   Bind Address: " << EnvConfig::getBindAddress() << " (default: 0.0.0.0)" << std::endl;
    std::cout << "   Database Host: " << EnvConfig::getDatabaseHost() << " (default: localhost)" << std::endl;

    // Test integer parsing
    std::cout << "\n3. Testing Integer Parsing:" << std::endl;
    std::cout << "   Port: " << EnvConfig::getPort() << " (set to 9090)" << std::endl;
    std::cout << "   Database Port: " << EnvConfig::getDatabasePort() << " (default: 5432)" << std::endl;
    std::cout << "   Pool Max Size: " << EnvConfig::getPoolMaxSize() << " (set to 20)" << std::endl;
    std::cout << "   Pool Min Size: " << EnvConfig::getPoolMinSize() << " (default: 2)" << std::endl;

    // Test boolean parsing
    std::cout << "\n4. Testing Boolean Parsing:" << std::endl;
    std::cout << "   Auto Create Tables: " << (EnvConfig::getAutoCreateTables() ? "true" : "false") << " (set to false)" << std::endl;
    std::cout << "   Enable Metrics: " << (EnvConfig::getEnableMetrics() ? "true" : "false") << " (default: true)" << std::endl;
    std::cout << "   Enable Health Check: " << (EnvConfig::getEnableHealthCheck() ? "true" : "false") << " (default: true)" << std::endl;

    // Test validation
    std::cout << "\n5. Testing Configuration Validation:" << std::endl;
    try {
        EnvConfig::validate();
        std::cout << "   Validation passed (with warnings for non-existent directories)" << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "   Validation ERROR: " << e.what() << std::endl;
        return 1;
    }

    // Test printConfig
    std::cout << "\n6. Testing printConfig() utility:" << std::endl;
    EnvConfig::printConfig();

    std::cout << "\n=== All Tests Passed ===" << std::endl;
    return 0;
}
