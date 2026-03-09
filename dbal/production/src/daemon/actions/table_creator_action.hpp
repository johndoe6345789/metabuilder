#ifndef DBAL_TABLE_CREATOR_ACTION_HPP
#define DBAL_TABLE_CREATOR_ACTION_HPP

#include <json/json.h>
#include <string>
#include <functional>

namespace dbal {
namespace daemon {
namespace actions {

using ResponseSender = std::function<void(const ::Json::Value&)>;
using ErrorSender = std::function<void(const std::string&, int)>;

/**
 * @brief Handles Prisma schema generation from entity definitions
 *
 * Responsibilities:
 * - Convert YAML entity types to Prisma types
 * - Generate Prisma model definitions
 * - Handle field attributes (primary, unique, nullable)
 * - Manage table name prefixing and mapping
 */
class TableCreatorAction {
public:
    /**
     * @brief Handle schema generation request
     * Generates Prisma schema fragment from approved migrations
     * @param registry_path Path to registry JSON file
     * @param output_path Path to output Prisma schema file
     * @param send_success Success callback
     * @param send_error Error callback
     */
    static void handle_generate(const std::string& registry_path,
                                const std::string& output_path,
                                ResponseSender send_success,
                                ErrorSender send_error);

    /**
     * @brief Map YAML type to Prisma type
     * @param yaml_type YAML field type string
     * @return Corresponding Prisma type string
     */
    static std::string yaml_type_to_prisma(const std::string& yaml_type);

    /**
     * @brief Generate Prisma model for an entity
     * @param entity Entity JSON definition
     * @param packageId Package ID for prefixing
     * @return Prisma model definition string
     */
    static std::string entity_to_prisma(const ::Json::Value& entity, const std::string& packageId);

    /**
     * @brief Convert package name to PascalCase
     * @param snake_case Package name in snake_case
     * @return Package name in PascalCase
     */
    static std::string to_pascal_case(const std::string& snake_case);

    /**
     * @brief Get prefixed entity name for Prisma model
     * @param packageId Package ID
     * @param entity_name Entity name
     * @return Prefixed entity name (e.g., "Pkg_ForumForge_Post")
     */
    static std::string get_prefixed_name(const std::string& packageId, const std::string& entity_name);

    /**
     * @brief Get database table name for entity
     * @param packageId Package ID
     * @param entity_name Entity name
     * @return Table name (e.g., "forum_forge_post")
     */
    static std::string get_table_name(const std::string& packageId, const std::string& entity_name);

private:
    TableCreatorAction() = delete;
};

} // namespace actions
} // namespace daemon
} // namespace dbal

#endif // DBAL_TABLE_CREATOR_ACTION_HPP
