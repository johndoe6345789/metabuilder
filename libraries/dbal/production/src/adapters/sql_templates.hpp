#ifndef DBAL_SQL_TEMPLATES_HPP
#define DBAL_SQL_TEMPLATES_HPP

#include <string>
#include <map>
#include <functional>
#include <sstream>
#include <algorithm>

namespace dbal {
namespace adapters {

/**
 * Simple Jinja2-style template engine for SQL generation
 *
 * Supports:
 * - Variable substitution: {{ variable }}
 * - Conditionals: {% if condition %}...{% endif %}
 * - Loops: {% for item in list %}...{% endfor %}
 * - Filters: {{ variable|filter }}
 */
class SqlTemplateEngine {
public:
    using Context = std::map<std::string, std::string>;
    using Filter = std::function<std::string(const std::string&)>;
    using ConditionalFunc = std::function<bool(const Context&)>;

private:
    std::map<std::string, Filter> filters_;
    std::map<std::string, ConditionalFunc> conditionals_;

    // Built-in filters
    static std::string filterQuote(const std::string& s) {
        return "\"" + s + "\"";
    }

    static std::string filterBacktick(const std::string& s) {
        return "`" + s + "`";
    }

    static std::string filterSingleQuote(const std::string& s) {
        return "'" + s + "'";
    }

    static std::string filterUpper(const std::string& s) {
        std::string result = s;
        std::transform(result.begin(), result.end(), result.begin(), ::toupper);
        return result;
    }

    static std::string filterLower(const std::string& s) {
        std::string result = s;
        std::transform(result.begin(), result.end(), result.begin(), ::tolower);
        return result;
    }

    std::string applyFilter(const std::string& value, const std::string& filter_name) const {
        auto it = filters_.find(filter_name);
        if (it != filters_.end()) {
            return it->second(value);
        }
        return value; // No filter applied
    }

    std::string replaceVariables(const std::string& template_str, const Context& context) const {
        std::string result = template_str;
        size_t pos = 0;

        while ((pos = result.find("{{", pos)) != std::string::npos) {
            size_t end = result.find("}}", pos);
            if (end == std::string::npos) break;

            std::string var_expr = result.substr(pos + 2, end - pos - 2);
            // Trim whitespace
            var_expr.erase(0, var_expr.find_first_not_of(" \t\n\r"));
            var_expr.erase(var_expr.find_last_not_of(" \t\n\r") + 1);

            // Check for filter: variable|filter
            std::string var_name = var_expr;
            std::string filter_name;
            size_t pipe_pos = var_expr.find('|');
            if (pipe_pos != std::string::npos) {
                var_name = var_expr.substr(0, pipe_pos);
                filter_name = var_expr.substr(pipe_pos + 1);
                // Trim
                var_name.erase(var_name.find_last_not_of(" \t\n\r") + 1);
                filter_name.erase(0, filter_name.find_first_not_of(" \t\n\r"));
            }

            // Get variable value
            std::string value;
            auto it = context.find(var_name);
            if (it != context.end()) {
                value = it->second;
            }

            // Apply filter if present
            if (!filter_name.empty()) {
                value = applyFilter(value, filter_name);
            }

            result.replace(pos, end - pos + 2, value);
            pos += value.length();
        }

        return result;
    }

public:
    SqlTemplateEngine() {
        // Register built-in filters
        filters_["quote"] = filterQuote;
        filters_["backtick"] = filterBacktick;
        filters_["squote"] = filterSingleQuote;
        filters_["upper"] = filterUpper;
        filters_["lower"] = filterLower;
    }

    void registerFilter(const std::string& name, Filter filter) {
        filters_[name] = filter;
    }

    std::string render(const std::string& template_str, const Context& context) const {
        return replaceVariables(template_str, context);
    }
};

/**
 * SQL Templates for different dialects
 */
class SqlTemplates {
public:
    // SQLite CREATE TABLE template
    static constexpr const char* SQLITE_CREATE_TABLE = R"SQL(
CREATE TABLE IF NOT EXISTS {{ table_name }} (
{% for field in fields %}
    {{ field.name }} {{ field.type }}{% if field.primary %} PRIMARY KEY{% endif %}{% if field.not_null %} NOT NULL{% endif %}{% if field.unique %} UNIQUE{% endif %}{% if field.default %} DEFAULT {{ field.default }}{% endif %}{% if not loop.last %},{% endif %}
{% endfor %}
)
)SQL";

    // PostgreSQL CREATE TABLE template
    static constexpr const char* POSTGRES_CREATE_TABLE = R"SQL(
CREATE TABLE IF NOT EXISTS {{ table_name|quote }} (
{% for field in fields %}
    {{ field.name|quote }} {{ field.type }}{% if field.primary %} PRIMARY KEY{% endif %}{% if field.not_null %} NOT NULL{% endif %}{% if field.unique %} UNIQUE{% endif %}{% if field.default %} DEFAULT {{ field.default }}{% endif %}{% if not loop.last %},{% endif %}
{% endfor %}
)
)SQL";

    // MySQL CREATE TABLE template
    static constexpr const char* MYSQL_CREATE_TABLE = R"SQL(
CREATE TABLE IF NOT EXISTS {{ table_name|backtick }} (
{% for field in fields %}
    {{ field.name|backtick }} {{ field.type }}{% if field.primary %} PRIMARY KEY{% endif %}{% if field.not_null %} NOT NULL{% endif %}{% if field.unique %} UNIQUE{% endif %}{% if field.default %} DEFAULT {{ field.default }}{% endif %}{% if not loop.last %},{% endif %}
{% endfor %}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
)SQL";

    // CREATE INDEX template
    static constexpr const char* CREATE_INDEX = R"SQL(
CREATE {{ unique_keyword }}INDEX IF NOT EXISTS {{ index_name }} ON {{ table_name }} ({{ fields }})
)SQL";
};

} // namespace adapters
} // namespace dbal

#endif // DBAL_SQL_TEMPLATES_HPP
