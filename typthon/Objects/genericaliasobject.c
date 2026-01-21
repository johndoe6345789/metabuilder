// types.GenericAlias -- used to represent e.g. list[int].

#include "Python.h"
#include "pycore_ceval.h"         // _TyEval_GetBuiltin()
#include "pycore_modsupport.h"    // _TyArg_NoKeywords()
#include "pycore_object.h"
#include "pycore_typevarobject.h" // _Ty_typing_type_repr
#include "pycore_unicodeobject.h" // _TyUnicode_EqualToASCIIString()
#include "pycore_unionobject.h"   // _Ty_union_type_or, _PyGenericAlias_Check
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()


#include <stdbool.h>

typedef struct {
    PyObject_HEAD
    TyObject *origin;
    TyObject *args;
    TyObject *parameters;
    TyObject *weakreflist;
    // Whether we're a starred type, e.g. *tuple[int].
    bool starred;
    vectorcallfunc vectorcall;
} gaobject;

typedef struct {
    PyObject_HEAD
    TyObject *obj;  /* Set to NULL when iterator is exhausted */
} gaiterobject;

static void
ga_dealloc(TyObject *self)
{
    gaobject *alias = (gaobject *)self;

    _TyObject_GC_UNTRACK(self);
    FT_CLEAR_WEAKREFS(self, alias->weakreflist);
    Ty_XDECREF(alias->origin);
    Ty_XDECREF(alias->args);
    Ty_XDECREF(alias->parameters);
    Ty_TYPE(self)->tp_free(self);
}

static int
ga_traverse(TyObject *self, visitproc visit, void *arg)
{
    gaobject *alias = (gaobject *)self;
    Ty_VISIT(alias->origin);
    Ty_VISIT(alias->args);
    Ty_VISIT(alias->parameters);
    return 0;
}

static int
ga_repr_items_list(PyUnicodeWriter *writer, TyObject *p)
{
    assert(TyList_CheckExact(p));

    Ty_ssize_t len = TyList_GET_SIZE(p);

    if (PyUnicodeWriter_WriteChar(writer, '[') < 0) {
        return -1;
    }

    for (Ty_ssize_t i = 0; i < len; i++) {
        if (i > 0) {
            if (PyUnicodeWriter_WriteASCII(writer, ", ", 2) < 0) {
                return -1;
            }
        }
        TyObject *item = TyList_GET_ITEM(p, i);
        if (_Ty_typing_type_repr(writer, item) < 0) {
            return -1;
        }
    }

    if (PyUnicodeWriter_WriteChar(writer, ']') < 0) {
        return -1;
    }

    return 0;
}

static TyObject *
ga_repr(TyObject *self)
{
    gaobject *alias = (gaobject *)self;
    Ty_ssize_t len = TyTuple_GET_SIZE(alias->args);

    // Estimation based on the shortest format: "int[int, int, int]"
    Ty_ssize_t estimate = (len <= PY_SSIZE_T_MAX / 5) ? len * 5 : len;
    estimate = 3 + 1 + estimate + 1;
    PyUnicodeWriter *writer = PyUnicodeWriter_Create(estimate);
    if (writer == NULL) {
        return NULL;
    }

    if (alias->starred) {
        if (PyUnicodeWriter_WriteChar(writer, '*') < 0) {
            goto error;
        }
    }
    if (_Ty_typing_type_repr(writer, alias->origin) < 0) {
        goto error;
    }
    if (PyUnicodeWriter_WriteChar(writer, '[') < 0) {
        goto error;
    }
    for (Ty_ssize_t i = 0; i < len; i++) {
        if (i > 0) {
            if (PyUnicodeWriter_WriteASCII(writer, ", ", 2) < 0) {
                goto error;
            }
        }
        TyObject *p = TyTuple_GET_ITEM(alias->args, i);
        if (TyList_CheckExact(p)) {
            // Looks like we are working with ParamSpec's list of type args:
            if (ga_repr_items_list(writer, p) < 0) {
                goto error;
            }
        }
        else if (_Ty_typing_type_repr(writer, p) < 0) {
            goto error;
        }
    }
    if (len == 0) {
        // for something like tuple[()] we should print a "()"
        if (PyUnicodeWriter_WriteASCII(writer, "()", 2) < 0) {
            goto error;
        }
    }
    if (PyUnicodeWriter_WriteChar(writer, ']') < 0) {
        goto error;
    }
    return PyUnicodeWriter_Finish(writer);

error:
    PyUnicodeWriter_Discard(writer);
    return NULL;
}

// Index of item in self[:len], or -1 if not found (self is a tuple)
static Ty_ssize_t
tuple_index(TyObject *self, Ty_ssize_t len, TyObject *item)
{
    for (Ty_ssize_t i = 0; i < len; i++) {
        if (TyTuple_GET_ITEM(self, i) == item) {
            return i;
        }
    }
    return -1;
}

static int
tuple_add(TyObject *self, Ty_ssize_t len, TyObject *item)
{
    if (tuple_index(self, len, item) < 0) {
        TyTuple_SET_ITEM(self, len, Ty_NewRef(item));
        return 1;
    }
    return 0;
}

static Ty_ssize_t
tuple_extend(TyObject **dst, Ty_ssize_t dstindex,
             TyObject **src, Ty_ssize_t count)
{
    assert(count >= 0);
    if (_TyTuple_Resize(dst, TyTuple_GET_SIZE(*dst) + count - 1) != 0) {
        return -1;
    }
    assert(dstindex + count <= TyTuple_GET_SIZE(*dst));
    for (Ty_ssize_t i = 0; i < count; ++i) {
        TyObject *item = src[i];
        TyTuple_SET_ITEM(*dst, dstindex + i, Ty_NewRef(item));
    }
    return dstindex + count;
}

TyObject *
_Ty_make_parameters(TyObject *args)
{
    assert(TyTuple_Check(args) || TyList_Check(args));
    const bool is_args_list = TyList_Check(args);
    TyObject *tuple_args = NULL;
    if (is_args_list) {
        args = tuple_args = PySequence_Tuple(args);
        if (args == NULL) {
            return NULL;
        }
    }
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t len = nargs;
    TyObject *parameters = TyTuple_New(len);
    if (parameters == NULL) {
        Ty_XDECREF(tuple_args);
        return NULL;
    }
    Ty_ssize_t iparam = 0;
    for (Ty_ssize_t iarg = 0; iarg < nargs; iarg++) {
        TyObject *t = TyTuple_GET_ITEM(args, iarg);
        // We don't want __parameters__ descriptor of a bare Python class.
        if (TyType_Check(t)) {
            continue;
        }
        int rc = PyObject_HasAttrWithError(t, &_Ty_ID(__typing_subst__));
        if (rc < 0) {
            Ty_DECREF(parameters);
            Ty_XDECREF(tuple_args);
            return NULL;
        }
        if (rc) {
            iparam += tuple_add(parameters, iparam, t);
        }
        else {
            TyObject *subparams;
            if (PyObject_GetOptionalAttr(t, &_Ty_ID(__parameters__),
                                     &subparams) < 0) {
                Ty_DECREF(parameters);
                Ty_XDECREF(tuple_args);
                return NULL;
            }
            if (!subparams && (TyTuple_Check(t) || TyList_Check(t))) {
                // Recursively call _Ty_make_parameters for lists/tuples and
                // add the results to the current parameters.
                subparams = _Ty_make_parameters(t);
                if (subparams == NULL) {
                    Ty_DECREF(parameters);
                    Ty_XDECREF(tuple_args);
                    return NULL;
                }
            }
            if (subparams && TyTuple_Check(subparams)) {
                Ty_ssize_t len2 = TyTuple_GET_SIZE(subparams);
                Ty_ssize_t needed = len2 - 1 - (iarg - iparam);
                if (needed > 0) {
                    len += needed;
                    if (_TyTuple_Resize(&parameters, len) < 0) {
                        Ty_DECREF(subparams);
                        Ty_DECREF(parameters);
                        Ty_XDECREF(tuple_args);
                        return NULL;
                    }
                }
                for (Ty_ssize_t j = 0; j < len2; j++) {
                    TyObject *t2 = TyTuple_GET_ITEM(subparams, j);
                    iparam += tuple_add(parameters, iparam, t2);
                }
            }
            Ty_XDECREF(subparams);
        }
    }
    if (iparam < len) {
        if (_TyTuple_Resize(&parameters, iparam) < 0) {
            Ty_XDECREF(parameters);
            Ty_XDECREF(tuple_args);
            return NULL;
        }
    }
    Ty_XDECREF(tuple_args);
    return parameters;
}

/* If obj is a generic alias, substitute type variables params
   with substitutions argitems.  For example, if obj is list[T],
   params is (T, S), and argitems is (str, int), return list[str].
   If obj doesn't have a __parameters__ attribute or that's not
   a non-empty tuple, return a new reference to obj. */
static TyObject *
subs_tvars(TyObject *obj, TyObject *params,
           TyObject **argitems, Ty_ssize_t nargs)
{
    TyObject *subparams;
    if (PyObject_GetOptionalAttr(obj, &_Ty_ID(__parameters__), &subparams) < 0) {
        return NULL;
    }
    if (subparams && TyTuple_Check(subparams) && TyTuple_GET_SIZE(subparams)) {
        Ty_ssize_t nparams = TyTuple_GET_SIZE(params);
        Ty_ssize_t nsubargs = TyTuple_GET_SIZE(subparams);
        TyObject *subargs = TyTuple_New(nsubargs);
        if (subargs == NULL) {
            Ty_DECREF(subparams);
            return NULL;
        }
        Ty_ssize_t j = 0;
        for (Ty_ssize_t i = 0; i < nsubargs; ++i) {
            TyObject *arg = TyTuple_GET_ITEM(subparams, i);
            Ty_ssize_t iparam = tuple_index(params, nparams, arg);
            if (iparam >= 0) {
                TyObject *param = TyTuple_GET_ITEM(params, iparam);
                arg = argitems[iparam];
                if (Ty_TYPE(param)->tp_iter && TyTuple_Check(arg)) {  // TypeVarTuple
                    j = tuple_extend(&subargs, j,
                                    &TyTuple_GET_ITEM(arg, 0),
                                    TyTuple_GET_SIZE(arg));
                    if (j < 0) {
                        return NULL;
                    }
                    continue;
                }
            }
            TyTuple_SET_ITEM(subargs, j, Ty_NewRef(arg));
            j++;
        }
        assert(j == TyTuple_GET_SIZE(subargs));

        obj = PyObject_GetItem(obj, subargs);

        Ty_DECREF(subargs);
    }
    else {
        Ty_INCREF(obj);
    }
    Ty_XDECREF(subparams);
    return obj;
}

static int
_is_unpacked_typevartuple(TyObject *arg)
{
    TyObject *tmp;
    if (TyType_Check(arg)) { // TODO: Add test
        return 0;
    }
    int res = PyObject_GetOptionalAttr(arg, &_Ty_ID(__typing_is_unpacked_typevartuple__), &tmp);
    if (res > 0) {
        res = PyObject_IsTrue(tmp);
        Ty_DECREF(tmp);
    }
    return res;
}

static TyObject *
_unpacked_tuple_args(TyObject *arg)
{
    TyObject *result;
    assert(!TyType_Check(arg));
    // Fast path
    if (_PyGenericAlias_Check(arg) &&
            ((gaobject *)arg)->starred &&
            ((gaobject *)arg)->origin == (TyObject *)&TyTuple_Type)
    {
        result = ((gaobject *)arg)->args;
        return Ty_NewRef(result);
    }

    if (PyObject_GetOptionalAttr(arg, &_Ty_ID(__typing_unpacked_tuple_args__), &result) > 0) {
        if (result == Ty_None) {
            Ty_DECREF(result);
            return NULL;
        }
        return result;
    }
    return NULL;
}

static TyObject *
_unpack_args(TyObject *item)
{
    TyObject *newargs = TyList_New(0);
    if (newargs == NULL) {
        return NULL;
    }
    int is_tuple = TyTuple_Check(item);
    Ty_ssize_t nitems = is_tuple ? TyTuple_GET_SIZE(item) : 1;
    TyObject **argitems = is_tuple ? &TyTuple_GET_ITEM(item, 0) : &item;
    for (Ty_ssize_t i = 0; i < nitems; i++) {
        item = argitems[i];
        if (!TyType_Check(item)) {
            TyObject *subargs = _unpacked_tuple_args(item);
            if (subargs != NULL &&
                TyTuple_Check(subargs) &&
                !(TyTuple_GET_SIZE(subargs) &&
                  TyTuple_GET_ITEM(subargs, TyTuple_GET_SIZE(subargs)-1) == Ty_Ellipsis))
            {
                if (TyList_SetSlice(newargs, PY_SSIZE_T_MAX, PY_SSIZE_T_MAX, subargs) < 0) {
                    Ty_DECREF(subargs);
                    Ty_DECREF(newargs);
                    return NULL;
                }
                Ty_DECREF(subargs);
                continue;
            }
            Ty_XDECREF(subargs);
            if (TyErr_Occurred()) {
                Ty_DECREF(newargs);
                return NULL;
            }
        }
        if (TyList_Append(newargs, item) < 0) {
            Ty_DECREF(newargs);
            return NULL;
        }
    }
    Ty_SETREF(newargs, PySequence_Tuple(newargs));
    return newargs;
}

TyObject *
_Ty_subs_parameters(TyObject *self, TyObject *args, TyObject *parameters, TyObject *item)
{
    Ty_ssize_t nparams = TyTuple_GET_SIZE(parameters);
    if (nparams == 0) {
        return TyErr_Format(TyExc_TypeError,
                            "%R is not a generic class",
                            self);
    }
    item = _unpack_args(item);
    for (Ty_ssize_t i = 0; i < nparams; i++) {
        TyObject *param = TyTuple_GET_ITEM(parameters, i);
        TyObject *prepare, *tmp;
        if (PyObject_GetOptionalAttr(param, &_Ty_ID(__typing_prepare_subst__), &prepare) < 0) {
            Ty_DECREF(item);
            return NULL;
        }
        if (prepare && prepare != Ty_None) {
            if (TyTuple_Check(item)) {
                tmp = PyObject_CallFunction(prepare, "OO", self, item);
            }
            else {
                tmp = PyObject_CallFunction(prepare, "O(O)", self, item);
            }
            Ty_DECREF(prepare);
            Ty_SETREF(item, tmp);
            if (item == NULL) {
                return NULL;
            }
        }
    }
    int is_tuple = TyTuple_Check(item);
    Ty_ssize_t nitems = is_tuple ? TyTuple_GET_SIZE(item) : 1;
    TyObject **argitems = is_tuple ? &TyTuple_GET_ITEM(item, 0) : &item;
    if (nitems != nparams) {
        Ty_DECREF(item);
        return TyErr_Format(TyExc_TypeError,
                            "Too %s arguments for %R; actual %zd, expected %zd",
                            nitems > nparams ? "many" : "few",
                            self, nitems, nparams);
    }
    /* Replace all type variables (specified by parameters)
       with corresponding values specified by argitems.
        t = list[T];          t[int]      -> newargs = [int]
        t = dict[str, T];     t[int]      -> newargs = [str, int]
        t = dict[T, list[S]]; t[str, int] -> newargs = [str, list[int]]
        t = list[[T]];        t[str]      -> newargs = [[str]]
     */
    assert (TyTuple_Check(args) || TyList_Check(args));
    const bool is_args_list = TyList_Check(args);
    TyObject *tuple_args = NULL;
    if (is_args_list) {
        args = tuple_args = PySequence_Tuple(args);
        if (args == NULL) {
            return NULL;
        }
    }
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *newargs = TyTuple_New(nargs);
    if (newargs == NULL) {
        Ty_DECREF(item);
        Ty_XDECREF(tuple_args);
        return NULL;
    }
    for (Ty_ssize_t iarg = 0, jarg = 0; iarg < nargs; iarg++) {
        TyObject *arg = TyTuple_GET_ITEM(args, iarg);
        if (TyType_Check(arg)) {
            TyTuple_SET_ITEM(newargs, jarg, Ty_NewRef(arg));
            jarg++;
            continue;
        }
        // Recursively substitute params in lists/tuples.
        if (TyTuple_Check(arg) || TyList_Check(arg)) {
            TyObject *subargs = _Ty_subs_parameters(self, arg, parameters, item);
            if (subargs == NULL) {
                Ty_DECREF(newargs);
                Ty_DECREF(item);
                Ty_XDECREF(tuple_args);
                return NULL;
            }
            if (TyTuple_Check(arg)) {
                TyTuple_SET_ITEM(newargs, jarg, subargs);
            }
            else {
                // _Ty_subs_parameters returns a tuple. If the original arg was a list,
                // convert subargs to a list as well.
                TyObject *subargs_list = PySequence_List(subargs);
                Ty_DECREF(subargs);
                if (subargs_list == NULL) {
                    Ty_DECREF(newargs);
                    Ty_DECREF(item);
                    Ty_XDECREF(tuple_args);
                    return NULL;
                }
                TyTuple_SET_ITEM(newargs, jarg, subargs_list);
            }
            jarg++;
            continue;
        }
        int unpack = _is_unpacked_typevartuple(arg);
        if (unpack < 0) {
            Ty_DECREF(newargs);
            Ty_DECREF(item);
            Ty_XDECREF(tuple_args);
            return NULL;
        }
        TyObject *subst;
        if (PyObject_GetOptionalAttr(arg, &_Ty_ID(__typing_subst__), &subst) < 0) {
            Ty_DECREF(newargs);
            Ty_DECREF(item);
            Ty_XDECREF(tuple_args);
            return NULL;
        }
        if (subst) {
            Ty_ssize_t iparam = tuple_index(parameters, nparams, arg);
            assert(iparam >= 0);
            arg = PyObject_CallOneArg(subst, argitems[iparam]);
            Ty_DECREF(subst);
        }
        else {
            arg = subs_tvars(arg, parameters, argitems, nitems);
        }
        if (arg == NULL) {
            Ty_DECREF(newargs);
            Ty_DECREF(item);
            Ty_XDECREF(tuple_args);
            return NULL;
        }
        if (unpack) {
            jarg = tuple_extend(&newargs, jarg,
                    &TyTuple_GET_ITEM(arg, 0), TyTuple_GET_SIZE(arg));
            Ty_DECREF(arg);
            if (jarg < 0) {
                Ty_DECREF(item);
                Ty_XDECREF(tuple_args);
                return NULL;
            }
        }
        else {
            TyTuple_SET_ITEM(newargs, jarg, arg);
            jarg++;
        }
    }

    Ty_DECREF(item);
    Ty_XDECREF(tuple_args);
    return newargs;
}

TyDoc_STRVAR(genericalias__doc__,
"GenericAlias(origin, args, /)\n"
"--\n\n"
"Represent a PEP 585 generic type\n"
"\n"
"E.g. for t = list[int], t.__origin__ is list and t.__args__ is (int,).");

static TyObject *
ga_getitem(TyObject *self, TyObject *item)
{
    gaobject *alias = (gaobject *)self;
    // Populate __parameters__ if needed.
    if (alias->parameters == NULL) {
        alias->parameters = _Ty_make_parameters(alias->args);
        if (alias->parameters == NULL) {
            return NULL;
        }
    }

    TyObject *newargs = _Ty_subs_parameters(self, alias->args, alias->parameters, item);
    if (newargs == NULL) {
        return NULL;
    }

    TyObject *res = Ty_GenericAlias(alias->origin, newargs);
    if (res == NULL) {
        Ty_DECREF(newargs);
        return NULL;
    }
    ((gaobject *)res)->starred = alias->starred;

    Ty_DECREF(newargs);
    return res;
}

static PyMappingMethods ga_as_mapping = {
    .mp_subscript = ga_getitem,
};

static Ty_hash_t
ga_hash(TyObject *self)
{
    gaobject *alias = (gaobject *)self;
    // TODO: Hash in the hash for the origin
    Ty_hash_t h0 = PyObject_Hash(alias->origin);
    if (h0 == -1) {
        return -1;
    }
    Ty_hash_t h1 = PyObject_Hash(alias->args);
    if (h1 == -1) {
        return -1;
    }
    return h0 ^ h1;
}

static inline TyObject *
set_orig_class(TyObject *obj, TyObject *self)
{
    if (obj != NULL) {
        if (PyObject_SetAttr(obj, &_Ty_ID(__orig_class__), self) < 0) {
            if (!TyErr_ExceptionMatches(TyExc_AttributeError) &&
                !TyErr_ExceptionMatches(TyExc_TypeError))
            {
                Ty_DECREF(obj);
                return NULL;
            }
            TyErr_Clear();
        }
    }
    return obj;
}

static TyObject *
ga_call(TyObject *self, TyObject *args, TyObject *kwds)
{
    gaobject *alias = (gaobject *)self;
    TyObject *obj = PyObject_Call(alias->origin, args, kwds);
    return set_orig_class(obj, self);
}

static TyObject *
ga_vectorcall(TyObject *self, TyObject *const *args,
              size_t nargsf, TyObject *kwnames)
{
    gaobject *alias = (gaobject *) self;
    TyObject *obj = PyVectorcall_Function(alias->origin)(alias->origin, args, nargsf, kwnames);
    return set_orig_class(obj, self);
}

static const char* const attr_exceptions[] = {
    "__class__",
    "__bases__",
    "__origin__",
    "__args__",
    "__unpacked__",
    "__parameters__",
    "__typing_unpacked_tuple_args__",
    "__mro_entries__",
    "__reduce_ex__",  // needed so we don't look up object.__reduce_ex__
    "__reduce__",
    "__copy__",
    "__deepcopy__",
    NULL,
};

static TyObject *
ga_getattro(TyObject *self, TyObject *name)
{
    gaobject *alias = (gaobject *)self;
    if (TyUnicode_Check(name)) {
        for (const char * const *p = attr_exceptions; ; p++) {
            if (*p == NULL) {
                return PyObject_GetAttr(alias->origin, name);
            }
            if (_TyUnicode_EqualToASCIIString(name, *p)) {
                break;
            }
        }
    }
    return PyObject_GenericGetAttr(self, name);
}

static TyObject *
ga_richcompare(TyObject *a, TyObject *b, int op)
{
    if (!_PyGenericAlias_Check(b) ||
        (op != Py_EQ && op != Py_NE))
    {
        Py_RETURN_NOTIMPLEMENTED;
    }

    if (op == Py_NE) {
        TyObject *eq = ga_richcompare(a, b, Py_EQ);
        if (eq == NULL)
            return NULL;
        Ty_DECREF(eq);
        if (eq == Ty_True) {
            Py_RETURN_FALSE;
        }
        else {
            Py_RETURN_TRUE;
        }
    }

    gaobject *aa = (gaobject *)a;
    gaobject *bb = (gaobject *)b;
    if (aa->starred != bb->starred) {
        Py_RETURN_FALSE;
    }
    int eq = PyObject_RichCompareBool(aa->origin, bb->origin, Py_EQ);
    if (eq < 0) {
        return NULL;
    }
    if (!eq) {
        Py_RETURN_FALSE;
    }
    return PyObject_RichCompare(aa->args, bb->args, Py_EQ);
}

static TyObject *
ga_mro_entries(TyObject *self, TyObject *args)
{
    gaobject *alias = (gaobject *)self;
    return TyTuple_Pack(1, alias->origin);
}

static TyObject *
ga_instancecheck(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyErr_SetString(TyExc_TypeError,
                    "isinstance() argument 2 cannot be a parameterized generic");
    return NULL;
}

static TyObject *
ga_subclasscheck(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyErr_SetString(TyExc_TypeError,
                    "issubclass() argument 2 cannot be a parameterized generic");
    return NULL;
}

static TyObject *
ga_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    gaobject *alias = (gaobject *)self;
    if (alias->starred) {
        TyObject *tmp = Ty_GenericAlias(alias->origin, alias->args);
        if (tmp != NULL) {
            Ty_SETREF(tmp, PyObject_GetIter(tmp));
        }
        if (tmp == NULL) {
            return NULL;
        }
        return Ty_BuildValue("N(N)", _TyEval_GetBuiltin(&_Ty_ID(next)), tmp);
    }
    return Ty_BuildValue("O(OO)", Ty_TYPE(alias),
                         alias->origin, alias->args);
}

static TyObject *
ga_dir(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    gaobject *alias = (gaobject *)self;
    TyObject *dir = PyObject_Dir(alias->origin);
    if (dir == NULL) {
        return NULL;
    }

    TyObject *dir_entry = NULL;
    for (const char * const *p = attr_exceptions; ; p++) {
        if (*p == NULL) {
            break;
        }
        else {
            dir_entry = TyUnicode_FromString(*p);
            if (dir_entry == NULL) {
                goto error;
            }
            int contains = PySequence_Contains(dir, dir_entry);
            if (contains < 0) {
                goto error;
            }
            if (contains == 0 && TyList_Append(dir, dir_entry) < 0) {
                goto error;
            }

            Ty_CLEAR(dir_entry);
        }
    }
    return dir;

error:
    Ty_DECREF(dir);
    Ty_XDECREF(dir_entry);
    return NULL;
}

static TyMethodDef ga_methods[] = {
    {"__mro_entries__", ga_mro_entries, METH_O},
    {"__instancecheck__", ga_instancecheck, METH_O},
    {"__subclasscheck__", ga_subclasscheck, METH_O},
    {"__reduce__", ga_reduce, METH_NOARGS},
    {"__dir__", ga_dir, METH_NOARGS},
    {0}
};

static TyMemberDef ga_members[] = {
    {"__origin__", _Ty_T_OBJECT, offsetof(gaobject, origin), Py_READONLY},
    {"__args__", _Ty_T_OBJECT, offsetof(gaobject, args), Py_READONLY},
    {"__unpacked__", Ty_T_BOOL, offsetof(gaobject, starred), Py_READONLY},
    {0}
};

static TyObject *
ga_parameters(TyObject *self, void *unused)
{
    gaobject *alias = (gaobject *)self;
    if (alias->parameters == NULL) {
        alias->parameters = _Ty_make_parameters(alias->args);
        if (alias->parameters == NULL) {
            return NULL;
        }
    }
    return Ty_NewRef(alias->parameters);
}

static TyObject *
ga_unpacked_tuple_args(TyObject *self, void *unused)
{
    gaobject *alias = (gaobject *)self;
    if (alias->starred && alias->origin == (TyObject *)&TyTuple_Type) {
        return Ty_NewRef(alias->args);
    }
    Py_RETURN_NONE;
}

static TyGetSetDef ga_properties[] = {
    {"__parameters__", ga_parameters, NULL, TyDoc_STR("Type variables in the GenericAlias."), NULL},
    {"__typing_unpacked_tuple_args__", ga_unpacked_tuple_args, NULL, NULL},
    {0}
};

/* A helper function to create GenericAlias' args tuple and set its attributes.
 * Returns 1 on success, 0 on failure.
 */
static inline int
setup_ga(gaobject *alias, TyObject *origin, TyObject *args) {
    if (!TyTuple_Check(args)) {
        args = TyTuple_Pack(1, args);
        if (args == NULL) {
            return 0;
        }
    }
    else {
        Ty_INCREF(args);
    }

    alias->origin = Ty_NewRef(origin);
    alias->args = args;
    alias->parameters = NULL;
    alias->weakreflist = NULL;

    if (PyVectorcall_Function(origin) != NULL) {
        alias->vectorcall = ga_vectorcall;
    }
    else {
        alias->vectorcall = NULL;
    }

    return 1;
}

static TyObject *
ga_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    if (!_TyArg_NoKeywords("GenericAlias", kwds)) {
        return NULL;
    }
    if (!_TyArg_CheckPositional("GenericAlias", TyTuple_GET_SIZE(args), 2, 2)) {
        return NULL;
    }
    TyObject *origin = TyTuple_GET_ITEM(args, 0);
    TyObject *arguments = TyTuple_GET_ITEM(args, 1);
    gaobject *self = (gaobject *)type->tp_alloc(type, 0);
    if (self == NULL) {
        return NULL;
    }
    if (!setup_ga(self, origin, arguments)) {
        Ty_DECREF(self);
        return NULL;
    }
    return (TyObject *)self;
}

static TyNumberMethods ga_as_number = {
        .nb_or = _Ty_union_type_or, // Add __or__ function
};

static TyObject *
ga_iternext(TyObject *op)
{
    gaiterobject *gi = (gaiterobject*)op;
    if (gi->obj == NULL) {
        TyErr_SetNone(TyExc_StopIteration);
        return NULL;
    }
    gaobject *alias = (gaobject *)gi->obj;
    TyObject *starred_alias = Ty_GenericAlias(alias->origin, alias->args);
    if (starred_alias == NULL) {
        return NULL;
    }
    ((gaobject *)starred_alias)->starred = true;
    Ty_SETREF(gi->obj, NULL);
    return starred_alias;
}

static void
ga_iter_dealloc(TyObject *op)
{
    gaiterobject *gi = (gaiterobject*)op;
    PyObject_GC_UnTrack(gi);
    Ty_XDECREF(gi->obj);
    PyObject_GC_Del(gi);
}

static int
ga_iter_traverse(TyObject *op, visitproc visit, void *arg)
{
    gaiterobject *gi = (gaiterobject*)op;
    Ty_VISIT(gi->obj);
    return 0;
}

static int
ga_iter_clear(TyObject *self)
{
    gaiterobject *gi = (gaiterobject *)self;
    Ty_CLEAR(gi->obj);
    return 0;
}

static TyObject *
ga_iter_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *iter = _TyEval_GetBuiltin(&_Ty_ID(iter));
    gaiterobject *gi = (gaiterobject *)self;

    /* _TyEval_GetBuiltin can invoke arbitrary code,
     * call must be before access of iterator pointers.
     * see issue #101765 */

    if (gi->obj)
        return Ty_BuildValue("N(O)", iter, gi->obj);
    else
        return Ty_BuildValue("N(())", iter);
}

static TyMethodDef ga_iter_methods[] = {
    {"__reduce__", ga_iter_reduce, METH_NOARGS},
    {0}
};

// gh-91632: _Ty_GenericAliasIterType is exported  to be cleared
// in _PyTypes_FiniTypes.
TyTypeObject _Ty_GenericAliasIterType = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    .tp_name = "generic_alias_iterator",
    .tp_basicsize = sizeof(gaiterobject),
    .tp_iter = PyObject_SelfIter,
    .tp_iternext = ga_iternext,
    .tp_traverse = ga_iter_traverse,
    .tp_methods = ga_iter_methods,
    .tp_dealloc = ga_iter_dealloc,
    .tp_clear = ga_iter_clear,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
};

static TyObject *
ga_iter(TyObject *self) {
    gaiterobject *gi = PyObject_GC_New(gaiterobject, &_Ty_GenericAliasIterType);
    if (gi == NULL) {
        return NULL;
    }
    gi->obj = Ty_NewRef(self);
    PyObject_GC_Track(gi);
    return (TyObject *)gi;
}

// TODO:
// - argument clinic?
// - cache?
TyTypeObject Ty_GenericAliasType = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    .tp_name = "types.GenericAlias",
    .tp_doc = genericalias__doc__,
    .tp_basicsize = sizeof(gaobject),
    .tp_dealloc = ga_dealloc,
    .tp_repr = ga_repr,
    .tp_as_number = &ga_as_number,  // allow X | Y of GenericAlias objs
    .tp_as_mapping = &ga_as_mapping,
    .tp_hash = ga_hash,
    .tp_call = ga_call,
    .tp_getattro = ga_getattro,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_VECTORCALL,
    .tp_traverse = ga_traverse,
    .tp_richcompare = ga_richcompare,
    .tp_weaklistoffset = offsetof(gaobject, weakreflist),
    .tp_methods = ga_methods,
    .tp_members = ga_members,
    .tp_alloc = TyType_GenericAlloc,
    .tp_new = ga_new,
    .tp_free = PyObject_GC_Del,
    .tp_getset = ga_properties,
    .tp_iter = ga_iter,
    .tp_vectorcall_offset = offsetof(gaobject, vectorcall),
};

TyObject *
Ty_GenericAlias(TyObject *origin, TyObject *args)
{
    gaobject *alias = (gaobject*) TyType_GenericAlloc(
            (TyTypeObject *)&Ty_GenericAliasType, 0);
    if (alias == NULL) {
        return NULL;
    }
    if (!setup_ga(alias, origin, args)) {
        Ty_DECREF(alias);
        return NULL;
    }
    return (TyObject *)alias;
}
