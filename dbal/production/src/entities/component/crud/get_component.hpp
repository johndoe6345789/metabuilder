#ifndef DBAL_GET_COMPONENT_HPP
#define DBAL_GET_COMPONENT_HPP

#include "dbal/errors.hpp"
#include "../../../store/in_memory_store.hpp"

namespace dbal {
namespace entities {
namespace component {

inline Result<ComponentNode> get(InMemoryStore& store, const std::string& id) {
    if (id.empty()) {
        return Error::validationError("Component ID cannot be empty");
    }

    auto it = store.components.find(id);
    if (it == store.components.end()) {
        return Error::notFound("Component not found: " + id);
    }

    return Result<ComponentNode>(it->second);
}

} // namespace component
} // namespace entities
} // namespace dbal

#endif
