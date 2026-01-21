// Package logic provides boolean logic workflow plugins.
package logic

import (
	plugin "metabuilder/workflow/plugins/go"
)

// LessThan checks if a < b.
func LessThan(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	a := toFloat(inputs["a"])
	b := toFloat(inputs["b"])

	return map[string]interface{}{"result": a < b}, nil
}
