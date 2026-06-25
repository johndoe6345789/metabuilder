#ifndef DBAL_SCHEMA_VALIDATOR_HPP
#define DBAL_SCHEMA_VALIDATOR_HPP

#include <string>
#include <vector>

namespace dbal {
namespace core {

// Forward declarations
struct EntitySchema;
struct EntityField;

namespace loaders {

/**
 * @brief Validation result for schema checks
 */
struct ValidationResult {
    bool valid = true;
    std::vector<std::string> errors;
    std::vector<std::string> warnings;

    /**
     * @brief Add error message
     */
    void addError(const std::string& error) {
        valid = false;
        errors.push_back(error);
    }

    /**
     * @brief Add warning message
     */
    void addWarning(const std::string& warning) {
        warnings.push_back(warning);
    }

    /**
     * @brief Check if validation passed
     */
    bool isValid() const { return valid; }
};

/**
 * @brief Validates entity schemas against SPEC.md rules
 *
 * Responsible for:
 * - Validating required fields (name, fields)
 * - Checking field type validity
 * - Validating field constraints
 * - Checking index definitions
 * - Validating ACL configurations
 */
class SchemaValidator {
public:
    /**
     * @brief Validate complete entity schema
     * @param schema Schema to validate
     * @return Validation result with errors and warnings
     */
    ValidationResult validate(const EntitySchema& schema);

private:
    /**
     * @brief Validate basic schema metadata
     */
    void validateMetadata(const EntitySchema& schema, ValidationResult& result);

    /**
     * @brief Validate field definitions
     */
    void validateFields(const EntitySchema& schema, ValidationResult& result);

    /**
     * @brief Validate single field definition
     */
    void validateField(const EntityField& field, ValidationResult& result);

    /**
     * @brief Validate index definitions
     */
    void validateIndexes(const EntitySchema& schema, ValidationResult& result);

    /**
     * @brief Check if field type is valid
     */
    bool isValidFieldType(const std::string& type);

    /**
     * @brief Get list of valid field types
     */
    std::vector<std::string> getValidFieldTypes();
};

}  // namespace loaders
}  // namespace core
}  // namespace dbal

#endif  // DBAL_SCHEMA_VALIDATOR_HPP
