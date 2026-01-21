// Package logic provides boolean logic workflow plugins.
package logic

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Or performs logical OR on boolean values.
func Or(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
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
