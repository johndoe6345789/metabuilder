#include "../src/util.hpp"

#include <gtest/gtest.h>
#include <cstdlib>

using namespace dockerterminal;

TEST(EnvOr, ReturnsFallbackWhenUnset) {
    unsetenv("DOCKERTERMINAL_TEST_VAR");
    EXPECT_EQ(envOr("DOCKERTERMINAL_TEST_VAR", "fallback"), "fallback");
}

TEST(EnvInt, ParsesSetValue) {
    setenv("DOCKERTERMINAL_TEST_INT", "1234", 1);
    EXPECT_EQ(envInt("DOCKERTERMINAL_TEST_INT", 5000), 1234);
    unsetenv("DOCKERTERMINAL_TEST_INT");
}

TEST(SplitCommand, SplitsOnWhitespace) {
    auto out = splitCommand("ls -la /tmp");
    ASSERT_EQ(out.size(), 3u);
    EXPECT_EQ(out[0], "ls");
    EXPECT_EQ(out[1], "-la");
    EXPECT_EQ(out[2], "/tmp");
}

TEST(SplitCommand, SingleTokenNoSplitting) {
    auto out = splitCommand("/bin/sh");
    ASSERT_EQ(out.size(), 1u);
    EXPECT_EQ(out[0], "/bin/sh");
}

TEST(SplitCommand, KeepsQuotedArgumentTogether) {
    auto out = splitCommand("sh -c \"echo hello world\"");
    ASSERT_EQ(out.size(), 3u);
    EXPECT_EQ(out[0], "sh");
    EXPECT_EQ(out[1], "-c");
    EXPECT_EQ(out[2], "echo hello world");
}

TEST(SplitCommand, SingleQuotesAlsoGroupArguments) {
    auto out = splitCommand("sh -c 'echo a b c'");
    ASSERT_EQ(out.size(), 3u);
    EXPECT_EQ(out[2], "echo a b c");
}

TEST(SplitCommand, CollapsesExtraWhitespace) {
    auto out = splitCommand("  ls   -la  ");
    ASSERT_EQ(out.size(), 2u);
    EXPECT_EQ(out[0], "ls");
    EXPECT_EQ(out[1], "-la");
}

TEST(SplitCommand, EmptyStringYieldsNoTokens) {
    EXPECT_TRUE(splitCommand("").empty());
}

TEST(FormatUptime, MinutesOnly) {
    EXPECT_EQ(formatUptime(1000, 1000 + 5 * 60), "5m");
}

TEST(FormatUptime, HoursAndMinutes) {
    EXPECT_EQ(formatUptime(0, 2 * 3600 + 15 * 60), "2h 15m");
}

TEST(FormatUptime, DaysAndHours) {
    EXPECT_EQ(formatUptime(0, 3 * 86400 + 4 * 3600 + 30 * 60), "3d 4h");
}

TEST(FormatUptime, ZeroDeltaIsZeroMinutes) {
    EXPECT_EQ(formatUptime(500, 500), "0m");
}

TEST(FormatUptime, ClampsNegativeDeltaToZero) {
    EXPECT_EQ(formatUptime(1000, 500), "0m");
}
