// Package string_replace provides factory for StringReplace plugin.
package string_replace

// Create returns a new StringReplace instance.
func Create() *StringReplace {
	return NewStringReplace()
}
