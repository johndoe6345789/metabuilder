#include "../src/services/RunFiles.hpp"

#include <gtest/gtest.h>

using namespace pastebin;

TEST(SanitizeFilesAndEntry, StripsPathAndUnsafeChars) {
    const auto out = sanitizeFilesAndEntry(
        {{"../../etc/pass wd!.py", "x"}}, "../../etc/pass wd!.py");
    ASSERT_EQ(out.files.size(), 1u);
    EXPECT_EQ(out.files[0].name, "pass_wd_.py");
    EXPECT_EQ(out.entryPoint, "pass_wd_.py");
}

TEST(SanitizeFilesAndEntry, ResolvesEntryByStemWhenExactMissing) {
    const auto out =
        sanitizeFilesAndEntry({{"main.py", "x"}}, "main.txt");
    EXPECT_EQ(out.entryPoint, "main.py");
}

TEST(SanitizeFilesAndEntry, FallsBackToFirstFile) {
    const auto out =
        sanitizeFilesAndEntry({{"a.py", "1"}, {"b.py", "2"}}, "missing.py");
    EXPECT_EQ(out.entryPoint, "a.py");
}

TEST(SanitizeFilesAndEntry, EmptyFilesKeepsRequestedEntry) {
    const auto out = sanitizeFilesAndEntry({}, "main.py");
    EXPECT_TRUE(out.files.empty());
    EXPECT_EQ(out.entryPoint, "main.py");
}

TEST(SanitizeFilesAndEntry, EmptyNameFallsBackToFile) {
    const auto out = sanitizeFilesAndEntry({{"", "x"}}, "");
    ASSERT_EQ(out.files.size(), 1u);
    EXPECT_EQ(out.files[0].name, "file");
}
