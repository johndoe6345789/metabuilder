message(STATUS "Conan: Using CMakeDeps conandeps_legacy.cmake aggregator via include()")
message(STATUS "Conan: It is recommended to use explicit find_package() per dependency instead")

find_package(cpr)
find_package(sol2)
find_package(lua)
find_package(nlohmann_json)

set(CONANDEPS_LEGACY  cpr::cpr  sol2::sol2  lua::lua  nlohmann_json::nlohmann_json )