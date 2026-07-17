#include "Hls.hpp"
#include "Http.hpp"
#include "Music.hpp"
#include "Prog.hpp"
#include "Tts.hpp"
#include <csignal>
#include <cstdio>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <string>
#include <thread>
#include <vector>

namespace fs = std::filesystem;

static const std::vector<std::string> DJ_LINES{
    "Welcome to MetaBuilder Radio. We are live and the music never stops.",
    "You're tuned in to MetaBuilder Radio, the best beats online.",
    "Stay right here. Coming up next, another great track.",
    "MetaBuilder Radio, broadcasting around the clock. Thanks for listening.",
    "This is your DJ speaking. Sit back and enjoy the music.",
    "MetaBuilder Radio. The station that never sleeps.",
};

static void writeAss(const fs::path& p) {
    std::ofstream f(p);
    f << "[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n"
      << "[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,"
         "SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,"
         "StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,"
         "Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\n"
      << "Style: Brand,Arial,52,&H00FFFFFF,&H000000FF,"
         "&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,1,7,"
         "30,30,20,1\n\n"
      << "[Events]\nFormat: Layer,Start,End,Style,Name,"
         "MarginL,MarginR,MarginV,Effect,Text\n"
      << "Dialogue: 0,0:00:00.00,9:59:59.99,Brand,,0,0,0,,"
         "MetaBuilder TV   {\\1c&H0000FF&}\\u25cf LIVE\n";
}

static volatile bool g_running = true;
static void onSig(int) { g_running = false; }

int main(int argc, char** argv) {
    std::string musicDir = "/tmp/mb_radio/music";
    std::string videoPath = std::string(getenv("HOME")) +
                            "/Downloads/big_buck_bunny_1080p_h264.mov";
    int port = 8765;
    bool noTv = false;
    for (int i = 1; i < argc; ++i) {
        std::string a = argv[i];
        if (a == "--music-dir" && i+1 < argc) musicDir = argv[++i];
        else if (a == "--video" && i+1 < argc) videoPath = argv[++i];
        else if (a == "--port" && i+1 < argc) port = std::stoi(argv[++i]);
        else if (a == "--no-tv") noTv = true;
    }

    const fs::path ROOT     = "/tmp/mb_radio";
    const fs::path FF       = fs::path(getenv("HOME")) / "bin" / "ffmpeg";
    const fs::path TTS_DIR  = ROOT / "tts";
    const fs::path STREAMS  = ROOT / "streams";
    const fs::path ASS_FILE = ROOT / "brand.ass";

    std::puts("\n\033[1m MetaBuilder Live Stations \033[0m\n");

    std::puts("[1/4] Scanning music library");
    auto tracks = Music::scan(musicDir, FF);
    if (tracks.empty()) { std::fputs("No valid MP3s\n", stderr); return 1; }
    for (auto& t : tracks) std::printf("  + %s\n", t.filename().c_str());

    std::puts("[2/4] Generating DJ voice clips");
    std::vector<fs::path> clips;
    for (int i = 0; i <= (int)tracks.size() && i < (int)DJ_LINES.size(); ++i)
        clips.push_back(Tts::generate(i, DJ_LINES[i], TTS_DIR, FF));

    std::puts("[3/4] Building programme");
    auto prog = Prog::build(tracks, clips, ROOT / "programme.mp3", FF);
    std::printf("  programme.mp3: %.1f MB\n",
                (double)fs::file_size(prog) / 1e6);

    std::puts("[4/4] Starting stations");
    auto radio = HlsStream::radio(prog, STREAMS / "radio", FF);
    std::this_thread::sleep_for(std::chrono::seconds(5));

    if (!noTv && fs::exists(videoPath)) {
        writeAss(ASS_FILE);
        try {
            auto tv = HlsStream::tv(videoPath, STREAMS / "tv", FF, ASS_FILE);
            std::this_thread::sleep_for(std::chrono::seconds(4));
            std::printf("  MB TV    -> %s/tv/stream.m3u8\n",
                        fs::path(videoPath).filename().c_str());
            signal(SIGINT, onSig); signal(SIGTERM, onSig);
            HttpServer http(STREAMS, port); http.start();
            std::printf(
                "\n\033[1m Radio: http://localhost:%d/radio/stream.m3u8\n"
                " TV:    http://localhost:%d/tv/stream.m3u8\033[0m\n\n",
                port, port);
            while (g_running) std::this_thread::sleep_for(
                              std::chrono::milliseconds(200));
            return 0;
        } catch (std::exception& e) {
            std::fprintf(stderr, "TV error: %s (continuing radio-only)\n", e.what());
        }
    }
    signal(SIGINT, onSig); signal(SIGTERM, onSig);
    HttpServer http(STREAMS, port); http.start();
    std::printf("\n\033[1m Radio: http://localhost:%d/radio/stream.m3u8\033[0m\n\n",
                port);
    while (g_running) std::this_thread::sleep_for(std::chrono::milliseconds(200));
    return 0;
}
