cmake_minimum_required(VERSION 3.27)
project(dbal_qml VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

include(${CMAKE_BINARY_DIR}/conan_toolchain.cmake OPTIONAL)

find_package(Qt6 COMPONENTS Core Gui Quick REQUIRED)
find_package(cpr CONFIG REQUIRED)

qt_add_executable(dbal-qml
    main.cpp
    src/PackageRegistry.cpp
    src/ModPlayer.cpp
    src/DBALClient.cpp
)

qt_add_qml_module(dbal-qml
    URI DBALObservatory
    VERSION 1.0
    QML_FILES 
        FrontPage.qml
        qmllib/dbal/DBALProvider.qml
)

target_link_libraries(dbal-qml PRIVATE Qt6::Core Qt6::Gui Qt6::Quick cpr::cpr)

qt_finalize_executable(dbal-qml)

if(NOT "${CMAKE_GENERATOR}" STREQUAL "Ninja")
  message(
    STATUS
    "dbal-qml is designed for Ninja; configure with `cmake -G Ninja` so the Conan Ninja toolchain is used."
  )
endif()

install(TARGETS dbal-qml
    RUNTIME DESTINATION bin
)
