// Package dict_set provides a workflow plugin for setting dictionary values.
package dict_set

import (
	"strings"
)

// DictSet implements the NodeExecutor interface for setting dictionary values.
type DictSet struct {
	NodeType    string
	Category    string
	Description string
}

// NewDictSet creates a new DictSet instance.
func NewDictSet() *DictSet {
	return &DictSet{
		NodeType:    "dict.set",
		Category:    "dict",
		Description: "Set a value in a dictionary by key",
	}
}

// Execute runs the plugin logic.
// Sets a value in a dictionary by key.
// Supports dot notation for nested keys (e.g., "user.name").
// Creates intermediate objects as needed.
// Inputs:
//   - dict: the dictionary to modify (or nil to create new)
//   - key: the key to set (supports dot notation)
//   - value: the value to set
//
// Returns:
//   - result: the modified dictionary
func (p *DictSet) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	dict, ok := inputs["dict"].(map[string]interface{})
	if !ok {
		dict = make(map[string]interface{})
	} else {
		// Make a shallow copy to avoid mutating the original
		dict = copyDict(dict)
	}

	key, ok := inputs["key"].(string)
	if !ok {
		return map[string]interface{}{"result": dict}
	}

	value := inputs["value"]

	// Handle dot notation for nested keys
	parts := strings.Split(key, ".")

	if len(parts) == 1 {
		// Simple key
		dict[key] = value
		return map[string]interface{}{"result": dict}
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

	return map[string]interface{}{"result": dict}
}

// copyDict creates a shallow copy of a dictionary.
func copyDict(d map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{}, len(d))
	for k, v := range d {
		result[k] = v
	}
	return result
}
