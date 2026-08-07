#include "../src/util.hpp"

#include <gtest/gtest.h>
#include <cstdlib>

using namespace pastebin;

TEST(EnvOr, ReturnsFallbackWhenUnset) {
    unsetenv("PASTEBIN_TEST_VAR");
    EXPECT_EQ(envOr("PASTEBIN_TEST_VAR", "fallback"), "fallback");
}

TEST(EnvOr, ReturnsSetValue) {
    setenv("PASTEBIN_TEST_VAR", "actual", 1);
    EXPECT_EQ(envOr("PASTEBIN_TEST_VAR", "fallback"), "actual");
    unsetenv("PASTEBIN_TEST_VAR");
}

TEST(EnvInt, ParsesSetValue) {
    setenv("PASTEBIN_TEST_INT", "42", 1);
    EXPECT_EQ(envInt("PASTEBIN_TEST_INT", 7), 42);
    unsetenv("PASTEBIN_TEST_INT");
}

TEST(DbalTenant, DefaultsToPastebin) {
    unsetenv("DBAL_TENANT_ID");
    EXPECT_EQ(dbalTenant(), "pastebin");
}

TEST(DbalTenant, ReadsEnvOverride) {
    setenv("DBAL_TENANT_ID", "custom", 1);
    EXPECT_EQ(dbalTenant(), "custom");
    unsetenv("DBAL_TENANT_ID");
}

TEST(NowIso, ProducesIsoShapeWithMicroseconds) {
    const auto s = nowIso();
    // "YYYY-MM-DDTHH:MM:SS.ffffff" -- 26 chars, no trailing Z.
    ASSERT_EQ(s.size(), 26u);
    EXPECT_EQ(s[4], '-');
    EXPECT_EQ(s[10], 'T');
    EXPECT_EQ(s[19], '.');
}
