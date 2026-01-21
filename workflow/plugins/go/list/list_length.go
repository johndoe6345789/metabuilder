// Package list provides list manipulation workflow plugins.
package list

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Length returns the length of a list.
func Length(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	list, ok := inputs["list"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": 0}, nil
	}

	return map[string]interface{}{"result": len(list)}, nil
}
