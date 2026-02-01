// Package dict_merge provides a workflow plugin for merging dictionaries.
package dict_merge

// DictMerge implements the NodeExecutor interface for merging dictionaries.
type DictMerge struct {
	NodeType    string
	Category    string
	Description string
}

// NewDictMerge creates a new DictMerge instance.
func NewDictMerge() *DictMerge {
	return &DictMerge{
		NodeType:    "dict.merge",
		Category:    "dict",
		Description: "Merge multiple dictionaries into one",
	}
}

// Execute runs the plugin logic.
// Combines multiple dictionaries into one.
// Later dictionaries override earlier ones for duplicate keys.
// Inputs:
//   - dicts: list of dictionaries to merge
//   - deep: (optional) perform deep merge for nested objects (default: false)
//
// Returns:
//   - result: the merged dictionary
func (p *DictMerge) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	dicts, ok := inputs["dicts"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": map[string]interface{}{}}
	}

	deep := false
	if d, ok := inputs["deep"].(bool); ok {
		deep = d
	}

	result := make(map[string]interface{})

	for _, item := range dicts {
		dict, ok := item.(map[string]interface{})
		if !ok {
			continue
		}

		if deep {
			deepMerge(result, dict)
		} else {
			shallowMerge(result, dict)
		}
	}

	return map[string]interface{}{"result": result}
}

// shallowMerge copies all keys from src to dst, overwriting existing keys.
func shallowMerge(dst, src map[string]interface{}) {
	for k, v := range src {
		dst[k] = v
	}
}

// deepMerge recursively merges src into dst.
func deepMerge(dst, src map[string]interface{}) {
	for k, srcVal := range src {
		if dstVal, exists := dst[k]; exists {
			// Both have this key - check if both are maps
			srcMap, srcIsMap := srcVal.(map[string]interface{})
			dstMap, dstIsMap := dstVal.(map[string]interface{})

			if srcIsMap && dstIsMap {
				// Both are maps - merge recursively
				deepMerge(dstMap, srcMap)
				continue
			}
		}
		// Either key does not exist in dst, or types do not match - just copy
		dst[k] = deepCopyValue(srcVal)
	}
}

// deepCopyValue creates a deep copy of a value.
func deepCopyValue(v interface{}) interface{} {
	switch val := v.(type) {
	case map[string]interface{}:
		result := make(map[string]interface{}, len(val))
		for k, v := range val {
			result[k] = deepCopyValue(v)
		}
		return result
	case []interface{}:
		result := make([]interface{}, len(val))
		for i, v := range val {
			result[i] = deepCopyValue(v)
		}
		return result
	default:
		// Primitive types are copied by value
		return v
	}
}
