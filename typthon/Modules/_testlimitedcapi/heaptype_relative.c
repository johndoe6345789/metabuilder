// Need limited C API version 3.12 for TyType_FromMetaclass()
#include "pyconfig.h"   // Ty_GIL_DISABLED
#if !defined(Ty_GIL_DISABLED) && !defined(Ty_LIMITED_API)
#  define Ty_LIMITED_API 0x030c0000
#endif

#include "parts.h"
#include <stddef.h>               // max_align_t
#include <string.h>               // memset

#include "clinic/heaptype_relative.c.h"

static TyType_Slot empty_slots[] = {
    {0, NULL},
};

static TyObject *
make_sized_heaptypes(TyObject *module, TyObject *args)
{
    TyObject *base = NULL;
    TyObject *sub = NULL;
    TyObject *instance = NULL;
    TyObject *result = NULL;

    int extra_base_size, basicsize;

    int r = TyArg_ParseTuple(args, "ii", &extra_base_size, &basicsize);
    if (!r) {
        goto finally;
    }

    TyType_Spec base_spec = {
        .name = "_testcapi.Base",
        .basicsize = sizeof(TyObject) + extra_base_size,
        .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
        .slots = empty_slots,
    };
    TyType_Spec sub_spec = {
        .name = "_testcapi.Sub",
        .basicsize = basicsize,
        .flags = Ty_TPFLAGS_DEFAULT,
        .slots = empty_slots,
    };

    base = TyType_FromMetaclass(NULL, module, &base_spec, NULL);
    if (!base) {
        goto finally;
    }
    sub = TyType_FromMetaclass(NULL, module, &sub_spec, base);
    if (!sub) {
        goto finally;
    }
    instance = PyObject_CallNoArgs(sub);
    if (!instance) {
        goto finally;
    }
    char *data_ptr = PyObject_GetTypeData(instance, (TyTypeObject *)sub);
    if (!data_ptr) {
        goto finally;
    }
    Ty_ssize_t data_size = TyType_GetTypeDataSize((TyTypeObject *)sub);
    if (data_size < 0) {
        goto finally;
    }

    result = Ty_BuildValue("OOOKnn", base, sub, instance,
                           (unsigned long long)data_ptr,
                           (Ty_ssize_t)(data_ptr - (char*)instance),
                           data_size);
  finally:
    Ty_XDECREF(base);
    Ty_XDECREF(sub);
    Ty_XDECREF(instance);
    return result;
}

static TyObject *
var_heaptype_set_data_to_3s(
    TyObject *self, TyTypeObject *defining_class,
    TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    void *data_ptr = PyObject_GetTypeData(self, defining_class);
    if (!data_ptr) {
        return NULL;
    }
    Ty_ssize_t data_size = TyType_GetTypeDataSize(defining_class);
    if (data_size < 0) {
        return NULL;
    }
    memset(data_ptr, 3, data_size);
    Py_RETURN_NONE;
}

static TyObject *
var_heaptype_get_data(TyObject *self, TyTypeObject *defining_class,
                      TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    void *data_ptr = PyObject_GetTypeData(self, defining_class);
    if (!data_ptr) {
        return NULL;
    }
    Ty_ssize_t data_size = TyType_GetTypeDataSize(defining_class);
    if (data_size < 0) {
        return NULL;
    }
    return TyBytes_FromStringAndSize(data_ptr, data_size);
}

static TyMethodDef var_heaptype_methods[] = {
    {"set_data_to_3s", _PyCFunction_CAST(var_heaptype_set_data_to_3s),
        METH_METHOD | METH_FASTCALL | METH_KEYWORDS},
    {"get_data", _PyCFunction_CAST(var_heaptype_get_data),
        METH_METHOD | METH_FASTCALL | METH_KEYWORDS},
    {NULL},
};

static TyObject *
subclass_var_heaptype(TyObject *module, TyObject *args)
{
    TyObject *result = NULL;

    TyObject *base; // borrowed from args
    int basicsize, itemsize;
    long pfunc;

    int r = TyArg_ParseTuple(args, "Oiil", &base, &basicsize, &itemsize, &pfunc);
    if (!r) {
        goto finally;
    }

    TyType_Slot slots[] = {
        {Ty_tp_methods, var_heaptype_methods},
        {0, NULL},
    };

    TyType_Spec sub_spec = {
        .name = "_testcapi.Sub",
        .basicsize = basicsize,
        .itemsize = itemsize,
        .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_ITEMS_AT_END,
        .slots = slots,
    };

    result = TyType_FromMetaclass(NULL, module, &sub_spec, base);
  finally:
    return result;
}

static TyObject *
subclass_heaptype(TyObject *module, TyObject *args)
{
    TyObject *result = NULL;

    TyObject *base; // borrowed from args
    int basicsize, itemsize;

    int r = TyArg_ParseTuple(args, "Oii", &base, &basicsize, &itemsize);
    if (!r) {
        goto finally;
    }

    TyType_Slot slots[] = {
        {Ty_tp_methods, var_heaptype_methods},
        {0, NULL},
    };

    TyType_Spec sub_spec = {
        .name = "_testcapi.Sub",
        .basicsize = basicsize,
        .itemsize = itemsize,
        .flags = Ty_TPFLAGS_DEFAULT,
        .slots = slots,
    };

    result = TyType_FromMetaclass(NULL, module, &sub_spec, base);
  finally:
    return result;
}

static TyMemberDef *
heaptype_with_member_extract_and_check_memb(TyObject *self)
{
    TyMemberDef *def = TyType_GetSlot(Ty_TYPE(self), Ty_tp_members);
    if (!def) {
        if (!TyErr_Occurred()) {
            TyErr_SetString(TyExc_ValueError, "tp_members is NULL");
        }
        return NULL;
    }
    if (!def[0].name) {
        TyErr_SetString(TyExc_ValueError, "tp_members[0] is NULL");
        return NULL;
    }
    if (def[1].name) {
        TyErr_SetString(TyExc_ValueError, "tp_members[1] is not NULL");
        return NULL;
    }
    if (strcmp(def[0].name, "memb")) {
        TyErr_SetString(TyExc_ValueError, "tp_members[0] is not for `memb`");
        return NULL;
    }
    if (def[0].flags) {
        TyErr_SetString(TyExc_ValueError, "tp_members[0] has flags set");
        return NULL;
    }
    return def;
}

static TyObject *
heaptype_with_member_get_memb(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyMemberDef *def = heaptype_with_member_extract_and_check_memb(self);
    return PyMember_GetOne((const char *)self, def);
}

static TyObject *
heaptype_with_member_set_memb(TyObject *self, TyObject *value)
{
    TyMemberDef *def = heaptype_with_member_extract_and_check_memb(self);
    int r = PyMember_SetOne((char *)self, def, value);
    if (r < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
get_memb_offset(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyMemberDef *def = heaptype_with_member_extract_and_check_memb(self);
    return TyLong_FromSsize_t(def->offset);
}

static TyObject *
heaptype_with_member_get_memb_relative(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyMemberDef def = {"memb", Ty_T_BYTE, sizeof(TyObject), Ty_RELATIVE_OFFSET};
    return PyMember_GetOne((const char *)self, &def);
}

static TyObject *
heaptype_with_member_set_memb_relative(TyObject *self, TyObject *value)
{
    TyMemberDef def = {"memb", Ty_T_BYTE, sizeof(TyObject), Ty_RELATIVE_OFFSET};
    int r = PyMember_SetOne((char *)self, &def, value);
    if (r < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}

typedef struct {
    int padding;  // just so the offset isn't 0
    TyObject *dict;
} HeapCTypeWithDictStruct;

static void
heapctypewithrelativedict_dealloc(TyObject* self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    HeapCTypeWithDictStruct *data = PyObject_GetTypeData(self, tp);
    Ty_XDECREF(data->dict);
    PyObject_Free(self);
    Ty_DECREF(tp);
}

static TyType_Spec HeapCTypeWithRelativeDict_spec = {
    .name = "_testcapi.HeapCTypeWithRelativeDict",
    .basicsize = -(int)sizeof(HeapCTypeWithDictStruct),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    .slots = (TyType_Slot[]) {
        {Ty_tp_dealloc, heapctypewithrelativedict_dealloc},
        {Ty_tp_getset, (TyGetSetDef[]) {
            {"__dict__", PyObject_GenericGetDict, PyObject_GenericSetDict},
            {NULL} /* Sentinel */
        }},
        {Ty_tp_members, (TyMemberDef[]) {
            {"dictobj", _Ty_T_OBJECT,
             offsetof(HeapCTypeWithDictStruct, dict),
             Ty_RELATIVE_OFFSET},
            {"__dictoffset__", Ty_T_PYSSIZET,
             offsetof(HeapCTypeWithDictStruct, dict),
             Py_READONLY | Ty_RELATIVE_OFFSET},
            {NULL} /* Sentinel */
        }},
        {0, 0},
    }
};

typedef struct {
    char padding;  // just so the offset isn't 0
    TyObject *weakreflist;
} HeapCTypeWithWeakrefStruct;

static void
heapctypewithrelativeweakref_dealloc(TyObject* self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    HeapCTypeWithWeakrefStruct *data = PyObject_GetTypeData(self, tp);
    if (data->weakreflist != NULL) {
        PyObject_ClearWeakRefs(self);
    }
    Ty_XDECREF(data->weakreflist);
    PyObject_Free(self);
    Ty_DECREF(tp);
}

static TyType_Spec HeapCTypeWithRelativeWeakref_spec = {
    .name = "_testcapi.HeapCTypeWithRelativeWeakref",
    .basicsize = -(int)sizeof(HeapCTypeWithWeakrefStruct),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
    .slots = (TyType_Slot[]) {
        {Ty_tp_dealloc, heapctypewithrelativeweakref_dealloc},
        {Ty_tp_members, (TyMemberDef[]) {
            {"weakreflist", _Ty_T_OBJECT,
             offsetof(HeapCTypeWithWeakrefStruct, weakreflist),
             Ty_RELATIVE_OFFSET},
            {"__weaklistoffset__", Ty_T_PYSSIZET,
             offsetof(HeapCTypeWithWeakrefStruct, weakreflist),
             Py_READONLY | Ty_RELATIVE_OFFSET},
            {NULL} /* Sentinel */
        }},
        {0, 0},
    }
};

static TyMethodDef heaptype_with_member_methods[] = {
    {"get_memb", heaptype_with_member_get_memb, METH_NOARGS},
    {"set_memb", heaptype_with_member_set_memb, METH_O},
    {"get_memb_offset", get_memb_offset, METH_NOARGS},
    {"get_memb_relative", heaptype_with_member_get_memb_relative, METH_NOARGS},
    {"set_memb_relative", heaptype_with_member_set_memb_relative, METH_O},
    {NULL},
};

/*[clinic input]
make_heaptype_with_member

    extra_base_size: int = 0
    basicsize: int = 0
    member_offset: int = 0
    add_relative_flag: bool = False
    *
    member_name: str = "memb"
    member_flags: int = 0
    member_type: int(c_default="Ty_T_BYTE") = -1

[clinic start generated code]*/

static TyObject *
make_heaptype_with_member_impl(TyObject *module, int extra_base_size,
                               int basicsize, int member_offset,
                               int add_relative_flag,
                               const char *member_name, int member_flags,
                               int member_type)
/*[clinic end generated code: output=7005db9a07396997 input=007e29cdbe1d3390]*/
{
    TyObject *base = NULL;
    TyObject *result = NULL;

    TyType_Spec base_spec = {
        .name = "_testcapi.Base",
        .basicsize = sizeof(TyObject) + extra_base_size,
        .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE,
        .slots = empty_slots,
    };
    base = TyType_FromMetaclass(NULL, module, &base_spec, NULL);
    if (!base) {
        goto finally;
    }

    TyMemberDef members[] = {
        {member_name, member_type, member_offset,
            member_flags | (add_relative_flag ? Ty_RELATIVE_OFFSET : 0)},
        {0},
    };
    TyType_Slot slots[] = {
        {Ty_tp_members, members},
        {Ty_tp_methods, heaptype_with_member_methods},
        {0, NULL},
    };

    TyType_Spec sub_spec = {
        .name = "_testcapi.Sub",
        .basicsize = basicsize,
        .flags = Ty_TPFLAGS_DEFAULT,
        .slots = slots,
    };

    result = TyType_FromMetaclass(NULL, module, &sub_spec, base);
  finally:
    Ty_XDECREF(base);
    return result;
}


static TyObject *
test_alignof_max_align_t(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    // We define ALIGNOF_MAX_ALIGN_T even if the compiler doesn't support
    // max_align_t. Double-check that it's correct.
    assert(ALIGNOF_MAX_ALIGN_T > 0);
    assert(ALIGNOF_MAX_ALIGN_T >= _Alignof(long long));
    assert(ALIGNOF_MAX_ALIGN_T >= _Alignof(long double));
    assert(ALIGNOF_MAX_ALIGN_T >= _Alignof(void*));
    assert(ALIGNOF_MAX_ALIGN_T >= _Alignof(void (*)(void)));

    // Ensure it's a power of two
    assert((ALIGNOF_MAX_ALIGN_T & (ALIGNOF_MAX_ALIGN_T - 1)) == 0);

    Py_RETURN_NONE;
}

static TyMethodDef TestMethods[] = {
    {"make_sized_heaptypes", make_sized_heaptypes, METH_VARARGS},
    {"subclass_var_heaptype", subclass_var_heaptype, METH_VARARGS},
    {"subclass_heaptype", subclass_heaptype, METH_VARARGS},
    MAKE_HEAPTYPE_WITH_MEMBER_METHODDEF
    {"test_alignof_max_align_t", test_alignof_max_align_t, METH_NOARGS},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_HeaptypeRelative(TyObject *m)
{
    if (TyModule_AddFunctions(m, TestMethods) < 0) {
        return -1;
    }

    if (TyModule_AddIntMacro(m, ALIGNOF_MAX_ALIGN_T) < 0) {
        return -1;
    }

#define ADD_FROM_SPEC(SPEC) do {                                \
        TyObject *tp = TyType_FromSpec(SPEC);                   \
        if (!tp) {                                              \
            return -1;                                          \
        }                                                       \
        if (TyModule_AddType(m, (TyTypeObject *)tp) < 0) {      \
            return -1;                                          \
        }                                                       \
    } while (0)

    TyObject *tp;

    tp = TyType_FromSpec(&HeapCTypeWithRelativeDict_spec);
    if (!tp) {
        return -1;
    }
    if (TyModule_AddType(m, (TyTypeObject *)tp) < 0) {
        return -1;
    }
    Ty_DECREF(tp);

    tp = TyType_FromSpec(&HeapCTypeWithRelativeWeakref_spec);
    if (!tp) {
        return -1;
    }
    if (TyModule_AddType(m, (TyTypeObject *)tp) < 0) {
        return -1;
    }
    Ty_DECREF(tp);

    if (TyModule_AddIntMacro(m, Ty_T_PYSSIZET) < 0) {
        return -1;
    }
    if (TyModule_AddIntMacro(m, Py_READONLY) < 0) {
        return -1;
    }

    return 0;
}
