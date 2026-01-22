// Package string_concat provides a workflow plugin for concatenating strings.
package string_concat

import (
	"fmt"
	"strings"
)

// StringConcat implements the NodeExecutor interface for concatenating strings.
type StringConcat struct {
	NodeType    string
	Category    string
	Description string
}

// NewStringConcat creates a new StringConcat instance.
func NewStringConcat() *StringConcat {
	return &StringConcat{
		NodeType:    "string.concat",
		Category:    "string",
		Description: "Concatenate multiple strings with optional separator",
	}
}

// Execute runs the plugin logic.
func (p *StringConcat) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	strs, ok := inputs["strings"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": "", "error": "strings must be an array"}
	}

	separator := ""
	if sep, ok := inputs["separator"].(string); ok {
		separator = sep
	}

	strList := make([]string, len(strs))
	for i, s := range strs {
		strList[i] = fmt.Sprintf("%v", s)
	}

	return map[string]interface{}{"result": strings.Join(strList, separator)}
}
