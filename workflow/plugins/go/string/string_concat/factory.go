// Package string_concat provides factory for StringConcat plugin.
package string_concat

// Create returns a new StringConcat instance.
func Create() *StringConcat {
	return NewStringConcat()
}
