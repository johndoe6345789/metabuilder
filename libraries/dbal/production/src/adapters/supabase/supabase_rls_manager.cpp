#include "supabase_rls_manager.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace adapters {
namespace supabase {

SupabaseRlsManager::SupabaseRlsManager() {
    spdlog::debug("SupabaseRlsManager initialized");
}

Json SupabaseRlsManager::buildTenantHeaders(const std::string& tenant_id) const {
    Json headers = Json::object();

    if (!tenant_id.empty()) {
        // Custom header for tenant context
        // RLS policies can read this via current_setting('request.headers')::json->>'x-tenant-id'
        headers["X-Tenant-Id"] = tenant_id;
        spdlog::debug("Added tenant header: X-Tenant-Id={}", tenant_id);
    }

    return headers;
}

} // namespace supabase
} // namespace adapters
} // namespace dbal
