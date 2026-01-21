// Package string provides string manipulation workflow plugins.
package string

import (
	"strings"

	plugin "metabuilder/workflow/plugins/go"
)

// Replace replaces occurrences in a string.
func Replace(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	str, ok := inputs["string"].(string)
	if !ok {
		return map[string]interface{}{"result": "", "error": "string is required"}, nil
	}

	old, _ := inputs["old"].(string)
	new, _ := inputs["new"].(string)

	// Default to replace all (-1)
	count := -1
	if n, ok := inputs["count"].(int); ok {
		count = n
	}

	result := strings.Replace(str, old, new, count)
	return map[string]interface{}{"result": result}, nil
}
