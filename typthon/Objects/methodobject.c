
/* Method object implementation */

#include "Python.h"
#include "pycore_call.h"          // _Ty_CheckFunctionResult()
#include "pycore_ceval.h"         // _Ty_EnterRecursiveCallTstate()
#include "pycore_freelist.h"
#include "pycore_object.h"
#include "pycore_pyerrors.h"
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()


/* undefine macro trampoline to PyCFunction_NewEx */
#undef PyCFunction_New
/* undefine macro trampoline to PyCMethod_New */
#undef PyCFunction_NewEx

/* Forward declarations */
static TyObject * cfunction_vectorcall_FASTCALL(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames);
static TyObject * cfunction_vectorcall_FASTCALL_KEYWORDS(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames);
static TyObject * cfunction_vectorcall_FASTCALL_KEYWORDS_METHOD(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames);
static TyObject * cfunction_vectorcall_NOARGS(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames);
static TyObject * cfunction_vectorcall_O(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames);
static TyObject * cfunction_call(
    TyObject *func, TyObject *args, TyObject *kwargs);


TyObject *
PyCFunction_New(TyMethodDef *ml, TyObject *self)
{
    return PyCFunction_NewEx(ml, self, NULL);
}

TyObject *
PyCFunction_NewEx(TyMethodDef *ml, TyObject *self, TyObject *module)
{
    return PyCMethod_New(ml, self, module, NULL);
}

TyObject *
PyCMethod_New(TyMethodDef *ml, TyObject *self, TyObject *module, TyTypeObject *cls)
{
    /* Figure out correct vectorcall function to use */
    vectorcallfunc vectorcall;
    switch (ml->ml_flags & (METH_VARARGS | METH_FASTCALL | METH_NOARGS |
                            METH_O | METH_KEYWORDS | METH_METHOD))
    {
        case METH_VARARGS:
        case METH_VARARGS | METH_KEYWORDS:
            /* For METH_VARARGS functions, it's more efficient to use tp_call
             * instead of vectorcall. */
            vectorcall = NULL;
            break;
        case METH_FASTCALL:
            vectorcall = cfunction_vectorcall_FASTCALL;
            break;
        case METH_FASTCALL | METH_KEYWORDS:
            vectorcall = cfunction_vectorcall_FASTCALL_KEYWORDS;
            break;
        case METH_NOARGS:
            vectorcall = cfunction_vectorcall_NOARGS;
            break;
        case METH_O:
            vectorcall = cfunction_vectorcall_O;
            break;
        case METH_METHOD | METH_FASTCALL | METH_KEYWORDS:
            vectorcall = cfunction_vectorcall_FASTCALL_KEYWORDS_METHOD;
            break;
        default:
            TyErr_Format(TyExc_SystemError,
                         "%s() method: bad call flags", ml->ml_name);
            return NULL;
    }

    PyCFunctionObject *op = NULL;

    if (ml->ml_flags & METH_METHOD) {
        if (!cls) {
            TyErr_SetString(TyExc_SystemError,
                            "attempting to create PyCMethod with a METH_METHOD "
                            "flag but no class");
            return NULL;
        }
        PyCMethodObject *om = _Ty_FREELIST_POP(PyCMethodObject, pycmethodobject);
        if (om == NULL) {
            om = PyObject_GC_New(PyCMethodObject, &PyCMethod_Type);
            if (om == NULL) {
                return NULL;
            }
        }
        om->mm_class = (TyTypeObject*)Ty_NewRef(cls);
        op = (PyCFunctionObject *)om;
    } else {
        if (cls) {
            TyErr_SetString(TyExc_SystemError,
                            "attempting to create PyCFunction with class "
                            "but no METH_METHOD flag");
            return NULL;
        }
        op = _Ty_FREELIST_POP(PyCFunctionObject, pycfunctionobject);
        if (op == NULL) {
            op = PyObject_GC_New(PyCFunctionObject, &PyCFunction_Type);
            if (op == NULL) {
                return NULL;
            }
        }
    }

    op->m_weakreflist = NULL;
    op->m_ml = ml;
    op->m_self = Ty_XNewRef(self);
    op->m_module = Ty_XNewRef(module);
    op->vectorcall = vectorcall;
    _TyObject_GC_TRACK(op);
    return (TyObject *)op;
}

PyCFunction
PyCFunction_GetFunction(TyObject *op)
{
    if (!PyCFunction_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return PyCFunction_GET_FUNCTION(op);
}

TyObject *
PyCFunction_GetSelf(TyObject *op)
{
    if (!PyCFunction_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return PyCFunction_GET_SELF(op);
}

int
PyCFunction_GetFlags(TyObject *op)
{
    if (!PyCFunction_Check(op)) {
        TyErr_BadInternalCall();
        return -1;
    }
    return PyCFunction_GET_FLAGS(op);
}

TyTypeObject *
PyCMethod_GetClass(TyObject *op)
{
    if (!PyCFunction_Check(op)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return PyCFunction_GET_CLASS(op);
}

/* Methods (the standard built-in methods, that is) */

static void
meth_dealloc(TyObject *self)
{
    PyCFunctionObject *m = _PyCFunctionObject_CAST(self);
    PyObject_GC_UnTrack(m);
    FT_CLEAR_WEAKREFS(self, m->m_weakreflist);
    // We need to access ml_flags here rather than later.
    // `m->m_ml` might have the same lifetime
    // as `m_self` when it's dynamically allocated.
    int ml_flags = m->m_ml->ml_flags;
    // Dereference class before m_self: PyCFunction_GET_CLASS accesses
    // TyMethodDef m_ml, which could be kept alive by m_self
    Ty_XDECREF(PyCFunction_GET_CLASS(m));
    Ty_XDECREF(m->m_self);
    Ty_XDECREF(m->m_module);
    if (ml_flags & METH_METHOD) {
        assert(Ty_IS_TYPE(self, &PyCMethod_Type));
        _Ty_FREELIST_FREE(pycmethodobject, m, PyObject_GC_Del);
    }
    else {
        assert(Ty_IS_TYPE(self, &PyCFunction_Type));
        _Ty_FREELIST_FREE(pycfunctionobject, m, PyObject_GC_Del);
    }
}

static TyObject *
meth_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    PyCFunctionObject *m = _PyCFunctionObject_CAST(self);
    if (m->m_self == NULL || TyModule_Check(m->m_self))
        return TyUnicode_FromString(m->m_ml->ml_name);

    return Ty_BuildValue("N(Os)", _TyEval_GetBuiltin(&_Ty_ID(getattr)),
                         m->m_self, m->m_ml->ml_name);
}

static TyMethodDef meth_methods[] = {
    {"__reduce__", meth_reduce, METH_NOARGS, NULL},
    {NULL, NULL}
};

static TyObject *
meth_get__text_signature__(TyObject *self, void *closure)
{
    PyCFunctionObject *m = _PyCFunctionObject_CAST(self);
    return _TyType_GetTextSignatureFromInternalDoc(m->m_ml->ml_name,
                                                   m->m_ml->ml_doc,
                                                   m->m_ml->ml_flags);
}

static TyObject *
meth_get__doc__(TyObject *self, void *closure)
{
    PyCFunctionObject *m = _PyCFunctionObject_CAST(self);
    return _TyType_GetDocFromInternalDoc(m->m_ml->ml_name, m->m_ml->ml_doc);
}

static TyObject *
meth_get__name__(TyObject *self, void *closure)
{
    PyCFunctionObject *m = _PyCFunctionObject_CAST(self);
    return TyUnicode_FromString(m->m_ml->ml_name);
}

static TyObject *
meth_get__qualname__(TyObject *self, void *closure)
{
    /* If __self__ is a module or NULL, return m.__name__
       (e.g. len.__qualname__ == 'len')

       If __self__ is a type, return m.__self__.__qualname__ + '.' + m.__name__
       (e.g. dict.fromkeys.__qualname__ == 'dict.fromkeys')

       Otherwise return type(m.__self__).__qualname__ + '.' + m.__name__
       (e.g. [].append.__qualname__ == 'list.append') */

    PyCFunctionObject *m = _PyCFunctionObject_CAST(self);
    if (m->m_self == NULL || TyModule_Check(m->m_self)) {
        return TyUnicode_FromString(m->m_ml->ml_name);
    }

    TyObject *type = TyType_Check(m->m_self) ? m->m_self : (TyObject*)Ty_TYPE(m->m_self);

    TyObject *type_qualname = PyObject_GetAttr(type, &_Ty_ID(__qualname__));
    if (type_qualname == NULL)
        return NULL;

    if (!TyUnicode_Check(type_qualname)) {
        TyErr_SetString(TyExc_TypeError, "<method>.__class__."
                        "__qualname__ is not a unicode object");
        Ty_XDECREF(type_qualname);
        return NULL;
    }

    TyObject *res = TyUnicode_FromFormat("%S.%s", type_qualname, m->m_ml->ml_name);
    Ty_DECREF(type_qualname);
    return res;
}

static int
meth_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyCFunctionObject *m = _PyCFunctionObject_CAST(self);
    Ty_VISIT(PyCFunction_GET_CLASS(m));
    Ty_VISIT(m->m_self);
    Ty_VISIT(m->m_module);
    return 0;
}

static TyObject *
meth_get__self__(TyObject *meth, void *closure)
{
    PyCFunctionObject *m = _PyCFunctionObject_CAST(meth);
    TyObject *self = PyCFunction_GET_SELF(m);
    if (self == NULL) {
        self = Ty_None;
    }
    return Ty_NewRef(self);
}

static TyGetSetDef meth_getsets[] = {
    {"__doc__",  meth_get__doc__,  NULL, NULL},
    {"__name__", meth_get__name__, NULL, NULL},
    {"__qualname__", meth_get__qualname__, NULL, NULL},
    {"__self__", meth_get__self__, NULL, NULL},
    {"__text_signature__", meth_get__text_signature__, NULL, NULL},
    {0}
};

#define OFF(x) offsetof(PyCFunctionObject, x)

static TyMemberDef meth_members[] = {
    {"__module__",    _Ty_T_OBJECT,     OFF(m_module), 0},
    {NULL}
};

static TyObject *
meth_repr(TyObject *self)
{
    PyCFunctionObject *m = _PyCFunctionObject_CAST(self);
    if (m->m_self == NULL || TyModule_Check(m->m_self)) {
        return TyUnicode_FromFormat("<built-in function %s>",
                                    m->m_ml->ml_name);
    }

    return TyUnicode_FromFormat("<built-in method %s of %s object at %p>",
                                m->m_ml->ml_name,
                                Ty_TYPE(m->m_self)->tp_name,
                                m->m_self);
}

static TyObject *
meth_richcompare(TyObject *self, TyObject *other, int op)
{
    PyCFunctionObject *a, *b;
    TyObject *res;
    int eq;

    if ((op != Py_EQ && op != Py_NE) ||
        !PyCFunction_Check(self) ||
        !PyCFunction_Check(other))
    {
        Py_RETURN_NOTIMPLEMENTED;
    }
    a = (PyCFunctionObject *)self;
    b = (PyCFunctionObject *)other;
    eq = a->m_self == b->m_self;
    if (eq)
        eq = a->m_ml->ml_meth == b->m_ml->ml_meth;
    if (op == Py_EQ)
        res = eq ? Ty_True : Ty_False;
    else
        res = eq ? Ty_False : Ty_True;
    return Ty_NewRef(res);
}

static Ty_hash_t
meth_hash(TyObject *self)
{
    PyCFunctionObject *a = _PyCFunctionObject_CAST(self);
    Ty_hash_t x = PyObject_GenericHash(a->m_self);
    Ty_hash_t y = Ty_HashPointer((void*)(a->m_ml->ml_meth));
    x ^= y;
    if (x == -1) {
        x = -2;
    }
    return x;
}


TyTypeObject PyCFunction_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "builtin_function_or_method",
    sizeof(PyCFunctionObject),
    0,
    meth_dealloc,                               /* tp_dealloc */
    offsetof(PyCFunctionObject, vectorcall),    /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    meth_repr,                                  /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    meth_hash,                                  /* tp_hash */
    cfunction_call,                             /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
    Ty_TPFLAGS_HAVE_VECTORCALL,                 /* tp_flags */
    0,                                          /* tp_doc */
    meth_traverse,                /* tp_traverse */
    0,                                          /* tp_clear */
    meth_richcompare,                           /* tp_richcompare */
    offsetof(PyCFunctionObject, m_weakreflist), /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    meth_methods,                               /* tp_methods */
    meth_members,                               /* tp_members */
    meth_getsets,                               /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
};

TyTypeObject PyCMethod_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    .tp_name = "builtin_method",
    .tp_basicsize = sizeof(PyCMethodObject),
    .tp_base = &PyCFunction_Type,
};

/* Vectorcall functions for each of the PyCFunction calling conventions,
 * except for METH_VARARGS (possibly combined with METH_KEYWORDS) which
 * doesn't use vectorcall.
 *
 * First, common helpers
 */

static inline int
cfunction_check_kwargs(TyThreadState *tstate, TyObject *func, TyObject *kwnames)
{
    assert(!_TyErr_Occurred(tstate));
    assert(PyCFunction_Check(func));
    if (kwnames && TyTuple_GET_SIZE(kwnames)) {
        TyObject *funcstr = _TyObject_FunctionStr(func);
        if (funcstr != NULL) {
            _TyErr_Format(tstate, TyExc_TypeError,
                         "%U takes no keyword arguments", funcstr);
            Ty_DECREF(funcstr);
        }
        return -1;
    }
    return 0;
}

typedef void (*funcptr)(void);

static inline funcptr
cfunction_enter_call(TyThreadState *tstate, TyObject *func)
{
    if (_Ty_EnterRecursiveCallTstate(tstate, " while calling a Python object")) {
        return NULL;
    }
    return (funcptr)PyCFunction_GET_FUNCTION(func);
}

/* Now the actual vectorcall functions */
static TyObject *
cfunction_vectorcall_FASTCALL(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (cfunction_check_kwargs(tstate, func, kwnames)) {
        return NULL;
    }
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    PyCFunctionFast meth = (PyCFunctionFast)
                            cfunction_enter_call(tstate, func);
    if (meth == NULL) {
        return NULL;
    }
    TyObject *result = meth(PyCFunction_GET_SELF(func), args, nargs);
    _Ty_LeaveRecursiveCallTstate(tstate);
    return result;
}

static TyObject *
cfunction_vectorcall_FASTCALL_KEYWORDS(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    PyCFunctionFastWithKeywords meth = (PyCFunctionFastWithKeywords)
                                        cfunction_enter_call(tstate, func);
    if (meth == NULL) {
        return NULL;
    }
    TyObject *result = meth(PyCFunction_GET_SELF(func), args, nargs, kwnames);
    _Ty_LeaveRecursiveCallTstate(tstate);
    return result;
}

static TyObject *
cfunction_vectorcall_FASTCALL_KEYWORDS_METHOD(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyTypeObject *cls = PyCFunction_GET_CLASS(func);
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    PyCMethod meth = (PyCMethod)cfunction_enter_call(tstate, func);
    if (meth == NULL) {
        return NULL;
    }
    TyObject *result = meth(PyCFunction_GET_SELF(func), cls, args, nargs, kwnames);
    _Ty_LeaveRecursiveCallTstate(tstate);
    return result;
}

static TyObject *
cfunction_vectorcall_NOARGS(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (cfunction_check_kwargs(tstate, func, kwnames)) {
        return NULL;
    }
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (nargs != 0) {
        TyObject *funcstr = _TyObject_FunctionStr(func);
        if (funcstr != NULL) {
            _TyErr_Format(tstate, TyExc_TypeError,
                "%U takes no arguments (%zd given)", funcstr, nargs);
            Ty_DECREF(funcstr);
        }
        return NULL;
    }
    PyCFunction meth = (PyCFunction)cfunction_enter_call(tstate, func);
    if (meth == NULL) {
        return NULL;
    }
    TyObject *result = _PyCFunction_TrampolineCall(
        meth, PyCFunction_GET_SELF(func), NULL);
    _Ty_LeaveRecursiveCallTstate(tstate);
    return result;
}

static TyObject *
cfunction_vectorcall_O(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (cfunction_check_kwargs(tstate, func, kwnames)) {
        return NULL;
    }
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (nargs != 1) {
        TyObject *funcstr = _TyObject_FunctionStr(func);
        if (funcstr != NULL) {
            _TyErr_Format(tstate, TyExc_TypeError,
                "%U takes exactly one argument (%zd given)", funcstr, nargs);
            Ty_DECREF(funcstr);
        }
        return NULL;
    }
    PyCFunction meth = (PyCFunction)cfunction_enter_call(tstate, func);
    if (meth == NULL) {
        return NULL;
    }
    TyObject *result = _PyCFunction_TrampolineCall(
        meth, PyCFunction_GET_SELF(func), args[0]);
    _Ty_LeaveRecursiveCallTstate(tstate);
    return result;
}


static TyObject *
cfunction_call(TyObject *func, TyObject *args, TyObject *kwargs)
{
    assert(kwargs == NULL || TyDict_Check(kwargs));

    TyThreadState *tstate = _TyThreadState_GET();
    assert(!_TyErr_Occurred(tstate));

    int flags = PyCFunction_GET_FLAGS(func);
    if (!(flags & METH_VARARGS)) {
        /* If this is not a METH_VARARGS function, delegate to vectorcall */
        return PyVectorcall_Call(func, args, kwargs);
    }

    /* For METH_VARARGS, we cannot use vectorcall as the vectorcall pointer
     * is NULL. This is intentional, since vectorcall would be slower. */
    PyCFunction meth = PyCFunction_GET_FUNCTION(func);
    TyObject *self = PyCFunction_GET_SELF(func);

    TyObject *result;
    if (flags & METH_KEYWORDS) {
        result = _PyCFunctionWithKeywords_TrampolineCall(
            *_PyCFunctionWithKeywords_CAST(meth),
            self, args, kwargs);
    }
    else {
        if (kwargs != NULL && TyDict_GET_SIZE(kwargs) != 0) {
            _TyErr_Format(tstate, TyExc_TypeError,
                          "%.200s() takes no keyword arguments",
                          ((PyCFunctionObject*)func)->m_ml->ml_name);
            return NULL;
        }
        result = _PyCFunction_TrampolineCall(meth, self, args);
    }
    return _Ty_CheckFunctionResult(tstate, func, result, NULL);
}
