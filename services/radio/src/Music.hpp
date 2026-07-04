#pragma once
#include <filesystem>
#include <vector>

namespace Music {
    // Scan dir for .mp3 files; validate each with ffmpeg.
    std::vector<std::filesystem::path>
    scan(const std::filesystem::path& dir,
         const std::filesystem::path& ffmpeg);
}
