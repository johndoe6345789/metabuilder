cmake_minimum_required(VERSION 3.20)
project(email-service-backend LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Drogon REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(CURL REQUIRED)

set(EMAIL_SERVICE_SOURCES
    src/util.cpp
    src/services/Db.cpp
    src/services/ImapClient.cpp
    src/services/SmtpClient.cpp
    src/controllers/HealthCtrl.cpp
    src/controllers/AccountsCtrl.cpp
    src/controllers/ComposeCtrl.cpp
    src/controllers/FoldersCtrl.cpp
    src/controllers/SyncCtrl.cpp
)

add_executable(email-service-server src/main.cpp ${EMAIL_SERVICE_SOURCES})
target_link_libraries(email-service-server PRIVATE Drogon::Drogon OpenSSL::SSL CURL::libcurl)

install(TARGETS email-service-server RUNTIME DESTINATION bin)

# Build tests locally/CI with: cmake .. -DBUILD_TESTING=ON
option(BUILD_TESTING "Build GTest unit tests" OFF)
if(BUILD_TESTING)
    enable_testing()
    find_package(GTest REQUIRED)

    add_executable(email-service-tests tests/util_test.cpp src/util.cpp)
    target_link_libraries(email-service-tests PRIVATE GTest::gtest GTest::gtest_main)

    add_test(NAME email-service-tests COMMAND email-service-tests)
endif()
