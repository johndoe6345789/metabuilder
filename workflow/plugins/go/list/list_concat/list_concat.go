// Package list_concat provides a workflow plugin for concatenating lists.
package list_concat

// ListConcat implements the NodeExecutor interface for concatenating lists.
type ListConcat struct {
	NodeType    string
	Category    string
	Description string
}

// NewListConcat creates a new ListConcat instance.
func NewListConcat() *ListConcat {
	return &ListConcat{
		NodeType:    "list.concat",
		Category:    "list",
		Description: "Concatenate multiple lists",
	}
}

// Execute runs the plugin logic.
func (p *ListConcat) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	lists, ok := inputs["lists"].([]interface{})
	if !ok {
		return map[string]interface{}{"result": []interface{}{}}
	}

	var result []interface{}
	for _, lst := range lists {
		if arr, ok := lst.([]interface{}); ok {
			result = append(result, arr...)
		}
	}

	return map[string]interface{}{"result": result}
}
