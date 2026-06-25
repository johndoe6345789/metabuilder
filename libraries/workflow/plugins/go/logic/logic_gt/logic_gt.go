// Package logic_gt provides a workflow plugin for greater than comparisons.
package logic_gt

// LogicGt implements the NodeExecutor interface for greater than comparisons.
type LogicGt struct {
	NodeType    string
	Category    string
	Description string
}

// NewLogicGt creates a new LogicGt instance.
func NewLogicGt() *LogicGt {
	return &LogicGt{
		NodeType:    "logic.gt",
		Category:    "logic",
		Description: "Check if a is greater than b",
	}
}

// Execute runs the plugin logic.
func (p *LogicGt) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	a := toFloat(inputs["a"])
	b := toFloat(inputs["b"])

	return map[string]interface{}{"result": a > b}
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
