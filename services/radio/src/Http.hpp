#pragma once
#include <filesystem>
#include <string>
#include <thread>
#include <atomic>

// Single-threaded HTTP server for serving HLS static files.
class HttpServer {
public:
    HttpServer(const std::filesystem::path& docroot, int port);
    ~HttpServer();
    void start();   // non-blocking: spawns a thread
    void stop();

private:
    void loop();
    void handle(int fd);
    std::filesystem::path docroot_;
    int                    port_;
    int                    listenFd_{-1};
    std::thread            thread_;
    std::atomic<bool>      running_{false};
};
