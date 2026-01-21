// Package convert provides type conversion workflow plugins.
package convert

import (
	"strings"

	plugin "metabuilder/workflow/plugins/go"
)

// ToBoolean converts a value to boolean.
func ToBoolean(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	value := inputs["value"]

	var result bool

	switch v := value.(type) {
	case bool:
		result = v
	case int:
		result = v != 0
	case int64:
		result = v != 0
	case float64:
		result = v != 0
	case string:
		lower := strings.ToLower(strings.TrimSpace(v))
		result = lower == "true" || lower == "1" || lower == "yes"
	case nil:
		result = false
	default:
		result = true // Non-nil values are truthy
	}

	return map[string]interface{}{"result": result}, nil
}
