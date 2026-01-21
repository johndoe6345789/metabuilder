// Package convert_to_number provides the convert to number plugin.
package convert_to_number

import (
	"strconv"

	plugin "metabuilder/workflow/plugins/go"
)

// Run converts a value to number.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
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
			return map[string]interface{}{"result": 0, "error": "invalid number string"}, nil
		}
	case bool:
		if v {
			result = 1
		} else {
			result = 0
		}
	default:
		return map[string]interface{}{"result": 0, "error": "cannot convert to number"}, nil
	}

	return map[string]interface{}{"result": result}, nil
}
