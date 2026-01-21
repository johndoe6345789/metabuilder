// Package convert_to_string provides the convert to string plugin.
package convert_to_string

import (
	"encoding/json"
	"fmt"

	plugin "metabuilder/workflow/plugins/go"
)

// Run converts a value to string.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	value := inputs["value"]

	var result string
	switch v := value.(type) {
	case string:
		result = v
	case []byte:
		result = string(v)
	case nil:
		result = ""
	default:
		// Try JSON for complex types
		if bytes, err := json.Marshal(v); err == nil {
			result = string(bytes)
		} else {
			result = fmt.Sprintf("%v", v)
		}
	}

	return map[string]interface{}{"result": result}, nil
}
