# Additional clean files
cmake_minimum_required(VERSION 3.16)

if("${CONFIG}" STREQUAL "" OR "${CONFIG}" STREQUAL "Release")
  file(REMOVE_RECURSE
  "CMakeFiles/discjockey_autogen.dir/AutogenUsed.txt"
  "CMakeFiles/discjockey_autogen.dir/ParseCache.txt"
  "discjockey_autogen"
  )
endif()
