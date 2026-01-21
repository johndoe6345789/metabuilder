// Package convert_to_json provides the convert to JSON plugin.
package convert_to_json

import (
	"encoding/json"

	plugin "metabuilder/workflow/plugins/go"
)

// Run converts a value to JSON string.
func Run(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	value := inputs["value"]
	pretty := false
	if p, ok := inputs["pretty"].(bool); ok {
		pretty = p
	}

	var bytes []byte
	var err error

	if pretty {
		bytes, err = json.MarshalIndent(value, "", "  ")
	} else {
		bytes, err = json.Marshal(value)
	}

	if err != nil {
		return map[string]interface{}{"result": "", "error": err.Error()}, nil
	}

	return map[string]interface{}{"result": string(bytes)}, nil
}
