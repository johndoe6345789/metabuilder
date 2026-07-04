#include "Prog.hpp"
#include <cstdlib>
#include <fstream>
#include <stdexcept>

namespace Prog {

namespace fs = std::filesystem;

std::filesystem::path build(
    const std::vector<fs::path>& tracks,
    const std::vector<fs::path>& tts,
    const fs::path& dest,
    const fs::path& ffmpeg) {

    if (fs::exists(dest) && fs::file_size(dest) > 50'000)
        return dest;

    auto txt = dest.parent_path() / "concat.txt";
    {
        std::ofstream f(txt);
        if (!f) throw std::runtime_error("cannot write concat list");
        for (size_t i = 0; i < tracks.size(); ++i) {
            if (i < tts.size() && fs::exists(tts[i])
                    && fs::file_size(tts[i]) > 1000)
                f << "file '" << tts[i].string() << "'\n";
            f << "file '" << tracks[i].string() << "'\n";
        }
        if (tts.size() > tracks.size() && !tts.empty()
                && fs::exists(tts.back()))
            f << "file '" << tts.back().string() << "'\n";
    }
    std::string cmd = "\"" + ffmpeg.string() + "\""
        " -y -loglevel error"
        " -f concat -safe 0 -i \"" + txt.string() + "\""
        " -codec:a libmp3lame -b:a 128k -ar 44100"
        " \"" + dest.string() + "\"";
    if (std::system(cmd.c_str()) != 0) // NOLINT
        throw std::runtime_error("ffmpeg concat failed");
    return dest;
}

} // namespace Prog
