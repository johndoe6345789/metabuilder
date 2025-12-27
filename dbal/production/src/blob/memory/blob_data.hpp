/**
 * @file blob_data.hpp
 * @brief Blob data structure
 */

#pragma once

#include <string>
#include <vector>
#include <map>
#include <chrono>

namespace dbal {
namespace blob {

/**
 * @struct BlobData
 * @brief Internal blob storage structure
 */
struct BlobData {
    std::vector<char> data;
    std::string content_type;
    std::string etag;
    std::chrono::system_clock::time_point last_modified;
    std::map<std::string, std::string> metadata;
};

} // namespace blob
} // namespace dbal
