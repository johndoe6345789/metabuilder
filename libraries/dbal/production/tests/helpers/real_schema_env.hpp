/**
 * @file real_schema_env.hpp
 * @brief RAII guard that points DBAL_SCHEMA_DIR and DBAL_TEMPLATE_DIR at the
 *        real production entity schemas (Credential, User, ...) and SQL
 *        Jinja2 templates, for tests that construct a full dbal::Client and
 *        exercise its schema-driven generic CRUD, as opposed to
 *        IntegrationFixture's synthetic single-entity TestItem schema.
 *        DBAL_TEST_SCHEMA_DIR / DBAL_TEST_TEMPLATE_DIR are set by
 *        CMakeLists.txt.
 */
#pragma once

#include <cstdlib>
#include <string>

namespace dbal_test {

class RealSchemaEnvGuard {
public:
    RealSchemaEnvGuard() {
        had_previous_schema_ = setAndSave("DBAL_SCHEMA_DIR", DBAL_TEST_SCHEMA_DIR, previous_schema_);
        had_previous_template_ = setAndSave("DBAL_TEMPLATE_DIR", DBAL_TEST_TEMPLATE_DIR, previous_template_);
    }

    ~RealSchemaEnvGuard() {
        restore("DBAL_SCHEMA_DIR", had_previous_schema_, previous_schema_);
        restore("DBAL_TEMPLATE_DIR", had_previous_template_, previous_template_);
    }

    RealSchemaEnvGuard(const RealSchemaEnvGuard&) = delete;
    RealSchemaEnvGuard& operator=(const RealSchemaEnvGuard&) = delete;

private:
    static bool setAndSave(const char* var, const char* newValue, std::string& previousOut) {
        const char* existing = std::getenv(var);
        bool hadPrevious = existing != nullptr;
        if (hadPrevious) previousOut = existing;
        setenv(var, newValue, 1);
        return hadPrevious;
    }

    static void restore(const char* var, bool hadPrevious, const std::string& previous) {
        if (hadPrevious) {
            setenv(var, previous.c_str(), 1);
        } else {
            unsetenv(var);
        }
    }

    bool had_previous_schema_ = false;
    std::string previous_schema_;
    bool had_previous_template_ = false;
    std::string previous_template_;
};

} // namespace dbal_test
