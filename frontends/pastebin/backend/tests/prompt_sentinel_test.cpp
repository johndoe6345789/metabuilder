#include "../src/services/PromptSentinel.hpp"

#include <gtest/gtest.h>

using namespace pastebin;

TEST(PromptSentinel, MatchesAWrappedPromptLine) {
    const std::string line = promptStart() + "Enter name:" + promptEnd();
    const auto prompt = matchPromptLine(line);
    ASSERT_TRUE(prompt.has_value());
    EXPECT_EQ(*prompt, "Enter name:");
}

TEST(PromptSentinel, MatchesAnEmptyPrompt) {
    const std::string line = promptStart() + promptEnd();
    const auto prompt = matchPromptLine(line);
    ASSERT_TRUE(prompt.has_value());
    EXPECT_TRUE(prompt->empty());
}

TEST(PromptSentinel, RejectsOrdinaryOutput) {
    EXPECT_FALSE(matchPromptLine("hello from real docker").has_value());
}

TEST(PromptSentinel, RejectsALineMissingTheClosingSentinel) {
    EXPECT_FALSE(matchPromptLine(promptStart() + "no closer").has_value());
}
