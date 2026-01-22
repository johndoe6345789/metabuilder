// Package dict_values provides a workflow plugin for getting dictionary values.
package dict_values

import (
	"sort"
)

// DictValues implements the NodeExecutor interface for getting dictionary values.
type DictValues struct {
	NodeType    string
	Category    string
	Description string
}

// NewDictValues creates a new DictValues instance.
func NewDictValues() *DictValues {
	return &DictValues{
		NodeType:    "dict.values",
		Category:    "dict",
		Description: "Get all values from a dictionary",
	}
}

// Execute runs the plugin logic.
// Returns all values from a dictionary.
// Inputs:
//   - dict: the dictionary to get values from
//   - sorted_by_key: (optional) return values sorted by their keys (default: false)
//
// Returns:
//   - result: list of values
func (p *DictValues) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	dict, ok := inputs["dict"].(map[string]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}
	}

	sortedByKey := false
	if s, ok := inputs["sorted_by_key"].(bool); ok {
		sortedByKey = s
	}

	if sortedByKey {
		// Get sorted keys first
		keys := make([]string, 0, len(dict))
		for k := range dict {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		// Return values in key order
		values := make([]interface{}, 0, len(dict))
		for _, k := range keys {
			values = append(values, dict[k])
		}
		return map[string]interface{}{"result": values}
	}

	// Return values in arbitrary order
	values := make([]interface{}, 0, len(dict))
	for _, v := range dict {
		values = append(values, v)
	}

	return map[string]interface{}{"result": values}
}
