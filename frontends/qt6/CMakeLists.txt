cmake_minimum_required(VERSION 3.27)
project(dbal_qml VERSION 0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_AUTOMOC ON)

# MSVC: Qt requires correct __cplusplus macro value
if(MSVC)
    add_compile_options(/Zc:__cplusplus)
endif()

include(${CMAKE_BINARY_DIR}/conan_toolchain.cmake OPTIONAL)

find_package(Qt6 COMPONENTS Core Gui Quick Qml Network REQUIRED)
qt_policy(SET QTP0001 NEW)

qt_add_executable(dbal-qml
    main.cpp
    src/PackageRegistry.cpp
    src/ModPlayer.cpp
    src/DBALClient.cpp
)

# Pass source dir so the binary can find shared QML components at runtime
target_compile_definitions(dbal-qml PRIVATE SRCDIR="${CMAKE_CURRENT_SOURCE_DIR}")

qt_add_qml_module(dbal-qml
    URI DBALObservatory
    VERSION 1.0
    QML_FILES
        App.qml
        FrontPage.qml
        LoginView.qml
        DashboardView.qml
        AdminView.qml
        PackageViewLoader.qml
        ProfileView.qml
        CommentsView.qml
        GodPanel.qml
        SchemaEditor.qml
        WorkflowEditor.qml
        LuaEditor.qml
        DatabaseManager.qml
        PageRoutesManager.qml
        ComponentHierarchyEditor.qml
        CssClassManager.qml
        DropdownConfigManager.qml
        UserManagement.qml
        ThemeEditor.qml
        SMTPConfigEditor.qml
        SuperGodPanel.qml
        MaterialLanding.qml
        ModPlayerPanel.qml
        PackageManager.qml
        Storybook.qml
        qmllib/dbal/DBALProvider.qml
    RESOURCES
        assets/audio/retro-gaming.mod
        qmllib/dbal/qmldir
)

# Add SVG assets
file(GLOB SVG_ASSETS RELATIVE ${CMAKE_CURRENT_SOURCE_DIR} assets/svg/*.svg)
qt_add_resources(dbal-qml "svg_assets"
    PREFIX "/"
    FILES ${SVG_ASSETS}
)

target_link_libraries(dbal-qml PRIVATE
    Qt6::Core Qt6::Gui Qt6::Quick Qt6::Qml Qt6::Network
)

# Conan Qt recipe adds module-specific include dirs to CMAKE_INCLUDE_PATH
# but MSVC needs them as actual compiler include paths.
# Add the Qt root include + all module subdirs from CMAKE_INCLUDE_PATH.
foreach(_inc ${CMAKE_INCLUDE_PATH})
    target_include_directories(dbal-qml PRIVATE "${_inc}")
endforeach()

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
