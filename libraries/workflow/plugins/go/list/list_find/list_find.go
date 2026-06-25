// Package list_find provides a workflow plugin for finding elements in lists.
package list_find

// ListFind implements the NodeExecutor interface for finding elements in lists.
type ListFind struct {
	NodeType    string
	Category    string
	Description string
}

// NewListFind creates a new ListFind instance.
func NewListFind() *ListFind {
	return &ListFind{
		NodeType:    "list.find",
		Category:    "list",
		Description: "Find first element matching a condition",
	}
}

// Execute runs the plugin logic.
// Inputs:
//   - list: the list to search
//   - key: (optional) the key to match in objects
//   - value: the value to match (or condition value)
//
// Returns:
//   - result: the first matching element or nil
//   - index: the index of the match or -1
func (p *ListFind) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	list, ok := inputs["list"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": nil, "index": -1}
	}

	value := inputs["value"]
	key, hasKey := inputs["key"].(string)

	for i, item := range list {
		if hasKey {
			// Search by key/value in objects
			if obj, ok := item.(map[string]interface{}); ok {
				if objVal, exists := obj[key]; exists && objVal == value {
					return map[string]interface{}{"result": item, "index": i}
				}
			}
		} else {
			// Direct value comparison
			if item == value {
				return map[string]interface{}{"result": item, "index": i}
			}
		}
	}

	return map[string]interface{}{"result": nil, "index": -1}
}
