// Package list_length provides a workflow plugin for getting list length.
package list_length

// ListLength implements the NodeExecutor interface for getting list length.
type ListLength struct {
	NodeType    string
	Category    string
	Description string
}

// NewListLength creates a new ListLength instance.
func NewListLength() *ListLength {
	return &ListLength{
		NodeType:    "list.length",
		Category:    "list",
		Description: "Get the length of a list",
	}
}

// Execute runs the plugin logic.
func (p *ListLength) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	list, ok := inputs["list"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": 0}
	}

	return map[string]interface{}{"result": len(list)}
}
