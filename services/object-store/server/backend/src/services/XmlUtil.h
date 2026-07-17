/**
 * @file XmlUtil.h
 * @brief XML escaping utility for S3 responses.
 */

#pragma once

#include <string>

namespace s3
{

/// @brief Escape XML special characters in a string.
inline std::string xmlEscape(const std::string& s)
{
    std::string out;
    out.reserve(s.size());
    for (char c : s) {
        switch (c) {
        case '&':
            out += "&amp;";
            break;
        case '<':
            out += "&lt;";
            break;
        case '>':
            out += "&gt;";
            break;
        case '"':
            out += "&quot;";
            break;
        case '\'':
            out += "&apos;";
            break;
        default:
            out += c;
        }
    }
    return out;
}

} // namespace s3
