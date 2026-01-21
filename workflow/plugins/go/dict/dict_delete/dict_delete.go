// Package dict_delete provides the dictionary delete plugin.
package dict_delete

import (
	"strings"

	plugin "metabuilder/workflow/plugins/go"
)

// Run removes a key from a dictionary.
// Supports dot notation for nested keys (e.g., "user.name").
// Inputs:
//   - dict: the dictionary to modify
//   - key: the key to delete (supports dot notation)
//
// Returns:
//   - result: the modified dictionary
//   - deleted: whether the key was found and deleted
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	dict, ok := inputs["dict"].(map[string]interface{})
	if !ok {
		return map[string]interface{}{"result": map[string]interface{}{}, "deleted": false}, nil
	}

	// Make a shallow copy to avoid mutating the original
	dict = copyDict(dict)

	key, ok := inputs["key"].(string)
	if !ok {
		return map[string]interface{}{"result": dict, "deleted": false}, nil
	}

	// Handle dot notation for nested keys
	parts := strings.Split(key, ".")

	if len(parts) == 1 {
		// Simple key
		if _, exists := dict[key]; exists {
			delete(dict, key)
			return map[string]interface{}{"result": dict, "deleted": true}, nil
		}
		return map[string]interface{}{"result": dict, "deleted": false}, nil
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
				return map[string]interface{}{"result": dict, "deleted": false}, nil
			}
		} else {
			// Path does not exist
			return map[string]interface{}{"result": dict, "deleted": false}, nil
		}
	}

	// Delete the final key
	finalKey := parts[len(parts)-1]
	if _, exists := current[finalKey]; exists {
		delete(current, finalKey)
		return map[string]interface{}{"result": dict, "deleted": true}, nil
	}

	return map[string]interface{}{"result": dict, "deleted": false}, nil
}

// copyDict creates a shallow copy of a dictionary.
func copyDict(d map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{}, len(d))
	for k, v := range d {
		result[k] = v
	}
	return result
}
