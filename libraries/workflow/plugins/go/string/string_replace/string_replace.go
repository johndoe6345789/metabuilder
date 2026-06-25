// Package string_replace provides a workflow plugin for replacing strings.
package string_replace

import (
	"strings"
)

// StringReplace implements the NodeExecutor interface for replacing strings.
type StringReplace struct {
	NodeType    string
	Category    string
	Description string
}

// NewStringReplace creates a new StringReplace instance.
func NewStringReplace() *StringReplace {
	return &StringReplace{
		NodeType:    "string.replace",
		Category:    "string",
		Description: "Replace occurrences in a string",
	}
}

// Execute runs the plugin logic.
func (p *StringReplace) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	str, ok := inputs["string"].(string)
	if !ok {
		return map[string]interface{}{"result": "", "error": "string is required"}
	}

	old, _ := inputs["old"].(string)
	new, _ := inputs["new"].(string)

	// Default to replace all (-1)
	count := -1
	if n, ok := inputs["count"].(int); ok {
		count = n
	}

	result := strings.Replace(str, old, new, count)
	return map[string]interface{}{"result": result}
}
