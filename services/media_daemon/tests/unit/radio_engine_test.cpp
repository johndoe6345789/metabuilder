#include "media/radio_engine.hpp"
#include "media/plugin_manager.hpp"
#include <cassert>
#include <iostream>
#include <thread>
#include <chrono>

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
// Tests
// ============================================================================

bool test_radio_engine_init() {
    TEST("RadioEngine::initialize");

    media::PluginManager pm;
    pm.initialize("", "");

    media::RadioEngine engine;
    media::RadioEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/radio";
    config.hls_segment_duration = 6;

    auto result = engine.initialize(config, &pm);
    ASSERT_TRUE(result.is_ok());

    PASS();
    return true;
}

bool test_radio_engine_create_channel() {
    TEST("RadioEngine::create_channel");

    media::PluginManager pm;
    pm.initialize("", "");

    media::RadioEngine engine;
    media::RadioEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/radio";
    engine.initialize(config, &pm);

    media::RadioChannelConfig ch;
    ch.id = "test_channel_1";
    ch.tenant_id = "tenant_a";
    ch.name = "Test Radio Station";
    ch.bitrate_kbps = 128;
    ch.codec = "mp3";

    auto result = engine.create_channel(ch);
    ASSERT_TRUE(result.is_ok());
    ASSERT_EQ(result.value(), std::string("test_channel_1"));

    PASS();
    return true;
}

bool test_radio_engine_duplicate_channel() {
    TEST("RadioEngine::create_channel (duplicate)");

    media::PluginManager pm;
    pm.initialize("", "");

    media::RadioEngine engine;
    media::RadioEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/radio";
    engine.initialize(config, &pm);

    media::RadioChannelConfig ch;
    ch.id = "dup_channel";
    ch.tenant_id = "tenant_a";
    ch.name = "Duplicate Channel";

    auto r1 = engine.create_channel(ch);
    ASSERT_TRUE(r1.is_ok());

    auto r2 = engine.create_channel(ch);
    ASSERT_TRUE(r2.is_error());
    ASSERT_EQ(static_cast<int>(r2.error_code()), static_cast<int>(media::ErrorCode::CONFLICT));

    PASS();
    return true;
}

bool test_radio_engine_max_channels() {
    TEST("RadioEngine::create_channel (max channels)");

    media::PluginManager pm;
    pm.initialize("", "");

    media::RadioEngine engine;
    media::RadioEngineConfig config;
    config.max_channels = 2;  // Only allow 2 channels
    config.hls_output_dir = "/tmp/media_test/hls/radio";
    engine.initialize(config, &pm);

    for (int i = 0; i < 2; ++i) {
        media::RadioChannelConfig ch;
        ch.id = "ch_" + std::to_string(i);
        ch.tenant_id = "tenant_a";
        ch.name = "Channel " + std::to_string(i);
        auto r = engine.create_channel(ch);
        ASSERT_TRUE(r.is_ok());
    }

    // Third channel should fail
    media::RadioChannelConfig ch3;
    ch3.id = "ch_3";
    ch3.tenant_id = "tenant_a";
    ch3.name = "Channel 3";
    auto r3 = engine.create_channel(ch3);
    ASSERT_TRUE(r3.is_error());
    ASSERT_EQ(static_cast<int>(r3.error_code()), static_cast<int>(media::ErrorCode::CONFLICT));

    PASS();
    return true;
}

bool test_radio_engine_delete_channel() {
    TEST("RadioEngine::delete_channel");

    media::PluginManager pm;
    pm.initialize("", "");

    media::RadioEngine engine;
    media::RadioEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/radio";
    engine.initialize(config, &pm);

    media::RadioChannelConfig ch;
    ch.id = "delete_me";
    ch.tenant_id = "tenant_a";
    ch.name = "Channel to delete";
    engine.create_channel(ch);

    auto del_result = engine.delete_channel("delete_me");
    ASSERT_TRUE(del_result.is_ok());

    // Should not be findable
    auto status_result = engine.get_channel_status("delete_me");
    ASSERT_TRUE(status_result.is_error());
    ASSERT_EQ(static_cast<int>(status_result.error_code()), static_cast<int>(media::ErrorCode::NOT_FOUND));

    PASS();
    return true;
}

bool test_radio_engine_set_playlist() {
    TEST("RadioEngine::set_playlist");

    media::PluginManager pm;
    pm.initialize("", "");

    media::RadioEngine engine;
    media::RadioEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/radio";
    engine.initialize(config, &pm);

    media::RadioChannelConfig ch;
    ch.id = "playlist_channel";
    ch.tenant_id = "tenant_a";
    ch.name = "Playlist Test";
    engine.create_channel(ch);

    std::vector<media::RadioTrack> tracks;
    for (int i = 0; i < 5; ++i) {
        media::RadioTrack track;
        track.id = "track_" + std::to_string(i);
        track.path = "/data/music/track" + std::to_string(i) + ".mp3";
        track.title = "Track " + std::to_string(i);
        track.artist = "Test Artist";
        track.duration_ms = 210000;
        tracks.push_back(track);
    }

    auto result = engine.set_playlist("playlist_channel", tracks);
    ASSERT_TRUE(result.is_ok());

    auto playlist_result = engine.get_playlist("playlist_channel");
    ASSERT_TRUE(playlist_result.is_ok());
    ASSERT_EQ(playlist_result.value().size(), static_cast<size_t>(5));

    PASS();
    return true;
}

bool test_radio_engine_list_channels_tenant_filter() {
    TEST("RadioEngine::list_channels (tenant filter)");

    media::PluginManager pm;
    pm.initialize("", "");

    media::RadioEngine engine;
    media::RadioEngineConfig config;
    config.max_channels = 10;
    config.hls_output_dir = "/tmp/media_test/hls/radio";
    engine.initialize(config, &pm);

    // Create channels for tenant A
    for (int i = 0; i < 3; ++i) {
        media::RadioChannelConfig ch;
        ch.id = "tenant_a_ch_" + std::to_string(i);
        ch.tenant_id = "tenant_a";
        ch.name = "Channel A " + std::to_string(i);
        engine.create_channel(ch);
    }

    // Create channels for tenant B
    for (int i = 0; i < 2; ++i) {
        media::RadioChannelConfig ch;
        ch.id = "tenant_b_ch_" + std::to_string(i);
        ch.tenant_id = "tenant_b";
        ch.name = "Channel B " + std::to_string(i);
        engine.create_channel(ch);
    }

    auto all = engine.list_channels();
    ASSERT_TRUE(all.size() >= 5);

    auto tenant_a = engine.list_channels("tenant_a");
    ASSERT_EQ(tenant_a.size(), static_cast<size_t>(3));

    auto tenant_b = engine.list_channels("tenant_b");
    ASSERT_EQ(tenant_b.size(), static_cast<size_t>(2));

    PASS();
    return true;
}

bool test_radio_engine_listener_count() {
    TEST("RadioEngine::update_listener_count");

    media::PluginManager pm;
    pm.initialize("", "");

    media::RadioEngine engine;
    media::RadioEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/radio";
    engine.initialize(config, &pm);

    media::RadioChannelConfig ch;
    ch.id = "listener_channel";
    ch.tenant_id = "tenant_a";
    ch.name = "Listener Test";
    engine.create_channel(ch);

    engine.update_listener_count("listener_channel", 5);
    engine.update_listener_count("listener_channel", 3);

    ASSERT_EQ(engine.get_total_listeners(), 8);

    engine.update_listener_count("listener_channel", -2);
    ASSERT_EQ(engine.get_total_listeners(), 6);

    PASS();
    return true;
}

bool test_radio_channel_not_found() {
    TEST("RadioEngine::get_channel_status (not found)");

    media::PluginManager pm;
    pm.initialize("", "");

    media::RadioEngine engine;
    media::RadioEngineConfig config;
    config.hls_output_dir = "/tmp/media_test/hls/radio";
    engine.initialize(config, &pm);

    auto result = engine.get_channel_status("nonexistent_channel");
    ASSERT_TRUE(result.is_error());
    ASSERT_EQ(static_cast<int>(result.error_code()), static_cast<int>(media::ErrorCode::NOT_FOUND));

    PASS();
    return true;
}

// ============================================================================
// Main
// ============================================================================

int main() {
    std::cout << "=== Radio Engine Unit Tests ===" << std::endl;
    std::cout << std::endl;

    bool all_passed = true;
    all_passed &= test_radio_engine_init();
    all_passed &= test_radio_engine_create_channel();
    all_passed &= test_radio_engine_duplicate_channel();
    all_passed &= test_radio_engine_max_channels();
    all_passed &= test_radio_engine_delete_channel();
    all_passed &= test_radio_engine_set_playlist();
    all_passed &= test_radio_engine_list_channels_tenant_filter();
    all_passed &= test_radio_engine_listener_count();
    all_passed &= test_radio_channel_not_found();

    std::cout << std::endl;
    std::cout << "=== Results: " << tests_passed << "/" << tests_run
              << " tests passed ===" << std::endl;

    return all_passed ? 0 : 1;
}
