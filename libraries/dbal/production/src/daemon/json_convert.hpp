#ifndef DBAL_JSON_CONVERT_HPP
#define DBAL_JSON_CONVERT_HPP

#include <json/json.h>
#include <nlohmann/json.hpp>
#include <string>

namespace dbal {
namespace daemon {

/**
 * Convert jsoncpp Value to nlohmann::json
 */
inline nlohmann::json jsoncpp_to_nlohmann(const ::Json::Value& jval) {
    switch (jval.type()) {
        case ::Json::nullValue:
            return nullptr;
        case ::Json::intValue:
            return jval.asInt64();
        case ::Json::uintValue:
            return jval.asUInt64();
        case ::Json::realValue:
            return jval.asDouble();
        case ::Json::stringValue:
            return jval.asString();
        case ::Json::booleanValue:
            return jval.asBool();
        case ::Json::arrayValue: {
            nlohmann::json arr = nlohmann::json::array();
            for (const auto& item : jval) {
                arr.push_back(jsoncpp_to_nlohmann(item));
            }
            return arr;
        }
        case ::Json::objectValue: {
            nlohmann::json obj = nlohmann::json::object();
            for (const auto& key : jval.getMemberNames()) {
                obj[key] = jsoncpp_to_nlohmann(jval[key]);
            }
            return obj;
        }
        default:
            return nullptr;
    }
}

/**
 * Convert nlohmann::json to jsoncpp Value
 */
inline ::Json::Value nlohmann_to_jsoncpp(const nlohmann::json& nval) {
    if (nval.is_null()) {
        return ::Json::Value::null;
    }
    if (nval.is_boolean()) {
        return ::Json::Value(nval.get<bool>());
    }
    if (nval.is_number_integer()) {
        return ::Json::Value(static_cast<::Json::Int64>(nval.get<int64_t>()));
    }
    if (nval.is_number_unsigned()) {
        return ::Json::Value(static_cast<::Json::UInt64>(nval.get<uint64_t>()));
    }
    if (nval.is_number_float()) {
        return ::Json::Value(nval.get<double>());
    }
    if (nval.is_string()) {
        return ::Json::Value(nval.get<std::string>());
    }
    if (nval.is_array()) {
        ::Json::Value arr(::Json::arrayValue);
        for (const auto& item : nval) {
            arr.append(nlohmann_to_jsoncpp(item));
        }
        return arr;
    }
    if (nval.is_object()) {
        ::Json::Value obj(::Json::objectValue);
        for (auto it = nval.begin(); it != nval.end(); ++it) {
            obj[it.key()] = nlohmann_to_jsoncpp(it.value());
        }
        return obj;
    }
    return ::Json::Value::null;
}

} // namespace daemon
} // namespace dbal

#endif // DBAL_JSON_CONVERT_HPP
