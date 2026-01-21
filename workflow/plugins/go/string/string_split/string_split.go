// Package string_split provides the split string plugin.
package string_split

import (
	"strings"

	plugin "metabuilder/workflow/plugins/go"
)

// Run splits a string by separator.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	str, ok := inputs["string"].(string)
	if !ok {
		return map[string]interface{}{"result": []string{}, "error": "string is required"}, nil
	}

	separator := ""
	if sep, ok := inputs["separator"].(string); ok {
		separator = sep
	}

	var result []string
	if separator == "" {
		// Split into characters
		for _, r := range str {
			result = append(result, string(r))
		}
	} else {
		result = strings.Split(str, separator)
	}

	return map[string]interface{}{"result": result}, nil
}
