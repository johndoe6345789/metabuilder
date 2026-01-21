// Package string_lower provides the lowercase string plugin.
package string_lower

import (
	"strings"

	plugin "metabuilder/workflow/plugins/go"
)

// Run converts string to lowercase.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	str, ok := inputs["string"].(string)
	if !ok {
		return map[string]interface{}{"result": "", "error": "string is required"}, nil
	}

	return map[string]interface{}{"result": strings.ToLower(str)}, nil
}
