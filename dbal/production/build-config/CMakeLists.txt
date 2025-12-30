cmake_minimum_required(VERSION 3.20)
project(dbal VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(DBAL_ROOT ${CMAKE_CURRENT_LIST_DIR}/..)
set(DBAL_SRC_DIR ${DBAL_ROOT}/src)
set(DBAL_TEST_DIR ${DBAL_ROOT}/tests)
set(DBAL_INCLUDE_DIR ${DBAL_ROOT}/include)

find_package(Threads REQUIRED)

include_directories(${DBAL_INCLUDE_DIR} ${DBAL_INCLUDE_DIR}/dbal ${DBAL_SRC_DIR})

# Try to find Conan dependencies, but don't fail if they're not available
find_package(fmt QUIET)
find_package(spdlog QUIET)
find_package(nlohmann_json QUIET)
find_package(SQLite3 QUIET)
find_package(Drogon REQUIRED CONFIG)
find_package(cpr REQUIRED CONFIG)

add_library(dbal_core STATIC
    ${DBAL_SRC_DIR}/client.cpp
    ${DBAL_SRC_DIR}/errors.cpp
)

add_library(dbal_adapters STATIC
    ${DBAL_SRC_DIR}/adapters/sqlite/sqlite_adapter.cpp
    ${DBAL_SRC_DIR}/adapters/sqlite/sqlite_pool.cpp
    ${DBAL_SRC_DIR}/adapters/sql/postgres_adapter.cpp
    ${DBAL_SRC_DIR}/adapters/sql/mysql_adapter.cpp
)

target_link_libraries(dbal_adapters PRIVATE cpr::cpr)
add_executable(dbal_daemon
    ${DBAL_SRC_DIR}/daemon/main.cpp
    ${DBAL_SRC_DIR}/daemon/server.cpp
    ${DBAL_SRC_DIR}/daemon/server_routes.cpp
    ${DBAL_SRC_DIR}/daemon/server_helpers/network.cpp
    ${DBAL_SRC_DIR}/daemon/server_helpers/role.cpp
    ${DBAL_SRC_DIR}/daemon/server_helpers/serialization.cpp
    ${DBAL_SRC_DIR}/daemon/server_helpers/response.cpp
    ${DBAL_SRC_DIR}/daemon/rpc_user_actions.cpp
    ${DBAL_SRC_DIR}/daemon/rpc_schema_actions.cpp
    ${DBAL_SRC_DIR}/daemon/rpc_restful_handler.cpp
    ${DBAL_SRC_DIR}/daemon/security.cpp
)

target_link_libraries(dbal_daemon
    dbal_core
    dbal_adapters
    Threads::Threads
    Drogon::Drogon
)

# Link optional dependencies if available
if(fmt_FOUND)
    target_link_libraries(dbal_core fmt::fmt)
endif()

if(spdlog_FOUND)
    target_link_libraries(dbal_core spdlog::spdlog)
endif()

enable_testing()

add_executable(client_test
    ${DBAL_TEST_DIR}/unit/client_test.cpp
)

add_executable(query_test
    ${DBAL_TEST_DIR}/unit/query_test.cpp
)

add_executable(integration_tests
    ${DBAL_TEST_DIR}/integration/sqlite_test.cpp
)

add_executable(conformance_tests
    ${DBAL_TEST_DIR}/conformance/runner.cpp
)

add_executable(http_server_security_test
    ${DBAL_TEST_DIR}/security/http_server_security_test.cpp
)

target_link_libraries(client_test dbal_core dbal_adapters)
target_link_libraries(query_test dbal_core dbal_adapters)
target_link_libraries(integration_tests dbal_core dbal_adapters)
target_link_libraries(conformance_tests dbal_core dbal_adapters)
target_link_libraries(http_server_security_test Threads::Threads)

add_test(NAME client_test COMMAND client_test)
add_test(NAME query_test COMMAND query_test)
add_test(NAME integration_tests COMMAND integration_tests)
add_test(NAME conformance_tests COMMAND conformance_tests)

# =============================================================================
# Package Generator Tool (Lua-based)
# =============================================================================
find_package(lua QUIET)
find_package(sol2 QUIET)

if(lua_FOUND AND sol2_FOUND)
    message(STATUS "Building package_generator tool with Lua support")
    
    add_executable(package_generator
        ${DBAL_SRC_DIR}/tools/package_generator/main.cpp
    )
    
    target_include_directories(package_generator PRIVATE
        ${DBAL_SRC_DIR}/tools/package_generator
    )
    
    target_link_libraries(package_generator
        lua::lua
        sol2::sol2
    )
    
    if(nlohmann_json_FOUND)
        target_link_libraries(package_generator nlohmann_json::nlohmann_json)
    endif()
    
    install(TARGETS package_generator DESTINATION bin)
else()
    message(STATUS "Skipping package_generator (lua or sol2 not found)")
endif()

install(TARGETS dbal_daemon DESTINATION bin)
install(DIRECTORY ${DBAL_INCLUDE_DIR}/dbal DESTINATION include)

