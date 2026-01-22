// Package logic_or provides a workflow plugin for logical OR operations.
package logic_or

// LogicOr implements the NodeExecutor interface for logical OR operations.
type LogicOr struct {
	NodeType    string
	Category    string
	Description string
}

// NewLogicOr creates a new LogicOr instance.
func NewLogicOr() *LogicOr {
	return &LogicOr{
		NodeType:    "logic.or",
		Category:    "logic",
		Description: "Perform logical OR on boolean values",
	}
}

// Execute runs the plugin logic.
func (p *LogicOr) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	values, ok := inputs["values"].([]interface{})
	if !ok || len(values) == 0 {
		return map[string]interface{}{"result": false}
	}

	for _, v := range values {
		if toBool(v) {
			return map[string]interface{}{"result": true}
		}
	}

	return map[string]interface{}{"result": false}
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
