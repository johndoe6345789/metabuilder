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
    src/utils/http_client.cpp
)

find_package(cpr CONFIG REQUIRED)

target_link_libraries(metabuilder-cli PRIVATE cpr::cpr)
target_compile_features(metabuilder-cli PRIVATE cxx_std_20)
target_include_directories(metabuilder-cli PRIVATE src)

install(TARGETS metabuilder-cli
    RUNTIME DESTINATION bin
)
