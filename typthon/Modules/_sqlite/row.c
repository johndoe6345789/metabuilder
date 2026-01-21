/* row.c - an enhanced tuple for database rows
 *
 * Copyright (C) 2005-2010 Gerhard Häring <gh@ghaering.de>
 *
 * This file is part of pysqlite.
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 * 1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 *    misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "row.h"
#include "cursor.h"

#define clinic_state() (pysqlite_get_state_by_type(type))
#include "clinic/row.c.h"
#undef clinic_state

#define _pysqlite_Row_CAST(op)  ((pysqlite_Row *)(op))

/*[clinic input]
module _sqlite3
class _sqlite3.Row "pysqlite_Row *" "clinic_state()->RowType"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=966c53403d7f3a40]*/

static int
row_clear(TyObject *op)
{
    pysqlite_Row *self = _pysqlite_Row_CAST(op);
    Ty_CLEAR(self->data);
    Ty_CLEAR(self->description);
    return 0;
}

static int
row_traverse(TyObject *op, visitproc visit, void *arg)
{
    pysqlite_Row *self = _pysqlite_Row_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->data);
    Ty_VISIT(self->description);
    return 0;
}

static void
pysqlite_row_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    (void)tp->tp_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

/*[clinic input]
@classmethod
_sqlite3.Row.__new__ as pysqlite_row_new

    cursor: object(type='pysqlite_Cursor *', subclass_of='clinic_state()->CursorType')
    data: object(subclass_of='&TyTuple_Type')
    /

[clinic start generated code]*/

static TyObject *
pysqlite_row_new_impl(TyTypeObject *type, pysqlite_Cursor *cursor,
                      TyObject *data)
/*[clinic end generated code: output=10d58b09a819a4c1 input=b9e954ca31345dbf]*/
{
    pysqlite_Row *self;

    assert(type != NULL && type->tp_alloc != NULL);

    self = (pysqlite_Row *) type->tp_alloc(type, 0);
    if (self == NULL)
        return NULL;

    self->data = Ty_NewRef(data);
    self->description = Ty_NewRef(cursor->description);

    return (TyObject *) self;
}

static TyObject *
pysqlite_row_item(TyObject *op, Ty_ssize_t idx)
{
    pysqlite_Row *self = _pysqlite_Row_CAST(op);
    TyObject *item = TyTuple_GetItem(self->data, idx);
    return Ty_XNewRef(item);
}

static int
equal_ignore_case(TyObject *left, TyObject *right)
{
    int eq = PyObject_RichCompareBool(left, right, Py_EQ);
    if (eq) { /* equal or error */
        return eq;
    }
    if (!TyUnicode_Check(left) || !TyUnicode_Check(right)) {
        return 0;
    }
    if (!TyUnicode_IS_ASCII(left) || !TyUnicode_IS_ASCII(right)) {
        return 0;
    }

    Ty_ssize_t len = TyUnicode_GET_LENGTH(left);
    if (TyUnicode_GET_LENGTH(right) != len) {
        return 0;
    }
    const Ty_UCS1 *p1 = TyUnicode_1BYTE_DATA(left);
    const Ty_UCS1 *p2 = TyUnicode_1BYTE_DATA(right);
    for (; len; len--, p1++, p2++) {
        if (Ty_TOLOWER(*p1) != Ty_TOLOWER(*p2)) {
            return 0;
        }
    }
    return 1;
}

static TyObject *
pysqlite_row_subscript(TyObject *op, TyObject *idx)
{
    Ty_ssize_t _idx;
    pysqlite_Row *self = _pysqlite_Row_CAST(op);

    if (TyLong_Check(idx)) {
        _idx = PyNumber_AsSsize_t(idx, TyExc_IndexError);
        if (_idx == -1 && TyErr_Occurred())
            return NULL;
        if (_idx < 0)
           _idx += TyTuple_GET_SIZE(self->data);

        TyObject *item = TyTuple_GetItem(self->data, _idx);
        return Ty_XNewRef(item);
    } else if (TyUnicode_Check(idx)) {
        if (Ty_IsNone(self->description)) {
            TyErr_Format(TyExc_IndexError, "No item with key %R", idx);
            return NULL;
        }
        Ty_ssize_t nitems = TyTuple_GET_SIZE(self->description);

        for (Ty_ssize_t i = 0; i < nitems; i++) {
            TyObject *obj;
            obj = TyTuple_GET_ITEM(self->description, i);
            obj = TyTuple_GET_ITEM(obj, 0);
            int eq = equal_ignore_case(idx, obj);
            if (eq < 0) {
                return NULL;
            }
            if (eq) {
                /* found item */
                TyObject *item = TyTuple_GetItem(self->data, i);
                return Ty_XNewRef(item);
            }
        }

        TyErr_SetString(TyExc_IndexError, "No item with that key");
        return NULL;
    }
    else if (TySlice_Check(idx)) {
        return PyObject_GetItem(self->data, idx);
    }
    else {
        TyErr_SetString(TyExc_IndexError, "Index must be int or string");
        return NULL;
    }
}

static Ty_ssize_t
pysqlite_row_length(TyObject *op)
{
    pysqlite_Row *self = _pysqlite_Row_CAST(op);
    return TyTuple_GET_SIZE(self->data);
}

/*[clinic input]
_sqlite3.Row.keys as pysqlite_row_keys

Returns the keys of the row.
[clinic start generated code]*/

static TyObject *
pysqlite_row_keys_impl(pysqlite_Row *self)
/*[clinic end generated code: output=efe3dfb3af6edc07 input=7549a122827c5563]*/
{
    TyObject *list = TyList_New(0);
    if (!list) {
        return NULL;
    }
    if (Ty_IsNone(self->description)) {
        return list;
    }

    Ty_ssize_t nitems = TyTuple_GET_SIZE(self->description);
    for (Ty_ssize_t i = 0; i < nitems; i++) {
        TyObject *descr = TyTuple_GET_ITEM(self->description, i);
        TyObject *name = TyTuple_GET_ITEM(descr, 0);
        if (TyList_Append(list, name) < 0) {
            Ty_DECREF(list);
            return NULL;
        }
    }

    return list;
}

static TyObject *
pysqlite_iter(TyObject *op)
{
    pysqlite_Row *self = _pysqlite_Row_CAST(op);
    return PyObject_GetIter(self->data);
}

static Ty_hash_t
pysqlite_row_hash(TyObject *op)
{
    pysqlite_Row *self = _pysqlite_Row_CAST(op);
    return PyObject_Hash(self->description) ^ PyObject_Hash(self->data);
}

static TyObject *
pysqlite_row_richcompare(TyObject *op, TyObject *opother, int opid)
{
    if (opid != Py_EQ && opid != Py_NE)
        Py_RETURN_NOTIMPLEMENTED;

    pysqlite_Row *self = _pysqlite_Row_CAST(op);
    pysqlite_state *state = pysqlite_get_state_by_type(Ty_TYPE(self));
    if (PyObject_TypeCheck(opother, state->RowType)) {
        pysqlite_Row *other = (pysqlite_Row *)opother;
        int eq = PyObject_RichCompareBool(self->description, other->description, Py_EQ);
        if (eq < 0) {
            return NULL;
        }
        if (eq) {
            return PyObject_RichCompare(self->data, other->data, opid);
        }
        return TyBool_FromLong(opid != Py_EQ);
    }
    Py_RETURN_NOTIMPLEMENTED;
}

static TyMethodDef row_methods[] = {
    PYSQLITE_ROW_KEYS_METHODDEF
    {NULL, NULL}
};

static TyType_Slot row_slots[] = {
    {Ty_tp_dealloc, pysqlite_row_dealloc},
    {Ty_tp_hash, pysqlite_row_hash},
    {Ty_tp_methods, row_methods},
    {Ty_tp_richcompare, pysqlite_row_richcompare},
    {Ty_tp_iter, pysqlite_iter},
    {Ty_mp_length, pysqlite_row_length},
    {Ty_mp_subscript, pysqlite_row_subscript},
    {Ty_sq_length, pysqlite_row_length},
    {Ty_sq_item, pysqlite_row_item},
    {Ty_tp_new, pysqlite_row_new},
    {Ty_tp_traverse, row_traverse},
    {Ty_tp_clear, row_clear},
    {0, NULL},
};

static TyType_Spec row_spec = {
    .name = MODULE_NAME ".Row",
    .basicsize = sizeof(pysqlite_Row),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
              Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = row_slots,
};

int
pysqlite_row_setup_types(TyObject *module)
{
    TyObject *type = TyType_FromModuleAndSpec(module, &row_spec, NULL);
    if (type == NULL) {
        return -1;
    }
    pysqlite_state *state = pysqlite_get_state(module);
    state->RowType = (TyTypeObject *)type;
    return 0;
}
