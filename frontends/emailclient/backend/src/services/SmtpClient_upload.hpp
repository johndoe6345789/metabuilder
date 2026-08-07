#pragma once

#include <cstddef>
#include <string>

namespace email_backend {

struct UploadState {
    std::string data;
    size_t offset = 0;
};

// libcurl read callback that streams UploadState::data out in chunks.
size_t readFromString(char* buffer, size_t size, size_t nitems, void* userdata);

// A random per-message MIME boundary string.
std::string randomBoundary();

} // namespace email_backend
