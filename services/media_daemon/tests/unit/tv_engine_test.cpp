#include "media/tv_engine.hpp"
#include "media/plugin_manager.hpp"
#include <cassert>
#include <iostream>
#include <chrono>
#include <thread>

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

bool test_tv_engine_init() {
    TEST("TvEngine::initialize");

    media::PluginManager pm;
    pm.initialize("", "");

    media::TvEngine engine;
    media::TvEngineConfig config;
    config.max_channels = 3;
    config.hls_output_dir = "/tmp/media_test/hls/tv";
    config.hls_segment_duration = 4;
    config.hls_playlist_size = 10;

    auto result = engine.initialize(config, &pm);
    ASSERT_TRUE(result.is_ok());

    PASS();
    return true;
}

bool test_tv_engine_create_channel() {
    TEST("TvEngine::create_channel");

    media::PluginManager pm;
    pm.initialize("", "");

    media::TvEngine engine;
    media::TvEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/tv";
    engine.initialize(config, &pm);

    media::TvChannelConfig ch;
    ch.id = "tv_ch_1";
    ch.tenant_id = "tenant_a";
    ch.name = "Test TV Channel";
    ch.channel_number = 1;
    ch.codec = "h264";
    ch.segment_duration_seconds = 4;
    ch.playlist_size = 10;

    auto result = engine.create_channel(ch);
    ASSERT_TRUE(result.is_ok());
    ASSERT_EQ(result.value(), std::string("tv_ch_1"));

    PASS();
    return true;
}

bool test_tv_engine_duplicate_channel() {
    TEST("TvEngine::create_channel (duplicate)");

    media::PluginManager pm;
    pm.initialize("", "");

    media::TvEngine engine;
    media::TvEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/tv";
    engine.initialize(config, &pm);

    media::TvChannelConfig ch;
    ch.id = "dup_tv_ch";
    ch.tenant_id = "tenant_a";
    ch.name = "Dup";

    auto r1 = engine.create_channel(ch);
    ASSERT_TRUE(r1.is_ok());

    auto r2 = engine.create_channel(ch);
    ASSERT_TRUE(r2.is_error());
    ASSERT_EQ(static_cast<int>(r2.error_code()), static_cast<int>(media::ErrorCode::CONFLICT));

    PASS();
    return true;
}

bool test_tv_engine_max_channels() {
    TEST("TvEngine::create_channel (max channels)");

    media::PluginManager pm;
    pm.initialize("", "");

    media::TvEngine engine;
    media::TvEngineConfig config;
    config.max_channels = 2;
    config.hls_output_dir = "/tmp/media_test/hls/tv";
    engine.initialize(config, &pm);

    for (int i = 0; i < 2; ++i) {
        media::TvChannelConfig ch;
        ch.id = "tv_max_" + std::to_string(i);
        ch.tenant_id = "tenant_a";
        ch.name = "Channel " + std::to_string(i);
        auto r = engine.create_channel(ch);
        ASSERT_TRUE(r.is_ok());
    }

    media::TvChannelConfig ch3;
    ch3.id = "tv_max_2";
    ch3.tenant_id = "tenant_a";
    ch3.name = "Channel 3";
    auto r3 = engine.create_channel(ch3);
    ASSERT_TRUE(r3.is_error());
    ASSERT_EQ(static_cast<int>(r3.error_code()), static_cast<int>(media::ErrorCode::CONFLICT));

    PASS();
    return true;
}

bool test_tv_engine_delete_channel() {
    TEST("TvEngine::delete_channel");

    media::PluginManager pm;
    pm.initialize("", "");

    media::TvEngine engine;
    media::TvEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/tv";
    engine.initialize(config, &pm);

    media::TvChannelConfig ch;
    ch.id = "tv_delete_me";
    ch.tenant_id = "tenant_a";
    ch.name = "Delete Me";
    engine.create_channel(ch);

    auto del_result = engine.delete_channel("tv_delete_me");
    ASSERT_TRUE(del_result.is_ok());

    auto status_result = engine.get_channel_status("tv_delete_me");
    ASSERT_TRUE(status_result.is_error());
    ASSERT_EQ(static_cast<int>(status_result.error_code()), static_cast<int>(media::ErrorCode::NOT_FOUND));

    PASS();
    return true;
}

bool test_tv_engine_schedule_management() {
    TEST("TvEngine: schedule management");

    media::PluginManager pm;
    pm.initialize("", "");

    media::TvEngine engine;
    media::TvEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/tv";
    engine.initialize(config, &pm);

    media::TvChannelConfig ch;
    ch.id = "sched_channel";
    ch.tenant_id = "tenant_a";
    ch.name = "Schedule Test";
    engine.create_channel(ch);

    // Build schedule entries
    auto now = std::chrono::system_clock::now();
    std::vector<media::TvScheduleEntry> entries;

    for (int i = 0; i < 3; ++i) {
        media::TvProgram prog;
        prog.id = "prog_" + std::to_string(i);
        prog.title = "Program " + std::to_string(i);
        prog.description = "Test program";
        prog.category = "movie";
        prog.duration_seconds = 3600;
        prog.content_path = "/data/video/movie" + std::to_string(i) + ".mp4";

        media::TvScheduleEntry entry;
        entry.program = prog;
        entry.start_time = now + std::chrono::hours(i);
        entry.end_time = entry.start_time + std::chrono::hours(1);
        entry.is_live = false;

        entries.push_back(entry);
    }

    auto set_result = engine.set_schedule("sched_channel", entries);
    ASSERT_TRUE(set_result.is_ok());

    // Get schedule for next 4 hours
    auto end_time = now + std::chrono::hours(4);
    auto sched_result = engine.get_schedule("sched_channel", now, end_time);
    ASSERT_TRUE(sched_result.is_ok());
    ASSERT_EQ(sched_result.value().size(), static_cast<size_t>(3));

    PASS();
    return true;
}

bool test_tv_engine_add_remove_program() {
    TEST("TvEngine: add/remove program");

    media::PluginManager pm;
    pm.initialize("", "");

    media::TvEngine engine;
    media::TvEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/tv";
    engine.initialize(config, &pm);

    media::TvChannelConfig ch;
    ch.id = "prog_channel";
    ch.tenant_id = "tenant_a";
    ch.name = "Program Test";
    engine.create_channel(ch);

    auto now = std::chrono::system_clock::now();

    media::TvProgram prog;
    prog.id = "removable_prog";
    prog.title = "Removable Program";
    prog.duration_seconds = 1800;
    prog.content_path = "/data/video/test.mp4";

    media::TvScheduleEntry entry;
    entry.program = prog;
    entry.start_time = now + std::chrono::hours(1);
    entry.end_time = entry.start_time + std::chrono::minutes(30);

    auto add_result = engine.add_program("prog_channel", entry);
    ASSERT_TRUE(add_result.is_ok());

    // Verify it's in schedule
    auto sched = engine.get_schedule(
        "prog_channel",
        now,
        now + std::chrono::hours(3)
    );
    ASSERT_TRUE(sched.is_ok());
    ASSERT_TRUE(sched.value().size() >= 1);

    // Remove it
    auto rem_result = engine.remove_program("prog_channel", "removable_prog");
    ASSERT_TRUE(rem_result.is_ok());

    // Should be gone
    auto sched2 = engine.get_schedule(
        "prog_channel",
        now,
        now + std::chrono::hours(3)
    );
    ASSERT_TRUE(sched2.is_ok());
    ASSERT_EQ(sched2.value().size(), static_cast<size_t>(0));

    PASS();
    return true;
}

bool test_tv_engine_epg() {
    TEST("TvEngine::generate_epg");

    media::PluginManager pm;
    pm.initialize("", "");

    media::TvEngine engine;
    media::TvEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/tv";
    engine.initialize(config, &pm);

    // Create two channels with programs
    auto now = std::chrono::system_clock::now();

    for (int c = 0; c < 2; ++c) {
        media::TvChannelConfig ch;
        ch.id = "epg_ch_" + std::to_string(c);
        ch.tenant_id = "tenant_a";
        ch.name = "EPG Channel " + std::to_string(c);
        engine.create_channel(ch);

        for (int p = 0; p < 3; ++p) {
            media::TvProgram prog;
            prog.id = "epg_prog_" + std::to_string(c) + "_" + std::to_string(p);
            prog.title = "Program " + std::to_string(p);
            prog.duration_seconds = 3600;

            media::TvScheduleEntry entry;
            entry.program = prog;
            entry.start_time = now + std::chrono::hours(p);
            entry.end_time = entry.start_time + std::chrono::hours(1);

            engine.add_program("epg_ch_" + std::to_string(c), entry);
        }
    }

    auto epg = engine.generate_epg(24);
    ASSERT_TRUE(epg.size() >= 6);  // 2 channels x 3 programs

    // XMLTV export
    std::string xmltv = engine.export_xmltv(24);
    ASSERT_TRUE(xmltv.find("<?xml") != std::string::npos);
    ASSERT_TRUE(xmltv.find("<tv") != std::string::npos);
    ASSERT_TRUE(xmltv.find("</tv>") != std::string::npos);

    PASS();
    return true;
}

bool test_tv_engine_viewer_count() {
    TEST("TvEngine::update_viewer_count");

    media::PluginManager pm;
    pm.initialize("", "");

    media::TvEngine engine;
    media::TvEngineConfig config;
    config.max_channels = 5;
    config.hls_output_dir = "/tmp/media_test/hls/tv";
    engine.initialize(config, &pm);

    media::TvChannelConfig ch;
    ch.id = "viewer_channel";
    ch.tenant_id = "tenant_a";
    ch.name = "Viewer Test";
    engine.create_channel(ch);

    engine.update_viewer_count("viewer_channel", 10);
    engine.update_viewer_count("viewer_channel", 5);
    ASSERT_EQ(engine.get_total_viewers(), 15);

    engine.update_viewer_count("viewer_channel", -3);
    ASSERT_EQ(engine.get_total_viewers(), 12);

    PASS();
    return true;
}

bool test_tv_engine_list_channels_tenant_filter() {
    TEST("TvEngine::list_channels (tenant filter)");

    media::PluginManager pm;
    pm.initialize("", "");

    media::TvEngine engine;
    media::TvEngineConfig config;
    config.max_channels = 10;
    config.hls_output_dir = "/tmp/media_test/hls/tv";
    engine.initialize(config, &pm);

    // Tenant A: 2 channels
    for (int i = 0; i < 2; ++i) {
        media::TvChannelConfig ch;
        ch.id = "tv_ta_" + std::to_string(i);
        ch.tenant_id = "tenant_a";
        ch.name = "TV A " + std::to_string(i);
        engine.create_channel(ch);
    }

    // Tenant B: 3 channels
    for (int i = 0; i < 3; ++i) {
        media::TvChannelConfig ch;
        ch.id = "tv_tb_" + std::to_string(i);
        ch.tenant_id = "tenant_b";
        ch.name = "TV B " + std::to_string(i);
        engine.create_channel(ch);
    }

    auto ta = engine.list_channels("tenant_a");
    ASSERT_EQ(ta.size(), static_cast<size_t>(2));

    auto tb = engine.list_channels("tenant_b");
    ASSERT_EQ(tb.size(), static_cast<size_t>(3));

    auto all = engine.list_channels();
    ASSERT_TRUE(all.size() >= 5);

    PASS();
    return true;
}

bool test_tv_channel_not_found() {
    TEST("TvEngine::get_channel_status (not found)");

    media::PluginManager pm;
    pm.initialize("", "");

    media::TvEngine engine;
    media::TvEngineConfig config;
    config.hls_output_dir = "/tmp/media_test/hls/tv";
    engine.initialize(config, &pm);

    auto result = engine.get_channel_status("nonexistent_tv_channel");
    ASSERT_TRUE(result.is_error());
    ASSERT_EQ(static_cast<int>(result.error_code()), static_cast<int>(media::ErrorCode::NOT_FOUND));

    PASS();
    return true;
}

// ============================================================================
// Main
// ============================================================================

int main() {
    std::cout << "=== TV Engine Unit Tests ===" << std::endl;
    std::cout << std::endl;

    bool all_passed = true;
    all_passed &= test_tv_engine_init();
    all_passed &= test_tv_engine_create_channel();
    all_passed &= test_tv_engine_duplicate_channel();
    all_passed &= test_tv_engine_max_channels();
    all_passed &= test_tv_engine_delete_channel();
    all_passed &= test_tv_engine_schedule_management();
    all_passed &= test_tv_engine_add_remove_program();
    all_passed &= test_tv_engine_epg();
    all_passed &= test_tv_engine_viewer_count();
    all_passed &= test_tv_engine_list_channels_tenant_filter();
    all_passed &= test_tv_channel_not_found();

    std::cout << std::endl;
    std::cout << "=== Results: " << tests_passed << "/" << tests_run
              << " tests passed ===" << std::endl;

    return all_passed ? 0 : 1;
}
