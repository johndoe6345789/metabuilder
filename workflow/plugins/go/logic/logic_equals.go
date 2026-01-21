// Package logic provides boolean logic workflow plugins.
package logic

import (
	"reflect"

	plugin "metabuilder/workflow/plugins/go"
)

// Equals checks if two values are equal.
func Equals(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	a := inputs["a"]
	b := inputs["b"]

	result := reflect.DeepEqual(a, b)
	return map[string]interface{}{"result": result}, nil
}
