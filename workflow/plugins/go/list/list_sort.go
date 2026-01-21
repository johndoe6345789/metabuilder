// Package list provides list manipulation workflow plugins.
package list

import (
	"sort"

	plugin "metabuilder/workflow/plugins/go"
)

// Sort sorts a list of values.
// Inputs:
//   - list: the list to sort
//   - key: (optional) the key to sort by for objects
//   - descending: (optional) sort in descending order (default: false)
// Returns:
//   - result: the sorted list
func Sort(runtime *plugin.Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	list, ok := inputs["list"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}, nil
	}

	// Make a copy to avoid mutating the original
	result := make([]interface{}, len(list))
	copy(result, list)

	descending := false
	if d, ok := inputs["descending"].(bool); ok {
		descending = d
	}

	key, hasKey := inputs["key"].(string)

	sort.SliceStable(result, func(i, j int) bool {
		var a, b interface{}

		if hasKey {
			// Extract values by key for objects
			if objA, ok := result[i].(map[string]interface{}); ok {
				a = objA[key]
			}
			if objB, ok := result[j].(map[string]interface{}); ok {
				b = objB[key]
			}
		} else {
			a = result[i]
			b = result[j]
		}

		less := compareLess(a, b)
		if descending {
			return !less
		}
		return less
	})

	return map[string]interface{}{"result": result}, nil
}

// compareLess compares two values and returns true if a < b.
func compareLess(a, b interface{}) bool {
	// Handle numeric comparisons
	aNum, aIsNum := toFloat64(a)
	bNum, bIsNum := toFloat64(b)
	if aIsNum && bIsNum {
		return aNum < bNum
	}

	// Handle string comparisons
	aStr, aIsStr := a.(string)
	bStr, bIsStr := b.(string)
	if aIsStr && bIsStr {
		return aStr < bStr
	}

	// Default: keep original order
	return false
}

// toFloat64 converts various numeric types to float64.
func toFloat64(v interface{}) (float64, bool) {
	switch n := v.(type) {
	case float64:
		return n, true
	case float32:
		return float64(n), true
	case int:
		return float64(n), true
	case int64:
		return float64(n), true
	case int32:
		return float64(n), true
	default:
		return 0, false
	}
}
