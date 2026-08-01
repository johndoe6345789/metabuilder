/**
 * @file base64url.hpp
 * @brief Base64url decode utilities for JWT validation
 */
#pragma once

#include <string>
#include <vector>
#include <cstdint>

namespace dbal::security {

/**
 * @brief Decode a base64url-encoded string to raw bytes.
 * Handles missing padding and the - / _ character substitutions.
 */
inline std::vector<uint8_t> base64url_decode(const std::string& input) {
    // Convert base64url → standard base64 and add padding
    std::string s = input;
    for (char& c : s) {
        if (c == '-') c = '+';
        else if (c == '_') c = '/';
    }
    while (s.size() % 4 != 0) s += '=';

    static const std::string b64chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    std::vector<uint8_t> result;
    result.reserve(s.size() * 3 / 4);

    int val = 0, valb = -8;
    for (unsigned char c : s) {
        if (c == '=') break;
        auto pos = b64chars.find(static_cast<char>(c));
        if (pos == std::string::npos) continue;
        val = (val << 6) + static_cast<int>(pos);
        valb += 6;
        if (valb >= 0) {
            result.push_back(static_cast<uint8_t>((val >> valb) & 0xFF));
            valb -= 8;
        }
    }
    return result;
}

/**
 * @brief Encode raw bytes as base64url, no padding (RFC 4648 §5).
 * Used for JWT segments and JWKS "n"/"e" values.
 */
inline std::string base64url_encode(const uint8_t* data, size_t len) {
    static const char b64chars[] =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    std::string out;
    out.reserve((len + 2) / 3 * 4);

    size_t i = 0;
    for (; i + 3 <= len; i += 3) {
        uint32_t n = (static_cast<uint32_t>(data[i]) << 16) |
                     (static_cast<uint32_t>(data[i + 1]) << 8) |
                     static_cast<uint32_t>(data[i + 2]);
        out += b64chars[(n >> 18) & 0x3F];
        out += b64chars[(n >> 12) & 0x3F];
        out += b64chars[(n >> 6) & 0x3F];
        out += b64chars[n & 0x3F];
    }
    if (len - i == 1) {
        uint32_t n = static_cast<uint32_t>(data[i]) << 16;
        out += b64chars[(n >> 18) & 0x3F];
        out += b64chars[(n >> 12) & 0x3F];
    } else if (len - i == 2) {
        uint32_t n = (static_cast<uint32_t>(data[i]) << 16) |
                     (static_cast<uint32_t>(data[i + 1]) << 8);
        out += b64chars[(n >> 18) & 0x3F];
        out += b64chars[(n >> 12) & 0x3F];
        out += b64chars[(n >> 6) & 0x3F];
    }
    for (char& c : out) {
        if (c == '+') c = '-';
        else if (c == '/') c = '_';
    }
    return out; // no '=' padding — never emitted by the loop above
}

inline std::string base64url_encode(const std::vector<uint8_t>& data) {
    return base64url_encode(data.data(), data.size());
}

/**
 * @brief Decode a base64url-encoded string and return as lowercase hex.
 * Used to compare JWT signatures against hmac_sha256() output.
 */
inline std::string base64url_to_hex(const std::string& b64url) {
    auto bytes = base64url_decode(b64url);
    static const char hex_chars[] = "0123456789abcdef";
    std::string hex;
    hex.reserve(bytes.size() * 2);
    for (uint8_t b : bytes) {
        hex += hex_chars[(b >> 4) & 0x0F];
        hex += hex_chars[b & 0x0F];
    }
    return hex;
}

} // namespace dbal::security
