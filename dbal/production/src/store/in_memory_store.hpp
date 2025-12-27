/**
 * @file in_memory_store.hpp
 * @brief In-memory data store for mock implementation
 * 
 * Centralized storage for all entity types with thread-safe counters.
 */
#ifndef DBAL_IN_MEMORY_STORE_HPP
#define DBAL_IN_MEMORY_STORE_HPP

#include <map>
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
    std::map<std::string, PageView> pages;
    std::map<std::string, Workflow> workflows;
    std::map<std::string, Session> sessions;
    std::map<std::string, LuaScript> lua_scripts;
    std::map<std::string, Package> packages;
    std::map<std::string, Credential> credentials;
    
    // Secondary indexes (unique field -> id mappings)
    std::map<std::string, std::string> page_slugs;      // slug -> id
    std::map<std::string, std::string> workflow_names;  // name -> id
    std::map<std::string, std::string> session_tokens;  // token -> id
    std::map<std::string, std::string> lua_script_names; // name -> id
    std::map<std::string, std::string> package_keys;    // name@version -> id
    
    // Entity counters for ID generation
    int user_counter = 0;
    int page_counter = 0;
    int workflow_counter = 0;
    int session_counter = 0;
    int lua_script_counter = 0;
    int package_counter = 0;
    int credential_counter = 0;
    
    std::map<std::string, ComponentHierarchy> components;
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
        page_slugs.clear();
        workflows.clear();
        workflow_names.clear();
        sessions.clear();
        session_tokens.clear();
        lua_scripts.clear();
        lua_script_names.clear();
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
        lua_script_counter = 0;
        package_counter = 0;
        credential_counter = 0;
        component_counter = 0;
    }
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
