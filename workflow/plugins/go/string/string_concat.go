// Package string provides string manipulation workflow plugins.
package string

import (
	"fmt"
	"strings"

	plugin "metabuilder/workflow/plugins/go"
)

// Concat concatenates multiple strings with optional separator.
func Concat(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	strs, ok := inputs["strings"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": "", "error": "strings must be an array"}, nil
	}

	separator := ""
	if sep, ok := inputs["separator"].(string); ok {
		separator = sep
	}

	strList := make([]string, len(strs))
	for i, s := range strs {
		strList[i] = fmt.Sprintf("%v", s)
	}

	return map[string]interface{}{"result": strings.Join(strList, separator)}, nil
}
