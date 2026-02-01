// Package math_divide provides a workflow plugin for dividing numbers.
package math_divide

import (
	"errors"
)

// MathDivide implements the NodeExecutor interface for dividing numbers.
type MathDivide struct {
	NodeType    string
	Category    string
	Description string
}

// NewMathDivide creates a new MathDivide instance.
func NewMathDivide() *MathDivide {
	return &MathDivide{
		NodeType:    "math.divide",
		Category:    "math",
		Description: "Divide the first number by subsequent numbers",
	}
}

// Execute runs the plugin logic.
func (p *MathDivide) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	numbers, ok := inputs["numbers"].([]interface{})
	if !ok || len(numbers) < 2 {
		return map[string]interface{}{"result": 0, "error": "numbers must have at least 2 elements"}
	}

	result := toFloat64(numbers[0])
	for i := 1; i < len(numbers); i++ {
		divisor := toFloat64(numbers[i])
		if divisor == 0 {
			return map[string]interface{}{"result": 0, "error": errors.New("division by zero").Error()}
		}
		result /= divisor
	}

	return map[string]interface{}{"result": result}
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
