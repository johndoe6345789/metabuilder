// Package list provides list manipulation workflow plugins.
package list

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Reverse reverses a list.
func Reverse(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
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
