#include "Uuid.hpp"

#include <array>
#include <random>
#include <sstream>

namespace email_backend {

std::string generateUuidV4() {
    static thread_local std::mt19937_64 rng{std::random_device{}()};
    std::uniform_int_distribution<int> nibble(0, 15);

    std::array<int, 32> hex{};
    for (auto& n : hex)
        n = nibble(rng);
    hex[12] = 4;                     // version 4
    hex[16] = (hex[16] & 0x3) | 0x8; // variant 10xx

    static const char* digits = "0123456789abcdef";
    std::ostringstream out;
    for (size_t i = 0; i < hex.size(); ++i) {
        if (i == 8 || i == 12 || i == 16 || i == 20)
            out << '-';
        out << digits[hex[i]];
    }
    return out.str();
}

} // namespace email_backend
