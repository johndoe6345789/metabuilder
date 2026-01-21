// Package logic_equals provides the equality check plugin.
package logic_equals

import (
	"reflect"

	plugin "metabuilder/workflow/plugins/go"
)

// Run checks if two values are equal.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	a := inputs["a"]
	b := inputs["b"]

	result := reflect.DeepEqual(a, b)
	return map[string]interface{}{"result": result}, nil
}
