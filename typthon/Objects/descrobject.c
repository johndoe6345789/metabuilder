/* Descriptors -- a new, flexible way to describe attributes */

#include "Python.h"
#include "pycore_abstract.h"      // _TyObject_RealIsSubclass()
#include "pycore_call.h"          // _PyStack_AsDict()
#include "pycore_ceval.h"         // _Ty_EnterRecursiveCallTstate()
#include "pycore_emscripten_trampoline.h" // descr_set_trampoline_call(), descr_get_trampoline_call()
#include "pycore_descrobject.h"   // _PyMethodWrapper_Type
#include "pycore_modsupport.h"    // _TyArg_UnpackStack()
#include "pycore_object.h"        // _TyObject_GC_UNTRACK()
#include "pycore_object_deferred.h" // _TyObject_SetDeferredRefcount()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_tuple.h"         // _TyTuple_ITEMS()


/*[clinic input]
class mappingproxy "mappingproxyobject *" "&PyDictProxy_Type"
class property "propertyobject *" "&TyProperty_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=556352653fd4c02e]*/

static void
descr_dealloc(TyObject *self)
{
    PyDescrObject *descr = (PyDescrObject *)self;
    _TyObject_GC_UNTRACK(descr);
    Ty_XDECREF(descr->d_type);
    Ty_XDECREF(descr->d_name);
    Ty_XDECREF(descr->d_qualname);
    PyObject_GC_Del(descr);
}

static TyObject *
descr_name(PyDescrObject *descr)
{
    if (descr->d_name != NULL && TyUnicode_Check(descr->d_name))
        return descr->d_name;
    return NULL;
}

static TyObject *
descr_repr(PyDescrObject *descr, const char *format)
{
    TyObject *name = NULL;
    if (descr->d_name != NULL && TyUnicode_Check(descr->d_name))
        name = descr->d_name;

    return TyUnicode_FromFormat(format, name, "?", descr->d_type->tp_name);
}

static TyObject *
method_repr(TyObject *descr)
{
    return descr_repr((PyDescrObject *)descr,
                      "<method '%V' of '%s' objects>");
}

static TyObject *
member_repr(TyObject *descr)
{
    return descr_repr((PyDescrObject *)descr,
                      "<member '%V' of '%s' objects>");
}

static TyObject *
getset_repr(TyObject *descr)
{
    return descr_repr((PyDescrObject *)descr,
                      "<attribute '%V' of '%s' objects>");
}

static TyObject *
wrapperdescr_repr(TyObject *descr)
{
    return descr_repr((PyDescrObject *)descr,
                      "<slot wrapper '%V' of '%s' objects>");
}

static int
descr_check(PyDescrObject *descr, TyObject *obj)
{
    if (!PyObject_TypeCheck(obj, descr->d_type)) {
        TyErr_Format(TyExc_TypeError,
                     "descriptor '%V' for '%.100s' objects "
                     "doesn't apply to a '%.100s' object",
                     descr_name((PyDescrObject *)descr), "?",
                     descr->d_type->tp_name,
                     Ty_TYPE(obj)->tp_name);
        return -1;
    }
    return 0;
}

static TyObject *
classmethod_get(TyObject *self, TyObject *obj, TyObject *type)
{
    PyMethodDescrObject *descr = (PyMethodDescrObject *)self;
    /* Ensure a valid type.  Class methods ignore obj. */
    if (type == NULL) {
        if (obj != NULL)
            type = (TyObject *)Ty_TYPE(obj);
        else {
            /* Wot - no type?! */
            TyErr_Format(TyExc_TypeError,
                         "descriptor '%V' for type '%.100s' "
                         "needs either an object or a type",
                         descr_name((PyDescrObject *)descr), "?",
                         PyDescr_TYPE(descr)->tp_name);
            return NULL;
        }
    }
    if (!TyType_Check(type)) {
        TyErr_Format(TyExc_TypeError,
                     "descriptor '%V' for type '%.100s' "
                     "needs a type, not a '%.100s' as arg 2",
                     descr_name((PyDescrObject *)descr), "?",
                     PyDescr_TYPE(descr)->tp_name,
                     Ty_TYPE(type)->tp_name);
        return NULL;
    }
    if (!TyType_IsSubtype((TyTypeObject *)type, PyDescr_TYPE(descr))) {
        TyErr_Format(TyExc_TypeError,
                     "descriptor '%V' requires a subtype of '%.100s' "
                     "but received '%.100s'",
                     descr_name((PyDescrObject *)descr), "?",
                     PyDescr_TYPE(descr)->tp_name,
                     ((TyTypeObject *)type)->tp_name);
        return NULL;
    }
    TyTypeObject *cls = NULL;
    if (descr->d_method->ml_flags & METH_METHOD) {
        cls = descr->d_common.d_type;
    }
    return PyCMethod_New(descr->d_method, type, NULL, cls);
}

static TyObject *
method_get(TyObject *self, TyObject *obj, TyObject *type)
{
    PyMethodDescrObject *descr = (PyMethodDescrObject *)self;
    if (obj == NULL) {
        return Ty_NewRef(descr);
    }
    if (descr_check((PyDescrObject *)descr, obj) < 0) {
        return NULL;
    }
    if (descr->d_method->ml_flags & METH_METHOD) {
        if (type == NULL || TyType_Check(type)) {
            return PyCMethod_New(descr->d_method, obj, NULL, descr->d_common.d_type);
        } else {
            TyErr_Format(TyExc_TypeError,
                        "descriptor '%V' needs a type, not '%s', as arg 2",
                        descr_name((PyDescrObject *)descr),
                        Ty_TYPE(type)->tp_name);
            return NULL;
        }
    } else {
        return PyCFunction_NewEx(descr->d_method, obj, NULL);
    }
}

static TyObject *
member_get(TyObject *self, TyObject *obj, TyObject *type)
{
    PyMemberDescrObject *descr = (PyMemberDescrObject *)self;
    if (obj == NULL) {
        return Ty_NewRef(descr);
    }
    if (descr_check((PyDescrObject *)descr, obj) < 0) {
        return NULL;
    }

    if (descr->d_member->flags & Ty_AUDIT_READ) {
        if (TySys_Audit("object.__getattr__", "Os",
            obj ? obj : Ty_None, descr->d_member->name) < 0) {
            return NULL;
        }
    }

    return PyMember_GetOne((char *)obj, descr->d_member);
}

static TyObject *
getset_get(TyObject *self, TyObject *obj, TyObject *type)
{
    PyGetSetDescrObject *descr = (PyGetSetDescrObject *)self;
    if (obj == NULL) {
        return Ty_NewRef(descr);
    }
    if (descr_check((PyDescrObject *)descr, obj) < 0) {
        return NULL;
    }
    if (descr->d_getset->get != NULL)
        return descr_get_trampoline_call(
            descr->d_getset->get, obj, descr->d_getset->closure);
    TyErr_Format(TyExc_AttributeError,
                 "attribute '%V' of '%.100s' objects is not readable",
                 descr_name((PyDescrObject *)descr), "?",
                 PyDescr_TYPE(descr)->tp_name);
    return NULL;
}

static TyObject *
wrapperdescr_get(TyObject *self, TyObject *obj, TyObject *type)
{
    PyWrapperDescrObject *descr = (PyWrapperDescrObject *)self;
    if (obj == NULL) {
        return Ty_NewRef(descr);
    }
    if (descr_check((PyDescrObject *)descr, obj) < 0) {
        return NULL;
    }
    return TyWrapper_New((TyObject *)descr, obj);
}

static int
descr_setcheck(PyDescrObject *descr, TyObject *obj, TyObject *value)
{
    assert(obj != NULL);
    if (!PyObject_TypeCheck(obj, descr->d_type)) {
        TyErr_Format(TyExc_TypeError,
                     "descriptor '%V' for '%.100s' objects "
                     "doesn't apply to a '%.100s' object",
                     descr_name(descr), "?",
                     descr->d_type->tp_name,
                     Ty_TYPE(obj)->tp_name);
        return -1;
    }
    return 0;
}

static int
member_set(TyObject *self, TyObject *obj, TyObject *value)
{
    PyMemberDescrObject *descr = (PyMemberDescrObject *)self;
    if (descr_setcheck((PyDescrObject *)descr, obj, value) < 0) {
        return -1;
    }
    return PyMember_SetOne((char *)obj, descr->d_member, value);
}

static int
getset_set(TyObject *self, TyObject *obj, TyObject *value)
{
    PyGetSetDescrObject *descr = (PyGetSetDescrObject *)self;
    if (descr_setcheck((PyDescrObject *)descr, obj, value) < 0) {
        return -1;
    }
    if (descr->d_getset->set != NULL) {
        return descr_set_trampoline_call(
            descr->d_getset->set, obj, value,
            descr->d_getset->closure);
    }
    TyErr_Format(TyExc_AttributeError,
                 "attribute '%V' of '%.100s' objects is not writable",
                 descr_name((PyDescrObject *)descr), "?",
                 PyDescr_TYPE(descr)->tp_name);
    return -1;
}


/* Vectorcall functions for each of the PyMethodDescr calling conventions.
 *
 * First, common helpers
 */
static inline int
method_check_args(TyObject *func, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    assert(!TyErr_Occurred());
    if (nargs < 1) {
        TyObject *funcstr = _TyObject_FunctionStr(func);
        if (funcstr != NULL) {
            TyErr_Format(TyExc_TypeError,
                         "unbound method %U needs an argument", funcstr);
            Ty_DECREF(funcstr);
        }
        return -1;
    }
    TyObject *self = args[0];
    if (descr_check((PyDescrObject *)func, self) < 0) {
        return -1;
    }
    if (kwnames && TyTuple_GET_SIZE(kwnames)) {
        TyObject *funcstr = _TyObject_FunctionStr(func);
        if (funcstr != NULL) {
            TyErr_Format(TyExc_TypeError,
                         "%U takes no keyword arguments", funcstr);
            Ty_DECREF(funcstr);
        }
        return -1;
    }
    return 0;
}

typedef void (*funcptr)(void);

static inline funcptr
method_enter_call(TyThreadState *tstate, TyObject *func)
{
    if (_Ty_EnterRecursiveCallTstate(tstate, " while calling a Python object")) {
        return NULL;
    }
    return (funcptr)((PyMethodDescrObject *)func)->d_method->ml_meth;
}

/* Now the actual vectorcall functions */
static TyObject *
method_vectorcall_VARARGS(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (method_check_args(func, args, nargs, kwnames)) {
        return NULL;
    }
    TyObject *argstuple = _TyTuple_FromArray(args+1, nargs-1);
    if (argstuple == NULL) {
        return NULL;
    }
    PyCFunction meth = (PyCFunction)method_enter_call(tstate, func);
    if (meth == NULL) {
        Ty_DECREF(argstuple);
        return NULL;
    }
    TyObject *result = _PyCFunction_TrampolineCall(
        meth, args[0], argstuple);
    Ty_DECREF(argstuple);
    _Ty_LeaveRecursiveCallTstate(tstate);
    return result;
}

static TyObject *
method_vectorcall_VARARGS_KEYWORDS(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (method_check_args(func, args, nargs, NULL)) {
        return NULL;
    }
    TyObject *argstuple = _TyTuple_FromArray(args+1, nargs-1);
    if (argstuple == NULL) {
        return NULL;
    }
    TyObject *result = NULL;
    /* Create a temporary dict for keyword arguments */
    TyObject *kwdict = NULL;
    if (kwnames != NULL && TyTuple_GET_SIZE(kwnames) > 0) {
        kwdict = _PyStack_AsDict(args + nargs, kwnames);
        if (kwdict == NULL) {
            goto exit;
        }
    }
    PyCFunctionWithKeywords meth = (PyCFunctionWithKeywords)
                                   method_enter_call(tstate, func);
    if (meth == NULL) {
        goto exit;
    }
    result = _PyCFunctionWithKeywords_TrampolineCall(
        meth, args[0], argstuple, kwdict);
    _Ty_LeaveRecursiveCallTstate(tstate);
exit:
    Ty_DECREF(argstuple);
    Ty_XDECREF(kwdict);
    return result;
}

static TyObject *
method_vectorcall_FASTCALL_KEYWORDS_METHOD(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (method_check_args(func, args, nargs, NULL)) {
        return NULL;
    }
    PyCMethod meth = (PyCMethod) method_enter_call(tstate, func);
    if (meth == NULL) {
        return NULL;
    }
    TyObject *result = meth(args[0],
                            ((PyMethodDescrObject *)func)->d_common.d_type,
                            args+1, nargs-1, kwnames);
    _Ty_LeaveRecursiveCall();
    return result;
}

static TyObject *
method_vectorcall_FASTCALL(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (method_check_args(func, args, nargs, kwnames)) {
        return NULL;
    }
    PyCFunctionFast meth = (PyCFunctionFast)
                            method_enter_call(tstate, func);
    if (meth == NULL) {
        return NULL;
    }
    TyObject *result = meth(args[0], args+1, nargs-1);
    _Ty_LeaveRecursiveCallTstate(tstate);
    return result;
}

static TyObject *
method_vectorcall_FASTCALL_KEYWORDS(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (method_check_args(func, args, nargs, NULL)) {
        return NULL;
    }
    PyCFunctionFastWithKeywords meth = (PyCFunctionFastWithKeywords)
                                        method_enter_call(tstate, func);
    if (meth == NULL) {
        return NULL;
    }
    TyObject *result = meth(args[0], args+1, nargs-1, kwnames);
    _Ty_LeaveRecursiveCallTstate(tstate);
    return result;
}

static TyObject *
method_vectorcall_NOARGS(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (method_check_args(func, args, nargs, kwnames)) {
        return NULL;
    }
    if (nargs != 1) {
        TyObject *funcstr = _TyObject_FunctionStr(func);
        if (funcstr != NULL) {
            TyErr_Format(TyExc_TypeError,
                "%U takes no arguments (%zd given)", funcstr, nargs-1);
            Ty_DECREF(funcstr);
        }
        return NULL;
    }
    PyCFunction meth = (PyCFunction)method_enter_call(tstate, func);
    if (meth == NULL) {
        return NULL;
    }
    TyObject *result = _PyCFunction_TrampolineCall(meth, args[0], NULL);
    _Ty_LeaveRecursiveCallTstate(tstate);
    return result;
}

static TyObject *
method_vectorcall_O(
    TyObject *func, TyObject *const *args, size_t nargsf, TyObject *kwnames)
{
    TyThreadState *tstate = _TyThreadState_GET();
    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (method_check_args(func, args, nargs, kwnames)) {
        return NULL;
    }
    if (nargs != 2) {
        TyObject *funcstr = _TyObject_FunctionStr(func);
        if (funcstr != NULL) {
            TyErr_Format(TyExc_TypeError,
                "%U takes exactly one argument (%zd given)",
                funcstr, nargs-1);
            Ty_DECREF(funcstr);
        }
        return NULL;
    }
    PyCFunction meth = (PyCFunction)method_enter_call(tstate, func);
    if (meth == NULL) {
        return NULL;
    }
    TyObject *result = _PyCFunction_TrampolineCall(meth, args[0], args[1]);
    _Ty_LeaveRecursiveCallTstate(tstate);
    return result;
}


/* Instances of classmethod_descriptor are unlikely to be called directly.
   For one, the analogous class "classmethod" (for Python classes) is not
   callable. Second, users are not likely to access a classmethod_descriptor
   directly, since it means pulling it from the class __dict__.

   This is just an excuse to say that this doesn't need to be optimized:
   we implement this simply by calling __get__ and then calling the result.
*/
static TyObject *
classmethoddescr_call(TyObject *_descr, TyObject *args,
                      TyObject *kwds)
{
    PyMethodDescrObject *descr = (PyMethodDescrObject *)_descr;
    Ty_ssize_t argc = TyTuple_GET_SIZE(args);
    if (argc < 1) {
        TyErr_Format(TyExc_TypeError,
                     "descriptor '%V' of '%.100s' "
                     "object needs an argument",
                     descr_name((PyDescrObject *)descr), "?",
                     PyDescr_TYPE(descr)->tp_name);
        return NULL;
    }
    TyObject *self = TyTuple_GET_ITEM(args, 0);
    TyObject *bound = classmethod_get((TyObject *)descr, NULL, self);
    if (bound == NULL) {
        return NULL;
    }
    TyObject *res = PyObject_VectorcallDict(bound, _TyTuple_ITEMS(args)+1,
                                           argc-1, kwds);
    Ty_DECREF(bound);
    return res;
}

Ty_LOCAL_INLINE(TyObject *)
wrapperdescr_raw_call(PyWrapperDescrObject *descr, TyObject *self,
                      TyObject *args, TyObject *kwds)
{
    wrapperfunc wrapper = descr->d_base->wrapper;

    if (descr->d_base->flags & PyWrapperFlag_KEYWORDS) {
        wrapperfunc_kwds wk = _Ty_FUNC_CAST(wrapperfunc_kwds, wrapper);
        return (*wk)(self, args, descr->d_wrapped, kwds);
    }

    if (kwds != NULL && (!TyDict_Check(kwds) || TyDict_GET_SIZE(kwds) != 0)) {
        TyErr_Format(TyExc_TypeError,
                     "wrapper %s() takes no keyword arguments",
                     descr->d_base->name);
        return NULL;
    }
    return (*wrapper)(self, args, descr->d_wrapped);
}

static TyObject *
wrapperdescr_call(TyObject *_descr, TyObject *args, TyObject *kwds)
{
    PyWrapperDescrObject *descr = (PyWrapperDescrObject *)_descr;
    Ty_ssize_t argc;
    TyObject *self, *result;

    /* Make sure that the first argument is acceptable as 'self' */
    assert(TyTuple_Check(args));
    argc = TyTuple_GET_SIZE(args);
    if (argc < 1) {
        TyErr_Format(TyExc_TypeError,
                     "descriptor '%V' of '%.100s' "
                     "object needs an argument",
                     descr_name((PyDescrObject *)descr), "?",
                     PyDescr_TYPE(descr)->tp_name);
        return NULL;
    }
    self = TyTuple_GET_ITEM(args, 0);
    if (!_TyObject_RealIsSubclass((TyObject *)Ty_TYPE(self),
                                  (TyObject *)PyDescr_TYPE(descr))) {
        TyErr_Format(TyExc_TypeError,
                     "descriptor '%V' "
                     "requires a '%.100s' object "
                     "but received a '%.100s'",
                     descr_name((PyDescrObject *)descr), "?",
                     PyDescr_TYPE(descr)->tp_name,
                     Ty_TYPE(self)->tp_name);
        return NULL;
    }

    args = TyTuple_GetSlice(args, 1, argc);
    if (args == NULL) {
        return NULL;
    }
    result = wrapperdescr_raw_call(descr, self, args, kwds);
    Ty_DECREF(args);
    return result;
}


static TyObject *
method_get_doc(TyObject *_descr, void *closure)
{
    PyMethodDescrObject *descr = (PyMethodDescrObject *)_descr;
    return _TyType_GetDocFromInternalDoc(descr->d_method->ml_name, descr->d_method->ml_doc);
}

static TyObject *
method_get_text_signature(TyObject *_descr, void *closure)
{
    PyMethodDescrObject *descr = (PyMethodDescrObject *)_descr;
    return _TyType_GetTextSignatureFromInternalDoc(descr->d_method->ml_name,
                                                   descr->d_method->ml_doc,
                                                   descr->d_method->ml_flags);
}

static TyObject *
calculate_qualname(PyDescrObject *descr)
{
    TyObject *type_qualname, *res;

    if (descr->d_name == NULL || !TyUnicode_Check(descr->d_name)) {
        TyErr_SetString(TyExc_TypeError,
                        "<descriptor>.__name__ is not a unicode object");
        return NULL;
    }

    type_qualname = PyObject_GetAttr(
            (TyObject *)descr->d_type, &_Ty_ID(__qualname__));
    if (type_qualname == NULL)
        return NULL;

    if (!TyUnicode_Check(type_qualname)) {
        TyErr_SetString(TyExc_TypeError, "<descriptor>.__objclass__."
                        "__qualname__ is not a unicode object");
        Ty_XDECREF(type_qualname);
        return NULL;
    }

    res = TyUnicode_FromFormat("%S.%S", type_qualname, descr->d_name);
    Ty_DECREF(type_qualname);
    return res;
}

static TyObject *
descr_get_qualname(TyObject *self, void *Py_UNUSED(ignored))
{
    PyDescrObject *descr = (PyDescrObject *)self;
    if (descr->d_qualname == NULL)
        descr->d_qualname = calculate_qualname(descr);
    return Ty_XNewRef(descr->d_qualname);
}

static TyObject *
descr_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    PyDescrObject *descr = (PyDescrObject *)self;
    return Ty_BuildValue("N(OO)", _TyEval_GetBuiltin(&_Ty_ID(getattr)),
                         PyDescr_TYPE(descr), PyDescr_NAME(descr));
}

static TyMethodDef descr_methods[] = {
    {"__reduce__", descr_reduce, METH_NOARGS, NULL},
    {NULL, NULL}
};

static TyMemberDef descr_members[] = {
    {"__objclass__", _Ty_T_OBJECT, offsetof(PyDescrObject, d_type), Py_READONLY},
    {"__name__", _Ty_T_OBJECT, offsetof(PyDescrObject, d_name), Py_READONLY},
    {0}
};

static TyGetSetDef method_getset[] = {
    {"__doc__", method_get_doc},
    {"__qualname__", descr_get_qualname},
    {"__text_signature__", method_get_text_signature},
    {0}
};

static TyObject *
member_get_doc(TyObject *_descr, void *closure)
{
    PyMemberDescrObject *descr = (PyMemberDescrObject *)_descr;
    if (descr->d_member->doc == NULL) {
        Py_RETURN_NONE;
    }
    return TyUnicode_FromString(descr->d_member->doc);
}

static TyGetSetDef member_getset[] = {
    {"__doc__", member_get_doc},
    {"__qualname__", descr_get_qualname},
    {0}
};

static TyObject *
getset_get_doc(TyObject *self, void *closure)
{
    PyGetSetDescrObject *descr = (PyGetSetDescrObject *)self;
    if (descr->d_getset->doc == NULL) {
        Py_RETURN_NONE;
    }
    return TyUnicode_FromString(descr->d_getset->doc);
}

static TyGetSetDef getset_getset[] = {
    {"__doc__", getset_get_doc},
    {"__qualname__", descr_get_qualname},
    {0}
};

static TyObject *
wrapperdescr_get_doc(TyObject *self, void *closure)
{
    PyWrapperDescrObject *descr = (PyWrapperDescrObject *)self;
    return _TyType_GetDocFromInternalDoc(descr->d_base->name, descr->d_base->doc);
}

static TyObject *
wrapperdescr_get_text_signature(TyObject *self, void *closure)
{
    PyWrapperDescrObject *descr = (PyWrapperDescrObject *)self;
    return _TyType_GetTextSignatureFromInternalDoc(descr->d_base->name,
                                                   descr->d_base->doc, 0);
}

static TyGetSetDef wrapperdescr_getset[] = {
    {"__doc__", wrapperdescr_get_doc},
    {"__qualname__", descr_get_qualname},
    {"__text_signature__", wrapperdescr_get_text_signature},
    {0}
};

static int
descr_traverse(TyObject *self, visitproc visit, void *arg)
{
    PyDescrObject *descr = (PyDescrObject *)self;
    Ty_VISIT(descr->d_type);
    return 0;
}

TyTypeObject PyMethodDescr_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "method_descriptor",
    sizeof(PyMethodDescrObject),
    0,
    descr_dealloc,                              /* tp_dealloc */
    offsetof(PyMethodDescrObject, vectorcall),  /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    method_repr,                                /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    PyVectorcall_Call,                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
    Ty_TPFLAGS_HAVE_VECTORCALL |
    Ty_TPFLAGS_METHOD_DESCRIPTOR,               /* tp_flags */
    0,                                          /* tp_doc */
    descr_traverse,                             /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    descr_methods,                              /* tp_methods */
    descr_members,                              /* tp_members */
    method_getset,                              /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    method_get,                                 /* tp_descr_get */
    0,                                          /* tp_descr_set */
};

/* This is for METH_CLASS in C, not for "f = classmethod(f)" in Python! */
TyTypeObject PyClassMethodDescr_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "classmethod_descriptor",
    sizeof(PyMethodDescrObject),
    0,
    descr_dealloc,                              /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    method_repr,                                /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    classmethoddescr_call,                      /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC, /* tp_flags */
    0,                                          /* tp_doc */
    descr_traverse,                             /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    0,                                          /* tp_methods */
    descr_members,                              /* tp_members */
    method_getset,                              /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    classmethod_get,                            /* tp_descr_get */
    0,                                          /* tp_descr_set */
};

TyTypeObject PyMemberDescr_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "member_descriptor",
    sizeof(PyMemberDescrObject),
    0,
    descr_dealloc,                              /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    member_repr,                                /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC, /* tp_flags */
    0,                                          /* tp_doc */
    descr_traverse,                             /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    descr_methods,                              /* tp_methods */
    descr_members,                              /* tp_members */
    member_getset,                              /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    member_get,                                 /* tp_descr_get */
    member_set,                                 /* tp_descr_set */
};

TyTypeObject PyGetSetDescr_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "getset_descriptor",
    sizeof(PyGetSetDescrObject),
    0,
    descr_dealloc,                              /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    getset_repr,                                /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC, /* tp_flags */
    0,                                          /* tp_doc */
    descr_traverse,                             /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    0,                                          /* tp_methods */
    descr_members,                              /* tp_members */
    getset_getset,                              /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    getset_get,                                 /* tp_descr_get */
    getset_set,                                 /* tp_descr_set */
};

TyTypeObject PyWrapperDescr_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "wrapper_descriptor",
    sizeof(PyWrapperDescrObject),
    0,
    descr_dealloc,                              /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    wrapperdescr_repr,                          /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    wrapperdescr_call,                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
    Ty_TPFLAGS_METHOD_DESCRIPTOR,               /* tp_flags */
    0,                                          /* tp_doc */
    descr_traverse,                             /* tp_traverse */
    0,                                          /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    descr_methods,                              /* tp_methods */
    descr_members,                              /* tp_members */
    wrapperdescr_getset,                        /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    wrapperdescr_get,                           /* tp_descr_get */
    0,                                          /* tp_descr_set */
};

static PyDescrObject *
descr_new(TyTypeObject *descrtype, TyTypeObject *type, const char *name)
{
    PyDescrObject *descr;

    descr = (PyDescrObject *)TyType_GenericAlloc(descrtype, 0);
    if (descr != NULL) {
        _TyObject_SetDeferredRefcount((TyObject *)descr);
        descr->d_type = (TyTypeObject*)Ty_XNewRef(type);
        descr->d_name = TyUnicode_InternFromString(name);
        if (descr->d_name == NULL) {
            Ty_SETREF(descr, NULL);
        }
        else {
            descr->d_qualname = NULL;
        }
    }
    return descr;
}

TyObject *
PyDescr_NewMethod(TyTypeObject *type, TyMethodDef *method)
{
    /* Figure out correct vectorcall function to use */
    vectorcallfunc vectorcall;
    switch (method->ml_flags & (METH_VARARGS | METH_FASTCALL | METH_NOARGS |
                                METH_O | METH_KEYWORDS | METH_METHOD))
    {
        case METH_VARARGS:
            vectorcall = method_vectorcall_VARARGS;
            break;
        case METH_VARARGS | METH_KEYWORDS:
            vectorcall = method_vectorcall_VARARGS_KEYWORDS;
            break;
        case METH_FASTCALL:
            vectorcall = method_vectorcall_FASTCALL;
            break;
        case METH_FASTCALL | METH_KEYWORDS:
            vectorcall = method_vectorcall_FASTCALL_KEYWORDS;
            break;
        case METH_NOARGS:
            vectorcall = method_vectorcall_NOARGS;
            break;
        case METH_O:
            vectorcall = method_vectorcall_O;
            break;
        case METH_METHOD | METH_FASTCALL | METH_KEYWORDS:
            vectorcall = method_vectorcall_FASTCALL_KEYWORDS_METHOD;
            break;
        default:
            TyErr_Format(TyExc_SystemError,
                         "%s() method: bad call flags", method->ml_name);
            return NULL;
    }

    PyMethodDescrObject *descr;

    descr = (PyMethodDescrObject *)descr_new(&PyMethodDescr_Type,
                                             type, method->ml_name);
    if (descr != NULL) {
        descr->d_method = method;
        descr->vectorcall = vectorcall;
    }
    return (TyObject *)descr;
}

TyObject *
PyDescr_NewClassMethod(TyTypeObject *type, TyMethodDef *method)
{
    PyMethodDescrObject *descr;

    descr = (PyMethodDescrObject *)descr_new(&PyClassMethodDescr_Type,
                                             type, method->ml_name);
    if (descr != NULL)
        descr->d_method = method;
    return (TyObject *)descr;
}

TyObject *
PyDescr_NewMember(TyTypeObject *type, TyMemberDef *member)
{
    PyMemberDescrObject *descr;

    if (member->flags & Ty_RELATIVE_OFFSET) {
        TyErr_SetString(
            TyExc_SystemError,
            "PyDescr_NewMember used with Ty_RELATIVE_OFFSET");
        return NULL;
    }
    descr = (PyMemberDescrObject *)descr_new(&PyMemberDescr_Type,
                                             type, member->name);
    if (descr != NULL)
        descr->d_member = member;
    return (TyObject *)descr;
}

TyObject *
PyDescr_NewGetSet(TyTypeObject *type, TyGetSetDef *getset)
{
    PyGetSetDescrObject *descr;

    descr = (PyGetSetDescrObject *)descr_new(&PyGetSetDescr_Type,
                                             type, getset->name);
    if (descr != NULL)
        descr->d_getset = getset;
    return (TyObject *)descr;
}

TyObject *
PyDescr_NewWrapper(TyTypeObject *type, struct wrapperbase *base, void *wrapped)
{
    PyWrapperDescrObject *descr;

    descr = (PyWrapperDescrObject *)descr_new(&PyWrapperDescr_Type,
                                             type, base->name);
    if (descr != NULL) {
        descr->d_base = base;
        descr->d_wrapped = wrapped;
    }
    return (TyObject *)descr;
}

int
PyDescr_IsData(TyObject *ob)
{
    return Ty_TYPE(ob)->tp_descr_set != NULL;
}

/* --- mappingproxy: read-only proxy for mappings --- */

/* This has no reason to be in this file except that adding new files is a
   bit of a pain */

typedef struct {
    PyObject_HEAD
    TyObject *mapping;
} mappingproxyobject;

static Ty_ssize_t
mappingproxy_len(TyObject *self)
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    return PyObject_Size(pp->mapping);
}

static TyObject *
mappingproxy_getitem(TyObject *self, TyObject *key)
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    return PyObject_GetItem(pp->mapping, key);
}

static PyMappingMethods mappingproxy_as_mapping = {
    mappingproxy_len,                           /* mp_length */
    mappingproxy_getitem,                       /* mp_subscript */
    0,                                          /* mp_ass_subscript */
};

static TyObject *
mappingproxy_or(TyObject *left, TyObject *right)
{
    if (PyObject_TypeCheck(left, &PyDictProxy_Type)) {
        left = ((mappingproxyobject*)left)->mapping;
    }
    if (PyObject_TypeCheck(right, &PyDictProxy_Type)) {
        right = ((mappingproxyobject*)right)->mapping;
    }
    return PyNumber_Or(left, right);
}

static TyObject *
mappingproxy_ior(TyObject *self, TyObject *Py_UNUSED(other))
{
    return TyErr_Format(TyExc_TypeError,
        "'|=' is not supported by %s; use '|' instead", Ty_TYPE(self)->tp_name);
}

static TyNumberMethods mappingproxy_as_number = {
    .nb_or = mappingproxy_or,
    .nb_inplace_or = mappingproxy_ior,
};

static int
mappingproxy_contains(TyObject *self, TyObject *key)
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    if (TyDict_CheckExact(pp->mapping))
        return TyDict_Contains(pp->mapping, key);
    else
        return PySequence_Contains(pp->mapping, key);
}

static PySequenceMethods mappingproxy_as_sequence = {
    0,                                          /* sq_length */
    0,                                          /* sq_concat */
    0,                                          /* sq_repeat */
    0,                                          /* sq_item */
    0,                                          /* sq_slice */
    0,                                          /* sq_ass_item */
    0,                                          /* sq_ass_slice */
    mappingproxy_contains,                      /* sq_contains */
    0,                                          /* sq_inplace_concat */
    0,                                          /* sq_inplace_repeat */
};

static TyObject *
mappingproxy_get(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    /* newargs: mapping, key, default=None */
    TyObject *newargs[3];
    newargs[0] = pp->mapping;
    newargs[2] = Ty_None;

    if (!_TyArg_UnpackStack(args, nargs, "get", 1, 2,
                            &newargs[1], &newargs[2]))
    {
        return NULL;
    }
    return PyObject_VectorcallMethod(&_Ty_ID(get), newargs,
                                     3 | PY_VECTORCALL_ARGUMENTS_OFFSET,
                                     NULL);
}

static TyObject *
mappingproxy_keys(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    return PyObject_CallMethodNoArgs(pp->mapping, &_Ty_ID(keys));
}

static TyObject *
mappingproxy_values(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    return PyObject_CallMethodNoArgs(pp->mapping, &_Ty_ID(values));
}

static TyObject *
mappingproxy_items(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    return PyObject_CallMethodNoArgs(pp->mapping, &_Ty_ID(items));
}

static TyObject *
mappingproxy_copy(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    return PyObject_CallMethodNoArgs(pp->mapping, &_Ty_ID(copy));
}

static TyObject *
mappingproxy_reversed(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    return PyObject_CallMethodNoArgs(pp->mapping, &_Ty_ID(__reversed__));
}

/* WARNING: mappingproxy methods must not give access
            to the underlying mapping */

static TyMethodDef mappingproxy_methods[] = {
    {"get",       _PyCFunction_CAST(mappingproxy_get), METH_FASTCALL,
     TyDoc_STR("get($self, key, default=None, /)\n--\n\n"
        "Return the value for key if key is in the mapping, else default.")},
    {"keys",      mappingproxy_keys,       METH_NOARGS,
     TyDoc_STR("D.keys() -> a set-like object providing a view on D's keys")},
    {"values",    mappingproxy_values,     METH_NOARGS,
     TyDoc_STR("D.values() -> an object providing a view on D's values")},
    {"items",     mappingproxy_items,      METH_NOARGS,
     TyDoc_STR("D.items() -> a set-like object providing a view on D's items")},
    {"copy",      mappingproxy_copy,       METH_NOARGS,
     TyDoc_STR("D.copy() -> a shallow copy of D")},
    {"__class_getitem__", Ty_GenericAlias, METH_O|METH_CLASS,
     TyDoc_STR("See PEP 585")},
    {"__reversed__", mappingproxy_reversed, METH_NOARGS,
     TyDoc_STR("D.__reversed__() -> reverse iterator")},
    {0}
};

static void
mappingproxy_dealloc(TyObject *self)
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    _TyObject_GC_UNTRACK(pp);
    Ty_DECREF(pp->mapping);
    PyObject_GC_Del(pp);
}

static TyObject *
mappingproxy_getiter(TyObject *self)
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    return PyObject_GetIter(pp->mapping);
}

static Ty_hash_t
mappingproxy_hash(TyObject *self)
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    return PyObject_Hash(pp->mapping);
}

static TyObject *
mappingproxy_str(TyObject *self)
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    return PyObject_Str(pp->mapping);
}

static TyObject *
mappingproxy_repr(TyObject *self)
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    return TyUnicode_FromFormat("mappingproxy(%R)", pp->mapping);
}

static int
mappingproxy_traverse(TyObject *self, visitproc visit, void *arg)
{
    mappingproxyobject *pp = (mappingproxyobject *)self;
    Ty_VISIT(pp->mapping);
    return 0;
}

static TyObject *
mappingproxy_richcompare(TyObject *self, TyObject *w, int op)
{
    mappingproxyobject *v = (mappingproxyobject *)self;
    return PyObject_RichCompare(v->mapping, w, op);
}

static int
mappingproxy_check_mapping(TyObject *mapping)
{
    if (!PyMapping_Check(mapping)
        || TyList_Check(mapping)
        || TyTuple_Check(mapping)) {
        TyErr_Format(TyExc_TypeError,
                    "mappingproxy() argument must be a mapping, not %s",
                    Ty_TYPE(mapping)->tp_name);
        return -1;
    }
    return 0;
}

/*[clinic input]
@classmethod
mappingproxy.__new__ as mappingproxy_new

    mapping: object

Read-only proxy of a mapping.
[clinic start generated code]*/

static TyObject *
mappingproxy_new_impl(TyTypeObject *type, TyObject *mapping)
/*[clinic end generated code: output=65f27f02d5b68fa7 input=c156df096ef7590c]*/
{
    mappingproxyobject *mappingproxy;

    if (mappingproxy_check_mapping(mapping) == -1)
        return NULL;

    mappingproxy = PyObject_GC_New(mappingproxyobject, &PyDictProxy_Type);
    if (mappingproxy == NULL)
        return NULL;
    mappingproxy->mapping = Ty_NewRef(mapping);
    _TyObject_GC_TRACK(mappingproxy);
    return (TyObject *)mappingproxy;
}

TyObject *
PyDictProxy_New(TyObject *mapping)
{
    mappingproxyobject *pp;

    if (mappingproxy_check_mapping(mapping) == -1)
        return NULL;

    pp = PyObject_GC_New(mappingproxyobject, &PyDictProxy_Type);
    if (pp != NULL) {
        pp->mapping = Ty_NewRef(mapping);
        _TyObject_GC_TRACK(pp);
    }
    return (TyObject *)pp;
}


/* --- Wrapper object for "slot" methods --- */

/* This has no reason to be in this file except that adding new files is a
   bit of a pain */

typedef struct {
    PyObject_HEAD
    PyWrapperDescrObject *descr;
    TyObject *self;
} wrapperobject;

#define Wrapper_Check(v) Ty_IS_TYPE(v, &_PyMethodWrapper_Type)

static void
wrapper_dealloc(TyObject *self)
{
    wrapperobject *wp = (wrapperobject *)self;
    PyObject_GC_UnTrack(wp);
    Ty_XDECREF(wp->descr);
    Ty_XDECREF(wp->self);
    PyObject_GC_Del(wp);
}

static TyObject *
wrapper_richcompare(TyObject *a, TyObject *b, int op)
{
    wrapperobject *wa, *wb;
    int eq;

    assert(a != NULL && b != NULL);

    /* both arguments should be wrapperobjects */
    if ((op != Py_EQ && op != Py_NE)
        || !Wrapper_Check(a) || !Wrapper_Check(b))
    {
        Py_RETURN_NOTIMPLEMENTED;
    }

    wa = (wrapperobject *)a;
    wb = (wrapperobject *)b;
    eq = (wa->descr == wb->descr && wa->self == wb->self);
    if (eq == (op == Py_EQ)) {
        Py_RETURN_TRUE;
    }
    else {
        Py_RETURN_FALSE;
    }
}

static Ty_hash_t
wrapper_hash(TyObject *self)
{
    wrapperobject *wp = (wrapperobject *)self;
    Ty_hash_t x, y;
    x = PyObject_GenericHash(wp->self);
    y = Ty_HashPointer(wp->descr);
    x = x ^ y;
    if (x == -1)
        x = -2;
    return x;
}

static TyObject *
wrapper_repr(TyObject *self)
{
    wrapperobject *wp = (wrapperobject *)self;
    return TyUnicode_FromFormat("<method-wrapper '%s' of %s object at %p>",
                               wp->descr->d_base->name,
                               Ty_TYPE(wp->self)->tp_name,
                               wp->self);
}

static TyObject *
wrapper_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    wrapperobject *wp = (wrapperobject *)self;
    return Ty_BuildValue("N(OO)", _TyEval_GetBuiltin(&_Ty_ID(getattr)),
                         wp->self, PyDescr_NAME(wp->descr));
}

static TyMethodDef wrapper_methods[] = {
    {"__reduce__", wrapper_reduce, METH_NOARGS, NULL},
    {NULL, NULL}
};

static TyMemberDef wrapper_members[] = {
    {"__self__", _Ty_T_OBJECT, offsetof(wrapperobject, self), Py_READONLY},
    {0}
};

static TyObject *
wrapper_objclass(TyObject *wp, void *Py_UNUSED(ignored))
{
    TyObject *c = (TyObject *)PyDescr_TYPE(((wrapperobject *)wp)->descr);

    return Ty_NewRef(c);
}

static TyObject *
wrapper_name(TyObject *wp, void *Py_UNUSED(ignored))
{
    const char *s = ((wrapperobject *)wp)->descr->d_base->name;

    return TyUnicode_FromString(s);
}

static TyObject *
wrapper_doc(TyObject *self, void *Py_UNUSED(ignored))
{
    wrapperobject *wp = (wrapperobject *)self;
    return _TyType_GetDocFromInternalDoc(wp->descr->d_base->name, wp->descr->d_base->doc);
}

static TyObject *
wrapper_text_signature(TyObject *self, void *Py_UNUSED(ignored))
{
    wrapperobject *wp = (wrapperobject *)self;
    return _TyType_GetTextSignatureFromInternalDoc(wp->descr->d_base->name,
                                                   wp->descr->d_base->doc, 0);
}

static TyObject *
wrapper_qualname(TyObject *self, void *Py_UNUSED(ignored))
{
    wrapperobject *wp = (wrapperobject *)self;
    return descr_get_qualname((TyObject *)wp->descr, NULL);
}

static TyGetSetDef wrapper_getsets[] = {
    {"__objclass__", wrapper_objclass},
    {"__name__", wrapper_name},
    {"__qualname__", wrapper_qualname},
    {"__doc__", wrapper_doc},
    {"__text_signature__", wrapper_text_signature},
    {0}
};

static TyObject *
wrapper_call(TyObject *self, TyObject *args, TyObject *kwds)
{
    wrapperobject *wp = (wrapperobject *)self;
    return wrapperdescr_raw_call(wp->descr, wp->self, args, kwds);
}

static int
wrapper_traverse(TyObject *self, visitproc visit, void *arg)
{
    wrapperobject *wp = (wrapperobject *)self;
    Ty_VISIT(wp->descr);
    Ty_VISIT(wp->self);
    return 0;
}

TyTypeObject _PyMethodWrapper_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "method-wrapper",                           /* tp_name */
    sizeof(wrapperobject),                      /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    wrapper_dealloc,                            /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    wrapper_repr,                               /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    wrapper_hash,                               /* tp_hash */
    wrapper_call,                               /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC, /* tp_flags */
    0,                                          /* tp_doc */
    wrapper_traverse,                           /* tp_traverse */
    0,                                          /* tp_clear */
    wrapper_richcompare,                        /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    wrapper_methods,                            /* tp_methods */
    wrapper_members,                            /* tp_members */
    wrapper_getsets,                            /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
};

TyObject *
TyWrapper_New(TyObject *d, TyObject *self)
{
    wrapperobject *wp;
    PyWrapperDescrObject *descr;

    assert(PyObject_TypeCheck(d, &PyWrapperDescr_Type));
    descr = (PyWrapperDescrObject *)d;
    assert(_TyObject_RealIsSubclass((TyObject *)Ty_TYPE(self),
                                    (TyObject *)PyDescr_TYPE(descr)));

    wp = PyObject_GC_New(wrapperobject, &_PyMethodWrapper_Type);
    if (wp != NULL) {
        wp->descr = (PyWrapperDescrObject*)Ty_NewRef(descr);
        wp->self = Ty_NewRef(self);
        _TyObject_GC_TRACK(wp);
    }
    return (TyObject *)wp;
}


/* A built-in 'property' type */

#define _propertyobject_CAST(op)    ((propertyobject *)(op))

/*
class property(object):

    def __init__(self, fget=None, fset=None, fdel=None, doc=None):
        if doc is None and fget is not None and hasattr(fget, "__doc__"):
            doc = fget.__doc__
        self.__get = fget
        self.__set = fset
        self.__del = fdel
        try:
            self.__doc__ = doc
        except AttributeError:  # read-only or dict-less class
            pass
        self.__name = None

    def __set_name__(self, owner, name):
        self.__name = name

    @property
    def __name__(self):
        return self.__name if self.__name is not None else self.fget.__name__

    @__name__.setter
    def __name__(self, value):
        self.__name = value

    def __get__(self, inst, type=None):
        if inst is None:
            return self
        if self.__get is None:
            raise AttributeError("property has no getter")
        return self.__get(inst)

    def __set__(self, inst, value):
        if self.__set is None:
            raise AttributeError("property has no setter")
        return self.__set(inst, value)

    def __delete__(self, inst):
        if self.__del is None:
            raise AttributeError("property has no deleter")
        return self.__del(inst)

*/

static TyObject * property_copy(TyObject *, TyObject *, TyObject *,
                                  TyObject *);

static TyMemberDef property_members[] = {
    {"fget", _Ty_T_OBJECT, offsetof(propertyobject, prop_get), Py_READONLY},
    {"fset", _Ty_T_OBJECT, offsetof(propertyobject, prop_set), Py_READONLY},
    {"fdel", _Ty_T_OBJECT, offsetof(propertyobject, prop_del), Py_READONLY},
    {"__doc__",  _Ty_T_OBJECT, offsetof(propertyobject, prop_doc), 0},
    {0}
};


TyDoc_STRVAR(getter_doc,
             "Descriptor to obtain a copy of the property with a different getter.");

static TyObject *
property_getter(TyObject *self, TyObject *getter)
{
    return property_copy(self, getter, NULL, NULL);
}


TyDoc_STRVAR(setter_doc,
             "Descriptor to obtain a copy of the property with a different setter.");

static TyObject *
property_setter(TyObject *self, TyObject *setter)
{
    return property_copy(self, NULL, setter, NULL);
}


TyDoc_STRVAR(deleter_doc,
             "Descriptor to obtain a copy of the property with a different deleter.");

static TyObject *
property_deleter(TyObject *self, TyObject *deleter)
{
    return property_copy(self, NULL, NULL, deleter);
}


TyDoc_STRVAR(set_name_doc,
             "__set_name__($self, owner, name, /)\n"
             "--\n"
             "\n"
             "Method to set name of a property.");

static TyObject *
property_set_name(TyObject *self, TyObject *args) {
    if (TyTuple_GET_SIZE(args) != 2) {
        TyErr_Format(
                TyExc_TypeError,
                "__set_name__() takes 2 positional arguments but %d were given",
                TyTuple_GET_SIZE(args));
        return NULL;
    }

    propertyobject *prop = (propertyobject *)self;
    TyObject *name = TyTuple_GET_ITEM(args, 1);

    Ty_XSETREF(prop->prop_name, Ty_XNewRef(name));

    Py_RETURN_NONE;
}

static TyMethodDef property_methods[] = {
    {"getter", property_getter, METH_O, getter_doc},
    {"setter", property_setter, METH_O, setter_doc},
    {"deleter", property_deleter, METH_O, deleter_doc},
    {"__set_name__", property_set_name, METH_VARARGS, set_name_doc},
    {0}
};


static void
property_dealloc(TyObject *self)
{
    propertyobject *gs = (propertyobject *)self;

    _TyObject_GC_UNTRACK(self);
    Ty_XDECREF(gs->prop_get);
    Ty_XDECREF(gs->prop_set);
    Ty_XDECREF(gs->prop_del);
    Ty_XDECREF(gs->prop_doc);
    Ty_XDECREF(gs->prop_name);
    Ty_TYPE(self)->tp_free(self);
}

static int
property_name(propertyobject *prop, TyObject **name)
{
    if (prop->prop_name != NULL) {
        *name = Ty_NewRef(prop->prop_name);
        return 1;
    }
    if (prop->prop_get == NULL) {
        *name = NULL;
        return 0;
    }
    return PyObject_GetOptionalAttr(prop->prop_get, &_Ty_ID(__name__), name);
}

static TyObject *
property_descr_get(TyObject *self, TyObject *obj, TyObject *type)
{
    if (obj == NULL || obj == Ty_None) {
        return Ty_NewRef(self);
    }

    propertyobject *gs = (propertyobject *)self;
    if (gs->prop_get == NULL) {
        TyObject *propname;
        if (property_name(gs, &propname) < 0) {
            return NULL;
        }
        TyObject *qualname = TyType_GetQualName(Ty_TYPE(obj));
        if (propname != NULL && qualname != NULL) {
            TyErr_Format(TyExc_AttributeError,
                         "property %R of %R object has no getter",
                         propname,
                         qualname);
        }
        else if (qualname != NULL) {
            TyErr_Format(TyExc_AttributeError,
                         "property of %R object has no getter",
                         qualname);
        } else {
            TyErr_SetString(TyExc_AttributeError,
                            "property has no getter");
        }
        Ty_XDECREF(propname);
        Ty_XDECREF(qualname);
        return NULL;
    }

    return PyObject_CallOneArg(gs->prop_get, obj);
}

static int
property_descr_set(TyObject *self, TyObject *obj, TyObject *value)
{
    propertyobject *gs = (propertyobject *)self;
    TyObject *func, *res;

    if (value == NULL) {
        func = gs->prop_del;
    }
    else {
        func = gs->prop_set;
    }

    if (func == NULL) {
        TyObject *propname;
        if (property_name(gs, &propname) < 0) {
            return -1;
        }
        TyObject *qualname = NULL;
        if (obj != NULL) {
            qualname = TyType_GetQualName(Ty_TYPE(obj));
        }
        if (propname != NULL && qualname != NULL) {
            TyErr_Format(TyExc_AttributeError,
                        value == NULL ?
                        "property %R of %R object has no deleter" :
                        "property %R of %R object has no setter",
                        propname,
                        qualname);
        }
        else if (qualname != NULL) {
            TyErr_Format(TyExc_AttributeError,
                            value == NULL ?
                            "property of %R object has no deleter" :
                            "property of %R object has no setter",
                            qualname);
        }
        else {
            TyErr_SetString(TyExc_AttributeError,
                         value == NULL ?
                         "property has no deleter" :
                         "property has no setter");
        }
        Ty_XDECREF(propname);
        Ty_XDECREF(qualname);
        return -1;
    }

    if (value == NULL) {
        res = PyObject_CallOneArg(func, obj);
    }
    else {
        EVAL_CALL_STAT_INC_IF_FUNCTION(EVAL_CALL_API, func);
        TyObject *args[] = { obj, value };
        res = PyObject_Vectorcall(func, args, 2, NULL);
    }

    if (res == NULL) {
        return -1;
    }

    Ty_DECREF(res);
    return 0;
}

static TyObject *
property_copy(TyObject *old, TyObject *get, TyObject *set, TyObject *del)
{
    propertyobject *pold = (propertyobject *)old;
    TyObject *new, *type, *doc;

    type = PyObject_Type(old);
    if (type == NULL)
        return NULL;

    if (get == NULL || get == Ty_None) {
        get = pold->prop_get ? pold->prop_get : Ty_None;
    }
    if (set == NULL || set == Ty_None) {
        set = pold->prop_set ? pold->prop_set : Ty_None;
    }
    if (del == NULL || del == Ty_None) {
        del = pold->prop_del ? pold->prop_del : Ty_None;
    }
    if (pold->getter_doc && get != Ty_None) {
        /* make _init use __doc__ from getter */
        doc = Ty_None;
    }
    else {
        doc = pold->prop_doc ? pold->prop_doc : Ty_None;
    }

    new =  PyObject_CallFunctionObjArgs(type, get, set, del, doc, NULL);
    Ty_DECREF(type);
    if (new == NULL)
        return NULL;

    if (PyObject_TypeCheck((new), &TyProperty_Type)) {
        Ty_XSETREF(((propertyobject *) new)->prop_name, Ty_XNewRef(pold->prop_name));
    }
    return new;
}

/*[clinic input]
property.__init__ as property_init

    fget: object(c_default="NULL") = None
        function to be used for getting an attribute value
    fset: object(c_default="NULL") = None
        function to be used for setting an attribute value
    fdel: object(c_default="NULL") = None
        function to be used for del'ing an attribute
    doc: object(c_default="NULL") = None
        docstring

Property attribute.

Typical use is to define a managed attribute x:

class C(object):
    def getx(self): return self._x
    def setx(self, value): self._x = value
    def delx(self): del self._x
    x = property(getx, setx, delx, "I'm the 'x' property.")

Decorators make defining new properties or modifying existing ones easy:

class C(object):
    @property
    def x(self):
        "I am the 'x' property."
        return self._x
    @x.setter
    def x(self, value):
        self._x = value
    @x.deleter
    def x(self):
        del self._x
[clinic start generated code]*/

static int
property_init_impl(propertyobject *self, TyObject *fget, TyObject *fset,
                   TyObject *fdel, TyObject *doc)
/*[clinic end generated code: output=01a960742b692b57 input=dfb5dbbffc6932d5]*/
{
    if (fget == Ty_None)
        fget = NULL;
    if (fset == Ty_None)
        fset = NULL;
    if (fdel == Ty_None)
        fdel = NULL;

    Ty_XSETREF(self->prop_get, Ty_XNewRef(fget));
    Ty_XSETREF(self->prop_set, Ty_XNewRef(fset));
    Ty_XSETREF(self->prop_del, Ty_XNewRef(fdel));
    Ty_XSETREF(self->prop_doc, NULL);
    Ty_XSETREF(self->prop_name, NULL);

    self->getter_doc = 0;
    TyObject *prop_doc = NULL;

    if (doc != NULL && doc != Ty_None) {
        prop_doc = Ty_XNewRef(doc);
    }
    /* if no docstring given and the getter has one, use that one */
    else if (fget != NULL) {
        int rc = PyObject_GetOptionalAttr(fget, &_Ty_ID(__doc__), &prop_doc);
        if (rc < 0) {
            return rc;
        }
        if (prop_doc == Ty_None) {
            prop_doc = NULL;
            Ty_DECREF(Ty_None);
        }
        if (prop_doc != NULL){
            self->getter_doc = 1;
        }
    }

    /* At this point `prop_doc` is either NULL or
       a non-None object with incremented ref counter */

    if (Ty_IS_TYPE(self, &TyProperty_Type)) {
        Ty_XSETREF(self->prop_doc, prop_doc);
    } else {
        /* If this is a property subclass, put __doc__ in the dict
           or designated slot of the subclass instance instead, otherwise
           it gets shadowed by __doc__ in the class's dict. */

        if (prop_doc == NULL) {
            prop_doc = Ty_NewRef(Ty_None);
        }
        int err = PyObject_SetAttr(
                    (TyObject *)self, &_Ty_ID(__doc__), prop_doc);
        Ty_DECREF(prop_doc);
        if (err < 0) {
            assert(TyErr_Occurred());
            if (!self->getter_doc &&
                TyErr_ExceptionMatches(TyExc_AttributeError))
            {
                TyErr_Clear();
                // https://github.com/python/cpython/issues/98963#issuecomment-1574413319
                // Python silently dropped this doc assignment through 3.11.
                // We preserve that behavior for backwards compatibility.
                //
                // If we ever want to deprecate this behavior, only raise a
                // warning or error when proc_doc is not None so that
                // property without a specific doc= still works.
                return 0;
            } else {
                return -1;
            }
        }
    }

    return 0;
}

static TyObject *
property_get__name__(TyObject *op, void *Py_UNUSED(ignored))
{
    propertyobject *prop = _propertyobject_CAST(op);
    TyObject *name;
    if (property_name(prop, &name) < 0) {
        return NULL;
    }
    if (name == NULL) {
        TyErr_SetString(TyExc_AttributeError,
                        "'property' object has no attribute '__name__'");
    }
    return name;
}

static int
property_set__name__(TyObject *op, TyObject *value, void *Py_UNUSED(ignored))
{
    propertyobject *prop = _propertyobject_CAST(op);
    Ty_XSETREF(prop->prop_name, Ty_XNewRef(value));
    return 0;
}

static TyObject *
property_get___isabstractmethod__(TyObject *op, void *closure)
{
    propertyobject *prop = _propertyobject_CAST(op);
    int res = _TyObject_IsAbstract(prop->prop_get);
    if (res == -1) {
        return NULL;
    }
    else if (res) {
        Py_RETURN_TRUE;
    }

    res = _TyObject_IsAbstract(prop->prop_set);
    if (res == -1) {
        return NULL;
    }
    else if (res) {
        Py_RETURN_TRUE;
    }

    res = _TyObject_IsAbstract(prop->prop_del);
    if (res == -1) {
        return NULL;
    }
    else if (res) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static TyGetSetDef property_getsetlist[] = {
    {"__name__", property_get__name__, property_set__name__, NULL, NULL},
    {"__isabstractmethod__", property_get___isabstractmethod__, NULL,
     NULL,
     NULL},
    {NULL} /* Sentinel */
};

static int
property_traverse(TyObject *self, visitproc visit, void *arg)
{
    propertyobject *pp = (propertyobject *)self;
    Ty_VISIT(pp->prop_get);
    Ty_VISIT(pp->prop_set);
    Ty_VISIT(pp->prop_del);
    Ty_VISIT(pp->prop_doc);
    Ty_VISIT(pp->prop_name);
    return 0;
}

static int
property_clear(TyObject *self)
{
    propertyobject *pp = (propertyobject *)self;
    Ty_CLEAR(pp->prop_doc);
    return 0;
}

#include "clinic/descrobject.c.h"

TyTypeObject PyDictProxy_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "mappingproxy",                             /* tp_name */
    sizeof(mappingproxyobject),                 /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    mappingproxy_dealloc,                       /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    mappingproxy_repr,                          /* tp_repr */
    &mappingproxy_as_number,                    /* tp_as_number */
    &mappingproxy_as_sequence,                  /* tp_as_sequence */
    &mappingproxy_as_mapping,                   /* tp_as_mapping */
    mappingproxy_hash,                          /* tp_hash */
    0,                                          /* tp_call */
    mappingproxy_str,                           /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_MAPPING,                     /* tp_flags */
    mappingproxy_new__doc__,                    /* tp_doc */
    mappingproxy_traverse,                      /* tp_traverse */
    0,                                          /* tp_clear */
    mappingproxy_richcompare,                   /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    mappingproxy_getiter,                       /* tp_iter */
    0,                                          /* tp_iternext */
    mappingproxy_methods,                       /* tp_methods */
    0,                                          /* tp_members */
    0,                                          /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    0,                                          /* tp_descr_get */
    0,                                          /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    0,                                          /* tp_init */
    0,                                          /* tp_alloc */
    mappingproxy_new,                           /* tp_new */
};

TyTypeObject TyProperty_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "property",                                 /* tp_name */
    sizeof(propertyobject),                     /* tp_basicsize */
    0,                                          /* tp_itemsize */
    /* methods */
    property_dealloc,                           /* tp_dealloc */
    0,                                          /* tp_vectorcall_offset */
    0,                                          /* tp_getattr */
    0,                                          /* tp_setattr */
    0,                                          /* tp_as_async */
    0,                                          /* tp_repr */
    0,                                          /* tp_as_number */
    0,                                          /* tp_as_sequence */
    0,                                          /* tp_as_mapping */
    0,                                          /* tp_hash */
    0,                                          /* tp_call */
    0,                                          /* tp_str */
    PyObject_GenericGetAttr,                    /* tp_getattro */
    0,                                          /* tp_setattro */
    0,                                          /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE,                    /* tp_flags */
    property_init__doc__,                       /* tp_doc */
    property_traverse,                          /* tp_traverse */
    property_clear,                             /* tp_clear */
    0,                                          /* tp_richcompare */
    0,                                          /* tp_weaklistoffset */
    0,                                          /* tp_iter */
    0,                                          /* tp_iternext */
    property_methods,                           /* tp_methods */
    property_members,                           /* tp_members */
    property_getsetlist,                        /* tp_getset */
    0,                                          /* tp_base */
    0,                                          /* tp_dict */
    property_descr_get,                         /* tp_descr_get */
    property_descr_set,                         /* tp_descr_set */
    0,                                          /* tp_dictoffset */
    property_init,                              /* tp_init */
    TyType_GenericAlloc,                        /* tp_alloc */
    TyType_GenericNew,                          /* tp_new */
    PyObject_GC_Del,                            /* tp_free */
};
