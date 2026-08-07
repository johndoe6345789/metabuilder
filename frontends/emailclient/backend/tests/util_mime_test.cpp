#include "../src/util_mime.hpp"

#include <gtest/gtest.h>

using namespace email_backend;

TEST(BuildMimeMessage, PlainTextOnly) {
    MimeMessage msg;
    msg.from = "a@x.com";
    msg.to = "b@x.com";
    msg.subject = "Hello";
    msg.bodyText = "Hi there";

    const auto out = buildMimeMessage(msg, "BOUND");
    EXPECT_NE(out.find("From: a@x.com\r\n"), std::string::npos);
    EXPECT_NE(out.find("To: b@x.com\r\n"), std::string::npos);
    EXPECT_NE(out.find("Subject: Hello\r\n"), std::string::npos);
    EXPECT_NE(out.find("Content-Type: text/plain"), std::string::npos);
    EXPECT_NE(out.find("Hi there"), std::string::npos);
    EXPECT_EQ(out.find("multipart"), std::string::npos);
}

TEST(BuildMimeMessage, MultipartWhenHtmlProvided) {
    MimeMessage msg;
    msg.from = "a@x.com";
    msg.to = "b@x.com";
    msg.subject = "Hello";
    msg.bodyText = "plain body";
    msg.bodyHtml = "<p>html body</p>";
    msg.cc = "c@x.com";
    msg.replyTo = "reply@x.com";

    const auto out = buildMimeMessage(msg, "BOUND123");
    EXPECT_NE(out.find("multipart/alternative; boundary=\"BOUND123\""),
              std::string::npos);
    EXPECT_NE(out.find("Cc: c@x.com\r\n"), std::string::npos);
    EXPECT_NE(out.find("Reply-To: reply@x.com\r\n"), std::string::npos);
    EXPECT_NE(out.find("--BOUND123\r\n"), std::string::npos);
    EXPECT_NE(out.find("--BOUND123--\r\n"), std::string::npos);
    EXPECT_NE(out.find("plain body"), std::string::npos);
    EXPECT_NE(out.find("<p>html body</p>"), std::string::npos);
}
