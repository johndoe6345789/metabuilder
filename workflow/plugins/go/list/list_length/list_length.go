// Package list_length provides the list length plugin.
package list_length

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run returns the length of a list.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	list, ok := inputs["list"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": 0}, nil
	}

	return map[string]interface{}{"result": len(list)}, nil
}
