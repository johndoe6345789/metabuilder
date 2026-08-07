#include "../src/services/DapFrame.hpp"

#include <gtest/gtest.h>

using namespace pastebin;

TEST(BuildDapFrame, PrependsContentLengthHeader) {
    const auto frame = buildDapFrame("{\"a\":1}");
    EXPECT_EQ(frame, "Content-Length: 7\r\n\r\n{\"a\":1}");
}

TEST(DapFrameReader, ParsesACompleteMessageInOneFeed) {
    DapFrameReader reader;
    const auto msgs = reader.feed(buildDapFrame("{\"seq\":1}"));
    ASSERT_EQ(msgs.size(), 1u);
    EXPECT_EQ(msgs[0], "{\"seq\":1}");
}

TEST(DapFrameReader, BuffersAMessageSplitAcrossFeeds) {
    DapFrameReader reader;
    const std::string frame = buildDapFrame("{\"seq\":2}");
    EXPECT_TRUE(reader.feed(frame.substr(0, 10)).empty());
    const auto msgs = reader.feed(frame.substr(10));
    ASSERT_EQ(msgs.size(), 1u);
    EXPECT_EQ(msgs[0], "{\"seq\":2}");
}

TEST(DapFrameReader, ParsesTwoMessagesFromOneFeed) {
    DapFrameReader reader;
    const auto msgs = reader.feed(buildDapFrame("a") + buildDapFrame("bb"));
    ASSERT_EQ(msgs.size(), 2u);
    EXPECT_EQ(msgs[0], "a");
    EXPECT_EQ(msgs[1], "bb");
}

TEST(DapFrameReader, SkipsAHeaderBlockMissingContentLength) {
    DapFrameReader reader;
    const std::string junk = "X-Ignore: yes\r\n\r\n";
    const auto msgs = reader.feed(junk + buildDapFrame("ok"));
    ASSERT_EQ(msgs.size(), 1u);
    EXPECT_EQ(msgs[0], "ok");
}
