# Avoid multiple calls to find_package to append duplicated properties to the targets
include_guard()########### VARIABLES #######################################################################
#############################################################################################
set(cpr_FRAMEWORKS_FOUND_RELEASE "") # Will be filled later
conan_find_apple_frameworks(cpr_FRAMEWORKS_FOUND_RELEASE "${cpr_FRAMEWORKS_RELEASE}" "${cpr_FRAMEWORK_DIRS_RELEASE}")

set(cpr_LIBRARIES_TARGETS "") # Will be filled later


######## Create an interface target to contain all the dependencies (frameworks, system and conan deps)
if(NOT TARGET cpr_DEPS_TARGET)
    add_library(cpr_DEPS_TARGET INTERFACE IMPORTED)
endif()

set_property(TARGET cpr_DEPS_TARGET
             APPEND PROPERTY INTERFACE_LINK_LIBRARIES
             $<$<CONFIG:Release>:${cpr_FRAMEWORKS_FOUND_RELEASE}>
             $<$<CONFIG:Release>:${cpr_SYSTEM_LIBS_RELEASE}>
             $<$<CONFIG:Release>:CURL::libcurl>)

####### Find the libraries declared in cpp_info.libs, create an IMPORTED target for each one and link the
####### cpr_DEPS_TARGET to all of them
conan_package_library_targets("${cpr_LIBS_RELEASE}"    # libraries
                              "${cpr_LIB_DIRS_RELEASE}" # package_libdir
                              "${cpr_BIN_DIRS_RELEASE}" # package_bindir
                              "${cpr_LIBRARY_TYPE_RELEASE}"
                              "${cpr_IS_HOST_WINDOWS_RELEASE}"
                              cpr_DEPS_TARGET
                              cpr_LIBRARIES_TARGETS  # out_libraries_targets
                              "_RELEASE"
                              "cpr"    # package_name
                              "${cpr_NO_SONAME_MODE_RELEASE}")  # soname

# FIXME: What is the result of this for multi-config? All configs adding themselves to path?
set(CMAKE_MODULE_PATH ${cpr_BUILD_DIRS_RELEASE} ${CMAKE_MODULE_PATH})

########## GLOBAL TARGET PROPERTIES Release ########################################
    set_property(TARGET cpr::cpr
                 APPEND PROPERTY INTERFACE_LINK_LIBRARIES
                 $<$<CONFIG:Release>:${cpr_OBJECTS_RELEASE}>
                 $<$<CONFIG:Release>:${cpr_LIBRARIES_TARGETS}>
                 )

    if("${cpr_LIBS_RELEASE}" STREQUAL "")
        # If the package is not declaring any "cpp_info.libs" the package deps, system libs,
        # frameworks etc are not linked to the imported targets and we need to do it to the
        # global target
        set_property(TARGET cpr::cpr
                     APPEND PROPERTY INTERFACE_LINK_LIBRARIES
                     cpr_DEPS_TARGET)
    endif()

    set_property(TARGET cpr::cpr
                 APPEND PROPERTY INTERFACE_LINK_OPTIONS
                 $<$<CONFIG:Release>:${cpr_LINKER_FLAGS_RELEASE}>)
    set_property(TARGET cpr::cpr
                 APPEND PROPERTY INTERFACE_INCLUDE_DIRECTORIES
                 $<$<CONFIG:Release>:${cpr_INCLUDE_DIRS_RELEASE}>)
    # Necessary to find LINK shared libraries in Linux
    set_property(TARGET cpr::cpr
                 APPEND PROPERTY INTERFACE_LINK_DIRECTORIES
                 $<$<CONFIG:Release>:${cpr_LIB_DIRS_RELEASE}>)
    set_property(TARGET cpr::cpr
                 APPEND PROPERTY INTERFACE_COMPILE_DEFINITIONS
                 $<$<CONFIG:Release>:${cpr_COMPILE_DEFINITIONS_RELEASE}>)
    set_property(TARGET cpr::cpr
                 APPEND PROPERTY INTERFACE_COMPILE_OPTIONS
                 $<$<CONFIG:Release>:${cpr_COMPILE_OPTIONS_RELEASE}>)

########## For the modules (FindXXX)
set(cpr_LIBRARIES_RELEASE cpr::cpr)
