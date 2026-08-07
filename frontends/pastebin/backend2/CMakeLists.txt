cmake_minimum_required(VERSION 3.20)
project(pastebin-backend LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Drogon REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(CURL REQUIRED)
find_package(SQLite3 REQUIRED)
find_package(jwt-cpp REQUIRED)
find_package(nlohmann_json REQUIRED)

set(PASTEBIN_SOURCES
    src/util.cpp
    src/services/Db.cpp
    src/services/DbalClient.cpp
    src/services/JwtAuth.cpp
    src/controllers/HealthCtrl.cpp
    src/controllers/AuthCtrl.cpp
    src/controllers/ProfileCtrl.cpp
)

add_executable(pastebin-server src/main.cpp ${PASTEBIN_SOURCES})
target_link_libraries(pastebin-server PRIVATE
    Drogon::Drogon
    OpenSSL::SSL
    CURL::libcurl
    SQLite::SQLite3
    jwt-cpp::jwt-cpp
    nlohmann_json::nlohmann_json
)

install(TARGETS pastebin-server RUNTIME DESTINATION bin)

# Build tests locally/CI with: cmake .. -DBUILD_TESTING=ON
option(BUILD_TESTING "Build GTest unit tests" OFF)
if(BUILD_TESTING)
    enable_testing()
    find_package(GTest REQUIRED)

    add_executable(pastebin-tests tests/util_test.cpp src/util.cpp)
    target_link_libraries(pastebin-tests PRIVATE GTest::gtest GTest::gtest_main)

    add_test(NAME pastebin-tests COMMAND pastebin-tests)
endif()
