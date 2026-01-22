// Package math_add provides factory for MathAdd plugin.
package math_add

// Create returns a new MathAdd instance.
func Create() *MathAdd {
	return NewMathAdd()
}
