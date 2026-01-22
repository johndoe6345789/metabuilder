// Package list_reverse provides a workflow plugin for reversing lists.
package list_reverse

// ListReverse implements the NodeExecutor interface for reversing lists.
type ListReverse struct {
	NodeType    string
	Category    string
	Description string
}

// NewListReverse creates a new ListReverse instance.
func NewListReverse() *ListReverse {
	return &ListReverse{
		NodeType:    "list.reverse",
		Category:    "list",
		Description: "Reverse a list",
	}
}

// Execute runs the plugin logic.
func (p *ListReverse) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	list, ok := inputs["list"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}
	}

	result := make([]interface{}, len(list))
	for i, v := range list {
		result[len(list)-1-i] = v
	}

	return map[string]interface{}{"result": result}
}
