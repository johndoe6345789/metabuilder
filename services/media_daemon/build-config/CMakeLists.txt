cmake_minimum_required(VERSION 3.20)
project(media_daemon CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Drogon REQUIRED)
find_package(nlohmann_json REQUIRED)
find_package(yaml-cpp REQUIRED)
find_package(spdlog REQUIRED)
find_package(fmt REQUIRED)

file(GLOB_RECURSE SOURCES "../src/*.cpp")
file(GLOB_RECURSE HEADERS "../include/*.hpp" "../include/*.h")

add_executable(media_daemon ${SOURCES} ${HEADERS})

target_include_directories(media_daemon PRIVATE ../include)

target_link_libraries(media_daemon PRIVATE
    Drogon::Drogon
    nlohmann_json::nlohmann_json
    yaml-cpp::yaml-cpp
    spdlog::spdlog
    fmt::fmt
)

install(TARGETS media_daemon DESTINATION bin)
