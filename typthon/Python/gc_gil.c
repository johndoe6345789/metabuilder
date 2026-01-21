#include "Python.h"
#include "pycore_freelist.h"   // _TyObject_ClearFreeLists()

#ifndef Ty_GIL_DISABLED

/* Clear all free lists
 * All free lists are cleared during the collection of the highest generation.
 * Allocated items in the free list may keep a pymalloc arena occupied.
 * Clearing the free lists may give back memory to the OS earlier.
 */
void
_TyGC_ClearAllFreeLists(TyInterpreterState *interp)
{
    _TyObject_ClearFreeLists(&interp->object_state.freelists, 0);
}

#endif
