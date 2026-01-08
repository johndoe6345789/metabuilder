cmake_minimum_required(VERSION 3.27)
project(metabuilder_cli VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

include(${CMAKE_BINARY_DIR}/conan_toolchain.cmake OPTIONAL)

add_executable(metabuilder-cli
    src/main.cpp
    src/commands/command_dispatch.cpp
    src/commands/dbal_commands.cpp
    src/commands/package_commands.cpp
    src/lua/lua_runner.cpp
    src/utils/http_client.cpp
)

find_package(cpr CONFIG REQUIRED)
find_package(lua REQUIRED)
find_package(sol2 REQUIRED)
find_package(nlohmann_json REQUIRED)

target_link_libraries(metabuilder-cli PRIVATE 
    cpr::cpr
    lua::lua
    sol2::sol2
    nlohmann_json::nlohmann_json
)
target_compile_features(metabuilder-cli PRIVATE cxx_std_20)
target_include_directories(metabuilder-cli PRIVATE src)

install(TARGETS metabuilder-cli
    RUNTIME DESTINATION bin
)
