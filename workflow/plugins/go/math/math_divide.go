// Package math provides mathematical workflow plugins.
package math

import (
	"errors"

	plugin "metabuilder/workflow/plugins/go"
)

// Divide divides the first number by subsequent numbers.
func Divide(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	numbers, ok := inputs["numbers"].([]interface{})
	if !ok || len(numbers) < 2 {
		return map[string]interface{}{"result": 0, "error": "numbers must have at least 2 elements"}, nil
	}

	result := toFloat64(numbers[0])
	for i := 1; i < len(numbers); i++ {
		divisor := toFloat64(numbers[i])
		if divisor == 0 {
			return nil, errors.New("division by zero")
		}
		result /= divisor
	}

	return map[string]interface{}{"result": result}, nil
}
