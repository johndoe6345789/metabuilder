#include "dbal/core/compensating_transaction.hpp"
#include "dbal/adapters/adapter.hpp"
#include <spdlog/spdlog.h>

namespace dbal {
namespace core {

CompensatingTransaction::CompensatingTransaction(adapters::Adapter& adapter)
    : adapter_(adapter), active_(true) {
    spdlog::debug("CompensatingTransaction: started");
}

CompensatingTransaction::~CompensatingTransaction() {
    if (active_) {
        spdlog::warn("CompensatingTransaction: destroyed while active — rolling back");
        rollback();
    }
}

void CompensatingTransaction::recordCreate(const std::string& entityName, const std::string& id) {
    if (!active_) return;
    undo_log_.push_back({UndoType::UNDO_CREATE, entityName, id, {}});
    spdlog::trace("CompensatingTransaction: recorded create {}/{}", entityName, id);
}

void CompensatingTransaction::recordUpdate(const std::string& entityName, const std::string& id, const Json& previousData) {
    if (!active_) return;
    undo_log_.push_back({UndoType::UNDO_UPDATE, entityName, id, previousData});
    spdlog::trace("CompensatingTransaction: recorded update {}/{}", entityName, id);
}

void CompensatingTransaction::recordDelete(const std::string& entityName, const Json& previousData) {
    if (!active_) return;
    std::string id = previousData.contains("id") ? previousData["id"].get<std::string>() : "";
    undo_log_.push_back({UndoType::UNDO_DELETE, entityName, id, previousData});
    spdlog::trace("CompensatingTransaction: recorded delete {}/{}", entityName, id);
}

Result<bool> CompensatingTransaction::rollback() {
    if (!active_) {
        return Error::internal("CompensatingTransaction: not active");
    }

    spdlog::info("CompensatingTransaction: rolling back {} operations", undo_log_.size());

    int rollback_errors = 0;

    // Execute undos in reverse order
    for (auto it = undo_log_.rbegin(); it != undo_log_.rend(); ++it) {
        const auto& op = *it;
        switch (op.type) {
            case UndoType::UNDO_CREATE: {
                // Undo a create = delete
                auto result = adapter_.remove(op.entityName, op.id);
                if (!result) {
                    spdlog::error("CompensatingTransaction: failed to undo create {}/{}: {}",
                                  op.entityName, op.id, result.error().what());
                    rollback_errors++;
                }
                break;
            }
            case UndoType::UNDO_UPDATE: {
                // Undo an update = restore previous data
                auto result = adapter_.update(op.entityName, op.id, op.data);
                if (!result) {
                    spdlog::error("CompensatingTransaction: failed to undo update {}/{}: {}",
                                  op.entityName, op.id, result.error().what());
                    rollback_errors++;
                }
                break;
            }
            case UndoType::UNDO_DELETE: {
                // Undo a delete = re-create with previous data
                auto result = adapter_.create(op.entityName, op.data);
                if (!result) {
                    spdlog::error("CompensatingTransaction: failed to undo delete {}/{}: {}",
                                  op.entityName, op.id, result.error().what());
                    rollback_errors++;
                }
                break;
            }
        }
    }

    active_ = false;
    undo_log_.clear();

    if (rollback_errors > 0) {
        return Error::internal("CompensatingTransaction: " + std::to_string(rollback_errors) + " rollback operations failed");
    }

    spdlog::info("CompensatingTransaction: rollback complete");
    return Result<bool>(true);
}

void CompensatingTransaction::commit() {
    if (!active_) return;
    spdlog::debug("CompensatingTransaction: committed ({} operations)", undo_log_.size());
    active_ = false;
    undo_log_.clear();
}

} // namespace core
} // namespace dbal
