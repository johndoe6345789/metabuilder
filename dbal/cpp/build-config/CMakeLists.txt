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

include_directories(${DBAL_INCLUDE_DIR})

# Try to find Conan dependencies, but don't fail if they're not available
find_package(fmt QUIET)
find_package(spdlog QUIET)
find_package(nlohmann_json QUIET)
find_package(SQLite3 QUIET)
find_package(Drogon REQUIRED CONFIG)

add_library(dbal_core STATIC
    ${DBAL_SRC_DIR}/client.cpp
    ${DBAL_SRC_DIR}/errors.cpp
    ${DBAL_SRC_DIR}/capabilities.cpp
    ${DBAL_SRC_DIR}/query/ast.cpp
    ${DBAL_SRC_DIR}/query/builder.cpp
    ${DBAL_SRC_DIR}/query/normalize.cpp
    ${DBAL_SRC_DIR}/util/uuid.cpp
    ${DBAL_SRC_DIR}/util/backoff.cpp
)

add_library(dbal_adapters STATIC
    ${DBAL_SRC_DIR}/adapters/sqlite/sqlite_adapter.cpp
    ${DBAL_SRC_DIR}/adapters/sqlite/sqlite_pool.cpp
)

add_executable(dbal_daemon
    ${DBAL_SRC_DIR}/daemon/main.cpp
    ${DBAL_SRC_DIR}/daemon/server.cpp
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

install(TARGETS dbal_daemon DESTINATION bin)
install(DIRECTORY include/dbal DESTINATION include)
