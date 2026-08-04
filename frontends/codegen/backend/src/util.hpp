#pragma once

#include <json/json.h>
#include <filesystem>
#include <string>
#include <vector>

namespace codegen_backend {

std::string envOr(const char* name, const std::string& fallback);
int envInt(const char* name, int fallback);
std::string nowIso();

Json::Value parseJson(const std::string& text);
std::string jsonText(const Json::Value& v);

std::string readFile(const std::filesystem::path& p);

/// Splits a .sql file's text into individual statements on ';', ignoring
/// semicolons inside single-quoted string literals.
std::vector<std::string> sqlStatements(const std::string& sql);

} // namespace codegen_backend
