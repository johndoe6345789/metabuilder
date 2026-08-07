#include "../src/util_imap_fetch.hpp"

#include <gtest/gtest.h>

using namespace email_backend;

TEST(ParseFetchResponse, ParsesSingleMessageWithLiterals) {
    const std::string header = "From: a@x.com\r\nSubject: Hi\r\n";
    const std::string body = "hello world";
    const std::string raw = "* 5 FETCH (UID 5 FLAGS (\\Seen) BODY[HEADER] {" +
        std::to_string(header.size()) + "}\r\n" + header +
        " BODY[TEXT] {" + std::to_string(body.size()) + "}\r\n" + body +
        ")\r\n" + "A1 OK FETCH completed\r\n";

    const auto out = parseFetchResponse(raw);
    ASSERT_EQ(out.size(), 1u);
    EXPECT_EQ(out[0].uid, 5);
    EXPECT_TRUE(out[0].seen);
    EXPECT_EQ(out[0].rawHeaders, header);
    EXPECT_EQ(out[0].bodyText, body);
}

TEST(ParseFetchResponse, ParsesMultipleMessagesAndUnseenFlag) {
    const std::string h1 = "Subject: One\r\n";
    const std::string b1 = "body one";
    const std::string h2 = "Subject: Two\r\n";
    const std::string b2 = "body two";
    const std::string raw =
        "* 1 FETCH (UID 10 FLAGS () BODY[HEADER] {" +
        std::to_string(h1.size()) + "}\r\n" + h1 + " BODY[TEXT] {" +
        std::to_string(b1.size()) + "}\r\n" + b1 + ")\r\n" +
        "* 2 FETCH (UID 11 FLAGS (\\Seen) BODY[HEADER] {" +
        std::to_string(h2.size()) + "}\r\n" + h2 + " BODY[TEXT] {" +
        std::to_string(b2.size()) + "}\r\n" + b2 + ")\r\n" +
        "A1 OK FETCH completed\r\n";

    const auto out = parseFetchResponse(raw);
    ASSERT_EQ(out.size(), 2u);
    EXPECT_EQ(out[0].uid, 10);
    EXPECT_FALSE(out[0].seen);
    EXPECT_EQ(out[0].bodyText, b1);
    EXPECT_EQ(out[1].uid, 11);
    EXPECT_TRUE(out[1].seen);
    EXPECT_EQ(out[1].rawHeaders, h2);
}

TEST(ParseFetchResponse, LiteralBytesLookingLikeImapDoNotConfuseParser) {
    // The literal body deliberately contains a line starting with "* " and
    // a stray ')' to prove the parser tracks the literal by byte count, not
    // by scanning for syntax inside it.
    const std::string header = "Subject: tricky\r\n";
    const std::string body = "line one\n* not a real response )\nline two";
    const std::string raw = "* 1 FETCH (UID 42 FLAGS () BODY[HEADER] {" +
        std::to_string(header.size()) + "}\r\n" + header + " BODY[TEXT] {" +
        std::to_string(body.size()) + "}\r\n" + body + ")\r\n";

    const auto out = parseFetchResponse(raw);
    ASSERT_EQ(out.size(), 1u);
    EXPECT_EQ(out[0].uid, 42);
    EXPECT_EQ(out[0].bodyText, body);
}

TEST(ParseFetchResponse, EmptyResponseYieldsNoMessages) {
    EXPECT_TRUE(parseFetchResponse("A1 OK FETCH completed\r\n").empty());
}
