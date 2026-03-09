/**
 * @file server.cpp
 * @brief Drogon-backed HTTP server implementation.
 */

#include "server.hpp"

#include <chrono>
#include <drogon/drogon.h>
#include <exception>
#include <iostream>
#include <thread>
#include <spdlog/spdlog.h>

namespace dbal {
namespace daemon {

Server::Server(const std::string& bind_address, int port, const dbal::ClientConfig& client_config)
    : bind_address_(bind_address),
      port_(port),
      running_(false),
      config_adapter_(client_config.adapter),
      config_database_url_(client_config.database_url),
      config_mode_(client_config.mode),
      config_endpoint_(client_config.endpoint),
      dbal_client_(nullptr) {
    config_sandbox_enabled_.store(client_config.sandbox_enabled);
    spdlog::debug("Server constructor - config copied:");
    spdlog::debug("  adapter: '{}' (size: {})", config_adapter_, config_adapter_.size());
    spdlog::debug("  database_url: '{}' (size: {})", config_database_url_, config_database_url_.size());
}

Server::~Server() {
    stop();
}

bool Server::start() {
    if (running_.load()) {
        spdlog::debug("Server already running");
        return true;
    }

    spdlog::info("Starting Drogon HTTP server on {}:{}", bind_address_, port_);

    registerRoutes();
    spdlog::debug("Routes registered");

    drogon::app().addListener(bind_address_, static_cast<uint16_t>(port_));
    spdlog::debug("Listener added for {}:{}", bind_address_, port_);

    running_.store(true);
    spdlog::info("Server initialized successfully (call run() to start event loop)");

    return true;
}

void Server::run() {
    // This MUST be called from the main thread (Drogon requirement)
    spdlog::info("Running Drogon event loop (blocks until quit)");
    runServer();
}

void Server::stop() {
    if (!running_.load()) {
        return;
    }

    drogon::app().quit();
    running_.store(false);
}

bool Server::isRunning() const {
    return running_.load();
}

std::string Server::address() const {
    return bind_address_ + ":" + std::to_string(port_);
}

bool Server::ensureClient() {
    spdlog::trace("ensureClient() ENTRY - acquiring lock");
    std::lock_guard<std::recursive_mutex> lock(client_mutex_);
    spdlog::trace("ensureClient() LOCK ACQUIRED");

    if (dbal_client_) {
        spdlog::trace("ensureClient() client already exists, returning true");
        return true;
    }

    spdlog::info("ensureClient() initializing client...");

    try {
        spdlog::debug("Creating ClientConfig...");
        dbal::ClientConfig config;
        {
            std::lock_guard<std::mutex> cfg_lock(config_mutex_);
            config.adapter = config_adapter_;
            config.database_url = config_database_url_;
            config.mode = config_mode_;
            config.endpoint = config_endpoint_;
        }
        config.sandbox_enabled = config_sandbox_enabled_.load();

        spdlog::debug("  adapter: '{}'", config.adapter);
        spdlog::debug("  database_url: '{}'", config.database_url);
        spdlog::debug("  mode: '{}'", config.mode);

        spdlog::debug("Creating Client instance...");
        dbal_client_ = std::make_unique<dbal::Client>(config);
        spdlog::info("Client initialized successfully!");
        return true;
    } catch (const std::exception& ex) {
        spdlog::error("Failed to initialize DBAL client: {}", ex.what());
        return false;
    } catch (...) {
        spdlog::error("Failed to initialize DBAL client: unknown error");
        return false;
    }
}

std::pair<std::string, std::string> Server::getActiveConfig() const {
    std::lock_guard<std::mutex> cfg_lock(config_mutex_);
    return {config_adapter_, config_database_url_};
}

bool Server::switchAdapter(const std::string& adapter, const std::string& database_url) {
    spdlog::info("switchAdapter() switching to adapter='{}' url='{}'",
                 adapter, database_url.substr(0, 30) + "...");

    std::lock_guard<std::recursive_mutex> lock(client_mutex_);

    try {
        dbal::ClientConfig new_config;
        new_config.adapter = adapter;
        new_config.database_url = database_url;
        {
            std::lock_guard<std::mutex> cfg_lock(config_mutex_);
            new_config.mode = config_mode_;
            new_config.endpoint = config_endpoint_;
        }
        new_config.sandbox_enabled = config_sandbox_enabled_.load();

        auto new_client = std::make_unique<dbal::Client>(new_config);

        // Success — swap the client and update stored config
        if (dbal_client_) {
            dbal_client_->close();
        }
        dbal_client_ = std::move(new_client);

        {
            std::lock_guard<std::mutex> cfg_lock(config_mutex_);
            config_adapter_ = adapter;
            config_database_url_ = database_url;
        }

        spdlog::info("switchAdapter() success — now using {}", adapter);
        return true;
    } catch (const std::exception& ex) {
        spdlog::error("switchAdapter() failed: {}", ex.what());
        return false;
    }
}

bool Server::testConnection(const std::string& adapter, const std::string& database_url, std::string& error) {
    spdlog::info("testConnection() testing adapter='{}' url='{}'",
                 adapter, database_url.substr(0, 30) + "...");

    try {
        dbal::ClientConfig test_config;
        test_config.adapter = adapter;
        test_config.database_url = database_url;
        {
            std::lock_guard<std::mutex> cfg_lock(config_mutex_);
            test_config.mode = config_mode_;
            test_config.endpoint = config_endpoint_;
        }
        test_config.sandbox_enabled = config_sandbox_enabled_.load();

        // Create a temporary client — if constructor succeeds, connection works
        auto test_client = std::make_unique<dbal::Client>(test_config);
        test_client->close();

        spdlog::info("testConnection() success");
        return true;
    } catch (const std::exception& ex) {
        error = ex.what();
        spdlog::warn("testConnection() failed: {}", ex.what());
        return false;
    }
}

void Server::runServer() {
    spdlog::debug("runServer() thread started");
    try {
        drogon::app().run();
        spdlog::info("Drogon app.run() completed");
    } catch (const std::exception& ex) {
        spdlog::error("Drogon app.run() failed: {}", ex.what());
    } catch (...) {
        spdlog::error("Drogon app.run() failed with unknown error");
    }
    running_.store(false);
    spdlog::debug("runServer() thread exiting");
}

} // namespace daemon
} // namespace dbal
