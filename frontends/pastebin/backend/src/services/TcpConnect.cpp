#include "TcpConnect.hpp"

#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

#include <chrono>
#include <stdexcept>
#include <thread>

namespace pastebin {

namespace {

int tryConnect(const std::string& ip, int port) {
    const int fd = ::socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0)
        return -1;

    struct sockaddr_in addr {};
    addr.sin_family = AF_INET;
    addr.sin_port = htons(static_cast<uint16_t>(port));
    if (::inet_pton(AF_INET, ip.c_str(), &addr.sin_addr) != 1) {
        ::close(fd);
        return -1;
    }

    const auto* sa = reinterpret_cast<struct sockaddr*>(&addr);
    if (::connect(fd, sa, sizeof(addr)) != 0) {
        ::close(fd);
        return -1;
    }
    return fd;
}

} // namespace

int connectTcpWithRetry(const std::string& ip, int port,
                         int deadlineSeconds) {
    const auto deadline = std::chrono::steady_clock::now() +
                           std::chrono::seconds(deadlineSeconds);
    while (std::chrono::steady_clock::now() < deadline) {
        const int fd = tryConnect(ip, port);
        if (fd >= 0)
            return fd;
        std::this_thread::sleep_for(std::chrono::milliseconds(300));
    }
    throw std::runtime_error(ip + ":" + std::to_string(port) +
                              " not reachable within " +
                              std::to_string(deadlineSeconds) + "s");
}

} // namespace pastebin
