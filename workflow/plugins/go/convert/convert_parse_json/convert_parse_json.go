// Package convert_parse_json provides a workflow plugin for parsing JSON strings.
package convert_parse_json

import (
	"encoding/json"
)

// ConvertParseJson implements the NodeExecutor interface for parsing JSON strings.
type ConvertParseJson struct {
	NodeType    string
	Category    string
	Description string
}

// NewConvertParseJson creates a new ConvertParseJson instance.
func NewConvertParseJson() *ConvertParseJson {
	return &ConvertParseJson{
		NodeType:    "convert.parse_json",
		Category:    "convert",
		Description: "Parse a JSON string to object",
	}
}

// Execute runs the plugin logic.
func (p *ConvertParseJson) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	str, ok := inputs["string"].(string)
	if !ok {
		return map[string]interface{}{"result": nil, "error": "string is required"}
	}

	var result interface{}
	if err := json.Unmarshal([]byte(str), &result); err != nil {
		return map[string]interface{}{"result": nil, "error": err.Error()}
	}

	return map[string]interface{}{"result": result}
}
