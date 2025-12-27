/**
 * @file security_limits.hpp
 * @brief Security constants and limits for HTTP server
 * 
 * Defines limits to prevent CVE-style attacks.
 */
#ifndef DBAL_SECURITY_LIMITS_HPP
#define DBAL_SECURITY_LIMITS_HPP

#include <cstddef>

namespace dbal {
namespace daemon {
namespace http {

// Security limits to prevent CVE-style attacks
constexpr size_t MAX_REQUEST_SIZE = 65536;          // 64KB max request (prevent buffer overflow)
constexpr size_t MAX_HEADERS = 100;                  // Max 100 headers (prevent header bomb)
constexpr size_t MAX_HEADER_SIZE = 8192;             // 8KB max per header
constexpr size_t MAX_PATH_LENGTH = 2048;             // Max URL path length
constexpr size_t MAX_BODY_SIZE = 10485760;           // 10MB max body size
constexpr size_t MAX_CONCURRENT_CONNECTIONS = 1000;  // Prevent thread exhaustion

} // namespace http
} // namespace daemon
} // namespace dbal

#endif
