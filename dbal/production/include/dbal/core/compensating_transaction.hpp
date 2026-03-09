#ifndef DBAL_COMPENSATING_TRANSACTION_HPP
#define DBAL_COMPENSATING_TRANSACTION_HPP

#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "dbal/errors.hpp"

namespace dbal {
namespace adapters {
    class Adapter;  // Forward declaration
}
}

namespace dbal {
namespace core {

using Json = nlohmann::json;

class CompensatingTransaction {
public:
    explicit CompensatingTransaction(adapters::Adapter& adapter);
    ~CompensatingTransaction();

    // Non-copyable, non-movable
    CompensatingTransaction(const CompensatingTransaction&) = delete;
    CompensatingTransaction& operator=(const CompensatingTransaction&) = delete;

    // Record operations for potential rollback
    void recordCreate(const std::string& entityName, const std::string& id);
    void recordUpdate(const std::string& entityName, const std::string& id, const Json& previousData);
    void recordDelete(const std::string& entityName, const Json& previousData);

    // Execute all undo operations in reverse order
    Result<bool> rollback();

    // Discard the undo log (transaction succeeded)
    void commit();

    bool isActive() const { return active_; }

private:
    enum class UndoType { UNDO_CREATE, UNDO_UPDATE, UNDO_DELETE };

    struct UndoOp {
        UndoType type;
        std::string entityName;
        std::string id;
        Json data;  // Previous data for update/delete rollback
    };

    adapters::Adapter& adapter_;
    std::vector<UndoOp> undo_log_;
    bool active_;
};

} // namespace core
} // namespace dbal

#endif // DBAL_COMPENSATING_TRANSACTION_HPP
