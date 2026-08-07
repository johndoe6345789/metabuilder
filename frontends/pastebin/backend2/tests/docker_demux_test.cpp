#include "../src/services/DockerDemux.hpp"

#include <gtest/gtest.h>

using namespace pastebin;

namespace {

std::string frame(unsigned char streamType, const std::string& payload) {
    std::string out;
    out += static_cast<char>(streamType);
    out += '\0';
    out += '\0';
    out += '\0';
    const uint32_t size = static_cast<uint32_t>(payload.size());
    out += static_cast<char>((size >> 24) & 0xFF);
    out += static_cast<char>((size >> 16) & 0xFF);
    out += static_cast<char>((size >> 8) & 0xFF);
    out += static_cast<char>(size & 0xFF);
    out += payload;
    return out;
}

} // namespace

TEST(DemuxDockerStream, SplitsStdoutAndStderr) {
    const std::string raw = frame(1, "hello\n") + frame(2, "oops\n");
    const auto out = demuxDockerStream(raw);
    EXPECT_EQ(out.stdoutText, "hello\n");
    EXPECT_EQ(out.stderrText, "oops\n");
}

TEST(DemuxDockerStream, ConcatenatesMultipleFramesOfSameStream) {
    const std::string raw = frame(1, "a") + frame(1, "b") + frame(1, "c");
    const auto out = demuxDockerStream(raw);
    EXPECT_EQ(out.stdoutText, "abc");
    EXPECT_TRUE(out.stderrText.empty());
}

TEST(DemuxDockerStream, EmptyInputYieldsEmptyStreams) {
    const auto out = demuxDockerStream("");
    EXPECT_TRUE(out.stdoutText.empty());
    EXPECT_TRUE(out.stderrText.empty());
}

TEST(DemuxDockerStream, TruncatedTrailingFrameIsIgnored) {
    // A frame header claiming more payload than is actually present.
    std::string raw = frame(1, "ok");
    raw += std::string(1, static_cast<char>(1)) + std::string(3, '\0') +
           std::string(4, static_cast<char>(0xFF)); // huge bogus size
    const auto out = demuxDockerStream(raw);
    EXPECT_EQ(out.stdoutText, "ok");
}
