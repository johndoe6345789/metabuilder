// Package convert_to_number provides factory for ConvertToNumber plugin.
package convert_to_number

// Create returns a new ConvertToNumber instance.
func Create() *ConvertToNumber {
	return NewConvertToNumber()
}
