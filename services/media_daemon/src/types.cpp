#include "media/types.hpp"
#include <chrono>
#include <stdexcept>

// types.hpp is header-only for the most part (templates + structs).
// This file provides any non-template utility functions needed at link time.

namespace media {

// Ensure the translation unit is not empty.
// All types in types.hpp are defined there directly (structs, enums, templates).
// Nothing additional needs to be defined here unless future refactoring moves
// implementation out of the header.

} // namespace media
