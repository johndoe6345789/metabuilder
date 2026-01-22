// Package convert_to_boolean provides factory for ConvertToBoolean plugin.
package convert_to_boolean

// Create returns a new ConvertToBoolean instance.
func Create() *ConvertToBoolean {
	return NewConvertToBoolean()
}
