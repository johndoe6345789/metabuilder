#pragma once
#include <filesystem>
#include <vector>

namespace Prog {
    // Concatenate tts[0] + tracks[0] + tts[1] + tracks[1] ... → dest MP3.
    std::filesystem::path build(
        const std::vector<std::filesystem::path>& tracks,
        const std::vector<std::filesystem::path>& tts,
        const std::filesystem::path& dest,
        const std::filesystem::path& ffmpeg);
}
