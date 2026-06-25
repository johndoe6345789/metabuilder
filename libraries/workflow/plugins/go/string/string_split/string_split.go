// Package string_split provides a workflow plugin for splitting strings.
package string_split

import (
	"strings"
)

// StringSplit implements the NodeExecutor interface for splitting strings.
type StringSplit struct {
	NodeType    string
	Category    string
	Description string
}

// NewStringSplit creates a new StringSplit instance.
func NewStringSplit() *StringSplit {
	return &StringSplit{
		NodeType:    "string.split",
		Category:    "string",
		Description: "Split a string by separator",
	}
}

// Execute runs the plugin logic.
func (p *StringSplit) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	str, ok := inputs["string"].(string)
	if !ok {
		return map[string]interface{}{"result": []string{}, "error": "string is required"}
	}

	separator := ""
	if sep, ok := inputs["separator"].(string); ok {
		separator = sep
	}

	var result []string
	if separator == "" {
		// Split into characters
		for _, r := range str {
			result = append(result, string(r))
		}
	} else {
		result = strings.Split(str, separator)
	}

	return map[string]interface{}{"result": result}
}
