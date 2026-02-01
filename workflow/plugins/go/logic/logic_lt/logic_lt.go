// Package logic_lt provides a workflow plugin for less than comparisons.
package logic_lt

// LogicLt implements the NodeExecutor interface for less than comparisons.
type LogicLt struct {
	NodeType    string
	Category    string
	Description string
}

// NewLogicLt creates a new LogicLt instance.
func NewLogicLt() *LogicLt {
	return &LogicLt{
		NodeType:    "logic.lt",
		Category:    "logic",
		Description: "Check if a is less than b",
	}
}

// Execute runs the plugin logic.
func (p *LogicLt) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	a := toFloat(inputs["a"])
	b := toFloat(inputs["b"])

	return map[string]interface{}{"result": a < b}
}

func toFloat(v interface{}) float64 {
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
