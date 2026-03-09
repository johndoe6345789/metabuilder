#ifndef DBAL_SUPABASE_RLS_MANAGER_HPP
#define DBAL_SUPABASE_RLS_MANAGER_HPP

#include <string>
#include <nlohmann/json.hpp>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
namespace supabase {

using Json = nlohmann::json;

/**
 * RLS Manager - Handles Supabase Row-Level Security policies
 *
 * Supabase uses PostgreSQL Row-Level Security (RLS) for multi-tenant data isolation:
 * - RLS policies filter rows based on JWT claims (user ID, tenant ID, roles)
 * - Policies are defined in SQL: CREATE POLICY name ON table FOR operation
 * - JWT claims are passed via Authorization header and accessible via auth.uid()
 *
 * This manager helps:
 * - Set tenant context via custom headers (X-Tenant-Id)
 * - Build JWT tokens with custom claims (future)
 * - Query RLS policy status (future)
 *
 * Example RLS Policy:
 * ```sql
 * CREATE POLICY "tenant_isolation" ON users
 * FOR ALL
 * USING (tenant_id = current_setting('request.jwt.claims')::json->>'tenant_id')
 * ```
 *
 * Current implementation:
 * - Uses X-Tenant-Id custom header for tenant context
 * - Assumes RLS policies are already defined in database
 * - Future: Can create/manage RLS policies via SQL API
 */
class SupabaseRlsManager {
public:
    SupabaseRlsManager();

    /**
     * Build custom headers for tenant context
     * Adds X-Tenant-Id header for RLS filtering
     *
     * @param tenant_id Tenant identifier
     * @return JSON object with custom headers
     */
    Json buildTenantHeaders(const std::string& tenant_id) const;

    /**
     * Check if RLS is enabled for a table (future)
     * Queries pg_catalog to check RLS status
     *
     * @param table_name Table to check
     * @return Result with RLS status or error
     */
    // Result<bool> isRlsEnabled(const std::string& table_name) const;

    /**
     * Create RLS policy for tenant isolation (future)
     * Executes CREATE POLICY SQL statement
     *
     * @param table_name Table to apply policy
     * @param tenant_field Field name for tenant ID (default: "tenant_id")
     * @return Result with success status or error
     */
    // Result<bool> createTenantPolicy(const std::string& table_name,
    //                                  const std::string& tenant_field = "tenant_id");

private:
    // Future: Store RLS policy cache
    // std::map<std::string, bool> rls_cache_;
};

} // namespace supabase
} // namespace adapters
} // namespace dbal

#endif // DBAL_SUPABASE_RLS_MANAGER_HPP
