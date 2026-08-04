cmake_minimum_required(VERSION 3.20)
project(codegen-backend LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Drogon REQUIRED)
find_package(SQLite3 REQUIRED)

add_executable(codegen-backend src/main.cpp src/util.cpp)
target_link_libraries(codegen-backend PRIVATE Drogon::Drogon SQLite::SQLite3)

install(TARGETS codegen-backend RUNTIME DESTINATION bin)

# Build tests locally/CI with: cmake .. -DBUILD_TESTING=ON
option(BUILD_TESTING "Build GTest unit tests" OFF)
if(BUILD_TESTING)
    enable_testing()
    find_package(GTest REQUIRED)
    find_package(jsoncpp REQUIRED)

    add_executable(codegen-backend-tests tests/util_test.cpp src/util.cpp)
    target_link_libraries(codegen-backend-tests PRIVATE GTest::gtest GTest::gtest_main JsonCpp::JsonCpp)

    add_test(NAME codegen-backend-tests COMMAND codegen-backend-tests)
endif()
