// Package math provides mathematical workflow plugins.
package math

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Multiply multiplies two or more numbers.
func Multiply(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	numbers, ok := inputs["numbers"].([]interface{})
	if !ok || len(numbers) == 0 {
		return map[string]interface{}{"result": 0, "error": "numbers must be a non-empty array"}, nil
	}

	result := 1.0
	for _, n := range numbers {
		result *= toFloat64(n)
	}

	return map[string]interface{}{"result": result}, nil
}
