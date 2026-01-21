// Package convert provides type conversion workflow plugins.
package convert

import (
	"encoding/json"

	plugin "metabuilder/workflow/plugins/go"
)

// ParseJSON parses a JSON string to object.
func ParseJSON(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	str, ok := inputs["string"].(string)
	if !ok {
		return map[string]interface{}{"result": nil, "error": "string is required"}, nil
	}

	var result interface{}
	if err := json.Unmarshal([]byte(str), &result); err != nil {
		return map[string]interface{}{"result": nil, "error": err.Error()}, nil
	}

	return map[string]interface{}{"result": result}, nil
}
