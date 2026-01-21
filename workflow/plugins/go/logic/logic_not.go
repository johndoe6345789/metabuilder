// Package logic provides boolean logic workflow plugins.
package logic

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Not performs logical NOT on a boolean value.
func Not(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	value := inputs["value"]
	return map[string]interface{}{"result": !toBool(value)}, nil
}
