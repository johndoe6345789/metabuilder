#ifndef DBAL_SUPABASE_ADAPTER_HPP
#define DBAL_SUPABASE_ADAPTER_HPP

#include <memory>
#include <map>
#include "dbal/adapters/adapter.hpp"
#include "dbal/core/compensating_transaction.hpp"
#include "dbal/core/entity_loader.hpp"
#include "../sql/postgres_adapter.hpp"
#include "isupabase_http_client.hpp"
#include "supabase_http_client.hpp"
#include "supabase_auth_manager.hpp"
#include "supabase_query_builder.hpp"
#include "supabase_rls_manager.hpp"

namespace dbal {
namespace adapters {
namespace supabase {

/**
 * @brief Configuration for Supabase adapter
 *
 * Supports both REST API mode (default) and PostgreSQL mode (direct database access).
 */
struct SupabaseConfig {
    std::string url;           ///< Supabase project URL (https://your-project.supabase.co)
    std::string apiKey;        ///< Supabase API key (anon key or service_role key)
    bool useRestApi = true;    ///< If true, use REST API; if false, use PostgreSQL adapter
    int timeout = 30000;       ///< Request timeout in milliseconds (default: 30 seconds)

    // PostgreSQL mode config (only used when useRestApi = false)
    std::string postgresPassword;  ///< PostgreSQL password for direct connection
};

/**
 * @brief Supabase adapter with REST API and PostgreSQL modes
 *
 * **REST API Mode** (useRestApi = true):
 * - Uses Supabase REST API via cpr HTTP client
 * - Delegates to helper classes for clean separation of concerns
 * - SupabaseHttpClient: HTTP communication
 * - SupabaseAuthManager: JWT token management
 * - SupabaseQueryBuilder: PostgREST query construction
 * - SupabaseRlsManager: Row-Level Security handling
 *
 * **PostgreSQL Mode** (useRestApi = false):
 * - Delegates to existing PostgresAdapter
 * - Extracts connection string from Supabase URL
 * - Pattern: postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
 *
 * Usage:
 * @code
 * // REST API mode (default)
 * SupabaseConfig config;
 * config.url = "https://your-project.supabase.co";
 * config.apiKey = "your-anon-key";
 * SupabaseAdapter adapter(config);
 * auto result = adapter.create("users", userData);
 *
 * // PostgreSQL mode
 * config.useRestApi = false;
 * config.postgresPassword = "your-password";
 * SupabaseAdapter pgAdapter(config);
 * @endcode
 */
class SupabaseAdapter : public Adapter {
public:
    /**
     * @brief Construct Supabase adapter (production use).
     * @param config Configuration with URL, API key, and mode selection
     * @throws std::runtime_error if configuration is invalid
     */
    explicit SupabaseAdapter(const SupabaseConfig& config);

    /**
     * @brief Testing constructor — injects a mock HTTP client.
     *
     * Skips network/DB initialisation so unit tests can run without
     * a real Supabase project.  Only the REST-API code-path is exercised.
     *
     * @param mock_client  Ownership of a mock ISupabaseHttpClient
     * @param schemas      Optional entity schemas (empty = schema-free tests)
     */
    SupabaseAdapter(std::unique_ptr<ISupabaseHttpClient> mock_client,
                    std::map<std::string, core::EntitySchema> schemas = {});

    ~SupabaseAdapter() override = default;

    // ===== Transaction Support (Compensating) =====

    bool supportsNativeTransactions() const override { return false; }
    Result<bool> beginTransaction() override;
    Result<bool> commitTransaction() override;
    Result<bool> rollbackTransaction() override;

    // ===== Generic CRUD Operations =====

    Result<Json> create(const std::string& entityName, const Json& data) override;
    Result<Json> read(const std::string& entityName, const std::string& id) override;
    Result<Json> update(const std::string& entityName, const std::string& id, const Json& data) override;
    Result<bool> remove(const std::string& entityName, const std::string& id) override;
    Result<ListResult<Json>> list(const std::string& entityName, const ListOptions& options) override;

    // ===== Bulk Operations =====

    Result<int> createMany(const std::string& entityName, const std::vector<Json>& records) override;
    Result<int> updateMany(const std::string& entityName, const Json& filter, const Json& data) override;
    Result<int> deleteMany(const std::string& entityName, const Json& filter) override;

    // ===== Query Operations =====

    Result<Json> findFirst(const std::string& entityName, const Json& filter) override;
    Result<Json> findByField(const std::string& entityName, const std::string& field, const Json& value) override;
    Result<Json> upsert(const std::string& entityName, const std::string& uniqueField, const Json& uniqueValue, const Json& createData, const Json& updateData) override;

    // ===== Metadata =====

    Result<std::vector<std::string>> getAvailableEntities() override;
    Result<EntitySchema> getEntitySchema(const std::string& entityName) override;

    void close() override;

private:
    bool useRestApi_;
    std::map<std::string, core::EntitySchema> schemas_;

    // Helper classes (REST API mode only)
    std::unique_ptr<ISupabaseHttpClient> http_client_;
    std::unique_ptr<SupabaseAuthManager> auth_manager_;
    std::unique_ptr<SupabaseRlsManager> rls_manager_;

    // PostgreSQL mode adapter (only initialized if useRestApi_ == false)
    std::unique_ptr<sql::PostgresAdapter> postgresAdapter_;

    // Compensating transaction for REST API mode
    std::unique_ptr<dbal::core::CompensatingTransaction> compensating_tx_;

    /**
     * @brief Extract project name from Supabase URL
     * @param supabaseUrl Supabase URL (https://your-project.supabase.co)
     * @return Project name (e.g., "your-project")
     */
    static std::string extractProjectName(const std::string& supabaseUrl);

    /**
     * @brief Build PostgreSQL connection string from Supabase config
     * @param config Supabase configuration
     * @return PostgreSQL connection string
     */
    static std::string buildPostgresConnectionString(const SupabaseConfig& config);
};

} // namespace supabase
} // namespace adapters
} // namespace dbal

#endif // DBAL_SUPABASE_ADAPTER_HPP
