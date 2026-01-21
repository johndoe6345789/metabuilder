// Package dict_values provides the dictionary values plugin.
package dict_values

import (
	"sort"

	plugin "metabuilder/workflow/plugins/go"
)

// Run returns all values from a dictionary.
// Inputs:
//   - dict: the dictionary to get values from
//   - sorted_by_key: (optional) return values sorted by their keys (default: false)
//
// Returns:
//   - result: list of values
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	dict, ok := inputs["dict"].(map[string]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}, nil
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
		return map[string]interface{}{"result": values}, nil
	}

	// Return values in arbitrary order
	values := make([]interface{}, 0, len(dict))
	for _, v := range dict {
		values = append(values, v)
	}

	return map[string]interface{}{"result": values}, nil
}
