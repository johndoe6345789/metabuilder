// Package list_unique provides a workflow plugin for removing duplicates from lists.
package list_unique

import (
	"encoding/json"
)

// ListUnique implements the NodeExecutor interface for removing duplicates from lists.
type ListUnique struct {
	NodeType    string
	Category    string
	Description string
}

// NewListUnique creates a new ListUnique instance.
func NewListUnique() *ListUnique {
	return &ListUnique{
		NodeType:    "list.unique",
		Category:    "list",
		Description: "Remove duplicate elements from a list",
	}
}

// Execute runs the plugin logic.
// Inputs:
//   - list: the list to deduplicate
//   - key: (optional) the key to use for uniqueness in objects
//
// Returns:
//   - result: the list with duplicates removed
func (p *ListUnique) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	list, ok := inputs["list"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}
	}

	key, hasKey := inputs["key"].(string)
	seen := make(map[string]bool)
	result := make([]interface{}, 0, len(list))

	for _, item := range list {
		var identifier string

		if hasKey {
			// Use specific key for uniqueness in objects
			if obj, ok := item.(map[string]interface{}); ok {
				if val, exists := obj[key]; exists {
					identifier = toHashKey(val)
				} else {
					identifier = toHashKey(item)
				}
			} else {
				identifier = toHashKey(item)
			}
		} else {
			identifier = toHashKey(item)
		}

		if !seen[identifier] {
			seen[identifier] = true
			result = append(result, item)
		}
	}

	return map[string]interface{}{"result": result}
}

// toHashKey converts a value to a string suitable for use as a map key.
func toHashKey(v interface{}) string {
	switch val := v.(type) {
	case string:
		return "s:" + val
	case float64:
		return "n:" + json.Number(json.Number(string(rune(val)))).String()
	case int:
		return "i:" + string(rune(val))
	case bool:
		if val {
			return "b:true"
		}
		return "b:false"
	case nil:
		return "null"
	default:
		// For complex types, use JSON encoding
		bytes, err := json.Marshal(val)
		if err != nil {
			return "unknown"
		}
		return "j:" + string(bytes)
	}
}
