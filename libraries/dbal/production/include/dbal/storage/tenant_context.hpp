#pragma once

#include <string>
#include <set>
#include <optional>

namespace dbal {
namespace tenant {

struct TenantIdentity {
  std::string tenantId;
  std::string userId;
  std::string role; // owner, admin, member, viewer
  std::set<std::string> permissions;
};

struct TenantQuota {
  // Blob storage quotas
  std::optional<size_t> maxBlobStorageBytes;
  std::optional<size_t> maxBlobCount;
  std::optional<size_t> maxBlobSizeBytes;
  
  // Structured data quotas
  std::optional<size_t> maxRecords;
  std::optional<size_t> maxDataSizeBytes;
  std::optional<size_t> maxListLength;
  
  // Current usage
  size_t currentBlobStorageBytes;
  size_t currentBlobCount;
  size_t currentRecords;
  size_t currentDataSizeBytes;
};

class TenantContext {
public:
  TenantContext(const TenantIdentity& identity, 
                const TenantQuota& quota,
                const std::string& ns)
    : identity_(identity), quota_(quota), namespace__(ns) {}
  
  bool canRead(const std::string& resource) const {
    // Owner and admin can read everything
    if (identity_.role == "owner" || identity_.role == "admin") {
      return true;
    }
    
    // Check specific permissions
    return identity_.permissions.count("read:*") > 0 ||
           identity_.permissions.count("read:" + resource) > 0;
  }
  
  bool canWrite(const std::string& resource) const {
    // Only owner and admin can write
    if (identity_.role == "owner" || identity_.role == "admin") {
      return true;
    }
    
    // Check specific permissions
    return identity_.permissions.count("write:*") > 0 ||
           identity_.permissions.count("write:" + resource) > 0;
  }
  
  bool canDelete(const std::string& resource) const {
    // Only owner and admin can delete
    if (identity_.role == "owner" || identity_.role == "admin") {
      return true;
    }
    
    // Check specific permissions
    return identity_.permissions.count("delete:*") > 0 ||
           identity_.permissions.count("delete:" + resource) > 0;
  }
  
  bool canUploadBlob(size_t sizeBytes) const {
    // Check max blob size
    if (quota_.maxBlobSizeBytes && sizeBytes > *quota_.maxBlobSizeBytes) {
      return false;
    }
    
    // Check total storage quota
    if (quota_.maxBlobStorageBytes) {
      if (quota_.currentBlobStorageBytes + sizeBytes > *quota_.maxBlobStorageBytes) {
        return false;
      }
    }
    
    // Check blob count quota
    if (quota_.maxBlobCount) {
      if (quota_.currentBlobCount >= *quota_.maxBlobCount) {
        return false;
      }
    }
    
    return true;
  }
  
  bool canCreateRecord() const {
    if (quota_.maxRecords) {
      return quota_.currentRecords < *quota_.maxRecords;
    }
    return true;
  }
  
  bool canAddToList(size_t additionalItems) const {
    if (quota_.maxListLength && additionalItems > *quota_.maxListLength) {
      return false;
    }
    return true;
  }
  
  const TenantIdentity& identity() const { return identity_; }
  TenantQuota& quota() { return quota_; }
  const TenantQuota& quota() const { return quota_; }
  const std::string& namespace_() const { return namespace__; }

private:
  TenantIdentity identity_;
  TenantQuota quota_;
  std::string namespace__;
};

} // namespace tenant
} // namespace dbal
