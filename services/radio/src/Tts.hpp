#pragma once
#include <filesystem>
#include <string>

namespace Tts {
    // Generate TTS MP3 via gTTS (Python). Returns path on success.
    // Falls back to 3-second silence if gTTS unavailable.
    std::filesystem::path generate(int idx,
                                   const std::string& text,
                                   const std::filesystem::path& dir,
                                   const std::filesystem::path& ffmpeg);
}
