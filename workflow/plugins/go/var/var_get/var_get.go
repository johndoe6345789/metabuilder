// Package var_get provides the variable get plugin.
package var_get

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run retrieves a variable from the workflow store.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
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
