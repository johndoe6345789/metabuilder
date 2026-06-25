#ifndef DBAL_DELETE_COMPONENT_HPP
#define DBAL_DELETE_COMPONENT_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"
#include "../helpers.hpp"

namespace dbal {
namespace entities {
namespace component {

inline Result<bool> remove(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Component ID cannot be empty");
    }

    auto it = store.components.find(id);
    if (it == store.components.end()) {
        return Error::notFound("Component not found: " + id);
    }

    helpers::cascadeDeleteComponent(store, id);
    return Result<bool>(true);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
