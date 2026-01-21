# Load the debug and release variables
file(GLOB DATA_FILES "${CMAKE_CURRENT_LIST_DIR}/cpr-*-data.cmake")

foreach(f ${DATA_FILES})
    include(${f})
endforeach()

# Create the targets for all the components
foreach(_COMPONENT ${cpr_COMPONENT_NAMES} )
    if(NOT TARGET ${_COMPONENT})
        add_library(${_COMPONENT} INTERFACE IMPORTED)
        message(${cpr_MESSAGE_MODE} "Conan: Component target declared '${_COMPONENT}'")
    endif()
endforeach()

if(NOT TARGET cpr::cpr)
    add_library(cpr::cpr INTERFACE IMPORTED)
    message(${cpr_MESSAGE_MODE} "Conan: Target declared 'cpr::cpr'")
endif()
# Load the debug and release library finders
file(GLOB CONFIG_FILES "${CMAKE_CURRENT_LIST_DIR}/cpr-Target-*.cmake")

foreach(f ${CONFIG_FILES})
    include(${f})
endforeach()