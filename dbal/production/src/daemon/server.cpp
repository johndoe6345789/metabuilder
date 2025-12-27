/**
 * @file server.cpp
 * @brief Drogon-backed HTTP server implementation.
 */

#include "server.hpp"

#include <drogon/drogon.h>
#include <exception>
#include <iostream>
#include <thread>

namespace dbal {
namespace daemon {

Server::Server(const std::string& bind_address, int port, const dbal::ClientConfig& client_config)
    : bind_address_(bind_address),
      port_(port),
      running_(false),
      routes_registered_(false),
      client_config_(client_config),
      dbal_client_(nullptr) {}

Server::~Server() {
    stop();
}

bool Server::start() {
    if (running_.load()) {
        return true;
    }

    registerRoutes();
    drogon::app().addListener(bind_address_, static_cast<uint16_t>(port_));

    running_.store(true);
    server_thread_ = std::thread(&Server::runServer, this);
    return true;
}

void Server::stop() {
    if (!running_.load()) {
        return;
    }

    drogon::app().quit();
    if (server_thread_.joinable()) {
        server_thread_.join();
    }
    running_.store(false);
}

bool Server::isRunning() const {
    return running_.load();
}

std::string Server::address() const {
    return bind_address_ + ":" + std::to_string(port_);
}

bool Server::ensureClient() {
    if (dbal_client_) {
        return true;
    }

    try {
        dbal_client_ = std::make_unique<dbal::Client>(client_config_);
        return true;
    } catch (const std::exception& ex) {
        std::cerr << "Failed to initialize DBAL client: " << ex.what() << std::endl;
        return false;
    }
}

void Server::runServer() {
    drogon::app().run();
    running_.store(false);
}

} // namespace daemon
} // namespace dbal
