#include "Music.hpp"
#include <algorithm>
#include <array>
#include <cstdio>
#include <sstream>
#include <string>

namespace Music {

static bool validate(const std::filesystem::path& p,
                     const std::filesystem::path& ff) {
    std::string cmd = "\"" + ff.string() + "\" -i \""
                    + p.string() + "\" 2>&1";
    FILE* f = popen(cmd.c_str(), "r");
    if (!f) return false;
    std::ostringstream oss;
    std::array<char, 256> buf{};
    while (fgets(buf.data(), buf.size(), f)) oss << buf.data();
    pclose(f);
    const std::string out = oss.str();
    return out.find("Audio:") != std::string::npos
        && out.find("Duration: N/A") == std::string::npos;
}

std::vector<std::filesystem::path>
scan(const std::filesystem::path& dir,
     const std::filesystem::path& ffmpeg) {
    std::vector<std::filesystem::path> result;
    if (!std::filesystem::exists(dir)) return result;
    for (auto& e : std::filesystem::directory_iterator(dir)) {
        if (e.path().extension() == ".mp3" && validate(e.path(), ffmpeg))
            result.push_back(e.path());
    }
    std::sort(result.begin(), result.end());
    return result;
}

} // namespace Music
