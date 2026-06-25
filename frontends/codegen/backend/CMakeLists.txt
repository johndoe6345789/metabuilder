cmake_minimum_required(VERSION 3.20)
project(codegen-backend LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Drogon REQUIRED)
find_package(SQLite3 REQUIRED)

add_executable(codegen-backend src/main.cpp)
target_link_libraries(codegen-backend PRIVATE Drogon::Drogon SQLite::SQLite3)

install(TARGETS codegen-backend RUNTIME DESTINATION bin)
