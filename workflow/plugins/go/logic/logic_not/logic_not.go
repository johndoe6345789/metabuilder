// Package logic_not provides a workflow plugin for logical NOT operations.
package logic_not

// LogicNot implements the NodeExecutor interface for logical NOT operations.
type LogicNot struct {
	NodeType    string
	Category    string
	Description string
}

// NewLogicNot creates a new LogicNot instance.
func NewLogicNot() *LogicNot {
	return &LogicNot{
		NodeType:    "logic.not",
		Category:    "logic",
		Description: "Perform logical NOT on a boolean value",
	}
}

// Execute runs the plugin logic.
func (p *LogicNot) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	value := inputs["value"]
	return map[string]interface{}{"result": !toBool(value)}
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
