/**
 * @file server.hpp
 * @brief Drogon-backed HTTP server wrapper for the DBAL daemon.
 */

#pragma once

#include <atomic>
#include <memory>
#include <string>
#include <thread>
#include "dbal/core/client.hpp"

namespace dbal {
namespace daemon {

class Server {
public:
    Server(const std::string& bind_address, int port, const dbal::ClientConfig& client_config);
    ~Server();

    bool start();
    void stop();
    bool isRunning() const;
    std::string address() const;

private:
    void registerRoutes();
    void runServer();
    bool ensureClient();

    std::string bind_address_;
    int port_;
    std::atomic<bool> running_;
    bool routes_registered_;
    std::thread server_thread_;
    dbal::ClientConfig client_config_;
    std::unique_ptr<dbal::Client> dbal_client_;
};

} // namespace daemon
} // namespace dbal
