// Package convert_to_json provides factory for ConvertToJson plugin.
package convert_to_json

// Create returns a new ConvertToJson instance.
func Create() *ConvertToJson {
	return NewConvertToJson()
}
