#include "../src/util_address.hpp"

#include <gtest/gtest.h>

using namespace email_backend;

TEST(SplitAddressList, SplitsAndTrims) {
    const auto out = splitAddressList("a@x.com,  b@x.com ,c@x.com");
    ASSERT_EQ(out.size(), 3u);
    EXPECT_EQ(out[0], "a@x.com");
    EXPECT_EQ(out[1], "b@x.com");
    EXPECT_EQ(out[2], "c@x.com");
}

TEST(SplitAddressList, SkipsEmptyEntries) {
    const auto out = splitAddressList("a@x.com,,  ,b@x.com");
    ASSERT_EQ(out.size(), 2u);
    EXPECT_EQ(out[0], "a@x.com");
    EXPECT_EQ(out[1], "b@x.com");
}

TEST(SplitAddressList, EmptyStringYieldsNoEntries) {
    EXPECT_TRUE(splitAddressList("").empty());
}

TEST(ExtractHeader, FindsSimpleHeader) {
    const std::string raw =
        "From: alice@example.com\r\nTo: bob@example.com\r\nSubject: Hi\r\n";
    EXPECT_EQ(extractHeader(raw, "Subject"), "Hi");
    EXPECT_EQ(extractHeader(raw, "From"), "alice@example.com");
}

TEST(ExtractHeader, IsCaseInsensitive) {
    const std::string raw = "subject: lowercase works\r\n";
    EXPECT_EQ(extractHeader(raw, "Subject"), "lowercase works");
}

TEST(ExtractHeader, JoinsFoldedContinuationLines) {
    const std::string raw =
        "Subject: this is a very\r\n long subject line\r\nFrom: a@b.com\r\n";
    EXPECT_EQ(extractHeader(raw, "Subject"),
              "this is a very long subject line");
}

TEST(ExtractHeader, ReturnsEmptyWhenAbsent) {
    const std::string raw = "From: a@b.com\r\n";
    EXPECT_EQ(extractHeader(raw, "Subject"), "");
}
