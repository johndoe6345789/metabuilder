cmake_minimum_required(VERSION 3.20)
project(dbal VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Threads REQUIRED)

include_directories(include)

add_library(dbal_core STATIC
    src/client.cpp
    src/errors.cpp
    src/capabilities.cpp
    src/query/ast.cpp
    src/query/builder.cpp
    src/query/normalize.cpp
    src/util/uuid.cpp
    src/util/backoff.cpp
)

add_library(dbal_adapters STATIC
    src/adapters/sqlite/sqlite_adapter.cpp
    src/adapters/sqlite/sqlite_pool.cpp
)

add_executable(dbal_daemon
    src/daemon/main.cpp
    src/daemon/server.cpp
    src/daemon/security.cpp
)

target_link_libraries(dbal_daemon
    dbal_core
    dbal_adapters
    Threads::Threads
)

enable_testing()

add_executable(unit_tests
    tests/unit/client_test.cpp
    tests/unit/query_test.cpp
)

add_executable(integration_tests
    tests/integration/sqlite_test.cpp
)

add_executable(conformance_tests
    tests/conformance/runner.cpp
)

target_link_libraries(unit_tests dbal_core dbal_adapters)
target_link_libraries(integration_tests dbal_core dbal_adapters)
target_link_libraries(conformance_tests dbal_core dbal_adapters)

add_test(NAME unit_tests COMMAND unit_tests)
add_test(NAME integration_tests COMMAND integration_tests)
add_test(NAME conformance_tests COMMAND conformance_tests)

install(TARGETS dbal_daemon DESTINATION bin)
install(DIRECTORY include/dbal DESTINATION include)
