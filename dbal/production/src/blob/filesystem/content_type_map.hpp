/**
 * @file content_type_map.hpp
 * @brief Map file extensions to MIME content types
 */

#pragma once

#include <string>
#include <unordered_map>
#include <algorithm>

namespace dbal {
namespace blob {

/**
 * @brief Guess MIME content type from file extension
 * @param key The blob key (file path)
 * @return Content type string, defaults to "application/octet-stream"
 */
[[nodiscard]] inline std::string guess_content_type(const std::string& key) {
    static const std::unordered_map<std::string, std::string> extension_map = {
        // Text
        {".txt",  "text/plain"},
        {".html", "text/html"},
        {".htm",  "text/html"},
        {".css",  "text/css"},
        {".csv",  "text/csv"},
        {".xml",  "text/xml"},
        {".md",   "text/markdown"},

        // Application
        {".json", "application/json"},
        {".js",   "application/javascript"},
        {".mjs",  "application/javascript"},
        {".pdf",  "application/pdf"},
        {".zip",  "application/zip"},
        {".gz",   "application/gzip"},
        {".tar",  "application/x-tar"},
        {".wasm", "application/wasm"},
        {".yaml", "application/x-yaml"},
        {".yml",  "application/x-yaml"},
        {".toml", "application/toml"},
        {".bin",  "application/octet-stream"},

        // Images
        {".png",  "image/png"},
        {".jpg",  "image/jpeg"},
        {".jpeg", "image/jpeg"},
        {".gif",  "image/gif"},
        {".svg",  "image/svg+xml"},
        {".webp", "image/webp"},
        {".ico",  "image/x-icon"},
        {".bmp",  "image/bmp"},
        {".tiff", "image/tiff"},
        {".tif",  "image/tiff"},

        // Audio
        {".mp3",  "audio/mpeg"},
        {".wav",  "audio/wav"},
        {".ogg",  "audio/ogg"},
        {".flac", "audio/flac"},
        {".aac",  "audio/aac"},
        {".m4a",  "audio/mp4"},

        // Video
        {".mp4",  "video/mp4"},
        {".webm", "video/webm"},
        {".avi",  "video/x-msvideo"},
        {".mov",  "video/quicktime"},
        {".mkv",  "video/x-matroska"},

        // Fonts
        {".woff",  "font/woff"},
        {".woff2", "font/woff2"},
        {".ttf",   "font/ttf"},
        {".otf",   "font/otf"},

        // Archives
        {".7z",  "application/x-7z-compressed"},
        {".bz2", "application/x-bzip2"},
        {".xz",  "application/x-xz"},
        {".rar", "application/vnd.rar"},
    };

    auto dot_pos = key.rfind('.');
    if (dot_pos == std::string::npos) {
        return "application/octet-stream";
    }

    std::string ext = key.substr(dot_pos);
    std::transform(ext.begin(), ext.end(), ext.begin(),
                   [](unsigned char c) { return std::tolower(c); });

    auto it = extension_map.find(ext);
    if (it != extension_map.end()) {
        return it->second;
    }

    return "application/octet-stream";
}

} // namespace blob
} // namespace dbal
