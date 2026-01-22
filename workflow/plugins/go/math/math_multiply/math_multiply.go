// Package math_multiply provides a workflow plugin for multiplying numbers.
package math_multiply

// MathMultiply implements the NodeExecutor interface for multiplying numbers.
type MathMultiply struct {
	NodeType    string
	Category    string
	Description string
}

// NewMathMultiply creates a new MathMultiply instance.
func NewMathMultiply() *MathMultiply {
	return &MathMultiply{
		NodeType:    "math.multiply",
		Category:    "math",
		Description: "Multiply two or more numbers",
	}
}

// Execute runs the plugin logic.
func (p *MathMultiply) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	numbers, ok := inputs["numbers"].([]interface{})
	if !ok || len(numbers) == 0 {
		return map[string]interface{}{"result": 0, "error": "numbers must be a non-empty array"}
	}

	result := 1.0
	for _, n := range numbers {
		result *= toFloat64(n)
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
