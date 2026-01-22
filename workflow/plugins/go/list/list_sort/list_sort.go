// Package list_sort provides a workflow plugin for sorting lists.
package list_sort

import (
	"sort"
)

// ListSort implements the NodeExecutor interface for sorting lists.
type ListSort struct {
	NodeType    string
	Category    string
	Description string
}

// NewListSort creates a new ListSort instance.
func NewListSort() *ListSort {
	return &ListSort{
		NodeType:    "list.sort",
		Category:    "list",
		Description: "Sort a list of values",
	}
}

// Execute runs the plugin logic.
// Inputs:
//   - list: the list to sort
//   - key: (optional) the key to sort by for objects
//   - descending: (optional) sort in descending order (default: false)
//
// Returns:
//   - result: the sorted list
func (p *ListSort) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	list, ok := inputs["list"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}
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

	return map[string]interface{}{"result": result}
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
