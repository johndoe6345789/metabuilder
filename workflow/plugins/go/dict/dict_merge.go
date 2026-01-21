// Package dict provides dictionary/map manipulation workflow plugins.
package dict

import (
	plugin "metabuilder/workflow/plugins/go"
)

// Merge combines multiple dictionaries into one.
// Later dictionaries override earlier ones for duplicate keys.
// Inputs:
//   - dicts: list of dictionaries to merge
//   - deep: (optional) perform deep merge for nested objects (default: false)
// Returns:
//   - result: the merged dictionary
func Merge(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	dicts, ok := inputs["dicts"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": map[string]interface{}{}}, nil
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

	return map[string]interface{}{"result": result}, nil
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
		// Either key doesn't exist in dst, or types don't match - just copy
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
