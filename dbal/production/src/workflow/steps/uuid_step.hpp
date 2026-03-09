#pragma once
#include "workflow/wf_step.hpp"
#include <random>
#include <sstream>
#include <iomanip>

namespace dbal::workflow::steps {

// RFC 4122 v4 UUID (random)
inline std::string generate_uuid_v4() {
    std::random_device rd;
    std::mt19937_64 gen(rd());
    std::uniform_int_distribution<uint64_t> dist;
    uint64_t hi = dist(gen);
    uint64_t lo = dist(gen);
    // Set version (4) and variant bits
    hi = (hi & 0xFFFFFFFFFFFF0FFFULL) | 0x0000000000004000ULL;
    lo = (lo & 0x3FFFFFFFFFFFFFFFULL) | 0x8000000000000000ULL;
    std::ostringstream ss;
    ss << std::hex << std::setfill('0')
       << std::setw(8) << (hi >> 32)
       << '-' << std::setw(4) << ((hi >> 16) & 0xFFFF)
       << '-' << std::setw(4) << (hi & 0xFFFF)
       << '-' << std::setw(4) << (lo >> 48)
       << '-' << std::setw(12) << (lo & 0xFFFFFFFFFFFFULL);
    return ss.str();
}

/**
 * dbal.uuid — Generate a UUID v4 and store it in context.
 * outputs: { "id": "ctx_variable_name" }
 */
class UuidStep : public IWfStep {
public:
    std::string type() const override { return "dbal.uuid"; }
    void execute(const WfNode& node, WfContext& ctx, dbal::Client&) override {
        std::string uuid = generate_uuid_v4();
        if (node.outputs.is_object()) {
            for (auto& [k, v] : node.outputs.items()) {
                if (v.is_string()) ctx.set(v.get<std::string>(), uuid);
            }
        }
    }
};

} // namespace dbal::workflow::steps
