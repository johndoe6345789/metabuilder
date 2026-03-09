#ifndef DBAL_SCHEMA_LOADER_ACTION_HPP
#define DBAL_SCHEMA_LOADER_ACTION_HPP

#include <json/json.h>
#include <string>
#include <functional>

namespace dbal {
namespace daemon {
namespace actions {

using ResponseSender = std::function<void(const ::Json::Value&)>;
using ErrorSender = std::function<void(const std::string&, int)>;

/**
 * @brief Handles loading and caching of entity schemas from JSON registry
 *
 * Responsibilities:
 * - Load schema registry from file system
 * - Save schema registry to file system
 * - Maintain registry structure (version, packages, migration queue)
 */
class SchemaLoaderAction {
public:
    /**
     * @brief Load schema registry from JSON file
     * @param path Path to registry JSON file
     * @return Registry JSON value (creates default structure if not exists)
     */
    static ::Json::Value load_registry(const std::string& path);

    /**
     * @brief Save schema registry to JSON file
     * @param registry Registry data to save
     * @param path Path to output JSON file
     * @return true if save succeeded, false otherwise
     */
    static bool save_registry(const ::Json::Value& registry, const std::string& path);

    /**
     * @brief Get pending migrations from registry
     * @param registry Full registry data
     * @return Array of migrations with status="pending"
     */
    static ::Json::Value get_pending_migrations(const ::Json::Value& registry);

    /**
     * @brief Get approved migrations from registry
     * @param registry Full registry data
     * @return Array of migrations with status="approved"
     */
    static ::Json::Value get_approved_migrations(const ::Json::Value& registry);

private:
    SchemaLoaderAction() = delete;
};

} // namespace actions
} // namespace daemon
} // namespace dbal

#endif // DBAL_SCHEMA_LOADER_ACTION_HPP
