// Package string_lower provides a workflow plugin for lowercasing strings.
package string_lower

import (
	"strings"
)

// StringLower implements the NodeExecutor interface for lowercasing strings.
type StringLower struct {
	NodeType    string
	Category    string
	Description string
}

// NewStringLower creates a new StringLower instance.
func NewStringLower() *StringLower {
	return &StringLower{
		NodeType:    "string.lower",
		Category:    "string",
		Description: "Convert string to lowercase",
	}
}

// Execute runs the plugin logic.
func (p *StringLower) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	str, ok := inputs["string"].(string)
	if !ok {
		return map[string]interface{}{"result": "", "error": "string is required"}
	}

	return map[string]interface{}{"result": strings.ToLower(str)}
}
