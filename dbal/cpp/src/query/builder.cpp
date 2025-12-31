#include <string>
#include <vector>
#include <map>

namespace dbal {
namespace query {

class QueryBuilder {
public:
    QueryBuilder& select(const std::vector<std::string>& columns) {
        query_type_ = "SELECT";
        columns_ = columns;
        return *this;
    }
    
    QueryBuilder& from(const std::string& table) {
        table_ = table;
        return *this;
    }
    
    QueryBuilder& where(const std::string& condition) {
        conditions_.push_back(condition);
        return *this;
    }
    
    QueryBuilder& orderBy(const std::string& column, const std::string& direction = "ASC") {
        order_by_ = column + " " + direction;
        return *this;
    }
    
    QueryBuilder& limit(int limit) {
        limit_ = limit;
        return *this;
    }
    
    std::string build() const {
        std::string query = query_type_ + " ";
        
        if (!columns_.empty()) {
            for (size_t i = 0; i < columns_.size(); ++i) {
                query += columns_[i];
                if (i < columns_.size() - 1) query += ", ";
            }
        } else {
            query += "*";
        }
        
        query += " FROM " + table_;
        
        if (!conditions_.empty()) {
            query += " WHERE ";
            for (size_t i = 0; i < conditions_.size(); ++i) {
                query += conditions_[i];
                if (i < conditions_.size() - 1) query += " AND ";
            }
        }
        
        if (!order_by_.empty()) {
            query += " ORDER BY " + order_by_;
        }
        
        if (limit_ > 0) {
            query += " LIMIT " + std::to_string(limit_);
        }
        
        return query;
    }
    
private:
    std::string query_type_;
    std::vector<std::string> columns_;
    std::string table_;
    std::vector<std::string> conditions_;
    std::string order_by_;
    int limit_ = 0;
};

}
}
