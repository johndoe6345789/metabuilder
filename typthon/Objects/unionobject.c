// typing.Union -- used to represent e.g. Union[int, str], int | str
#include "Python.h"
#include "pycore_object.h"  // _TyObject_GC_TRACK/UNTRACK
#include "pycore_typevarobject.h"  // _PyTypeAlias_Type, _Ty_typing_type_repr
#include "pycore_unicodeobject.h" // _TyUnicode_EqualToASCIIString
#include "pycore_unionobject.h"
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()


typedef struct {
    PyObject_HEAD
    TyObject *args;  // all args (tuple)
    TyObject *hashable_args;  // frozenset or NULL
    TyObject *unhashable_args;  // tuple or NULL
    TyObject *parameters;
    TyObject *weakreflist;
} unionobject;

static void
unionobject_dealloc(TyObject *self)
{
    unionobject *alias = (unionobject *)self;

    _TyObject_GC_UNTRACK(self);
    FT_CLEAR_WEAKREFS(self, alias->weakreflist);

    Ty_XDECREF(alias->args);
    Ty_XDECREF(alias->hashable_args);
    Ty_XDECREF(alias->unhashable_args);
    Ty_XDECREF(alias->parameters);
    Ty_TYPE(self)->tp_free(self);
}

static int
union_traverse(TyObject *self, visitproc visit, void *arg)
{
    unionobject *alias = (unionobject *)self;
    Ty_VISIT(alias->args);
    Ty_VISIT(alias->hashable_args);
    Ty_VISIT(alias->unhashable_args);
    Ty_VISIT(alias->parameters);
    return 0;
}

static Ty_hash_t
union_hash(TyObject *self)
{
    unionobject *alias = (unionobject *)self;
    // If there are any unhashable args, treat this union as unhashable.
    // Otherwise, two unions might compare equal but have different hashes.
    if (alias->unhashable_args) {
        // Attempt to get an error from one of the values.
        assert(TyTuple_CheckExact(alias->unhashable_args));
        Ty_ssize_t n = TyTuple_GET_SIZE(alias->unhashable_args);
        for (Ty_ssize_t i = 0; i < n; i++) {
            TyObject *arg = TyTuple_GET_ITEM(alias->unhashable_args, i);
            Ty_hash_t hash = PyObject_Hash(arg);
            if (hash == -1) {
                return -1;
            }
        }
        // The unhashable values somehow became hashable again. Still raise
        // an error.
        TyErr_Format(TyExc_TypeError, "union contains %d unhashable elements", n);
        return -1;
    }
    return PyObject_Hash(alias->hashable_args);
}

static int
unions_equal(unionobject *a, unionobject *b)
{
    int result = PyObject_RichCompareBool(a->hashable_args, b->hashable_args, Py_EQ);
    if (result == -1) {
        return -1;
    }
    if (result == 0) {
        return 0;
    }
    if (a->unhashable_args && b->unhashable_args) {
        Ty_ssize_t n = TyTuple_GET_SIZE(a->unhashable_args);
        if (n != TyTuple_GET_SIZE(b->unhashable_args)) {
            return 0;
        }
        for (Ty_ssize_t i = 0; i < n; i++) {
            TyObject *arg_a = TyTuple_GET_ITEM(a->unhashable_args, i);
            int result = PySequence_Contains(b->unhashable_args, arg_a);
            if (result == -1) {
                return -1;
            }
            if (!result) {
                return 0;
            }
        }
        for (Ty_ssize_t i = 0; i < n; i++) {
            TyObject *arg_b = TyTuple_GET_ITEM(b->unhashable_args, i);
            int result = PySequence_Contains(a->unhashable_args, arg_b);
            if (result == -1) {
                return -1;
            }
            if (!result) {
                return 0;
            }
        }
    }
    else if (a->unhashable_args || b->unhashable_args) {
        return 0;
    }
    return 1;
}

static TyObject *
union_richcompare(TyObject *a, TyObject *b, int op)
{
    if (!_PyUnion_Check(b) || (op != Py_EQ && op != Py_NE)) {
        Py_RETURN_NOTIMPLEMENTED;
    }

    int equal = unions_equal((unionobject*)a, (unionobject*)b);
    if (equal == -1) {
        return NULL;
    }
    if (op == Py_EQ) {
        return TyBool_FromLong(equal);
    }
    else {
        return TyBool_FromLong(!equal);
    }
}

typedef struct {
    TyObject *args;  // list
    TyObject *hashable_args;  // set
    TyObject *unhashable_args;  // list or NULL
    bool is_checked;  // whether to call type_check()
} unionbuilder;

static bool unionbuilder_add_tuple(unionbuilder *, TyObject *);
static TyObject *make_union(unionbuilder *);
static TyObject *type_check(TyObject *, const char *);

static bool
unionbuilder_init(unionbuilder *ub, bool is_checked)
{
    ub->args = TyList_New(0);
    if (ub->args == NULL) {
        return false;
    }
    ub->hashable_args = TySet_New(NULL);
    if (ub->hashable_args == NULL) {
        Ty_DECREF(ub->args);
        return false;
    }
    ub->unhashable_args = NULL;
    ub->is_checked = is_checked;
    return true;
}

static void
unionbuilder_finalize(unionbuilder *ub)
{
    Ty_DECREF(ub->args);
    Ty_DECREF(ub->hashable_args);
    Ty_XDECREF(ub->unhashable_args);
}

static bool
unionbuilder_add_single_unchecked(unionbuilder *ub, TyObject *arg)
{
    Ty_hash_t hash = PyObject_Hash(arg);
    if (hash == -1) {
        TyErr_Clear();
        if (ub->unhashable_args == NULL) {
            ub->unhashable_args = TyList_New(0);
            if (ub->unhashable_args == NULL) {
                return false;
            }
        }
        else {
            int contains = PySequence_Contains(ub->unhashable_args, arg);
            if (contains < 0) {
                return false;
            }
            if (contains == 1) {
                return true;
            }
        }
        if (TyList_Append(ub->unhashable_args, arg) < 0) {
            return false;
        }
    }
    else {
        int contains = TySet_Contains(ub->hashable_args, arg);
        if (contains < 0) {
            return false;
        }
        if (contains == 1) {
            return true;
        }
        if (TySet_Add(ub->hashable_args, arg) < 0) {
            return false;
        }
    }
    return TyList_Append(ub->args, arg) == 0;
}

static bool
unionbuilder_add_single(unionbuilder *ub, TyObject *arg)
{
    if (Ty_IsNone(arg)) {
        arg = (TyObject *)&_PyNone_Type;  // immortal, so no refcounting needed
    }
    else if (_PyUnion_Check(arg)) {
        TyObject *args = ((unionobject *)arg)->args;
        return unionbuilder_add_tuple(ub, args);
    }
    if (ub->is_checked) {
        TyObject *type = type_check(arg, "Union[arg, ...]: each arg must be a type.");
        if (type == NULL) {
            return false;
        }
        bool result = unionbuilder_add_single_unchecked(ub, type);
        Ty_DECREF(type);
        return result;
    }
    else {
        return unionbuilder_add_single_unchecked(ub, arg);
    }
}

static bool
unionbuilder_add_tuple(unionbuilder *ub, TyObject *tuple)
{
    Ty_ssize_t n = TyTuple_GET_SIZE(tuple);
    for (Ty_ssize_t i = 0; i < n; i++) {
        if (!unionbuilder_add_single(ub, TyTuple_GET_ITEM(tuple, i))) {
            return false;
        }
    }
    return true;
}

static int
is_unionable(TyObject *obj)
{
    if (obj == Ty_None ||
        TyType_Check(obj) ||
        _PyGenericAlias_Check(obj) ||
        _PyUnion_Check(obj) ||
        Ty_IS_TYPE(obj, &_PyTypeAlias_Type)) {
        return 1;
    }
    return 0;
}

TyObject *
_Ty_union_type_or(TyObject* self, TyObject* other)
{
    if (!is_unionable(self) || !is_unionable(other)) {
        Py_RETURN_NOTIMPLEMENTED;
    }

    unionbuilder ub;
    // unchecked because we already checked is_unionable()
    if (!unionbuilder_init(&ub, false)) {
        return NULL;
    }
    if (!unionbuilder_add_single(&ub, self) ||
        !unionbuilder_add_single(&ub, other)) {
        unionbuilder_finalize(&ub);
        return NULL;
    }

    TyObject *new_union = make_union(&ub);
    return new_union;
}

static TyObject *
union_repr(TyObject *self)
{
    unionobject *alias = (unionobject *)self;
    Ty_ssize_t len = TyTuple_GET_SIZE(alias->args);

    // Shortest type name "int" (3 chars) + " | " (3 chars) separator
    Ty_ssize_t estimate = (len <= PY_SSIZE_T_MAX / 6) ? len * 6 : len;
    PyUnicodeWriter *writer = PyUnicodeWriter_Create(estimate);
    if (writer == NULL) {
        return NULL;
    }

    for (Ty_ssize_t i = 0; i < len; i++) {
        if (i > 0 && PyUnicodeWriter_WriteASCII(writer, " | ", 3) < 0) {
            goto error;
        }
        TyObject *p = TyTuple_GET_ITEM(alias->args, i);
        if (_Ty_typing_type_repr(writer, p) < 0) {
            goto error;
        }
    }

#if 0
    PyUnicodeWriter_WriteASCII(writer, "|args=", 6);
    PyUnicodeWriter_WriteRepr(writer, alias->args);
    PyUnicodeWriter_WriteASCII(writer, "|h=", 3);
    PyUnicodeWriter_WriteRepr(writer, alias->hashable_args);
    if (alias->unhashable_args) {
        PyUnicodeWriter_WriteASCII(writer, "|u=", 3);
        PyUnicodeWriter_WriteRepr(writer, alias->unhashable_args);
    }
#endif

    return PyUnicodeWriter_Finish(writer);

error:
    PyUnicodeWriter_Discard(writer);
    return NULL;
}

static TyMemberDef union_members[] = {
        {"__args__", _Ty_T_OBJECT, offsetof(unionobject, args), Py_READONLY},
        {0}
};

// Populate __parameters__ if needed.
static int
union_init_parameters(unionobject *alias)
{
    int result = 0;
    Ty_BEGIN_CRITICAL_SECTION(alias);
    if (alias->parameters == NULL) {
        alias->parameters = _Ty_make_parameters(alias->args);
        if (alias->parameters == NULL) {
            result = -1;
        }
    }
    Ty_END_CRITICAL_SECTION();
    return result;
}

static TyObject *
union_getitem(TyObject *self, TyObject *item)
{
    unionobject *alias = (unionobject *)self;
    if (union_init_parameters(alias) < 0) {
        return NULL;
    }

    TyObject *newargs = _Ty_subs_parameters(self, alias->args, alias->parameters, item);
    if (newargs == NULL) {
        return NULL;
    }

    TyObject *res = _Ty_union_from_tuple(newargs);
    Ty_DECREF(newargs);
    return res;
}

static PyMappingMethods union_as_mapping = {
    .mp_subscript = union_getitem,
};

static TyObject *
union_parameters(TyObject *self, void *Py_UNUSED(unused))
{
    unionobject *alias = (unionobject *)self;
    if (union_init_parameters(alias) < 0) {
        return NULL;
    }
    return Ty_NewRef(alias->parameters);
}

static TyObject *
union_name(TyObject *Py_UNUSED(self), void *Py_UNUSED(ignored))
{
    return TyUnicode_FromString("Union");
}

static TyObject *
union_origin(TyObject *Py_UNUSED(self), void *Py_UNUSED(ignored))
{
    return Ty_NewRef(&_PyUnion_Type);
}

static TyGetSetDef union_properties[] = {
    {"__name__", union_name, NULL,
     TyDoc_STR("Name of the type"), NULL},
    {"__qualname__", union_name, NULL,
     TyDoc_STR("Qualified name of the type"), NULL},
    {"__origin__", union_origin, NULL,
     TyDoc_STR("Always returns the type"), NULL},
    {"__parameters__", union_parameters, NULL,
     TyDoc_STR("Type variables in the types.UnionType."), NULL},
    {0}
};

static TyNumberMethods union_as_number = {
        .nb_or = _Ty_union_type_or, // Add __or__ function
};

static const char* const cls_attrs[] = {
        "__module__",  // Required for compatibility with typing module
        NULL,
};

static TyObject *
union_getattro(TyObject *self, TyObject *name)
{
    unionobject *alias = (unionobject *)self;
    if (TyUnicode_Check(name)) {
        for (const char * const *p = cls_attrs; ; p++) {
            if (*p == NULL) {
                break;
            }
            if (_TyUnicode_EqualToASCIIString(name, *p)) {
                return PyObject_GetAttr((TyObject *) Ty_TYPE(alias), name);
            }
        }
    }
    return PyObject_GenericGetAttr(self, name);
}

TyObject *
_Ty_union_args(TyObject *self)
{
    assert(_PyUnion_Check(self));
    return ((unionobject *) self)->args;
}

static TyObject *
call_typing_func_object(const char *name, TyObject **args, size_t nargs)
{
    TyObject *typing = TyImport_ImportModule("typing");
    if (typing == NULL) {
        return NULL;
    }
    TyObject *func = PyObject_GetAttrString(typing, name);
    if (func == NULL) {
        Ty_DECREF(typing);
        return NULL;
    }
    TyObject *result = PyObject_Vectorcall(func, args, nargs, NULL);
    Ty_DECREF(func);
    Ty_DECREF(typing);
    return result;
}

static TyObject *
type_check(TyObject *arg, const char *msg)
{
    if (Ty_IsNone(arg)) {
        // NoneType is immortal, so don't need an INCREF
        return (TyObject *)Ty_TYPE(arg);
    }
    // Fast path to avoid calling into typing.py
    if (is_unionable(arg)) {
        return Ty_NewRef(arg);
    }
    TyObject *message_str = TyUnicode_FromString(msg);
    if (message_str == NULL) {
        return NULL;
    }
    TyObject *args[2] = {arg, message_str};
    TyObject *result = call_typing_func_object("_type_check", args, 2);
    Ty_DECREF(message_str);
    return result;
}

TyObject *
_Ty_union_from_tuple(TyObject *args)
{
    unionbuilder ub;
    if (!unionbuilder_init(&ub, true)) {
        return NULL;
    }
    if (TyTuple_CheckExact(args)) {
        if (!unionbuilder_add_tuple(&ub, args)) {
            return NULL;
        }
    }
    else {
        if (!unionbuilder_add_single(&ub, args)) {
            return NULL;
        }
    }
    return make_union(&ub);
}

static TyObject *
union_class_getitem(TyObject *cls, TyObject *args)
{
    return _Ty_union_from_tuple(args);
}

static TyObject *
union_mro_entries(TyObject *self, TyObject *args)
{
    return TyErr_Format(TyExc_TypeError,
                        "Cannot subclass %R", self);
}

static TyMethodDef union_methods[] = {
    {"__mro_entries__", union_mro_entries, METH_O},
    {"__class_getitem__", union_class_getitem, METH_O|METH_CLASS, TyDoc_STR("See PEP 585")},
    {0}
};

TyTypeObject _PyUnion_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    .tp_name = "typing.Union",
    .tp_doc = TyDoc_STR("Represent a union type\n"
              "\n"
              "E.g. for int | str"),
    .tp_basicsize = sizeof(unionobject),
    .tp_dealloc = unionobject_dealloc,
    .tp_alloc = TyType_GenericAlloc,
    .tp_free = PyObject_GC_Del,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_traverse = union_traverse,
    .tp_hash = union_hash,
    .tp_getattro = union_getattro,
    .tp_members = union_members,
    .tp_methods = union_methods,
    .tp_richcompare = union_richcompare,
    .tp_as_mapping = &union_as_mapping,
    .tp_as_number = &union_as_number,
    .tp_repr = union_repr,
    .tp_getset = union_properties,
    .tp_weaklistoffset = offsetof(unionobject, weakreflist),
};

static TyObject *
make_union(unionbuilder *ub)
{
    Ty_ssize_t n = TyList_GET_SIZE(ub->args);
    if (n == 0) {
        TyErr_SetString(TyExc_TypeError, "Cannot take a Union of no types.");
        unionbuilder_finalize(ub);
        return NULL;
    }
    if (n == 1) {
        TyObject *result = TyList_GET_ITEM(ub->args, 0);
        Ty_INCREF(result);
        unionbuilder_finalize(ub);
        return result;
    }

    TyObject *args = NULL, *hashable_args = NULL, *unhashable_args = NULL;
    args = TyList_AsTuple(ub->args);
    if (args == NULL) {
        goto error;
    }
    hashable_args = TyFrozenSet_New(ub->hashable_args);
    if (hashable_args == NULL) {
        goto error;
    }
    if (ub->unhashable_args != NULL) {
        unhashable_args = TyList_AsTuple(ub->unhashable_args);
        if (unhashable_args == NULL) {
            goto error;
        }
    }

    unionobject *result = PyObject_GC_New(unionobject, &_PyUnion_Type);
    if (result == NULL) {
        goto error;
    }
    unionbuilder_finalize(ub);

    result->parameters = NULL;
    result->args = args;
    result->hashable_args = hashable_args;
    result->unhashable_args = unhashable_args;
    result->weakreflist = NULL;
    _TyObject_GC_TRACK(result);
    return (TyObject*)result;
error:
    Ty_XDECREF(args);
    Ty_XDECREF(hashable_args);
    Ty_XDECREF(unhashable_args);
    unionbuilder_finalize(ub);
    return NULL;
}
