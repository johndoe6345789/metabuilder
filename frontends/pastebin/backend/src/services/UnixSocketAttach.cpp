#include "UnixSocketAttach.hpp"
#include "SocketIo.hpp"
#include "UnixSocketConnect.hpp"

#include <unistd.h>

#include <stdexcept>

namespace pastebin {

namespace {

// Reads byte-by-byte until "\r\n\r\n" -- fine here since this only runs
// once per session and HTTP headers are tiny.
std::string readHeaders(int fd) {
    std::string headers;
    char c = 0;
    while (headers.size() < 4 ||
           headers.compare(headers.size() - 4, 4, "\r\n\r\n") != 0) {
        const ssize_t n = ::read(fd, &c, 1);
        if (n <= 0)
            throw std::runtime_error("connection closed during handshake");
        headers += c;
    }
    return headers;
}

void requireOkStatus(const std::string& headers) {
    // Docker's own docs: attach answers 101 when it honors the Upgrade
    // header, or plain 200 if it doesn't -- both mean the hijack
    // succeeded and what follows is the raw duplex stream.
    if (headers.rfind("HTTP/1.1 101", 0) != 0 &&
        headers.rfind("HTTP/1.1 200", 0) != 0 &&
        headers.rfind("HTTP/1.0 200", 0) != 0) {
        throw std::runtime_error("Docker attach failed: " + headers);
    }
}

} // namespace

int connectAndHijack(const std::string& socketPath, const std::string& path) {
    const int fd = connectUnixSocket(socketPath);
    const std::string request = "POST " + path +
                                 " HTTP/1.1\r\n"
                                 "Host: docker\r\n"
                                 "Connection: Upgrade\r\n"
                                 "Upgrade: tcp\r\n"
                                 "Content-Length: 0\r\n\r\n";
    try {
        if (!sendAll(fd, request))
            throw std::runtime_error("send() failed during attach handshake");
        requireOkStatus(readHeaders(fd));
    } catch (...) {
        ::close(fd);
        throw;
    }
    return fd;
}

} // namespace pastebin
