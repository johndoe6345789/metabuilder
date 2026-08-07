#include "RandomToken.hpp"

#include <jwt-cpp/base.h>

#include <random>

namespace pastebin {

std::string generateUrlSafeToken(size_t numBytes) {
    static thread_local std::mt19937_64 rng{std::random_device{}()};
    std::uniform_int_distribution<int> byteDist(0, 255);

    std::string raw(numBytes, '\0');
    for (auto& c : raw)
        c = static_cast<char>(byteDist(rng));

    auto encoded = jwt::base::encode<jwt::alphabet::base64url>(raw);
    while (!encoded.empty() && encoded.back() == '=')
        encoded.pop_back();
    return encoded;
}

} // namespace pastebin
