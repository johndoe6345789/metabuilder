// Package list_concat provides the concatenate lists plugin.
package list_concat

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run concatenates multiple lists.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
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
