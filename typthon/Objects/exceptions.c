/*
 * New exceptions.c written in Iceland by Richard Jones and Georg Brandl.
 *
 * Thanks go to Tim Peters and Michael Hudson for debugging.
 */

#include <Python.h>
#include <stdbool.h>
#include "pycore_abstract.h"      // _TyObject_RealIsSubclass()
#include "pycore_ceval.h"         // _Ty_EnterRecursiveCall
#include "pycore_exceptions.h"    // struct _Py_exc_state
#include "pycore_initconfig.h"
#include "pycore_modsupport.h"    // _TyArg_NoKeywords()
#include "pycore_object.h"
#include "pycore_pyerrors.h"      // struct _TyErr_SetRaisedException
#include "pycore_tuple.h"         // _TyTuple_FromArray()

#include "osdefs.h"               // SEP
#include "clinic/exceptions.c.h"


/*[clinic input]
class BaseException "TyBaseExceptionObject *" "&TyExc_BaseException"
class BaseExceptionGroup "TyBaseExceptionGroupObject *" "&TyExc_BaseExceptionGroup"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=b7c45e78cff8edc3]*/


/* Compatibility aliases */
TyObject *TyExc_EnvironmentError = NULL;  // borrowed ref
TyObject *TyExc_IOError = NULL;  // borrowed ref
#ifdef MS_WINDOWS
TyObject *TyExc_WindowsError = NULL;  // borrowed ref
#endif


static struct _Py_exc_state*
get_exc_state(void)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    return &interp->exc_state;
}


/* NOTE: If the exception class hierarchy changes, don't forget to update
 * Lib/test/exception_hierarchy.txt
 */

static inline TyBaseExceptionObject *
PyBaseExceptionObject_CAST(TyObject *exc)
{
    assert(PyExceptionInstance_Check(exc));
    return (TyBaseExceptionObject *)exc;
}

/*
 *    BaseException
 */
static TyObject *
BaseException_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    TyBaseExceptionObject *self;

    self = (TyBaseExceptionObject *)type->tp_alloc(type, 0);
    if (!self)
        return NULL;
    /* the dict is created on the fly in PyObject_GenericSetAttr */
    self->dict = NULL;
    self->notes = NULL;
    self->traceback = self->cause = self->context = NULL;
    self->suppress_context = 0;

    if (args) {
        self->args = Ty_NewRef(args);
        return (TyObject *)self;
    }

    self->args = TyTuple_New(0);
    if (!self->args) {
        Ty_DECREF(self);
        return NULL;
    }

    return (TyObject *)self;
}

static int
BaseException_init(TyObject *op, TyObject *args, TyObject *kwds)
{
    TyBaseExceptionObject *self = PyBaseExceptionObject_CAST(op);
    if (!_TyArg_NoKeywords(Ty_TYPE(self)->tp_name, kwds))
        return -1;

    Ty_XSETREF(self->args, Ty_NewRef(args));
    return 0;
}


static TyObject *
BaseException_vectorcall(TyObject *type_obj, TyObject * const*args,
                         size_t nargsf, TyObject *kwnames)
{
    TyTypeObject *type = _TyType_CAST(type_obj);
    if (!_TyArg_NoKwnames(type->tp_name, kwnames)) {
        return NULL;
    }

    TyBaseExceptionObject *self;
    self = (TyBaseExceptionObject *)type->tp_alloc(type, 0);
    if (!self) {
        return NULL;
    }

    // The dict is created on the fly in PyObject_GenericSetAttr()
    self->dict = NULL;
    self->notes = NULL;
    self->traceback = NULL;
    self->cause = NULL;
    self->context = NULL;
    self->suppress_context = 0;

    self->args = _TyTuple_FromArray(args, PyVectorcall_NARGS(nargsf));
    if (!self->args) {
        Ty_DECREF(self);
        return NULL;
    }

    return (TyObject *)self;
}


static int
BaseException_clear(TyObject *op)
{
    TyBaseExceptionObject *self = PyBaseExceptionObject_CAST(op);
    Ty_CLEAR(self->dict);
    Ty_CLEAR(self->args);
    Ty_CLEAR(self->notes);
    Ty_CLEAR(self->traceback);
    Ty_CLEAR(self->cause);
    Ty_CLEAR(self->context);
    return 0;
}

static void
BaseException_dealloc(TyObject *op)
{
    TyBaseExceptionObject *self = PyBaseExceptionObject_CAST(op);
    PyObject_GC_UnTrack(self);
    // bpo-44348: The trashcan mechanism prevents stack overflow when deleting
    // long chains of exceptions. For example, exceptions can be chained
    // through the __context__ attributes or the __traceback__ attribute.
    (void)BaseException_clear(op);
    Ty_TYPE(self)->tp_free(self);
}

static int
BaseException_traverse(TyObject *op, visitproc visit, void *arg)
{
    TyBaseExceptionObject *self = PyBaseExceptionObject_CAST(op);
    Ty_VISIT(self->dict);
    Ty_VISIT(self->args);
    Ty_VISIT(self->notes);
    Ty_VISIT(self->traceback);
    Ty_VISIT(self->cause);
    Ty_VISIT(self->context);
    return 0;
}

static TyObject *
BaseException_str(TyObject *op)
{
    TyBaseExceptionObject *self = PyBaseExceptionObject_CAST(op);

    TyObject *res;
    Ty_BEGIN_CRITICAL_SECTION(self);
    switch (TyTuple_GET_SIZE(self->args)) {
    case 0:
        res = Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
        break;
    case 1:
        res = PyObject_Str(TyTuple_GET_ITEM(self->args, 0));
        break;
    default:
        res = PyObject_Str(self->args);
        break;
    }
    Ty_END_CRITICAL_SECTION();
    return res;
}

static TyObject *
BaseException_repr(TyObject *op)
{

    TyBaseExceptionObject *self = PyBaseExceptionObject_CAST(op);

    TyObject *res;
    Ty_BEGIN_CRITICAL_SECTION(self);
    const char *name = _TyType_Name(Ty_TYPE(self));
    if (TyTuple_GET_SIZE(self->args) == 1) {
        res = TyUnicode_FromFormat("%s(%R)", name,
                                    TyTuple_GET_ITEM(self->args, 0));
    }
    else {
        res = TyUnicode_FromFormat("%s%R", name, self->args);
    }
    Ty_END_CRITICAL_SECTION();
    return res;
}

/* Pickling support */

/*[clinic input]
@critical_section
BaseException.__reduce__
[clinic start generated code]*/

static TyObject *
BaseException___reduce___impl(TyBaseExceptionObject *self)
/*[clinic end generated code: output=af87c1247ef98748 input=283be5a10d9c964f]*/
{
    if (self->args && self->dict)
        return TyTuple_Pack(3, Ty_TYPE(self), self->args, self->dict);
    else
        return TyTuple_Pack(2, Ty_TYPE(self), self->args);
}

/*
 * Needed for backward compatibility, since exceptions used to store
 * all their attributes in the __dict__. Code is taken from cPickle's
 * load_build function.
 */

/*[clinic input]
@critical_section
BaseException.__setstate__
    state: object
    /
[clinic start generated code]*/

static TyObject *
BaseException___setstate___impl(TyBaseExceptionObject *self, TyObject *state)
/*[clinic end generated code: output=f3834889950453ab input=5524b61cfe9b9856]*/
{
    TyObject *d_key, *d_value;
    Ty_ssize_t i = 0;

    if (state != Ty_None) {
        if (!TyDict_Check(state)) {
            TyErr_SetString(TyExc_TypeError, "state is not a dictionary");
            return NULL;
        }
        while (TyDict_Next(state, &i, &d_key, &d_value)) {
            Ty_INCREF(d_key);
            Ty_INCREF(d_value);
            int res = PyObject_SetAttr((TyObject *)self, d_key, d_value);
            Ty_DECREF(d_value);
            Ty_DECREF(d_key);
            if (res < 0) {
                return NULL;
            }
        }
    }
    Py_RETURN_NONE;
}


/*[clinic input]
@critical_section
BaseException.with_traceback
    tb: object
    /

Set self.__traceback__ to tb and return self.
[clinic start generated code]*/

static TyObject *
BaseException_with_traceback_impl(TyBaseExceptionObject *self, TyObject *tb)
/*[clinic end generated code: output=81e92f2387927f10 input=b5fb64d834717e36]*/
{
    if (BaseException___traceback___set_impl(self, tb) < 0){
        return NULL;
    }
    return Ty_NewRef(self);
}

/*[clinic input]
@critical_section
BaseException.add_note
    note: object(subclass_of="&TyUnicode_Type")
    /

Add a note to the exception
[clinic start generated code]*/

static TyObject *
BaseException_add_note_impl(TyBaseExceptionObject *self, TyObject *note)
/*[clinic end generated code: output=fb7cbcba611c187b input=e60a6b6e9596acaf]*/
{
    TyObject *notes;
    if (PyObject_GetOptionalAttr((TyObject *)self, &_Ty_ID(__notes__), &notes) < 0) {
        return NULL;
    }
    if (notes == NULL) {
        notes = TyList_New(0);
        if (notes == NULL) {
            return NULL;
        }
        if (PyObject_SetAttr((TyObject *)self, &_Ty_ID(__notes__), notes) < 0) {
            Ty_DECREF(notes);
            return NULL;
        }
    }
    else if (!TyList_Check(notes)) {
        Ty_DECREF(notes);
        TyErr_SetString(TyExc_TypeError, "Cannot add note: __notes__ is not a list");
        return NULL;
    }
    if (TyList_Append(notes, note) < 0) {
        Ty_DECREF(notes);
        return NULL;
    }
    Ty_DECREF(notes);
    Py_RETURN_NONE;
}

static TyMethodDef BaseException_methods[] = {
    BASEEXCEPTION___REDUCE___METHODDEF
    BASEEXCEPTION___SETSTATE___METHODDEF
    BASEEXCEPTION_WITH_TRACEBACK_METHODDEF
    BASEEXCEPTION_ADD_NOTE_METHODDEF
    {NULL, NULL, 0, NULL},
};

/*[clinic input]
@critical_section
@getter
BaseException.args
[clinic start generated code]*/

static TyObject *
BaseException_args_get_impl(TyBaseExceptionObject *self)
/*[clinic end generated code: output=e02e34e35cf4d677 input=64282386e4d7822d]*/
{
    if (self->args == NULL) {
        Py_RETURN_NONE;
    }
    return Ty_NewRef(self->args);
}

/*[clinic input]
@critical_section
@setter
BaseException.args
[clinic start generated code]*/

static int
BaseException_args_set_impl(TyBaseExceptionObject *self, TyObject *value)
/*[clinic end generated code: output=331137e11d8f9e80 input=2400047ea5970a84]*/
{
    TyObject *seq;
    if (value == NULL) {
        TyErr_SetString(TyExc_TypeError, "args may not be deleted");
        return -1;
    }
    seq = PySequence_Tuple(value);
    if (!seq)
        return -1;
    Ty_XSETREF(self->args, seq);
    return 0;
}

/*[clinic input]
@critical_section
@getter
BaseException.__traceback__
[clinic start generated code]*/

static TyObject *
BaseException___traceback___get_impl(TyBaseExceptionObject *self)
/*[clinic end generated code: output=17cf874a52339398 input=a2277f0de62170cf]*/
{
    if (self->traceback == NULL) {
        Py_RETURN_NONE;
    }
    return Ty_NewRef(self->traceback);
}


/*[clinic input]
@critical_section
@setter
BaseException.__traceback__
[clinic start generated code]*/

static int
BaseException___traceback___set_impl(TyBaseExceptionObject *self,
                                     TyObject *value)
/*[clinic end generated code: output=a82c86d9f29f48f0 input=12676035676badad]*/
{
    if (value == NULL) {
        TyErr_SetString(TyExc_TypeError, "__traceback__ may not be deleted");
        return -1;
    }
    if (PyTraceBack_Check(value)) {
        Ty_XSETREF(self->traceback, Ty_NewRef(value));
    }
    else if (value == Ty_None) {
        Ty_CLEAR(self->traceback);
    }
    else {
        TyErr_SetString(TyExc_TypeError,
                        "__traceback__ must be a traceback or None");
        return -1;
    }
    return 0;
}

/*[clinic input]
@critical_section
@getter
BaseException.__context__
[clinic start generated code]*/

static TyObject *
BaseException___context___get_impl(TyBaseExceptionObject *self)
/*[clinic end generated code: output=6ec5d296ce8d1c93 input=b2d22687937e66ab]*/
{
    if (self->context == NULL) {
        Py_RETURN_NONE;
    }
    return Ty_NewRef(self->context);
}

/*[clinic input]
@critical_section
@setter
BaseException.__context__
[clinic start generated code]*/

static int
BaseException___context___set_impl(TyBaseExceptionObject *self,
                                   TyObject *value)
/*[clinic end generated code: output=b4cb52dcca1da3bd input=c0971adf47fa1858]*/
{
    if (value == NULL) {
        TyErr_SetString(TyExc_TypeError, "__context__ may not be deleted");
        return -1;
    } else if (value == Ty_None) {
        value = NULL;
    } else if (!PyExceptionInstance_Check(value)) {
        TyErr_SetString(TyExc_TypeError, "exception context must be None "
                        "or derive from BaseException");
        return -1;
    } else {
        Ty_INCREF(value);
    }
    Ty_XSETREF(self->context, value);
    return 0;
}

/*[clinic input]
@critical_section
@getter
BaseException.__cause__
[clinic start generated code]*/

static TyObject *
BaseException___cause___get_impl(TyBaseExceptionObject *self)
/*[clinic end generated code: output=987f6c4d8a0bdbab input=40e0eac427b6e602]*/
{
    if (self->cause == NULL) {
        Py_RETURN_NONE;
    }
    return Ty_NewRef(self->cause);
}

/*[clinic input]
@critical_section
@setter
BaseException.__cause__
[clinic start generated code]*/

static int
BaseException___cause___set_impl(TyBaseExceptionObject *self,
                                 TyObject *value)
/*[clinic end generated code: output=6161315398aaf541 input=e1b403c0bde3f62a]*/
{
    if (value == NULL) {
        TyErr_SetString(TyExc_TypeError, "__cause__ may not be deleted");
        return -1;
    } else if (value == Ty_None) {
        value = NULL;
    } else if (!PyExceptionInstance_Check(value)) {
        TyErr_SetString(TyExc_TypeError, "exception cause must be None "
                        "or derive from BaseException");
        return -1;
    } else {
        /* PyException_SetCause steals this reference */
        Ty_INCREF(value);
    }
    PyException_SetCause((TyObject *)self, value);
    return 0;
}


static TyGetSetDef BaseException_getset[] = {
    {"__dict__", PyObject_GenericGetDict, PyObject_GenericSetDict},
     BASEEXCEPTION_ARGS_GETSETDEF
     BASEEXCEPTION___TRACEBACK___GETSETDEF
     BASEEXCEPTION___CONTEXT___GETSETDEF
     BASEEXCEPTION___CAUSE___GETSETDEF
    {NULL},
};


TyObject *
PyException_GetTraceback(TyObject *self)
{
    TyObject *traceback;
    Ty_BEGIN_CRITICAL_SECTION(self);
    traceback = Ty_XNewRef(PyBaseExceptionObject_CAST(self)->traceback);
    Ty_END_CRITICAL_SECTION();
    return traceback;
}


int
PyException_SetTraceback(TyObject *self, TyObject *tb)
{
    int res;
    Ty_BEGIN_CRITICAL_SECTION(self);
    res = BaseException___traceback___set_impl(PyBaseExceptionObject_CAST(self), tb);
    Ty_END_CRITICAL_SECTION();
    return res;
}

TyObject *
PyException_GetCause(TyObject *self)
{
    TyObject *cause;
    Ty_BEGIN_CRITICAL_SECTION(self);
    cause = Ty_XNewRef(PyBaseExceptionObject_CAST(self)->cause);
    Ty_END_CRITICAL_SECTION();
    return cause;
}

/* Steals a reference to cause */
void
PyException_SetCause(TyObject *self, TyObject *cause)
{
    Ty_BEGIN_CRITICAL_SECTION(self);
    TyBaseExceptionObject *base_self = PyBaseExceptionObject_CAST(self);
    base_self->suppress_context = 1;
    Ty_XSETREF(base_self->cause, cause);
    Ty_END_CRITICAL_SECTION();
}

TyObject *
PyException_GetContext(TyObject *self)
{
    TyObject *context;
    Ty_BEGIN_CRITICAL_SECTION(self);
    context = Ty_XNewRef(PyBaseExceptionObject_CAST(self)->context);
    Ty_END_CRITICAL_SECTION();
    return context;
}

/* Steals a reference to context */
void
PyException_SetContext(TyObject *self, TyObject *context)
{
    Ty_BEGIN_CRITICAL_SECTION(self);
    Ty_XSETREF(PyBaseExceptionObject_CAST(self)->context, context);
    Ty_END_CRITICAL_SECTION();
}

TyObject *
PyException_GetArgs(TyObject *self)
{
    TyObject *args;
    Ty_BEGIN_CRITICAL_SECTION(self);
    args = Ty_NewRef(PyBaseExceptionObject_CAST(self)->args);
    Ty_END_CRITICAL_SECTION();
    return args;
}

void
PyException_SetArgs(TyObject *self, TyObject *args)
{
    Ty_BEGIN_CRITICAL_SECTION(self);
    Ty_INCREF(args);
    Ty_XSETREF(PyBaseExceptionObject_CAST(self)->args, args);
    Ty_END_CRITICAL_SECTION();
}

const char *
PyExceptionClass_Name(TyObject *ob)
{
    assert(PyExceptionClass_Check(ob));
    return ((TyTypeObject*)ob)->tp_name;
}

static struct TyMemberDef BaseException_members[] = {
    {"__suppress_context__", Ty_T_BOOL,
     offsetof(TyBaseExceptionObject, suppress_context)},
    {NULL}
};


static TyTypeObject _TyExc_BaseException = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "BaseException", /*tp_name*/
    sizeof(TyBaseExceptionObject), /*tp_basicsize*/
    0,                          /*tp_itemsize*/
    BaseException_dealloc,      /*tp_dealloc*/
    0,                          /*tp_vectorcall_offset*/
    0,                          /*tp_getattr*/
    0,                          /*tp_setattr*/
    0,                          /*tp_as_async*/
    BaseException_repr,         /*tp_repr*/
    0,                          /*tp_as_number*/
    0,                          /*tp_as_sequence*/
    0,                          /*tp_as_mapping*/
    0,                          /*tp_hash */
    0,                          /*tp_call*/
    BaseException_str,          /*tp_str*/
    PyObject_GenericGetAttr,    /*tp_getattro*/
    PyObject_GenericSetAttr,    /*tp_setattro*/
    0,                          /*tp_as_buffer*/
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASE_EXC_SUBCLASS,  /*tp_flags*/
    TyDoc_STR("Common base class for all exceptions"), /* tp_doc */
    BaseException_traverse,     /* tp_traverse */
    BaseException_clear,        /* tp_clear */
    0,                          /* tp_richcompare */
    0,                          /* tp_weaklistoffset */
    0,                          /* tp_iter */
    0,                          /* tp_iternext */
    BaseException_methods,      /* tp_methods */
    BaseException_members,      /* tp_members */
    BaseException_getset,       /* tp_getset */
    0,                          /* tp_base */
    0,                          /* tp_dict */
    0,                          /* tp_descr_get */
    0,                          /* tp_descr_set */
    offsetof(TyBaseExceptionObject, dict), /* tp_dictoffset */
    BaseException_init,         /* tp_init */
    0,                          /* tp_alloc */
    BaseException_new,          /* tp_new */
    .tp_vectorcall = BaseException_vectorcall,
};
/* the CPython API expects exceptions to be (TyObject *) - both a hold-over
from the previous implementation and also allowing Python objects to be used
in the API */
TyObject *TyExc_BaseException = (TyObject *)&_TyExc_BaseException;

/* note these macros omit the last semicolon so the macro invocation may
 * include it and not look strange.
 */
#define SimpleExtendsException(EXCBASE, EXCNAME, EXCDOC) \
static TyTypeObject _TyExc_ ## EXCNAME = { \
    TyVarObject_HEAD_INIT(NULL, 0) \
    # EXCNAME, \
    sizeof(TyBaseExceptionObject), \
    0, BaseException_dealloc, 0, 0, 0, 0, 0, 0, 0, \
    0, 0, 0, 0, 0, 0, 0, \
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC, \
    TyDoc_STR(EXCDOC), BaseException_traverse, \
    BaseException_clear, 0, 0, 0, 0, 0, 0, 0, &_ ## EXCBASE, \
    0, 0, 0, offsetof(TyBaseExceptionObject, dict), \
    BaseException_init, 0, BaseException_new,\
}; \
TyObject *TyExc_ ## EXCNAME = (TyObject *)&_TyExc_ ## EXCNAME

#define MiddlingExtendsExceptionEx(EXCBASE, EXCNAME, PYEXCNAME, EXCSTORE, EXCDOC) \
TyTypeObject _TyExc_ ## EXCNAME = { \
    TyVarObject_HEAD_INIT(NULL, 0) \
    # PYEXCNAME, \
    sizeof(Ty ## EXCSTORE ## Object), \
    0, EXCSTORE ## _dealloc, 0, 0, 0, 0, 0, 0, 0, 0, 0, \
    0, 0, 0, 0, 0, \
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC, \
    TyDoc_STR(EXCDOC), EXCSTORE ## _traverse, \
    EXCSTORE ## _clear, 0, 0, 0, 0, 0, 0, 0, &_ ## EXCBASE, \
    0, 0, 0, offsetof(Ty ## EXCSTORE ## Object, dict), \
    EXCSTORE ## _init, 0, 0, \
};

#define MiddlingExtendsException(EXCBASE, EXCNAME, EXCSTORE, EXCDOC) \
    static MiddlingExtendsExceptionEx( \
        EXCBASE, EXCNAME, EXCNAME, EXCSTORE, EXCDOC); \
    TyObject *TyExc_ ## EXCNAME = (TyObject *)&_TyExc_ ## EXCNAME

#define ComplexExtendsException(EXCBASE, EXCNAME, EXCSTORE, EXCNEW, \
                                EXCMETHODS, EXCMEMBERS, EXCGETSET, \
                                EXCSTR, EXCDOC) \
static TyTypeObject _TyExc_ ## EXCNAME = { \
    TyVarObject_HEAD_INIT(NULL, 0) \
    # EXCNAME, \
    sizeof(Ty ## EXCSTORE ## Object), 0, \
    EXCSTORE ## _dealloc, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, \
    EXCSTR, 0, 0, 0, \
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC, \
    TyDoc_STR(EXCDOC), EXCSTORE ## _traverse, \
    EXCSTORE ## _clear, 0, 0, 0, 0, EXCMETHODS, \
    EXCMEMBERS, EXCGETSET, &_ ## EXCBASE, \
    0, 0, 0, offsetof(Ty ## EXCSTORE ## Object, dict), \
    EXCSTORE ## _init, 0, EXCNEW,\
}; \
TyObject *TyExc_ ## EXCNAME = (TyObject *)&_TyExc_ ## EXCNAME


/*
 *    Exception extends BaseException
 */
SimpleExtendsException(TyExc_BaseException, Exception,
                       "Common base class for all non-exit exceptions.");


/*
 *    TypeError extends Exception
 */
SimpleExtendsException(TyExc_Exception, TypeError,
                       "Inappropriate argument type.");


/*
 *    StopAsyncIteration extends Exception
 */
SimpleExtendsException(TyExc_Exception, StopAsyncIteration,
                       "Signal the end from iterator.__anext__().");


/*
 *    StopIteration extends Exception
 */

static TyMemberDef StopIteration_members[] = {
    {"value", _Ty_T_OBJECT, offsetof(TyStopIterationObject, value), 0,
        TyDoc_STR("generator return value")},
    {NULL}  /* Sentinel */
};

static inline TyStopIterationObject *
PyStopIterationObject_CAST(TyObject *self)
{
    assert(PyObject_TypeCheck(self, (TyTypeObject *)TyExc_StopIteration));
    return (TyStopIterationObject *)self;
}

static int
StopIteration_init(TyObject *op, TyObject *args, TyObject *kwds)
{
    Ty_ssize_t size = TyTuple_GET_SIZE(args);
    TyObject *value;

    if (BaseException_init(op, args, kwds) == -1)
        return -1;
    TyStopIterationObject *self = PyStopIterationObject_CAST(op);
    Ty_CLEAR(self->value);
    if (size > 0)
        value = TyTuple_GET_ITEM(args, 0);
    else
        value = Ty_None;
    self->value = Ty_NewRef(value);
    return 0;
}

static int
StopIteration_clear(TyObject *op)
{
    TyStopIterationObject *self = PyStopIterationObject_CAST(op);
    Ty_CLEAR(self->value);
    return BaseException_clear(op);
}

static void
StopIteration_dealloc(TyObject *self)
{
    PyObject_GC_UnTrack(self);
    (void)StopIteration_clear(self);
    Ty_TYPE(self)->tp_free(self);
}

static int
StopIteration_traverse(TyObject *op, visitproc visit, void *arg)
{
    TyStopIterationObject *self = PyStopIterationObject_CAST(op);
    Ty_VISIT(self->value);
    return BaseException_traverse(op, visit, arg);
}

ComplexExtendsException(TyExc_Exception, StopIteration, StopIteration,
                        0, 0, StopIteration_members, 0, 0,
                        "Signal the end from iterator.__next__().");


/*
 *    GeneratorExit extends BaseException
 */
SimpleExtendsException(TyExc_BaseException, GeneratorExit,
                       "Request that a generator exit.");


/*
 *    SystemExit extends BaseException
 */

static inline TySystemExitObject *
PySystemExitObject_CAST(TyObject *self)
{
    assert(PyObject_TypeCheck(self, (TyTypeObject *)TyExc_SystemExit));
    return (TySystemExitObject *)self;
}

static int
SystemExit_init(TyObject *op, TyObject *args, TyObject *kwds)
{
    Ty_ssize_t size = TyTuple_GET_SIZE(args);

    if (BaseException_init(op, args, kwds) == -1)
        return -1;

    TySystemExitObject *self = PySystemExitObject_CAST(op);
    if (size == 0)
        return 0;
    if (size == 1) {
        Ty_XSETREF(self->code, Ty_NewRef(TyTuple_GET_ITEM(args, 0)));
    }
    else { /* size > 1 */
        Ty_XSETREF(self->code, Ty_NewRef(args));
    }
    return 0;
}

static int
SystemExit_clear(TyObject *op)
{
    TySystemExitObject *self = PySystemExitObject_CAST(op);
    Ty_CLEAR(self->code);
    return BaseException_clear(op);
}

static void
SystemExit_dealloc(TyObject *self)
{
    _TyObject_GC_UNTRACK(self);
    (void)SystemExit_clear(self);
    Ty_TYPE(self)->tp_free(self);
}

static int
SystemExit_traverse(TyObject *op, visitproc visit, void *arg)
{
    TySystemExitObject *self = PySystemExitObject_CAST(op);
    Ty_VISIT(self->code);
    return BaseException_traverse(op, visit, arg);
}

static TyMemberDef SystemExit_members[] = {
    {"code", _Ty_T_OBJECT, offsetof(TySystemExitObject, code), 0,
        TyDoc_STR("exception code")},
    {NULL}  /* Sentinel */
};

ComplexExtendsException(TyExc_BaseException, SystemExit, SystemExit,
                        0, 0, SystemExit_members, 0, 0,
                        "Request to exit from the interpreter.");

/*
 *    BaseExceptionGroup extends BaseException
 *    ExceptionGroup extends BaseExceptionGroup and Exception
 */


static inline TyBaseExceptionGroupObject*
PyBaseExceptionGroupObject_CAST(TyObject *exc)
{
    assert(_PyBaseExceptionGroup_Check(exc));
    return (TyBaseExceptionGroupObject *)exc;
}

static TyObject *
BaseExceptionGroup_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    struct _Py_exc_state *state = get_exc_state();
    TyTypeObject *TyExc_ExceptionGroup =
        (TyTypeObject*)state->TyExc_ExceptionGroup;

    TyObject *message = NULL;
    TyObject *exceptions = NULL;

    if (!TyArg_ParseTuple(args,
                          "UO:BaseExceptionGroup.__new__",
                          &message,
                          &exceptions)) {
        return NULL;
    }

    if (!PySequence_Check(exceptions)) {
        TyErr_SetString(
            TyExc_TypeError,
            "second argument (exceptions) must be a sequence");
        return NULL;
    }

    exceptions = PySequence_Tuple(exceptions);
    if (!exceptions) {
        return NULL;
    }

    /* We are now holding a ref to the exceptions tuple */

    Ty_ssize_t numexcs = TyTuple_GET_SIZE(exceptions);
    if (numexcs == 0) {
        TyErr_SetString(
            TyExc_ValueError,
            "second argument (exceptions) must be a non-empty sequence");
        goto error;
    }

    bool nested_base_exceptions = false;
    for (Ty_ssize_t i = 0; i < numexcs; i++) {
        TyObject *exc = TyTuple_GET_ITEM(exceptions, i);
        if (!exc) {
            goto error;
        }
        if (!PyExceptionInstance_Check(exc)) {
            TyErr_Format(
                TyExc_ValueError,
                "Item %d of second argument (exceptions) is not an exception",
                i);
            goto error;
        }
        int is_nonbase_exception = PyObject_IsInstance(exc, TyExc_Exception);
        if (is_nonbase_exception < 0) {
            goto error;
        }
        else if (is_nonbase_exception == 0) {
            nested_base_exceptions = true;
        }
    }

    TyTypeObject *cls = type;
    if (cls == TyExc_ExceptionGroup) {
        if (nested_base_exceptions) {
            TyErr_SetString(TyExc_TypeError,
                "Cannot nest BaseExceptions in an ExceptionGroup");
            goto error;
        }
    }
    else if (cls == (TyTypeObject*)TyExc_BaseExceptionGroup) {
        if (!nested_base_exceptions) {
            /* All nested exceptions are Exception subclasses,
             * wrap them in an ExceptionGroup
             */
            cls = TyExc_ExceptionGroup;
        }
    }
    else {
        /* user-defined subclass */
        if (nested_base_exceptions) {
            int nonbase = PyObject_IsSubclass((TyObject*)cls, TyExc_Exception);
            if (nonbase == -1) {
                goto error;
            }
            else if (nonbase == 1) {
                TyErr_Format(TyExc_TypeError,
                    "Cannot nest BaseExceptions in '%.200s'",
                    cls->tp_name);
                goto error;
            }
        }
    }

    if (!cls) {
        /* Don't crash during interpreter shutdown
         * (TyExc_ExceptionGroup may have been cleared)
         */
        cls = (TyTypeObject*)TyExc_BaseExceptionGroup;
    }
    TyBaseExceptionGroupObject *self =
        PyBaseExceptionGroupObject_CAST(BaseException_new(cls, args, kwds));
    if (!self) {
        goto error;
    }

    self->msg = Ty_NewRef(message);
    self->excs = exceptions;
    return (TyObject*)self;
error:
    Ty_DECREF(exceptions);
    return NULL;
}

TyObject *
_TyExc_CreateExceptionGroup(const char *msg_str, TyObject *excs)
{
    TyObject *msg = TyUnicode_FromString(msg_str);
    if (!msg) {
        return NULL;
    }
    TyObject *args = TyTuple_Pack(2, msg, excs);
    Ty_DECREF(msg);
    if (!args) {
        return NULL;
    }
    TyObject *result = PyObject_CallObject(TyExc_BaseExceptionGroup, args);
    Ty_DECREF(args);
    return result;
}

static int
BaseExceptionGroup_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    if (!_TyArg_NoKeywords(Ty_TYPE(self)->tp_name, kwds)) {
        return -1;
    }
    if (BaseException_init(self, args, kwds) == -1) {
        return -1;
    }
    return 0;
}

static int
BaseExceptionGroup_clear(TyObject *op)
{
    TyBaseExceptionGroupObject *self = PyBaseExceptionGroupObject_CAST(op);
    Ty_CLEAR(self->msg);
    Ty_CLEAR(self->excs);
    return BaseException_clear(op);
}

static void
BaseExceptionGroup_dealloc(TyObject *self)
{
    _TyObject_GC_UNTRACK(self);
    (void)BaseExceptionGroup_clear(self);
    Ty_TYPE(self)->tp_free(self);
}

static int
BaseExceptionGroup_traverse(TyObject *op, visitproc visit, void *arg)
{
    TyBaseExceptionGroupObject *self = PyBaseExceptionGroupObject_CAST(op);
    Ty_VISIT(self->msg);
    Ty_VISIT(self->excs);
    return BaseException_traverse(op, visit, arg);
}

static TyObject *
BaseExceptionGroup_str(TyObject *op)
{
    TyBaseExceptionGroupObject *self = PyBaseExceptionGroupObject_CAST(op);
    assert(self->msg);
    assert(TyUnicode_Check(self->msg));

    assert(TyTuple_CheckExact(self->excs));
    Ty_ssize_t num_excs = TyTuple_Size(self->excs);
    return TyUnicode_FromFormat(
        "%S (%zd sub-exception%s)",
        self->msg, num_excs, num_excs > 1 ? "s" : "");
}

/*[clinic input]
@critical_section
BaseExceptionGroup.derive
    excs: object
    /
[clinic start generated code]*/

static TyObject *
BaseExceptionGroup_derive_impl(TyBaseExceptionGroupObject *self,
                               TyObject *excs)
/*[clinic end generated code: output=4307564218dfbf06 input=f72009d38e98cec1]*/
{
    TyObject *init_args = TyTuple_Pack(2, self->msg, excs);
    if (!init_args) {
        return NULL;
    }
    TyObject *eg = PyObject_CallObject(
        TyExc_BaseExceptionGroup, init_args);
    Ty_DECREF(init_args);
    return eg;
}

static int
exceptiongroup_subset(
    TyBaseExceptionGroupObject *_orig, TyObject *excs, TyObject **result)
{
    /* Sets *result to an ExceptionGroup wrapping excs with metadata from
     * _orig. If excs is empty, sets *result to NULL.
     * Returns 0 on success and -1 on error.

     * This function is used by split() to construct the match/rest parts,
     * so excs is the matching or non-matching sub-sequence of orig->excs
     * (this function does not verify that it is a subsequence).
     */
    TyObject *orig = (TyObject *)_orig;

    *result = NULL;
    Ty_ssize_t num_excs = PySequence_Size(excs);
    if (num_excs < 0) {
        return -1;
    }
    else if (num_excs == 0) {
        return 0;
    }

    TyObject *eg = PyObject_CallMethod(
        orig, "derive", "(O)", excs);
    if (!eg) {
        return -1;
    }

    if (!_PyBaseExceptionGroup_Check(eg)) {
        TyErr_SetString(TyExc_TypeError,
            "derive must return an instance of BaseExceptionGroup");
        goto error;
    }

    /* Now we hold a reference to the new eg */

    TyObject *tb = PyException_GetTraceback(orig);
    if (tb) {
        int res = PyException_SetTraceback(eg, tb);
        Ty_DECREF(tb);
        if (res < 0) {
            goto error;
        }
    }
    PyException_SetContext(eg, PyException_GetContext(orig));
    PyException_SetCause(eg, PyException_GetCause(orig));

    TyObject *notes;
    if (PyObject_GetOptionalAttr(orig, &_Ty_ID(__notes__), &notes) < 0) {
        goto error;
    }
    if (notes) {
        if (PySequence_Check(notes)) {
            /* Make a copy so the parts have independent notes lists. */
            TyObject *notes_copy = PySequence_List(notes);
            Ty_DECREF(notes);
            if (notes_copy == NULL) {
                goto error;
            }
            int res = PyObject_SetAttr(eg, &_Ty_ID(__notes__), notes_copy);
            Ty_DECREF(notes_copy);
            if (res < 0) {
                goto error;
            }
        }
        else {
            /* __notes__ is supposed to be a list, and split() is not a
             * good place to report earlier user errors, so we just ignore
             * notes of non-sequence type.
             */
            Ty_DECREF(notes);
        }
    }

    *result = eg;
    return 0;
error:
    Ty_DECREF(eg);
    return -1;
}

typedef enum {
    /* Exception type or tuple of thereof */
    EXCEPTION_GROUP_MATCH_BY_TYPE = 0,
    /* A PyFunction returning True for matching exceptions */
    EXCEPTION_GROUP_MATCH_BY_PREDICATE = 1,
    /* A set of the IDs of leaf exceptions to include in the result.
     * This matcher type is used internally by the interpreter
     * to construct reraised exceptions.
     */
    EXCEPTION_GROUP_MATCH_INSTANCE_IDS = 2
} _exceptiongroup_split_matcher_type;

static int
get_matcher_type(TyObject *value,
                 _exceptiongroup_split_matcher_type *type)
{
    assert(value);

    if (PyCallable_Check(value) && !TyType_Check(value)) {
        *type = EXCEPTION_GROUP_MATCH_BY_PREDICATE;
        return 0;
    }

    if (PyExceptionClass_Check(value)) {
        *type = EXCEPTION_GROUP_MATCH_BY_TYPE;
        return 0;
    }

    if (TyTuple_CheckExact(value)) {
        Ty_ssize_t n = TyTuple_GET_SIZE(value);
        for (Ty_ssize_t i=0; i<n; i++) {
            if (!PyExceptionClass_Check(TyTuple_GET_ITEM(value, i))) {
                goto error;
            }
        }
        *type = EXCEPTION_GROUP_MATCH_BY_TYPE;
        return 0;
    }

error:
    TyErr_SetString(
        TyExc_TypeError,
        "expected an exception type, a tuple of exception types, or a callable (other than a class)");
    return -1;
}

static int
exceptiongroup_split_check_match(TyObject *exc,
                                 _exceptiongroup_split_matcher_type matcher_type,
                                 TyObject *matcher_value)
{
    switch (matcher_type) {
    case EXCEPTION_GROUP_MATCH_BY_TYPE: {
        assert(PyExceptionClass_Check(matcher_value) ||
               TyTuple_CheckExact(matcher_value));
        return TyErr_GivenExceptionMatches(exc, matcher_value);
    }
    case EXCEPTION_GROUP_MATCH_BY_PREDICATE: {
        assert(PyCallable_Check(matcher_value) && !TyType_Check(matcher_value));
        TyObject *exc_matches = PyObject_CallOneArg(matcher_value, exc);
        if (exc_matches == NULL) {
            return -1;
        }
        int is_true = PyObject_IsTrue(exc_matches);
        Ty_DECREF(exc_matches);
        return is_true;
    }
    case EXCEPTION_GROUP_MATCH_INSTANCE_IDS: {
        assert(TySet_Check(matcher_value));
        if (!_PyBaseExceptionGroup_Check(exc)) {
            TyObject *exc_id = TyLong_FromVoidPtr(exc);
            if (exc_id == NULL) {
                return -1;
            }
            int res = TySet_Contains(matcher_value, exc_id);
            Ty_DECREF(exc_id);
            return res;
        }
        return 0;
    }
    }
    return 0;
}

typedef struct {
    TyObject *match;
    TyObject *rest;
} _exceptiongroup_split_result;

static int
exceptiongroup_split_recursive(TyObject *exc,
                               _exceptiongroup_split_matcher_type matcher_type,
                               TyObject *matcher_value,
                               bool construct_rest,
                               _exceptiongroup_split_result *result)
{
    result->match = NULL;
    result->rest = NULL;

    int is_match = exceptiongroup_split_check_match(
        exc, matcher_type, matcher_value);
    if (is_match < 0) {
        return -1;
    }

    if (is_match) {
        /* Full match */
        result->match = Ty_NewRef(exc);
        return 0;
    }
    else if (!_PyBaseExceptionGroup_Check(exc)) {
        /* Leaf exception and no match */
        if (construct_rest) {
            result->rest = Ty_NewRef(exc);
        }
        return 0;
    }

    /* Partial match */

    TyBaseExceptionGroupObject *eg = PyBaseExceptionGroupObject_CAST(exc);
    assert(TyTuple_CheckExact(eg->excs));
    Ty_ssize_t num_excs = TyTuple_Size(eg->excs);
    if (num_excs < 0) {
        return -1;
    }
    assert(num_excs > 0); /* checked in constructor, and excs is read-only */

    int retval = -1;
    TyObject *match_list = TyList_New(0);
    if (!match_list) {
        return -1;
    }

    TyObject *rest_list = NULL;
    if (construct_rest) {
        rest_list = TyList_New(0);
        if (!rest_list) {
            goto done;
        }
    }
    /* recursive calls */
    for (Ty_ssize_t i = 0; i < num_excs; i++) {
        TyObject *e = TyTuple_GET_ITEM(eg->excs, i);
        _exceptiongroup_split_result rec_result;
        if (_Ty_EnterRecursiveCall(" in exceptiongroup_split_recursive")) {
            goto done;
        }
        if (exceptiongroup_split_recursive(
                e, matcher_type, matcher_value,
                construct_rest, &rec_result) < 0) {
            assert(!rec_result.match);
            assert(!rec_result.rest);
            _Ty_LeaveRecursiveCall();
            goto done;
        }
        _Ty_LeaveRecursiveCall();
        if (rec_result.match) {
            assert(TyList_CheckExact(match_list));
            if (TyList_Append(match_list, rec_result.match) < 0) {
                Ty_DECREF(rec_result.match);
                Ty_XDECREF(rec_result.rest);
                goto done;
            }
            Ty_DECREF(rec_result.match);
        }
        if (rec_result.rest) {
            assert(construct_rest);
            assert(TyList_CheckExact(rest_list));
            if (TyList_Append(rest_list, rec_result.rest) < 0) {
                Ty_DECREF(rec_result.rest);
                goto done;
            }
            Ty_DECREF(rec_result.rest);
        }
    }

    /* construct result */
    if (exceptiongroup_subset(eg, match_list, &result->match) < 0) {
        goto done;
    }

    if (construct_rest) {
        assert(TyList_CheckExact(rest_list));
        if (exceptiongroup_subset(eg, rest_list, &result->rest) < 0) {
            Ty_CLEAR(result->match);
            goto done;
        }
    }
    retval = 0;
done:
    Ty_DECREF(match_list);
    Ty_XDECREF(rest_list);
    if (retval < 0) {
        Ty_CLEAR(result->match);
        Ty_CLEAR(result->rest);
    }
    return retval;
}

/*[clinic input]
@critical_section
BaseExceptionGroup.split
    matcher_value: object
    /
[clinic start generated code]*/

static TyObject *
BaseExceptionGroup_split_impl(TyBaseExceptionGroupObject *self,
                              TyObject *matcher_value)
/*[clinic end generated code: output=d74db579da4df6e2 input=0c5cfbfed57e0052]*/
{
    _exceptiongroup_split_matcher_type matcher_type;
    if (get_matcher_type(matcher_value, &matcher_type) < 0) {
        return NULL;
    }

    _exceptiongroup_split_result split_result;
    bool construct_rest = true;
    if (exceptiongroup_split_recursive(
            (TyObject *)self, matcher_type, matcher_value,
            construct_rest, &split_result) < 0) {
        return NULL;
    }

    TyObject *result = TyTuple_Pack(
            2,
            split_result.match ? split_result.match : Ty_None,
            split_result.rest ? split_result.rest : Ty_None);

    Ty_XDECREF(split_result.match);
    Ty_XDECREF(split_result.rest);
    return result;
}

/*[clinic input]
@critical_section
BaseExceptionGroup.subgroup
    matcher_value: object
    /
[clinic start generated code]*/

static TyObject *
BaseExceptionGroup_subgroup_impl(TyBaseExceptionGroupObject *self,
                                 TyObject *matcher_value)
/*[clinic end generated code: output=07dbec8f77d4dd8e input=988ffdd755a151ce]*/
{
    _exceptiongroup_split_matcher_type matcher_type;
    if (get_matcher_type(matcher_value, &matcher_type) < 0) {
        return NULL;
    }

    _exceptiongroup_split_result split_result;
    bool construct_rest = false;
    if (exceptiongroup_split_recursive(
            (TyObject *)self, matcher_type, matcher_value,
            construct_rest, &split_result) < 0) {
        return NULL;
    }

    TyObject *result = Ty_NewRef(
            split_result.match ? split_result.match : Ty_None);

    Ty_XDECREF(split_result.match);
    assert(!split_result.rest);
    return result;
}

static int
collect_exception_group_leaf_ids(TyObject *exc, TyObject *leaf_ids)
{
    if (Ty_IsNone(exc)) {
        return 0;
    }

    assert(PyExceptionInstance_Check(exc));
    assert(TySet_Check(leaf_ids));

    /* Add IDs of all leaf exceptions in exc to the leaf_ids set */

    if (!_PyBaseExceptionGroup_Check(exc)) {
        TyObject *exc_id = TyLong_FromVoidPtr(exc);
        if (exc_id == NULL) {
            return -1;
        }
        int res = TySet_Add(leaf_ids, exc_id);
        Ty_DECREF(exc_id);
        return res;
    }
    TyBaseExceptionGroupObject *eg = PyBaseExceptionGroupObject_CAST(exc);
    Ty_ssize_t num_excs = TyTuple_GET_SIZE(eg->excs);
    /* recursive calls */
    for (Ty_ssize_t i = 0; i < num_excs; i++) {
        TyObject *e = TyTuple_GET_ITEM(eg->excs, i);
        if (_Ty_EnterRecursiveCall(" in collect_exception_group_leaf_ids")) {
            return -1;
        }
        int res = collect_exception_group_leaf_ids(e, leaf_ids);
        _Ty_LeaveRecursiveCall();
        if (res < 0) {
            return -1;
        }
    }
    return 0;
}

/* This function is used by the interpreter to construct reraised
 * exception groups. It takes an exception group eg and a list
 * of exception groups keep and returns the sub-exception group
 * of eg which contains all leaf exceptions that are contained
 * in any exception group in keep.
 */
static TyObject *
exception_group_projection(TyObject *eg, TyObject *keep)
{
    assert(_PyBaseExceptionGroup_Check(eg));
    assert(TyList_CheckExact(keep));

    TyObject *leaf_ids = TySet_New(NULL);
    if (!leaf_ids) {
        return NULL;
    }

    Ty_ssize_t n = TyList_GET_SIZE(keep);
    for (Ty_ssize_t i = 0; i < n; i++) {
        TyObject *e = TyList_GET_ITEM(keep, i);
        assert(e != NULL);
        assert(_PyBaseExceptionGroup_Check(e));
        if (collect_exception_group_leaf_ids(e, leaf_ids) < 0) {
            Ty_DECREF(leaf_ids);
            return NULL;
        }
    }

    _exceptiongroup_split_result split_result;
    bool construct_rest = false;
    int err = exceptiongroup_split_recursive(
                eg, EXCEPTION_GROUP_MATCH_INSTANCE_IDS, leaf_ids,
                construct_rest, &split_result);
    Ty_DECREF(leaf_ids);
    if (err < 0) {
        return NULL;
    }

    TyObject *result = split_result.match ?
        split_result.match : Ty_NewRef(Ty_None);
    assert(split_result.rest == NULL);
    return result;
}

static bool
is_same_exception_metadata(TyObject *exc1, TyObject *exc2)
{
    assert(PyExceptionInstance_Check(exc1));
    assert(PyExceptionInstance_Check(exc2));

    TyBaseExceptionObject *e1 = (TyBaseExceptionObject *)exc1;
    TyBaseExceptionObject *e2 = (TyBaseExceptionObject *)exc2;

    return (e1->notes == e2->notes &&
            e1->traceback == e2->traceback &&
            e1->cause == e2->cause &&
            e1->context == e2->context);
}

/*
   This function is used by the interpreter to calculate
   the exception group to be raised at the end of a
   try-except* construct.

   orig: the original except that was caught.
   excs: a list of exceptions that were raised/reraised
         in the except* clauses.

   Calculates an exception group to raise. It contains
   all exceptions in excs, where those that were reraised
   have same nesting structure as in orig, and those that
   were raised (if any) are added as siblings in a new EG.

   Returns NULL and sets an exception on failure.
*/
TyObject *
_TyExc_PrepReraiseStar(TyObject *orig, TyObject *excs)
{
    /* orig must be a raised & caught exception, so it has a traceback */
    assert(PyExceptionInstance_Check(orig));
    assert(PyBaseExceptionObject_CAST(orig)->traceback != NULL);

    assert(TyList_Check(excs));

    Ty_ssize_t numexcs = TyList_GET_SIZE(excs);

    if (numexcs == 0) {
        return Ty_NewRef(Ty_None);
    }

    if (!_PyBaseExceptionGroup_Check(orig)) {
        /* a naked exception was caught and wrapped. Only one except* clause
         * could have executed,so there is at most one exception to raise.
         */

        assert(numexcs == 1 || (numexcs == 2 && TyList_GET_ITEM(excs, 1) == Ty_None));

        TyObject *e = TyList_GET_ITEM(excs, 0);
        assert(e != NULL);
        return Ty_NewRef(e);
    }

    TyObject *raised_list = TyList_New(0);
    if (raised_list == NULL) {
        return NULL;
    }
    TyObject* reraised_list = TyList_New(0);
    if (reraised_list == NULL) {
        Ty_DECREF(raised_list);
        return NULL;
    }

    /* Now we are holding refs to raised_list and reraised_list */

    TyObject *result = NULL;

    /* Split excs into raised and reraised by comparing metadata with orig */
    for (Ty_ssize_t i = 0; i < numexcs; i++) {
        TyObject *e = TyList_GET_ITEM(excs, i);
        assert(e != NULL);
        if (Ty_IsNone(e)) {
            continue;
        }
        bool is_reraise = is_same_exception_metadata(e, orig);
        TyObject *append_list = is_reraise ? reraised_list : raised_list;
        if (TyList_Append(append_list, e) < 0) {
            goto done;
        }
    }

    TyObject *reraised_eg = exception_group_projection(orig, reraised_list);
    if (reraised_eg == NULL) {
        goto done;
    }

    if (!Ty_IsNone(reraised_eg)) {
        assert(is_same_exception_metadata(reraised_eg, orig));
    }
    Ty_ssize_t num_raised = TyList_GET_SIZE(raised_list);
    if (num_raised == 0) {
        result = reraised_eg;
    }
    else if (num_raised > 0) {
        int res = 0;
        if (!Ty_IsNone(reraised_eg)) {
            res = TyList_Append(raised_list, reraised_eg);
        }
        Ty_DECREF(reraised_eg);
        if (res < 0) {
            goto done;
        }
        if (TyList_GET_SIZE(raised_list) > 1) {
            result = _TyExc_CreateExceptionGroup("", raised_list);
        }
        else {
            result = Ty_NewRef(TyList_GetItem(raised_list, 0));
        }
        if (result == NULL) {
            goto done;
        }
    }

done:
    Ty_XDECREF(raised_list);
    Ty_XDECREF(reraised_list);
    return result;
}

TyObject *
PyUnstable_Exc_PrepReraiseStar(TyObject *orig, TyObject *excs)
{
    if (orig == NULL || !PyExceptionInstance_Check(orig)) {
        TyErr_SetString(TyExc_TypeError, "orig must be an exception instance");
        return NULL;
    }
    if (excs == NULL || !TyList_Check(excs)) {
        TyErr_SetString(TyExc_TypeError,
                        "excs must be a list of exception instances");
        return NULL;
    }
    Ty_ssize_t numexcs = TyList_GET_SIZE(excs);
    for (Ty_ssize_t i = 0; i < numexcs; i++) {
        TyObject *exc = TyList_GET_ITEM(excs, i);
        if (exc == NULL || !(PyExceptionInstance_Check(exc) || Ty_IsNone(exc))) {
            TyErr_Format(TyExc_TypeError,
                         "item %d of excs is not an exception", i);
            return NULL;
        }
    }

    /* Make sure that orig has something as traceback, in the interpreter
     * it always does because it's a raised exception.
     */
    TyObject *tb = PyException_GetTraceback(orig);

    if (tb == NULL) {
        TyErr_Format(TyExc_ValueError, "orig must be a raised exception");
        return NULL;
    }
    Ty_DECREF(tb);

    return _TyExc_PrepReraiseStar(orig, excs);
}

static TyMemberDef BaseExceptionGroup_members[] = {
    {"message", _Ty_T_OBJECT, offsetof(TyBaseExceptionGroupObject, msg), Py_READONLY,
        TyDoc_STR("exception message")},
    {"exceptions", _Ty_T_OBJECT, offsetof(TyBaseExceptionGroupObject, excs), Py_READONLY,
        TyDoc_STR("nested exceptions")},
    {NULL}  /* Sentinel */
};

static TyMethodDef BaseExceptionGroup_methods[] = {
    {"__class_getitem__", Ty_GenericAlias,
      METH_O|METH_CLASS, TyDoc_STR("See PEP 585")},
    BASEEXCEPTIONGROUP_DERIVE_METHODDEF
    BASEEXCEPTIONGROUP_SPLIT_METHODDEF
    BASEEXCEPTIONGROUP_SUBGROUP_METHODDEF
    {NULL}
};

ComplexExtendsException(TyExc_BaseException, BaseExceptionGroup,
    BaseExceptionGroup, BaseExceptionGroup_new /* new */,
    BaseExceptionGroup_methods, BaseExceptionGroup_members,
    0 /* getset */, BaseExceptionGroup_str,
    "A combination of multiple unrelated exceptions.");

/*
 *    ExceptionGroup extends BaseExceptionGroup, Exception
 */
static TyObject*
create_exception_group_class(void) {
    struct _Py_exc_state *state = get_exc_state();

    TyObject *bases = TyTuple_Pack(
        2, TyExc_BaseExceptionGroup, TyExc_Exception);
    if (bases == NULL) {
        return NULL;
    }

    assert(!state->TyExc_ExceptionGroup);
    state->TyExc_ExceptionGroup = TyErr_NewException(
        "builtins.ExceptionGroup", bases, NULL);

    Ty_DECREF(bases);
    return state->TyExc_ExceptionGroup;
}

/*
 *    KeyboardInterrupt extends BaseException
 */
SimpleExtendsException(TyExc_BaseException, KeyboardInterrupt,
                       "Program interrupted by user.");


/*
 *    ImportError extends Exception
 */

static inline TyImportErrorObject *
PyImportErrorObject_CAST(TyObject *self)
{
    assert(PyObject_TypeCheck(self, (TyTypeObject *)TyExc_ImportError));
    return (TyImportErrorObject *)self;
}

static int
ImportError_init(TyObject *op, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"name", "path", "name_from", 0};
    TyObject *empty_tuple;
    TyObject *msg = NULL;
    TyObject *name = NULL;
    TyObject *path = NULL;
    TyObject *name_from = NULL;

    if (BaseException_init(op, args, NULL) == -1)
        return -1;

    TyImportErrorObject *self = PyImportErrorObject_CAST(op);
    empty_tuple = TyTuple_New(0);
    if (!empty_tuple)
        return -1;
    if (!TyArg_ParseTupleAndKeywords(empty_tuple, kwds, "|$OOO:ImportError", kwlist,
                                     &name, &path, &name_from)) {
        Ty_DECREF(empty_tuple);
        return -1;
    }
    Ty_DECREF(empty_tuple);

    Ty_XSETREF(self->name, Ty_XNewRef(name));
    Ty_XSETREF(self->path, Ty_XNewRef(path));
    Ty_XSETREF(self->name_from, Ty_XNewRef(name_from));

    if (TyTuple_GET_SIZE(args) == 1) {
        msg = Ty_NewRef(TyTuple_GET_ITEM(args, 0));
    }
    Ty_XSETREF(self->msg, msg);

    return 0;
}

static int
ImportError_clear(TyObject *op)
{
    TyImportErrorObject *self = PyImportErrorObject_CAST(op);
    Ty_CLEAR(self->msg);
    Ty_CLEAR(self->name);
    Ty_CLEAR(self->path);
    Ty_CLEAR(self->name_from);
    return BaseException_clear(op);
}

static void
ImportError_dealloc(TyObject *self)
{
    _TyObject_GC_UNTRACK(self);
    (void)ImportError_clear(self);
    Ty_TYPE(self)->tp_free(self);
}

static int
ImportError_traverse(TyObject *op, visitproc visit, void *arg)
{
    TyImportErrorObject *self = PyImportErrorObject_CAST(op);
    Ty_VISIT(self->msg);
    Ty_VISIT(self->name);
    Ty_VISIT(self->path);
    Ty_VISIT(self->name_from);
    return BaseException_traverse(op, visit, arg);
}

static TyObject *
ImportError_str(TyObject *op)
{
    TyImportErrorObject *self = PyImportErrorObject_CAST(op);
    if (self->msg && TyUnicode_CheckExact(self->msg)) {
        return Ty_NewRef(self->msg);
    }
    return BaseException_str(op);
}

static TyObject *
ImportError_getstate(TyObject *op)
{
    TyImportErrorObject *self = PyImportErrorObject_CAST(op);
    TyObject *dict = self->dict;
    if (self->name || self->path || self->name_from) {
        dict = dict ? TyDict_Copy(dict) : TyDict_New();
        if (dict == NULL)
            return NULL;
        if (self->name && TyDict_SetItem(dict, &_Ty_ID(name), self->name) < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
        if (self->path && TyDict_SetItem(dict, &_Ty_ID(path), self->path) < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
        if (self->name_from && TyDict_SetItem(dict, &_Ty_ID(name_from), self->name_from) < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
        return dict;
    }
    else if (dict) {
        return Ty_NewRef(dict);
    }
    else {
        Py_RETURN_NONE;
    }
}

/* Pickling support */
static TyObject *
ImportError_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *res;
    TyObject *state = ImportError_getstate(self);
    if (state == NULL)
        return NULL;
    TyBaseExceptionObject *exc = PyBaseExceptionObject_CAST(self);
    if (state == Ty_None)
        res = TyTuple_Pack(2, Ty_TYPE(self), exc->args);
    else
        res = TyTuple_Pack(3, Ty_TYPE(self), exc->args, state);
    Ty_DECREF(state);
    return res;
}

static TyMemberDef ImportError_members[] = {
    {"msg", _Ty_T_OBJECT, offsetof(TyImportErrorObject, msg), 0,
        TyDoc_STR("exception message")},
    {"name", _Ty_T_OBJECT, offsetof(TyImportErrorObject, name), 0,
        TyDoc_STR("module name")},
    {"path", _Ty_T_OBJECT, offsetof(TyImportErrorObject, path), 0,
        TyDoc_STR("module path")},
    {"name_from", _Ty_T_OBJECT, offsetof(TyImportErrorObject, name_from), 0,
        TyDoc_STR("name imported from module")},
    {NULL}  /* Sentinel */
};

static TyMethodDef ImportError_methods[] = {
    {"__reduce__", ImportError_reduce, METH_NOARGS},
    {NULL}
};

ComplexExtendsException(TyExc_Exception, ImportError,
                        ImportError, 0 /* new */,
                        ImportError_methods, ImportError_members,
                        0 /* getset */, ImportError_str,
                        "Import can't find module, or can't find name in "
                        "module.");

/*
 *    ModuleNotFoundError extends ImportError
 */

MiddlingExtendsException(TyExc_ImportError, ModuleNotFoundError, ImportError,
                         "Module not found.");

/*
 *    OSError extends Exception
 */

static inline TyOSErrorObject *
PyOSErrorObject_CAST(TyObject *self)
{
    assert(PyObject_TypeCheck(self, (TyTypeObject *)TyExc_OSError));
    return (TyOSErrorObject *)self;
}

#ifdef MS_WINDOWS
#include "errmap.h"
#endif

/* Where a function has a single filename, such as open() or some
 * of the os module functions, TyErr_SetFromErrnoWithFilename() is
 * called, giving a third argument which is the filename.  But, so
 * that old code using in-place unpacking doesn't break, e.g.:
 *
 * except OSError, (errno, strerror):
 *
 * we hack args so that it only contains two items.  This also
 * means we need our own __str__() which prints out the filename
 * when it was supplied.
 *
 * (If a function has two filenames, such as rename(), symlink(),
 * or copy(), TyErr_SetFromErrnoWithFilenameObjects() is called,
 * which allows passing in a second filename.)
 */

/* This function doesn't cleanup on error, the caller should */
static int
oserror_parse_args(TyObject **p_args,
                   TyObject **myerrno, TyObject **strerror,
                   TyObject **filename, TyObject **filename2
#ifdef MS_WINDOWS
                   , TyObject **winerror
#endif
                  )
{
    Ty_ssize_t nargs;
    TyObject *args = *p_args;
#ifndef MS_WINDOWS
    /*
     * ignored on non-Windows platforms,
     * but parsed so OSError has a consistent signature
     */
    TyObject *_winerror = NULL;
    TyObject **winerror = &_winerror;
#endif /* MS_WINDOWS */

    nargs = TyTuple_GET_SIZE(args);

    if (nargs >= 2 && nargs <= 5) {
        if (!TyArg_UnpackTuple(args, "OSError", 2, 5,
                               myerrno, strerror,
                               filename, winerror, filename2))
            return -1;
#ifdef MS_WINDOWS
        if (*winerror && TyLong_Check(*winerror)) {
            long errcode, winerrcode;
            TyObject *newargs;
            Ty_ssize_t i;

            winerrcode = TyLong_AsLong(*winerror);
            if (winerrcode == -1 && TyErr_Occurred())
                return -1;
            errcode = winerror_to_errno(winerrcode);
            *myerrno = TyLong_FromLong(errcode);
            if (!*myerrno)
                return -1;
            newargs = TyTuple_New(nargs);
            if (!newargs)
                return -1;
            TyTuple_SET_ITEM(newargs, 0, *myerrno);
            for (i = 1; i < nargs; i++) {
                TyObject *val = TyTuple_GET_ITEM(args, i);
                TyTuple_SET_ITEM(newargs, i, Ty_NewRef(val));
            }
            Ty_DECREF(args);
            args = *p_args = newargs;
        }
#endif /* MS_WINDOWS */
    }

    return 0;
}

static int
oserror_init(TyOSErrorObject *self, TyObject **p_args,
             TyObject *myerrno, TyObject *strerror,
             TyObject *filename, TyObject *filename2
#ifdef MS_WINDOWS
             , TyObject *winerror
#endif
             )
{
    TyObject *args = *p_args;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);

    /* self->filename will remain Ty_None otherwise */
    if (filename && filename != Ty_None) {
        if (Ty_IS_TYPE(self, (TyTypeObject *) TyExc_BlockingIOError) &&
            PyNumber_Check(filename)) {
            /* BlockingIOError's 3rd argument can be the number of
             * characters written.
             */
            self->written = PyNumber_AsSsize_t(filename, TyExc_ValueError);
            if (self->written == -1 && TyErr_Occurred())
                return -1;
        }
        else {
            self->filename = Ty_NewRef(filename);

            if (filename2 && filename2 != Ty_None) {
                self->filename2 = Ty_NewRef(filename2);
            }

            if (nargs >= 2 && nargs <= 5) {
                /* filename, filename2, and winerror are removed from the args tuple
                   (for compatibility purposes, see test_exceptions.py) */
                TyObject *subslice = TyTuple_GetSlice(args, 0, 2);
                if (!subslice)
                    return -1;

                Ty_DECREF(args);  /* replacing args */
                *p_args = args = subslice;
            }
        }
    }
    self->myerrno = Ty_XNewRef(myerrno);
    self->strerror = Ty_XNewRef(strerror);
#ifdef MS_WINDOWS
    self->winerror = Ty_XNewRef(winerror);
#endif

    /* Steals the reference to args */
    Ty_XSETREF(self->args, args);
    *p_args = args = NULL;

    return 0;
}

static TyObject *
OSError_new(TyTypeObject *type, TyObject *args, TyObject *kwds);
static int
OSError_init(TyObject *self, TyObject *args, TyObject *kwds);

static int
oserror_use_init(TyTypeObject *type)
{
    /* When __init__ is defined in an OSError subclass, we want any
       extraneous argument to __new__ to be ignored.  The only reasonable
       solution, given __new__ takes a variable number of arguments,
       is to defer arg parsing and initialization to __init__.

       But when __new__ is overridden as well, it should call our __new__
       with the right arguments.

       (see http://bugs.python.org/issue12555#msg148829 )
    */
    if (type->tp_init != OSError_init && type->tp_new == OSError_new) {
        assert((TyObject *) type != TyExc_OSError);
        return 1;
    }
    return 0;
}

static TyObject *
OSError_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    TyOSErrorObject *self = NULL;
    TyObject *myerrno = NULL, *strerror = NULL;
    TyObject *filename = NULL, *filename2 = NULL;
#ifdef MS_WINDOWS
    TyObject *winerror = NULL;
#endif

    Ty_INCREF(args);

    if (!oserror_use_init(type)) {
        if (!_TyArg_NoKeywords(type->tp_name, kwds))
            goto error;

        if (oserror_parse_args(&args, &myerrno, &strerror,
                               &filename, &filename2
#ifdef MS_WINDOWS
                               , &winerror
#endif
            ))
            goto error;

        struct _Py_exc_state *state = get_exc_state();
        if (myerrno && TyLong_Check(myerrno) &&
            state->errnomap && (TyObject *) type == TyExc_OSError) {
            TyObject *newtype;
            newtype = TyDict_GetItemWithError(state->errnomap, myerrno);
            if (newtype) {
                type = _TyType_CAST(newtype);
            }
            else if (TyErr_Occurred())
                goto error;
        }
    }

    self = (TyOSErrorObject *) type->tp_alloc(type, 0);
    if (!self)
        goto error;

    self->dict = NULL;
    self->traceback = self->cause = self->context = NULL;
    self->written = -1;

    if (!oserror_use_init(type)) {
        if (oserror_init(self, &args, myerrno, strerror, filename, filename2
#ifdef MS_WINDOWS
                         , winerror
#endif
            ))
            goto error;
    }
    else {
        self->args = TyTuple_New(0);
        if (self->args == NULL)
            goto error;
    }

    Ty_XDECREF(args);
    return (TyObject *) self;

error:
    Ty_XDECREF(args);
    Ty_XDECREF(self);
    return NULL;
}

static int
OSError_init(TyObject *op, TyObject *args, TyObject *kwds)
{
    TyOSErrorObject *self = PyOSErrorObject_CAST(op);
    TyObject *myerrno = NULL, *strerror = NULL;
    TyObject *filename = NULL, *filename2 = NULL;
#ifdef MS_WINDOWS
    TyObject *winerror = NULL;
#endif

    if (!oserror_use_init(Ty_TYPE(self)))
        /* Everything already done in OSError_new */
        return 0;

    if (!_TyArg_NoKeywords(Ty_TYPE(self)->tp_name, kwds))
        return -1;

    Ty_INCREF(args);
    if (oserror_parse_args(&args, &myerrno, &strerror, &filename, &filename2
#ifdef MS_WINDOWS
                           , &winerror
#endif
        ))
        goto error;

    if (oserror_init(self, &args, myerrno, strerror, filename, filename2
#ifdef MS_WINDOWS
                     , winerror
#endif
        ))
        goto error;

    return 0;

error:
    Ty_DECREF(args);
    return -1;
}

static int
OSError_clear(TyObject *op)
{
    TyOSErrorObject *self = PyOSErrorObject_CAST(op);
    Ty_CLEAR(self->myerrno);
    Ty_CLEAR(self->strerror);
    Ty_CLEAR(self->filename);
    Ty_CLEAR(self->filename2);
#ifdef MS_WINDOWS
    Ty_CLEAR(self->winerror);
#endif
    return BaseException_clear(op);
}

static void
OSError_dealloc(TyObject *self)
{
    _TyObject_GC_UNTRACK(self);
    (void)OSError_clear(self);
    Ty_TYPE(self)->tp_free(self);
}

static int
OSError_traverse(TyObject *op, visitproc visit, void *arg)
{
    TyOSErrorObject *self = PyOSErrorObject_CAST(op);
    Ty_VISIT(self->myerrno);
    Ty_VISIT(self->strerror);
    Ty_VISIT(self->filename);
    Ty_VISIT(self->filename2);
#ifdef MS_WINDOWS
    Ty_VISIT(self->winerror);
#endif
    return BaseException_traverse(op, visit, arg);
}

static TyObject *
OSError_str(TyObject *op)
{
    TyOSErrorObject *self = PyOSErrorObject_CAST(op);
#define OR_NONE(x) ((x)?(x):Ty_None)
#ifdef MS_WINDOWS
    /* If available, winerror has the priority over myerrno */
    if (self->winerror && self->filename) {
        if (self->filename2) {
            return TyUnicode_FromFormat("[WinError %S] %S: %R -> %R",
                                        OR_NONE(self->winerror),
                                        OR_NONE(self->strerror),
                                        self->filename,
                                        self->filename2);
        } else {
            return TyUnicode_FromFormat("[WinError %S] %S: %R",
                                        OR_NONE(self->winerror),
                                        OR_NONE(self->strerror),
                                        self->filename);
        }
    }
    if (self->winerror && self->strerror)
        return TyUnicode_FromFormat("[WinError %S] %S",
                                    self->winerror ? self->winerror: Ty_None,
                                    self->strerror ? self->strerror: Ty_None);
#endif
    if (self->filename) {
        if (self->filename2) {
            return TyUnicode_FromFormat("[Errno %S] %S: %R -> %R",
                                        OR_NONE(self->myerrno),
                                        OR_NONE(self->strerror),
                                        self->filename,
                                        self->filename2);
        } else {
            return TyUnicode_FromFormat("[Errno %S] %S: %R",
                                        OR_NONE(self->myerrno),
                                        OR_NONE(self->strerror),
                                        self->filename);
        }
    }
    if (self->myerrno && self->strerror)
        return TyUnicode_FromFormat("[Errno %S] %S",
                                    self->myerrno, self->strerror);
    return BaseException_str(op);
}

static TyObject *
OSError_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    TyOSErrorObject *self = PyOSErrorObject_CAST(op);
    TyObject *args = self->args;
    TyObject *res = NULL;

    /* self->args is only the first two real arguments if there was a
     * file name given to OSError. */
    if (TyTuple_GET_SIZE(args) == 2 && self->filename) {
        Ty_ssize_t size = self->filename2 ? 5 : 3;
        args = TyTuple_New(size);
        if (!args)
            return NULL;

        TyTuple_SET_ITEM(args, 0, Ty_NewRef(TyTuple_GET_ITEM(self->args, 0)));
        TyTuple_SET_ITEM(args, 1, Ty_NewRef(TyTuple_GET_ITEM(self->args, 1)));
        TyTuple_SET_ITEM(args, 2, Ty_NewRef(self->filename));

        if (self->filename2) {
            /*
             * This tuple is essentially used as OSError(*args).
             * So, to recreate filename2, we need to pass in
             * winerror as well.
             */
            TyTuple_SET_ITEM(args, 3, Ty_NewRef(Ty_None));

            /* filename2 */
            TyTuple_SET_ITEM(args, 4, Ty_NewRef(self->filename2));
        }
    } else
        Ty_INCREF(args);

    if (self->dict)
        res = TyTuple_Pack(3, Ty_TYPE(self), args, self->dict);
    else
        res = TyTuple_Pack(2, Ty_TYPE(self), args);
    Ty_DECREF(args);
    return res;
}

static TyObject *
OSError_written_get(TyObject *op, void *context)
{
    TyOSErrorObject *self = PyOSErrorObject_CAST(op);
    if (self->written == -1) {
        TyErr_SetString(TyExc_AttributeError, "characters_written");
        return NULL;
    }
    return TyLong_FromSsize_t(self->written);
}

static int
OSError_written_set(TyObject *op, TyObject *arg, void *context)
{
    TyOSErrorObject *self = PyOSErrorObject_CAST(op);
    if (arg == NULL) {
        if (self->written == -1) {
            TyErr_SetString(TyExc_AttributeError, "characters_written");
            return -1;
        }
        self->written = -1;
        return 0;
    }
    Ty_ssize_t n;
    n = PyNumber_AsSsize_t(arg, TyExc_ValueError);
    if (n == -1 && TyErr_Occurred())
        return -1;
    self->written = n;
    return 0;
}

static TyMemberDef OSError_members[] = {
    {"errno", _Ty_T_OBJECT, offsetof(TyOSErrorObject, myerrno), 0,
        TyDoc_STR("POSIX exception code")},
    {"strerror", _Ty_T_OBJECT, offsetof(TyOSErrorObject, strerror), 0,
        TyDoc_STR("exception strerror")},
    {"filename", _Ty_T_OBJECT, offsetof(TyOSErrorObject, filename), 0,
        TyDoc_STR("exception filename")},
    {"filename2", _Ty_T_OBJECT, offsetof(TyOSErrorObject, filename2), 0,
        TyDoc_STR("second exception filename")},
#ifdef MS_WINDOWS
    {"winerror", _Ty_T_OBJECT, offsetof(TyOSErrorObject, winerror), 0,
        TyDoc_STR("Win32 exception code")},
#endif
    {NULL}  /* Sentinel */
};

static TyMethodDef OSError_methods[] = {
    {"__reduce__", OSError_reduce, METH_NOARGS},
    {NULL}
};

static TyGetSetDef OSError_getset[] = {
    {"characters_written", OSError_written_get,
                           OSError_written_set, NULL},
    {NULL}
};


ComplexExtendsException(TyExc_Exception, OSError,
                        OSError, OSError_new,
                        OSError_methods, OSError_members, OSError_getset,
                        OSError_str,
                        "Base class for I/O related errors.");


/*
 *    Various OSError subclasses
 */
MiddlingExtendsException(TyExc_OSError, BlockingIOError, OSError,
                         "I/O operation would block.");
MiddlingExtendsException(TyExc_OSError, ConnectionError, OSError,
                         "Connection error.");
MiddlingExtendsException(TyExc_OSError, ChildProcessError, OSError,
                         "Child process error.");
MiddlingExtendsException(TyExc_ConnectionError, BrokenPipeError, OSError,
                         "Broken pipe.");
MiddlingExtendsException(TyExc_ConnectionError, ConnectionAbortedError, OSError,
                         "Connection aborted.");
MiddlingExtendsException(TyExc_ConnectionError, ConnectionRefusedError, OSError,
                         "Connection refused.");
MiddlingExtendsException(TyExc_ConnectionError, ConnectionResetError, OSError,
                         "Connection reset.");
MiddlingExtendsException(TyExc_OSError, FileExistsError, OSError,
                         "File already exists.");
MiddlingExtendsException(TyExc_OSError, FileNotFoundError, OSError,
                         "File not found.");
MiddlingExtendsException(TyExc_OSError, IsADirectoryError, OSError,
                         "Operation doesn't work on directories.");
MiddlingExtendsException(TyExc_OSError, NotADirectoryError, OSError,
                         "Operation only works on directories.");
MiddlingExtendsException(TyExc_OSError, InterruptedError, OSError,
                         "Interrupted by signal.");
MiddlingExtendsException(TyExc_OSError, PermissionError, OSError,
                         "Not enough permissions.");
MiddlingExtendsException(TyExc_OSError, ProcessLookupError, OSError,
                         "Process not found.");
MiddlingExtendsException(TyExc_OSError, TimeoutError, OSError,
                         "Timeout expired.");

/*
 *    EOFError extends Exception
 */
SimpleExtendsException(TyExc_Exception, EOFError,
                       "Read beyond end of file.");


/*
 *    RuntimeError extends Exception
 */
SimpleExtendsException(TyExc_Exception, RuntimeError,
                       "Unspecified run-time error.");

/*
 *    RecursionError extends RuntimeError
 */
SimpleExtendsException(TyExc_RuntimeError, RecursionError,
                       "Recursion limit exceeded.");

// PythonFinalizationError extends RuntimeError
SimpleExtendsException(TyExc_RuntimeError, PythonFinalizationError,
                       "Operation blocked during Python finalization.");

/*
 *    NotImplementedError extends RuntimeError
 */
SimpleExtendsException(TyExc_RuntimeError, NotImplementedError,
                       "Method or function hasn't been implemented yet.");

/*
 *    NameError extends Exception
 */

static inline TyNameErrorObject *
PyNameErrorObject_CAST(TyObject *self)
{
    assert(PyObject_TypeCheck(self, (TyTypeObject *)TyExc_NameError));
    return (TyNameErrorObject *)self;
}

static int
NameError_init(TyObject *op, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"name", NULL};
    TyObject *name = NULL;

    if (BaseException_init(op, args, NULL) == -1) {
        return -1;
    }

    TyObject *empty_tuple = TyTuple_New(0);
    if (!empty_tuple) {
        return -1;
    }
    if (!TyArg_ParseTupleAndKeywords(empty_tuple, kwds, "|$O:NameError", kwlist,
                                     &name)) {
        Ty_DECREF(empty_tuple);
        return -1;
    }
    Ty_DECREF(empty_tuple);

    TyNameErrorObject *self = PyNameErrorObject_CAST(op);
    Ty_XSETREF(self->name, Ty_XNewRef(name));

    return 0;
}

static int
NameError_clear(TyObject *op)
{
    TyNameErrorObject *self = PyNameErrorObject_CAST(op);
    Ty_CLEAR(self->name);
    return BaseException_clear(op);
}

static void
NameError_dealloc(TyObject *self)
{
    _TyObject_GC_UNTRACK(self);
    (void)NameError_clear(self);
    Ty_TYPE(self)->tp_free(self);
}

static int
NameError_traverse(TyObject *op, visitproc visit, void *arg)
{
    TyNameErrorObject *self = PyNameErrorObject_CAST(op);
    Ty_VISIT(self->name);
    return BaseException_traverse(op, visit, arg);
}

static TyMemberDef NameError_members[] = {
        {"name", _Ty_T_OBJECT, offsetof(TyNameErrorObject, name), 0, TyDoc_STR("name")},
        {NULL}  /* Sentinel */
};

static TyMethodDef NameError_methods[] = {
        {NULL}  /* Sentinel */
};

ComplexExtendsException(TyExc_Exception, NameError,
                        NameError, 0,
                        NameError_methods, NameError_members,
                        0, BaseException_str, "Name not found globally.");

/*
 *    UnboundLocalError extends NameError
 */

MiddlingExtendsException(TyExc_NameError, UnboundLocalError, NameError,
                       "Local name referenced but not bound to a value.");

/*
 *    AttributeError extends Exception
 */

static inline TyAttributeErrorObject *
PyAttributeErrorObject_CAST(TyObject *self)
{
    assert(PyObject_TypeCheck(self, (TyTypeObject *)TyExc_AttributeError));
    return (TyAttributeErrorObject *)self;
}

static int
AttributeError_init(TyObject *op, TyObject *args, TyObject *kwds)
{
    static char *kwlist[] = {"name", "obj", NULL};
    TyObject *name = NULL;
    TyObject *obj = NULL;

    if (BaseException_init(op, args, NULL) == -1) {
        return -1;
    }

    TyObject *empty_tuple = TyTuple_New(0);
    if (!empty_tuple) {
        return -1;
    }
    if (!TyArg_ParseTupleAndKeywords(empty_tuple, kwds, "|$OO:AttributeError", kwlist,
                                     &name, &obj)) {
        Ty_DECREF(empty_tuple);
        return -1;
    }
    Ty_DECREF(empty_tuple);

    TyAttributeErrorObject *self = PyAttributeErrorObject_CAST(op);
    Ty_XSETREF(self->name, Ty_XNewRef(name));
    Ty_XSETREF(self->obj, Ty_XNewRef(obj));

    return 0;
}

static int
AttributeError_clear(TyObject *op)
{
    TyAttributeErrorObject *self = PyAttributeErrorObject_CAST(op);
    Ty_CLEAR(self->obj);
    Ty_CLEAR(self->name);
    return BaseException_clear(op);
}

static void
AttributeError_dealloc(TyObject *self)
{
    _TyObject_GC_UNTRACK(self);
    (void)AttributeError_clear(self);
    Ty_TYPE(self)->tp_free(self);
}

static int
AttributeError_traverse(TyObject *op, visitproc visit, void *arg)
{
    TyAttributeErrorObject *self = PyAttributeErrorObject_CAST(op);
    Ty_VISIT(self->obj);
    Ty_VISIT(self->name);
    return BaseException_traverse(op, visit, arg);
}

/* Pickling support */
static TyObject *
AttributeError_getstate(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    TyAttributeErrorObject *self = PyAttributeErrorObject_CAST(op);
    TyObject *dict = self->dict;
    if (self->name || self->args) {
        dict = dict ? TyDict_Copy(dict) : TyDict_New();
        if (dict == NULL) {
            return NULL;
        }
        if (self->name && TyDict_SetItemString(dict, "name", self->name) < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
        /* We specifically are not pickling the obj attribute since there are many
        cases where it is unlikely to be picklable. See GH-103352.
        */
        if (self->args && TyDict_SetItemString(dict, "args", self->args) < 0) {
            Ty_DECREF(dict);
            return NULL;
        }
        return dict;
    }
    else if (dict) {
        return Ty_NewRef(dict);
    }
    Py_RETURN_NONE;
}

static TyObject *
AttributeError_reduce(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    TyObject *state = AttributeError_getstate(op, NULL);
    if (state == NULL) {
        return NULL;
    }

    TyAttributeErrorObject *self = PyAttributeErrorObject_CAST(op);
    TyObject *return_value = TyTuple_Pack(3, Ty_TYPE(self), self->args, state);
    Ty_DECREF(state);
    return return_value;
}

static TyMemberDef AttributeError_members[] = {
    {"name", _Ty_T_OBJECT, offsetof(TyAttributeErrorObject, name), 0, TyDoc_STR("attribute name")},
    {"obj", _Ty_T_OBJECT, offsetof(TyAttributeErrorObject, obj), 0, TyDoc_STR("object")},
    {NULL}  /* Sentinel */
};

static TyMethodDef AttributeError_methods[] = {
    {"__getstate__", AttributeError_getstate, METH_NOARGS},
    {"__reduce__", AttributeError_reduce, METH_NOARGS },
    {NULL}
};

ComplexExtendsException(TyExc_Exception, AttributeError,
                        AttributeError, 0,
                        AttributeError_methods, AttributeError_members,
                        0, BaseException_str, "Attribute not found.");

/*
 *    SyntaxError extends Exception
 */

static inline TySyntaxErrorObject *
PySyntaxErrorObject_CAST(TyObject *self)
{
    assert(PyObject_TypeCheck(self, (TyTypeObject *)TyExc_SyntaxError));
    return (TySyntaxErrorObject *)self;
}

static int
SyntaxError_init(TyObject *op, TyObject *args, TyObject *kwds)
{
    TyObject *info = NULL;
    Ty_ssize_t lenargs = TyTuple_GET_SIZE(args);

    if (BaseException_init(op, args, kwds) == -1)
        return -1;

    TySyntaxErrorObject *self = PySyntaxErrorObject_CAST(op);
    if (lenargs >= 1) {
        Ty_XSETREF(self->msg, Ty_NewRef(TyTuple_GET_ITEM(args, 0)));
    }
    if (lenargs == 2) {
        info = TyTuple_GET_ITEM(args, 1);
        info = PySequence_Tuple(info);
        if (!info) {
            return -1;
        }

        self->end_lineno = NULL;
        self->end_offset = NULL;
        if (!TyArg_ParseTuple(info, "OOOO|OOO",
                              &self->filename, &self->lineno,
                              &self->offset, &self->text,
                              &self->end_lineno, &self->end_offset, &self->metadata)) {
            Ty_DECREF(info);
            return -1;
        }

        Ty_INCREF(self->filename);
        Ty_INCREF(self->lineno);
        Ty_INCREF(self->offset);
        Ty_INCREF(self->text);
        Ty_XINCREF(self->end_lineno);
        Ty_XINCREF(self->end_offset);
        Ty_XINCREF(self->metadata);
        Ty_DECREF(info);

        if (self->end_lineno != NULL && self->end_offset == NULL) {
            TyErr_SetString(TyExc_TypeError, "end_offset must be provided when end_lineno is provided");
            return -1;
        }
    }
    return 0;
}

static int
SyntaxError_clear(TyObject *op)
{
    TySyntaxErrorObject *self = PySyntaxErrorObject_CAST(op);
    Ty_CLEAR(self->msg);
    Ty_CLEAR(self->filename);
    Ty_CLEAR(self->lineno);
    Ty_CLEAR(self->offset);
    Ty_CLEAR(self->end_lineno);
    Ty_CLEAR(self->end_offset);
    Ty_CLEAR(self->text);
    Ty_CLEAR(self->print_file_and_line);
    Ty_CLEAR(self->metadata);
    return BaseException_clear(op);
}

static void
SyntaxError_dealloc(TyObject *self)
{
    _TyObject_GC_UNTRACK(self);
    (void)SyntaxError_clear(self);
    Ty_TYPE(self)->tp_free(self);
}

static int
SyntaxError_traverse(TyObject *op, visitproc visit, void *arg)
{
    TySyntaxErrorObject *self = PySyntaxErrorObject_CAST(op);
    Ty_VISIT(self->msg);
    Ty_VISIT(self->filename);
    Ty_VISIT(self->lineno);
    Ty_VISIT(self->offset);
    Ty_VISIT(self->end_lineno);
    Ty_VISIT(self->end_offset);
    Ty_VISIT(self->text);
    Ty_VISIT(self->print_file_and_line);
    Ty_VISIT(self->metadata);
    return BaseException_traverse(op, visit, arg);
}

/* This is called "my_basename" instead of just "basename" to avoid name
   conflicts with glibc; basename is already prototyped if _GNU_SOURCE is
   defined, and Python does define that. */
static TyObject*
my_basename(TyObject *name)
{
    Ty_ssize_t i, size, offset;
    int kind;
    const void *data;

    kind = TyUnicode_KIND(name);
    data = TyUnicode_DATA(name);
    size = TyUnicode_GET_LENGTH(name);
    offset = 0;
    for(i=0; i < size; i++) {
        if (TyUnicode_READ(kind, data, i) == SEP) {
            offset = i + 1;
        }
    }
    if (offset != 0) {
        return TyUnicode_Substring(name, offset, size);
    }
    else {
        return Ty_NewRef(name);
    }
}


static TyObject *
SyntaxError_str(TyObject *op)
{
    TySyntaxErrorObject *self = PySyntaxErrorObject_CAST(op);
    int have_lineno = 0;
    TyObject *filename;
    TyObject *result;
    /* Below, we always ignore overflow errors, just printing -1.
       Still, we cannot allow an OverflowError to be raised, so
       we need to call TyLong_AsLongAndOverflow. */
    int overflow;

    /* XXX -- do all the additional formatting with filename and
       lineno here */

    if (self->filename && TyUnicode_Check(self->filename)) {
        filename = my_basename(self->filename);
        if (filename == NULL)
            return NULL;
    } else {
        filename = NULL;
    }
    have_lineno = (self->lineno != NULL) && TyLong_CheckExact(self->lineno);

    if (!filename && !have_lineno)
        return PyObject_Str(self->msg ? self->msg : Ty_None);

    // Even if 'filename' can be an instance of a subclass of 'str',
    // we only render its "true" content and do not use str(filename).
    if (filename && have_lineno)
        result = TyUnicode_FromFormat("%S (%U, line %ld)",
                   self->msg ? self->msg : Ty_None,
                   filename,
                   TyLong_AsLongAndOverflow(self->lineno, &overflow));
    else if (filename)
        result = TyUnicode_FromFormat("%S (%U)",
                   self->msg ? self->msg : Ty_None,
                   filename);
    else /* only have_lineno */
        result = TyUnicode_FromFormat("%S (line %ld)",
                   self->msg ? self->msg : Ty_None,
                   TyLong_AsLongAndOverflow(self->lineno, &overflow));
    Ty_XDECREF(filename);
    return result;
}

static TyMemberDef SyntaxError_members[] = {
    {"msg", _Ty_T_OBJECT, offsetof(TySyntaxErrorObject, msg), 0,
        TyDoc_STR("exception msg")},
    {"filename", _Ty_T_OBJECT, offsetof(TySyntaxErrorObject, filename), 0,
        TyDoc_STR("exception filename")},
    {"lineno", _Ty_T_OBJECT, offsetof(TySyntaxErrorObject, lineno), 0,
        TyDoc_STR("exception lineno")},
    {"offset", _Ty_T_OBJECT, offsetof(TySyntaxErrorObject, offset), 0,
        TyDoc_STR("exception offset")},
    {"text", _Ty_T_OBJECT, offsetof(TySyntaxErrorObject, text), 0,
        TyDoc_STR("exception text")},
    {"end_lineno", _Ty_T_OBJECT, offsetof(TySyntaxErrorObject, end_lineno), 0,
                   TyDoc_STR("exception end lineno")},
    {"end_offset", _Ty_T_OBJECT, offsetof(TySyntaxErrorObject, end_offset), 0,
                   TyDoc_STR("exception end offset")},
    {"print_file_and_line", _Ty_T_OBJECT,
        offsetof(TySyntaxErrorObject, print_file_and_line), 0,
        TyDoc_STR("exception print_file_and_line")},
    {"_metadata", _Ty_T_OBJECT, offsetof(TySyntaxErrorObject, metadata), 0,
                   TyDoc_STR("exception private metadata")},
    {NULL}  /* Sentinel */
};

ComplexExtendsException(TyExc_Exception, SyntaxError, SyntaxError,
                        0, 0, SyntaxError_members, 0,
                        SyntaxError_str, "Invalid syntax.");


/*
 *    IndentationError extends SyntaxError
 */
MiddlingExtendsException(TyExc_SyntaxError, IndentationError, SyntaxError,
                         "Improper indentation.");


/*
 *    TabError extends IndentationError
 */
MiddlingExtendsException(TyExc_IndentationError, TabError, SyntaxError,
                         "Improper mixture of spaces and tabs.");

/*
 *    IncompleteInputError extends SyntaxError
 */
MiddlingExtendsExceptionEx(TyExc_SyntaxError, IncompleteInputError, _IncompleteInputError,
                           SyntaxError, "incomplete input.");

/*
 *    LookupError extends Exception
 */
SimpleExtendsException(TyExc_Exception, LookupError,
                       "Base class for lookup errors.");


/*
 *    IndexError extends LookupError
 */
SimpleExtendsException(TyExc_LookupError, IndexError,
                       "Sequence index out of range.");


/*
 *    KeyError extends LookupError
 */

static TyObject *
KeyError_str(TyObject *op)
{
    /* If args is a tuple of exactly one item, apply repr to args[0].
       This is done so that e.g. the exception raised by {}[''] prints
         KeyError: ''
       rather than the confusing
         KeyError
       alone.  The downside is that if KeyError is raised with an explanatory
       string, that string will be displayed in quotes.  Too bad.
       If args is anything else, use the default BaseException__str__().
    */
    TyBaseExceptionObject *self = PyBaseExceptionObject_CAST(op);
    if (TyTuple_GET_SIZE(self->args) == 1) {
        return PyObject_Repr(TyTuple_GET_ITEM(self->args, 0));
    }
    return BaseException_str(op);
}

ComplexExtendsException(TyExc_LookupError, KeyError, BaseException,
                        0, 0, 0, 0, KeyError_str, "Mapping key not found.");


/*
 *    ValueError extends Exception
 */
SimpleExtendsException(TyExc_Exception, ValueError,
                       "Inappropriate argument value (of correct type).");

/*
 *    UnicodeError extends ValueError
 */

SimpleExtendsException(TyExc_ValueError, UnicodeError,
                       "Unicode related error.");


/*
 * Check the validity of 'attr' as a unicode or bytes object depending
 * on 'as_bytes'.
 *
 * The 'name' is the attribute name and is only used for error reporting.
 *
 * On success, this returns 0.
 * On failure, this sets a TypeError and returns -1.
 */
static int
check_unicode_error_attribute(TyObject *attr, const char *name, int as_bytes)
{
    assert(as_bytes == 0 || as_bytes == 1);
    if (attr == NULL) {
        TyErr_Format(TyExc_TypeError,
                     "UnicodeError '%s' attribute is not set",
                     name);
        return -1;
    }
    if (!(as_bytes ? TyBytes_Check(attr) : TyUnicode_Check(attr))) {
        TyErr_Format(TyExc_TypeError,
                     "UnicodeError '%s' attribute must be a %s",
                     name, as_bytes ? "bytes" : "string");
        return -1;
    }
    return 0;
}


/*
 * Check the validity of 'attr' as a unicode or bytes object depending
 * on 'as_bytes' and return a new reference on it if it is the case.
 *
 * The 'name' is the attribute name and is only used for error reporting.
 *
 * On success, this returns a strong reference on 'attr'.
 * On failure, this sets a TypeError and returns NULL.
 */
static TyObject *
as_unicode_error_attribute(TyObject *attr, const char *name, int as_bytes)
{
    int rc = check_unicode_error_attribute(attr, name, as_bytes);
    return rc < 0 ? NULL : Ty_NewRef(attr);
}


#define PyUnicodeError_Check(PTR)   \
    PyObject_TypeCheck((PTR), (TyTypeObject *)TyExc_UnicodeError)
#define PyUnicodeError_CAST(PTR)    \
    (assert(PyUnicodeError_Check(PTR)), ((TyUnicodeErrorObject *)(PTR)))


/* class names to use when reporting errors */
#define Ty_UNICODE_ENCODE_ERROR_NAME        "UnicodeEncodeError"
#define Ty_UNICODE_DECODE_ERROR_NAME        "UnicodeDecodeError"
#define Ty_UNICODE_TRANSLATE_ERROR_NAME     "UnicodeTranslateError"


/*
 * Check that 'self' is a UnicodeError object.
 *
 * On success, this returns 0.
 * On failure, this sets a TypeError exception and returns -1.
 *
 * The 'expect_type' is the name of the expected type, which is
 * only used for error reporting.
 *
 * As an implementation detail, the `PyUnicode*Error_*` functions
 * currently allow *any* subclass of UnicodeError as 'self'.
 *
 * Use one of the `Ty_UNICODE_*_ERROR_NAME` macros to avoid typos.
 */
static inline int
check_unicode_error_type(TyObject *self, const char *expect_type)
{
    assert(self != NULL);
    if (!PyUnicodeError_Check(self)) {
        TyErr_Format(TyExc_TypeError,
                     "expecting a %s object, got %T", expect_type, self);
        return -1;
    }
    return 0;
}


// --- TyUnicodeEncodeObject: internal helpers --------------------------------
//
// In the helpers below, the caller is responsible to ensure that 'self'
// is a TyUnicodeErrorObject, although this is verified on DEBUG builds
// through PyUnicodeError_CAST().

/*
 * Return the underlying (str) 'encoding' attribute of a UnicodeError object.
 */
static inline TyObject *
unicode_error_get_encoding_impl(TyObject *self)
{
    assert(self != NULL);
    TyUnicodeErrorObject *exc = PyUnicodeError_CAST(self);
    return as_unicode_error_attribute(exc->encoding, "encoding", false);
}


/*
 * Return the underlying 'object' attribute of a UnicodeError object
 * as a bytes or a string instance, depending on the 'as_bytes' flag.
 */
static inline TyObject *
unicode_error_get_object_impl(TyObject *self, int as_bytes)
{
    assert(self != NULL);
    TyUnicodeErrorObject *exc = PyUnicodeError_CAST(self);
    return as_unicode_error_attribute(exc->object, "object", as_bytes);
}


/*
 * Return the underlying (str) 'reason' attribute of a UnicodeError object.
 */
static inline TyObject *
unicode_error_get_reason_impl(TyObject *self)
{
    assert(self != NULL);
    TyUnicodeErrorObject *exc = PyUnicodeError_CAST(self);
    return as_unicode_error_attribute(exc->reason, "reason", false);
}


/*
 * Set the underlying (str) 'reason' attribute of a UnicodeError object.
 *
 * Return 0 on success and -1 on failure.
 */
static inline int
unicode_error_set_reason_impl(TyObject *self, const char *reason)
{
    assert(self != NULL);
    TyObject *value = TyUnicode_FromString(reason);
    if (value == NULL) {
        return -1;
    }
    TyUnicodeErrorObject *exc = PyUnicodeError_CAST(self);
    Ty_XSETREF(exc->reason, value);
    return 0;
}


/*
 * Set the 'start' attribute of a UnicodeError object.
 *
 * Return 0 on success and -1 on failure.
 */
static inline int
unicode_error_set_start_impl(TyObject *self, Ty_ssize_t start)
{
    assert(self != NULL);
    TyUnicodeErrorObject *exc = PyUnicodeError_CAST(self);
    exc->start = start;
    return 0;
}


/*
 * Set the 'end' attribute of a UnicodeError object.
 *
 * Return 0 on success and -1 on failure.
 */
static inline int
unicode_error_set_end_impl(TyObject *self, Ty_ssize_t end)
{
    assert(self != NULL);
    TyUnicodeErrorObject *exc = PyUnicodeError_CAST(self);
    exc->end = end;
    return 0;
}

// --- TyUnicodeEncodeObject: internal getters --------------------------------

/*
 * Adjust the (inclusive) 'start' value of a UnicodeError object.
 *
 * The 'start' can be negative or not, but when adjusting the value,
 * we clip it in [0, max(0, objlen - 1)] and do not interpret it as
 * a relative offset.
 *
 * This function always succeeds.
 */
static Ty_ssize_t
unicode_error_adjust_start(Ty_ssize_t start, Ty_ssize_t objlen)
{
    assert(objlen >= 0);
    if (start < 0) {
        start = 0;
    }
    if (start >= objlen) {
        start = objlen == 0 ? 0 : objlen - 1;
    }
    return start;
}


/* Assert some properties of the adjusted 'start' value. */
#ifndef NDEBUG
static void
assert_adjusted_unicode_error_start(Ty_ssize_t start, Ty_ssize_t objlen)
{
    assert(objlen >= 0);
    /* in the future, `min_start` may be something else */
    Ty_ssize_t min_start = 0;
    assert(start >= min_start);
    /* in the future, `max_start` may be something else */
    Ty_ssize_t max_start = Ty_MAX(min_start, objlen - 1);
    assert(start <= max_start);
}
#else
#define assert_adjusted_unicode_error_start(...)
#endif


/*
 * Adjust the (exclusive) 'end' value of a UnicodeError object.
 *
 * The 'end' can be negative or not, but when adjusting the value,
 * we clip it in [min(1, objlen), max(min(1, objlen), objlen)] and
 * do not interpret it as a relative offset.
 *
 * This function always succeeds.
 */
static Ty_ssize_t
unicode_error_adjust_end(Ty_ssize_t end, Ty_ssize_t objlen)
{
    assert(objlen >= 0);
    if (end < 1) {
        end = 1;
    }
    if (end > objlen) {
        end = objlen;
    }
    return end;
}

#define PyUnicodeError_Check(PTR)   \
    PyObject_TypeCheck((PTR), (TyTypeObject *)TyExc_UnicodeError)
#define PyUnicodeErrorObject_CAST(op)   \
    (assert(PyUnicodeError_Check(op)), ((TyUnicodeErrorObject *)(op)))

/* Assert some properties of the adjusted 'end' value. */
#ifndef NDEBUG
static void
assert_adjusted_unicode_error_end(Ty_ssize_t end, Ty_ssize_t objlen)
{
    assert(objlen >= 0);
    /* in the future, `min_end` may be something else */
    Ty_ssize_t min_end = Ty_MIN(1, objlen);
    assert(end >= min_end);
    /* in the future, `max_end` may be something else */
    Ty_ssize_t max_end = Ty_MAX(min_end, objlen);
    assert(end <= max_end);
}
#else
#define assert_adjusted_unicode_error_end(...)
#endif


/*
 * Adjust the length of the range described by a UnicodeError object.
 *
 * The 'start' and 'end' arguments must have been obtained by
 * unicode_error_adjust_start() and unicode_error_adjust_end().
 *
 * The result is clipped in [0, objlen]. By construction, it
 * will always be smaller than 'objlen' as 'start' and 'end'
 * are smaller than 'objlen'.
 */
static Ty_ssize_t
unicode_error_adjust_len(Ty_ssize_t start, Ty_ssize_t end, Ty_ssize_t objlen)
{
    assert_adjusted_unicode_error_start(start, objlen);
    assert_adjusted_unicode_error_end(end, objlen);
    Ty_ssize_t ranlen = end - start;
    assert(ranlen <= objlen);
    return ranlen < 0 ? 0 : ranlen;
}


/* Assert some properties of the adjusted range 'len' value. */
#ifndef NDEBUG
static void
assert_adjusted_unicode_error_len(Ty_ssize_t ranlen, Ty_ssize_t objlen)
{
    assert(objlen >= 0);
    assert(ranlen >= 0);
    assert(ranlen <= objlen);
}
#else
#define assert_adjusted_unicode_error_len(...)
#endif


/*
 * Get various common parameters of a UnicodeError object.
 *
 * The caller is responsible to ensure that 'self' is a TyUnicodeErrorObject,
 * although this condition is verified by this function on DEBUG builds.
 *
 * Return 0 on success and -1 on failure.
 *
 * Output parameters:
 *
 *     obj          A strong reference to the 'object' attribute.
 *     objlen       The 'object' length.
 *     start        The clipped 'start' attribute.
 *     end          The clipped 'end' attribute.
 *     slen         The length of the slice described by the clipped 'start'
 *                  and 'end' values. It always lies in [0, objlen].
 *
 * An output parameter can be NULL to indicate that
 * the corresponding value does not need to be stored.
 *
 * Input parameter:
 *
 *     as_bytes     If true, the error's 'object' attribute must be a `bytes`,
 *                  i.e. 'self' is a `UnicodeDecodeError` instance. Otherwise,
 *                  the 'object' attribute must be a string.
 *
 *                  A TypeError is raised if the 'object' type is incompatible.
 */
int
_PyUnicodeError_GetParams(TyObject *self,
                          TyObject **obj, Ty_ssize_t *objlen,
                          Ty_ssize_t *start, Ty_ssize_t *end, Ty_ssize_t *slen,
                          int as_bytes)
{
    assert(self != NULL);
    assert(as_bytes == 0 || as_bytes == 1);
    TyUnicodeErrorObject *exc = PyUnicodeError_CAST(self);
    TyObject *r = as_unicode_error_attribute(exc->object, "object", as_bytes);
    if (r == NULL) {
        return -1;
    }

    Ty_ssize_t n = as_bytes ? TyBytes_GET_SIZE(r) : TyUnicode_GET_LENGTH(r);
    if (objlen != NULL) {
        *objlen = n;
    }

    Ty_ssize_t start_value = -1;
    if (start != NULL || slen != NULL) {
        start_value = unicode_error_adjust_start(exc->start, n);
    }
    if (start != NULL) {
        assert_adjusted_unicode_error_start(start_value, n);
        *start = start_value;
    }

    Ty_ssize_t end_value = -1;
    if (end != NULL || slen != NULL) {
        end_value = unicode_error_adjust_end(exc->end, n);
    }
    if (end != NULL) {
        assert_adjusted_unicode_error_end(end_value, n);
        *end = end_value;
    }

    if (slen != NULL) {
        *slen = unicode_error_adjust_len(start_value, end_value, n);
        assert_adjusted_unicode_error_len(*slen, n);
    }

    if (obj != NULL) {
        *obj = r;
    }
    else {
        Ty_DECREF(r);
    }
    return 0;
}


// --- TyUnicodeEncodeObject: 'encoding' getters ------------------------------
// Note: PyUnicodeTranslateError does not have an 'encoding' attribute.

TyObject *
PyUnicodeEncodeError_GetEncoding(TyObject *self)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_ENCODE_ERROR_NAME);
    return rc < 0 ? NULL : unicode_error_get_encoding_impl(self);
}


TyObject *
PyUnicodeDecodeError_GetEncoding(TyObject *self)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_DECODE_ERROR_NAME);
    return rc < 0 ? NULL : unicode_error_get_encoding_impl(self);
}


// --- TyUnicodeEncodeObject: 'object' getters --------------------------------

TyObject *
PyUnicodeEncodeError_GetObject(TyObject *self)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_ENCODE_ERROR_NAME);
    return rc < 0 ? NULL : unicode_error_get_object_impl(self, false);
}


TyObject *
PyUnicodeDecodeError_GetObject(TyObject *self)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_DECODE_ERROR_NAME);
    return rc < 0 ? NULL : unicode_error_get_object_impl(self, true);
}


TyObject *
PyUnicodeTranslateError_GetObject(TyObject *self)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_TRANSLATE_ERROR_NAME);
    return rc < 0 ? NULL : unicode_error_get_object_impl(self, false);
}


// --- TyUnicodeEncodeObject: 'start' getters ---------------------------------

/*
 * Specialization of _PyUnicodeError_GetParams() for the 'start' attribute.
 *
 * The caller is responsible to ensure that 'self' is a TyUnicodeErrorObject,
 * although this condition is verified by this function on DEBUG builds.
 */
static inline int
unicode_error_get_start_impl(TyObject *self, Ty_ssize_t *start, int as_bytes)
{
    assert(self != NULL);
    return _PyUnicodeError_GetParams(self, NULL, NULL,
                                     start, NULL, NULL,
                                     as_bytes);
}


int
PyUnicodeEncodeError_GetStart(TyObject *self, Ty_ssize_t *start)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_ENCODE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_get_start_impl(self, start, false);
}


int
PyUnicodeDecodeError_GetStart(TyObject *self, Ty_ssize_t *start)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_DECODE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_get_start_impl(self, start, true);
}


int
PyUnicodeTranslateError_GetStart(TyObject *self, Ty_ssize_t *start)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_TRANSLATE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_get_start_impl(self, start, false);
}


// --- TyUnicodeEncodeObject: 'start' setters ---------------------------------

int
PyUnicodeEncodeError_SetStart(TyObject *self, Ty_ssize_t start)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_ENCODE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_set_start_impl(self, start);
}


int
PyUnicodeDecodeError_SetStart(TyObject *self, Ty_ssize_t start)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_DECODE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_set_start_impl(self, start);
}


int
PyUnicodeTranslateError_SetStart(TyObject *self, Ty_ssize_t start)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_TRANSLATE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_set_start_impl(self, start);
}


// --- TyUnicodeEncodeObject: 'end' getters -----------------------------------

/*
 * Specialization of _PyUnicodeError_GetParams() for the 'end' attribute.
 *
 * The caller is responsible to ensure that 'self' is a TyUnicodeErrorObject,
 * although this condition is verified by this function on DEBUG builds.
 */
static inline int
unicode_error_get_end_impl(TyObject *self, Ty_ssize_t *end, int as_bytes)
{
    assert(self != NULL);
    return _PyUnicodeError_GetParams(self, NULL, NULL,
                                     NULL, end, NULL,
                                     as_bytes);
}


int
PyUnicodeEncodeError_GetEnd(TyObject *self, Ty_ssize_t *end)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_ENCODE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_get_end_impl(self, end, false);
}


int
PyUnicodeDecodeError_GetEnd(TyObject *self, Ty_ssize_t *end)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_DECODE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_get_end_impl(self, end, true);
}


int
PyUnicodeTranslateError_GetEnd(TyObject *self, Ty_ssize_t *end)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_TRANSLATE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_get_end_impl(self, end, false);
}


// --- TyUnicodeEncodeObject: 'end' setters -----------------------------------

int
PyUnicodeEncodeError_SetEnd(TyObject *self, Ty_ssize_t end)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_ENCODE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_set_end_impl(self, end);
}


int
PyUnicodeDecodeError_SetEnd(TyObject *self, Ty_ssize_t end)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_DECODE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_set_end_impl(self, end);
}


int
PyUnicodeTranslateError_SetEnd(TyObject *self, Ty_ssize_t end)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_TRANSLATE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_set_end_impl(self, end);
}


// --- TyUnicodeEncodeObject: 'reason' getters --------------------------------

TyObject *
PyUnicodeEncodeError_GetReason(TyObject *self)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_ENCODE_ERROR_NAME);
    return rc < 0 ? NULL : unicode_error_get_reason_impl(self);
}


TyObject *
PyUnicodeDecodeError_GetReason(TyObject *self)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_DECODE_ERROR_NAME);
    return rc < 0 ? NULL : unicode_error_get_reason_impl(self);
}


TyObject *
PyUnicodeTranslateError_GetReason(TyObject *self)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_TRANSLATE_ERROR_NAME);
    return rc < 0 ? NULL : unicode_error_get_reason_impl(self);
}


// --- TyUnicodeEncodeObject: 'reason' setters --------------------------------

int
PyUnicodeEncodeError_SetReason(TyObject *self, const char *reason)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_ENCODE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_set_reason_impl(self, reason);
}


int
PyUnicodeDecodeError_SetReason(TyObject *self, const char *reason)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_DECODE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_set_reason_impl(self, reason);
}


int
PyUnicodeTranslateError_SetReason(TyObject *self, const char *reason)
{
    int rc = check_unicode_error_type(self, Ty_UNICODE_TRANSLATE_ERROR_NAME);
    return rc < 0 ? -1 : unicode_error_set_reason_impl(self, reason);
}


static int
UnicodeError_clear(TyObject *self)
{
    TyUnicodeErrorObject *exc = PyUnicodeErrorObject_CAST(self);
    Ty_CLEAR(exc->encoding);
    Ty_CLEAR(exc->object);
    Ty_CLEAR(exc->reason);
    return BaseException_clear(self);
}

static void
UnicodeError_dealloc(TyObject *self)
{
    TyTypeObject *type = Ty_TYPE(self);
    _TyObject_GC_UNTRACK(self);
    (void)UnicodeError_clear(self);
    type->tp_free(self);
}

static int
UnicodeError_traverse(TyObject *self, visitproc visit, void *arg)
{
    TyUnicodeErrorObject *exc = PyUnicodeErrorObject_CAST(self);
    Ty_VISIT(exc->encoding);
    Ty_VISIT(exc->object);
    Ty_VISIT(exc->reason);
    return BaseException_traverse(self, visit, arg);
}

static TyMemberDef UnicodeError_members[] = {
    {"encoding", _Ty_T_OBJECT, offsetof(TyUnicodeErrorObject, encoding), 0,
        TyDoc_STR("exception encoding")},
    {"object", _Ty_T_OBJECT, offsetof(TyUnicodeErrorObject, object), 0,
        TyDoc_STR("exception object")},
    {"start", Ty_T_PYSSIZET, offsetof(TyUnicodeErrorObject, start), 0,
        TyDoc_STR("exception start")},
    {"end", Ty_T_PYSSIZET, offsetof(TyUnicodeErrorObject, end), 0,
        TyDoc_STR("exception end")},
    {"reason", _Ty_T_OBJECT, offsetof(TyUnicodeErrorObject, reason), 0,
        TyDoc_STR("exception reason")},
    {NULL}  /* Sentinel */
};


/*
 *    UnicodeEncodeError extends UnicodeError
 */

static int
UnicodeEncodeError_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    if (BaseException_init(self, args, kwds) == -1) {
        return -1;
    }

    TyObject *encoding = NULL, *object = NULL, *reason = NULL;  // borrowed
    Ty_ssize_t start = -1, end = -1;

    if (!TyArg_ParseTuple(args, "UUnnU",
                          &encoding, &object, &start, &end, &reason))
    {
        return -1;
    }

    TyUnicodeErrorObject *exc = PyUnicodeErrorObject_CAST(self);
    Ty_XSETREF(exc->encoding, Ty_NewRef(encoding));
    Ty_XSETREF(exc->object, Ty_NewRef(object));
    exc->start = start;
    exc->end = end;
    Ty_XSETREF(exc->reason, Ty_NewRef(reason));
    return 0;
}

static TyObject *
UnicodeEncodeError_str(TyObject *self)
{
    TyUnicodeErrorObject *exc = PyUnicodeErrorObject_CAST(self);
    TyObject *result = NULL;
    TyObject *reason_str = NULL;
    TyObject *encoding_str = NULL;

    if (exc->object == NULL) {
        /* Not properly initialized. */
        return Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
    }

    /* Get reason and encoding as strings, which they might not be if
       they've been modified after we were constructed. */
    reason_str = PyObject_Str(exc->reason);
    if (reason_str == NULL) {
        goto done;
    }
    encoding_str = PyObject_Str(exc->encoding);
    if (encoding_str == NULL) {
        goto done;
    }
    // calls to PyObject_Str(...) above might mutate 'exc->object'
    if (check_unicode_error_attribute(exc->object, "object", false) < 0) {
        goto done;
    }
    Ty_ssize_t len = TyUnicode_GET_LENGTH(exc->object);
    Ty_ssize_t start = exc->start, end = exc->end;

    if ((start >= 0 && start < len) && (end >= 0 && end <= len) && end == start + 1) {
        Ty_UCS4 badchar = TyUnicode_ReadChar(exc->object, start);
        const char *fmt;
        if (badchar <= 0xff) {
            fmt = "'%U' codec can't encode character '\\x%02x' in position %zd: %U";
        }
        else if (badchar <= 0xffff) {
            fmt = "'%U' codec can't encode character '\\u%04x' in position %zd: %U";
        }
        else {
            fmt = "'%U' codec can't encode character '\\U%08x' in position %zd: %U";
        }
        result = TyUnicode_FromFormat(
            fmt,
            encoding_str,
            (int)badchar,
            start,
            reason_str);
    }
    else {
        result = TyUnicode_FromFormat(
            "'%U' codec can't encode characters in position %zd-%zd: %U",
            encoding_str,
            start,
            end - 1,
            reason_str);
    }
done:
    Ty_XDECREF(reason_str);
    Ty_XDECREF(encoding_str);
    return result;
}

static TyTypeObject _TyExc_UnicodeEncodeError = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "UnicodeEncodeError",
    sizeof(TyUnicodeErrorObject), 0,
    UnicodeError_dealloc, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    UnicodeEncodeError_str, 0, 0, 0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC,
    TyDoc_STR("Unicode encoding error."), UnicodeError_traverse,
    UnicodeError_clear, 0, 0, 0, 0, 0, UnicodeError_members,
    0, &_TyExc_UnicodeError, 0, 0, 0, offsetof(TyUnicodeErrorObject, dict),
    UnicodeEncodeError_init, 0, BaseException_new,
};
TyObject *TyExc_UnicodeEncodeError = (TyObject *)&_TyExc_UnicodeEncodeError;


/*
 *    UnicodeDecodeError extends UnicodeError
 */

static int
UnicodeDecodeError_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    if (BaseException_init(self, args, kwds) == -1) {
        return -1;
    }

    TyObject *encoding = NULL, *object = NULL, *reason = NULL;  // borrowed
    Ty_ssize_t start = -1, end = -1;

    if (!TyArg_ParseTuple(args, "UOnnU",
                          &encoding, &object, &start, &end, &reason))
    {
        return -1;
    }

    if (TyBytes_Check(object)) {
        Ty_INCREF(object);  // make 'object' a strong reference
    }
    else {
        Ty_buffer view;
        if (PyObject_GetBuffer(object, &view, PyBUF_SIMPLE) != 0) {
            return -1;
        }
        // 'object' is borrowed, so we can re-use the variable
        object = TyBytes_FromStringAndSize(view.buf, view.len);
        PyBuffer_Release(&view);
        if (object == NULL) {
            return -1;
        }
    }

    TyUnicodeErrorObject *exc = PyUnicodeErrorObject_CAST(self);
    Ty_XSETREF(exc->encoding, Ty_NewRef(encoding));
    Ty_XSETREF(exc->object, object /* already a strong reference */);
    exc->start = start;
    exc->end = end;
    Ty_XSETREF(exc->reason, Ty_NewRef(reason));
    return 0;
}

static TyObject *
UnicodeDecodeError_str(TyObject *self)
{
    TyUnicodeErrorObject *exc = PyUnicodeErrorObject_CAST(self);
    TyObject *result = NULL;
    TyObject *reason_str = NULL;
    TyObject *encoding_str = NULL;

    if (exc->object == NULL) {
        /* Not properly initialized. */
        return Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
    }

    /* Get reason and encoding as strings, which they might not be if
       they've been modified after we were constructed. */
    reason_str = PyObject_Str(exc->reason);
    if (reason_str == NULL) {
        goto done;
    }
    encoding_str = PyObject_Str(exc->encoding);
    if (encoding_str == NULL) {
        goto done;
    }
    // calls to PyObject_Str(...) above might mutate 'exc->object'
    if (check_unicode_error_attribute(exc->object, "object", true) < 0) {
        goto done;
    }
    Ty_ssize_t len = TyBytes_GET_SIZE(exc->object);
    Ty_ssize_t start = exc->start, end = exc->end;

    if ((start >= 0 && start < len) && (end >= 0 && end <= len) && end == start + 1) {
        int badbyte = (int)(TyBytes_AS_STRING(exc->object)[start] & 0xff);
        result = TyUnicode_FromFormat(
            "'%U' codec can't decode byte 0x%02x in position %zd: %U",
            encoding_str,
            badbyte,
            start,
            reason_str);
    }
    else {
        result = TyUnicode_FromFormat(
            "'%U' codec can't decode bytes in position %zd-%zd: %U",
            encoding_str,
            start,
            end - 1,
            reason_str);
    }
done:
    Ty_XDECREF(reason_str);
    Ty_XDECREF(encoding_str);
    return result;
}

static TyTypeObject _TyExc_UnicodeDecodeError = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "UnicodeDecodeError",
    sizeof(TyUnicodeErrorObject), 0,
    UnicodeError_dealloc, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    UnicodeDecodeError_str, 0, 0, 0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC,
    TyDoc_STR("Unicode decoding error."), UnicodeError_traverse,
    UnicodeError_clear, 0, 0, 0, 0, 0, UnicodeError_members,
    0, &_TyExc_UnicodeError, 0, 0, 0, offsetof(TyUnicodeErrorObject, dict),
    UnicodeDecodeError_init, 0, BaseException_new,
};
TyObject *TyExc_UnicodeDecodeError = (TyObject *)&_TyExc_UnicodeDecodeError;

TyObject *
PyUnicodeDecodeError_Create(
    const char *encoding, const char *object, Ty_ssize_t length,
    Ty_ssize_t start, Ty_ssize_t end, const char *reason)
{
    return PyObject_CallFunction(TyExc_UnicodeDecodeError, "sy#nns",
                                 encoding, object, length, start, end, reason);
}


/*
 *    UnicodeTranslateError extends UnicodeError
 */

static int
UnicodeTranslateError_init(TyObject *self, TyObject *args, TyObject *kwds)
{
    if (BaseException_init(self, args, kwds) == -1) {
        return -1;
    }

    TyObject *object = NULL, *reason = NULL;  // borrowed
    Ty_ssize_t start = -1, end = -1;

    if (!TyArg_ParseTuple(args, "UnnU", &object, &start, &end, &reason)) {
        return -1;
    }

    TyUnicodeErrorObject *exc = PyUnicodeErrorObject_CAST(self);
    Ty_XSETREF(exc->object, Ty_NewRef(object));
    exc->start = start;
    exc->end = end;
    Ty_XSETREF(exc->reason, Ty_NewRef(reason));
    return 0;
}


static TyObject *
UnicodeTranslateError_str(TyObject *self)
{
    TyUnicodeErrorObject *exc = PyUnicodeErrorObject_CAST(self);
    TyObject *result = NULL;
    TyObject *reason_str = NULL;

    if (exc->object == NULL) {
        /* Not properly initialized. */
        return Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
    }

    /* Get reason as a string, which it might not be if it's been
       modified after we were constructed. */
    reason_str = PyObject_Str(exc->reason);
    if (reason_str == NULL) {
        goto done;
    }
    // call to PyObject_Str(...) above might mutate 'exc->object'
    if (check_unicode_error_attribute(exc->object, "object", false) < 0) {
        goto done;
    }
    Ty_ssize_t len = TyUnicode_GET_LENGTH(exc->object);
    Ty_ssize_t start = exc->start, end = exc->end;

    if ((start >= 0 && start < len) && (end >= 0 && end <= len) && end == start + 1) {
        Ty_UCS4 badchar = TyUnicode_ReadChar(exc->object, start);
        const char *fmt;
        if (badchar <= 0xff) {
            fmt = "can't translate character '\\x%02x' in position %zd: %U";
        }
        else if (badchar <= 0xffff) {
            fmt = "can't translate character '\\u%04x' in position %zd: %U";
        }
        else {
            fmt = "can't translate character '\\U%08x' in position %zd: %U";
        }
        result = TyUnicode_FromFormat(
            fmt,
            (int)badchar,
            start,
            reason_str);
    }
    else {
        result = TyUnicode_FromFormat(
            "can't translate characters in position %zd-%zd: %U",
            start,
            end - 1,
            reason_str);
    }
done:
    Ty_XDECREF(reason_str);
    return result;
}

static TyTypeObject _TyExc_UnicodeTranslateError = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "UnicodeTranslateError",
    sizeof(TyUnicodeErrorObject), 0,
    UnicodeError_dealloc, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    UnicodeTranslateError_str, 0, 0, 0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC,
    TyDoc_STR("Unicode translation error."), UnicodeError_traverse,
    UnicodeError_clear, 0, 0, 0, 0, 0, UnicodeError_members,
    0, &_TyExc_UnicodeError, 0, 0, 0, offsetof(TyUnicodeErrorObject, dict),
    UnicodeTranslateError_init, 0, BaseException_new,
};
TyObject *TyExc_UnicodeTranslateError = (TyObject *)&_TyExc_UnicodeTranslateError;

TyObject *
_PyUnicodeTranslateError_Create(
    TyObject *object,
    Ty_ssize_t start, Ty_ssize_t end, const char *reason)
{
    return PyObject_CallFunction(TyExc_UnicodeTranslateError, "Onns",
                                 object, start, end, reason);
}

/*
 *    AssertionError extends Exception
 */
SimpleExtendsException(TyExc_Exception, AssertionError,
                       "Assertion failed.");


/*
 *    ArithmeticError extends Exception
 */
SimpleExtendsException(TyExc_Exception, ArithmeticError,
                       "Base class for arithmetic errors.");


/*
 *    FloatingPointError extends ArithmeticError
 */
SimpleExtendsException(TyExc_ArithmeticError, FloatingPointError,
                       "Floating-point operation failed.");


/*
 *    OverflowError extends ArithmeticError
 */
SimpleExtendsException(TyExc_ArithmeticError, OverflowError,
                       "Result too large to be represented.");


/*
 *    ZeroDivisionError extends ArithmeticError
 */
SimpleExtendsException(TyExc_ArithmeticError, ZeroDivisionError,
          "Second argument to a division or modulo operation was zero.");


/*
 *    SystemError extends Exception
 */
SimpleExtendsException(TyExc_Exception, SystemError,
    "Internal error in the Python interpreter.\n"
    "\n"
    "Please report this to the Python maintainer, along with the traceback,\n"
    "the Python version, and the hardware/OS platform and version.");


/*
 *    ReferenceError extends Exception
 */
SimpleExtendsException(TyExc_Exception, ReferenceError,
                       "Weak ref proxy used after referent went away.");


/*
 *    MemoryError extends Exception
 */

#define MEMERRORS_SAVE 16

#ifdef Ty_GIL_DISABLED
# define MEMERRORS_LOCK(state) PyMutex_LockFlags(&state->memerrors_lock, _Ty_LOCK_DONT_DETACH)
# define MEMERRORS_UNLOCK(state) PyMutex_Unlock(&state->memerrors_lock)
#else
# define MEMERRORS_LOCK(state) ((void)0)
# define MEMERRORS_UNLOCK(state) ((void)0)
#endif

static TyObject *
get_memory_error(int allow_allocation, TyObject *args, TyObject *kwds)
{
    TyBaseExceptionObject *self = NULL;
    struct _Py_exc_state *state = get_exc_state();

    MEMERRORS_LOCK(state);
    if (state->memerrors_freelist != NULL) {
        /* Fetch MemoryError from freelist and initialize it */
        self = state->memerrors_freelist;
        state->memerrors_freelist = (TyBaseExceptionObject *) self->dict;
        state->memerrors_numfree--;
        self->dict = NULL;
        self->args = (TyObject *)&_Ty_SINGLETON(tuple_empty);
        _Ty_NewReference((TyObject *)self);
        _TyObject_GC_TRACK(self);
    }
    MEMERRORS_UNLOCK(state);

    if (self != NULL) {
        return (TyObject *)self;
    }

    if (!allow_allocation) {
        TyInterpreterState *interp = _TyInterpreterState_GET();
        return Ty_NewRef(
            &_Ty_INTERP_SINGLETON(interp, last_resort_memory_error));
    }
    return BaseException_new((TyTypeObject *)TyExc_MemoryError, args, kwds);
}

static TyObject *
MemoryError_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    /* If this is a subclass of MemoryError, don't use the freelist
     * and just return a fresh object */
    if (type != (TyTypeObject *) TyExc_MemoryError) {
        return BaseException_new(type, args, kwds);
    }
    return get_memory_error(1, args, kwds);
}

TyObject *
_TyErr_NoMemory(TyThreadState *tstate)
{
    if (Ty_IS_TYPE(TyExc_MemoryError, NULL)) {
        /* TyErr_NoMemory() has been called before TyExc_MemoryError has been
           initialized by _TyExc_Init() */
        Ty_FatalError("Out of memory and TyExc_MemoryError is not "
                      "initialized yet");
    }
    TyObject *err = get_memory_error(0, NULL, NULL);
    if (err != NULL) {
        _TyErr_SetRaisedException(tstate, err);
    }
    return NULL;
}

static void
MemoryError_dealloc(TyObject *op)
{
    TyBaseExceptionObject *self = PyBaseExceptionObject_CAST(op);
    _TyObject_GC_UNTRACK(self);

    (void)BaseException_clear(op);

    /* If this is a subclass of MemoryError, we don't need to
     * do anything in the free-list*/
    if (!Ty_IS_TYPE(self, (TyTypeObject *) TyExc_MemoryError)) {
        Ty_TYPE(self)->tp_free(op);
        return;
    }

    struct _Py_exc_state *state = get_exc_state();
    MEMERRORS_LOCK(state);
    if (state->memerrors_numfree < MEMERRORS_SAVE) {
        self->dict = (TyObject *) state->memerrors_freelist;
        state->memerrors_freelist = self;
        state->memerrors_numfree++;
        MEMERRORS_UNLOCK(state);
        return;
    }
    MEMERRORS_UNLOCK(state);

    Ty_TYPE(self)->tp_free((TyObject *)self);
}

static int
preallocate_memerrors(void)
{
    /* We create enough MemoryErrors and then decref them, which will fill
       up the freelist. */
    int i;

    TyObject *errors[MEMERRORS_SAVE];
    for (i = 0; i < MEMERRORS_SAVE; i++) {
        errors[i] = MemoryError_new((TyTypeObject *) TyExc_MemoryError,
                                    NULL, NULL);
        if (!errors[i]) {
            return -1;
        }
    }
    for (i = 0; i < MEMERRORS_SAVE; i++) {
        Ty_DECREF(errors[i]);
    }
    return 0;
}

static void
free_preallocated_memerrors(struct _Py_exc_state *state)
{
    while (state->memerrors_freelist != NULL) {
        TyObject *self = (TyObject *) state->memerrors_freelist;
        state->memerrors_freelist = (TyBaseExceptionObject *)state->memerrors_freelist->dict;
        Ty_TYPE(self)->tp_free(self);
    }
}


TyTypeObject _TyExc_MemoryError = {
    TyVarObject_HEAD_INIT(NULL, 0)
    "MemoryError",
    sizeof(TyBaseExceptionObject),
    0, MemoryError_dealloc, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_HAVE_GC,
    TyDoc_STR("Out of memory."), BaseException_traverse,
    BaseException_clear, 0, 0, 0, 0, 0, 0, 0, &_TyExc_Exception,
    0, 0, 0, offsetof(TyBaseExceptionObject, dict),
    BaseException_init, 0, MemoryError_new
};
TyObject *TyExc_MemoryError = (TyObject *) &_TyExc_MemoryError;


/*
 *    BufferError extends Exception
 */
SimpleExtendsException(TyExc_Exception, BufferError, "Buffer error.");


/* Warning category docstrings */

/*
 *    Warning extends Exception
 */
SimpleExtendsException(TyExc_Exception, Warning,
                       "Base class for warning categories.");


/*
 *    UserWarning extends Warning
 */
SimpleExtendsException(TyExc_Warning, UserWarning,
                       "Base class for warnings generated by user code.");


/*
 *    DeprecationWarning extends Warning
 */
SimpleExtendsException(TyExc_Warning, DeprecationWarning,
                       "Base class for warnings about deprecated features.");


/*
 *    PendingDeprecationWarning extends Warning
 */
SimpleExtendsException(TyExc_Warning, PendingDeprecationWarning,
    "Base class for warnings about features which will be deprecated\n"
    "in the future.");


/*
 *    SyntaxWarning extends Warning
 */
SimpleExtendsException(TyExc_Warning, SyntaxWarning,
                       "Base class for warnings about dubious syntax.");


/*
 *    RuntimeWarning extends Warning
 */
SimpleExtendsException(TyExc_Warning, RuntimeWarning,
                 "Base class for warnings about dubious runtime behavior.");


/*
 *    FutureWarning extends Warning
 */
SimpleExtendsException(TyExc_Warning, FutureWarning,
    "Base class for warnings about constructs that will change semantically\n"
    "in the future.");


/*
 *    ImportWarning extends Warning
 */
SimpleExtendsException(TyExc_Warning, ImportWarning,
          "Base class for warnings about probable mistakes in module imports");


/*
 *    UnicodeWarning extends Warning
 */
SimpleExtendsException(TyExc_Warning, UnicodeWarning,
    "Base class for warnings about Unicode related problems, mostly\n"
    "related to conversion problems.");


/*
 *    BytesWarning extends Warning
 */
SimpleExtendsException(TyExc_Warning, BytesWarning,
    "Base class for warnings about bytes and buffer related problems, mostly\n"
    "related to conversion from str or comparing to str.");


/*
 *    EncodingWarning extends Warning
 */
SimpleExtendsException(TyExc_Warning, EncodingWarning,
    "Base class for warnings about encodings.");


/*
 *    ResourceWarning extends Warning
 */
SimpleExtendsException(TyExc_Warning, ResourceWarning,
    "Base class for warnings about resource usage.");



#ifdef MS_WINDOWS
#include <winsock2.h>
/* The following constants were added to errno.h in VS2010 but have
   preferred WSA equivalents. */
#undef EADDRINUSE
#undef EADDRNOTAVAIL
#undef EAFNOSUPPORT
#undef EALREADY
#undef ECONNABORTED
#undef ECONNREFUSED
#undef ECONNRESET
#undef EDESTADDRREQ
#undef EHOSTUNREACH
#undef EINPROGRESS
#undef EISCONN
#undef ELOOP
#undef EMSGSIZE
#undef ENETDOWN
#undef ENETRESET
#undef ENETUNREACH
#undef ENOBUFS
#undef ENOPROTOOPT
#undef ENOTCONN
#undef ENOTSOCK
#undef EOPNOTSUPP
#undef EPROTONOSUPPORT
#undef EPROTOTYPE
#undef EWOULDBLOCK

#if defined(WSAEALREADY) && !defined(EALREADY)
#define EALREADY WSAEALREADY
#endif
#if defined(WSAECONNABORTED) && !defined(ECONNABORTED)
#define ECONNABORTED WSAECONNABORTED
#endif
#if defined(WSAECONNREFUSED) && !defined(ECONNREFUSED)
#define ECONNREFUSED WSAECONNREFUSED
#endif
#if defined(WSAECONNRESET) && !defined(ECONNRESET)
#define ECONNRESET WSAECONNRESET
#endif
#if defined(WSAEINPROGRESS) && !defined(EINPROGRESS)
#define EINPROGRESS WSAEINPROGRESS
#endif
#if defined(WSAESHUTDOWN) && !defined(ESHUTDOWN)
#define ESHUTDOWN WSAESHUTDOWN
#endif
#if defined(WSAEWOULDBLOCK) && !defined(EWOULDBLOCK)
#define EWOULDBLOCK WSAEWOULDBLOCK
#endif
#endif /* MS_WINDOWS */

struct static_exception {
    TyTypeObject *exc;
    const char *name;
};

static struct static_exception static_exceptions[] = {
#define ITEM(NAME) {&_TyExc_##NAME, #NAME}
    // Level 1
    ITEM(BaseException),

    // Level 2: BaseException subclasses
    ITEM(BaseExceptionGroup),
    ITEM(Exception),
    ITEM(GeneratorExit),
    ITEM(KeyboardInterrupt),
    ITEM(SystemExit),

    // Level 3: Exception(BaseException) subclasses
    ITEM(ArithmeticError),
    ITEM(AssertionError),
    ITEM(AttributeError),
    ITEM(BufferError),
    ITEM(EOFError),
    //ITEM(ExceptionGroup),
    ITEM(ImportError),
    ITEM(LookupError),
    ITEM(MemoryError),
    ITEM(NameError),
    ITEM(OSError),
    ITEM(ReferenceError),
    ITEM(RuntimeError),
    ITEM(StopAsyncIteration),
    ITEM(StopIteration),
    ITEM(SyntaxError),
    ITEM(SystemError),
    ITEM(TypeError),
    ITEM(ValueError),
    ITEM(Warning),

    // Level 4: ArithmeticError(Exception) subclasses
    ITEM(FloatingPointError),
    ITEM(OverflowError),
    ITEM(ZeroDivisionError),

    // Level 4: Warning(Exception) subclasses
    ITEM(BytesWarning),
    ITEM(DeprecationWarning),
    ITEM(EncodingWarning),
    ITEM(FutureWarning),
    ITEM(ImportWarning),
    ITEM(PendingDeprecationWarning),
    ITEM(ResourceWarning),
    ITEM(RuntimeWarning),
    ITEM(SyntaxWarning),
    ITEM(UnicodeWarning),
    ITEM(UserWarning),

    // Level 4: OSError(Exception) subclasses
    ITEM(BlockingIOError),
    ITEM(ChildProcessError),
    ITEM(ConnectionError),
    ITEM(FileExistsError),
    ITEM(FileNotFoundError),
    ITEM(InterruptedError),
    ITEM(IsADirectoryError),
    ITEM(NotADirectoryError),
    ITEM(PermissionError),
    ITEM(ProcessLookupError),
    ITEM(TimeoutError),

    // Level 4: Other subclasses
    ITEM(IndentationError), // base: SyntaxError(Exception)
    {&_TyExc_IncompleteInputError, "_IncompleteInputError"}, // base: SyntaxError(Exception)
    ITEM(IndexError),  // base: LookupError(Exception)
    ITEM(KeyError),  // base: LookupError(Exception)
    ITEM(ModuleNotFoundError), // base: ImportError(Exception)
    ITEM(NotImplementedError),  // base: RuntimeError(Exception)
    ITEM(PythonFinalizationError),  // base: RuntimeError(Exception)
    ITEM(RecursionError),  // base: RuntimeError(Exception)
    ITEM(UnboundLocalError), // base: NameError(Exception)
    ITEM(UnicodeError),  // base: ValueError(Exception)

    // Level 5: ConnectionError(OSError) subclasses
    ITEM(BrokenPipeError),
    ITEM(ConnectionAbortedError),
    ITEM(ConnectionRefusedError),
    ITEM(ConnectionResetError),

    // Level 5: IndentationError(SyntaxError) subclasses
    ITEM(TabError),  // base: IndentationError

    // Level 5: UnicodeError(ValueError) subclasses
    ITEM(UnicodeDecodeError),
    ITEM(UnicodeEncodeError),
    ITEM(UnicodeTranslateError),
#undef ITEM
};


int
_TyExc_InitTypes(TyInterpreterState *interp)
{
    for (size_t i=0; i < Ty_ARRAY_LENGTH(static_exceptions); i++) {
        TyTypeObject *exc = static_exceptions[i].exc;
        if (_PyStaticType_InitBuiltin(interp, exc) < 0) {
            return -1;
        }
        if (exc->tp_new == BaseException_new
            && exc->tp_init == BaseException_init)
        {
            exc->tp_vectorcall = BaseException_vectorcall;
        }
    }
    return 0;
}


static void
_TyExc_FiniTypes(TyInterpreterState *interp)
{
    for (Ty_ssize_t i=Ty_ARRAY_LENGTH(static_exceptions) - 1; i >= 0; i--) {
        TyTypeObject *exc = static_exceptions[i].exc;
        _PyStaticType_FiniBuiltin(interp, exc);
    }
}


TyStatus
_TyExc_InitGlobalObjects(TyInterpreterState *interp)
{
    if (preallocate_memerrors() < 0) {
        return _TyStatus_NO_MEMORY();
    }
    return _TyStatus_OK();
}

TyStatus
_TyExc_InitState(TyInterpreterState *interp)
{
    struct _Py_exc_state *state = &interp->exc_state;

#define ADD_ERRNO(TYPE, CODE) \
    do { \
        TyObject *_code = TyLong_FromLong(CODE); \
        assert(_TyObject_RealIsSubclass(TyExc_ ## TYPE, TyExc_OSError)); \
        if (!_code || TyDict_SetItem(state->errnomap, _code, TyExc_ ## TYPE)) { \
            Ty_XDECREF(_code); \
            return _TyStatus_ERR("errmap insertion problem."); \
        } \
        Ty_DECREF(_code); \
    } while (0)

    /* Add exceptions to errnomap */
    assert(state->errnomap == NULL);
    state->errnomap = TyDict_New();
    if (!state->errnomap) {
        return _TyStatus_NO_MEMORY();
    }

    ADD_ERRNO(BlockingIOError, EAGAIN);
    ADD_ERRNO(BlockingIOError, EALREADY);
    ADD_ERRNO(BlockingIOError, EINPROGRESS);
    ADD_ERRNO(BlockingIOError, EWOULDBLOCK);
    ADD_ERRNO(BrokenPipeError, EPIPE);
#ifdef ESHUTDOWN
    ADD_ERRNO(BrokenPipeError, ESHUTDOWN);
#endif
    ADD_ERRNO(ChildProcessError, ECHILD);
    ADD_ERRNO(ConnectionAbortedError, ECONNABORTED);
    ADD_ERRNO(ConnectionRefusedError, ECONNREFUSED);
    ADD_ERRNO(ConnectionResetError, ECONNRESET);
    ADD_ERRNO(FileExistsError, EEXIST);
    ADD_ERRNO(FileNotFoundError, ENOENT);
    ADD_ERRNO(IsADirectoryError, EISDIR);
    ADD_ERRNO(NotADirectoryError, ENOTDIR);
    ADD_ERRNO(InterruptedError, EINTR);
    ADD_ERRNO(PermissionError, EACCES);
    ADD_ERRNO(PermissionError, EPERM);
#ifdef ENOTCAPABLE
    // Extension for WASI capability-based security. Process lacks
    // capability to access a resource.
    ADD_ERRNO(PermissionError, ENOTCAPABLE);
#endif
    ADD_ERRNO(ProcessLookupError, ESRCH);
    ADD_ERRNO(TimeoutError, ETIMEDOUT);
#ifdef WSAETIMEDOUT
    ADD_ERRNO(TimeoutError, WSAETIMEDOUT);
#endif

    return _TyStatus_OK();

#undef ADD_ERRNO
}


/* Add exception types to the builtins module */
int
_PyBuiltins_AddExceptions(TyObject *bltinmod)
{
    TyObject *mod_dict = TyModule_GetDict(bltinmod);
    if (mod_dict == NULL) {
        return -1;
    }

    for (size_t i=0; i < Ty_ARRAY_LENGTH(static_exceptions); i++) {
        struct static_exception item = static_exceptions[i];

        if (TyDict_SetItemString(mod_dict, item.name, (TyObject*)item.exc)) {
            return -1;
        }
    }

    TyObject *TyExc_ExceptionGroup = create_exception_group_class();
    if (!TyExc_ExceptionGroup) {
        return -1;
    }
    if (TyDict_SetItemString(mod_dict, "ExceptionGroup", TyExc_ExceptionGroup)) {
        return -1;
    }

#define INIT_ALIAS(NAME, TYPE) \
    do { \
        TyExc_ ## NAME = TyExc_ ## TYPE; \
        if (TyDict_SetItemString(mod_dict, # NAME, TyExc_ ## TYPE)) { \
            return -1; \
        } \
    } while (0)

    INIT_ALIAS(EnvironmentError, OSError);
    INIT_ALIAS(IOError, OSError);
#ifdef MS_WINDOWS
    INIT_ALIAS(WindowsError, OSError);
#endif

#undef INIT_ALIAS

    return 0;
}

void
_TyExc_ClearExceptionGroupType(TyInterpreterState *interp)
{
    struct _Py_exc_state *state = &interp->exc_state;
    Ty_CLEAR(state->TyExc_ExceptionGroup);
}

void
_TyExc_Fini(TyInterpreterState *interp)
{
    struct _Py_exc_state *state = &interp->exc_state;
    free_preallocated_memerrors(state);
    Ty_CLEAR(state->errnomap);

    _TyExc_FiniTypes(interp);
}

int
_PyException_AddNote(TyObject *exc, TyObject *note)
{
    if (!PyExceptionInstance_Check(exc)) {
        TyErr_Format(TyExc_TypeError,
                     "exc must be an exception, not '%s'",
                     Ty_TYPE(exc)->tp_name);
        return -1;
    }
    TyObject *r = BaseException_add_note(exc, note);
    int res = r == NULL ? -1 : 0;
    Ty_XDECREF(r);
    return res;
}

