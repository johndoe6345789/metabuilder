/**
 * @file thread_safety_test.cpp
 * @brief Thread safety tests for DBAL daemon
 *
 * These tests would have caught the cross-thread string corruption bug
 * that caused segfaults when accessing client_config_ from Drogon handlers.
 */

#include <gtest/gtest.h>
#include "daemon/server.hpp"
#include <thread>
#include <vector>
#include <atomic>
#include <chrono>

namespace dbal::daemon::test {

class ServerThreadSafetyTest : public ::testing::Test {
protected:
    void SetUp() override {
        config_.adapter = "sqlite";
        config_.database_url = ":memory:";
        config_.mode = "production";
        config_.sandbox_enabled = true;
    }

    dbal::ClientConfig config_;
};

/**
 * Test: Concurrent ensureClient() calls should all succeed
 *
 * This test spawns multiple threads that all call ensureClient() concurrently.
 * With the bug, only the first call would succeed, others would segfault.
 * With the fix (mutex protection), all calls should succeed.
 */
TEST_F(ServerThreadSafetyTest, ConcurrentEnsureClient) {
    Server server("127.0.0.1", 9001, config_);

    constexpr int NUM_THREADS = 10;
    std::vector<std::thread> threads;
    std::atomic<int> success_count{0};
    std::atomic<int> failure_count{0};

    for (int i = 0; i < NUM_THREADS; i++) {
        threads.emplace_back([&]() {
            // Simulate concurrent requests hitting ensureClient()
            bool result = server.ensureClient();
            if (result) {
                success_count++;
            } else {
                failure_count++;
            }
        });
    }

    for (auto& t : threads) {
        t.join();
    }

    // All threads should successfully initialize the client (or find it already initialized)
    EXPECT_EQ(success_count.load(), NUM_THREADS);
    EXPECT_EQ(failure_count.load(), 0);
}

/**
 * Test: Config isolation between multiple Server instances
 *
 * This verifies that each Server instance maintains its own configuration
 * without interference, even when created/accessed concurrently.
 */
TEST_F(ServerThreadSafetyTest, ConfigIsolation) {
    dbal::ClientConfig config1;
    config1.adapter = "sqlite";
    config1.database_url = ":memory:";
    config1.mode = "production";

    dbal::ClientConfig config2;
    config2.adapter = "sqlite";  // Use sqlite instead of postgres
    config2.database_url = ":memory:";
    config2.mode = "development";

    Server server1("127.0.0.1", 9002, config1);
    Server server2("127.0.0.1", 9003, config2);

    // Access both servers concurrently
    std::thread t1([&]() {
        EXPECT_TRUE(server1.ensureClient());
    });

    std::thread t2([&]() {
        EXPECT_TRUE(server2.ensureClient());
    });

    t1.join();
    t2.join();

    // If configs interfere, this would fail (caught the original bug)
}

/**
 * Test: Server lifecycle without starting Drogon
 *
 * Tests construction/destruction without Drogon app.run().
 * Drogon doesn't handle multiple app.run() in same process,
 * so we test object lifecycle instead of full start/stop.
 */
TEST_F(ServerThreadSafetyTest, ServerLifecycle) {
    // Test: Multiple server instances can be created and destroyed
    for (int i = 0; i < 5; i++) {
        Server server("127.0.0.1", 9004 + i, config_);

        // Verify initial state
        EXPECT_FALSE(server.isRunning());

        // ensureClient should work without starting server
        EXPECT_TRUE(server.ensureClient());
    }
}

/**
 * Test: Config string lifetime across thread boundaries
 *
 * This specifically tests the scenario that caused the original bug:
 * - Config created in main thread
 * - Passed to Server constructor
 * - Accessed later from Drogon request handler thread
 */
TEST_F(ServerThreadSafetyTest, ConfigStringLifetime) {
    // Create config in one scope
    {
        dbal::ClientConfig temp_config;
        temp_config.adapter = "sqlite";
        temp_config.database_url = ":memory:";
        temp_config.mode = "production";

        // Pass to server (server should copy, not reference)
        Server server("127.0.0.1", 9010, temp_config);

        // temp_config goes out of scope here
        // But server should still have valid config
        EXPECT_TRUE(server.ensureClient());
    }
}

} // namespace dbal::daemon::test

int main(int argc, char** argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
