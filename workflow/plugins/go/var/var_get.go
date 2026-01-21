// Package variable provides variable management workflow plugins.
package variable

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Get retrieves a variable from the workflow store.
func Get(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	key, ok := inputs["key"].(string)
	if !ok {
		return map[string]interface{}{
			"result": nil,
			"exists": false,
			"error":  "key is required",
		}, nil
	}

	defaultVal := inputs["default"]

	value, exists := runtime.Store[key]
	if !exists {
		value = defaultVal
	}

	return map[string]interface{}{
		"result": value,
		"exists": exists,
	}, nil
}
