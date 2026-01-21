/* Frame object implementation */

#include "Python.h"
#include "pycore_cell.h"          // TyCell_GetRef()
#include "pycore_ceval.h"         // _TyEval_SetOpcodeTrace()
#include "pycore_code.h"          // CO_FAST_LOCAL
#include "pycore_dict.h"          // _TyDict_LoadBuiltinsFromGlobals()
#include "pycore_frame.h"         // PyFrameObject
#include "pycore_function.h"      // _TyFunction_FromConstructor()
#include "pycore_genobject.h"     // _TyGen_GetGeneratorFromFrame()
#include "pycore_interpframe.h"   // _TyFrame_GetLocalsArray()
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()
#include "pycore_object.h"        // _TyObject_GC_UNTRACK()
#include "pycore_opcode_metadata.h" // _TyOpcode_Caches
#include "pycore_optimizer.h"     // _Ty_Executors_InvalidateDependency()
#include "pycore_unicodeobject.h" // _TyUnicode_Equal()

#include "frameobject.h"          // PyFrameLocalsProxyObject
#include "opcode.h"               // EXTENDED_ARG

#include "clinic/frameobject.c.h"


#define PyFrameObject_CAST(op)  \
    (assert(PyObject_TypeCheck((op), &TyFrame_Type)), (PyFrameObject *)(op))

#define PyFrameLocalsProxyObject_CAST(op)                           \
    (                                                               \
        assert(PyObject_TypeCheck((op), &PyFrameLocalsProxy_Type)), \
        (PyFrameLocalsProxyObject *)(op)                            \
    )

#define OFF(x) offsetof(PyFrameObject, x)

/*[clinic input]
class frame "PyFrameObject *" "&TyFrame_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=2d1dbf2e06cf351f]*/


// Returns new reference or NULL
static TyObject *
framelocalsproxy_getval(_PyInterpreterFrame *frame, PyCodeObject *co, int i)
{
    _PyStackRef *fast = _TyFrame_GetLocalsArray(frame);
    _PyLocals_Kind kind = _PyLocals_GetKind(co->co_localspluskinds, i);

    TyObject *value = PyStackRef_AsPyObjectBorrow(fast[i]);
    TyObject *cell = NULL;

    if (value == NULL) {
        return NULL;
    }

    if (kind == CO_FAST_FREE || kind & CO_FAST_CELL) {
        // The cell was set when the frame was created from
        // the function's closure.
        // GH-128396: With PEP 709, it's possible to have a fast variable in
        // an inlined comprehension that has the same name as the cell variable
        // in the frame, where the `kind` obtained from frame can not guarantee
        // that the variable is a cell.
        // If the variable is not a cell, we are okay with it and we can simply
        // return the value.
        if (TyCell_Check(value)) {
            cell = value;
        }
    }

    if (cell != NULL) {
        value = TyCell_GetRef((PyCellObject *)cell);
    }
    else {
        Ty_XINCREF(value);
    }

    if (value == NULL) {
        return NULL;
    }

    return value;
}

static bool
framelocalsproxy_hasval(_PyInterpreterFrame *frame, PyCodeObject *co, int i)
{
    TyObject *value = framelocalsproxy_getval(frame, co, i);
    if (value == NULL) {
        return false;
    }
    Ty_DECREF(value);
    return true;
}

static int
framelocalsproxy_getkeyindex(PyFrameObject *frame, TyObject *key, bool read, TyObject **value_ptr)
{
    /*
     * Returns -2 (!) if an error occurred; exception will be set.
     * Returns the fast locals index of the key on success:
     *   - if read == true, returns the index if the value is not NULL
     *   - if read == false, returns the index if the value is not hidden
     * Otherwise returns -1.
     *
     * If read == true and value_ptr is not NULL, *value_ptr is set to
     * the value of the key if it is found (with a new reference).
     */

    // value_ptr should only be given if we are reading the value
    assert(read || value_ptr == NULL);

    PyCodeObject *co = _TyFrame_GetCode(frame->f_frame);

    // Ensure that the key is hashable.
    Ty_hash_t key_hash = PyObject_Hash(key);
    if (key_hash == -1) {
        return -2;
    }

    bool found = false;

    // We do 2 loops here because it's highly possible the key is interned
    // and we can do a pointer comparison.
    for (int i = 0; i < co->co_nlocalsplus; i++) {
        TyObject *name = TyTuple_GET_ITEM(co->co_localsplusnames, i);
        if (name == key) {
            if (read) {
                TyObject *value = framelocalsproxy_getval(frame->f_frame, co, i);
                if (value != NULL) {
                    if (value_ptr != NULL) {
                        *value_ptr = value;
                    }
                    else {
                        Ty_DECREF(value);
                    }
                    return i;
                }
            } else {
                if (!(_PyLocals_GetKind(co->co_localspluskinds, i) & CO_FAST_HIDDEN)) {
                    return i;
                }
            }
            found = true;
        }
    }
    if (found) {
        // This is an attempt to read an unset local variable or
        // write to a variable that is hidden from regular write operations
        return -1;
    }
    // This is unlikely, but we need to make sure. This means the key
    // is not interned.
    for (int i = 0; i < co->co_nlocalsplus; i++) {
        TyObject *name = TyTuple_GET_ITEM(co->co_localsplusnames, i);
        Ty_hash_t name_hash = PyObject_Hash(name);
        assert(name_hash != -1);  // keys are exact unicode
        if (name_hash != key_hash) {
            continue;
        }
        int same = PyObject_RichCompareBool(name, key, Py_EQ);
        if (same < 0) {
            return -2;
        }
        if (same) {
            if (read) {
                TyObject *value = framelocalsproxy_getval(frame->f_frame, co, i);
                if (value != NULL) {
                    if (value_ptr != NULL) {
                        *value_ptr = value;
                    }
                    else {
                        Ty_DECREF(value);
                    }
                    return i;
                }
            } else {
                if (!(_PyLocals_GetKind(co->co_localspluskinds, i) & CO_FAST_HIDDEN)) {
                    return i;
                }
            }
        }
    }

    return -1;
}

static TyObject *
framelocalsproxy_getitem(TyObject *self, TyObject *key)
{
    PyFrameObject *frame = PyFrameLocalsProxyObject_CAST(self)->frame;
    TyObject *value = NULL;

    int i = framelocalsproxy_getkeyindex(frame, key, true, &value);
    if (i == -2) {
        return NULL;
    }
    if (i >= 0) {
        assert(value != NULL);
        return value;
    }
    assert(value == NULL);

    // Okay not in the fast locals, try extra locals

    TyObject *extra = frame->f_extra_locals;
    if (extra != NULL) {
        if (TyDict_GetItemRef(extra, key, &value) < 0) {
            return NULL;
        }
        if (value != NULL) {
            return value;
        }
    }

    TyErr_Format(TyExc_KeyError, "local variable '%R' is not defined", key);
    return NULL;
}

static int
add_overwritten_fast_local(PyFrameObject *frame, TyObject *obj)
{
    Ty_ssize_t new_size;
    if (frame->f_overwritten_fast_locals == NULL) {
        new_size = 1;
    }
    else {
        Ty_ssize_t size = TyTuple_Size(frame->f_overwritten_fast_locals);
        if (size == -1) {
            return -1;
        }
        new_size = size + 1;
    }
    TyObject *new_tuple = TyTuple_New(new_size);
    if (new_tuple == NULL) {
        return -1;
    }
    for (Ty_ssize_t i = 0; i < new_size - 1; i++) {
        TyObject *o = TyTuple_GET_ITEM(frame->f_overwritten_fast_locals, i);
        TyTuple_SET_ITEM(new_tuple, i, Ty_NewRef(o));
    }
    TyTuple_SET_ITEM(new_tuple, new_size - 1, Ty_NewRef(obj));
    Ty_XSETREF(frame->f_overwritten_fast_locals, new_tuple);
    return 0;
}

static int
framelocalsproxy_setitem(TyObject *self, TyObject *key, TyObject *value)
{
    /* Merge locals into fast locals */
    PyFrameObject *frame = PyFrameLocalsProxyObject_CAST(self)->frame;
    _PyStackRef *fast = _TyFrame_GetLocalsArray(frame->f_frame);
    PyCodeObject *co = _TyFrame_GetCode(frame->f_frame);

    int i = framelocalsproxy_getkeyindex(frame, key, false, NULL);
    if (i == -2) {
        return -1;
    }
    if (i >= 0) {
        if (value == NULL) {
            TyErr_SetString(TyExc_ValueError, "cannot remove local variables from FrameLocalsProxy");
            return -1;
        }

        _Ty_Executors_InvalidateDependency(TyInterpreterState_Get(), co, 1);

        _PyLocals_Kind kind = _PyLocals_GetKind(co->co_localspluskinds, i);
        _PyStackRef oldvalue = fast[i];
        TyObject *cell = NULL;
        if (kind == CO_FAST_FREE) {
            // The cell was set when the frame was created from
            // the function's closure.
            assert(!PyStackRef_IsNull(oldvalue) && TyCell_Check(PyStackRef_AsPyObjectBorrow(oldvalue)));
            cell = PyStackRef_AsPyObjectBorrow(oldvalue);
        } else if (kind & CO_FAST_CELL && !PyStackRef_IsNull(oldvalue)) {
            TyObject *as_obj = PyStackRef_AsPyObjectBorrow(oldvalue);
            if (TyCell_Check(as_obj)) {
                cell = as_obj;
            }
        }
        if (cell != NULL) {
            Ty_XINCREF(value);
            TyCell_SetTakeRef((PyCellObject *)cell, value);
        } else if (value != PyStackRef_AsPyObjectBorrow(oldvalue)) {
            TyObject *old_obj = PyStackRef_AsPyObjectBorrow(fast[i]);
            if (old_obj != NULL && !_Ty_IsImmortal(old_obj)) {
                if (add_overwritten_fast_local(frame, old_obj) < 0) {
                    return -1;
                }
                PyStackRef_CLOSE(fast[i]);
            }
            fast[i] = PyStackRef_FromPyObjectNew(value);
        }
        return 0;
    }

    // Okay not in the fast locals, try extra locals

    TyObject *extra = frame->f_extra_locals;

    if (extra == NULL) {
        if (value == NULL) {
            _TyErr_SetKeyError(key);
            return -1;
        }
        extra = TyDict_New();
        if (extra == NULL) {
            return -1;
        }
        frame->f_extra_locals = extra;
    }

    assert(TyDict_Check(extra));

    if (value == NULL) {
        return TyDict_DelItem(extra, key);
    } else {
        return TyDict_SetItem(extra, key, value);
    }
}

static int
framelocalsproxy_merge(TyObject* self, TyObject* other)
{
    if (!TyDict_Check(other) && !PyFrameLocalsProxy_Check(other)) {
        return -1;
    }

    TyObject *keys = PyMapping_Keys(other);
    if (keys == NULL) {
        return -1;
    }

    TyObject *iter = PyObject_GetIter(keys);
    Ty_DECREF(keys);
    if (iter == NULL) {
        return -1;
    }

    TyObject *key = NULL;
    TyObject *value = NULL;

    while ((key = TyIter_Next(iter)) != NULL) {
        value = PyObject_GetItem(other, key);
        if (value == NULL) {
            Ty_DECREF(key);
            Ty_DECREF(iter);
            return -1;
        }

        if (framelocalsproxy_setitem(self, key, value) < 0) {
            Ty_DECREF(key);
            Ty_DECREF(value);
            Ty_DECREF(iter);
            return -1;
        }

        Ty_DECREF(key);
        Ty_DECREF(value);
    }

    Ty_DECREF(iter);

    if (TyErr_Occurred()) {
        return -1;
    }

    return 0;
}

static TyObject *
framelocalsproxy_keys(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    PyFrameObject *frame = PyFrameLocalsProxyObject_CAST(self)->frame;
    PyCodeObject *co = _TyFrame_GetCode(frame->f_frame);
    TyObject *names = TyList_New(0);
    if (names == NULL) {
        return NULL;
    }

    for (int i = 0; i < co->co_nlocalsplus; i++) {
        if (framelocalsproxy_hasval(frame->f_frame, co, i)) {
            TyObject *name = TyTuple_GET_ITEM(co->co_localsplusnames, i);
            if (TyList_Append(names, name) < 0) {
                Ty_DECREF(names);
                return NULL;
            }
        }
    }

    // Iterate through the extra locals
    if (frame->f_extra_locals) {
        assert(TyDict_Check(frame->f_extra_locals));

        Ty_ssize_t i = 0;
        TyObject *key = NULL;
        TyObject *value = NULL;

        while (TyDict_Next(frame->f_extra_locals, &i, &key, &value)) {
            if (TyList_Append(names, key) < 0) {
                Ty_DECREF(names);
                return NULL;
            }
        }
    }

    return names;
}

static void
framelocalsproxy_dealloc(TyObject *self)
{
    PyFrameLocalsProxyObject *proxy = PyFrameLocalsProxyObject_CAST(self);
    PyObject_GC_UnTrack(self);
    Ty_CLEAR(proxy->frame);
    Ty_TYPE(self)->tp_free(self);
}

static TyObject *
framelocalsproxy_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    if (TyTuple_GET_SIZE(args) != 1) {
        TyErr_Format(TyExc_TypeError,
                     "FrameLocalsProxy expected 1 argument, got %zd",
                     TyTuple_GET_SIZE(args));
        return NULL;
    }
    TyObject *item = TyTuple_GET_ITEM(args, 0);

    if (!TyFrame_Check(item)) {
        TyErr_Format(TyExc_TypeError, "expect frame, not %T", item);
        return NULL;
    }
    PyFrameObject *frame = (PyFrameObject*)item;

    if (kwds != NULL && TyDict_Size(kwds) != 0) {
        TyErr_SetString(TyExc_TypeError,
                        "FrameLocalsProxy takes no keyword arguments");
        return 0;
    }

    PyFrameLocalsProxyObject *self = (PyFrameLocalsProxyObject *)type->tp_alloc(type, 0);
    if (self == NULL) {
        return NULL;
    }

    ((PyFrameLocalsProxyObject*)self)->frame = (PyFrameObject*)Ty_NewRef(frame);

    return (TyObject *)self;
}

static int
framelocalsproxy_tp_clear(TyObject *self)
{
    PyFrameLocalsProxyObject *proxy = PyFrameLocalsProxyObject_CAST(self);
    Ty_CLEAR(proxy->frame);
    return 0;
}

static int
framelocalsproxy_visit(TyObject *self, visitproc visit, void *arg)
{
    PyFrameLocalsProxyObject *proxy = PyFrameLocalsProxyObject_CAST(self);
    Ty_VISIT(proxy->frame);
    return 0;
}

static TyObject *
framelocalsproxy_iter(TyObject *self)
{
    TyObject* keys = framelocalsproxy_keys(self, NULL);
    if (keys == NULL) {
        return NULL;
    }

    TyObject* iter = PyObject_GetIter(keys);
    Ty_XDECREF(keys);

    return iter;
}

static TyObject *
framelocalsproxy_richcompare(TyObject *lhs, TyObject *rhs, int op)
{
    PyFrameLocalsProxyObject *self = PyFrameLocalsProxyObject_CAST(lhs);
    if (PyFrameLocalsProxy_Check(rhs)) {
        PyFrameLocalsProxyObject *other = (PyFrameLocalsProxyObject *)rhs;
        bool result = self->frame == other->frame;
        if (op == Py_EQ) {
            return TyBool_FromLong(result);
        } else if (op == Py_NE) {
            return TyBool_FromLong(!result);
        }
    } else if (TyDict_Check(rhs)) {
        TyObject *dct = TyDict_New();
        if (dct == NULL) {
            return NULL;
        }

        if (TyDict_Update(dct, lhs) < 0) {
            Ty_DECREF(dct);
            return NULL;
        }

        TyObject *result = PyObject_RichCompare(dct, rhs, op);
        Ty_DECREF(dct);
        return result;
    }

    Py_RETURN_NOTIMPLEMENTED;
}

static TyObject *
framelocalsproxy_repr(TyObject *self)
{
    int i = Ty_ReprEnter(self);
    if (i != 0) {
        return i > 0 ? TyUnicode_FromString("{...}") : NULL;
    }

    TyObject *dct = TyDict_New();
    if (dct == NULL) {
        Ty_ReprLeave(self);
        return NULL;
    }

    if (TyDict_Update(dct, self) < 0) {
        Ty_DECREF(dct);
        Ty_ReprLeave(self);
        return NULL;
    }

    TyObject *repr = PyObject_Repr(dct);
    Ty_DECREF(dct);

    Ty_ReprLeave(self);

    return repr;
}

static TyObject*
framelocalsproxy_or(TyObject *self, TyObject *other)
{
    if (!TyDict_Check(other) && !PyFrameLocalsProxy_Check(other)) {
        Py_RETURN_NOTIMPLEMENTED;
    }

    TyObject *result = TyDict_New();
    if (result == NULL) {
        return NULL;
    }

    if (TyDict_Update(result, self) < 0) {
        Ty_DECREF(result);
        return NULL;
    }

    if (TyDict_Update(result, other) < 0) {
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}

static TyObject*
framelocalsproxy_inplace_or(TyObject *self, TyObject *other)
{
    if (!TyDict_Check(other) && !PyFrameLocalsProxy_Check(other)) {
        Py_RETURN_NOTIMPLEMENTED;
    }

    if (framelocalsproxy_merge(self, other) < 0) {
        Py_RETURN_NOTIMPLEMENTED;
    }

    return Ty_NewRef(self);
}

static TyObject *
framelocalsproxy_values(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    PyFrameObject *frame = PyFrameLocalsProxyObject_CAST(self)->frame;
    PyCodeObject *co = _TyFrame_GetCode(frame->f_frame);
    TyObject *values = TyList_New(0);
    if (values == NULL) {
        return NULL;
    }

    for (int i = 0; i < co->co_nlocalsplus; i++) {
        TyObject *value = framelocalsproxy_getval(frame->f_frame, co, i);
        if (value) {
            if (TyList_Append(values, value) < 0) {
                Ty_DECREF(values);
                Ty_DECREF(value);
                return NULL;
            }
            Ty_DECREF(value);
        }
    }

    // Iterate through the extra locals
    if (frame->f_extra_locals) {
        Ty_ssize_t j = 0;
        TyObject *key = NULL;
        TyObject *value = NULL;
        while (TyDict_Next(frame->f_extra_locals, &j, &key, &value)) {
            if (TyList_Append(values, value) < 0) {
                Ty_DECREF(values);
                return NULL;
            }
        }
    }

    return values;
}

static TyObject *
framelocalsproxy_items(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    PyFrameObject *frame = PyFrameLocalsProxyObject_CAST(self)->frame;
    PyCodeObject *co = _TyFrame_GetCode(frame->f_frame);
    TyObject *items = TyList_New(0);
    if (items == NULL) {
        return NULL;
    }

    for (int i = 0; i < co->co_nlocalsplus; i++) {
        TyObject *name = TyTuple_GET_ITEM(co->co_localsplusnames, i);
        TyObject *value = framelocalsproxy_getval(frame->f_frame, co, i);

        if (value) {
            TyObject *pair = TyTuple_Pack(2, name, value);
            if (pair == NULL) {
                Ty_DECREF(items);
                Ty_DECREF(value);
                return NULL;
            }

            if (TyList_Append(items, pair) < 0) {
                Ty_DECREF(items);
                Ty_DECREF(pair);
                Ty_DECREF(value);
                return NULL;
            }

            Ty_DECREF(pair);
            Ty_DECREF(value);
        }
    }

    // Iterate through the extra locals
    if (frame->f_extra_locals) {
        Ty_ssize_t j = 0;
        TyObject *key = NULL;
        TyObject *value = NULL;
        while (TyDict_Next(frame->f_extra_locals, &j, &key, &value)) {
            TyObject *pair = TyTuple_Pack(2, key, value);
            if (pair == NULL) {
                Ty_DECREF(items);
                return NULL;
            }

            if (TyList_Append(items, pair) < 0) {
                Ty_DECREF(items);
                Ty_DECREF(pair);
                return NULL;
            }

            Ty_DECREF(pair);
        }
    }

    return items;
}

static Ty_ssize_t
framelocalsproxy_length(TyObject *self)
{
    PyFrameObject *frame = PyFrameLocalsProxyObject_CAST(self)->frame;
    PyCodeObject *co = _TyFrame_GetCode(frame->f_frame);
    Ty_ssize_t size = 0;

    if (frame->f_extra_locals != NULL) {
        assert(TyDict_Check(frame->f_extra_locals));
        size += TyDict_Size(frame->f_extra_locals);
    }

    for (int i = 0; i < co->co_nlocalsplus; i++) {
        if (framelocalsproxy_hasval(frame->f_frame, co, i)) {
            size++;
        }
    }
    return size;
}

static int
framelocalsproxy_contains(TyObject *self, TyObject *key)
{
    PyFrameObject *frame = PyFrameLocalsProxyObject_CAST(self)->frame;

    int i = framelocalsproxy_getkeyindex(frame, key, true, NULL);
    if (i == -2) {
        return -1;
    }
    if (i >= 0) {
        return 1;
    }

    TyObject *extra = frame->f_extra_locals;
    if (extra != NULL) {
        return TyDict_Contains(extra, key);
    }

    return 0;
}

static TyObject* framelocalsproxy___contains__(TyObject *self, TyObject *key)
{
    int result = framelocalsproxy_contains(self, key);
    if (result < 0) {
        return NULL;
    }
    return TyBool_FromLong(result);
}

static TyObject*
framelocalsproxy_update(TyObject *self, TyObject *other)
{
    if (framelocalsproxy_merge(self, other) < 0) {
        TyErr_SetString(TyExc_TypeError, "update() argument must be dict or another FrameLocalsProxy");
        return NULL;
    }

    Py_RETURN_NONE;
}

static TyObject*
framelocalsproxy_get(TyObject* self, TyObject *const *args, Ty_ssize_t nargs)
{
    if (nargs < 1 || nargs > 2) {
        TyErr_SetString(TyExc_TypeError, "get expected 1 or 2 arguments");
        return NULL;
    }

    TyObject *key = args[0];
    TyObject *default_value = Ty_None;

    if (nargs == 2) {
        default_value = args[1];
    }

    TyObject *result = framelocalsproxy_getitem(self, key);

    if (result == NULL) {
        if (TyErr_ExceptionMatches(TyExc_KeyError)) {
            TyErr_Clear();
            return Ty_XNewRef(default_value);
        }
        return NULL;
    }

    return result;
}

static TyObject*
framelocalsproxy_setdefault(TyObject* self, TyObject *const *args, Ty_ssize_t nargs)
{
    if (nargs < 1 || nargs > 2) {
        TyErr_SetString(TyExc_TypeError, "setdefault expected 1 or 2 arguments");
        return NULL;
    }

    TyObject *key = args[0];
    TyObject *default_value = Ty_None;

    if (nargs == 2) {
        default_value = args[1];
    }

    TyObject *result = framelocalsproxy_getitem(self, key);

    if (result == NULL) {
        if (TyErr_ExceptionMatches(TyExc_KeyError)) {
            TyErr_Clear();
            if (framelocalsproxy_setitem(self, key, default_value) < 0) {
                return NULL;
            }
            return Ty_XNewRef(default_value);
        }
        return NULL;
    }

    return result;
}

static TyObject*
framelocalsproxy_pop(TyObject* self, TyObject *const *args, Ty_ssize_t nargs)
{
    if (!_TyArg_CheckPositional("pop", nargs, 1, 2)) {
        return NULL;
    }

    TyObject *key = args[0];
    TyObject *default_value = NULL;

    if (nargs == 2) {
        default_value = args[1];
    }

    PyFrameObject *frame = PyFrameLocalsProxyObject_CAST(self)->frame;

    int i = framelocalsproxy_getkeyindex(frame, key, false, NULL);
    if (i == -2) {
        return NULL;
    }

    if (i >= 0) {
        TyErr_SetString(TyExc_ValueError, "cannot remove local variables from FrameLocalsProxy");
        return NULL;
    }

    TyObject *result = NULL;

    if (frame->f_extra_locals == NULL) {
        if (default_value != NULL) {
            return Ty_XNewRef(default_value);
        } else {
            _TyErr_SetKeyError(key);
            return NULL;
        }
    }

    if (TyDict_Pop(frame->f_extra_locals, key, &result) < 0) {
        return NULL;
    }

    if (result == NULL) {
        if (default_value != NULL) {
            return Ty_XNewRef(default_value);
        } else {
            _TyErr_SetKeyError(key);
            return NULL;
        }
    }

    return result;
}

static TyObject*
framelocalsproxy_copy(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject* result = TyDict_New();

    if (result == NULL) {
        return NULL;
    }

    if (TyDict_Update(result, self) < 0) {
        Ty_DECREF(result);
        return NULL;
    }

    return result;
}

static TyObject*
framelocalsproxy_reversed(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *result = framelocalsproxy_keys(self, NULL);

    if (result == NULL) {
        return NULL;
    }

    if (TyList_Reverse(result) < 0) {
        Ty_DECREF(result);
        return NULL;
    }
    return result;
}

static TyNumberMethods framelocalsproxy_as_number = {
    .nb_or = framelocalsproxy_or,
    .nb_inplace_or = framelocalsproxy_inplace_or,
};

static PySequenceMethods framelocalsproxy_as_sequence = {
    .sq_contains = framelocalsproxy_contains,
};

static PyMappingMethods framelocalsproxy_as_mapping = {
    .mp_length = framelocalsproxy_length,
    .mp_subscript = framelocalsproxy_getitem,
    .mp_ass_subscript = framelocalsproxy_setitem,
};

static TyMethodDef framelocalsproxy_methods[] = {
    {"__contains__", framelocalsproxy___contains__, METH_O | METH_COEXIST, NULL},
    {"__getitem__", framelocalsproxy_getitem, METH_O | METH_COEXIST, NULL},
    {"update", framelocalsproxy_update, METH_O, NULL},
    {"__reversed__", framelocalsproxy_reversed, METH_NOARGS, NULL},
    {"copy", framelocalsproxy_copy, METH_NOARGS, NULL},
    {"keys", framelocalsproxy_keys, METH_NOARGS, NULL},
    {"values", framelocalsproxy_values, METH_NOARGS, NULL},
    {"items", _PyCFunction_CAST(framelocalsproxy_items), METH_NOARGS, NULL},
    {"get", _PyCFunction_CAST(framelocalsproxy_get), METH_FASTCALL, NULL},
    {"pop", _PyCFunction_CAST(framelocalsproxy_pop), METH_FASTCALL, NULL},
    {
        "setdefault",
        _PyCFunction_CAST(framelocalsproxy_setdefault),
        METH_FASTCALL,
        NULL
    },
    {NULL, NULL}   /* sentinel */
};

TyTypeObject PyFrameLocalsProxy_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    .tp_name = "FrameLocalsProxy",
    .tp_basicsize = sizeof(PyFrameLocalsProxyObject),
    .tp_dealloc = framelocalsproxy_dealloc,
    .tp_repr = &framelocalsproxy_repr,
    .tp_as_number = &framelocalsproxy_as_number,
    .tp_as_sequence = &framelocalsproxy_as_sequence,
    .tp_as_mapping = &framelocalsproxy_as_mapping,
    .tp_getattro = PyObject_GenericGetAttr,
    .tp_setattro = PyObject_GenericSetAttr,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_MAPPING,
    .tp_traverse = framelocalsproxy_visit,
    .tp_clear = framelocalsproxy_tp_clear,
    .tp_richcompare = framelocalsproxy_richcompare,
    .tp_iter = framelocalsproxy_iter,
    .tp_methods = framelocalsproxy_methods,
    .tp_alloc = TyType_GenericAlloc,
    .tp_new = framelocalsproxy_new,
    .tp_free = PyObject_GC_Del,
};

TyObject *
_PyFrameLocalsProxy_New(PyFrameObject *frame)
{
    TyObject* args = TyTuple_Pack(1, frame);
    if (args == NULL) {
        return NULL;
    }

    TyObject* proxy = framelocalsproxy_new(&PyFrameLocalsProxy_Type, args, NULL);
    Ty_DECREF(args);
    return proxy;
}

static TyMemberDef frame_memberlist[] = {
    {"f_trace_lines",   Ty_T_BOOL,         OFF(f_trace_lines), 0},
    {NULL}      /* Sentinel */
};

/*[clinic input]
@critical_section
@getter
frame.f_locals as frame_locals

Return the mapping used by the frame to look up local variables.
[clinic start generated code]*/

static TyObject *
frame_locals_get_impl(PyFrameObject *self)
/*[clinic end generated code: output=b4ace8bb4cae71f4 input=7bd444d0dc8ddf44]*/
{
    assert(!_TyFrame_IsIncomplete(self->f_frame));

    PyCodeObject *co = _TyFrame_GetCode(self->f_frame);

    if (!(co->co_flags & CO_OPTIMIZED) && !_TyFrame_HasHiddenLocals(self->f_frame)) {
        if (self->f_frame->f_locals == NULL) {
            // We found cases when f_locals is NULL for non-optimized code.
            // We fill the f_locals with an empty dict to avoid crash until
            // we find the root cause.
            self->f_frame->f_locals = TyDict_New();
            if (self->f_frame->f_locals == NULL) {
                return NULL;
            }
        }
        return Ty_NewRef(self->f_frame->f_locals);
    }

    return _PyFrameLocalsProxy_New(self);
}

int
TyFrame_GetLineNumber(PyFrameObject *f)
{
    assert(f != NULL);
    if (f->f_lineno == -1) {
        // We should calculate it once. If we can't get the line number,
        // set f->f_lineno to 0.
        f->f_lineno = PyUnstable_InterpreterFrame_GetLine(f->f_frame);
        if (f->f_lineno < 0) {
            f->f_lineno = 0;
            return -1;
        }
    }

    if (f->f_lineno > 0) {
        return f->f_lineno;
    }
    return PyUnstable_InterpreterFrame_GetLine(f->f_frame);
}

/*[clinic input]
@critical_section
@getter
frame.f_lineno as frame_lineno

Return the current line number in the frame.
[clinic start generated code]*/

static TyObject *
frame_lineno_get_impl(PyFrameObject *self)
/*[clinic end generated code: output=70f35de5ac7ad630 input=87b9ec648b742936]*/
{
    int lineno = TyFrame_GetLineNumber(self);
    if (lineno < 0) {
        Py_RETURN_NONE;
    }
    return TyLong_FromLong(lineno);
}

/*[clinic input]
@critical_section
@getter
frame.f_lasti as frame_lasti

Return the index of the last attempted instruction in the frame.
[clinic start generated code]*/

static TyObject *
frame_lasti_get_impl(PyFrameObject *self)
/*[clinic end generated code: output=03275b4f0327d1a2 input=0225ed49cb1fbeeb]*/
{
    int lasti = _PyInterpreterFrame_LASTI(self->f_frame);
    if (lasti < 0) {
        return TyLong_FromLong(-1);
    }
    return TyLong_FromLong(lasti * sizeof(_Ty_CODEUNIT));
}

/*[clinic input]
@critical_section
@getter
frame.f_globals as frame_globals

Return the global variables in the frame.
[clinic start generated code]*/

static TyObject *
frame_globals_get_impl(PyFrameObject *self)
/*[clinic end generated code: output=7758788c32885528 input=7fff7241357d314d]*/
{
    TyObject *globals = self->f_frame->f_globals;
    if (globals == NULL) {
        globals = Ty_None;
    }
    return Ty_NewRef(globals);
}

/*[clinic input]
@critical_section
@getter
frame.f_builtins as frame_builtins

Return the built-in variables in the frame.
[clinic start generated code]*/

static TyObject *
frame_builtins_get_impl(PyFrameObject *self)
/*[clinic end generated code: output=45362faa6d42c702 input=27c696d6ffcad2c7]*/
{
    TyObject *builtins = self->f_frame->f_builtins;
    if (builtins == NULL) {
        builtins = Ty_None;
    }
    return Ty_NewRef(builtins);
}

/*[clinic input]
@getter
frame.f_code as frame_code

Return the code object being executed in this frame.
[clinic start generated code]*/

static TyObject *
frame_code_get_impl(PyFrameObject *self)
/*[clinic end generated code: output=a5ed6207395a8cef input=e127e7098c124816]*/
{
    if (TySys_Audit("object.__getattr__", "Os", self, "f_code") < 0) {
        return NULL;
    }
    return (TyObject *)TyFrame_GetCode(self);
}

/*[clinic input]
@critical_section
@getter
frame.f_back as frame_back
[clinic start generated code]*/

static TyObject *
frame_back_get_impl(PyFrameObject *self)
/*[clinic end generated code: output=3a84c22a55a63c79 input=9e528570d0e1f44a]*/
{
    TyObject *res = (TyObject *)TyFrame_GetBack(self);
    if (res == NULL) {
        Py_RETURN_NONE;
    }
    return res;
}

/*[clinic input]
@critical_section
@getter
frame.f_trace_opcodes as frame_trace_opcodes

Return True if opcode tracing is enabled, False otherwise.
[clinic start generated code]*/

static TyObject *
frame_trace_opcodes_get_impl(PyFrameObject *self)
/*[clinic end generated code: output=53ff41d09cc32e87 input=4eb91dc88e04677a]*/
{
    return self->f_trace_opcodes ? Ty_True : Ty_False;
}

/*[clinic input]
@critical_section
@setter
frame.f_trace_opcodes as frame_trace_opcodes
[clinic start generated code]*/

static int
frame_trace_opcodes_set_impl(PyFrameObject *self, TyObject *value)
/*[clinic end generated code: output=92619da2bfccd449 input=7e286eea3c0333ff]*/
{
    if (!TyBool_Check(value)) {
        TyErr_SetString(TyExc_TypeError,
                        "attribute value type must be bool");
        return -1;
    }
    if (value == Ty_True) {
        self->f_trace_opcodes = 1;
        if (self->f_trace) {
            return _TyEval_SetOpcodeTrace(self, true);
        }
    }
    else {
        self->f_trace_opcodes = 0;
        return _TyEval_SetOpcodeTrace(self, false);
    }
    return 0;
}

/* Model the evaluation stack, to determine which jumps
 * are safe and how many values needs to be popped.
 * The stack is modelled by a 64 integer, treating any
 * stack that can't fit into 64 bits as "overflowed".
 */

typedef enum kind {
    Iterator = 1,
    Except = 2,
    Object = 3,
    Null = 4,
    Lasti = 5,
} Kind;

static int
compatible_kind(Kind from, Kind to) {
    if (to == 0) {
        return 0;
    }
    if (to == Object) {
        return from != Null;
    }
    if (to == Null) {
        return 1;
    }
    return from == to;
}

#define BITS_PER_BLOCK 3

#define UNINITIALIZED -2
#define OVERFLOWED -1

#define MAX_STACK_ENTRIES (63/BITS_PER_BLOCK)
#define WILL_OVERFLOW (1ULL<<((MAX_STACK_ENTRIES-1)*BITS_PER_BLOCK))

#define EMPTY_STACK 0

static inline int64_t
push_value(int64_t stack, Kind kind)
{
    if (((uint64_t)stack) >= WILL_OVERFLOW) {
        return OVERFLOWED;
    }
    else {
        return (stack << BITS_PER_BLOCK) | kind;
    }
}

static inline int64_t
pop_value(int64_t stack)
{
    return Ty_ARITHMETIC_RIGHT_SHIFT(int64_t, stack, BITS_PER_BLOCK);
}

#define MASK ((1<<BITS_PER_BLOCK)-1)

static inline Kind
top_of_stack(int64_t stack)
{
    return stack & MASK;
}

static inline Kind
peek(int64_t stack, int n)
{
    assert(n >= 1);
    return (stack>>(BITS_PER_BLOCK*(n-1))) & MASK;
}

static Kind
stack_swap(int64_t stack, int n)
{
    assert(n >= 1);
    Kind to_swap = peek(stack, n);
    Kind top = top_of_stack(stack);
    int shift = BITS_PER_BLOCK*(n-1);
    int64_t replaced_low = (stack & ~(MASK << shift)) | (top << shift);
    int64_t replaced_top = (replaced_low & ~MASK) | to_swap;
    return replaced_top;
}

static int64_t
pop_to_level(int64_t stack, int level) {
    if (level == 0) {
        return EMPTY_STACK;
    }
    int64_t max_item = (1<<BITS_PER_BLOCK) - 1;
    int64_t level_max_stack = max_item << ((level-1) * BITS_PER_BLOCK);
    while (stack > level_max_stack) {
        stack = pop_value(stack);
    }
    return stack;
}

#if 0
/* These functions are useful for debugging the stack marking code */

static char
tos_char(int64_t stack) {
    switch(top_of_stack(stack)) {
        case Iterator:
            return 'I';
        case Except:
            return 'E';
        case Object:
            return 'O';
        case Lasti:
            return 'L';
        case Null:
            return 'N';
    }
    return '?';
}

static void
print_stack(int64_t stack) {
    if (stack < 0) {
        if (stack == UNINITIALIZED) {
            printf("---");
        }
        else if (stack == OVERFLOWED) {
            printf("OVERFLOWED");
        }
        else {
            printf("??");
        }
        return;
    }
    while (stack) {
        printf("%c", tos_char(stack));
        stack = pop_value(stack);
    }
}

static void
print_stacks(int64_t *stacks, int n) {
    for (int i = 0; i < n; i++) {
        printf("%d: ", i);
        print_stack(stacks[i]);
        printf("\n");
    }
}

#endif

static int64_t *
mark_stacks(PyCodeObject *code_obj, int len)
{
    TyObject *co_code = _TyCode_GetCode(code_obj);
    if (co_code == NULL) {
        return NULL;
    }
    int64_t *stacks = TyMem_New(int64_t, len+1);

    if (stacks == NULL) {
        TyErr_NoMemory();
        Ty_DECREF(co_code);
        return NULL;
    }
    for (int i = 1; i <= len; i++) {
        stacks[i] = UNINITIALIZED;
    }
    stacks[0] = EMPTY_STACK;
    int todo = 1;
    while (todo) {
        todo = 0;
        /* Scan instructions */
        for (int i = 0; i < len;) {
            int j;
            int64_t next_stack = stacks[i];
            _Ty_CODEUNIT inst = _Ty_GetBaseCodeUnit(code_obj, i);
            int opcode = inst.op.code;
            int oparg = 0;
            while (opcode == EXTENDED_ARG) {
                oparg = (oparg << 8) | inst.op.arg;
                i++;
                inst = _Ty_GetBaseCodeUnit(code_obj, i);
                opcode = inst.op.code;
                stacks[i] = next_stack;
            }
            oparg = (oparg << 8) | inst.op.arg;
            int next_i = i + _TyOpcode_Caches[opcode] + 1;
            if (next_stack == UNINITIALIZED) {
                i = next_i;
                continue;
            }
            switch (opcode) {
                case POP_JUMP_IF_FALSE:
                case POP_JUMP_IF_TRUE:
                case POP_JUMP_IF_NONE:
                case POP_JUMP_IF_NOT_NONE:
                {
                    int64_t target_stack;
                    j = next_i + oparg;
                    assert(j < len);
                    next_stack = pop_value(next_stack);
                    target_stack = next_stack;
                    assert(stacks[j] == UNINITIALIZED || stacks[j] == target_stack);
                    stacks[j] = target_stack;
                    stacks[next_i] = next_stack;
                    break;
                }
                case SEND:
                    j = oparg + i + INLINE_CACHE_ENTRIES_SEND + 1;
                    assert(j < len);
                    assert(stacks[j] == UNINITIALIZED || stacks[j] == next_stack);
                    stacks[j] = next_stack;
                    stacks[next_i] = next_stack;
                    break;
                case JUMP_FORWARD:
                    j = oparg + i + 1;
                    assert(j < len);
                    assert(stacks[j] == UNINITIALIZED || stacks[j] == next_stack);
                    stacks[j] = next_stack;
                    break;
                case JUMP_BACKWARD:
                case JUMP_BACKWARD_NO_INTERRUPT:
                    j = next_i - oparg;
                    assert(j >= 0);
                    assert(j < len);
                    if (stacks[j] == UNINITIALIZED && j < i) {
                        todo = 1;
                    }
                    assert(stacks[j] == UNINITIALIZED || stacks[j] == next_stack);
                    stacks[j] = next_stack;
                    break;
                case GET_ITER:
                case GET_AITER:
                    next_stack = push_value(pop_value(next_stack), Iterator);
                    stacks[next_i] = next_stack;
                    break;
                case FOR_ITER:
                {
                    int64_t target_stack = push_value(next_stack, Object);
                    stacks[next_i] = target_stack;
                    j = oparg + 1 + INLINE_CACHE_ENTRIES_FOR_ITER + i;
                    assert(j < len);
                    assert(stacks[j] == UNINITIALIZED || stacks[j] == target_stack);
                    stacks[j] = target_stack;
                    break;
                }
                case END_ASYNC_FOR:
                    next_stack = pop_value(pop_value(next_stack));
                    stacks[next_i] = next_stack;
                    break;
                case PUSH_EXC_INFO:
                    next_stack = push_value(next_stack, Except);
                    stacks[next_i] = next_stack;
                    break;
                case POP_EXCEPT:
                    assert(top_of_stack(next_stack) == Except);
                    next_stack = pop_value(next_stack);
                    stacks[next_i] = next_stack;
                    break;
                case RETURN_VALUE:
                    assert(pop_value(next_stack) == EMPTY_STACK);
                    assert(top_of_stack(next_stack) == Object);
                    break;
                case RAISE_VARARGS:
                    break;
                case RERAISE:
                    assert(top_of_stack(next_stack) == Except);
                    /* End of block */
                    break;
                case PUSH_NULL:
                    next_stack = push_value(next_stack, Null);
                    stacks[next_i] = next_stack;
                    break;
                case LOAD_GLOBAL:
                {
                    int j = oparg;
                    next_stack = push_value(next_stack, Object);
                    if (j & 1) {
                        next_stack = push_value(next_stack, Null);
                    }
                    stacks[next_i] = next_stack;
                    break;
                }
                case LOAD_ATTR:
                {
                    assert(top_of_stack(next_stack) == Object);
                    int j = oparg;
                    if (j & 1) {
                        next_stack = pop_value(next_stack);
                        next_stack = push_value(next_stack, Object);
                        next_stack = push_value(next_stack, Null);
                    }
                    stacks[next_i] = next_stack;
                    break;
                }
                case SWAP:
                {
                    int n = oparg;
                    next_stack = stack_swap(next_stack, n);
                    stacks[next_i] = next_stack;
                    break;
                }
                case COPY:
                {
                    int n = oparg;
                    next_stack = push_value(next_stack, peek(next_stack, n));
                    stacks[next_i] = next_stack;
                    break;
                }
                case CACHE:
                case RESERVED:
                {
                    assert(0);
                }
                default:
                {
                    int delta = PyCompile_OpcodeStackEffect(opcode, oparg);
                    assert(delta != PY_INVALID_STACK_EFFECT);
                    while (delta < 0) {
                        next_stack = pop_value(next_stack);
                        delta++;
                    }
                    while (delta > 0) {
                        next_stack = push_value(next_stack, Object);
                        delta--;
                    }
                    stacks[next_i] = next_stack;
                }
            }
            i = next_i;
        }
        /* Scan exception table */
        unsigned char *start = (unsigned char *)TyBytes_AS_STRING(code_obj->co_exceptiontable);
        unsigned char *end = start + TyBytes_GET_SIZE(code_obj->co_exceptiontable);
        unsigned char *scan = start;
        while (scan < end) {
            int start_offset, size, handler;
            scan = parse_varint(scan, &start_offset);
            assert(start_offset >= 0 && start_offset < len);
            scan = parse_varint(scan, &size);
            assert(size >= 0 && start_offset+size <= len);
            scan = parse_varint(scan, &handler);
            assert(handler >= 0 && handler < len);
            int depth_and_lasti;
            scan = parse_varint(scan, &depth_and_lasti);
            int level = depth_and_lasti >> 1;
            int lasti = depth_and_lasti & 1;
            if (stacks[start_offset] != UNINITIALIZED) {
                if (stacks[handler] == UNINITIALIZED) {
                    todo = 1;
                    uint64_t target_stack = pop_to_level(stacks[start_offset], level);
                    if (lasti) {
                        target_stack = push_value(target_stack, Lasti);
                    }
                    target_stack = push_value(target_stack, Except);
                    stacks[handler] = target_stack;
                }
            }
        }
    }
    Ty_DECREF(co_code);
    return stacks;
}

static int
compatible_stack(int64_t from_stack, int64_t to_stack)
{
    if (from_stack < 0 || to_stack < 0) {
        return 0;
    }
    while(from_stack > to_stack) {
        from_stack = pop_value(from_stack);
    }
    while(from_stack) {
        Kind from_top = top_of_stack(from_stack);
        Kind to_top = top_of_stack(to_stack);
        if (!compatible_kind(from_top, to_top)) {
            return 0;
        }
        from_stack = pop_value(from_stack);
        to_stack = pop_value(to_stack);
    }
    return to_stack == 0;
}

static const char *
explain_incompatible_stack(int64_t to_stack)
{
    assert(to_stack != 0);
    if (to_stack == OVERFLOWED) {
        return "stack is too deep to analyze";
    }
    if (to_stack == UNINITIALIZED) {
        return "can't jump into an exception handler, or code may be unreachable";
    }
    Kind target_kind = top_of_stack(to_stack);
    switch(target_kind) {
        case Except:
            return "can't jump into an 'except' block as there's no exception";
        case Lasti:
            return "can't jump into a re-raising block as there's no location";
        case Object:
        case Null:
            return "incompatible stacks";
        case Iterator:
            return "can't jump into the body of a for loop";
        default:
            Ty_UNREACHABLE();
    }
}

static int *
marklines(PyCodeObject *code, int len)
{
    PyCodeAddressRange bounds;
    _TyCode_InitAddressRange(code, &bounds);
    assert (bounds.ar_end == 0);
    int last_line = -1;

    int *linestarts = TyMem_New(int, len);
    if (linestarts == NULL) {
        return NULL;
    }
    for (int i = 0; i < len; i++) {
        linestarts[i] = -1;
    }

    while (_PyLineTable_NextAddressRange(&bounds)) {
        assert(bounds.ar_start / (int)sizeof(_Ty_CODEUNIT) < len);
        if (bounds.ar_line != last_line && bounds.ar_line != -1) {
            linestarts[bounds.ar_start / sizeof(_Ty_CODEUNIT)] = bounds.ar_line;
            last_line = bounds.ar_line;
        }
    }
    return linestarts;
}

static int
first_line_not_before(int *lines, int len, int line)
{
    int result = INT_MAX;
    for (int i = 0; i < len; i++) {
        if (lines[i] < result && lines[i] >= line) {
            result = lines[i];
        }
    }
    if (result == INT_MAX) {
        return -1;
    }
    return result;
}

static bool frame_is_suspended(PyFrameObject *frame)
{
    assert(!_TyFrame_IsIncomplete(frame->f_frame));
    if (frame->f_frame->owner == FRAME_OWNED_BY_GENERATOR) {
        PyGenObject *gen = _TyGen_GetGeneratorFromFrame(frame->f_frame);
        return FRAME_STATE_SUSPENDED(gen->gi_frame_state);
    }
    return false;
}

/* Setter for f_lineno - you can set f_lineno from within a trace function in
 * order to jump to a given line of code, subject to some restrictions.  Most
 * lines are OK to jump to because they don't make any assumptions about the
 * state of the stack (obvious because you could remove the line and the code
 * would still work without any stack errors), but there are some constructs
 * that limit jumping:
 *
 *  o Any exception handlers.
 *  o 'for' and 'async for' loops can't be jumped into because the
 *    iterator needs to be on the stack.
 *  o Jumps cannot be made from within a trace function invoked with a
 *    'return' or 'exception' event since the eval loop has been exited at
 *    that time.
 */
/*[clinic input]
@critical_section
@setter
frame.f_lineno as frame_lineno
[clinic start generated code]*/

static int
frame_lineno_set_impl(PyFrameObject *self, TyObject *value)
/*[clinic end generated code: output=e64c86ff6be64292 input=36ed3c896b27fb91]*/
{
    PyCodeObject *code = _TyFrame_GetCode(self->f_frame);
    if (value == NULL) {
        TyErr_SetString(TyExc_AttributeError, "cannot delete attribute");
        return -1;
    }
    /* f_lineno must be an integer. */
    if (!TyLong_CheckExact(value)) {
        TyErr_SetString(TyExc_ValueError,
                        "lineno must be an integer");
        return -1;
    }

    bool is_suspended = frame_is_suspended(self);
    /*
     * This code preserves the historical restrictions on
     * setting the line number of a frame.
     * Jumps are forbidden on a 'return' trace event (except after a yield).
     * Jumps from 'call' trace events are also forbidden.
     * In addition, jumps are forbidden when not tracing,
     * as this is a debugging feature.
     */
    int what_event = TyThreadState_GET()->what_event;
    if (what_event < 0) {
        TyErr_Format(TyExc_ValueError,
                    "f_lineno can only be set in a trace function");
        return -1;
    }
    switch (what_event) {
        case PY_MONITORING_EVENT_PY_RESUME:
        case PY_MONITORING_EVENT_JUMP:
        case PY_MONITORING_EVENT_BRANCH:
        case PY_MONITORING_EVENT_LINE:
        case PY_MONITORING_EVENT_PY_YIELD:
            /* Setting f_lineno is allowed for the above events */
            break;
        case PY_MONITORING_EVENT_PY_START:
            TyErr_Format(TyExc_ValueError,
                     "can't jump from the 'call' trace event of a new frame");
            return -1;
        case PY_MONITORING_EVENT_CALL:
        case PY_MONITORING_EVENT_C_RETURN:
            TyErr_SetString(TyExc_ValueError,
                "can't jump during a call");
            return -1;
        case PY_MONITORING_EVENT_PY_RETURN:
        case PY_MONITORING_EVENT_PY_UNWIND:
        case PY_MONITORING_EVENT_PY_THROW:
        case PY_MONITORING_EVENT_RAISE:
        case PY_MONITORING_EVENT_C_RAISE:
        case PY_MONITORING_EVENT_INSTRUCTION:
        case PY_MONITORING_EVENT_EXCEPTION_HANDLED:
            TyErr_Format(TyExc_ValueError,
                "can only jump from a 'line' trace event");
            return -1;
        default:
            TyErr_SetString(TyExc_SystemError,
                "unexpected event type");
            return -1;
    }

    int new_lineno;

    /* Fail if the line falls outside the code block and
        select first line with actual code. */
    int overflow;
    long l_new_lineno = TyLong_AsLongAndOverflow(value, &overflow);
    if (overflow
#if SIZEOF_LONG > SIZEOF_INT
        || l_new_lineno > INT_MAX
        || l_new_lineno < INT_MIN
#endif
    ) {
        TyErr_SetString(TyExc_ValueError,
                        "lineno out of range");
        return -1;
    }
    new_lineno = (int)l_new_lineno;

    if (new_lineno < code->co_firstlineno) {
        TyErr_Format(TyExc_ValueError,
                    "line %d comes before the current code block",
                    new_lineno);
        return -1;
    }

    /* TyCode_NewWithPosOnlyArgs limits co_code to be under INT_MAX so this
     * should never overflow. */
    int len = (int)Ty_SIZE(code);
    int *lines = marklines(code, len);
    if (lines == NULL) {
        return -1;
    }

    new_lineno = first_line_not_before(lines, len, new_lineno);
    if (new_lineno < 0) {
        TyErr_Format(TyExc_ValueError,
                    "line %d comes after the current code block",
                    (int)l_new_lineno);
        TyMem_Free(lines);
        return -1;
    }

    int64_t *stacks = mark_stacks(code, len);
    if (stacks == NULL) {
        TyMem_Free(lines);
        return -1;
    }

    int64_t best_stack = OVERFLOWED;
    int best_addr = -1;
    int64_t start_stack = stacks[_PyInterpreterFrame_LASTI(self->f_frame)];
    int err = -1;
    const char *msg = "cannot find bytecode for specified line";
    for (int i = 0; i < len; i++) {
        if (lines[i] == new_lineno) {
            int64_t target_stack = stacks[i];
            if (compatible_stack(start_stack, target_stack)) {
                err = 0;
                if (target_stack > best_stack) {
                    best_stack = target_stack;
                    best_addr = i;
                }
            }
            else if (err < 0) {
                if (start_stack == OVERFLOWED) {
                    msg = "stack to deep to analyze";
                }
                else if (start_stack == UNINITIALIZED) {
                    msg = "can't jump from unreachable code";
                }
                else {
                    msg = explain_incompatible_stack(target_stack);
                    err = 1;
                }
            }
        }
    }
    TyMem_Free(stacks);
    TyMem_Free(lines);
    if (err) {
        TyErr_SetString(TyExc_ValueError, msg);
        return -1;
    }
    // Populate any NULL locals that the compiler might have "proven" to exist
    // in the new location. Rather than crashing or changing co_code, just bind
    // None instead:
    int unbound = 0;
    for (int i = 0; i < code->co_nlocalsplus; i++) {
        // Counting every unbound local is overly-cautious, but a full flow
        // analysis (like we do in the compiler) is probably too expensive:
        unbound += PyStackRef_IsNull(self->f_frame->localsplus[i]);
    }
    if (unbound) {
        const char *e = "assigning None to %d unbound local%s";
        const char *s = (unbound == 1) ? "" : "s";
        if (TyErr_WarnFormat(TyExc_RuntimeWarning, 0, e, unbound, s)) {
            return -1;
        }
        // Do this in a second pass to avoid writing a bunch of Nones when
        // warnings are being treated as errors and the previous bit raises:
        for (int i = 0; i < code->co_nlocalsplus; i++) {
            if (PyStackRef_IsNull(self->f_frame->localsplus[i])) {
                self->f_frame->localsplus[i] = PyStackRef_None;
                unbound--;
            }
        }
        assert(unbound == 0);
    }
    if (is_suspended) {
        /* Account for value popped by yield */
        start_stack = pop_value(start_stack);
    }
    while (start_stack > best_stack) {
        _PyStackRef popped = _TyFrame_StackPop(self->f_frame);
        if (top_of_stack(start_stack) == Except) {
            /* Pop exception stack as well as the evaluation stack */
            TyObject *exc = PyStackRef_AsPyObjectBorrow(popped);
            assert(PyExceptionInstance_Check(exc) || exc == Ty_None);
            TyThreadState *tstate = _TyThreadState_GET();
            Ty_XSETREF(tstate->exc_info->exc_value, exc == Ty_None ? NULL : exc);
        }
        else {
            PyStackRef_XCLOSE(popped);
        }
        start_stack = pop_value(start_stack);
    }
    /* Finally set the new lasti and return OK. */
    self->f_lineno = 0;
    self->f_frame->instr_ptr = _TyFrame_GetBytecode(self->f_frame) + best_addr;
    return 0;
}

/*[clinic input]
@critical_section
@getter
frame.f_trace as frame_trace

Return the trace function for this frame, or None if no trace function is set.
[clinic start generated code]*/

static TyObject *
frame_trace_get_impl(PyFrameObject *self)
/*[clinic end generated code: output=5475cbfce07826cd input=f382612525829773]*/
{
    TyObject* trace = self->f_trace;
    if (trace == NULL) {
        trace = Ty_None;
    }
    return Ty_NewRef(trace);
}

/*[clinic input]
@critical_section
@setter
frame.f_trace as frame_trace
[clinic start generated code]*/

static int
frame_trace_set_impl(PyFrameObject *self, TyObject *value)
/*[clinic end generated code: output=d6fe08335cf76ae4 input=d96a18bda085707f]*/
{
    if (value == Ty_None) {
        value = NULL;
    }
    if (value != self->f_trace) {
        Ty_XSETREF(self->f_trace, Ty_XNewRef(value));
        if (value != NULL && self->f_trace_opcodes) {
            return _TyEval_SetOpcodeTrace(self, true);
        }
    }
    return 0;
}

/*[clinic input]
@critical_section
@getter
frame.f_generator as frame_generator

Return the generator or coroutine associated with this frame, or None.
[clinic start generated code]*/

static TyObject *
frame_generator_get_impl(PyFrameObject *self)
/*[clinic end generated code: output=97aeb2392562e55b input=00a2bd008b239ab0]*/
{
    if (self->f_frame->owner == FRAME_OWNED_BY_GENERATOR) {
        TyObject *gen = (TyObject *)_TyGen_GetGeneratorFromFrame(self->f_frame);
        return Ty_NewRef(gen);
    }
    Py_RETURN_NONE;
}


static TyGetSetDef frame_getsetlist[] = {
    FRAME_BACK_GETSETDEF
    FRAME_LOCALS_GETSETDEF
    FRAME_LINENO_GETSETDEF
    FRAME_TRACE_GETSETDEF
    FRAME_LASTI_GETSETDEF
    FRAME_GLOBALS_GETSETDEF
    FRAME_BUILTINS_GETSETDEF
    FRAME_CODE_GETSETDEF
    FRAME_TRACE_OPCODES_GETSETDEF
    FRAME_GENERATOR_GETSETDEF
    {0}
};

static void
frame_dealloc(TyObject *op)
{
    /* It is the responsibility of the owning generator/coroutine
     * to have cleared the generator pointer */
    PyFrameObject *f = PyFrameObject_CAST(op);
    if (_TyObject_GC_IS_TRACKED(f)) {
        _TyObject_GC_UNTRACK(f);
    }

    /* GH-106092: If f->f_frame was on the stack and we reached the maximum
     * nesting depth for deallocations, the trashcan may have delayed this
     * deallocation until after f->f_frame is freed. Avoid dereferencing
     * f->f_frame unless we know it still points to valid memory. */
    _PyInterpreterFrame *frame = (_PyInterpreterFrame *)f->_f_frame_data;

    /* Kill all local variables including specials, if we own them */
    if (f->f_frame == frame && frame->owner == FRAME_OWNED_BY_FRAME_OBJECT) {
        PyStackRef_CLEAR(frame->f_executable);
        PyStackRef_CLEAR(frame->f_funcobj);
        Ty_CLEAR(frame->f_locals);
        _PyStackRef *locals = _TyFrame_GetLocalsArray(frame);
        _PyStackRef *sp = frame->stackpointer;
        while (sp > locals) {
            sp--;
            PyStackRef_CLEAR(*sp);
        }
    }
    Ty_CLEAR(f->f_back);
    Ty_CLEAR(f->f_trace);
    Ty_CLEAR(f->f_extra_locals);
    Ty_CLEAR(f->f_locals_cache);
    Ty_CLEAR(f->f_overwritten_fast_locals);
    PyObject_GC_Del(f);
}

static int
frame_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyFrameObject *f = PyFrameObject_CAST(op);
    Ty_VISIT(f->f_back);
    Ty_VISIT(f->f_trace);
    Ty_VISIT(f->f_extra_locals);
    Ty_VISIT(f->f_locals_cache);
    Ty_VISIT(f->f_overwritten_fast_locals);
    if (f->f_frame->owner != FRAME_OWNED_BY_FRAME_OBJECT) {
        return 0;
    }
    assert(f->f_frame->frame_obj == NULL);
    return _TyFrame_Traverse(f->f_frame, visit, arg);
}

static int
frame_tp_clear(TyObject *op)
{
    PyFrameObject *f = PyFrameObject_CAST(op);
    Ty_CLEAR(f->f_trace);
    Ty_CLEAR(f->f_extra_locals);
    Ty_CLEAR(f->f_locals_cache);
    Ty_CLEAR(f->f_overwritten_fast_locals);

    /* locals and stack */
    _PyStackRef *locals = _TyFrame_GetLocalsArray(f->f_frame);
    _PyStackRef *sp = f->f_frame->stackpointer;
    assert(sp >= locals);
    while (sp > locals) {
        sp--;
        PyStackRef_CLEAR(*sp);
    }
    f->f_frame->stackpointer = locals;
    Ty_CLEAR(f->f_frame->f_locals);
    return 0;
}

/*[clinic input]
@critical_section
frame.clear

Clear all references held by the frame.
[clinic start generated code]*/

static TyObject *
frame_clear_impl(PyFrameObject *self)
/*[clinic end generated code: output=864c662f16e9bfcc input=c358f9cff5f9b681]*/
{
    if (self->f_frame->owner == FRAME_OWNED_BY_GENERATOR) {
        PyGenObject *gen = _TyGen_GetGeneratorFromFrame(self->f_frame);
        if (gen->gi_frame_state == FRAME_EXECUTING) {
            goto running;
        }
        if (FRAME_STATE_SUSPENDED(gen->gi_frame_state)) {
            goto suspended;
        }
        _TyGen_Finalize((TyObject *)gen);
    }
    else if (self->f_frame->owner == FRAME_OWNED_BY_THREAD) {
        goto running;
    }
    else {
        assert(self->f_frame->owner == FRAME_OWNED_BY_FRAME_OBJECT);
        (void)frame_tp_clear((TyObject *)self);
    }
    Py_RETURN_NONE;
running:
    TyErr_SetString(TyExc_RuntimeError,
                    "cannot clear an executing frame");
    return NULL;
suspended:
    TyErr_SetString(TyExc_RuntimeError,
                    "cannot clear a suspended frame");
    return NULL;
}

/*[clinic input]
@critical_section
frame.__sizeof__

Return the size of the frame in memory, in bytes.
[clinic start generated code]*/

static TyObject *
frame___sizeof___impl(PyFrameObject *self)
/*[clinic end generated code: output=82948688e81078e2 input=908f90a83e73131d]*/
{
    Ty_ssize_t res;
    res = offsetof(PyFrameObject, _f_frame_data) + offsetof(_PyInterpreterFrame, localsplus);
    PyCodeObject *code = _TyFrame_GetCode(self->f_frame);
    res += _TyFrame_NumSlotsForCodeObject(code) * sizeof(TyObject *);
    return TyLong_FromSsize_t(res);
}

static TyObject *
frame_repr(TyObject *op)
{
    PyFrameObject *f = PyFrameObject_CAST(op);
    int lineno = TyFrame_GetLineNumber(f);
    PyCodeObject *code = _TyFrame_GetCode(f->f_frame);
    return TyUnicode_FromFormat(
        "<frame at %p, file %R, line %d, code %S>",
        f, code->co_filename, lineno, code->co_name);
}

static TyMethodDef frame_methods[] = {
    FRAME_CLEAR_METHODDEF
    FRAME___SIZEOF___METHODDEF
    {NULL, NULL}  /* sentinel */
};

TyTypeObject TyFrame_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "frame",
    offsetof(PyFrameObject, _f_frame_data) +
    offsetof(_PyInterpreterFrame, localsplus),
    sizeof(TyObject *),
    frame_dealloc,                              /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    frame_repr,                                 /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    PyObject_GenericSetAttr,                    /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,/* tp_flags */
    0,                                          /* tp_doc */
    frame_traverse,                             /* tp_traverse */
    frame_tp_clear,                             /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    frame_methods,                              /* tp_methods */
    frame_memberlist,                           /* tp_members */
    frame_getsetlist,                           /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
};

static void
init_frame(TyThreadState *tstate, _PyInterpreterFrame *frame,
           PyFunctionObject *func, TyObject *locals)
{
    PyCodeObject *code = (PyCodeObject *)func->func_code;
    _TyFrame_Initialize(tstate, frame, PyStackRef_FromPyObjectNew(func),
                        Ty_XNewRef(locals), code, 0, NULL);
}

PyFrameObject*
_TyFrame_New_NoTrack(PyCodeObject *code)
{
    CALL_STAT_INC(frame_objects_created);
    int slots = code->co_nlocalsplus + code->co_stacksize;
    PyFrameObject *f = PyObject_GC_NewVar(PyFrameObject, &TyFrame_Type, slots);
    if (f == NULL) {
        return NULL;
    }
    f->f_back = NULL;
    f->f_trace = NULL;
    f->f_trace_lines = 1;
    f->f_trace_opcodes = 0;
    f->f_lineno = 0;
    f->f_extra_locals = NULL;
    f->f_locals_cache = NULL;
    f->f_overwritten_fast_locals = NULL;
    return f;
}

/* Legacy API */
PyFrameObject*
TyFrame_New(TyThreadState *tstate, PyCodeObject *code,
            TyObject *globals, TyObject *locals)
{
    TyObject *builtins = _TyDict_LoadBuiltinsFromGlobals(globals);
    if (builtins == NULL) {
        return NULL;
    }
    PyFrameConstructor desc = {
        .fc_globals = globals,
        .fc_builtins = builtins,
        .fc_name = code->co_name,
        .fc_qualname = code->co_name,
        .fc_code = (TyObject *)code,
        .fc_defaults = NULL,
        .fc_kwdefaults = NULL,
        .fc_closure = NULL
    };
    PyFunctionObject *func = _TyFunction_FromConstructor(&desc);
    _Ty_DECREF_BUILTINS(builtins);
    if (func == NULL) {
        return NULL;
    }
    PyFrameObject *f = _TyFrame_New_NoTrack(code);
    if (f == NULL) {
        Ty_DECREF(func);
        return NULL;
    }
    init_frame(tstate, (_PyInterpreterFrame *)f->_f_frame_data, func, locals);
    f->f_frame = (_PyInterpreterFrame *)f->_f_frame_data;
    f->f_frame->owner = FRAME_OWNED_BY_FRAME_OBJECT;
    // This frame needs to be "complete", so pretend that the first RESUME ran:
    f->f_frame->instr_ptr = _TyCode_CODE(code) + code->_co_firsttraceable + 1;
    assert(!_TyFrame_IsIncomplete(f->f_frame));
    Ty_DECREF(func);
    _TyObject_GC_TRACK(f);
    return f;
}

// Initialize frame free variables if needed
static void
frame_init_get_vars(_PyInterpreterFrame *frame)
{
    // COPY_FREE_VARS has no quickened forms, so no need to use _TyOpcode_Deopt
    // here:
    PyCodeObject *co = _TyFrame_GetCode(frame);
    int lasti = _PyInterpreterFrame_LASTI(frame);
    if (!(lasti < 0
          && _TyFrame_GetBytecode(frame)->op.code == COPY_FREE_VARS
          && PyStackRef_FunctionCheck(frame->f_funcobj)))
    {
        /* Free vars are initialized */
        return;
    }

    /* Free vars have not been initialized -- Do that */
    PyFunctionObject *func = _TyFrame_GetFunction(frame);
    TyObject *closure = func->func_closure;
    int offset = PyUnstable_Code_GetFirstFree(co);
    for (int i = 0; i < co->co_nfreevars; ++i) {
        TyObject *o = TyTuple_GET_ITEM(closure, i);
        frame->localsplus[offset + i] = PyStackRef_FromPyObjectNew(o);
    }
    // COPY_FREE_VARS doesn't have inline CACHEs, either:
    frame->instr_ptr = _TyFrame_GetBytecode(frame);
}


static int
frame_get_var(_PyInterpreterFrame *frame, PyCodeObject *co, int i,
              TyObject **pvalue)
{
    _PyLocals_Kind kind = _PyLocals_GetKind(co->co_localspluskinds, i);

    /* If the namespace is unoptimized, then one of the
       following cases applies:
       1. It does not contain free variables, because it
          uses import * or is a top-level namespace.
       2. It is a class namespace.
       We don't want to accidentally copy free variables
       into the locals dict used by the class.
    */
    if (kind & CO_FAST_FREE && !(co->co_flags & CO_OPTIMIZED)) {
        return 0;
    }

    TyObject *value = NULL;
    if (frame->stackpointer == NULL || frame->stackpointer > frame->localsplus + i) {
        value = PyStackRef_AsPyObjectBorrow(frame->localsplus[i]);
        if (kind & CO_FAST_FREE) {
            // The cell was set by COPY_FREE_VARS.
            assert(value != NULL && TyCell_Check(value));
            value = TyCell_GetRef((PyCellObject *)value);
        }
        else if (kind & CO_FAST_CELL) {
            if (value != NULL) {
                if (TyCell_Check(value)) {
                    assert(!_TyFrame_IsIncomplete(frame));
                    value = TyCell_GetRef((PyCellObject *)value);
                }
                else {
                    // (likely) Otherwise it is an arg (kind & CO_FAST_LOCAL),
                    // with the initial value set when the frame was created...
                    // (unlikely) ...or it was set via the f_locals proxy.
                    Ty_INCREF(value);
                }
            }
        }
        else {
            Ty_XINCREF(value);
        }
    }
    *pvalue = value;
    return 1;
}


bool
_TyFrame_HasHiddenLocals(_PyInterpreterFrame *frame)
{
    /*
     * This function returns if there are hidden locals introduced by PEP 709,
     * which are the isolated fast locals for inline comprehensions
     */
    PyCodeObject* co = _TyFrame_GetCode(frame);

    for (int i = 0; i < co->co_nlocalsplus; i++) {
        _PyLocals_Kind kind = _PyLocals_GetKind(co->co_localspluskinds, i);

        if (kind & CO_FAST_HIDDEN) {
            if (framelocalsproxy_hasval(frame, co, i)) {
                return true;
            }
        }
    }

    return false;
}


TyObject *
_TyFrame_GetLocals(_PyInterpreterFrame *frame)
{
    // We should try to avoid creating the FrameObject if possible.
    // So we check if the frame is a module or class level scope
    PyCodeObject *co = _TyFrame_GetCode(frame);

    if (!(co->co_flags & CO_OPTIMIZED) && !_TyFrame_HasHiddenLocals(frame)) {
        if (frame->f_locals == NULL) {
            // We found cases when f_locals is NULL for non-optimized code.
            // We fill the f_locals with an empty dict to avoid crash until
            // we find the root cause.
            frame->f_locals = TyDict_New();
            if (frame->f_locals == NULL) {
                return NULL;
            }
        }
        return Ty_NewRef(frame->f_locals);
    }

    PyFrameObject* f = _TyFrame_GetFrameObject(frame);

    return _PyFrameLocalsProxy_New(f);
}


TyObject *
TyFrame_GetVar(PyFrameObject *frame_obj, TyObject *name)
{
    if (!TyUnicode_Check(name)) {
        TyErr_Format(TyExc_TypeError, "name must be str, not %s",
                     Ty_TYPE(name)->tp_name);
        return NULL;
    }

    _PyInterpreterFrame *frame = frame_obj->f_frame;
    frame_init_get_vars(frame);

    PyCodeObject *co = _TyFrame_GetCode(frame);
    for (int i = 0; i < co->co_nlocalsplus; i++) {
        TyObject *var_name = TyTuple_GET_ITEM(co->co_localsplusnames, i);
        if (!_TyUnicode_Equal(var_name, name)) {
            continue;
        }

        TyObject *value;
        if (!frame_get_var(frame, co, i, &value)) {
            break;
        }
        if (value == NULL) {
            break;
        }
        return value;
    }

    TyErr_Format(TyExc_NameError, "variable %R does not exist", name);
    return NULL;
}


TyObject *
TyFrame_GetVarString(PyFrameObject *frame, const char *name)
{
    TyObject *name_obj = TyUnicode_FromString(name);
    if (name_obj == NULL) {
        return NULL;
    }
    TyObject *value = TyFrame_GetVar(frame, name_obj);
    Ty_DECREF(name_obj);
    return value;
}


int
TyFrame_FastToLocalsWithError(PyFrameObject *f)
{
    // Nothing to do here, as f_locals is now a write-through proxy in
    // optimized frames. Soft-deprecated, since there's no maintenance hassle.
    return 0;
}

void
TyFrame_FastToLocals(PyFrameObject *f)
{
    // Nothing to do here, as f_locals is now a write-through proxy in
    // optimized frames. Soft-deprecated, since there's no maintenance hassle.
    return;
}

void
TyFrame_LocalsToFast(PyFrameObject *f, int clear)
{
    // Nothing to do here, as f_locals is now a write-through proxy in
    // optimized frames. Soft-deprecated, since there's no maintenance hassle.
    return;
}

int
_TyFrame_IsEntryFrame(PyFrameObject *frame)
{
    assert(frame != NULL);
    _PyInterpreterFrame *f = frame->f_frame;
    assert(!_TyFrame_IsIncomplete(f));
    return f->previous && f->previous->owner == FRAME_OWNED_BY_INTERPRETER;
}

PyCodeObject *
TyFrame_GetCode(PyFrameObject *frame)
{
    assert(frame != NULL);
    TyObject *code;
    Ty_BEGIN_CRITICAL_SECTION(frame);
    assert(!_TyFrame_IsIncomplete(frame->f_frame));
    code = Ty_NewRef(_TyFrame_GetCode(frame->f_frame));
    Ty_END_CRITICAL_SECTION();
    return (PyCodeObject *)code;
}


PyFrameObject*
TyFrame_GetBack(PyFrameObject *frame)
{
    assert(frame != NULL);
    assert(!_TyFrame_IsIncomplete(frame->f_frame));
    PyFrameObject *back = frame->f_back;
    if (back == NULL) {
        _PyInterpreterFrame *prev = frame->f_frame->previous;
        prev = _TyFrame_GetFirstComplete(prev);
        if (prev) {
            back = _TyFrame_GetFrameObject(prev);
        }
    }
    return (PyFrameObject*)Ty_XNewRef(back);
}

TyObject*
TyFrame_GetLocals(PyFrameObject *frame)
{
    assert(!_TyFrame_IsIncomplete(frame->f_frame));
    return frame_locals_get((TyObject *)frame, NULL);
}

TyObject*
TyFrame_GetGlobals(PyFrameObject *frame)
{
    assert(!_TyFrame_IsIncomplete(frame->f_frame));
    return frame_globals_get((TyObject *)frame, NULL);
}

TyObject*
TyFrame_GetBuiltins(PyFrameObject *frame)
{
    assert(!_TyFrame_IsIncomplete(frame->f_frame));
    return frame_builtins_get((TyObject *)frame, NULL);
}

int
TyFrame_GetLasti(PyFrameObject *frame)
{
    int ret;
    Ty_BEGIN_CRITICAL_SECTION(frame);
    assert(!_TyFrame_IsIncomplete(frame->f_frame));
    int lasti = _PyInterpreterFrame_LASTI(frame->f_frame);
    ret = lasti < 0 ? -1 : lasti * (int)sizeof(_Ty_CODEUNIT);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

TyObject *
TyFrame_GetGenerator(PyFrameObject *frame)
{
    assert(!_TyFrame_IsIncomplete(frame->f_frame));
    return frame_generator_get((TyObject *)frame, NULL);
}
