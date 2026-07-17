#include "Hls.hpp"
#include <stdexcept>
#include <string>

namespace fs = std::filesystem;

static std::vector<std::string> hlsTail(const fs::path& out) {
    return {
        "-f",        "hls",
        "-hls_time", "6",
        "-hls_list_size", "12",
        "-hls_flags", "delete_segments+append_list",
        (out / "stream.m3u8").string(),
    };
}

HlsStream HlsStream::radio(const fs::path& prog,
                            const fs::path& outDir,
                            const fs::path& ffmpeg) {
    fs::create_directories(outDir);
    if (!fs::exists(prog))
        throw std::runtime_error("programme not found: " + prog.string());

    std::vector<std::string> args{
        ffmpeg.string(),
        "-y", "-loglevel", "error",
        "-re", "-stream_loop", "-1",
        "-i", prog.string(),
        "-codec:a", "aac",
        "-b:a", "128k",
        "-ar", "44100",
    };
    auto tail = hlsTail(outDir);
    args.insert(args.end(), tail.begin(), tail.end());
    return HlsStream(Proc::spawn(args));
}

HlsStream HlsStream::tv(const fs::path& video,
                         const fs::path& outDir,
                         const fs::path& ffmpeg,
                         const fs::path& assFile) {
    fs::create_directories(outDir);
    if (!fs::exists(video))
        throw std::runtime_error("video not found: " + video.string());

    // drawbox for dark header strip + ASS subtitles for station name
    std::string vf = "drawbox=y=0:w=iw:h=80:c=black@0.65:t=fill"
                     ",subtitles=" + assFile.string();

    std::vector<std::string> args{
        ffmpeg.string(),
        "-y", "-loglevel", "error",
        "-re", "-stream_loop", "-1",
        "-i", video.string(),
        "-vf", vf,
        "-codec:v", "libx264", "-preset", "ultrafast",
        "-b:v", "700k", "-g", "50",
        "-codec:a", "aac", "-b:a", "128k",
    };
    auto tail = hlsTail(outDir);
    args.insert(args.end(), tail.begin(), tail.end());
    return HlsStream(Proc::spawn(args));
}
