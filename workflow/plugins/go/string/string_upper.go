// Package string provides string manipulation workflow plugins.
package string

import (
	"strings"

	plugin "metabuilder/workflow/plugins/go"
)

// Upper converts string to uppercase.
func Upper(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	str, ok := inputs["string"].(string)
	if !ok {
		return map[string]interface{}{"result": "", "error": "string is required"}, nil
	}

	return map[string]interface{}{"result": strings.ToUpper(str)}, nil
}
