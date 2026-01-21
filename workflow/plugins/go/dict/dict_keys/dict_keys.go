// Package dict_keys provides the dictionary keys plugin.
package dict_keys

import (
	"sort"

	plugin "metabuilder/workflow/plugins/go"
)

// Run returns all keys from a dictionary.
// Inputs:
//   - dict: the dictionary to get keys from
//   - sorted: (optional) whether to sort keys alphabetically (default: false)
//
// Returns:
//   - result: list of keys
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	dict, ok := inputs["dict"].(map[string]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}, nil
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

	return map[string]interface{}{"result": keys}, nil
}
