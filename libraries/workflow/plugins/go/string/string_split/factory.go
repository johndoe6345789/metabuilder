// Package string_split provides factory for StringSplit plugin.
package string_split

// Create returns a new StringSplit instance.
func Create() *StringSplit {
	return NewStringSplit()
}
