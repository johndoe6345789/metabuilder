// Package string_upper provides a workflow plugin for uppercasing strings.
package string_upper

import (
	"strings"
)

// StringUpper implements the NodeExecutor interface for uppercasing strings.
type StringUpper struct {
	NodeType    string
	Category    string
	Description string
}

// NewStringUpper creates a new StringUpper instance.
func NewStringUpper() *StringUpper {
	return &StringUpper{
		NodeType:    "string.upper",
		Category:    "string",
		Description: "Convert string to uppercase",
	}
}

// Execute runs the plugin logic.
func (p *StringUpper) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	str, ok := inputs["string"].(string)
	if !ok {
		return map[string]interface{}{"result": "", "error": "string is required"}
	}

	return map[string]interface{}{"result": strings.ToUpper(str)}
}
