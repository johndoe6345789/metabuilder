// Package logic provides boolean logic workflow plugins.
package logic

import (
	plugin "metabuilder/workflow/plugins/go"
)

// And performs logical AND on boolean values.
func And(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	values, ok := inputs["values"].([]interface{})
	if !ok || len(values) == 0 {
		return map[string]interface{}{"result": false}, nil
	}

	for _, v := range values {
		if !toBool(v) {
			return map[string]interface{}{"result": false}, nil
		}
	}

	return map[string]interface{}{"result": true}, nil
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
