#include "UnixSocketConnect.hpp"

#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>

#include <cstring>
#include <stdexcept>

namespace pastebin {

int connectUnixSocket(const std::string& socketPath) {
    const int fd = ::socket(AF_UNIX, SOCK_STREAM, 0);
    if (fd < 0)
        throw std::runtime_error("socket() failed");

    struct sockaddr_un addr {};
    addr.sun_family = AF_UNIX;
    if (socketPath.size() >= sizeof(addr.sun_path)) {
        ::close(fd);
        throw std::runtime_error("Docker socket path too long");
    }
    std::strncpy(addr.sun_path, socketPath.c_str(),
                 sizeof(addr.sun_path) - 1);

    const auto* sa = reinterpret_cast<struct sockaddr*>(&addr);
    if (::connect(fd, sa, sizeof(addr)) != 0) {
        ::close(fd);
        throw std::runtime_error("connect() to " + socketPath + " failed");
    }
    return fd;
}

} // namespace pastebin
