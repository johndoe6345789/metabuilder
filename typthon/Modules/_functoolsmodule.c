#include "Python.h"
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_dict.h"          // _TyDict_Pop_KnownHash()
#include "pycore_long.h"          // _TyLong_GetZero()
#include "pycore_moduleobject.h"  // _TyModule_GetState()
#include "pycore_object.h"        // _TyObject_GC_TRACK
#include "pycore_pyatomic_ft_wrappers.h"
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_tuple.h"         // _TyTuple_ITEMS()
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()


#include "clinic/_functoolsmodule.c.h"
/*[clinic input]
module _functools
class _functools._lru_cache_wrapper "TyObject *" "&lru_cache_type_spec"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=bece4053896b09c0]*/

/* _functools module written and maintained
   by Hye-Shik Chang <perky@FreeBSD.org>
   with adaptations by Raymond Hettinger <python@rcn.com>
   Copyright (c) 2004 Typthon Software Foundation.
   All rights reserved.
*/

typedef struct _functools_state {
    /* this object is used delimit args and keywords in the cache keys */
    TyObject *kwd_mark;
    TyTypeObject *placeholder_type;
    TyObject *placeholder;  // strong reference (singleton)
    TyTypeObject *partial_type;
    TyTypeObject *keyobject_type;
    TyTypeObject *lru_list_elem_type;
} _functools_state;

static inline _functools_state *
get_functools_state(TyObject *module)
{
    void *state = _TyModule_GetState(module);
    assert(state != NULL);
    return (_functools_state *)state;
}

/* partial object **********************************************************/


// The 'Placeholder' singleton indicates which formal positional
// parameters are to be bound first when using a 'partial' object.

typedef struct {
    PyObject_HEAD
} placeholderobject;

static inline _functools_state *
get_functools_state_by_type(TyTypeObject *type);

TyDoc_STRVAR(placeholder_doc,
"The type of the Placeholder singleton.\n\n"
"Used as a placeholder for partial arguments.");

static TyObject *
placeholder_repr(TyObject *op)
{
    return TyUnicode_FromString("Placeholder");
}

static TyObject *
placeholder_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    return TyUnicode_FromString("Placeholder");
}

static TyMethodDef placeholder_methods[] = {
    {"__reduce__", placeholder_reduce, METH_NOARGS, NULL},
    {NULL, NULL}
};

static void
placeholder_dealloc(TyObject* self)
{
    PyObject_GC_UnTrack(self);
    TyTypeObject *tp = Ty_TYPE(self);
    tp->tp_free((TyObject*)self);
    Ty_DECREF(tp);
}

static TyObject *
placeholder_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    if (TyTuple_GET_SIZE(args) || (kwargs && TyDict_GET_SIZE(kwargs))) {
        TyErr_SetString(TyExc_TypeError, "PlaceholderType takes no arguments");
        return NULL;
    }
    _functools_state *state = get_functools_state_by_type(type);
    if (state->placeholder != NULL) {
        return Ty_NewRef(state->placeholder);
    }

    TyObject *placeholder = TyType_GenericNew(type, NULL, NULL);
    if (placeholder == NULL) {
        return NULL;
    }

    if (state->placeholder == NULL) {
        state->placeholder = Ty_NewRef(placeholder);
    }
    return placeholder;
}

static int
placeholder_traverse(TyObject *self, visitproc visit, void *arg)
{
    Ty_VISIT(Ty_TYPE(self));
    return 0;
}

static TyType_Slot placeholder_type_slots[] = {
    {Ty_tp_dealloc, placeholder_dealloc},
    {Ty_tp_repr, placeholder_repr},
    {Ty_tp_doc, (void *)placeholder_doc},
    {Ty_tp_methods, placeholder_methods},
    {Ty_tp_new, placeholder_new},
    {Ty_tp_traverse, placeholder_traverse},
    {0, 0}
};

static TyType_Spec placeholder_type_spec = {
    .name = "functools._PlaceholderType",
    .basicsize = sizeof(placeholderobject),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_HAVE_GC,
    .slots = placeholder_type_slots
};


typedef struct {
    PyObject_HEAD
    TyObject *fn;
    TyObject *args;
    TyObject *kw;
    TyObject *dict;        /* __dict__ */
    TyObject *weakreflist; /* List of weak references */
    TyObject *placeholder; /* Placeholder for positional arguments */
    Ty_ssize_t phcount;    /* Number of placeholders */
    vectorcallfunc vectorcall;
} partialobject;

// cast a TyObject pointer PTR to a partialobject pointer (no type checks)
#define partialobject_CAST(op)  ((partialobject *)(op))

static void partial_setvectorcall(partialobject *pto);
static struct TyModuleDef _functools_module;
static TyObject *
partial_call(TyObject *pto, TyObject *args, TyObject *kwargs);

static inline _functools_state *
get_functools_state_by_type(TyTypeObject *type)
{
    TyObject *module = TyType_GetModuleByDef(type, &_functools_module);
    if (module == NULL) {
        return NULL;
    }
    return get_functools_state(module);
}

// Not converted to argument clinic, because of `*args, **kwargs` arguments.
static TyObject *
partial_new(TyTypeObject *type, TyObject *args, TyObject *kw)
{
    TyObject *func, *pto_args, *new_args, *pto_kw, *phold;
    partialobject *pto;
    Ty_ssize_t pto_phcount = 0;
    Ty_ssize_t new_nargs = TyTuple_GET_SIZE(args) - 1;

    if (new_nargs < 0) {
        TyErr_SetString(TyExc_TypeError,
                        "type 'partial' takes at least one argument");
        return NULL;
    }
    func = TyTuple_GET_ITEM(args, 0);
    if (!PyCallable_Check(func)) {
        TyErr_SetString(TyExc_TypeError,
                        "the first argument must be callable");
        return NULL;
    }

    _functools_state *state = get_functools_state_by_type(type);
    if (state == NULL) {
        return NULL;
    }
    phold = state->placeholder;

    /* Placeholder restrictions */
    if (new_nargs && TyTuple_GET_ITEM(args, new_nargs) == phold) {
        TyErr_SetString(TyExc_TypeError,
                        "trailing Placeholders are not allowed");
        return NULL;
    }

    /* keyword Placeholder prohibition */
    if (kw != NULL) {
        TyObject *key, *val;
        Ty_ssize_t pos = 0;
        while (TyDict_Next(kw, &pos, &key, &val)) {
            if (val == phold) {
                TyErr_SetString(TyExc_TypeError,
                                "Placeholder cannot be passed as a keyword argument");
                return NULL;
            }
        }
    }

    /* check wrapped function / object */
    pto_args = pto_kw = NULL;
    int res = PyObject_TypeCheck(func, state->partial_type);
    if (res == -1) {
        return NULL;
    }
    if (res == 1) {
        // We can use its underlying function directly and merge the arguments.
        partialobject *part = (partialobject *)func;
        if (part->dict == NULL) {
            pto_args = part->args;
            pto_kw = part->kw;
            func = part->fn;
            pto_phcount = part->phcount;
            assert(TyTuple_Check(pto_args));
            assert(TyDict_Check(pto_kw));
        }
    }

    /* create partialobject structure */
    pto = (partialobject *)type->tp_alloc(type, 0);
    if (pto == NULL)
        return NULL;

    pto->fn = Ty_NewRef(func);
    pto->placeholder = phold;

    new_args = TyTuple_GetSlice(args, 1, new_nargs + 1);
    if (new_args == NULL) {
        Ty_DECREF(pto);
        return NULL;
    }

    /* Count placeholders */
    Ty_ssize_t phcount = 0;
    for (Ty_ssize_t i = 0; i < new_nargs - 1; i++) {
        if (TyTuple_GET_ITEM(new_args, i) == phold) {
            phcount++;
        }
    }
    /* merge args with args of `func` which is `partial` */
    if (pto_phcount > 0 && new_nargs > 0) {
        Ty_ssize_t npargs = TyTuple_GET_SIZE(pto_args);
        Ty_ssize_t tot_nargs = npargs;
        if (new_nargs > pto_phcount) {
            tot_nargs += new_nargs - pto_phcount;
        }
        TyObject *item;
        TyObject *tot_args = TyTuple_New(tot_nargs);
        for (Ty_ssize_t i = 0, j = 0; i < tot_nargs; i++) {
            if (i < npargs) {
                item = TyTuple_GET_ITEM(pto_args, i);
                if (j < new_nargs && item == phold) {
                    item = TyTuple_GET_ITEM(new_args, j);
                    j++;
                    pto_phcount--;
                }
            }
            else {
                item = TyTuple_GET_ITEM(new_args, j);
                j++;
            }
            Ty_INCREF(item);
            TyTuple_SET_ITEM(tot_args, i, item);
        }
        pto->args = tot_args;
        pto->phcount = pto_phcount + phcount;
        Ty_DECREF(new_args);
    }
    else if (pto_args == NULL) {
        pto->args = new_args;
        pto->phcount = phcount;
    }
    else {
        pto->args = PySequence_Concat(pto_args, new_args);
        pto->phcount = pto_phcount + phcount;
        Ty_DECREF(new_args);
        if (pto->args == NULL) {
            Ty_DECREF(pto);
            return NULL;
        }
        assert(TyTuple_Check(pto->args));
    }

    if (pto_kw == NULL || TyDict_GET_SIZE(pto_kw) == 0) {
        if (kw == NULL) {
            pto->kw = TyDict_New();
        }
        else if (Ty_REFCNT(kw) == 1) {
            pto->kw = Ty_NewRef(kw);
        }
        else {
            pto->kw = TyDict_Copy(kw);
        }
    }
    else {
        pto->kw = TyDict_Copy(pto_kw);
        if (kw != NULL && pto->kw != NULL) {
            if (TyDict_Merge(pto->kw, kw, 1) != 0) {
                Ty_DECREF(pto);
                return NULL;
            }
        }
    }
    if (pto->kw == NULL) {
        Ty_DECREF(pto);
        return NULL;
    }

    partial_setvectorcall(pto);
    return (TyObject *)pto;
}

static int
partial_clear(TyObject *self)
{
    partialobject *pto = partialobject_CAST(self);
    Ty_CLEAR(pto->fn);
    Ty_CLEAR(pto->args);
    Ty_CLEAR(pto->kw);
    Ty_CLEAR(pto->dict);
    return 0;
}

static int
partial_traverse(TyObject *self, visitproc visit, void *arg)
{
    partialobject *pto = partialobject_CAST(self);
    Ty_VISIT(Ty_TYPE(pto));
    Ty_VISIT(pto->fn);
    Ty_VISIT(pto->args);
    Ty_VISIT(pto->kw);
    Ty_VISIT(pto->dict);
    return 0;
}

static void
partial_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    /* bpo-31095: UnTrack is needed before calling any callbacks */
    PyObject_GC_UnTrack(self);
    FT_CLEAR_WEAKREFS(self, partialobject_CAST(self)->weakreflist);
    (void)partial_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static TyObject *
partial_descr_get(TyObject *self, TyObject *obj, TyObject *type)
{
    if (obj == Ty_None || obj == NULL) {
        return Ty_NewRef(self);
    }
    return TyMethod_New(self, obj);
}

/* Merging keyword arguments using the vectorcall convention is messy, so
 * if we would need to do that, we stop using vectorcall and fall back
 * to using partial_call() instead. */
Ty_NO_INLINE static TyObject *
partial_vectorcall_fallback(TyThreadState *tstate, partialobject *pto,
                            TyObject *const *args, size_t nargsf,
                            TyObject *kwnames)
{
    pto->vectorcall = NULL;
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    return _TyObject_MakeTpCall(tstate, (TyObject *)pto, args, nargs, kwnames);
}

static TyObject *
partial_vectorcall(TyObject *self, TyObject *const *args,
                   size_t nargsf, TyObject *kwnames)
{
    partialobject *pto = partialobject_CAST(self);;
    TyThreadState *tstate = _TyThreadState_GET();
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);

    /* pto->kw is mutable, so need to check every time */
    if (TyDict_GET_SIZE(pto->kw)) {
        return partial_vectorcall_fallback(tstate, pto, args, nargsf, kwnames);
    }
    Ty_ssize_t pto_phcount = pto->phcount;
    if (nargs < pto_phcount) {
        TyErr_Format(TyExc_TypeError,
                     "missing positional arguments in 'partial' call; "
                     "expected at least %zd, got %zd", pto_phcount, nargs);
        return NULL;
    }

    Ty_ssize_t nargskw = nargs;
    if (kwnames != NULL) {
        nargskw += TyTuple_GET_SIZE(kwnames);
    }

    TyObject **pto_args = _TyTuple_ITEMS(pto->args);
    Ty_ssize_t pto_nargs = TyTuple_GET_SIZE(pto->args);

    /* Fast path if we're called without arguments */
    if (nargskw == 0) {
        return _TyObject_VectorcallTstate(tstate, pto->fn,
                                          pto_args, pto_nargs, NULL);
    }

    /* Fast path using PY_VECTORCALL_ARGUMENTS_OFFSET to prepend a single
     * positional argument */
    if (pto_nargs == 1 && (nargsf & PY_VECTORCALL_ARGUMENTS_OFFSET)) {
        TyObject **newargs = (TyObject **)args - 1;
        TyObject *tmp = newargs[0];
        newargs[0] = pto_args[0];
        TyObject *ret = _TyObject_VectorcallTstate(tstate, pto->fn,
                                                   newargs, nargs + 1, kwnames);
        newargs[0] = tmp;
        return ret;
    }

    TyObject *small_stack[_PY_FASTCALL_SMALL_STACK];
    TyObject **stack;

    Ty_ssize_t tot_nargskw = pto_nargs + nargskw - pto_phcount;
    if (tot_nargskw <= (Ty_ssize_t)Ty_ARRAY_LENGTH(small_stack)) {
        stack = small_stack;
    }
    else {
        stack = TyMem_Malloc(tot_nargskw * sizeof(TyObject *));
        if (stack == NULL) {
            TyErr_NoMemory();
            return NULL;
        }
    }

    Ty_ssize_t tot_nargs;
    if (pto_phcount) {
        tot_nargs = pto_nargs + nargs - pto_phcount;
        Ty_ssize_t j = 0;       // New args index
        for (Ty_ssize_t i = 0; i < pto_nargs; i++) {
            if (pto_args[i] == pto->placeholder) {
                stack[i] = args[j];
                j += 1;
            }
            else {
                stack[i] = pto_args[i];
            }
        }
        assert(j == pto_phcount);
        if (nargskw > pto_phcount) {
            memcpy(stack + pto_nargs, args + j, (nargskw - j) * sizeof(TyObject*));
        }
    }
    else {
        tot_nargs = pto_nargs + nargs;
        /* Copy to new stack, using borrowed references */
        memcpy(stack, pto_args, pto_nargs * sizeof(TyObject*));
        memcpy(stack + pto_nargs, args, nargskw * sizeof(TyObject*));
    }
    TyObject *ret = _TyObject_VectorcallTstate(tstate, pto->fn,
                                               stack, tot_nargs, kwnames);
    if (stack != small_stack) {
        TyMem_Free(stack);
    }
    return ret;
}

/* Set pto->vectorcall depending on the parameters of the partial object */
static void
partial_setvectorcall(partialobject *pto)
{
    if (PyVectorcall_Function(pto->fn) == NULL) {
        /* Don't use vectorcall if the underlying function doesn't support it */
        pto->vectorcall = NULL;
    }
    /* We could have a special case if there are no arguments,
     * but that is unlikely (why use partial without arguments?),
     * so we don't optimize that */
    else {
        pto->vectorcall = partial_vectorcall;
    }
}


// Not converted to argument clinic, because of `*args, **kwargs` arguments.
static TyObject *
partial_call(TyObject *self, TyObject *args, TyObject *kwargs)
{
    partialobject *pto = partialobject_CAST(self);
    assert(PyCallable_Check(pto->fn));
    assert(TyTuple_Check(pto->args));
    assert(TyDict_Check(pto->kw));

    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t pto_phcount = pto->phcount;
    if (nargs < pto_phcount) {
        TyErr_Format(TyExc_TypeError,
                     "missing positional arguments in 'partial' call; "
                     "expected at least %zd, got %zd", pto_phcount, nargs);
        return NULL;
    }

    /* Merge keywords */
    TyObject *tot_kw;
    if (TyDict_GET_SIZE(pto->kw) == 0) {
        /* kwargs can be NULL */
        tot_kw = Ty_XNewRef(kwargs);
    }
    else {
        /* bpo-27840, bpo-29318: dictionary of keyword parameters must be
           copied, because a function using "**kwargs" can modify the
           dictionary. */
        tot_kw = TyDict_Copy(pto->kw);
        if (tot_kw == NULL) {
            return NULL;
        }

        if (kwargs != NULL) {
            if (TyDict_Merge(tot_kw, kwargs, 1) != 0) {
                Ty_DECREF(tot_kw);
                return NULL;
            }
        }
    }

    /* Merge positional arguments */
    TyObject *tot_args;
    if (pto_phcount) {
        Ty_ssize_t pto_nargs = TyTuple_GET_SIZE(pto->args);
        Ty_ssize_t tot_nargs = pto_nargs + nargs - pto_phcount;
        assert(tot_nargs >= 0);
        tot_args = TyTuple_New(tot_nargs);
        if (tot_args == NULL) {
            Ty_XDECREF(tot_kw);
            return NULL;
        }
        TyObject *pto_args = pto->args;
        TyObject *item;
        Ty_ssize_t j = 0;   // New args index
        for (Ty_ssize_t i = 0; i < pto_nargs; i++) {
            item = TyTuple_GET_ITEM(pto_args, i);
            if (item == pto->placeholder) {
                item = TyTuple_GET_ITEM(args, j);
                j += 1;
            }
            Ty_INCREF(item);
            TyTuple_SET_ITEM(tot_args, i, item);
        }
        assert(j == pto_phcount);
        for (Ty_ssize_t i = pto_nargs; i < tot_nargs; i++) {
            item = TyTuple_GET_ITEM(args, j);
            Ty_INCREF(item);
            TyTuple_SET_ITEM(tot_args, i, item);
            j += 1;
        }
    }
    else {
        /* Note: tupleconcat() is optimized for empty tuples */
        tot_args = PySequence_Concat(pto->args, args);
        if (tot_args == NULL) {
            Ty_XDECREF(tot_kw);
            return NULL;
        }
    }

    TyObject *res = PyObject_Call(pto->fn, tot_args, tot_kw);
    Ty_DECREF(tot_args);
    Ty_XDECREF(tot_kw);
    return res;
}

TyDoc_STRVAR(partial_doc,
"partial(func, /, *args, **keywords)\n--\n\n\
Create a new function with partial application of the given arguments\n\
and keywords.");

#define OFF(x) offsetof(partialobject, x)
static TyMemberDef partial_memberlist[] = {
    {"func",            _Ty_T_OBJECT,       OFF(fn),        Py_READONLY,
     "function object to use in future partial calls"},
    {"args",            _Ty_T_OBJECT,       OFF(args),      Py_READONLY,
     "tuple of arguments to future partial calls"},
    {"keywords",        _Ty_T_OBJECT,       OFF(kw),        Py_READONLY,
     "dictionary of keyword arguments to future partial calls"},
    {"__weaklistoffset__", Ty_T_PYSSIZET,
     offsetof(partialobject, weakreflist), Py_READONLY},
    {"__dictoffset__", Ty_T_PYSSIZET,
     offsetof(partialobject, dict), Py_READONLY},
    {"__vectorcalloffset__", Ty_T_PYSSIZET,
     offsetof(partialobject, vectorcall), Py_READONLY},
    {NULL}  /* Sentinel */
};

static TyGetSetDef partial_getsetlist[] = {
    {"__dict__", PyObject_GenericGetDict, PyObject_GenericSetDict},
    {NULL} /* Sentinel */
};

static TyObject *
partial_repr(TyObject *self)
{
    partialobject *pto = partialobject_CAST(self);
    TyObject *result = NULL;
    TyObject *arglist;
    TyObject *mod;
    TyObject *name;
    Ty_ssize_t i, n;
    TyObject *key, *value;
    int status;

    status = Ty_ReprEnter(self);
    if (status != 0) {
        if (status < 0)
            return NULL;
        return TyUnicode_FromString("...");
    }

    arglist = Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
    if (arglist == NULL)
        goto done;
    /* Pack positional arguments */
    assert(TyTuple_Check(pto->args));
    n = TyTuple_GET_SIZE(pto->args);
    for (i = 0; i < n; i++) {
        Ty_SETREF(arglist, TyUnicode_FromFormat("%U, %R", arglist,
                                        TyTuple_GET_ITEM(pto->args, i)));
        if (arglist == NULL)
            goto done;
    }
    /* Pack keyword arguments */
    assert (TyDict_Check(pto->kw));
    for (i = 0; TyDict_Next(pto->kw, &i, &key, &value);) {
        /* Prevent key.__str__ from deleting the value. */
        Ty_INCREF(value);
        Ty_SETREF(arglist, TyUnicode_FromFormat("%U, %S=%R", arglist,
                                                key, value));
        Ty_DECREF(value);
        if (arglist == NULL)
            goto done;
    }

    mod = TyType_GetModuleName(Ty_TYPE(pto));
    if (mod == NULL) {
        goto error;
    }
    name = TyType_GetQualName(Ty_TYPE(pto));
    if (name == NULL) {
        Ty_DECREF(mod);
        goto error;
    }
    result = TyUnicode_FromFormat("%S.%S(%R%U)", mod, name, pto->fn, arglist);
    Ty_DECREF(mod);
    Ty_DECREF(name);
    Ty_DECREF(arglist);

 done:
    Ty_ReprLeave(self);
    return result;
 error:
    Ty_DECREF(arglist);
    Ty_ReprLeave(self);
    return NULL;
}

/* Pickle strategy:
   __reduce__ by itself doesn't support getting kwargs in the unpickle
   operation so we define a __setstate__ that replaces all the information
   about the partial.  If we only replaced part of it someone would use
   it as a hook to do strange things.
 */

static TyObject *
partial_reduce(TyObject *self, TyObject *Py_UNUSED(args))
{
    partialobject *pto = partialobject_CAST(self);
    return Ty_BuildValue("O(O)(OOOO)", Ty_TYPE(pto), pto->fn, pto->fn,
                         pto->args, pto->kw,
                         pto->dict ? pto->dict : Ty_None);
}

static TyObject *
partial_setstate(TyObject *self, TyObject *state)
{
    partialobject *pto = partialobject_CAST(self);
    TyObject *fn, *fnargs, *kw, *dict;

    if (!TyTuple_Check(state)) {
        TyErr_SetString(TyExc_TypeError, "invalid partial state");
        return NULL;
    }
    if (!TyArg_ParseTuple(state, "OOOO", &fn, &fnargs, &kw, &dict) ||
        !PyCallable_Check(fn) ||
        !TyTuple_Check(fnargs) ||
        (kw != Ty_None && !TyDict_Check(kw)))
    {
        TyErr_SetString(TyExc_TypeError, "invalid partial state");
        return NULL;
    }

    Ty_ssize_t nargs = TyTuple_GET_SIZE(fnargs);
    if (nargs && TyTuple_GET_ITEM(fnargs, nargs - 1) == pto->placeholder) {
        TyErr_SetString(TyExc_TypeError,
                        "trailing Placeholders are not allowed");
        return NULL;
    }
    /* Count placeholders */
    Ty_ssize_t phcount = 0;
    for (Ty_ssize_t i = 0; i < nargs - 1; i++) {
        if (TyTuple_GET_ITEM(fnargs, i) == pto->placeholder) {
            phcount++;
        }
    }

    if(!TyTuple_CheckExact(fnargs))
        fnargs = PySequence_Tuple(fnargs);
    else
        Ty_INCREF(fnargs);
    if (fnargs == NULL)
        return NULL;

    if (kw == Ty_None)
        kw = TyDict_New();
    else if(!TyDict_CheckExact(kw))
        kw = TyDict_Copy(kw);
    else
        Ty_INCREF(kw);
    if (kw == NULL) {
        Ty_DECREF(fnargs);
        return NULL;
    }

    if (dict == Ty_None)
        dict = NULL;
    else
        Ty_INCREF(dict);
    Ty_SETREF(pto->fn, Ty_NewRef(fn));
    Ty_SETREF(pto->args, fnargs);
    Ty_SETREF(pto->kw, kw);
    pto->phcount = phcount;
    Ty_XSETREF(pto->dict, dict);
    partial_setvectorcall(pto);
    Py_RETURN_NONE;
}

static TyMethodDef partial_methods[] = {
    {"__reduce__", partial_reduce, METH_NOARGS},
    {"__setstate__", partial_setstate, METH_O},
    {"__class_getitem__",    Ty_GenericAlias,
    METH_O|METH_CLASS,       TyDoc_STR("See PEP 585")},
    {NULL,              NULL}           /* sentinel */
};

static TyType_Slot partial_type_slots[] = {
    {Ty_tp_dealloc, partial_dealloc},
    {Ty_tp_repr, partial_repr},
    {Ty_tp_call, partial_call},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_setattro, PyObject_GenericSetAttr},
    {Ty_tp_doc, (void *)partial_doc},
    {Ty_tp_traverse, partial_traverse},
    {Ty_tp_clear, partial_clear},
    {Ty_tp_methods, partial_methods},
    {Ty_tp_members, partial_memberlist},
    {Ty_tp_getset, partial_getsetlist},
    {Ty_tp_descr_get, partial_descr_get},
    {Ty_tp_new, partial_new},
    {Ty_tp_free, PyObject_GC_Del},
    {0, 0}
};

static TyType_Spec partial_type_spec = {
    .name = "functools.partial",
    .basicsize = sizeof(partialobject),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
             Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_VECTORCALL |
             Ty_TPFLAGS_IMMUTABLETYPE,
    .slots = partial_type_slots
};


/* cmp_to_key ***************************************************************/

typedef struct {
    PyObject_HEAD
    TyObject *cmp;
    TyObject *object;
} keyobject;

#define keyobject_CAST(op)  ((keyobject *)(op))

static int
keyobject_clear(TyObject *op)
{
    keyobject *ko = keyobject_CAST(op);
    Ty_CLEAR(ko->cmp);
    Ty_CLEAR(ko->object);
    return 0;
}

static void
keyobject_dealloc(TyObject *ko)
{
    TyTypeObject *tp = Ty_TYPE(ko);
    PyObject_GC_UnTrack(ko);
    (void)keyobject_clear(ko);
    tp->tp_free(ko);
    Ty_DECREF(tp);
}

static int
keyobject_traverse(TyObject *op, visitproc visit, void *arg)
{
    keyobject *ko = keyobject_CAST(op);
    Ty_VISIT(Ty_TYPE(ko));
    Ty_VISIT(ko->cmp);
    Ty_VISIT(ko->object);
    return 0;
}

static TyMemberDef keyobject_members[] = {
    {"obj", _Ty_T_OBJECT,
     offsetof(keyobject, object), 0,
     TyDoc_STR("Value wrapped by a key function.")},
    {NULL}
};

static TyObject *
keyobject_text_signature(TyObject *Py_UNUSED(self), void *Py_UNUSED(ignored))
{
    return TyUnicode_FromString("(obj)");
}

static TyGetSetDef keyobject_getset[] = {
    {"__text_signature__", keyobject_text_signature, NULL},
    {NULL}
};

static TyObject *
keyobject_call(TyObject *ko, TyObject *args, TyObject *kwds);

static TyObject *
keyobject_richcompare(TyObject *ko, TyObject *other, int op);

static TyType_Slot keyobject_type_slots[] = {
    {Ty_tp_dealloc, keyobject_dealloc},
    {Ty_tp_call, keyobject_call},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_traverse, keyobject_traverse},
    {Ty_tp_clear, keyobject_clear},
    {Ty_tp_richcompare, keyobject_richcompare},
    {Ty_tp_members, keyobject_members},
    {Ty_tp_getset, keyobject_getset},
    {0, 0}
};

static TyType_Spec keyobject_type_spec = {
    .name = "functools.KeyWrapper",
    .basicsize = sizeof(keyobject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_DISALLOW_INSTANTIATION |
              Ty_TPFLAGS_HAVE_GC | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = keyobject_type_slots
};

static TyObject *
keyobject_call(TyObject *self, TyObject *args, TyObject *kwds)
{
    TyObject *object;
    keyobject *result;
    static char *kwargs[] = {"obj", NULL};
    keyobject *ko = keyobject_CAST(self);

    if (!TyArg_ParseTupleAndKeywords(args, kwds, "O:K", kwargs, &object))
        return NULL;

    result = PyObject_GC_New(keyobject, Ty_TYPE(ko));
    if (result == NULL) {
        return NULL;
    }
    result->cmp = Ty_NewRef(ko->cmp);
    result->object = Ty_NewRef(object);
    PyObject_GC_Track(result);
    return (TyObject *)result;
}

static TyObject *
keyobject_richcompare(TyObject *self, TyObject *other, int op)
{
    if (!Ty_IS_TYPE(other, Ty_TYPE(self))) {
        TyErr_Format(TyExc_TypeError, "other argument must be K instance");
        return NULL;
    }

    keyobject *lhs = keyobject_CAST(self);
    keyobject *rhs = keyobject_CAST(other);

    TyObject *compare = lhs->cmp;
    assert(compare != NULL);
    TyObject *x = lhs->object;
    TyObject *y = rhs->object;
    if (!x || !y){
        TyErr_Format(TyExc_AttributeError, "object");
        return NULL;
    }

    /* Call the user's comparison function and translate the 3-way
     * result into true or false (or error).
     */
    TyObject* args[2] = {x, y};
    TyObject *res = PyObject_Vectorcall(compare, args, 2, NULL);
    if (res == NULL) {
        return NULL;
    }

    TyObject *answer = PyObject_RichCompare(res, _TyLong_GetZero(), op);
    Ty_DECREF(res);
    return answer;
}

/*[clinic input]
_functools.cmp_to_key

    mycmp: object
        Function that compares two objects.

Convert a cmp= function into a key= function.
[clinic start generated code]*/

static TyObject *
_functools_cmp_to_key_impl(TyObject *module, TyObject *mycmp)
/*[clinic end generated code: output=71eaad0f4fc81f33 input=d1b76f231c0dfeb3]*/
{
    keyobject *object;
    _functools_state *state;

    state = get_functools_state(module);
    object = PyObject_GC_New(keyobject, state->keyobject_type);
    if (!object)
        return NULL;
    object->cmp = Ty_NewRef(mycmp);
    object->object = NULL;
    PyObject_GC_Track(object);
    return (TyObject *)object;
}

/* reduce (used to be a builtin) ********************************************/

/*[clinic input]
_functools.reduce

    function as func: object
    iterable as seq: object
    /
    initial as result: object = NULL

Apply a function of two arguments cumulatively to the items of an iterable, from left to right.

This effectively reduces the iterable to a single value.  If initial is present,
it is placed before the items of the iterable in the calculation, and serves as
a default when the iterable is empty.

For example, reduce(lambda x, y: x+y, [1, 2, 3, 4, 5])
calculates ((((1 + 2) + 3) + 4) + 5).
[clinic start generated code]*/

static TyObject *
_functools_reduce_impl(TyObject *module, TyObject *func, TyObject *seq,
                       TyObject *result)
/*[clinic end generated code: output=30d898fe1267c79d input=1511e9a8c38581ac]*/
{
    TyObject *args, *it;

    if (result != NULL)
        Ty_INCREF(result);

    it = PyObject_GetIter(seq);
    if (it == NULL) {
        if (TyErr_ExceptionMatches(TyExc_TypeError))
            TyErr_SetString(TyExc_TypeError,
                            "reduce() arg 2 must support iteration");
        Ty_XDECREF(result);
        return NULL;
    }

    if ((args = TyTuple_New(2)) == NULL)
        goto Fail;

    for (;;) {
        TyObject *op2;

        if (Ty_REFCNT(args) > 1) {
            Ty_DECREF(args);
            if ((args = TyTuple_New(2)) == NULL)
                goto Fail;
        }

        op2 = TyIter_Next(it);
        if (op2 == NULL) {
            if (TyErr_Occurred())
                goto Fail;
            break;
        }

        if (result == NULL)
            result = op2;
        else {
            /* Update the args tuple in-place */
            assert(Ty_REFCNT(args) == 1);
            Ty_XSETREF(_TyTuple_ITEMS(args)[0], result);
            Ty_XSETREF(_TyTuple_ITEMS(args)[1], op2);
            if ((result = PyObject_Call(func, args, NULL)) == NULL) {
                goto Fail;
            }
            // bpo-42536: The GC may have untracked this args tuple. Since we're
            // recycling it, make sure it's tracked again:
            _TyTuple_Recycle(args);
        }
    }

    Ty_DECREF(args);

    if (result == NULL)
        TyErr_SetString(TyExc_TypeError,
                        "reduce() of empty iterable with no initial value");

    Ty_DECREF(it);
    return result;

Fail:
    Ty_XDECREF(args);
    Ty_XDECREF(result);
    Ty_DECREF(it);
    return NULL;
}

/* lru_cache object **********************************************************/

/* There are four principal algorithmic differences from the pure python version:

   1). The C version relies on the GIL instead of having its own reentrant lock.

   2). The prev/next link fields use borrowed references.

   3). For a full cache, the pure python version rotates the location of the
       root entry so that it never has to move individual links and it can
       limit updates to just the key and result fields.  However, in the C
       version, links are temporarily removed while the cache dict updates are
       occurring. Afterwards, they are appended or prepended back into the
       doubly-linked lists.

   4)  In the Python version, the _HashSeq class is used to prevent __hash__
       from being called more than once.  In the C version, the "known hash"
       variants of dictionary calls as used to the same effect.

*/

struct lru_list_elem;
struct lru_cache_object;

typedef struct lru_list_elem {
    PyObject_HEAD
    struct lru_list_elem *prev, *next;  /* borrowed links */
    Ty_hash_t hash;
    TyObject *key, *result;
} lru_list_elem;

#define lru_list_elem_CAST(op)  ((lru_list_elem *)(op))

static void
lru_list_elem_dealloc(TyObject *op)
{
    lru_list_elem *link = lru_list_elem_CAST(op);
    TyTypeObject *tp = Ty_TYPE(link);
    Ty_XDECREF(link->key);
    Ty_XDECREF(link->result);
    tp->tp_free(link);
    Ty_DECREF(tp);
}

static TyType_Slot lru_list_elem_type_slots[] = {
    {Ty_tp_dealloc, lru_list_elem_dealloc},
    {0, 0}
};

static TyType_Spec lru_list_elem_type_spec = {
    .name = "functools._lru_list_elem",
    .basicsize = sizeof(lru_list_elem),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_DISALLOW_INSTANTIATION |
             Ty_TPFLAGS_IMMUTABLETYPE,
    .slots = lru_list_elem_type_slots
};


typedef TyObject *(*lru_cache_ternaryfunc)(struct lru_cache_object *, TyObject *, TyObject *);

typedef struct lru_cache_object {
    lru_list_elem root;  /* includes PyObject_HEAD */
    lru_cache_ternaryfunc wrapper;
    int typed;
    TyObject *cache;
    Ty_ssize_t hits;
    TyObject *func;
    Ty_ssize_t maxsize;
    Ty_ssize_t misses;
    /* the kwd_mark is used delimit args and keywords in the cache keys */
    TyObject *kwd_mark;
    TyTypeObject *lru_list_elem_type;
    TyObject *cache_info_type;
    TyObject *dict;
    TyObject *weakreflist;
} lru_cache_object;

#define lru_cache_object_CAST(op)   ((lru_cache_object *)(op))

static TyObject *
lru_cache_make_key(TyObject *kwd_mark, TyObject *args,
                   TyObject *kwds, int typed)
{
    TyObject *key, *keyword, *value;
    Ty_ssize_t key_size, pos, key_pos, kwds_size;

    kwds_size = kwds ? TyDict_GET_SIZE(kwds) : 0;

    /* short path, key will match args anyway, which is a tuple */
    if (!typed && !kwds_size) {
        if (TyTuple_GET_SIZE(args) == 1) {
            key = TyTuple_GET_ITEM(args, 0);
            if (TyUnicode_CheckExact(key) || TyLong_CheckExact(key)) {
                /* For common scalar keys, save space by
                   dropping the enclosing args tuple  */
                return Ty_NewRef(key);
            }
        }
        return Ty_NewRef(args);
    }

    key_size = TyTuple_GET_SIZE(args);
    if (kwds_size)
        key_size += kwds_size * 2 + 1;
    if (typed)
        key_size += TyTuple_GET_SIZE(args) + kwds_size;

    key = TyTuple_New(key_size);
    if (key == NULL)
        return NULL;

    key_pos = 0;
    for (pos = 0; pos < TyTuple_GET_SIZE(args); ++pos) {
        TyObject *item = TyTuple_GET_ITEM(args, pos);
        TyTuple_SET_ITEM(key, key_pos++, Ty_NewRef(item));
    }
    if (kwds_size) {
        TyTuple_SET_ITEM(key, key_pos++, Ty_NewRef(kwd_mark));
        for (pos = 0; TyDict_Next(kwds, &pos, &keyword, &value);) {
            TyTuple_SET_ITEM(key, key_pos++, Ty_NewRef(keyword));
            TyTuple_SET_ITEM(key, key_pos++, Ty_NewRef(value));
        }
        assert(key_pos == TyTuple_GET_SIZE(args) + kwds_size * 2 + 1);
    }
    if (typed) {
        for (pos = 0; pos < TyTuple_GET_SIZE(args); ++pos) {
            TyObject *item = (TyObject *)Ty_TYPE(TyTuple_GET_ITEM(args, pos));
            TyTuple_SET_ITEM(key, key_pos++, Ty_NewRef(item));
        }
        if (kwds_size) {
            for (pos = 0; TyDict_Next(kwds, &pos, &keyword, &value);) {
                TyObject *item = (TyObject *)Ty_TYPE(value);
                TyTuple_SET_ITEM(key, key_pos++, Ty_NewRef(item));
            }
        }
    }
    assert(key_pos == key_size);
    return key;
}

static TyObject *
uncached_lru_cache_wrapper(lru_cache_object *self, TyObject *args, TyObject *kwds)
{
    TyObject *result;

    FT_ATOMIC_ADD_SSIZE(self->misses, 1);
    result = PyObject_Call(self->func, args, kwds);
    if (!result)
        return NULL;
    return result;
}

static TyObject *
infinite_lru_cache_wrapper(lru_cache_object *self, TyObject *args, TyObject *kwds)
{
    TyObject *result;
    Ty_hash_t hash;
    TyObject *key = lru_cache_make_key(self->kwd_mark, args, kwds, self->typed);
    if (!key)
        return NULL;
    hash = PyObject_Hash(key);
    if (hash == -1) {
        Ty_DECREF(key);
        return NULL;
    }
    int res = _TyDict_GetItemRef_KnownHash((PyDictObject *)self->cache, key, hash, &result);
    if (res > 0) {
        FT_ATOMIC_ADD_SSIZE(self->hits, 1);
        Ty_DECREF(key);
        return result;
    }
    if (res < 0) {
        Ty_DECREF(key);
        return NULL;
    }
    FT_ATOMIC_ADD_SSIZE(self->misses, 1);
    result = PyObject_Call(self->func, args, kwds);
    if (!result) {
        Ty_DECREF(key);
        return NULL;
    }
    if (_TyDict_SetItem_KnownHash(self->cache, key, result, hash) < 0) {
        Ty_DECREF(result);
        Ty_DECREF(key);
        return NULL;
    }
    Ty_DECREF(key);
    return result;
}

static void
lru_cache_extract_link(lru_list_elem *link)
{
    lru_list_elem *link_prev = link->prev;
    lru_list_elem *link_next = link->next;
    link_prev->next = link->next;
    link_next->prev = link->prev;
}

static void
lru_cache_append_link(lru_cache_object *self, lru_list_elem *link)
{
    lru_list_elem *root = &self->root;
    lru_list_elem *last = root->prev;
    last->next = root->prev = link;
    link->prev = last;
    link->next = root;
}

static void
lru_cache_prepend_link(lru_cache_object *self, lru_list_elem *link)
{
    lru_list_elem *root = &self->root;
    lru_list_elem *first = root->next;
    first->prev = root->next = link;
    link->prev = root;
    link->next = first;
}

/* General note on reentrancy:

   There are four dictionary calls in the bounded_lru_cache_wrapper():
   1) The initial check for a cache match.  2) The post user-function
   check for a cache match.  3) The deletion of the oldest entry.
   4) The addition of the newest entry.

   In all four calls, we have a known hash which lets use avoid a call
   to __hash__().  That leaves only __eq__ as a possible source of a
   reentrant call.

   The __eq__ method call is always made for a cache hit (dict access #1).
   Accordingly, we have make sure not modify the cache state prior to
   this call.

   The __eq__ method call is never made for the deletion (dict access #3)
   because it is an identity match.

   For the other two accesses (#2 and #4), calls to __eq__ only occur
   when some other entry happens to have an exactly matching hash (all
   64-bits).  Though rare, this can happen, so we have to make sure to
   either call it at the top of its code path before any cache
   state modifications (dict access #2) or be prepared to restore
   invariants at the end of the code path (dict access #4).

   Another possible source of reentrancy is a decref which can trigger
   arbitrary code execution.  To make the code easier to reason about,
   the decrefs are deferred to the end of the each possible code path
   so that we know the cache is a consistent state.
 */

static int
bounded_lru_cache_get_lock_held(lru_cache_object *self, TyObject *args, TyObject *kwds,
                                TyObject **result, TyObject **key, Ty_hash_t *hash)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(self);
    lru_list_elem *link;

    TyObject *key_ = *key = lru_cache_make_key(self->kwd_mark, args, kwds, self->typed);
    if (!key_)
        return -1;
    Ty_hash_t hash_ = *hash = PyObject_Hash(key_);
    if (hash_ == -1) {
        Ty_DECREF(key_);  /* dead reference left in *key, is not used */
        return -1;
    }
    int res = _TyDict_GetItemRef_KnownHash_LockHeld((PyDictObject *)self->cache, key_, hash_,
                                                    (TyObject **)&link);
    if (res > 0) {
        lru_cache_extract_link(link);
        lru_cache_append_link(self, link);
        *result = link->result;
        FT_ATOMIC_ADD_SSIZE(self->hits, 1);
        Ty_INCREF(link->result);
        Ty_DECREF(link);
        Ty_DECREF(key_);
        return 1;
    }
    if (res < 0) {
        Ty_DECREF(key_);
        return -1;
    }
    FT_ATOMIC_ADD_SSIZE(self->misses, 1);
    return 0;
}

static TyObject *
bounded_lru_cache_update_lock_held(lru_cache_object *self,
                                   TyObject *result, TyObject *key, Ty_hash_t hash)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(self);
    lru_list_elem *link;
    TyObject *testresult;
    int res;

    if (!result) {
        Ty_DECREF(key);
        return NULL;
    }
    res = _TyDict_GetItemRef_KnownHash_LockHeld((PyDictObject *)self->cache, key, hash,
                                                &testresult);
    if (res > 0) {
        /* Getting here means that this same key was added to the cache
           during the PyObject_Call().  Since the link update is already
           done, we need only return the computed result. */
        Ty_DECREF(testresult);
        Ty_DECREF(key);
        return result;
    }
    if (res < 0) {
        /* This is an unusual case since this same lookup
           did not previously trigger an error during lookup.
           Treat it the same as an error in user function
           and return with the error set. */
        Ty_DECREF(key);
        Ty_DECREF(result);
        return NULL;
    }
    /* This is the normal case.  The new key wasn't found before
       user function call and it is still not there.  So we
       proceed normally and update the cache with the new result. */

    assert(self->maxsize > 0);
    if (TyDict_GET_SIZE(self->cache) < self->maxsize ||
        self->root.next == &self->root)
    {
        /* Cache is not full, so put the result in a new link */
        link = (lru_list_elem *)PyObject_New(lru_list_elem,
                                             self->lru_list_elem_type);
        if (link == NULL) {
            Ty_DECREF(key);
            Ty_DECREF(result);
            return NULL;
        }

        link->hash = hash;
        link->key = key;
        link->result = result;
        /* What is really needed here is a SetItem variant with a "no clobber"
           option.  If the __eq__ call triggers a reentrant call that adds
           this same key, then this setitem call will update the cache dict
           with this new link, leaving the old link as an orphan (i.e. not
           having a cache dict entry that refers to it). */
        if (_TyDict_SetItem_KnownHash_LockHeld((PyDictObject *)self->cache, key,
                                               (TyObject *)link, hash) < 0) {
            Ty_DECREF(link);
            return NULL;
        }
        lru_cache_append_link(self, link);
        return Ty_NewRef(result);
    }
    /* Since the cache is full, we need to evict an old key and add
       a new key.  Rather than free the old link and allocate a new
       one, we reuse the link for the new key and result and move it
       to front of the cache to mark it as recently used.

       We try to assure all code paths (including errors) leave all
       of the links in place.  Either the link is successfully
       updated and moved or it is restored to its old position.
       However if an unrecoverable error is found, it doesn't
       make sense to reinsert the link, so we leave it out
       and the cache will no longer register as full.
    */
    TyObject *oldkey, *oldresult, *popresult;

    /* Extract the oldest item. */
    assert(self->root.next != &self->root);
    link = self->root.next;
    lru_cache_extract_link(link);
    /* Remove it from the cache.
       The cache dict holds one reference to the link.
       We created one other reference when the link was created.
       The linked list only has borrowed references. */
    res = _TyDict_Pop_KnownHash((PyDictObject*)self->cache, link->key,
                                link->hash, &popresult);
    if (res < 0) {
        /* An error arose while trying to remove the oldest key (the one
           being evicted) from the cache.  We restore the link to its
           original position as the oldest link.  Then we allow the
           error propagate upward; treating it the same as an error
           arising in the user function. */
        lru_cache_prepend_link(self, link);
        Ty_DECREF(key);
        Ty_DECREF(result);
        return NULL;
    }
    if (res == 0) {
        /* Getting here means that the user function call or another
           thread has already removed the old key from the dictionary.
           This link is now an orphan.  Since we don't want to leave the
           cache in an inconsistent state, we don't restore the link. */
        assert(popresult == NULL);
        Ty_DECREF(link);
        Ty_DECREF(key);
        return result;
    }

    /* Keep a reference to the old key and old result to prevent their
       ref counts from going to zero during the update. That will
       prevent potentially arbitrary object clean-up code (i.e. __del__)
       from running while we're still adjusting the links. */
    assert(popresult != NULL);
    oldkey = link->key;
    oldresult = link->result;

    link->hash = hash;
    link->key = key;
    link->result = result;
    /* Note:  The link is being added to the cache dict without the
       prev and next fields set to valid values.   We have to wait
       for successful insertion in the cache dict before adding the
       link to the linked list.  Otherwise, the potentially reentrant
       __eq__ call could cause the then orphan link to be visited. */
    if (_TyDict_SetItem_KnownHash_LockHeld((PyDictObject *)self->cache, key,
                                           (TyObject *)link, hash) < 0) {
        /* Somehow the cache dict update failed.  We no longer can
           restore the old link.  Let the error propagate upward and
           leave the cache short one link. */
        Ty_DECREF(popresult);
        Ty_DECREF(link);
        Ty_DECREF(oldkey);
        Ty_DECREF(oldresult);
        return NULL;
    }
    lru_cache_append_link(self, link);
    Ty_INCREF(result); /* for return */
    Ty_DECREF(popresult);
    Ty_DECREF(oldkey);
    Ty_DECREF(oldresult);
    return result;
}

static TyObject *
bounded_lru_cache_wrapper(lru_cache_object *self, TyObject *args, TyObject *kwds)
{
    TyObject *key, *result;
    Ty_hash_t hash;
    int res;

    Ty_BEGIN_CRITICAL_SECTION(self);
    res = bounded_lru_cache_get_lock_held(self, args, kwds, &result, &key, &hash);
    Ty_END_CRITICAL_SECTION();

    if (res < 0) {
        return NULL;
    }
    if (res > 0) {
        return result;
    }

    result = PyObject_Call(self->func, args, kwds);

    Ty_BEGIN_CRITICAL_SECTION(self);
    /* Note:  key will be stolen in the below function, and
       result may be stolen or sometimes re-returned as a passthrough.
       Treat both as being stolen.
     */
    result = bounded_lru_cache_update_lock_held(self, result, key, hash);
    Ty_END_CRITICAL_SECTION();

    return result;
}

static TyObject *
lru_cache_new(TyTypeObject *type, TyObject *args, TyObject *kw)
{
    TyObject *func, *maxsize_O, *cache_info_type, *cachedict;
    int typed;
    lru_cache_object *obj;
    Ty_ssize_t maxsize;
    TyObject *(*wrapper)(lru_cache_object *, TyObject *, TyObject *);
    _functools_state *state;
    static char *keywords[] = {"user_function", "maxsize", "typed",
                               "cache_info_type", NULL};

    if (!TyArg_ParseTupleAndKeywords(args, kw, "OOpO:lru_cache", keywords,
                                     &func, &maxsize_O, &typed,
                                     &cache_info_type)) {
        return NULL;
    }

    if (!PyCallable_Check(func)) {
        TyErr_SetString(TyExc_TypeError,
                        "the first argument must be callable");
        return NULL;
    }

    state = get_functools_state_by_type(type);
    if (state == NULL) {
        return NULL;
    }

    /* select the caching function, and make/inc maxsize_O */
    if (maxsize_O == Ty_None) {
        wrapper = infinite_lru_cache_wrapper;
        /* use this only to initialize lru_cache_object attribute maxsize */
        maxsize = -1;
    } else if (PyIndex_Check(maxsize_O)) {
        maxsize = PyNumber_AsSsize_t(maxsize_O, TyExc_OverflowError);
        if (maxsize == -1 && TyErr_Occurred())
            return NULL;
        if (maxsize < 0) {
            maxsize = 0;
        }
        if (maxsize == 0)
            wrapper = uncached_lru_cache_wrapper;
        else
            wrapper = bounded_lru_cache_wrapper;
    } else {
        TyErr_SetString(TyExc_TypeError, "maxsize should be integer or None");
        return NULL;
    }

    if (!(cachedict = TyDict_New()))
        return NULL;

    obj = (lru_cache_object *)type->tp_alloc(type, 0);
    if (obj == NULL) {
        Ty_DECREF(cachedict);
        return NULL;
    }

    obj->root.prev = &obj->root;
    obj->root.next = &obj->root;
    obj->wrapper = wrapper;
    obj->typed = typed;
    obj->cache = cachedict;
    obj->func = Ty_NewRef(func);
    obj->misses = obj->hits = 0;
    obj->maxsize = maxsize;
    obj->kwd_mark = Ty_NewRef(state->kwd_mark);
    obj->lru_list_elem_type = (TyTypeObject*)Ty_NewRef(state->lru_list_elem_type);
    obj->cache_info_type = Ty_NewRef(cache_info_type);
    obj->dict = NULL;
    obj->weakreflist = NULL;
    return (TyObject *)obj;
}

static lru_list_elem *
lru_cache_unlink_list(lru_cache_object *self)
{
    lru_list_elem *root = &self->root;
    lru_list_elem *link = root->next;
    if (link == root)
        return NULL;
    root->prev->next = NULL;
    root->next = root->prev = root;
    return link;
}

static void
lru_cache_clear_list(lru_list_elem *link)
{
    while (link != NULL) {
        lru_list_elem *next = link->next;
        Ty_SETREF(link, next);
    }
}

static int
lru_cache_tp_clear(TyObject *op)
{
    lru_cache_object *self = lru_cache_object_CAST(op);
    lru_list_elem *list = lru_cache_unlink_list(self);
    Ty_CLEAR(self->cache);
    Ty_CLEAR(self->func);
    Ty_CLEAR(self->kwd_mark);
    Ty_CLEAR(self->lru_list_elem_type);
    Ty_CLEAR(self->cache_info_type);
    Ty_CLEAR(self->dict);
    lru_cache_clear_list(list);
    return 0;
}

static void
lru_cache_dealloc(TyObject *op)
{
    lru_cache_object *obj = lru_cache_object_CAST(op);
    TyTypeObject *tp = Ty_TYPE(obj);
    /* bpo-31095: UnTrack is needed before calling any callbacks */
    PyObject_GC_UnTrack(obj);
    FT_CLEAR_WEAKREFS(op, obj->weakreflist);

    (void)lru_cache_tp_clear(op);
    tp->tp_free(obj);
    Ty_DECREF(tp);
}

static TyObject *
lru_cache_call(TyObject *op, TyObject *args, TyObject *kwds)
{
    lru_cache_object *self = lru_cache_object_CAST(op);
    TyObject *result;
    result = self->wrapper(self, args, kwds);
    return result;
}

static TyObject *
lru_cache_descr_get(TyObject *self, TyObject *obj, TyObject *type)
{
    if (obj == Ty_None || obj == NULL) {
        return Ty_NewRef(self);
    }
    return TyMethod_New(self, obj);
}

/*[clinic input]
@critical_section
_functools._lru_cache_wrapper.cache_info

Report cache statistics
[clinic start generated code]*/

static TyObject *
_functools__lru_cache_wrapper_cache_info_impl(TyObject *self)
/*[clinic end generated code: output=cc796a0b06dbd717 input=00e1acb31aa21ecc]*/
{
    lru_cache_object *_self = (lru_cache_object *) self;
    if (_self->maxsize == -1) {
        return PyObject_CallFunction(_self->cache_info_type, "nnOn",
                                     FT_ATOMIC_LOAD_SSIZE_RELAXED(_self->hits),
                                     FT_ATOMIC_LOAD_SSIZE_RELAXED(_self->misses),
                                     Ty_None,
                                     TyDict_GET_SIZE(_self->cache));
    }
    return PyObject_CallFunction(_self->cache_info_type, "nnnn",
                                 FT_ATOMIC_LOAD_SSIZE_RELAXED(_self->hits),
                                 FT_ATOMIC_LOAD_SSIZE_RELAXED(_self->misses),
                                 _self->maxsize,
                                 TyDict_GET_SIZE(_self->cache));
}

/*[clinic input]
@critical_section
_functools._lru_cache_wrapper.cache_clear

Clear the cache and cache statistics
[clinic start generated code]*/

static TyObject *
_functools__lru_cache_wrapper_cache_clear_impl(TyObject *self)
/*[clinic end generated code: output=58423b35efc3e381 input=dfa33acbecf8b4b2]*/
{
    lru_cache_object *_self = (lru_cache_object *) self;
    lru_list_elem *list = lru_cache_unlink_list(_self);
    FT_ATOMIC_STORE_SSIZE_RELAXED(_self->hits, 0);
    FT_ATOMIC_STORE_SSIZE_RELAXED(_self->misses, 0);
    if (_self->wrapper == bounded_lru_cache_wrapper) {
        /* The critical section on the lru cache itself protects the dictionary
           for bounded_lru_cache instances. */
        _TyDict_Clear_LockHeld(_self->cache);
    } else {
        TyDict_Clear(_self->cache);
    }
    lru_cache_clear_list(list);
    Py_RETURN_NONE;
}

static TyObject *
lru_cache_reduce(TyObject *self, TyObject *Py_UNUSED(dummy))
{
    return PyObject_GetAttrString(self, "__qualname__");
}

static TyObject *
lru_cache_copy(TyObject *self, TyObject *Py_UNUSED(args))
{
    return Ty_NewRef(self);
}

static TyObject *
lru_cache_deepcopy(TyObject *self, TyObject *Py_UNUSED(args))
{
    return Ty_NewRef(self);
}

static int
lru_cache_tp_traverse(TyObject *op, visitproc visit, void *arg)
{
    lru_cache_object *self = lru_cache_object_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    lru_list_elem *link = self->root.next;
    while (link != &self->root) {
        lru_list_elem *next = link->next;
        Ty_VISIT(link->key);
        Ty_VISIT(link->result);
        Ty_VISIT(Ty_TYPE(link));
        link = next;
    }
    Ty_VISIT(self->cache);
    Ty_VISIT(self->func);
    Ty_VISIT(self->kwd_mark);
    Ty_VISIT(self->lru_list_elem_type);
    Ty_VISIT(self->cache_info_type);
    Ty_VISIT(self->dict);
    return 0;
}


TyDoc_STRVAR(lru_cache_doc,
"Create a cached callable that wraps another function.\n\
\n\
user_function:      the function being cached\n\
\n\
maxsize:  0         for no caching\n\
          None      for unlimited cache size\n\
          n         for a bounded cache\n\
\n\
typed:    False     cache f(3) and f(3.0) as identical calls\n\
          True      cache f(3) and f(3.0) as distinct calls\n\
\n\
cache_info_type:    namedtuple class with the fields:\n\
                        hits misses currsize maxsize\n"
);

static TyMethodDef lru_cache_methods[] = {
    _FUNCTOOLS__LRU_CACHE_WRAPPER_CACHE_INFO_METHODDEF
    _FUNCTOOLS__LRU_CACHE_WRAPPER_CACHE_CLEAR_METHODDEF
    {"__reduce__", lru_cache_reduce, METH_NOARGS},
    {"__copy__", lru_cache_copy, METH_VARARGS},
    {"__deepcopy__", lru_cache_deepcopy, METH_VARARGS},
    {NULL}
};

static TyGetSetDef lru_cache_getsetlist[] = {
    {"__dict__", PyObject_GenericGetDict, PyObject_GenericSetDict},
    {NULL}
};

static TyMemberDef lru_cache_memberlist[] = {
    {"__dictoffset__", Ty_T_PYSSIZET,
     offsetof(lru_cache_object, dict), Py_READONLY},
    {"__weaklistoffset__", Ty_T_PYSSIZET,
     offsetof(lru_cache_object, weakreflist), Py_READONLY},
    {NULL}  /* Sentinel */
};

static TyType_Slot lru_cache_type_slots[] = {
    {Ty_tp_dealloc, lru_cache_dealloc},
    {Ty_tp_call, lru_cache_call},
    {Ty_tp_doc, (void *)lru_cache_doc},
    {Ty_tp_traverse, lru_cache_tp_traverse},
    {Ty_tp_clear, lru_cache_tp_clear},
    {Ty_tp_methods, lru_cache_methods},
    {Ty_tp_members, lru_cache_memberlist},
    {Ty_tp_getset, lru_cache_getsetlist},
    {Ty_tp_descr_get, lru_cache_descr_get},
    {Ty_tp_new, lru_cache_new},
    {0, 0}
};

static TyType_Spec lru_cache_type_spec = {
    .name = "functools._lru_cache_wrapper",
    .basicsize = sizeof(lru_cache_object),
    .flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
             Ty_TPFLAGS_METHOD_DESCRIPTOR | Ty_TPFLAGS_IMMUTABLETYPE,
    .slots = lru_cache_type_slots
};


/* module level code ********************************************************/

TyDoc_STRVAR(_functools_doc,
"Tools that operate on functions.");

static TyMethodDef _functools_methods[] = {
    _FUNCTOOLS_REDUCE_METHODDEF
    _FUNCTOOLS_CMP_TO_KEY_METHODDEF
    {NULL,              NULL}           /* sentinel */
};

static int
_functools_exec(TyObject *module)
{
    _functools_state *state = get_functools_state(module);
    state->kwd_mark = _TyObject_CallNoArgs((TyObject *)&PyBaseObject_Type);
    if (state->kwd_mark == NULL) {
        return -1;
    }

    state->placeholder_type = (TyTypeObject *)TyType_FromModuleAndSpec(module,
        &placeholder_type_spec, NULL);
    if (state->placeholder_type == NULL) {
        return -1;
    }
    if (TyModule_AddType(module, state->placeholder_type) < 0) {
        return -1;
    }

    TyObject *placeholder = PyObject_CallNoArgs((TyObject *)state->placeholder_type);
    if (placeholder == NULL) {
        return -1;
    }
    if (TyModule_AddObjectRef(module, "Placeholder", placeholder) < 0) {
        Ty_DECREF(placeholder);
        return -1;
    }
    Ty_DECREF(placeholder);

    state->partial_type = (TyTypeObject *)TyType_FromModuleAndSpec(module,
        &partial_type_spec, NULL);
    if (state->partial_type == NULL) {
        return -1;
    }
    if (TyModule_AddType(module, state->partial_type) < 0) {
        return -1;
    }

    TyObject *lru_cache_type = TyType_FromModuleAndSpec(module,
        &lru_cache_type_spec, NULL);
    if (lru_cache_type == NULL) {
        return -1;
    }
    if (TyModule_AddType(module, (TyTypeObject *)lru_cache_type) < 0) {
        Ty_DECREF(lru_cache_type);
        return -1;
    }
    Ty_DECREF(lru_cache_type);

    state->keyobject_type = (TyTypeObject *)TyType_FromModuleAndSpec(module,
        &keyobject_type_spec, NULL);
    if (state->keyobject_type == NULL) {
        return -1;
    }
    // keyobject_type is used only internally.
    // So we don't expose it in module namespace.

    state->lru_list_elem_type = (TyTypeObject *)TyType_FromModuleAndSpec(
        module, &lru_list_elem_type_spec, NULL);
    if (state->lru_list_elem_type == NULL) {
        return -1;
    }
    // lru_list_elem is used only in _lru_cache_wrapper.
    // So we don't expose it in module namespace.

    return 0;
}

static int
_functools_traverse(TyObject *module, visitproc visit, void *arg)
{
    _functools_state *state = get_functools_state(module);
    Ty_VISIT(state->kwd_mark);
    Ty_VISIT(state->placeholder_type);
    Ty_VISIT(state->placeholder);
    Ty_VISIT(state->partial_type);
    Ty_VISIT(state->keyobject_type);
    Ty_VISIT(state->lru_list_elem_type);
    return 0;
}

static int
_functools_clear(TyObject *module)
{
    _functools_state *state = get_functools_state(module);
    Ty_CLEAR(state->kwd_mark);
    Ty_CLEAR(state->placeholder_type);
    Ty_CLEAR(state->placeholder);
    Ty_CLEAR(state->partial_type);
    Ty_CLEAR(state->keyobject_type);
    Ty_CLEAR(state->lru_list_elem_type);
    return 0;
}

static void
_functools_free(void *module)
{
    (void)_functools_clear((TyObject *)module);
}

static struct PyModuleDef_Slot _functools_slots[] = {
    {Ty_mod_exec, _functools_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef _functools_module = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_functools",
    .m_doc = _functools_doc,
    .m_size = sizeof(_functools_state),
    .m_methods = _functools_methods,
    .m_slots = _functools_slots,
    .m_traverse = _functools_traverse,
    .m_clear = _functools_clear,
    .m_free = _functools_free,
};

PyMODINIT_FUNC
PyInit__functools(void)
{
    return PyModuleDef_Init(&_functools_module);
}
