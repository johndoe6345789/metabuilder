########## MACROS ###########################################################################
#############################################################################################

# Requires CMake > 3.15
if(${CMAKE_VERSION} VERSION_LESS "3.15")
    message(FATAL_ERROR "The 'CMakeDeps' generator only works with CMake >= 3.15")
endif()

if(cpr_FIND_QUIETLY)
    set(cpr_MESSAGE_MODE VERBOSE)
else()
    set(cpr_MESSAGE_MODE STATUS)
endif()

include(${CMAKE_CURRENT_LIST_DIR}/cmakedeps_macros.cmake)
include(${CMAKE_CURRENT_LIST_DIR}/cprTargets.cmake)
include(CMakeFindDependencyMacro)

check_build_type_defined()

foreach(_DEPENDENCY ${cpr_FIND_DEPENDENCY_NAMES} )
    # Check that we have not already called a find_package with the transitive dependency
    if(NOT ${_DEPENDENCY}_FOUND)
        find_dependency(${_DEPENDENCY} REQUIRED ${${_DEPENDENCY}_FIND_MODE})
    endif()
endforeach()

set(cpr_VERSION_STRING "1.10.0")
set(cpr_INCLUDE_DIRS ${cpr_INCLUDE_DIRS_RELEASE} )
set(cpr_INCLUDE_DIR ${cpr_INCLUDE_DIRS_RELEASE} )
set(cpr_LIBRARIES ${cpr_LIBRARIES_RELEASE} )
set(cpr_DEFINITIONS ${cpr_DEFINITIONS_RELEASE} )


# Definition of extra CMake variables from cmake_extra_variables


# Only the last installed configuration BUILD_MODULES are included to avoid the collision
foreach(_BUILD_MODULE ${cpr_BUILD_MODULES_PATHS_RELEASE} )
    message(${cpr_MESSAGE_MODE} "Conan: Including build module from '${_BUILD_MODULE}'")
    include(${_BUILD_MODULE})
endforeach()


