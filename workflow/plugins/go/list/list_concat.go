// Package list provides list manipulation workflow plugins.
package list

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Concat concatenates multiple lists.
func Concat(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	lists, ok := inputs["lists"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}, nil
	}

	var result []interface{}
	for _, lst := range lists {
		if arr, ok := lst.([]interface{}); ok {
			result = append(result, arr...)
		}
	}

	return map[string]interface{}{"result": result}, nil
}
