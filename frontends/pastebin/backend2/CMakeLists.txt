cmake_minimum_required(VERSION 3.20)
project(pastebin-backend LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_compile_options(-Wall -Wextra -Wpedantic -Werror)

# Re-marks a dependency's own headers as SYSTEM on `target` so -Werror
# never fails on a warning we don't control.
function(silence_vendor_warnings target dependency)
    get_target_property(inc ${dependency} INTERFACE_INCLUDE_DIRECTORIES)
    if(inc)
        target_include_directories(${target} SYSTEM PRIVATE ${inc})
    endif()
endfunction()

find_package(Drogon REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(CURL REQUIRED)
find_package(SQLite3 REQUIRED)
find_package(jwt-cpp REQUIRED)
find_package(nlohmann_json REQUIRED)

set(PASTEBIN_UTIL_SOURCES
    src/util.cpp
)

set(PASTEBIN_SOURCES
    ${PASTEBIN_UTIL_SOURCES}
    src/services/Db.cpp
    src/services/DbSettings.cpp
    src/services/CurlHandle.cpp
    src/services/DbalClient.cpp
    src/services/DbalClient_method.cpp
    src/services/DbalClient_pages.cpp
    src/services/JsonConvert.cpp
    src/services/JwtJwks_fetch.cpp
    src/services/JwtJwks_findkey.cpp
    src/services/JwtJwks_key.cpp
    src/services/JwtJwks.cpp
    src/services/JwtAuth.cpp
    src/controllers/HealthCtrl.cpp
    src/controllers/AuthCtrl_me.cpp
    src/controllers/AuthCtrl_settings.cpp
    src/controllers/ProfileCtrl_get.cpp
    src/controllers/ProfileCtrl_update.cpp
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
silence_vendor_warnings(pastebin-server Drogon::Drogon)
silence_vendor_warnings(pastebin-server CURL::libcurl)
silence_vendor_warnings(pastebin-server jwt-cpp::jwt-cpp)
silence_vendor_warnings(pastebin-server nlohmann_json::nlohmann_json)

install(TARGETS pastebin-server RUNTIME DESTINATION bin)

# Build tests locally/CI with: cmake .. -DBUILD_TESTING=ON
option(BUILD_TESTING "Build GTest unit tests" OFF)
if(BUILD_TESTING)
    enable_testing()
    find_package(GTest REQUIRED)

    add_executable(pastebin-tests
        tests/util_test.cpp
        ${PASTEBIN_UTIL_SOURCES}
    )
    target_link_libraries(pastebin-tests PRIVATE
        GTest::gtest GTest::gtest_main)
    silence_vendor_warnings(pastebin-tests GTest::gtest)

    add_test(NAME pastebin-tests COMMAND pastebin-tests)
endif()
