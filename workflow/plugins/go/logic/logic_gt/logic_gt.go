// Package logic_gt provides the greater than comparison plugin.
package logic_gt

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run checks if a > b.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	a := toFloat(inputs["a"])
	b := toFloat(inputs["b"])

	return map[string]interface{}{"result": a > b}, nil
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
