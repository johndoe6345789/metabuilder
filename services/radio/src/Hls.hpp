#pragma once
#include "Proc.hpp"
#include <filesystem>

struct HlsStream {
    static HlsStream radio(const std::filesystem::path& prog,
                           const std::filesystem::path& outDir,
                           const std::filesystem::path& ffmpeg);

    static HlsStream tv(const std::filesystem::path& video,
                        const std::filesystem::path& outDir,
                        const std::filesystem::path& ffmpeg,
                        const std::filesystem::path& assFile);

    bool alive() const { return proc_.alive(); }
    void stop()        { proc_.stop(); }

private:
    explicit HlsStream(Proc p) : proc_(std::move(p)) {}
    Proc proc_;
};
