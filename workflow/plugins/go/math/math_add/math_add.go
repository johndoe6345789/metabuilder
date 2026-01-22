// Package math_add provides a workflow plugin for adding numbers.
package math_add

// MathAdd implements the NodeExecutor interface for adding numbers.
type MathAdd struct {
	NodeType    string
	Category    string
	Description string
}

// NewMathAdd creates a new MathAdd instance.
func NewMathAdd() *MathAdd {
	return &MathAdd{
		NodeType:    "math.add",
		Category:    "math",
		Description: "Add two or more numbers",
	}
}

// Execute runs the plugin logic.
func (p *MathAdd) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	numbers, ok := inputs["numbers"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": 0, "error": "numbers must be an array"}
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

	return map[string]interface{}{"result": sum}
}
