#include "Http.hpp"
#include <arpa/inet.h>
#include <fcntl.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>
#include <cstring>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>

static std::string mime(const std::string& ext) {
    if (ext == ".m3u8") return "application/vnd.apple.mpegurl";
    if (ext == ".ts")   return "video/MP2T";
    if (ext == ".mp3")  return "audio/mpeg";
    return "application/octet-stream";
}

HttpServer::HttpServer(const std::filesystem::path& docroot, int port)
    : docroot_(docroot), port_(port) {}

HttpServer::~HttpServer() { stop(); }

void HttpServer::start() {
    listenFd_ = socket(AF_INET, SOCK_STREAM, 0);
    if (listenFd_ < 0) throw std::runtime_error("socket");
    int yes = 1;
    setsockopt(listenFd_, SOL_SOCKET, SO_REUSEADDR, &yes, sizeof(yes));
    sockaddr_in addr{};
    addr.sin_family      = AF_INET;
    addr.sin_port        = htons(static_cast<uint16_t>(port_));
    addr.sin_addr.s_addr = INADDR_ANY;
    if (bind(listenFd_, reinterpret_cast<sockaddr*>(&addr), sizeof(addr)) < 0)
        throw std::runtime_error("bind");
    listen(listenFd_, 32);
    running_ = true;
    thread_  = std::thread([this]{ loop(); });
}

void HttpServer::stop() {
    running_ = false;
    if (listenFd_ >= 0) { close(listenFd_); listenFd_ = -1; }
    if (thread_.joinable()) thread_.join();
}

void HttpServer::loop() {
    while (running_) {
        int fd = accept(listenFd_, nullptr, nullptr);
        if (fd < 0) break;
        handle(fd);
        close(fd);
    }
}

void HttpServer::handle(int fd) {
    char buf[2048]{};
    ssize_t n = recv(fd, buf, sizeof(buf) - 1, 0);
    if (n <= 0) return;
    std::istringstream req(buf);
    std::string method, path;
    req >> method >> path;
    if (method != "GET") return;
    if (path.find("..") != std::string::npos) return; // path traversal guard

    auto file = docroot_ / path.substr(1); // strip leading /
    std::ifstream ifs(file, std::ios::binary);
    std::string status = ifs ? "200 OK" : "404 Not Found";
    std::string body;
    if (ifs) body = std::string(std::istreambuf_iterator<char>(ifs), {});
    std::string ext = file.extension().string();
    std::string hdr = "HTTP/1.1 " + status + "\r\n"
        "Content-Type: " + mime(ext) + "\r\n"
        "Content-Length: " + std::to_string(body.size()) + "\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Cache-Control: no-cache\r\n\r\n";
    send(fd, hdr.data(), hdr.size(), 0);
    if (!body.empty()) send(fd, body.data(), body.size(), 0);
}
