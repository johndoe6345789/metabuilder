// Package string_upper provides the uppercase string plugin.
package string_upper

import (
	"strings"

	plugin "metabuilder/workflow/plugins/go"
)

// Run converts string to uppercase.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	str, ok := inputs["string"].(string)
	if !ok {
		return map[string]interface{}{"result": "", "error": "string is required"}, nil
	}

	return map[string]interface{}{"result": strings.ToUpper(str)}, nil
}
