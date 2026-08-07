cmake_minimum_required(VERSION 3.20)
project(dockerterminal-backend LANGUAGES CXX)

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

set(DOCKERTERMINAL_UTIL_SOURCES
    src/util.cpp
)

set(DOCKERTERMINAL_SOURCES
    ${DOCKERTERMINAL_UTIL_SOURCES}
    src/services/CurlHandle.cpp
    src/services/DockerJson.cpp
    src/services/DockerHttp.cpp
    src/services/DockerClient.cpp
    src/services/DockerClient_run.cpp
    src/services/DbalAuth.cpp
    src/controllers/HealthCtrl.cpp
    src/controllers/ContainersCtrl.cpp
)

add_executable(dockerterminal-server src/main.cpp ${DOCKERTERMINAL_SOURCES})
target_link_libraries(dockerterminal-server PRIVATE
    Drogon::Drogon OpenSSL::SSL CURL::libcurl)
silence_vendor_warnings(dockerterminal-server Drogon::Drogon)
silence_vendor_warnings(dockerterminal-server CURL::libcurl)

install(TARGETS dockerterminal-server RUNTIME DESTINATION bin)

# Build tests locally/CI with: cmake .. -DBUILD_TESTING=ON
option(BUILD_TESTING "Build GTest unit tests" OFF)
if(BUILD_TESTING)
    enable_testing()
    find_package(GTest REQUIRED)

    add_executable(dockerterminal-tests
        tests/util_test.cpp
        ${DOCKERTERMINAL_UTIL_SOURCES}
    )
    target_link_libraries(dockerterminal-tests PRIVATE
        GTest::gtest GTest::gtest_main)
    silence_vendor_warnings(dockerterminal-tests GTest::gtest)

    add_test(NAME dockerterminal-tests COMMAND dockerterminal-tests)
endif()
