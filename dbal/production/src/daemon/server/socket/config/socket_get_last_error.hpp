/**
 * @file socket_get_last_error.hpp
 * @brief Cross-platform socket error string
 */

#pragma once

#include <string>
#include <cstring>
#include "../socket_types.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Get last socket error as string
 * @return Error message string
 */
inline std::string socket_get_last_error() {
#ifdef _WIN32
    int error = WSAGetLastError();
    char* message = nullptr;
    FormatMessageA(
        FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS,
        nullptr, error, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
        (LPSTR)&message, 0, nullptr);
    std::string result = message ? message : "Unknown error";
    if (message) LocalFree(message);
    return result;
#else
    return strerror(errno);
#endif
}

} // namespace daemon
} // namespace dbal
