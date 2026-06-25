// Package dict_keys provides a workflow plugin for getting dictionary keys.
package dict_keys

import (
	"sort"
)

// DictKeys implements the NodeExecutor interface for getting dictionary keys.
type DictKeys struct {
	NodeType    string
	Category    string
	Description string
}

// NewDictKeys creates a new DictKeys instance.
func NewDictKeys() *DictKeys {
	return &DictKeys{
		NodeType:    "dict.keys",
		Category:    "dict",
		Description: "Get all keys from a dictionary",
	}
}

// Execute runs the plugin logic.
// Returns all keys from a dictionary.
// Inputs:
//   - dict: the dictionary to get keys from
//   - sorted: (optional) whether to sort keys alphabetically (default: false)
//
// Returns:
//   - result: list of keys
func (p *DictKeys) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	dict, ok := inputs["dict"].(map[string]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}
	}

	keys := make([]interface{}, 0, len(dict))
	for k := range dict {
		keys = append(keys, k)
	}

	// Sort if requested
	if sorted, ok := inputs["sorted"].(bool); ok && sorted {
		sort.Slice(keys, func(i, j int) bool {
			ki, _ := keys[i].(string)
			kj, _ := keys[j].(string)
			return ki < kj
		})
	}

	return map[string]interface{}{"result": keys}
}
