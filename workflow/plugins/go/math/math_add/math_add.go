// Package math_add provides the add numbers plugin.
package math_add

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run adds two or more numbers.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	numbers, ok := inputs["numbers"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": 0, "error": "numbers must be an array"}, nil
	}

	var sum float64
	for _, n := range numbers {
		switch v := n.(type) {
		case float64:
			sum += v
		case int:
			sum += float64(v)
		case int64:
			sum += float64(v)
		}
	}

	return map[string]interface{}{"result": sum}, nil
}
