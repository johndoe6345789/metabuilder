#include "../src/services/InteractivePreamble.hpp"

#include <gtest/gtest.h>

using namespace pastebin;

TEST(InjectInteractivePreamble, PrependsToTheMatchingEntryFile) {
    const std::vector<SourceFile> files = {
        {"main.py", "print('hi')"}, {"other.py", "print('bye')"}};

    const auto out = injectInteractivePreamble(files, "main.py");
    ASSERT_EQ(out.size(), 2u);
    EXPECT_NE(out[0].content.find("print('hi')"), std::string::npos);
    EXPECT_NE(out[0].content.find("__isinp"), std::string::npos);
    EXPECT_EQ(out[1].content, "print('bye')");
}

TEST(InjectInteractivePreamble, LeavesFilesUnchangedWhenNoEntryMatches) {
    const std::vector<SourceFile> files = {{"main.py", "print('hi')"}};
    const auto out = injectInteractivePreamble(files, "missing.py");
    ASSERT_EQ(out.size(), 1u);
    EXPECT_EQ(out[0].name, "main.py");
    EXPECT_EQ(out[0].content, "print('hi')");
}
