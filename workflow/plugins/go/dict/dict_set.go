// Package dict provides dictionary/map manipulation workflow plugins.
package dict

import (
	"strings"

	plugin "metabuilder/workflow/plugins/go"
)

// Set sets a value in a dictionary by key.
// Supports dot notation for nested keys (e.g., "user.name").
// Creates intermediate objects as needed.
// Inputs:
//   - dict: the dictionary to modify (or nil to create new)
//   - key: the key to set (supports dot notation)
//   - value: the value to set
// Returns:
//   - result: the modified dictionary
func Set(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	dict, ok := inputs["dict"].(map[string]interface{})
	if !ok {
		dict = make(map[string]interface{})
	} else {
		// Make a shallow copy to avoid mutating the original
		dict = copyDict(dict)
	}

	key, ok := inputs["key"].(string)
	if !ok {
		return map[string]interface{}{"result": dict}, nil
	}

	value := inputs["value"]

	// Handle dot notation for nested keys
	parts := strings.Split(key, ".")

	if len(parts) == 1 {
		// Simple key
		dict[key] = value
		return map[string]interface{}{"result": dict}, nil
	}

	// Nested key - navigate/create intermediate objects
	current := dict
	for i := 0; i < len(parts)-1; i++ {
		part := parts[i]
		if next, exists := current[part]; exists {
			if nested, ok := next.(map[string]interface{}); ok {
				// Copy nested dict to avoid mutation
				copied := copyDict(nested)
				current[part] = copied
				current = copied
			} else {
				// Replace non-dict with new dict
				newDict := make(map[string]interface{})
				current[part] = newDict
				current = newDict
			}
		} else {
			// Create intermediate dict
			newDict := make(map[string]interface{})
			current[part] = newDict
			current = newDict
		}
	}

	// Set the final value
	current[parts[len(parts)-1]] = value

	return map[string]interface{}{"result": dict}, nil
}

// copyDict creates a shallow copy of a dictionary.
func copyDict(d map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{}, len(d))
	for k, v := range d {
		result[k] = v
	}
	return result
}
