// Package logic_and provides a workflow plugin for logical AND operations.
package logic_and

// LogicAnd implements the NodeExecutor interface for logical AND operations.
type LogicAnd struct {
	NodeType    string
	Category    string
	Description string
}

// NewLogicAnd creates a new LogicAnd instance.
func NewLogicAnd() *LogicAnd {
	return &LogicAnd{
		NodeType:    "logic.and",
		Category:    "logic",
		Description: "Perform logical AND on boolean values",
	}
}

// Execute runs the plugin logic.
func (p *LogicAnd) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	values, ok := inputs["values"].([]interface{})
	if !ok || len(values) == 0 {
		return map[string]interface{}{"result": false}
	}

	for _, v := range values {
		if !toBool(v) {
			return map[string]interface{}{"result": false}
		}
	}

	return map[string]interface{}{"result": true}
}

func toBool(v interface{}) bool {
	switch b := v.(type) {
	case bool:
		return b
	case int:
		return b != 0
	case float64:
		return b != 0
	case string:
		return b != ""
	default:
		return v != nil
	}
}
