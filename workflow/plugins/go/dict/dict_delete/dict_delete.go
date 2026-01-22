// Package dict_delete provides a workflow plugin for deleting dictionary keys.
package dict_delete

import (
	"strings"
)

// DictDelete implements the NodeExecutor interface for deleting dictionary keys.
type DictDelete struct {
	NodeType    string
	Category    string
	Description string
}

// NewDictDelete creates a new DictDelete instance.
func NewDictDelete() *DictDelete {
	return &DictDelete{
		NodeType:    "dict.delete",
		Category:    "dict",
		Description: "Delete a key from a dictionary",
	}
}

// Execute runs the plugin logic.
// Removes a key from a dictionary.
// Supports dot notation for nested keys (e.g., "user.name").
// Inputs:
//   - dict: the dictionary to modify
//   - key: the key to delete (supports dot notation)
//
// Returns:
//   - result: the modified dictionary
//   - deleted: whether the key was found and deleted
func (p *DictDelete) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	dict, ok := inputs["dict"].(map[string]interface{})
	if !ok {
		return map[string]interface{}{"result": map[string]interface{}{}, "deleted": false}
	}

	// Make a shallow copy to avoid mutating the original
	dict = copyDict(dict)

	key, ok := inputs["key"].(string)
	if !ok {
		return map[string]interface{}{"result": dict, "deleted": false}
	}

	// Handle dot notation for nested keys
	parts := strings.Split(key, ".")

	if len(parts) == 1 {
		// Simple key
		if _, exists := dict[key]; exists {
			delete(dict, key)
			return map[string]interface{}{"result": dict, "deleted": true}
		}
		return map[string]interface{}{"result": dict, "deleted": false}
	}

	// Nested key - navigate to parent and delete
	current := dict
	for i := 0; i < len(parts)-1; i++ {
		part := parts[i]
		if val, exists := current[part]; exists {
			if nested, ok := val.(map[string]interface{}); ok {
				// Copy nested dict to avoid mutation
				copied := copyDict(nested)
				current[part] = copied
				current = copied
			} else {
				// Cannot descend further
				return map[string]interface{}{"result": dict, "deleted": false}
			}
		} else {
			// Path does not exist
			return map[string]interface{}{"result": dict, "deleted": false}
		}
	}

	// Delete the final key
	finalKey := parts[len(parts)-1]
	if _, exists := current[finalKey]; exists {
		delete(current, finalKey)
		return map[string]interface{}{"result": dict, "deleted": true}
	}

	return map[string]interface{}{"result": dict, "deleted": false}
}

// copyDict creates a shallow copy of a dictionary.
func copyDict(d map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{}, len(d))
	for k, v := range d {
		result[k] = v
	}
	return result
}
