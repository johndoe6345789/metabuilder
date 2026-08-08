cmake_minimum_required(VERSION 3.20)
project(email-service-backend LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_compile_options(-Wall -Wextra -Wpedantic -Werror)

# Re-marks a dependency's own headers as SYSTEM on `target` so -Werror
# never fails on a warning we don't control (see GTest's char8_t/char32_t
# diagnostic under Clang, which this exists to route around).
function(silence_vendor_warnings target dependency)
    get_target_property(inc ${dependency} INTERFACE_INCLUDE_DIRECTORIES)
    if(inc)
        target_include_directories(${target} SYSTEM PRIVATE ${inc})
    endif()
endfunction()

find_package(Drogon REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(CURL REQUIRED)
find_package(jwt-cpp REQUIRED)
find_package(nlohmann_json REQUIRED)

set(EMAIL_SERVICE_UTIL_SOURCES
    src/util_env.cpp
    src/util_address.cpp
    src/util_mime.cpp
    src/util_imap_list.cpp
    src/util_imap_literal.cpp
    src/util_imap_fetch.cpp
)

set(EMAIL_SERVICE_SOURCES
    ${EMAIL_SERVICE_UTIL_SOURCES}
    src/services/CurlHandle.cpp
    src/services/DbalClient.cpp
    src/services/DbalClient_method.cpp
    src/services/DbalClient_pages.cpp
    src/services/EncryptedSecretClient.cpp
    src/services/EnsureFolder.cpp
    src/services/JsonConvert.cpp
    src/services/Uuid.cpp
    src/services/JwtJwks_fetch.cpp
    src/services/JwtJwks_findkey.cpp
    src/services/JwtJwks_key.cpp
    src/services/JwtJwks.cpp
    src/services/JwtAuth.cpp
    src/services/ImapClient_curl.cpp
    src/services/ImapClient_list.cpp
    src/services/ImapClient_fetch.cpp
    src/services/SmtpClient_upload.cpp
    src/services/SmtpClient.cpp
    src/controllers/HealthCtrl.cpp
    src/controllers/AccountsCtrl_json.cpp
    src/controllers/AccountsCtrl_list.cpp
    src/controllers/AccountsCtrl_create.cpp
    src/controllers/AccountsCtrl_get.cpp
    src/controllers/AccountsCtrl_remove.cpp
    src/controllers/ComposeCtrl_json.cpp
    src/controllers/ComposeCtrl_send_helper.cpp
    src/controllers/ComposeCtrl_send.cpp
    src/controllers/ComposeCtrl_drafts.cpp
    src/controllers/FoldersCtrl.cpp
    src/controllers/SyncCtrl_ingest.cpp
    src/controllers/SyncCtrl_trigger.cpp
    src/controllers/SyncCtrl_status.cpp
)

add_executable(email-service-server src/main.cpp ${EMAIL_SERVICE_SOURCES})
target_link_libraries(email-service-server PRIVATE
    Drogon::Drogon OpenSSL::SSL CURL::libcurl
    jwt-cpp::jwt-cpp nlohmann_json::nlohmann_json)
silence_vendor_warnings(email-service-server Drogon::Drogon)
silence_vendor_warnings(email-service-server CURL::libcurl)
silence_vendor_warnings(email-service-server jwt-cpp::jwt-cpp)
silence_vendor_warnings(email-service-server nlohmann_json::nlohmann_json)

install(TARGETS email-service-server RUNTIME DESTINATION bin)

# Build tests locally/CI with: cmake .. -DBUILD_TESTING=ON
option(BUILD_TESTING "Build GTest unit tests" OFF)
if(BUILD_TESTING)
    enable_testing()
    find_package(GTest REQUIRED)

    add_executable(email-service-tests
        tests/util_env_test.cpp
        tests/util_address_test.cpp
        tests/util_mime_test.cpp
        tests/util_imap_list_test.cpp
        tests/util_imap_fetch_test.cpp
        ${EMAIL_SERVICE_UTIL_SOURCES}
    )
    target_link_libraries(email-service-tests PRIVATE
        GTest::gtest GTest::gtest_main)
    silence_vendor_warnings(email-service-tests GTest::gtest)

    add_test(NAME email-service-tests COMMAND email-service-tests)
endif()
