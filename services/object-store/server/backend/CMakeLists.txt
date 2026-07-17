cmake_minimum_required(VERSION 3.20)
project(s3server-backend LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Drogon REQUIRED)
find_package(OpenSSL REQUIRED)

add_executable(s3server
    src/main.cpp
    src/controllers/BucketCtrl.cpp
    src/controllers/ObjectCtrl.cpp
    src/controllers/ObjectMutCtrl.cpp
    src/controllers/ListCtrl.cpp
    src/controllers/HealthCtrl.cpp
    src/filters/AuthFilter.cpp
    src/services/BucketStore.cpp
    src/services/ObjectStoreList.cpp
)

target_include_directories(s3server
    PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/src
)

target_link_libraries(s3server
    PRIVATE
        Drogon::Drogon
        OpenSSL::SSL
        OpenSSL::Crypto
)

install(TARGETS s3server
    RUNTIME DESTINATION bin
)
