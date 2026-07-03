cmake_minimum_required(VERSION 3.27)
project(discjockey VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

include(${CMAKE_BINARY_DIR}/conan_toolchain.cmake OPTIONAL)

find_package(Qt6 6.4 REQUIRED COMPONENTS
    Core Gui Quick Network)

qt_policy(SET QTP0001 NEW)

qt_add_executable(discjockey
    main.cpp
    src/ApiClient.cpp
    src/ApiClientSubmit.cpp
    src/ApiClientPoll.cpp
    src/UploadClient.cpp
    src/FileModel.cpp
    src/JobModel.cpp
)

target_compile_definitions(discjockey PRIVATE
    SRCDIR="${CMAKE_CURRENT_SOURCE_DIR}"
)

target_include_directories(discjockey PRIVATE src)

target_link_libraries(discjockey PRIVATE
    Qt6::Core
    Qt6::Gui
    Qt6::Quick
    Qt6::Network
)

qt_add_resources(discjockey "qml"
    PREFIX "/"
    FILES
        qml/Main.qml
        qml/AppToolBar.qml
        qml/FileBrowser.qml
        qml/FileBrowserHeader.qml
        qml/FileItem.qml
        qml/StreamPanel.qml
        qml/FileInfo.qml
        qml/UploadProgress.qml
        qml/ServerConfig.qml
        qml/ServerConfigGrid.qml
        qml/JobQueue.qml
        qml/JobItem.qml
        qml/JobWatcher.qml
)
