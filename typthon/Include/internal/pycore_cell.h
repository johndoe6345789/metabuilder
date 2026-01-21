#ifndef Ty_INTERNAL_CELL_H
#define Ty_INTERNAL_CELL_H

#include "pycore_critical_section.h"
#include "pycore_object.h"
#include "pycore_stackref.h"

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

// Sets the cell contents to `value` and return previous contents. Steals a
// reference to `value`.
static inline TyObject *
TyCell_SwapTakeRef(PyCellObject *cell, TyObject *value)
{
    TyObject *old_value;
    Ty_BEGIN_CRITICAL_SECTION(cell);
    old_value = cell->ob_ref;
    FT_ATOMIC_STORE_PTR_RELEASE(cell->ob_ref, value);
    Ty_END_CRITICAL_SECTION();
    return old_value;
}

static inline void
TyCell_SetTakeRef(PyCellObject *cell, TyObject *value)
{
    TyObject *old_value = TyCell_SwapTakeRef(cell, value);
    Ty_XDECREF(old_value);
}

// Gets the cell contents. Returns a new reference.
static inline TyObject *
TyCell_GetRef(PyCellObject *cell)
{
    TyObject *res;
    Ty_BEGIN_CRITICAL_SECTION(cell);
#ifdef Ty_GIL_DISABLED
    res = _Ty_XNewRefWithLock(cell->ob_ref);
#else
    res = Ty_XNewRef(cell->ob_ref);
#endif
    Ty_END_CRITICAL_SECTION();
    return res;
}

static inline _PyStackRef
_PyCell_GetStackRef(PyCellObject *cell)
{
    TyObject *value;
#ifdef Ty_GIL_DISABLED
    value = _Ty_atomic_load_ptr(&cell->ob_ref);
    if (value == NULL) {
        return PyStackRef_NULL;
    }
    _PyStackRef ref;
    if (_Ty_TryIncrefCompareStackRef(&cell->ob_ref, value, &ref)) {
        return ref;
    }
#endif
    value = TyCell_GetRef(cell);
    if (value == NULL) {
        return PyStackRef_NULL;
    }
    return PyStackRef_FromPyObjectSteal(value);
}

#ifdef __cplusplus
}
#endif
#endif   /* !Ty_INTERNAL_CELL_H */
