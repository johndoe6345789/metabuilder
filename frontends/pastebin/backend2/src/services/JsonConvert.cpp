#include "JsonConvert.hpp"

namespace pastebin {

Json::Value nlohmannToJsoncpp(const nlohmann::json& in) {
    if (in.is_null())
        return Json::Value();
    if (in.is_boolean())
        return Json::Value(in.get<bool>());
    if (in.is_number_integer())
        return Json::Value(in.get<Json::Int64>());
    if (in.is_number_float())
        return Json::Value(in.get<double>());
    if (in.is_string())
        return Json::Value(in.get<std::string>());
    if (in.is_array()) {
        Json::Value out(Json::arrayValue);
        for (const auto& item : in)
            out.append(nlohmannToJsoncpp(item));
        return out;
    }
    if (in.is_object()) {
        Json::Value out(Json::objectValue);
        for (auto it = in.begin(); it != in.end(); ++it)
            out[it.key()] = nlohmannToJsoncpp(it.value());
        return out;
    }
    return Json::Value();
}

} // namespace pastebin
