// Package var_set provides factory for VarSet plugin.
package var_set

// Create returns a new VarSet instance.
func Create() *VarSet {
	return NewVarSet()
}
