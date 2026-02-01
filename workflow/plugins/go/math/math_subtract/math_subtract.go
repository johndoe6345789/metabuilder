// Package math_subtract provides a workflow plugin for subtracting numbers.
package math_subtract

// MathSubtract implements the NodeExecutor interface for subtracting numbers.
type MathSubtract struct {
	NodeType    string
	Category    string
	Description string
}

// NewMathSubtract creates a new MathSubtract instance.
func NewMathSubtract() *MathSubtract {
	return &MathSubtract{
		NodeType:    "math.subtract",
		Category:    "math",
		Description: "Subtract numbers from the first number",
	}
}

// Execute runs the plugin logic.
func (p *MathSubtract) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	numbers, ok := inputs["numbers"].([]interface{})
	if !ok || len(numbers) == 0 {
		return map[string]interface{}{"result": 0, "error": "numbers must be a non-empty array"}
	}

	result := toFloat64(numbers[0])
	for i := 1; i < len(numbers); i++ {
		result -= toFloat64(numbers[i])
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
