// Package convert_to_number provides a workflow plugin for converting values to numbers.
package convert_to_number

import (
	"strconv"
)

// ConvertToNumber implements the NodeExecutor interface for converting values to numbers.
type ConvertToNumber struct {
	NodeType    string
	Category    string
	Description string
}

// NewConvertToNumber creates a new ConvertToNumber instance.
func NewConvertToNumber() *ConvertToNumber {
	return &ConvertToNumber{
		NodeType:    "convert.to_number",
		Category:    "convert",
		Description: "Convert a value to number",
	}
}

// Execute runs the plugin logic.
func (p *ConvertToNumber) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	value := inputs["value"]

	var result float64
	var err error

	switch v := value.(type) {
	case float64:
		result = v
	case int:
		result = float64(v)
	case int64:
		result = float64(v)
	case string:
		result, err = strconv.ParseFloat(v, 64)
		if err != nil {
			return map[string]interface{}{"result": 0, "error": "invalid number string"}
		}
	case bool:
		if v {
			result = 1
		} else {
			result = 0
		}
	default:
		return map[string]interface{}{"result": 0, "error": "cannot convert to number"}
	}

	return map[string]interface{}{"result": result}
}
