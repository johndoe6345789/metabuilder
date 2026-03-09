/**
 * @file s3_list.hpp
 * @brief List blobs in S3-compatible storage
 *
 * Implements List Objects V2:
 * GET /{bucket}?list-type=2&prefix=...&continuation-token=...&max-keys=...
 *
 * Parses the XML response to extract object metadata.
 */

#pragma once

#include <string>
#include <map>
#include <vector>
#include <sstream>
#include <algorithm>
#include "dbal/blob_storage.hpp"
#include "dbal/errors.hpp"
#include "s3_config.hpp"
#include "s3_http.hpp"
#include "s3_get_metadata.hpp"

namespace dbal {
namespace blob {

/**
 * @brief Extract text content between XML tags
 *
 * Simple XML parser for S3 ListObjectsV2 response.
 * S3 returns well-formed XML, so a simple tag parser suffices.
 *
 * @param xml XML document string
 * @param tag Tag name to search for (without angle brackets)
 * @return Text content between opening and closing tags, or empty string
 */
[[nodiscard]] inline std::string xml_extract(const std::string& xml, const std::string& tag) {
    std::string open_tag = "<" + tag + ">";
    std::string close_tag = "</" + tag + ">";

    auto start = xml.find(open_tag);
    if (start == std::string::npos) return "";
    start += open_tag.size();

    auto end = xml.find(close_tag, start);
    if (end == std::string::npos) return "";

    return xml.substr(start, end - start);
}

/**
 * @brief Extract all occurrences of text content between XML tags
 * @param xml XML document string
 * @param tag Tag name
 * @return Vector of all matching text contents
 */
[[nodiscard]] inline std::vector<std::string> xml_extract_all(
    const std::string& xml, const std::string& tag
) {
    std::vector<std::string> results;
    std::string open_tag = "<" + tag + ">";
    std::string close_tag = "</" + tag + ">";

    size_t search_start = 0;
    while (true) {
        auto start = xml.find(open_tag, search_start);
        if (start == std::string::npos) break;
        start += open_tag.size();

        auto end = xml.find(close_tag, start);
        if (end == std::string::npos) break;

        results.push_back(xml.substr(start, end - start));
        search_start = end + close_tag.size();
    }
    return results;
}

/**
 * @brief Extract a complete XML element (including children)
 * @param xml XML document string
 * @param tag Tag name of the element to extract
 * @return Vector of complete element bodies (content between open/close tags)
 */
[[nodiscard]] inline std::vector<std::string> xml_extract_elements(
    const std::string& xml, const std::string& tag
) {
    std::vector<std::string> results;
    std::string open_tag = "<" + tag + ">";
    std::string close_tag = "</" + tag + ">";

    size_t search_start = 0;
    while (true) {
        auto start = xml.find(open_tag, search_start);
        if (start == std::string::npos) break;
        start += open_tag.size();

        auto end = xml.find(close_tag, start);
        if (end == std::string::npos) break;

        results.push_back(xml.substr(start, end - start));
        search_start = end + close_tag.size();
    }
    return results;
}

/**
 * @brief List objects in an S3 bucket
 * @param config S3 configuration
 * @param options List options (prefix, continuation_token, max_keys)
 * @return Result containing BlobListResult or error
 */
[[nodiscard]] inline Result<BlobListResult> s3_list(
    const S3Config& config,
    const ListOptions& options
) {
    // Build query parameters for ListObjectsV2
    std::map<std::string, std::string> query_params;
    query_params["list-type"] = "2";
    query_params["max-keys"] = std::to_string(options.max_keys);

    if (options.prefix.has_value() && !options.prefix.value().empty()) {
        query_params["prefix"] = options.prefix.value();
    }

    if (options.continuation_token.has_value() && !options.continuation_token.value().empty()) {
        query_params["continuation-token"] = options.continuation_token.value();
    }

    // List is a bucket-level operation (no object key)
    auto result = s3_http_request(config, "GET", "", query_params);
    if (result.isError()) {
        return Result<BlobListResult>(result.error());
    }

    const auto& resp = result.value();
    if (!resp.is_success()) {
        return s3_response_to_error(resp, "List objects");
    }

    // Parse XML response
    BlobListResult list_result;

    // Check IsTruncated
    std::string is_truncated = xml_extract(resp.body, "IsTruncated");
    list_result.is_truncated = (is_truncated == "true");

    // Get NextContinuationToken if present
    std::string next_token = xml_extract(resp.body, "NextContinuationToken");
    if (!next_token.empty()) {
        list_result.next_token = next_token;
    }

    // Parse Contents elements
    auto contents_elements = xml_extract_elements(resp.body, "Contents");

    for (const auto& content_xml : contents_elements) {
        BlobMetadata meta;

        meta.key = xml_extract(content_xml, "Key");

        std::string size_str = xml_extract(content_xml, "Size");
        if (!size_str.empty()) {
            try {
                meta.size = std::stoull(size_str);
            } catch (...) {
                meta.size = 0;
            }
        }

        meta.etag = xml_extract(content_xml, "ETag");
        meta.last_modified = parse_http_date(xml_extract(content_xml, "LastModified"));

        // Content-Type and custom metadata are not in list response;
        // set reasonable defaults
        meta.content_type = "application/octet-stream";

        list_result.items.push_back(meta);
    }

    return Result<BlobListResult>(list_result);
}

} // namespace blob
} // namespace dbal
