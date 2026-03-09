#pragma once
#include <nlohmann/json.hpp>
#include <regex>
#include <string>

namespace dbal::workflow {

/**
 * JSON-native workflow execution context.
 * All variables are nlohmann::json, so steps can store strings, numbers,
 * booleans, objects, and arrays without type-erased casts.
 *
 * Template resolution (resolveStr / resolve):
 *   "${user_id}"        → ctx.get("user_id") as string
 *   "prefix-${x}-suf"  → string interpolation
 *   "${event.userId}"   → dot-path into stored JSON objects
 *   If an entire string is a single "${key}" and the value is not a string,
 *   the raw JSON value is returned (preserves bool/number types).
 */
class WfContext {
public:
    void set(const std::string& key, nlohmann::json val) {
        vars_[key] = std::move(val);
    }

    nlohmann::json get(const std::string& key,
                       nlohmann::json def = nlohmann::json{}) const {
        // Support dot-path: "event.userId" → vars_["event"]["userId"]
        auto dot = key.find('.');
        if (dot != std::string::npos) {
            std::string root = key.substr(0, dot);
            std::string rest = key.substr(dot + 1);
            auto it = vars_.find(root);
            if (it == vars_.end() || !it.value().is_object()) return def;
            return getPath(it.value(), rest, def);
        }
        auto it = vars_.find(key);
        return it != vars_.end() ? it.value() : def;
    }

    bool has(const std::string& key) const {
        auto dot = key.find('.');
        if (dot != std::string::npos) {
            std::string root = key.substr(0, dot);
            auto it = vars_.find(root);
            return it != vars_.end();
        }
        return vars_.count(key) > 0;
    }

    // Resolve a JSON value: recursively replace "${key}" in strings
    nlohmann::json resolve(const nlohmann::json& val) const {
        if (val.is_string()) {
            std::string s = val.get<std::string>();
            // If the whole value is a single "${key}", return the raw JSON value
            // (preserves booleans, numbers, etc.)
            static const std::regex whole_re(R"(\$\{([^}]+)\})");
            std::smatch m;
            if (std::regex_match(s, m, whole_re)) {
                return get(m[1].str(), val);
            }
            // Otherwise interpolate into a string
            return resolveStr(s);
        }
        if (val.is_object()) {
            nlohmann::json out = nlohmann::json::object();
            for (auto& [k, v] : val.items()) out[k] = resolve(v);
            return out;
        }
        if (val.is_array()) {
            nlohmann::json out = nlohmann::json::array();
            for (auto& v : val) out.push_back(resolve(v));
            return out;
        }
        return val;
    }

    // Interpolate "${key}" placeholders inside a string value
    std::string resolveStr(const std::string& tmpl) const {
        std::string result;
        result.reserve(tmpl.size());
        size_t i = 0;
        while (i < tmpl.size()) {
            if (i + 1 < tmpl.size() && tmpl[i] == '$' && tmpl[i + 1] == '{') {
                auto end = tmpl.find('}', i + 2);
                if (end == std::string::npos) { result += tmpl[i++]; continue; }
                std::string key = tmpl.substr(i + 2, end - i - 2);
                auto v = get(key);
                if (v.is_string())      result += v.get<std::string>();
                else if (!v.is_null()) result += v.dump();
                i = end + 1;
            } else {
                result += tmpl[i++];
            }
        }
        return result;
    }

private:
    nlohmann::json vars_ = nlohmann::json::object();

    static nlohmann::json getPath(const nlohmann::json& obj,
                                  const std::string& path,
                                  const nlohmann::json& def) {
        auto dot = path.find('.');
        std::string key = dot == std::string::npos ? path : path.substr(0, dot);
        if (!obj.is_object() || !obj.contains(key)) return def;
        if (dot == std::string::npos) return obj[key];
        return getPath(obj[key], path.substr(dot + 1), def);
    }
};

} // namespace dbal::workflow
