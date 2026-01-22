// Package var_get provides factory for VarGet plugin.
package var_get

// Create returns a new VarGet instance.
func Create() *VarGet {
	return NewVarGet()
}
