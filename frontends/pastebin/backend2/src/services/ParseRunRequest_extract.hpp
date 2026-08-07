#pragma once

#include "ParseRunRequest.hpp"

namespace pastebin {

/// Reads language/files/entryPoint from the request, falling back to the
/// legacy {code} shape (wrapping it as a single file) and to the
/// runner's default entry name when unset.
ParsedRunRequest extractRunFields(const Json::Value& data);

} // namespace pastebin
