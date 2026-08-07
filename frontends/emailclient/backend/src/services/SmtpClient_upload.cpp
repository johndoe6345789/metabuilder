#include "SmtpClient_upload.hpp"

#include <cstring>
#include <random>
#include <sstream>

namespace email_backend {

size_t readFromString(char* buffer, size_t size, size_t nitems,
                       void* userdata) {
    auto* state = static_cast<UploadState*>(userdata);
    const size_t room = size * nitems;
    const size_t remaining = state->data.size() - state->offset;
    const size_t n = remaining < room ? remaining : room;
    if (n > 0) {
        std::memcpy(buffer, state->data.data() + state->offset, n);
        state->offset += n;
    }
    return n;
}

std::string randomBoundary() {
    static thread_local std::mt19937_64 rng{std::random_device{}()};
    std::ostringstream out;
    out << "metabuilder-" << std::hex << rng();
    return out.str();
}

} // namespace email_backend
