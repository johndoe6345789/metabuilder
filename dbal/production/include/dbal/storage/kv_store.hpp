#pragma once

#include <string>
#include <vector>
#include <variant>
#include <map>
#include <optional>
#include "tenant_context.hpp"
#include "../result.hpp"
#include "../errors.hpp"

namespace dbal {
namespace kv {

// Storable value types
using StorableValue = std::variant<
  std::string,
  int64_t,
  double,
  bool,
  std::nullptr_t,
  std::map<std::string, std::string>, // Simplified object
  std::vector<std::string> // Simplified array
>;

struct KVEntry {
  std::string key;
  StorableValue value;
  size_t sizeBytes;
  std::chrono::system_clock::time_point createdAt;
  std::chrono::system_clock::time_point updatedAt;
  std::optional<std::chrono::system_clock::time_point> expiresAt;
};

struct ListOptions {
  std::optional<std::string> prefix;
  size_t limit = 100;
  std::optional<std::string> cursor;
};

struct ListResult {
  std::vector<KVEntry> entries;
  std::optional<std::string> nextCursor;
  bool hasMore;
};

class KVStore {
public:
  virtual ~KVStore() = default;
  
  // Basic operations
  virtual Result<std::optional<StorableValue>> get(
    const std::string& key,
    const tenant::TenantContext& context
  ) = 0;
  
  virtual Result<void> set(
    const std::string& key,
    const StorableValue& value,
    const tenant::TenantContext& context,
    std::optional<int> ttl = std::nullopt
  ) = 0;
  
  virtual Result<bool> remove(
    const std::string& key,
    const tenant::TenantContext& context
  ) = 0;
  
  virtual Result<bool> exists(
    const std::string& key,
    const tenant::TenantContext& context
  ) = 0;
  
  // List operations
  virtual Result<size_t> listAdd(
    const std::string& key,
    const std::vector<std::string>& items,
    const tenant::TenantContext& context
  ) = 0;
  
  virtual Result<std::vector<std::string>> listGet(
    const std::string& key,
    const tenant::TenantContext& context,
    int start = 0,
    std::optional<int> end = std::nullopt
  ) = 0;
  
  virtual Result<size_t> listRemove(
    const std::string& key,
    const std::string& value,
    const tenant::TenantContext& context
  ) = 0;
  
  virtual Result<size_t> listLength(
    const std::string& key,
    const tenant::TenantContext& context
  ) = 0;
  
  virtual Result<void> listClear(
    const std::string& key,
    const tenant::TenantContext& context
  ) = 0;
  
  // Query operations
  virtual Result<ListResult> list(
    const ListOptions& options,
    const tenant::TenantContext& context
  ) = 0;
  
  virtual Result<size_t> count(
    const std::string& prefix,
    const tenant::TenantContext& context
  ) = 0;
  
  virtual Result<size_t> clear(
    const tenant::TenantContext& context
  ) = 0;
};

} // namespace kv
} // namespace dbal
