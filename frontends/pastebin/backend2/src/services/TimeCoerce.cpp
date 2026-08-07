#include "TimeCoerce.hpp"

#include <ctime>
#include <iomanip>
#include <sstream>

namespace pastebin {

int64_t coerceEpochMillis(const Json::Value& v) {
    if (v.isString()) {
        std::tm tm{};
        std::istringstream ss(v.asString());
        ss >> std::get_time(&tm, "%Y-%m-%dT%H:%M:%S");
        if (ss.fail())
            return 0;
        return static_cast<int64_t>(timegm(&tm)) * 1000;
    }
    if (v.isInt64())
        return v.asInt64();
    if (v.isUInt64())
        return static_cast<int64_t>(v.asUInt64());
    if (v.isDouble())
        return static_cast<int64_t>(v.asDouble());
    return 0;
}

} // namespace pastebin
