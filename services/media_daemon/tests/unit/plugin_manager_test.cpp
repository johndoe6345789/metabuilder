#include "media/plugin_manager.hpp"
#include "media/plugin.hpp"
#include <cassert>
#include <iostream>
#include <memory>

// ============================================================================
// Simple test framework
// ============================================================================

static int tests_run = 0;
static int tests_passed = 0;

#define TEST(name) \
    do { \
        ++tests_run; \
        std::cout << "TEST: " << name << " ... "; \
        std::cout.flush(); \
    } while(0)

#define PASS() \
    do { \
        ++tests_passed; \
        std::cout << "PASS" << std::endl; \
    } while(0)

#define ASSERT_TRUE(expr) \
    do { \
        if (!(expr)) { \
            std::cout << "FAIL\n  Assertion failed: " << #expr \
                      << " at " << __FILE__ << ":" << __LINE__ << std::endl; \
            return false; \
        } \
    } while(0)

#define ASSERT_EQ(a, b) \
    do { \
        if ((a) != (b)) { \
            std::cout << "FAIL\n  Expected " << #a << " == " << #b \
                      << " at " << __FILE__ << ":" << __LINE__ << std::endl; \
            return false; \
        } \
    } while(0)

// ============================================================================
// Stub plugin for testing
// ============================================================================

class TestPlugin : public media::Plugin {
public:
    explicit TestPlugin(const std::string& id, media::JobType handled_type)
        : id_(id), handled_type_(handled_type) {}

    media::PluginInfo info() const override {
        return media::PluginInfo{
            .id = id_,
            .name = "Test Plugin " + id_,
            .version = "1.0.0",
            .author = "Test",
            .description = "Test plugin",
            .type = media::PluginType::PROCESSOR,
            .supported_formats = {"test"},
            .capabilities = {"test"},
            .is_loaded = initialized_,
            .is_builtin = true
        };
    }

    media::PluginCapabilities capabilities() const override {
        media::PluginCapabilities caps;
        caps.supports_document = true;
        return caps;
    }

    media::Result<void> initialize(const std::string& /*config_path*/) override {
        initialized_ = true;
        return media::Result<void>::ok();
    }

    void shutdown() override { initialized_ = false; }
    bool is_healthy() const override { return initialized_; }

    bool can_handle(media::JobType type, const media::JobParams& /*params*/) const override {
        return type == handled_type_ && initialized_;
    }

    media::Result<std::string> process(
        const media::JobRequest& request,
        media::JobProgressCallback /*cb*/
    ) override {
        return media::Result<std::string>::ok("test_output_" + request.id);
    }

    media::Result<void> cancel(const std::string& /*job_id*/) override {
        return media::Result<void>::ok();
    }

private:
    std::string id_;
    media::JobType handled_type_;
    bool initialized_ = false;
};

// ============================================================================
// Tests
// ============================================================================

bool test_plugin_manager_init() {
    TEST("PluginManager::initialize");

    media::PluginManager pm;
    auto result = pm.initialize("", "");
    ASSERT_TRUE(result.is_ok());
    ASSERT_TRUE(pm.is_initialized());

    PASS();
    return true;
}

bool test_plugin_manager_register_builtin() {
    TEST("PluginManager::register_builtin");

    media::PluginManager pm;
    pm.initialize("", "");

    auto plugin = std::make_unique<TestPlugin>("test_plugin_1", media::JobType::DOCUMENT_CONVERT);
    plugin->initialize("");

    auto result = pm.register_builtin(std::move(plugin));
    ASSERT_TRUE(result.is_ok());
    ASSERT_EQ(pm.plugin_count(), static_cast<size_t>(1));

    PASS();
    return true;
}

bool test_plugin_manager_get_plugin() {
    TEST("PluginManager::get_plugin");

    media::PluginManager pm;
    pm.initialize("", "");

    auto plugin = std::make_unique<TestPlugin>("find_me", media::JobType::AUDIO_TRANSCODE);
    plugin->initialize("");

    pm.register_builtin(std::move(plugin));

    // Get by ID
    media::Plugin* found = pm.get_plugin("find_me");
    ASSERT_TRUE(found != nullptr);
    ASSERT_EQ(found->info().id, std::string("find_me"));

    // Non-existent
    media::Plugin* not_found = pm.get_plugin("does_not_exist");
    ASSERT_TRUE(not_found == nullptr);

    PASS();
    return true;
}

bool test_plugin_manager_find_for_job() {
    TEST("PluginManager::find_plugin_for_job");

    media::PluginManager pm;
    pm.initialize("", "");

    auto plugin = std::make_unique<TestPlugin>("audio_handler", media::JobType::AUDIO_TRANSCODE);
    plugin->initialize("");

    pm.register_builtin(std::move(plugin));

    // Audio params
    media::AudioTranscodeParams ap;
    ap.input_path = "/tmp/test.mp3";
    ap.output_path = "/tmp/out.mp3";

    media::Plugin* found = pm.find_plugin_for_job(media::JobType::AUDIO_TRANSCODE, ap);
    ASSERT_TRUE(found != nullptr);
    ASSERT_EQ(found->info().id, std::string("audio_handler"));

    // Wrong type
    media::VideoTranscodeParams vp;
    vp.input_path = "/tmp/test.mp4";
    vp.output_path = "/tmp/out.mp4";

    media::Plugin* not_found = pm.find_plugin_for_job(media::JobType::VIDEO_TRANSCODE, vp);
    ASSERT_TRUE(not_found == nullptr);

    PASS();
    return true;
}

bool test_plugin_manager_list_plugins() {
    TEST("PluginManager::list_plugins");

    media::PluginManager pm;
    pm.initialize("", "");

    for (int i = 0; i < 3; ++i) {
        auto p = std::make_unique<TestPlugin>(
            "plugin_" + std::to_string(i),
            media::JobType::CUSTOM
        );
        p->initialize("");
        pm.register_builtin(std::move(p));
    }

    auto plugins = pm.list_plugins();
    ASSERT_EQ(plugins.size(), static_cast<size_t>(3));

    PASS();
    return true;
}

bool test_plugin_manager_health_check() {
    TEST("PluginManager::health_check");

    media::PluginManager pm;
    pm.initialize("", "");

    auto p = std::make_unique<TestPlugin>("healthy_plugin", media::JobType::IMAGE_PROCESS);
    p->initialize("");  // Makes it healthy

    pm.register_builtin(std::move(p));

    auto health = pm.health_check();
    ASSERT_TRUE(health.count("healthy_plugin") > 0);
    ASSERT_TRUE(health["healthy_plugin"] == true);

    PASS();
    return true;
}

bool test_plugin_manager_null_plugin() {
    TEST("PluginManager::register_builtin (null plugin)");

    media::PluginManager pm;
    pm.initialize("", "");

    auto result = pm.register_builtin(nullptr);
    ASSERT_TRUE(result.is_error());
    ASSERT_EQ(static_cast<int>(result.error_code()), static_cast<int>(media::ErrorCode::VALIDATION_ERROR));

    PASS();
    return true;
}

bool test_plugin_manager_init_nonexistent_dir() {
    TEST("PluginManager::initialize (nonexistent plugin dir)");

    media::PluginManager pm;
    // Should succeed even with nonexistent dir (graceful degradation)
    auto result = pm.initialize("/nonexistent/plugin/dir", "");
    ASSERT_TRUE(result.is_ok());

    PASS();
    return true;
}

// ============================================================================
// Main
// ============================================================================

int main() {
    std::cout << "=== Plugin Manager Unit Tests ===" << std::endl;
    std::cout << std::endl;

    bool all_passed = true;
    all_passed &= test_plugin_manager_init();
    all_passed &= test_plugin_manager_register_builtin();
    all_passed &= test_plugin_manager_get_plugin();
    all_passed &= test_plugin_manager_find_for_job();
    all_passed &= test_plugin_manager_list_plugins();
    all_passed &= test_plugin_manager_health_check();
    all_passed &= test_plugin_manager_null_plugin();
    all_passed &= test_plugin_manager_init_nonexistent_dir();

    std::cout << std::endl;
    std::cout << "=== Results: " << tests_passed << "/" << tests_run
              << " tests passed ===" << std::endl;

    return all_passed ? 0 : 1;
}
