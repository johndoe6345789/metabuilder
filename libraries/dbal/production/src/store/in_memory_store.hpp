/**
 * @file in_memory_store.hpp
 * @brief In-memory data store for mock implementation
 *
 * Centralized storage for all entity types with thread-safe counters.
 * Supports snapshot-based transactions for atomic rollback.
 */
#ifndef DBAL_IN_MEMORY_STORE_HPP
#define DBAL_IN_MEMORY_STORE_HPP

#include <map>
#include <memory>
#include <string>
#include <vector>
#include <cstdio>
#include "dbal/types.hpp"

namespace dbal {

/**
 * In-memory store containing all entity collections and ID mappings
 */
struct InMemoryStore {
    // Entity collections
    std::map<std::string, User> users;
    std::map<std::string, PageConfig> pages;
    std::map<std::string, Workflow> workflows;
    std::map<std::string, Session> sessions;
    std::map<std::string, InstalledPackage> packages;
    std::map<std::string, Credential> credentials;

    // Secondary indexes (unique field -> id mappings)
    std::map<std::string, std::string> page_paths;      // path -> id
    std::map<std::string, std::string> workflow_names;  // name -> id
    std::map<std::string, std::string> session_tokens;  // token -> id
    std::map<std::string, std::string> package_keys;    // packageId -> id

    // Entity counters for ID generation
    int user_counter = 0;
    int page_counter = 0;
    int workflow_counter = 0;
    int session_counter = 0;
    int package_counter = 0;
    int credential_counter = 0;

    std::map<std::string, ComponentNode> components;
    std::map<std::string, std::vector<std::string>> components_by_page;
    std::map<std::string, std::vector<std::string>> components_by_parent;
    int component_counter = 0;

    /**
     * Generate a unique ID with prefix
     */
    std::string generateId(const std::string& prefix, int counter) {
        char buffer[64];
        snprintf(buffer, sizeof(buffer), "%s_%08d", prefix.c_str(), counter);
        return std::string(buffer);
    }

    /**
     * Clear all data from the store
     */
    void clear() {
        users.clear();
        pages.clear();
        page_paths.clear();
        workflows.clear();
        workflow_names.clear();
        sessions.clear();
        session_tokens.clear();
        packages.clear();
        package_keys.clear();
        credentials.clear();
        components.clear();
        components_by_page.clear();
        components_by_parent.clear();

        user_counter = 0;
        page_counter = 0;
        workflow_counter = 0;
        session_counter = 0;
        package_counter = 0;
        credential_counter = 0;
        component_counter = 0;
    }

    // ===== Snapshot-Based Transaction Support =====

    /**
     * @brief Begin a transaction by taking a full snapshot of the store.
     * Only one transaction can be active at a time.
     * @return true if transaction started, false if one is already active.
     */
    bool beginTransaction() {
        if (transaction_active_) {
            return false;
        }
        snapshot_ = std::make_unique<InMemoryStore>();
        copyTo(*snapshot_);
        transaction_active_ = true;
        return true;
    }

    /**
     * @brief Commit the current transaction (discard the snapshot).
     * @return true if committed, false if no transaction was active.
     */
    bool commitTransaction() {
        if (!transaction_active_) {
            return false;
        }
        snapshot_.reset();
        transaction_active_ = false;
        return true;
    }

    /**
     * @brief Rollback the current transaction by restoring the snapshot.
     * @return true if rolled back, false if no transaction was active.
     */
    bool rollbackTransaction() {
        if (!transaction_active_ || !snapshot_) {
            return false;
        }
        snapshot_->copyTo(*this);
        snapshot_.reset();
        transaction_active_ = false;
        return true;
    }

    /**
     * @brief Check if a transaction is currently active.
     */
    bool isTransactionActive() const {
        return transaction_active_;
    }

private:
    /**
     * @brief Copy all data from this store to another store.
     * Used for snapshot creation and restoration.
     */
    void copyTo(InMemoryStore& target) const {
        target.users = users;
        target.pages = pages;
        target.workflows = workflows;
        target.sessions = sessions;
        target.packages = packages;
        target.credentials = credentials;

        target.page_paths = page_paths;
        target.workflow_names = workflow_names;
        target.session_tokens = session_tokens;
        target.package_keys = package_keys;

        target.user_counter = user_counter;
        target.page_counter = page_counter;
        target.workflow_counter = workflow_counter;
        target.session_counter = session_counter;
        target.package_counter = package_counter;
        target.credential_counter = credential_counter;

        target.components = components;
        target.components_by_page = components_by_page;
        target.components_by_parent = components_by_parent;
        target.component_counter = component_counter;
    }

    std::unique_ptr<InMemoryStore> snapshot_;
    bool transaction_active_ = false;
};

/**
 * Get singleton instance of the in-memory store
 */
inline InMemoryStore& getStore() {
    static InMemoryStore store;
    return store;
}

} // namespace dbal

#endif
