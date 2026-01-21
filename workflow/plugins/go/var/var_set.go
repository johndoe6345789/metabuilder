// Package variable provides variable management workflow plugins.
package variable

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Set stores a variable in the workflow store.
func Set(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	key, ok := inputs["key"].(string)
	if !ok {
		return map[string]interface{}{"success": false, "error": "key is required"}, nil
	}

	value := inputs["value"]
	runtime.Store[key] = value

	return map[string]interface{}{"success": true, "key": key}, nil
}
