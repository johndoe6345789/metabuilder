// Package math_subtract provides the subtract numbers plugin.
package math_subtract

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run subtracts numbers from the first number.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	numbers, ok := inputs["numbers"].([]interface{})
	if !ok || len(numbers) == 0 {
		return map[string]interface{}{"result": 0, "error": "numbers must be a non-empty array"}, nil
	}

	result := toFloat64(numbers[0])
	for i := 1; i < len(numbers); i++ {
		result -= toFloat64(numbers[i])
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
