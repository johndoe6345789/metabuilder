cmake_minimum_required(VERSION 3.20)
project(mb_radio CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

file(GLOB_RECURSE SRCS src/*.cpp)
add_executable(mb_radio ${SRCS})
target_include_directories(mb_radio PRIVATE src)
target_compile_options(mb_radio PRIVATE -Wall -Wextra -O2)
target_link_libraries(mb_radio PRIVATE pthread)
