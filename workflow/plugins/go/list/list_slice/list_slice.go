// Package list_slice provides the list slice plugin.
package list_slice

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run extracts a portion of a list.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	list, ok := inputs["list"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}, nil
	}

	start := 0
	if s, ok := inputs["start"].(int); ok {
		start = s
	}

	end := len(list)
	if e, ok := inputs["end"].(int); ok {
		end = e
	}

	// Handle negative indices
	if start < 0 {
		start = len(list) + start
	}
	if end < 0 {
		end = len(list) + end
	}

	// Bounds checking
	if start < 0 {
		start = 0
	}
	if end > len(list) {
		end = len(list)
	}
	if start > end {
		start = end
	}

	return map[string]interface{}{"result": list[start:end]}, nil
}
