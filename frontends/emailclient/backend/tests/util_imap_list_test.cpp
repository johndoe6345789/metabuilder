#include "../src/util_imap_list.hpp"

#include <gtest/gtest.h>

using namespace email_backend;

TEST(ParseImapListLine, ParsesQuotedNameAndDelimiter) {
    const auto e = parseImapListLine(
        "* LIST (\\HasNoChildren \\Unmarked) \"/\" \"INBOX\"");
    ASSERT_TRUE(e.has_value());
    EXPECT_EQ(e->name, "INBOX");
    EXPECT_EQ(e->delimiter, "/");
    ASSERT_EQ(e->flags.size(), 2u);
    EXPECT_EQ(e->flags[0], "\\HasNoChildren");
    EXPECT_EQ(e->flags[1], "\\Unmarked");
}

TEST(ParseImapListLine, ParsesNameWithSpaces) {
    const auto e =
        parseImapListLine("* LIST (\\HasChildren) \"/\" \"Sent Items\"");
    ASSERT_TRUE(e.has_value());
    EXPECT_EQ(e->name, "Sent Items");
}

TEST(ParseImapListLine, TreatsNilDelimiterAsEmpty) {
    const auto e = parseImapListLine("* LIST (\\Noselect) NIL \"Drafts\"");
    ASSERT_TRUE(e.has_value());
    EXPECT_EQ(e->delimiter, "");
    EXPECT_EQ(e->name, "Drafts");
}

TEST(ParseImapListLine, ReturnsNulloptForNonListLine) {
    EXPECT_FALSE(parseImapListLine("* OK IMAP4rev1 Service Ready").has_value());
}
