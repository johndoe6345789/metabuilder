#pragma once

#include <string>

namespace email_backend {

/// Generates a random UUID v4 string, matching Python's `str(uuid.uuid4())`.
std::string generateUuidV4();

} // namespace email_backend
