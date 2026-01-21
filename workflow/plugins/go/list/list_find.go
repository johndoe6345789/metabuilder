// Package list provides list manipulation workflow plugins.
package list

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Find returns the first element matching a condition or key/value pair.
// Inputs:
//   - list: the list to search
//   - key: (optional) the key to match in objects
//   - value: the value to match (or condition value)
// Returns:
//   - result: the first matching element or nil
//   - index: the index of the match or -1
func Find(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	list, ok := inputs["list"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": nil, "index": -1}, nil
	}

	value := inputs["value"]
	key, hasKey := inputs["key"].(string)

	for i, item := range list {
		if hasKey {
			// Search by key/value in objects
			if obj, ok := item.(map[string]interface{}); ok {
				if objVal, exists := obj[key]; exists && objVal == value {
					return map[string]interface{}{"result": item, "index": i}, nil
				}
			}
		} else {
			// Direct value comparison
			if item == value {
				return map[string]interface{}{"result": item, "index": i}, nil
			}
		}
	}

	return map[string]interface{}{"result": nil, "index": -1}, nil
}
