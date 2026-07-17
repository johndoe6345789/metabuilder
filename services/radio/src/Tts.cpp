#include "Tts.hpp"
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <fstream>
#include <string>

namespace Tts {

static void silence(const std::filesystem::path& p,
                    const std::filesystem::path& ff) {
    std::string cmd = "\"" + ff.string() + "\" -y -loglevel error "
        "-f lavfi -i anullsrc=r=44100:cl=stereo:duration=3 "
        "-codec:a libmp3lame \"" + p.string() + "\" 2>/dev/null";
    std::system(cmd.c_str()); // NOLINT
}

std::filesystem::path generate(int idx,
                                const std::string& text,
                                const std::filesystem::path& dir,
                                const std::filesystem::path& ffmpeg) {
    std::filesystem::create_directories(dir);
    char name[32];
    std::snprintf(name, sizeof(name), "dj_%02d.mp3", idx);
    auto dest = dir / name;
    if (std::filesystem::exists(dest) &&
        std::filesystem::file_size(dest) > 1000) return dest;

    // Write a tiny Python script to avoid shell quoting issues
    auto script = dir / "gen_tts_tmp.py";
    {
        std::ofstream s(script);
        s << "from gtts import gTTS\n"
          << "gTTS(\"" << text << "\").save(\""
          << dest.string() << "\")\n";
    }
    if (std::system(("python3 " + script.string()).c_str()) != 0) // NOLINT
        silence(dest, ffmpeg);
    std::filesystem::remove(script);
    return dest;
}

} // namespace Tts
