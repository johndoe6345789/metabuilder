// Package var_set provides the variable set plugin.
package var_set

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run stores a variable in the workflow store.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	key, ok := inputs["key"].(string)
	if !ok {
		return map[string]interface{}{"success": false, "error": "key is required"}, nil
	}

	value := inputs["value"]
	runtime.Store[key] = value

	return map[string]interface{}{"success": true, "key": key}, nil
}
