// Package convert_parse_json provides factory for ConvertParseJson plugin.
package convert_parse_json

// Create returns a new ConvertParseJson instance.
func Create() *ConvertParseJson {
	return NewConvertParseJson()
}
