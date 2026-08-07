cmake_minimum_required(VERSION 3.20)
project(dockerterminal-backend LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Drogon REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(CURL REQUIRED)

set(DOCKERTERMINAL_SOURCES
    src/util.cpp
    src/services/DockerClient.cpp
    src/services/DbalAuth.cpp
    src/controllers/HealthCtrl.cpp
    src/controllers/ContainersCtrl.cpp
)

add_executable(dockerterminal-server src/main.cpp ${DOCKERTERMINAL_SOURCES})
target_link_libraries(dockerterminal-server PRIVATE Drogon::Drogon OpenSSL::SSL CURL::libcurl)

install(TARGETS dockerterminal-server RUNTIME DESTINATION bin)

# Build tests locally/CI with: cmake .. -DBUILD_TESTING=ON
option(BUILD_TESTING "Build GTest unit tests" OFF)
if(BUILD_TESTING)
    enable_testing()
    find_package(GTest REQUIRED)

    add_executable(dockerterminal-tests tests/util_test.cpp src/util.cpp)
    target_link_libraries(dockerterminal-tests PRIVATE GTest::gtest GTest::gtest_main)

    add_test(NAME dockerterminal-tests COMMAND dockerterminal-tests)
endif()
