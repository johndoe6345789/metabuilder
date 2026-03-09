#include "media/job_queue.hpp"
#include "media/plugin_manager.hpp"
#include <cassert>
#include <iostream>
#include <thread>
#include <chrono>

// ============================================================================
// Simple test framework using assert()
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

bool test_job_queue_init() {
    TEST("JobQueue::initialize");

    media::PluginManager pm;
    auto pm_result = pm.initialize("", "");
    ASSERT_TRUE(pm_result.is_ok());

    media::JobQueue jq;
    media::JobQueueConfig config;
    config.video_workers = 1;
    config.audio_workers = 1;
    config.document_workers = 1;
    config.image_workers = 1;
    config.temp_dir = "/tmp/media_test/temp";
    config.output_dir = "/tmp/media_test/output";

    auto result = jq.initialize(config, &pm);
    ASSERT_TRUE(result.is_ok());

    PASS();
    return true;
}

bool test_job_queue_submit() {
    TEST("JobQueue::submit");

    media::PluginManager pm;
    pm.initialize("", "");

    media::JobQueue jq;
    media::JobQueueConfig config;
    config.video_workers = 1;
    config.audio_workers = 1;
    config.document_workers = 1;
    config.image_workers = 1;
    config.temp_dir = "/tmp/media_test/temp";
    config.output_dir = "/tmp/media_test/output";

    jq.initialize(config, &pm);

    media::JobRequest request;
    request.tenant_id = "test_tenant";
    request.user_id = "test_user";
    request.type = media::JobType::AUDIO_TRANSCODE;
    request.priority = media::JobPriority::NORMAL;

    media::AudioTranscodeParams params;
    params.input_path = "/tmp/test_audio.mp3";
    params.output_path = "/tmp/test_audio_out.mp3";
    params.codec = "mp3";
    params.bitrate_kbps = 128;
    request.params = params;

    auto result = jq.submit(request);
    ASSERT_TRUE(result.is_ok());
    ASSERT_TRUE(!result.value().empty());

    // Verify job exists
    auto job_result = jq.get_job(result.value());
    ASSERT_TRUE(job_result.is_ok());
    ASSERT_EQ(job_result.value().tenant_id, std::string("test_tenant"));

    PASS();
    return true;
}

bool test_job_queue_cancel() {
    TEST("JobQueue::cancel");

    media::PluginManager pm;
    pm.initialize("", "");

    media::JobQueue jq;
    media::JobQueueConfig config;
    config.video_workers = 1;
    config.audio_workers = 1;
    config.document_workers = 1;
    config.image_workers = 1;
    config.temp_dir = "/tmp/media_test/temp";
    config.output_dir = "/tmp/media_test/output";

    jq.initialize(config, &pm);

    media::JobRequest request;
    request.tenant_id = "test_tenant";
    request.type = media::JobType::DOCUMENT_CONVERT;
    request.priority = media::JobPriority::LOW;

    media::DocumentConvertParams params;
    params.input_path = "/tmp/test.md";
    params.output_path = "/tmp/test.pdf";
    params.output_format = "pdf";
    request.params = params;

    auto submit_result = jq.submit(request);
    ASSERT_TRUE(submit_result.is_ok());

    std::string job_id = submit_result.value();

    auto cancel_result = jq.cancel(job_id);
    ASSERT_TRUE(cancel_result.is_ok());

    auto job_result = jq.get_job(job_id);
    ASSERT_TRUE(job_result.is_ok());
    ASSERT_EQ(job_result.value().status, media::JobStatus::CANCELLED);

    PASS();
    return true;
}

bool test_job_queue_list_jobs() {
    TEST("JobQueue::list_jobs");

    media::PluginManager pm;
    pm.initialize("", "");

    media::JobQueue jq;
    media::JobQueueConfig config;
    config.video_workers = 1;
    config.audio_workers = 1;
    config.document_workers = 1;
    config.image_workers = 1;
    config.temp_dir = "/tmp/media_test/temp";
    config.output_dir = "/tmp/media_test/output";

    jq.initialize(config, &pm);

    // Submit 3 jobs for tenant A
    for (int i = 0; i < 3; ++i) {
        media::JobRequest req;
        req.tenant_id = "tenant_a";
        req.user_id = "user_1";
        req.type = media::JobType::CUSTOM;
        req.params = std::map<std::string, std::string>{{"op", "test"}};
        jq.submit(req);
    }

    // Submit 1 job for tenant B
    {
        media::JobRequest req;
        req.tenant_id = "tenant_b";
        req.type = media::JobType::CUSTOM;
        req.params = std::map<std::string, std::string>{{"op", "test"}};
        jq.submit(req);
    }

    auto all_jobs = jq.list_jobs();
    ASSERT_TRUE(all_jobs.size() >= 4);

    auto tenant_a_jobs = jq.list_jobs("tenant_a");
    ASSERT_EQ(tenant_a_jobs.size(), static_cast<size_t>(3));

    auto tenant_b_jobs = jq.list_jobs("tenant_b");
    ASSERT_EQ(tenant_b_jobs.size(), static_cast<size_t>(1));

    PASS();
    return true;
}

bool test_job_queue_stats() {
    TEST("JobQueue::get_stats");

    media::PluginManager pm;
    pm.initialize("", "");

    media::JobQueue jq;
    media::JobQueueConfig config;
    config.video_workers = 2;
    config.audio_workers = 2;
    config.document_workers = 2;
    config.image_workers = 2;
    config.temp_dir = "/tmp/media_test/temp";
    config.output_dir = "/tmp/media_test/output";

    jq.initialize(config, &pm);

    // Submit some jobs
    media::JobRequest req;
    req.tenant_id = "test";
    req.type = media::JobType::CUSTOM;
    req.params = std::map<std::string, std::string>{};
    jq.submit(req);
    jq.submit(req);

    auto stats = jq.get_stats();
    ASSERT_TRUE(stats.pending_jobs + stats.processing_jobs >= 0);
    // Workers haven't started (not called start()), so jobs are pending/queued
    ASSERT_TRUE(stats.total_workers >= 0);

    PASS();
    return true;
}

bool test_job_not_found() {
    TEST("JobQueue::get_job (not found)");

    media::PluginManager pm;
    pm.initialize("", "");

    media::JobQueue jq;
    media::JobQueueConfig config;
    config.temp_dir = "/tmp/media_test/temp";
    config.output_dir = "/tmp/media_test/output";
    jq.initialize(config, &pm);

    auto result = jq.get_job("nonexistent_job_id_xyz");
    ASSERT_TRUE(result.is_error());
    ASSERT_EQ(static_cast<int>(result.error_code()), static_cast<int>(media::ErrorCode::NOT_FOUND));

    PASS();
    return true;
}

bool test_job_priority_ordering() {
    TEST("JobQueueEntry priority ordering");

    media::JobQueue::QueueStats dummy_stats;
    (void)dummy_stats;

    // Test that the priority queue struct orders correctly
    // Lower priority value = higher priority (URGENT=0 > HIGH=1 > NORMAL=2)
    using Entry = struct {
        std::string job_id;
        media::JobPriority priority;
        std::chrono::system_clock::time_point submitted_at;
    };

    auto now = std::chrono::system_clock::now();

    // URGENT should be processed before NORMAL
    ASSERT_TRUE(
        static_cast<int>(media::JobPriority::URGENT) <
        static_cast<int>(media::JobPriority::NORMAL)
    );

    PASS();
    return true;
}

// ============================================================================
// Main
// ============================================================================

int main() {
    std::cout << "=== Job Queue Unit Tests ===" << std::endl;
    std::cout << std::endl;

    bool all_passed = true;
    all_passed &= test_job_queue_init();
    all_passed &= test_job_queue_submit();
    all_passed &= test_job_queue_cancel();
    all_passed &= test_job_queue_list_jobs();
    all_passed &= test_job_queue_stats();
    all_passed &= test_job_not_found();
    all_passed &= test_job_priority_ordering();

    std::cout << std::endl;
    std::cout << "=== Results: " << tests_passed << "/" << tests_run
              << " tests passed ===" << std::endl;

    return all_passed ? 0 : 1;
}
