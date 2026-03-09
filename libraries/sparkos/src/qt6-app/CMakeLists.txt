cmake_minimum_required(VERSION 3.16)

project(sparkos-gui VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set build type to Release if not specified
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

# Find Qt6 packages
find_package(Qt6 REQUIRED COMPONENTS Core Widgets Gui)

# Enable automatic MOC (Meta-Object Compiler)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

# Source files
set(SOURCES
    main.cpp
)

# Create executable
add_executable(sparkos-gui ${SOURCES})

# Link Qt6 libraries
target_link_libraries(sparkos-gui PRIVATE
    Qt6::Core
    Qt6::Widgets
    Qt6::Gui
)

# Set properties for static linking if desired
# target_link_options(sparkos-gui PRIVATE -static-libgcc -static-libstdc++)

# Install target
install(TARGETS sparkos-gui
    RUNTIME DESTINATION bin
)
