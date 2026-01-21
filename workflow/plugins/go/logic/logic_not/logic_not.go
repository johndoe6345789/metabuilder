// Package logic_not provides the logical NOT plugin.
package logic_not

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run performs logical NOT on a boolean value.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	value := inputs["value"]
	return map[string]interface{}{"result": !toBool(value)}, nil
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
