// Package math_divide provides the divide numbers plugin.
package math_divide

import (
	"errors"

	plugin "metabuilder/workflow/plugins/go"
)

// Run divides the first number by subsequent numbers.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
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

func toFloat64(v interface{}) float64 {
	switch n := v.(type) {
	case float64:
		return n
	case int:
		return float64(n)
	case int64:
		return float64(n)
	default:
		return 0
	}
}
