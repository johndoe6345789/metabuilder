// Package math_multiply provides the multiply numbers plugin.
package math_multiply

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run multiplies two or more numbers.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
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
