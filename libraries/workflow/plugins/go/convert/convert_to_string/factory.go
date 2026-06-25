// Package convert_to_string provides factory for ConvertToString plugin.
package convert_to_string

// Create returns a new ConvertToString instance.
func Create() *ConvertToString {
	return NewConvertToString()
}
