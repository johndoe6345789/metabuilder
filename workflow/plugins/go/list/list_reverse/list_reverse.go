// Package list_reverse provides the list reverse plugin.
package list_reverse

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run reverses a list.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	list, ok := inputs["list"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}, nil
	}

	result := make([]interface{}, len(list))
	for i, v := range list {
		result[len(list)-1-i] = v
	}

	return map[string]interface{}{"result": result}, nil
}
