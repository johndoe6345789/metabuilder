// Package convert_to_string provides a workflow plugin for converting values to strings.
package convert_to_string

import (
	"encoding/json"
	"fmt"
)

// ConvertToString implements the NodeExecutor interface for converting values to strings.
type ConvertToString struct {
	NodeType    string
	Category    string
	Description string
}

// NewConvertToString creates a new ConvertToString instance.
func NewConvertToString() *ConvertToString {
	return &ConvertToString{
		NodeType:    "convert.to_string",
		Category:    "convert",
		Description: "Convert a value to string",
	}
}

// Execute runs the plugin logic.
func (p *ConvertToString) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	value := inputs["value"]

	var result string
	switch v := value.(type) {
	case string:
		result = v
	case []byte:
		result = string(v)
	case nil:
		result = ""
	default:
		// Try JSON for complex types
		if bytes, err := json.Marshal(v); err == nil {
			result = string(bytes)
		} else {
			result = fmt.Sprintf("%v", v)
		}
	}

	return map[string]interface{}{"result": result}
}
