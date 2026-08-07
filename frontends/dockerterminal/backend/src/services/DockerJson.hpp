#pragma once

#include <json/json.h>

#include <string>

namespace dockerterminal {

Json::Value parseJson(const std::string& text);
std::string jsonText(const Json::Value& v);

} // namespace dockerterminal
