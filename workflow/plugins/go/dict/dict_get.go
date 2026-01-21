// Package dict provides dictionary/map manipulation workflow plugins.
package dict

import (
	"strings"

	plugin "metabuilder/workflow/plugins/go"
)

// Get retrieves a value from a dictionary by key.
// Supports dot notation for nested keys (e.g., "user.name").
// Inputs:
//   - dict: the dictionary to read from
//   - key: the key to retrieve (supports dot notation)
//   - default: (optional) default value if key not found
// Returns:
//   - result: the value at the key or default
//   - found: whether the key was found
func Get(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	dict, ok := inputs["dict"].(map[string]interface{})
	if !ok {
		defaultVal := inputs["default"]
		return map[string]interface{}{"result": defaultVal, "found": false}, nil
	}

	key, ok := inputs["key"].(string)
	if !ok {
		defaultVal := inputs["default"]
		return map[string]interface{}{"result": defaultVal, "found": false}, nil
	}

	// Handle dot notation for nested keys
	parts := strings.Split(key, ".")
	current := dict

	for i, part := range parts {
		if val, exists := current[part]; exists {
			if i == len(parts)-1 {
				// Final key, return the value
				return map[string]interface{}{"result": val, "found": true}, nil
			}
			// Not the final key, try to descend
			if nested, ok := val.(map[string]interface{}); ok {
				current = nested
			} else {
				// Can't descend further
				defaultVal := inputs["default"]
				return map[string]interface{}{"result": defaultVal, "found": false}, nil
			}
		} else {
			// Key not found
			defaultVal := inputs["default"]
			return map[string]interface{}{"result": defaultVal, "found": false}, nil
		}
	}

	defaultVal := inputs["default"]
	return map[string]interface{}{"result": defaultVal, "found": false}, nil
}
