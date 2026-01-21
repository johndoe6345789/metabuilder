// Package logic_or provides the logical OR plugin.
package logic_or

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Run performs logical OR on boolean values.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	values, ok := inputs["values"].([]interface{})
	if !ok || len(values) == 0 {
		return map[string]interface{}{"result": false}, nil
	}

	for _, v := range values {
		if toBool(v) {
			return map[string]interface{}{"result": true}, nil
		}
	}

	return map[string]interface{}{"result": false}, nil
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
