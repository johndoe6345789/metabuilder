// Package convert_to_json provides a workflow plugin for converting values to JSON.
package convert_to_json

import (
	"encoding/json"
)

// ConvertToJson implements the NodeExecutor interface for converting values to JSON.
type ConvertToJson struct {
	NodeType    string
	Category    string
	Description string
}

// NewConvertToJson creates a new ConvertToJson instance.
func NewConvertToJson() *ConvertToJson {
	return &ConvertToJson{
		NodeType:    "convert.to_json",
		Category:    "convert",
		Description: "Convert a value to JSON string",
	}
}

// Execute runs the plugin logic.
func (p *ConvertToJson) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	value := inputs["value"]
	pretty := false
	if p, ok := inputs["pretty"].(bool); ok {
		pretty = p
	}

	var bytes []byte
	var err error

	if pretty {
		bytes, err = json.MarshalIndent(value, "", "  ")
	} else {
		bytes, err = json.Marshal(value)
	}

	if err != nil {
		return map[string]interface{}{"result": "", "error": err.Error()}
	}

	return map[string]interface{}{"result": string(bytes)}
}
