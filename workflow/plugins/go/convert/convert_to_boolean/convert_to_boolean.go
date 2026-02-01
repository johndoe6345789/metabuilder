// Package convert_to_boolean provides a workflow plugin for converting values to booleans.
package convert_to_boolean

import (
	"strings"
)

// ConvertToBoolean implements the NodeExecutor interface for converting values to booleans.
type ConvertToBoolean struct {
	NodeType    string
	Category    string
	Description string
}

// NewConvertToBoolean creates a new ConvertToBoolean instance.
func NewConvertToBoolean() *ConvertToBoolean {
	return &ConvertToBoolean{
		NodeType:    "convert.to_boolean",
		Category:    "convert",
		Description: "Convert a value to boolean",
	}
}

// Execute runs the plugin logic.
func (p *ConvertToBoolean) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
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

	return map[string]interface{}{"result": result}
}
