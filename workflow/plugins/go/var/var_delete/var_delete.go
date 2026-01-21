// Package var_delete provides the variable delete plugin.
package var_delete

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run removes a variable from the workflow store.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	key, ok := inputs["key"].(string)
	if !ok {
		return map[string]interface{}{"success": false, "error": "key is required"}, nil
	}

	_, existed := runtime.Store[key]
	delete(runtime.Store, key)

	return map[string]interface{}{"success": true, "existed": existed}, nil
}
