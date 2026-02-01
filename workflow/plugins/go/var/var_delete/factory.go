// Package var_delete provides factory for VarDelete plugin.
package var_delete

// Create returns a new VarDelete instance.
func Create() *VarDelete {
	return NewVarDelete()
}
