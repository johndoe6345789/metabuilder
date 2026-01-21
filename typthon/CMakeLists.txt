cmake_minimum_required(VERSION 3.22)

project(Typthon VERSION 3.14.0 LANGUAGES C)

# Prefer Ninja generator for faster builds
if(NOT CMAKE_GENERATOR MATCHES "Ninja")
  message(STATUS "Consider using Ninja generator for faster builds: cmake -G Ninja ..")
endif()

# Allow using compilers provided by Conan if available
if(EXISTS "${CMAKE_BINARY_DIR}/conan_toolchain.cmake")
  include("${CMAKE_BINARY_DIR}/conan_toolchain.cmake")
endif()

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Generate git version information
find_package(Git QUIET)
if(GIT_FOUND)
  execute_process(
    COMMAND ${GIT_EXECUTABLE} rev-parse --short HEAD
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE GIT_COMMIT_HASH
    OUTPUT_STRIP_TRAILING_WHITESPACE
    ERROR_QUIET
  )
  execute_process(
    COMMAND ${GIT_EXECUTABLE} rev-parse --abbrev-ref HEAD
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE GIT_BRANCH
    OUTPUT_STRIP_TRAILING_WHITESPACE
    ERROR_QUIET
  )
else()
  set(GIT_COMMIT_HASH "unknown")
  set(GIT_BRANCH "unknown")
endif()

# Platform detection
if(UNIX AND NOT APPLE)
  set(LINUX TRUE)
endif()

# Compiler flags
if(NOT MSVC)
  add_compile_options(-Wall -Wextra -Wno-unused-parameter -Wno-missing-field-initializers)
  add_compile_options(-fwrapv -fno-strict-aliasing)
endif()

# Add git version information as compile definitions
add_compile_definitions(
  GIT_COMMIT_HASH="${GIT_COMMIT_HASH}"
  GIT_BRANCH="${GIT_BRANCH}"
)

# Collect Python core source files
file(GLOB PYTHON_SOURCES Python/*.c)
file(GLOB OBJECTS_SOURCES Objects/*.c)
file(GLOB PARSER_SOURCES Parser/*.c)

# Exclude platform-specific dynload files (we'll add the right one back)
list(FILTER PYTHON_SOURCES EXCLUDE REGEX "Python/dynload_.*\\.c$")

# Add back the correct dynload file for the platform
if(WIN32)
  list(APPEND PYTHON_SOURCES Python/dynload_win.c)
elseif(APPLE)
  list(APPEND PYTHON_SOURCES Python/dynload_shlib.c)
else()
  list(APPEND PYTHON_SOURCES Python/dynload_shlib.c)
endif()

# Exclude frozen modules, test files, and code generation source files
list(FILTER PYTHON_SOURCES EXCLUDE REGEX ".*frozen.*")
list(FILTER PYTHON_SOURCES EXCLUDE REGEX ".*_test.*")
list(FILTER PYTHON_SOURCES EXCLUDE REGEX "Python/bytecodes\\.c$")
list(FILTER PYTHON_SOURCES EXCLUDE REGEX "Python/optimizer_bytecodes\\.c$")
list(FILTER PYTHON_SOURCES EXCLUDE REGEX "Python/emscripten_.*\\.c$")
list(FILTER OBJECTS_SOURCES EXCLUDE REGEX ".*_test.*")
list(FILTER PARSER_SOURCES EXCLUDE REGEX ".*_test.*")

# Add back our stub file for missing symbols (was excluded by frozen filter)
list(APPEND PYTHON_SOURCES ${CMAKE_CURRENT_SOURCE_DIR}/Python/frozen_stubs.c)

# Essential built-in modules (excluding those that need generated files)
set(BUILTIN_MODULE_SOURCES
  Modules/gcmodule.c
  Modules/main.c
)

# Note: main.c requires frozen modules that are generated
# We'll add it and handle any missing references

# POSIX module (Unix-specific)
if(UNIX)
  list(APPEND BUILTIN_MODULE_SOURCES Modules/posixmodule.c)
endif()

# Signal module
list(APPEND BUILTIN_MODULE_SOURCES Modules/signalmodule.c)

# I/O module sources
set(IO_MODULE_SOURCES
  Modules/_io/_iomodule.c
  Modules/_io/bufferedio.c
  Modules/_io/bytesio.c
  Modules/_io/fileio.c
  Modules/_io/iobase.c
  Modules/_io/stringio.c
  Modules/_io/textio.c
)

# Other essential modules
set(OTHER_MODULE_SOURCES
  Modules/errnomodule.c
  Modules/pwdmodule.c
  Modules/_threadmodule.c
  Modules/timemodule.c
  Modules/_localemodule.c
  Modules/_codecsmodule.c
  Modules/_weakref.c
  Modules/_functoolsmodule.c
  Modules/_operator.c
  Modules/_collectionsmodule.c
  Modules/_abc.c
  Modules/itertoolsmodule.c
  Modules/_stat.c
  Modules/symtablemodule.c
  Modules/xxsubtype.c
  Modules/atexitmodule.c
  Modules/faulthandler.c
  Modules/_datetimemodule.c
  Modules/_tracemalloc.c
)

# Tokenizer sources
set(TOKENIZER_SOURCES
  Parser/tokenizer/readline_tokenizer.c
  Parser/tokenizer/file_tokenizer.c
  Parser/tokenizer/utf8_tokenizer.c
  Parser/tokenizer/string_tokenizer.c
  Parser/tokenizer/helpers.c
  Parser/lexer/state.c
  Parser/lexer/lexer.c
  Parser/lexer/buffer.c
)

# Build Python core library
add_library(python_core STATIC
  ${PYTHON_SOURCES}
  ${OBJECTS_SOURCES}
  ${PARSER_SOURCES}
  ${TOKENIZER_SOURCES}
  ${BUILTIN_MODULE_SOURCES}
  ${IO_MODULE_SOURCES}
  ${OTHER_MODULE_SOURCES}
)

# Include directories
target_include_directories(python_core
  PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/Include
    ${CMAKE_CURRENT_SOURCE_DIR}/Include/internal
  PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/Python
    ${CMAKE_CURRENT_SOURCE_DIR}/Modules/_io
)

# Platform-specific defines
target_compile_definitions(python_core
  PRIVATE
    Py_BUILD_CORE
    Py_BUILD_CORE_BUILTIN
)

if(UNIX)
  target_compile_definitions(python_core PRIVATE HAVE_LIBDL=1)
endif()

# Build Python executable
add_executable(typthon Programs/python.c)
target_link_libraries(typthon PRIVATE python_core)

# Link required system libraries
if(UNIX)
  target_link_libraries(typthon PRIVATE m dl pthread util)
  if(NOT APPLE)
    target_link_libraries(typthon PRIVATE rt)
  endif()
endif()

# Installation
include(GNUInstallDirs)
install(
  TARGETS python_core typthon
  RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
  LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
  ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
)

# Install headers
install(
  DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/Include/
  DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/typthon
  FILES_MATCHING PATTERN "*.h"
)

# Testing
include(CTest)
if(BUILD_TESTING)
  add_test(NAME typthon_version COMMAND typthon --version)
  add_test(NAME typthon_help COMMAND typthon --help)
endif()
