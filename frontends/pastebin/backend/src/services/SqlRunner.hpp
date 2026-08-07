#pragma once

#include "RunFiles.hpp"
#include "RunnerRegistry.hpp"

#include <json/json.h>

#include <vector>

namespace pastebin {

struct SqlRunResult {
    Json::Value body;
    int status = 200;
};

/// Spins up a fresh DB container for `spec.sqlRunner`, executes the SQL
/// (the first file's content), destroys the container, and returns the
/// {output, error} response body + HTTP status.
SqlRunResult runSqlInDocker(const RunnerSpec& spec,
                             const std::vector<SourceFile>& files);

} // namespace pastebin
