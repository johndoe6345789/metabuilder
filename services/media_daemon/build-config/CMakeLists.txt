cmake_minimum_required(VERSION 3.20)
project(media_daemon VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Directories
set(MEDIA_ROOT ${CMAKE_CURRENT_LIST_DIR}/..)
set(MEDIA_SRC_DIR ${MEDIA_ROOT}/src)
set(MEDIA_INCLUDE_DIR ${MEDIA_ROOT}/include)
set(MEDIA_TEST_DIR ${MEDIA_ROOT}/tests)

# Find required packages
find_package(Threads REQUIRED)
find_package(Drogon REQUIRED CONFIG)
find_package(cpr REQUIRED CONFIG)
find_package(fmt QUIET)
find_package(spdlog QUIET)
find_package(nlohmann_json QUIET)

# Include directories
include_directories(
    ${MEDIA_INCLUDE_DIR}
    ${MEDIA_SRC_DIR}
)

# ============================================================================
# Core Library
# ============================================================================

add_library(media_core STATIC
    ${MEDIA_SRC_DIR}/types.cpp
    ${MEDIA_SRC_DIR}/plugin_manager.cpp
    ${MEDIA_SRC_DIR}/job_queue.cpp
    ${MEDIA_SRC_DIR}/radio_engine.cpp
    ${MEDIA_SRC_DIR}/tv_engine.cpp
    ${MEDIA_SRC_DIR}/dbal_client.cpp
)

target_link_libraries(media_core
    Threads::Threads
    cpr::cpr
    ${CMAKE_DL_LIBS}  # For dynamic loading
)

if(fmt_FOUND)
    target_link_libraries(media_core fmt::fmt)
endif()

if(spdlog_FOUND)
    target_link_libraries(media_core spdlog::spdlog)
endif()

# ============================================================================
# Built-in Plugins
# ============================================================================

add_library(media_plugins STATIC
    ${MEDIA_SRC_DIR}/plugins/ffmpeg_plugin.cpp
    ${MEDIA_SRC_DIR}/plugins/imagemagick_plugin.cpp
    ${MEDIA_SRC_DIR}/plugins/pandoc_plugin.cpp
)

target_link_libraries(media_plugins
    media_core
)

# ============================================================================
# Server
# ============================================================================

add_library(media_server STATIC
    ${MEDIA_SRC_DIR}/server.cpp
    ${MEDIA_SRC_DIR}/routes/health_routes.cpp
    ${MEDIA_SRC_DIR}/routes/job_routes.cpp
    ${MEDIA_SRC_DIR}/routes/radio_routes.cpp
    ${MEDIA_SRC_DIR}/routes/tv_routes.cpp
    ${MEDIA_SRC_DIR}/routes/plugin_routes.cpp
)

target_link_libraries(media_server
    media_core
    media_plugins
    Drogon::Drogon
)

# ============================================================================
# Main Executable
# ============================================================================

add_executable(media_daemon
    ${MEDIA_SRC_DIR}/main.cpp
)

target_link_libraries(media_daemon
    media_server
    media_core
    media_plugins
)

# ============================================================================
# Plugin Shared Library Template
# ============================================================================

# Example of how to build an external plugin
# add_library(my_custom_plugin SHARED
#     ${MEDIA_SRC_DIR}/plugins/custom/my_plugin.cpp
# )
# target_link_libraries(my_custom_plugin media_core)

# ============================================================================
# Tests
# ============================================================================

enable_testing()

add_executable(job_queue_test
    ${MEDIA_TEST_DIR}/unit/job_queue_test.cpp
)
target_link_libraries(job_queue_test media_core)

add_executable(plugin_manager_test
    ${MEDIA_TEST_DIR}/unit/plugin_manager_test.cpp
)
target_link_libraries(plugin_manager_test media_core)

add_executable(radio_engine_test
    ${MEDIA_TEST_DIR}/unit/radio_engine_test.cpp
)
target_link_libraries(radio_engine_test media_core)

add_executable(tv_engine_test
    ${MEDIA_TEST_DIR}/unit/tv_engine_test.cpp
)
target_link_libraries(tv_engine_test media_core)

add_test(NAME job_queue_test COMMAND job_queue_test)
add_test(NAME plugin_manager_test COMMAND plugin_manager_test)
add_test(NAME radio_engine_test COMMAND radio_engine_test)
add_test(NAME tv_engine_test COMMAND tv_engine_test)

# ============================================================================
# Installation
# ============================================================================

install(TARGETS media_daemon
    RUNTIME DESTINATION bin
)

install(DIRECTORY ${MEDIA_INCLUDE_DIR}/media
    DESTINATION include
)

install(FILES ${MEDIA_ROOT}/config/media-daemon.yaml
    DESTINATION etc/media-daemon
    RENAME config.yaml
)
