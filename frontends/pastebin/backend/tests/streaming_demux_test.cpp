#include "../src/services/StreamingDemux.hpp"

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

TEST(StreamingDemux, EmitsCompleteFrameInOneFeed) {
    StreamingDemux demux;
    const auto frames = demux.feed(frame(1, "hello"));
    ASSERT_EQ(frames.size(), 1u);
    EXPECT_EQ(frames[0].streamType, 1);
    EXPECT_EQ(frames[0].payload, "hello");
}

TEST(StreamingDemux, BuffersAFrameSplitAcrossFeeds) {
    StreamingDemux demux;
    const std::string raw = frame(2, "oops");
    EXPECT_TRUE(demux.feed(raw.substr(0, 5)).empty());

    const auto frames = demux.feed(raw.substr(5));
    ASSERT_EQ(frames.size(), 1u);
    EXPECT_EQ(frames[0].streamType, 2);
    EXPECT_EQ(frames[0].payload, "oops");
}

TEST(StreamingDemux, EmitsMultipleFramesFromOneFeed) {
    StreamingDemux demux;
    const auto frames = demux.feed(frame(1, "a") + frame(1, "b"));
    ASSERT_EQ(frames.size(), 2u);
    EXPECT_EQ(frames[0].payload, "a");
    EXPECT_EQ(frames[1].payload, "b");
}
