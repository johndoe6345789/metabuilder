// Package logic_equals provides a workflow plugin for equality checks.
package logic_equals

import (
	"reflect"
)

// LogicEquals implements the NodeExecutor interface for equality checks.
type LogicEquals struct {
	NodeType    string
	Category    string
	Description string
}

// NewLogicEquals creates a new LogicEquals instance.
func NewLogicEquals() *LogicEquals {
	return &LogicEquals{
		NodeType:    "logic.equals",
		Category:    "logic",
		Description: "Check if two values are equal",
	}
}

// Execute runs the plugin logic.
func (p *LogicEquals) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	a := inputs["a"]
	b := inputs["b"]

	result := reflect.DeepEqual(a, b)
	return map[string]interface{}{"result": result}
}
