#include "../src/util.hpp"

#include <gtest/gtest.h>
#include <cstdlib>

using namespace email_backend;

TEST(EnvOr, ReturnsFallbackWhenUnset) {
    unsetenv("EMAIL_BACKEND_TEST_VAR");
    EXPECT_EQ(envOr("EMAIL_BACKEND_TEST_VAR", "fallback"), "fallback");
}

TEST(EnvOr, ReturnsSetValue) {
    setenv("EMAIL_BACKEND_TEST_VAR", "actual", 1);
    EXPECT_EQ(envOr("EMAIL_BACKEND_TEST_VAR", "fallback"), "actual");
    unsetenv("EMAIL_BACKEND_TEST_VAR");
}

TEST(EnvInt, ParsesSetValue) {
    setenv("EMAIL_BACKEND_TEST_INT", "993", 1);
    EXPECT_EQ(envInt("EMAIL_BACKEND_TEST_INT", 143), 993);
    unsetenv("EMAIL_BACKEND_TEST_INT");
}

TEST(NowIso, ProducesUtcIso8601Shape) {
    auto s = nowIso();
    ASSERT_EQ(s.size(), 20u);
    EXPECT_EQ(s[10], 'T');
    EXPECT_EQ(s[19], 'Z');
}

TEST(SplitAddressList, SplitsAndTrims) {
    auto out = splitAddressList("a@x.com,  b@x.com ,c@x.com");
    ASSERT_EQ(out.size(), 3u);
    EXPECT_EQ(out[0], "a@x.com");
    EXPECT_EQ(out[1], "b@x.com");
    EXPECT_EQ(out[2], "c@x.com");
}

TEST(SplitAddressList, SkipsEmptyEntries) {
    auto out = splitAddressList("a@x.com,,  ,b@x.com");
    ASSERT_EQ(out.size(), 2u);
    EXPECT_EQ(out[0], "a@x.com");
    EXPECT_EQ(out[1], "b@x.com");
}

TEST(SplitAddressList, EmptyStringYieldsNoEntries) {
    EXPECT_TRUE(splitAddressList("").empty());
}

TEST(ExtractHeader, FindsSimpleHeader) {
    std::string raw = "From: alice@example.com\r\nTo: bob@example.com\r\nSubject: Hi\r\n";
    EXPECT_EQ(extractHeader(raw, "Subject"), "Hi");
    EXPECT_EQ(extractHeader(raw, "From"), "alice@example.com");
}

TEST(ExtractHeader, IsCaseInsensitive) {
    std::string raw = "subject: lowercase works\r\n";
    EXPECT_EQ(extractHeader(raw, "Subject"), "lowercase works");
}

TEST(ExtractHeader, JoinsFoldedContinuationLines) {
    std::string raw = "Subject: this is a very\r\n long subject line\r\nFrom: a@b.com\r\n";
    EXPECT_EQ(extractHeader(raw, "Subject"), "this is a very long subject line");
}

TEST(ExtractHeader, ReturnsEmptyWhenAbsent) {
    std::string raw = "From: a@b.com\r\n";
    EXPECT_EQ(extractHeader(raw, "Subject"), "");
}

TEST(BuildMimeMessage, PlainTextOnly) {
    MimeMessage msg;
    msg.from = "a@x.com";
    msg.to = "b@x.com";
    msg.subject = "Hello";
    msg.bodyText = "Hi there";

    auto out = buildMimeMessage(msg, "BOUND");
    EXPECT_NE(out.find("From: a@x.com\r\n"), std::string::npos);
    EXPECT_NE(out.find("To: b@x.com\r\n"), std::string::npos);
    EXPECT_NE(out.find("Subject: Hello\r\n"), std::string::npos);
    EXPECT_NE(out.find("Content-Type: text/plain; charset=utf-8"), std::string::npos);
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

    auto out = buildMimeMessage(msg, "BOUND123");
    EXPECT_NE(out.find("multipart/alternative; boundary=\"BOUND123\""), std::string::npos);
    EXPECT_NE(out.find("Cc: c@x.com\r\n"), std::string::npos);
    EXPECT_NE(out.find("Reply-To: reply@x.com\r\n"), std::string::npos);
    EXPECT_NE(out.find("--BOUND123\r\n"), std::string::npos);
    EXPECT_NE(out.find("--BOUND123--\r\n"), std::string::npos);
    EXPECT_NE(out.find("plain body"), std::string::npos);
    EXPECT_NE(out.find("<p>html body</p>"), std::string::npos);
}

TEST(ParseImapListLine, ParsesQuotedNameAndDelimiter) {
    auto e = parseImapListLine("* LIST (\\HasNoChildren \\Unmarked) \"/\" \"INBOX\"");
    ASSERT_TRUE(e.has_value());
    EXPECT_EQ(e->name, "INBOX");
    EXPECT_EQ(e->delimiter, "/");
    ASSERT_EQ(e->flags.size(), 2u);
    EXPECT_EQ(e->flags[0], "\\HasNoChildren");
    EXPECT_EQ(e->flags[1], "\\Unmarked");
}

TEST(ParseImapListLine, ParsesNameWithSpaces) {
    auto e = parseImapListLine("* LIST (\\HasChildren) \"/\" \"Sent Items\"");
    ASSERT_TRUE(e.has_value());
    EXPECT_EQ(e->name, "Sent Items");
}

TEST(ParseImapListLine, TreatsNilDelimiterAsEmpty) {
    auto e = parseImapListLine("* LIST (\\Noselect) NIL \"Drafts\"");
    ASSERT_TRUE(e.has_value());
    EXPECT_EQ(e->delimiter, "");
    EXPECT_EQ(e->name, "Drafts");
}

TEST(ParseImapListLine, ReturnsNulloptForNonListLine) {
    EXPECT_FALSE(parseImapListLine("* OK IMAP4rev1 Service Ready").has_value());
}

TEST(ParseFetchResponse, ParsesSingleMessageWithLiterals) {
    std::string header = "From: a@x.com\r\nSubject: Hi\r\n";
    std::string body = "hello world";
    std::string raw = "* 5 FETCH (UID 5 FLAGS (\\Seen) BODY[HEADER] {" +
        std::to_string(header.size()) + "}\r\n" + header +
        " BODY[TEXT] {" + std::to_string(body.size()) + "}\r\n" + body + ")\r\n" +
        "A1 OK FETCH completed\r\n";

    auto out = parseFetchResponse(raw);
    ASSERT_EQ(out.size(), 1u);
    EXPECT_EQ(out[0].uid, 5);
    EXPECT_TRUE(out[0].seen);
    EXPECT_EQ(out[0].rawHeaders, header);
    EXPECT_EQ(out[0].bodyText, body);
}

TEST(ParseFetchResponse, ParsesMultipleMessagesAndUnseenFlag) {
    std::string h1 = "Subject: One\r\n";
    std::string b1 = "body one";
    std::string h2 = "Subject: Two\r\n";
    std::string b2 = "body two";
    std::string raw =
        "* 1 FETCH (UID 10 FLAGS () BODY[HEADER] {" + std::to_string(h1.size()) +
        "}\r\n" + h1 + " BODY[TEXT] {" + std::to_string(b1.size()) + "}\r\n" + b1 + ")\r\n" +
        "* 2 FETCH (UID 11 FLAGS (\\Seen) BODY[HEADER] {" + std::to_string(h2.size()) +
        "}\r\n" + h2 + " BODY[TEXT] {" + std::to_string(b2.size()) + "}\r\n" + b2 + ")\r\n" +
        "A1 OK FETCH completed\r\n";

    auto out = parseFetchResponse(raw);
    ASSERT_EQ(out.size(), 2u);
    EXPECT_EQ(out[0].uid, 10);
    EXPECT_FALSE(out[0].seen);
    EXPECT_EQ(out[0].bodyText, b1);
    EXPECT_EQ(out[1].uid, 11);
    EXPECT_TRUE(out[1].seen);
    EXPECT_EQ(out[1].rawHeaders, h2);
}

TEST(ParseFetchResponse, LiteralBytesContainingImapLikeTextDoNotConfuseParser) {
    // The literal body deliberately contains a line starting with "* " and a
    // stray ')' to prove the parser tracks the literal by byte count, not by
    // scanning for syntax inside it.
    std::string header = "Subject: tricky\r\n";
    std::string body = "line one\n* not a real response )\nline two";
    std::string raw = "* 1 FETCH (UID 42 FLAGS () BODY[HEADER] {" +
        std::to_string(header.size()) + "}\r\n" + header +
        " BODY[TEXT] {" + std::to_string(body.size()) + "}\r\n" + body + ")\r\n";

    auto out = parseFetchResponse(raw);
    ASSERT_EQ(out.size(), 1u);
    EXPECT_EQ(out[0].uid, 42);
    EXPECT_EQ(out[0].bodyText, body);
}

TEST(ParseFetchResponse, EmptyResponseYieldsNoMessages) {
    EXPECT_TRUE(parseFetchResponse("A1 OK FETCH completed\r\n").empty());
}
