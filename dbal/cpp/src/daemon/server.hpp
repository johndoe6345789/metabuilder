/**
 * @file server.hpp
 * @brief Drogon-backed HTTP server wrapper for the DBAL daemon.
 */

#pragma once

#include <atomic>
#include <string>
#include <thread>

namespace dbal {
namespace daemon {

class Server {
public:
    Server(const std::string& bind_address, int port);
    ~Server();

    bool start();
    void stop();
    bool isRunning() const;
    std::string address() const;

private:
    void registerRoutes();

    std::string bind_address_;
    int port_;
    std::atomic<bool> running_;
    bool routes_registered_;
    std::thread server_thread_;
};

} // namespace daemon
} // namespace dbal
