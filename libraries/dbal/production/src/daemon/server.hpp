/**
 * @file server.hpp
 * @brief Drogon-backed HTTP server wrapper for the DBAL daemon.
 */

#pragma once

#include <atomic>
#include <memory>
#include <mutex>
#include <optional>
#include <string>
#include "dbal/core/client.hpp"
#include "auth/auth_config.hpp"
#include "security/jwt/jwt_validator.hpp"
#include "workflow/wf_engine.hpp"

// Clang thread safety annotations
#if defined(__clang__)
#define GUARDED_BY(x) __attribute__((guarded_by(x)))
#define REQUIRES(x) __attribute__((requires_capability(x)))
#else
#define GUARDED_BY(x)
#define REQUIRES(x)
#endif

namespace dbal {
namespace daemon {

class Server {
public:
    Server(const std::string& bind_address, int port, const dbal::ClientConfig& client_config);
    ~Server();

    bool start();
    void run();  // MUST be called from main thread - runs Drogon event loop (blocking)
    void stop();
    bool isRunning() const;
    std::string address() const;

    // Public for unit testing thread safety
    bool ensureClient();

    // Admin API: runtime database switching
    bool switchAdapter(const std::string& adapter, const std::string& database_url);
    bool testConnection(const std::string& adapter, const std::string& database_url, std::string& error);
    std::pair<std::string, std::string> getActiveConfig() const;

private:
    void registerRoutes();
    void runServer();

    std::string bind_address_;
    int port_;
    std::atomic<bool> running_;
    std::atomic<bool> routes_registered_{false};

    // Config fields stored separately to avoid cross-thread string corruption
    // Protected by config_mutex_ for thread-safe reads/writes
    mutable std::mutex config_mutex_;
    std::string config_adapter_ GUARDED_BY(config_mutex_);
    std::string config_database_url_ GUARDED_BY(config_mutex_);
    std::string config_mode_ GUARDED_BY(config_mutex_);
    std::string config_endpoint_ GUARDED_BY(config_mutex_);
    std::atomic<bool> config_sandbox_enabled_{false};

    // Thread-safe client initialization (recursive to allow same-thread re-entry)
    std::recursive_mutex client_mutex_;
    std::unique_ptr<dbal::Client> dbal_client_ GUARDED_BY(client_mutex_);

    // JWT + auth config (set once in registerRoutes, read-only thereafter)
    std::string jwt_secret_;
    dbal::auth::AuthConfig auth_config_;

    // Optional workflow engine — initialized from DBAL_EVENT_CONFIG
    std::optional<dbal::workflow::WfEngine> wf_engine_;
};

} // namespace daemon
} // namespace dbal
