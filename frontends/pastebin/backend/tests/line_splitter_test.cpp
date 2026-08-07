#include "../src/services/LineSplitter.hpp"

#include <gtest/gtest.h>

using namespace pastebin;

TEST(LineSplitter, YieldsCompleteLinesAndBuffersRemainder) {
    LineSplitter splitter;
    const auto lines = splitter.feed("foo\nbar\nbaz");
    ASSERT_EQ(lines.size(), 2u);
    EXPECT_EQ(lines[0], "foo");
    EXPECT_EQ(lines[1], "bar");
}

TEST(LineSplitter, CompletesALineSplitAcrossFeeds) {
    LineSplitter splitter;
    EXPECT_TRUE(splitter.feed("par").empty());
    const auto lines = splitter.feed("tial\n");
    ASSERT_EQ(lines.size(), 1u);
    EXPECT_EQ(lines[0], "partial");
}

TEST(LineSplitter, FlushReturnsNulloptWhenEmpty) {
    LineSplitter splitter;
    splitter.feed("done\n");
    EXPECT_FALSE(splitter.flush().has_value());
}

TEST(LineSplitter, FlushReturnsBufferedRemainder) {
    LineSplitter splitter;
    splitter.feed("trailing");
    const auto rest = splitter.flush();
    ASSERT_TRUE(rest.has_value());
    EXPECT_EQ(*rest, "trailing");
    EXPECT_FALSE(splitter.flush().has_value());
}
