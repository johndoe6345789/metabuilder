// Package list_slice provides a workflow plugin for slicing lists.
package list_slice

// ListSlice implements the NodeExecutor interface for slicing lists.
type ListSlice struct {
	NodeType    string
	Category    string
	Description string
}

// NewListSlice creates a new ListSlice instance.
func NewListSlice() *ListSlice {
	return &ListSlice{
		NodeType:    "list.slice",
		Category:    "list",
		Description: "Extract a portion of a list",
	}
}

// Execute runs the plugin logic.
func (p *ListSlice) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	list, ok := inputs["list"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}
	}

	start := 0
	if s, ok := inputs["start"].(int); ok {
		start = s
	}

	end := len(list)
	if e, ok := inputs["end"].(int); ok {
		end = e
	}

	// Handle negative indices
	if start < 0 {
		start = len(list) + start
	}
	if end < 0 {
		end = len(list) + end
	}

	// Bounds checking
	if start < 0 {
		start = 0
	}
	if end > len(list) {
		end = len(list)
	}
	if start > end {
		start = end
	}

	return map[string]interface{}{"result": list[start:end]}
}
