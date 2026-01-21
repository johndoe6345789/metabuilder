/* Class object implementation (dead now except for methods) */

#include "Python.h"
#include "pycore_call.h"          // _TyObject_VectorcallTstate()
#include "pycore_ceval.h"         // _TyEval_GetBuiltin()
#include "pycore_freelist.h"
#include "pycore_object.h"
#include "pycore_pyerrors.h"
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()


#include "clinic/classobject.c.h"

#define _PyMethodObject_CAST(op) _Py_CAST(PyMethodObject*, (op))
#define TP_DESCR_GET(t) ((t)->tp_descr_get)

/*[clinic input]
class method "PyMethodObject *" "&TyMethod_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=b16e47edf6107c23]*/


TyObject *
TyMethod_Function(TyObject *im)
{
    if (!TyMethod_Check(im)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return ((PyMethodObject *)im)->im_func;
}

TyObject *
TyMethod_Self(TyObject *im)
{
    if (!TyMethod_Check(im)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return ((PyMethodObject *)im)->im_self;
}


static TyObject *
method_vectorcall(TyObject *method, TyObject *const *args,
                  size_t nargsf, TyObject *kwnames)
{
    assert(Ty_IS_TYPE(method, &TyMethod_Type));

    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *self = TyMethod_GET_SELF(method);
    TyObject *func = TyMethod_GET_FUNCTION(method);
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    assert(nargs == 0 || args[nargs-1]);

    TyObject *result;
    if (nargsf & PY_VECTORCALL_ARGUMENTS_OFFSET) {
        /* PY_VECTORCALL_ARGUMENTS_OFFSET is set, so we are allowed to mutate the vector */
        TyObject **newargs = (TyObject**)args - 1;
        nargs += 1;
        TyObject *tmp = newargs[0];
        newargs[0] = self;
        assert(newargs[nargs-1]);
        result = _TyObject_VectorcallTstate(tstate, func, newargs,
                                            nargs, kwnames);
        newargs[0] = tmp;
    }
    else {
        Ty_ssize_t nkwargs = (kwnames == NULL) ? 0 : TyTuple_GET_SIZE(kwnames);
        Ty_ssize_t totalargs = nargs + nkwargs;
        if (totalargs == 0) {
            return _TyObject_VectorcallTstate(tstate, func, &self, 1, NULL);
        }

        TyObject *newargs_stack[_PY_FASTCALL_SMALL_STACK];
        TyObject **newargs;
        if (totalargs <= (Ty_ssize_t)Ty_ARRAY_LENGTH(newargs_stack) - 1) {
            newargs = newargs_stack;
        }
        else {
            newargs = TyMem_Malloc((totalargs+1) * sizeof(TyObject *));
            if (newargs == NULL) {
                _TyErr_NoMemory(tstate);
                return NULL;
            }
        }
        /* use borrowed references */
        newargs[0] = self;
        /* bpo-37138: since totalargs > 0, it's impossible that args is NULL.
         * We need this, since calling memcpy() with a NULL pointer is
         * undefined behaviour. */
        assert(args != NULL);
        memcpy(newargs + 1, args, totalargs * sizeof(TyObject *));
        result = _TyObject_VectorcallTstate(tstate, func,
                                            newargs, nargs+1, kwnames);
        if (newargs != newargs_stack) {
            TyMem_Free(newargs);
        }
    }
    return result;
}


/* Method objects are used for bound instance methods returned by
   instancename.methodname. ClassName.methodname returns an ordinary
   function.
*/

TyObject *
TyMethod_New(TyObject *func, TyObject *self)
{
    if (self == NULL) {
        TyErr_BadInternalCall();
        return NULL;
    }
    PyMethodObject *im = _Ty_FREELIST_POP(PyMethodObject, pymethodobjects);
    if (im == NULL) {
        im = PyObject_GC_New(PyMethodObject, &TyMethod_Type);
        if (im == NULL) {
            return NULL;
        }
    }
    im->im_weakreflist = NULL;
    im->im_func = Ty_NewRef(func);
    im->im_self = Ty_NewRef(self);
    im->vectorcall = method_vectorcall;
    _TyObject_GC_TRACK(im);
    return (TyObject *)im;
}

/*[clinic input]
method.__reduce__
[clinic start generated code]*/

static TyObject *
method___reduce___impl(PyMethodObject *self)
/*[clinic end generated code: output=6c04506d0fa6fdcb input=143a0bf5e96de6e8]*/
{
    TyObject *funcself = TyMethod_GET_SELF(self);
    TyObject *func = TyMethod_GET_FUNCTION(self);
    TyObject *funcname = PyObject_GetAttr(func, &_Ty_ID(__name__));
    if (funcname == NULL) {
        return NULL;
    }
    return Ty_BuildValue(
            "N(ON)", _TyEval_GetBuiltin(&_Ty_ID(getattr)), funcself, funcname);
}

static TyMethodDef method_methods[] = {
    METHOD___REDUCE___METHODDEF
    {NULL, NULL}
};

/* Descriptors for PyMethod attributes */

/* im_func and im_self are stored in the PyMethod object */

#define MO_OFF(x) offsetof(PyMethodObject, x)

static TyMemberDef method_memberlist[] = {
    {"__func__", _Ty_T_OBJECT, MO_OFF(im_func), Py_READONLY,
     "the function (or other callable) implementing a method"},
    {"__self__", _Ty_T_OBJECT, MO_OFF(im_self), Py_READONLY,
     "the instance to which a method is bound"},
    {NULL}      /* Sentinel */
};

/* Christian Tismer argued convincingly that method attributes should
   (nearly) always override function attributes.
   The one exception is __doc__; there's a default __doc__ which
   should only be used for the class, not for instances */

static TyObject *
method_get_doc(TyObject *self, void *context)
{
    PyMethodObject *im = _PyMethodObject_CAST(self);
    return PyObject_GetAttr(im->im_func, &_Ty_ID(__doc__));
}

static TyGetSetDef method_getset[] = {
    {"__doc__", method_get_doc, NULL, NULL},
    {0}
};

static TyObject *
method_getattro(TyObject *obj, TyObject *name)
{
    PyMethodObject *im = (PyMethodObject *)obj;
    TyTypeObject *tp = Ty_TYPE(obj);
    TyObject *descr = NULL;

    {
        if (!_TyType_IsReady(tp)) {
            if (TyType_Ready(tp) < 0)
                return NULL;
        }
        descr = _TyType_LookupRef(tp, name);
    }

    if (descr != NULL) {
        descrgetfunc f = TP_DESCR_GET(Ty_TYPE(descr));
        if (f != NULL) {
            TyObject *res = f(descr, obj, (TyObject *)Ty_TYPE(obj));
            Ty_DECREF(descr);
            return res;
        }
        else {
            return descr;
        }
    }

    return PyObject_GetAttr(im->im_func, name);
}

/*[clinic input]
@classmethod
method.__new__ as method_new
    function: object
    instance: object
    /

Create a bound instance method object.
[clinic start generated code]*/

static TyObject *
method_new_impl(TyTypeObject *type, TyObject *function, TyObject *instance)
/*[clinic end generated code: output=d33ef4ebf702e1f7 input=4e32facc3c3108ae]*/
{
    if (!PyCallable_Check(function)) {
        TyErr_SetString(TyExc_TypeError,
                        "first argument must be callable");
        return NULL;
    }
    if (instance == NULL || instance == Ty_None) {
        TyErr_SetString(TyExc_TypeError,
            "instance must not be None");
        return NULL;
    }

    return TyMethod_New(function, instance);
}

static void
method_dealloc(TyObject *self)
{
    PyMethodObject *im = _PyMethodObject_CAST(self);
    _TyObject_GC_UNTRACK(im);
    FT_CLEAR_WEAKREFS(self, im->im_weakreflist);
    Ty_DECREF(im->im_func);
    Ty_XDECREF(im->im_self);
    assert(Ty_IS_TYPE(self, &TyMethod_Type));
    _Ty_FREELIST_FREE(pymethodobjects, (TyObject *)im, PyObject_GC_Del);
}

static TyObject *
method_richcompare(TyObject *self, TyObject *other, int op)
{
    PyMethodObject *a, *b;
    TyObject *res;
    int eq;

    if ((op != Py_EQ && op != Py_NE) ||
        !TyMethod_Check(self) ||
        !TyMethod_Check(other))
    {
        Py_RETURN_NOTIMPLEMENTED;
    }
    a = (PyMethodObject *)self;
    b = (PyMethodObject *)other;
    eq = PyObject_RichCompareBool(a->im_func, b->im_func, Py_EQ);
    if (eq == 1) {
        eq = (a->im_self == b->im_self);
    }
    else if (eq < 0)
        return NULL;
    if (op == Py_EQ)
        res = eq ? Ty_True : Ty_False;
    else
        res = eq ? Ty_False : Ty_True;
    return Ty_NewRef(res);
}

static TyObject *
method_repr(TyObject *op)
{
    PyMethodObject *a = _PyMethodObject_CAST(op);
    TyObject *self = a->im_self;
    TyObject *func = a->im_func;
    TyObject *funcname, *result;
    const char *defname = "?";

    if (PyObject_GetOptionalAttr(func, &_Ty_ID(__qualname__), &funcname) < 0 ||
        (funcname == NULL &&
         PyObject_GetOptionalAttr(func, &_Ty_ID(__name__), &funcname) < 0))
    {
        return NULL;
    }

    if (funcname != NULL && !TyUnicode_Check(funcname)) {
        Ty_SETREF(funcname, NULL);
    }

    /* XXX Shouldn't use repr()/%R here! */
    result = TyUnicode_FromFormat("<bound method %V of %R>",
                                  funcname, defname, self);

    Ty_XDECREF(funcname);
    return result;
}

static Ty_hash_t
method_hash(TyObject *self)
{
    PyMethodObject *a = _PyMethodObject_CAST(self);
    Ty_hash_t x = PyObject_GenericHash(a->im_self);
    Ty_hash_t y = PyObject_Hash(a->im_func);
    if (y == -1) {
        return -1;
    }

    x = x ^ y;
    if (x == -1) {
        x = -2;
    }
    return x;
}

static int
method_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyMethodObject *im = _PyMethodObject_CAST(self);
    Ty_VISIT(im->im_func);
    Ty_VISIT(im->im_self);
    return 0;
}

static TyObject *
method_descr_get(TyObject *meth, TyObject *obj, TyObject *cls)
{
    Ty_INCREF(meth);
    return meth;
}

TyTypeObject TyMethod_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    .tp_name = "method",
    .tp_basicsize = sizeof(PyMethodObject),
    .tp_dealloc = method_dealloc,
    .tp_vectorcall_offset = offsetof(PyMethodObject, vectorcall),
    .tp_repr = method_repr,
    .tp_hash = method_hash,
    .tp_call = PyVectorcall_Call,
    .tp_getattro = method_getattro,
    .tp_setattro = PyObject_GenericSetAttr,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
                Ty_TPFLAGS_HAVE_VECTORCALL,
    .tp_doc = method_new__doc__,
    .tp_traverse = method_traverse,
    .tp_richcompare = method_richcompare,
    .tp_weaklistoffset = offsetof(PyMethodObject, im_weakreflist),
    .tp_methods = method_methods,
    .tp_members = method_memberlist,
    .tp_getset = method_getset,
    .tp_descr_get = method_descr_get,
    .tp_new = method_new,
};

/* ------------------------------------------------------------------------
 * instance method
 */

/*[clinic input]
class instancemethod "PyInstanceMethodObject *" "&PyInstanceMethod_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=28c9762a9016f4d2]*/

TyObject *
PyInstanceMethod_New(TyObject *func) {
    PyInstanceMethodObject *method;
    method = PyObject_GC_New(PyInstanceMethodObject,
                             &PyInstanceMethod_Type);
    if (method == NULL) return NULL;
    method->func = Ty_NewRef(func);
    _TyObject_GC_TRACK(method);
    return (TyObject *)method;
}

TyObject *
PyInstanceMethod_Function(TyObject *im)
{
    if (!PyInstanceMethod_Check(im)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    return PyInstanceMethod_GET_FUNCTION(im);
}

#define IMO_OFF(x) offsetof(PyInstanceMethodObject, x)

static TyMemberDef instancemethod_memberlist[] = {
    {"__func__", _Ty_T_OBJECT, IMO_OFF(func), Py_READONLY,
     "the function (or other callable) implementing a method"},
    {NULL}      /* Sentinel */
};

static TyObject *
instancemethod_get_doc(TyObject *self, void *context)
{
    return PyObject_GetAttr(PyInstanceMethod_GET_FUNCTION(self),
                            &_Ty_ID(__doc__));
}

static TyGetSetDef instancemethod_getset[] = {
    {"__doc__", instancemethod_get_doc, NULL, NULL},
    {0}
};

static TyObject *
instancemethod_getattro(TyObject *self, TyObject *name)
{
    TyTypeObject *tp = Ty_TYPE(self);
    TyObject *descr = NULL;

    if (!_TyType_IsReady(tp)) {
        if (TyType_Ready(tp) < 0)
            return NULL;
    }
    descr = _TyType_LookupRef(tp, name);

    if (descr != NULL) {
        descrgetfunc f = TP_DESCR_GET(Ty_TYPE(descr));
        if (f != NULL) {
            TyObject *res = f(descr, self, (TyObject *)Ty_TYPE(self));
            Ty_DECREF(descr);
            return res;
        }
        else {
            return descr;
        }
    }

    return PyObject_GetAttr(PyInstanceMethod_GET_FUNCTION(self), name);
}

static void
instancemethod_dealloc(TyObject *self) {
    _TyObject_GC_UNTRACK(self);
    Ty_DECREF(PyInstanceMethod_GET_FUNCTION(self));
    PyObject_GC_Del(self);
}

static int
instancemethod_traverse(TyObject *self, visitproc visit, void *arg) {
    Ty_VISIT(PyInstanceMethod_GET_FUNCTION(self));
    return 0;
}

static TyObject *
instancemethod_call(TyObject *self, TyObject *arg, TyObject *kw)
{
    return PyObject_Call(PyInstanceMethod_GET_FUNCTION(self), arg, kw);
}

static TyObject *
instancemethod_descr_get(TyObject *descr, TyObject *obj, TyObject *type) {
    TyObject *func = PyInstanceMethod_GET_FUNCTION(descr);
    if (obj == NULL) {
        return Ty_NewRef(func);
    }
    else
        return TyMethod_New(func, obj);
}

static TyObject *
instancemethod_richcompare(TyObject *self, TyObject *other, int op)
{
    PyInstanceMethodObject *a, *b;
    TyObject *res;
    int eq;

    if ((op != Py_EQ && op != Py_NE) ||
        !PyInstanceMethod_Check(self) ||
        !PyInstanceMethod_Check(other))
    {
        Py_RETURN_NOTIMPLEMENTED;
    }
    a = (PyInstanceMethodObject *)self;
    b = (PyInstanceMethodObject *)other;
    eq = PyObject_RichCompareBool(a->func, b->func, Py_EQ);
    if (eq < 0)
        return NULL;
    if (op == Py_EQ)
        res = eq ? Ty_True : Ty_False;
    else
        res = eq ? Ty_False : Ty_True;
    return Ty_NewRef(res);
}

static TyObject *
instancemethod_repr(TyObject *self)
{
    TyObject *func = PyInstanceMethod_Function(self);
    TyObject *funcname, *result;
    const char *defname = "?";

    if (func == NULL) {
        TyErr_BadInternalCall();
        return NULL;
    }

    if (PyObject_GetOptionalAttr(func, &_Ty_ID(__name__), &funcname) < 0) {
        return NULL;
    }
    if (funcname != NULL && !TyUnicode_Check(funcname)) {
        Ty_SETREF(funcname, NULL);
    }

    result = TyUnicode_FromFormat("<instancemethod %V at %p>",
                                  funcname, defname, self);

    Ty_XDECREF(funcname);
    return result;
}

/*[clinic input]
@classmethod
instancemethod.__new__ as instancemethod_new
    function: object
    /

Bind a function to a class.
[clinic start generated code]*/

static TyObject *
instancemethod_new_impl(TyTypeObject *type, TyObject *function)
/*[clinic end generated code: output=5e0397b2bdb750be input=cfc54e8b973664a8]*/
{
    if (!PyCallable_Check(function)) {
        TyErr_SetString(TyExc_TypeError,
                        "first argument must be callable");
        return NULL;
    }

    return PyInstanceMethod_New(function);
}

TyTypeObject PyInstanceMethod_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    .tp_name = "instancemethod",
    .tp_basicsize = sizeof(PyInstanceMethodObject),
    .tp_dealloc = instancemethod_dealloc,
    .tp_repr = instancemethod_repr,
    .tp_call = instancemethod_call,
    .tp_getattro = instancemethod_getattro,
    .tp_setattro = PyObject_GenericSetAttr,
    .tp_flags = Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC,
    .tp_doc = instancemethod_new__doc__,
    .tp_traverse = instancemethod_traverse,
    .tp_richcompare = instancemethod_richcompare,
    .tp_members = instancemethod_memberlist,
    .tp_getset = instancemethod_getset,
    .tp_descr_get = instancemethod_descr_get,
    .tp_new = instancemethod_new,
};
