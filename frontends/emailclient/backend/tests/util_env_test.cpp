#include "../src/util_env.hpp"

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
    const auto s = nowIso();
    ASSERT_EQ(s.size(), 20u);
    EXPECT_EQ(s[10], 'T');
    EXPECT_EQ(s[19], 'Z');
}
