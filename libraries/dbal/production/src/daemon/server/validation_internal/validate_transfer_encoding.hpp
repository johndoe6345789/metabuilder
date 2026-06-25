/**
 * @file validate_transfer_encoding.hpp
 * @brief Validate Transfer-Encoding header
 */

#pragma once

#include "../response/http_response.hpp"

namespace dbal {
namespace daemon {

/**
 * @brief Check for request smuggling (Transfer-Encoding + Content-Length)
 * @param has_transfer_encoding Whether Transfer-Encoding is present
 * @param has_content_length Whether Content-Length is present
 * @param error_response Error response if both present
 * @return true if valid
 */
inline bool check_request_smuggling(
    bool has_transfer_encoding,
    bool has_content_length,
    HttpResponse& error_response
) {
    if (has_transfer_encoding && has_content_length) {
        error_response.status_code = 400;
        error_response.status_text = "Bad Request";
        error_response.body = R"({"error":"Both Transfer-Encoding and Content-Length present"})";
        return false;
    }
    return true;
}

/**
 * @brief Reject Transfer-Encoding (not supported)
 * @param has_transfer_encoding Whether Transfer-Encoding is present
 * @param error_response Error response if present
 * @return true if not present
 */
inline bool check_transfer_encoding_unsupported(
    bool has_transfer_encoding,
    HttpResponse& error_response
) {
    if (has_transfer_encoding) {
        error_response.status_code = 501;
        error_response.status_text = "Not Implemented";
        error_response.body = R"({"error":"Transfer-Encoding not supported"})";
        return false;
    }
    return true;
}

} // namespace daemon
} // namespace dbal
