
/* Error handling */

#include "Python.h"
#include "pycore_audit.h"         // _TySys_Audit()
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_fileutils.h"     // _PyFile_Flush
#include "pycore_initconfig.h"    // _TyStatus_ERR()
#include "pycore_pyerrors.h"      // _TyErr_Format()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_runtime.h"       // _Ty_ID()
#include "pycore_structseq.h"     // _PyStructSequence_FiniBuiltin()
#include "pycore_sysmodule.h"     // _TySys_GetOptionalAttr()
#include "pycore_traceback.h"     // _PyTraceBack_FromFrame()
#include "pycore_unicodeobject.h" // _TyUnicode_Equal()

#ifdef MS_WINDOWS
#  include <windows.h>
#  include <winbase.h>
#  include <stdlib.h>             // _sys_nerr
#endif


void
_TyErr_SetRaisedException(TyThreadState *tstate, TyObject *exc)
{
    TyObject *old_exc = tstate->current_exception;
    tstate->current_exception = exc;
    Ty_XDECREF(old_exc);
}

static TyObject*
_TyErr_CreateException(TyObject *exception_type, TyObject *value)
{
    TyObject *exc;

    if (value == NULL || value == Ty_None) {
        exc = _TyObject_CallNoArgs(exception_type);
    }
    else if (TyTuple_Check(value)) {
        exc = PyObject_Call(exception_type, value, NULL);
    }
    else {
        exc = PyObject_CallOneArg(exception_type, value);
    }

    if (exc != NULL && !PyExceptionInstance_Check(exc)) {
        TyErr_Format(TyExc_TypeError,
                     "calling %R should have returned an instance of "
                     "BaseException, not %s",
                     exception_type, Ty_TYPE(exc)->tp_name);
        Ty_CLEAR(exc);
    }

    return exc;
}

void
_TyErr_Restore(TyThreadState *tstate, TyObject *type, TyObject *value,
               TyObject *traceback)
{
    if (type == NULL) {
        assert(value == NULL);
        assert(traceback == NULL);
        _TyErr_SetRaisedException(tstate, NULL);
        return;
    }
    assert(PyExceptionClass_Check(type));
    if (value != NULL && type == (TyObject *)Ty_TYPE(value)) {
        /* Already normalized */
#ifdef Ty_DEBUG
        TyObject *tb = PyException_GetTraceback(value);
        assert(tb != Ty_None);
        Ty_XDECREF(tb);
#endif
    }
    else {
        TyObject *exc = _TyErr_CreateException(type, value);
        Ty_XDECREF(value);
        if (exc == NULL) {
            Ty_DECREF(type);
            Ty_XDECREF(traceback);
            return;
        }
        value = exc;
    }
    assert(PyExceptionInstance_Check(value));
    if (traceback != NULL) {
        if (PyException_SetTraceback(value, traceback) < 0) {
            Ty_DECREF(traceback);
            Ty_DECREF(value);
            Ty_DECREF(type);
            return;
        }
        Ty_DECREF(traceback);
    }
    _TyErr_SetRaisedException(tstate, value);
    Ty_DECREF(type);
}

void
TyErr_Restore(TyObject *type, TyObject *value, TyObject *traceback)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_Restore(tstate, type, value, traceback);
}

void
TyErr_SetRaisedException(TyObject *exc)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_SetRaisedException(tstate, exc);
}

_TyErr_StackItem *
_TyErr_GetTopmostException(TyThreadState *tstate)
{
    _TyErr_StackItem *exc_info = tstate->exc_info;
    assert(exc_info);

    while (exc_info->exc_value == NULL && exc_info->previous_item != NULL)
    {
        exc_info = exc_info->previous_item;
    }
    assert(!Ty_IsNone(exc_info->exc_value));
    return exc_info;
}

static TyObject *
get_normalization_failure_note(TyThreadState *tstate, TyObject *exception, TyObject *value)
{
    TyObject *args = PyObject_Repr(value);
    if (args == NULL) {
        _TyErr_Clear(tstate);
        args = TyUnicode_FromFormat("<unknown>");
    }
    TyObject *note;
    const char *tpname = ((TyTypeObject*)exception)->tp_name;
    if (args == NULL) {
        _TyErr_Clear(tstate);
        note = TyUnicode_FromFormat("Normalization failed: type=%s", tpname);
    }
    else {
        note = TyUnicode_FromFormat("Normalization failed: type=%s args=%S",
                                    tpname, args);
        Ty_DECREF(args);
    }
    return note;
}

void
_TyErr_SetObject(TyThreadState *tstate, TyObject *exception, TyObject *value)
{
    TyObject *exc_value;
    TyObject *tb = NULL;

    if (exception != NULL &&
        !PyExceptionClass_Check(exception)) {
        _TyErr_Format(tstate, TyExc_SystemError,
                      "_TyErr_SetObject: "
                      "exception %R is not a BaseException subclass",
                      exception);
        return;
    }
    /* Normalize the exception */
    int is_subclass = 0;
    if (value != NULL && PyExceptionInstance_Check(value)) {
        is_subclass = PyObject_IsSubclass((TyObject *)Ty_TYPE(value), exception);
        if (is_subclass < 0) {
            return;
        }
    }
    Ty_XINCREF(value);
    if (!is_subclass) {
        /* We must normalize the value right now */

        /* Issue #23571: functions must not be called with an
            exception set */
        _TyErr_Clear(tstate);

        TyObject *fixed_value = _TyErr_CreateException(exception, value);
        if (fixed_value == NULL) {
            TyObject *exc = _TyErr_GetRaisedException(tstate);
            assert(PyExceptionInstance_Check(exc));

            TyObject *note = get_normalization_failure_note(tstate, exception, value);
            Ty_XDECREF(value);
            if (note != NULL) {
                /* ignore errors in _PyException_AddNote - they will be overwritten below */
                _PyException_AddNote(exc, note);
                Ty_DECREF(note);
            }
            _TyErr_SetRaisedException(tstate, exc);
            return;
        }
        Ty_XSETREF(value, fixed_value);
    }

    exc_value = _TyErr_GetTopmostException(tstate)->exc_value;
    if (exc_value != NULL && exc_value != Ty_None) {
        /* Implicit exception chaining */
        Ty_INCREF(exc_value);
        /* Avoid creating new reference cycles through the
           context chain, while taking care not to hang on
           pre-existing ones.
           This is O(chain length) but context chains are
           usually very short. Sensitive readers may try
           to inline the call to PyException_GetContext. */
        if (exc_value != value) {
            TyObject *o = exc_value, *context;
            TyObject *slow_o = o;  /* Floyd's cycle detection algo */
            int slow_update_toggle = 0;
            while ((context = PyException_GetContext(o))) {
                Ty_DECREF(context);
                if (context == value) {
                    PyException_SetContext(o, NULL);
                    break;
                }
                o = context;
                if (o == slow_o) {
                    /* pre-existing cycle - all exceptions on the
                       path were visited and checked.  */
                    break;
                }
                if (slow_update_toggle) {
                    slow_o = PyException_GetContext(slow_o);
                    Ty_DECREF(slow_o);
                }
                slow_update_toggle = !slow_update_toggle;
            }
            PyException_SetContext(value, exc_value);
        }
        else {
            Ty_DECREF(exc_value);
        }
    }
    assert(value != NULL);
    if (PyExceptionInstance_Check(value))
        tb = PyException_GetTraceback(value);
    _TyErr_Restore(tstate, Ty_NewRef(Ty_TYPE(value)), value, tb);
}

void
TyErr_SetObject(TyObject *exception, TyObject *value)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_SetObject(tstate, exception, value);
}

/* Set a key error with the specified argument, wrapping it in a
 * tuple automatically so that tuple keys are not unpacked as the
 * exception arguments. */
void
_TyErr_SetKeyError(TyObject *arg)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *exc = PyObject_CallOneArg(TyExc_KeyError, arg);
    if (!exc) {
        /* caller will expect error to be set anyway */
        return;
    }

    _TyErr_SetObject(tstate, (TyObject*)Ty_TYPE(exc), exc);
    Ty_DECREF(exc);
}

void
_TyErr_SetNone(TyThreadState *tstate, TyObject *exception)
{
    _TyErr_SetObject(tstate, exception, (TyObject *)NULL);
}


void
TyErr_SetNone(TyObject *exception)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_SetNone(tstate, exception);
}


void
_TyErr_SetString(TyThreadState *tstate, TyObject *exception,
                 const char *string)
{
    TyObject *value = TyUnicode_FromString(string);
    if (value != NULL) {
        _TyErr_SetObject(tstate, exception, value);
        Ty_DECREF(value);
    }
}

void
TyErr_SetString(TyObject *exception, const char *string)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_SetString(tstate, exception, string);
}

void
_TyErr_SetLocaleString(TyObject *exception, const char *string)
{
    TyObject *value = TyUnicode_DecodeLocale(string, "surrogateescape");
    if (value != NULL) {
        TyErr_SetObject(exception, value);
        Ty_DECREF(value);
    }
}

TyObject* _Ty_HOT_FUNCTION
TyErr_Occurred(void)
{
    /* The caller must hold a thread state. */
    _Ty_AssertHoldsTstate();

    TyThreadState *tstate = _TyThreadState_GET();
    return _TyErr_Occurred(tstate);
}


int
TyErr_GivenExceptionMatches(TyObject *err, TyObject *exc)
{
    if (err == NULL || exc == NULL) {
        /* maybe caused by "import exceptions" that failed early on */
        return 0;
    }
    if (TyTuple_Check(exc)) {
        Ty_ssize_t i, n;
        n = TyTuple_Size(exc);
        for (i = 0; i < n; i++) {
            /* Test recursively */
             if (TyErr_GivenExceptionMatches(
                 err, TyTuple_GET_ITEM(exc, i)))
             {
                 return 1;
             }
        }
        return 0;
    }
    /* err might be an instance, so check its class. */
    if (PyExceptionInstance_Check(err))
        err = PyExceptionInstance_Class(err);

    if (PyExceptionClass_Check(err) && PyExceptionClass_Check(exc)) {
        return TyType_IsSubtype((TyTypeObject *)err, (TyTypeObject *)exc);
    }

    return err == exc;
}


int
_TyErr_ExceptionMatches(TyThreadState *tstate, TyObject *exc)
{
    return TyErr_GivenExceptionMatches(_TyErr_Occurred(tstate), exc);
}


int
TyErr_ExceptionMatches(TyObject *exc)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyErr_ExceptionMatches(tstate, exc);
}


#ifndef Ty_NORMALIZE_RECURSION_LIMIT
#define Ty_NORMALIZE_RECURSION_LIMIT 32
#endif

/* Used in many places to normalize a raised exception, including in
   eval_code2(), do_raise(), and TyErr_Print()

   XXX: should TyErr_NormalizeException() also call
            PyException_SetTraceback() with the resulting value and tb?
*/
void
_TyErr_NormalizeException(TyThreadState *tstate, TyObject **exc,
                          TyObject **val, TyObject **tb)
{
    int recursion_depth = 0;
    tstate->recursion_headroom++;
    TyObject *type, *value, *initial_tb;

  restart:
    type = *exc;
    if (type == NULL) {
        /* There was no exception, so nothing to do. */
        tstate->recursion_headroom--;
        return;
    }

    value = *val;
    /* If TyErr_SetNone() was used, the value will have been actually
       set to NULL.
    */
    if (!value) {
        value = Ty_NewRef(Ty_None);
    }

    /* Normalize the exception so that if the type is a class, the
       value will be an instance.
    */
    if (PyExceptionClass_Check(type)) {
        TyObject *inclass = NULL;
        int is_subclass = 0;

        if (PyExceptionInstance_Check(value)) {
            inclass = PyExceptionInstance_Class(value);
            is_subclass = PyObject_IsSubclass(inclass, type);
            if (is_subclass < 0) {
                goto error;
            }
        }

        /* If the value was not an instance, or is not an instance
           whose class is (or is derived from) type, then use the
           value as an argument to instantiation of the type
           class.
        */
        if (!is_subclass) {
            TyObject *fixed_value = _TyErr_CreateException(type, value);
            if (fixed_value == NULL) {
                goto error;
            }
            Ty_SETREF(value, fixed_value);
        }
        /* If the class of the instance doesn't exactly match the
           class of the type, believe the instance.
        */
        else if (inclass != type) {
            Ty_SETREF(type, Ty_NewRef(inclass));
        }
    }
    *exc = type;
    *val = value;
    tstate->recursion_headroom--;
    return;

  error:
    Ty_DECREF(type);
    Ty_DECREF(value);
    recursion_depth++;
    if (recursion_depth == Ty_NORMALIZE_RECURSION_LIMIT) {
        _TyErr_SetString(tstate, TyExc_RecursionError,
                         "maximum recursion depth exceeded "
                         "while normalizing an exception");
    }
    /* If the new exception doesn't set a traceback and the old
       exception had a traceback, use the old traceback for the
       new exception.  It's better than nothing.
    */
    initial_tb = *tb;
    _TyErr_Fetch(tstate, exc, val, tb);
    assert(*exc != NULL);
    if (initial_tb != NULL) {
        if (*tb == NULL)
            *tb = initial_tb;
        else
            Ty_DECREF(initial_tb);
    }
    /* Abort when Ty_NORMALIZE_RECURSION_LIMIT has been exceeded, and the
       corresponding RecursionError could not be normalized, and the
       MemoryError raised when normalize this RecursionError could not be
       normalized. */
    if (recursion_depth >= Ty_NORMALIZE_RECURSION_LIMIT + 2) {
        if (TyErr_GivenExceptionMatches(*exc, TyExc_MemoryError)) {
            Ty_FatalError("Cannot recover from MemoryErrors "
                          "while normalizing exceptions.");
        }
        else {
            Ty_FatalError("Cannot recover from the recursive normalization "
                          "of an exception.");
        }
    }
    goto restart;
}


void
TyErr_NormalizeException(TyObject **exc, TyObject **val, TyObject **tb)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_NormalizeException(tstate, exc, val, tb);
}


TyObject *
_TyErr_GetRaisedException(TyThreadState *tstate) {
    TyObject *exc = tstate->current_exception;
    tstate->current_exception = NULL;
    return exc;
}

TyObject *
TyErr_GetRaisedException(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyErr_GetRaisedException(tstate);
}

void
_TyErr_Fetch(TyThreadState *tstate, TyObject **p_type, TyObject **p_value,
             TyObject **p_traceback)
{
    TyObject *exc = _TyErr_GetRaisedException(tstate);
    *p_value = exc;
    if (exc == NULL) {
        *p_type = NULL;
        *p_traceback = NULL;
    }
    else {
        *p_type = Ty_NewRef(Ty_TYPE(exc));
        *p_traceback = PyException_GetTraceback(exc);
    }
}


void
TyErr_Fetch(TyObject **p_type, TyObject **p_value, TyObject **p_traceback)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_Fetch(tstate, p_type, p_value, p_traceback);
}


void
_TyErr_Clear(TyThreadState *tstate)
{
    _TyErr_Restore(tstate, NULL, NULL, NULL);
}


void
TyErr_Clear(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_Clear(tstate);
}

static TyObject*
get_exc_type(TyObject *exc_value)  /* returns a strong ref */
{
    if (exc_value == NULL || exc_value == Ty_None) {
        return Ty_None;
    }
    else {
        assert(PyExceptionInstance_Check(exc_value));
        TyObject *type = PyExceptionInstance_Class(exc_value);
        assert(type != NULL);
        return Ty_NewRef(type);
    }
}

static TyObject*
get_exc_traceback(TyObject *exc_value)  /* returns a strong ref */
{
    if (exc_value == NULL || exc_value == Ty_None) {
        return Ty_None;
    }
    else {
        assert(PyExceptionInstance_Check(exc_value));
        TyObject *tb = PyException_GetTraceback(exc_value);
        return tb ? tb : Ty_None;
    }
}

void
_TyErr_GetExcInfo(TyThreadState *tstate,
                  TyObject **p_type, TyObject **p_value, TyObject **p_traceback)
{
    _TyErr_StackItem *exc_info = _TyErr_GetTopmostException(tstate);

    *p_type = get_exc_type(exc_info->exc_value);
    *p_value = Ty_XNewRef(exc_info->exc_value);
    *p_traceback = get_exc_traceback(exc_info->exc_value);
}

TyObject*
_TyErr_GetHandledException(TyThreadState *tstate)
{
    _TyErr_StackItem *exc_info = _TyErr_GetTopmostException(tstate);
    TyObject *exc = exc_info->exc_value;
    if (exc == NULL || exc == Ty_None) {
        return NULL;
    }
    return Ty_NewRef(exc);
}

TyObject*
TyErr_GetHandledException(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyErr_GetHandledException(tstate);
}

void
_TyErr_SetHandledException(TyThreadState *tstate, TyObject *exc)
{
    Ty_XSETREF(tstate->exc_info->exc_value, Ty_XNewRef(exc == Ty_None ? NULL : exc));
}

void
TyErr_SetHandledException(TyObject *exc)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_SetHandledException(tstate, exc);
}

void
TyErr_GetExcInfo(TyObject **p_type, TyObject **p_value, TyObject **p_traceback)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_GetExcInfo(tstate, p_type, p_value, p_traceback);
}

void
TyErr_SetExcInfo(TyObject *type, TyObject *value, TyObject *traceback)
{
    TyErr_SetHandledException(value);
    Ty_XDECREF(value);
    /* These args are no longer used, but we still need to steal a ref */
    Ty_XDECREF(type);
    Ty_XDECREF(traceback);
}


TyObject*
_TyErr_StackItemToExcInfoTuple(_TyErr_StackItem *err_info)
{
    TyObject *exc_value = err_info->exc_value;

    assert(exc_value == NULL ||
           exc_value == Ty_None ||
           PyExceptionInstance_Check(exc_value));

    TyObject *ret = TyTuple_New(3);
    if (ret == NULL) {
        return NULL;
    }

    TyObject *exc_type = get_exc_type(exc_value);
    TyObject *exc_traceback = get_exc_traceback(exc_value);

    TyTuple_SET_ITEM(ret, 0, exc_type ? exc_type : Ty_None);
    TyTuple_SET_ITEM(ret, 1, exc_value ? Ty_NewRef(exc_value) : Ty_None);
    TyTuple_SET_ITEM(ret, 2, exc_traceback ? exc_traceback : Ty_None);

    return ret;
}


/* Like TyErr_Restore(), but if an exception is already set,
   set the context associated with it.

   The caller is responsible for ensuring that this call won't create
   any cycles in the exception context chain. */
void
_TyErr_ChainExceptions(TyObject *typ, TyObject *val, TyObject *tb)
{
    if (typ == NULL)
        return;

    TyThreadState *tstate = _TyThreadState_GET();

    if (!PyExceptionClass_Check(typ)) {
        _TyErr_Format(tstate, TyExc_SystemError,
                      "_TyErr_ChainExceptions: "
                      "exception %R is not a BaseException subclass",
                      typ);
        return;
    }

    if (_TyErr_Occurred(tstate)) {
        _TyErr_NormalizeException(tstate, &typ, &val, &tb);
        if (tb != NULL) {
            PyException_SetTraceback(val, tb);
            Ty_DECREF(tb);
        }
        Ty_DECREF(typ);
        TyObject *exc2 = _TyErr_GetRaisedException(tstate);
        PyException_SetContext(exc2, val);
        _TyErr_SetRaisedException(tstate, exc2);
    }
    else {
        _TyErr_Restore(tstate, typ, val, tb);
    }
}

/* Like TyErr_SetRaisedException(), but if an exception is already set,
   set the context associated with it.

   The caller is responsible for ensuring that this call won't create
   any cycles in the exception context chain. */
void
_TyErr_ChainExceptions1Tstate(TyThreadState *tstate, TyObject *exc)
{
    if (exc == NULL) {
        return;
    }
    if (_TyErr_Occurred(tstate)) {
        TyObject *exc2 = _TyErr_GetRaisedException(tstate);
        PyException_SetContext(exc2, exc);
        _TyErr_SetRaisedException(tstate, exc2);
    }
    else {
        _TyErr_SetRaisedException(tstate, exc);
    }
}

void
_TyErr_ChainExceptions1(TyObject *exc)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_ChainExceptions1Tstate(tstate, exc);
}

/* If the current thread is handling an exception (exc_info is ), set this
   exception as the context of the current raised exception.

   This function can only be called when _TyErr_Occurred() is true.
   Also, this function won't create any cycles in the exception context
   chain to the extent that _TyErr_SetObject ensures this. */
void
_TyErr_ChainStackItem(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    assert(_TyErr_Occurred(tstate));

    _TyErr_StackItem *exc_info = tstate->exc_info;
    if (exc_info->exc_value == NULL || exc_info->exc_value == Ty_None) {
        return;
    }

    TyObject *exc = _TyErr_GetRaisedException(tstate);

    /* _TyErr_SetObject sets the context from TyThreadState. */
    _TyErr_SetObject(tstate, (TyObject *) Ty_TYPE(exc), exc);
    Ty_DECREF(exc);  // since _TyErr_Occurred was true
}

static TyObject *
_TyErr_FormatVFromCause(TyThreadState *tstate, TyObject *exception,
                        const char *format, va_list vargs)
{
    assert(_TyErr_Occurred(tstate));
    TyObject *exc = _TyErr_GetRaisedException(tstate);
    assert(!_TyErr_Occurred(tstate));
    _TyErr_FormatV(tstate, exception, format, vargs);
    TyObject *exc2 = _TyErr_GetRaisedException(tstate);
    PyException_SetCause(exc2, Ty_NewRef(exc));
    PyException_SetContext(exc2, Ty_NewRef(exc));
    Ty_DECREF(exc);
    _TyErr_SetRaisedException(tstate, exc2);
    return NULL;
}

TyObject *
_TyErr_FormatFromCauseTstate(TyThreadState *tstate, TyObject *exception,
                             const char *format, ...)
{
    va_list vargs;
    va_start(vargs, format);
    _TyErr_FormatVFromCause(tstate, exception, format, vargs);
    va_end(vargs);
    return NULL;
}

TyObject *
_TyErr_FormatFromCause(TyObject *exception, const char *format, ...)
{
    TyThreadState *tstate = _TyThreadState_GET();
    va_list vargs;
    va_start(vargs, format);
    _TyErr_FormatVFromCause(tstate, exception, format, vargs);
    va_end(vargs);
    return NULL;
}

/* Convenience functions to set a type error exception and return 0 */

int
TyErr_BadArgument(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_SetString(tstate, TyExc_TypeError,
                     "bad argument type for built-in operation");
    return 0;
}

TyObject *
TyErr_NoMemory(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyErr_NoMemory(tstate);
}

TyObject *
TyErr_SetFromErrnoWithFilenameObject(TyObject *exc, TyObject *filenameObject)
{
    return TyErr_SetFromErrnoWithFilenameObjects(exc, filenameObject, NULL);
}

TyObject *
TyErr_SetFromErrnoWithFilenameObjects(TyObject *exc, TyObject *filenameObject, TyObject *filenameObject2)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *message;
    TyObject *v, *args;
    int i = errno;
#ifdef MS_WINDOWS
    WCHAR *s_buf = NULL;
#endif /* Unix/Windows */

#ifdef EINTR
    if (i == EINTR && TyErr_CheckSignals())
        return NULL;
#endif

#ifndef MS_WINDOWS
    if (i != 0) {
        const char *s = strerror(i);
        message = TyUnicode_DecodeLocale(s, "surrogateescape");
    }
    else {
        /* Sometimes errno didn't get set */
        message = TyUnicode_FromString("Error");
    }
#else
    if (i == 0)
        message = TyUnicode_FromString("Error"); /* Sometimes errno didn't get set */
    else
    {
        /* Note that the Win32 errors do not lineup with the
           errno error.  So if the error is in the MSVC error
           table, we use it, otherwise we assume it really _is_
           a Win32 error code
        */
        if (i > 0 && i < _sys_nerr) {
            message = TyUnicode_FromString(_sys_errlist[i]);
        }
        else {
            int len = FormatMessageW(
                FORMAT_MESSAGE_ALLOCATE_BUFFER |
                FORMAT_MESSAGE_FROM_SYSTEM |
                FORMAT_MESSAGE_IGNORE_INSERTS,
                NULL,                   /* no message source */
                i,
                MAKELANGID(LANG_NEUTRAL,
                           SUBLANG_DEFAULT),
                           /* Default language */
                (LPWSTR) &s_buf,
                0,                      /* size not used */
                NULL);                  /* no args */
            if (len==0) {
                /* Only ever seen this in out-of-mem
                   situations */
                s_buf = NULL;
                message = TyUnicode_FromFormat("Windows Error 0x%x", i);
            } else {
                /* remove trailing cr/lf and dots */
                while (len > 0 && (s_buf[len-1] <= L' ' || s_buf[len-1] == L'.'))
                    s_buf[--len] = L'\0';
                message = TyUnicode_FromWideChar(s_buf, len);
            }
        }
    }
#endif /* Unix/Windows */

    if (message == NULL)
    {
#ifdef MS_WINDOWS
        LocalFree(s_buf);
#endif
        return NULL;
    }

    if (filenameObject != NULL) {
        if (filenameObject2 != NULL)
            args = Ty_BuildValue("(iOOiO)", i, message, filenameObject, 0, filenameObject2);
        else
            args = Ty_BuildValue("(iOO)", i, message, filenameObject);
    } else {
        assert(filenameObject2 == NULL);
        args = Ty_BuildValue("(iO)", i, message);
    }
    Ty_DECREF(message);

    if (args != NULL) {
        v = PyObject_Call(exc, args, NULL);
        Ty_DECREF(args);
        if (v != NULL) {
            _TyErr_SetObject(tstate, (TyObject *) Ty_TYPE(v), v);
            Ty_DECREF(v);
        }
    }
#ifdef MS_WINDOWS
    LocalFree(s_buf);
#endif
    return NULL;
}

TyObject *
TyErr_SetFromErrnoWithFilename(TyObject *exc, const char *filename)
{
    TyObject *name = NULL;
    if (filename) {
        int i = errno;
        name = TyUnicode_DecodeFSDefault(filename);
        if (name == NULL) {
            return NULL;
        }
        errno = i;
    }
    TyObject *result = TyErr_SetFromErrnoWithFilenameObjects(exc, name, NULL);
    Ty_XDECREF(name);
    return result;
}

TyObject *
TyErr_SetFromErrno(TyObject *exc)
{
    return TyErr_SetFromErrnoWithFilenameObjects(exc, NULL, NULL);
}

#ifdef MS_WINDOWS
/* Windows specific error code handling */
TyObject *TyErr_SetExcFromWindowsErrWithFilenameObject(
    TyObject *exc,
    int ierr,
    TyObject *filenameObject)
{
    return TyErr_SetExcFromWindowsErrWithFilenameObjects(exc, ierr,
        filenameObject, NULL);
}

TyObject *TyErr_SetExcFromWindowsErrWithFilenameObjects(
    TyObject *exc,
    int ierr,
    TyObject *filenameObject,
    TyObject *filenameObject2)
{
    TyThreadState *tstate = _TyThreadState_GET();
    int len;
    WCHAR *s_buf = NULL; /* Free via LocalFree */
    TyObject *message;
    TyObject *args, *v;

    DWORD err = (DWORD)ierr;
    if (err==0) {
        err = GetLastError();
    }

    len = FormatMessageW(
        /* Error API error */
        FORMAT_MESSAGE_ALLOCATE_BUFFER |
        FORMAT_MESSAGE_FROM_SYSTEM |
        FORMAT_MESSAGE_IGNORE_INSERTS,
        NULL,           /* no message source */
        err,
        MAKELANGID(LANG_NEUTRAL,
        SUBLANG_DEFAULT), /* Default language */
        (LPWSTR) &s_buf,
        0,              /* size not used */
        NULL);          /* no args */
    if (len==0) {
        /* Only seen this in out of mem situations */
        message = TyUnicode_FromFormat("Windows Error 0x%x", err);
        s_buf = NULL;
    } else {
        /* remove trailing cr/lf and dots */
        while (len > 0 && (s_buf[len-1] <= L' ' || s_buf[len-1] == L'.'))
            s_buf[--len] = L'\0';
        message = TyUnicode_FromWideChar(s_buf, len);
    }

    if (message == NULL)
    {
        LocalFree(s_buf);
        return NULL;
    }

    if (filenameObject == NULL) {
        assert(filenameObject2 == NULL);
        filenameObject = filenameObject2 = Ty_None;
    }
    else if (filenameObject2 == NULL)
        filenameObject2 = Ty_None;
    /* This is the constructor signature for OSError.
       The POSIX translation will be figured out by the constructor. */
    args = Ty_BuildValue("(iOOiO)", 0, message, filenameObject, err, filenameObject2);
    Ty_DECREF(message);

    if (args != NULL) {
        v = PyObject_Call(exc, args, NULL);
        Ty_DECREF(args);
        if (v != NULL) {
            _TyErr_SetObject(tstate, (TyObject *) Ty_TYPE(v), v);
            Ty_DECREF(v);
        }
    }
    LocalFree(s_buf);
    return NULL;
}

TyObject *TyErr_SetExcFromWindowsErrWithFilename(
    TyObject *exc,
    int ierr,
    const char *filename)
{
    TyObject *name = NULL;
    if (filename) {
        if ((DWORD)ierr == 0) {
            ierr = (int)GetLastError();
        }
        name = TyUnicode_DecodeFSDefault(filename);
        if (name == NULL) {
            return NULL;
        }
    }
    TyObject *ret = TyErr_SetExcFromWindowsErrWithFilenameObjects(exc,
                                                                 ierr,
                                                                 name,
                                                                 NULL);
    Ty_XDECREF(name);
    return ret;
}

TyObject *TyErr_SetExcFromWindowsErr(TyObject *exc, int ierr)
{
    return TyErr_SetExcFromWindowsErrWithFilename(exc, ierr, NULL);
}

TyObject *TyErr_SetFromWindowsErr(int ierr)
{
    return TyErr_SetExcFromWindowsErrWithFilename(TyExc_OSError,
                                                  ierr, NULL);
}

TyObject *TyErr_SetFromWindowsErrWithFilename(
    int ierr,
    const char *filename)
{
    TyObject *name = NULL;
    if (filename) {
        if ((DWORD)ierr == 0) {
            ierr = (int)GetLastError();
        }
        name = TyUnicode_DecodeFSDefault(filename);
        if (name == NULL) {
            return NULL;
        }
    }
    TyObject *result = TyErr_SetExcFromWindowsErrWithFilenameObjects(
                                                  TyExc_OSError,
                                                  ierr, name, NULL);
    Ty_XDECREF(name);
    return result;
}

#endif /* MS_WINDOWS */

static TyObject *
new_importerror(
    TyThreadState *tstate, TyObject *exctype, TyObject *msg,
    TyObject *name, TyObject *path, TyObject* from_name)
{
    TyObject *exc = NULL;
    TyObject *kwargs = NULL;

    int issubclass = PyObject_IsSubclass(exctype, TyExc_ImportError);
    if (issubclass < 0) {
        return NULL;
    }
    else if (!issubclass) {
        _TyErr_SetString(tstate, TyExc_TypeError,
                         "expected a subclass of ImportError");
        return NULL;
    }

    if (msg == NULL) {
        _TyErr_SetString(tstate, TyExc_TypeError,
                         "expected a message argument");
        return NULL;
    }

    if (name == NULL) {
        name = Ty_None;
    }
    if (path == NULL) {
        path = Ty_None;
    }
    if (from_name == NULL) {
        from_name = Ty_None;
    }

    kwargs = TyDict_New();
    if (kwargs == NULL) {
        return NULL;
    }
    if (TyDict_SetItemString(kwargs, "name", name) < 0) {
        goto finally;
    }
    if (TyDict_SetItemString(kwargs, "path", path) < 0) {
        goto finally;
    }
    if (TyDict_SetItemString(kwargs, "name_from", from_name) < 0) {
        goto finally;
    }
    exc = PyObject_VectorcallDict(exctype, &msg, 1, kwargs);

finally:
    Ty_DECREF(kwargs);
    return exc;
}

static TyObject *
_TyErr_SetImportErrorSubclassWithNameFrom(
    TyObject *exception, TyObject *msg,
    TyObject *name, TyObject *path, TyObject* from_name)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *error = new_importerror(
                        tstate, exception, msg, name, path, from_name);
    if (error != NULL) {
        _TyErr_SetObject(tstate, (TyObject *)Ty_TYPE(error), error);
        Ty_DECREF(error);
    }
    return NULL;
}


TyObject *
TyErr_SetImportErrorSubclass(TyObject *exception, TyObject *msg,
    TyObject *name, TyObject *path)
{
    return _TyErr_SetImportErrorSubclassWithNameFrom(exception, msg, name, path, NULL);
}

TyObject *
_TyErr_SetImportErrorWithNameFrom(TyObject *msg, TyObject *name, TyObject *path, TyObject* from_name)
{
    return _TyErr_SetImportErrorSubclassWithNameFrom(TyExc_ImportError, msg, name, path, from_name);
}

TyObject *
TyErr_SetImportError(TyObject *msg, TyObject *name, TyObject *path)
{
    return TyErr_SetImportErrorSubclass(TyExc_ImportError, msg, name, path);
}

int
_TyErr_SetModuleNotFoundError(TyObject *name)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (name == NULL) {
        _TyErr_SetString(tstate, TyExc_TypeError, "expected a name argument");
        return -1;
    }
    TyObject *msg = TyUnicode_FromFormat("%S module not found", name);
    if (msg == NULL) {
        return -1;
    }
    TyObject *exctype = TyExc_ModuleNotFoundError;
    TyObject *exc = new_importerror(tstate, exctype, msg, name, NULL, NULL);
    Ty_DECREF(msg);
    if (exc == NULL) {
        return -1;
    }
    _TyErr_SetObject(tstate, exctype, exc);
    Ty_DECREF(exc);
    return 0;
}

void
_TyErr_BadInternalCall(const char *filename, int lineno)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_Format(tstate, TyExc_SystemError,
                  "%s:%d: bad argument to internal function",
                  filename, lineno);
}

/* Remove the preprocessor macro for TyErr_BadInternalCall() so that we can
   export the entry point for existing object code: */
#undef TyErr_BadInternalCall
void
TyErr_BadInternalCall(void)
{
    assert(0 && "bad argument to internal function");
    TyThreadState *tstate = _TyThreadState_GET();
    _TyErr_SetString(tstate, TyExc_SystemError,
                     "bad argument to internal function");
}
#define TyErr_BadInternalCall() _TyErr_BadInternalCall(__FILE__, __LINE__)


TyObject *
_TyErr_FormatV(TyThreadState *tstate, TyObject *exception,
               const char *format, va_list vargs)
{
    TyObject* string;

    /* Issue #23571: TyUnicode_FromFormatV() must not be called with an
       exception set, it calls arbitrary Python code like PyObject_Repr() */
    _TyErr_Clear(tstate);

    string = TyUnicode_FromFormatV(format, vargs);
    if (string != NULL) {
        _TyErr_SetObject(tstate, exception, string);
        Ty_DECREF(string);
    }
    return NULL;
}


TyObject *
TyErr_FormatV(TyObject *exception, const char *format, va_list vargs)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return _TyErr_FormatV(tstate, exception, format, vargs);
}


TyObject *
_TyErr_Format(TyThreadState *tstate, TyObject *exception,
              const char *format, ...)
{
    va_list vargs;
    va_start(vargs, format);
    _TyErr_FormatV(tstate, exception, format, vargs);
    va_end(vargs);
    return NULL;
}


TyObject *
TyErr_Format(TyObject *exception, const char *format, ...)
{
    TyThreadState *tstate = _TyThreadState_GET();
    va_list vargs;
    va_start(vargs, format);
    _TyErr_FormatV(tstate, exception, format, vargs);
    va_end(vargs);
    return NULL;
}


/* Adds a note to the current exception (if any) */
void
_TyErr_FormatNote(const char *format, ...)
{
    TyObject *exc = TyErr_GetRaisedException();
    if (exc == NULL) {
        return;
    }
    va_list vargs;
    va_start(vargs, format);
    TyObject *note = TyUnicode_FromFormatV(format, vargs);
    va_end(vargs);
    if (note == NULL) {
        goto error;
    }
    int res = _PyException_AddNote(exc, note);
    Ty_DECREF(note);
    if (res < 0) {
        goto error;
    }
    TyErr_SetRaisedException(exc);
    return;
error:
    _TyErr_ChainExceptions1(exc);
}


TyObject *
TyErr_NewException(const char *name, TyObject *base, TyObject *dict)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *modulename = NULL;
    TyObject *mydict = NULL;
    TyObject *bases = NULL;
    TyObject *result = NULL;

    const char *dot = strrchr(name, '.');
    if (dot == NULL) {
        _TyErr_SetString(tstate, TyExc_SystemError,
                         "TyErr_NewException: name must be module.class");
        return NULL;
    }
    if (base == NULL) {
        base = TyExc_Exception;
    }
    if (dict == NULL) {
        dict = mydict = TyDict_New();
        if (dict == NULL)
            goto failure;
    }

    int r = TyDict_Contains(dict, &_Ty_ID(__module__));
    if (r < 0) {
        goto failure;
    }
    if (r == 0) {
        modulename = TyUnicode_FromStringAndSize(name,
                                             (Ty_ssize_t)(dot-name));
        if (modulename == NULL)
            goto failure;
        if (TyDict_SetItem(dict, &_Ty_ID(__module__), modulename) != 0)
            goto failure;
    }
    if (TyTuple_Check(base)) {
        bases = Ty_NewRef(base);
    } else {
        bases = TyTuple_Pack(1, base);
        if (bases == NULL)
            goto failure;
    }
    /* Create a real class. */
    result = PyObject_CallFunction((TyObject *)&TyType_Type, "sOO",
                                   dot+1, bases, dict);
  failure:
    Ty_XDECREF(bases);
    Ty_XDECREF(mydict);
    Ty_XDECREF(modulename);
    return result;
}


/* Create an exception with docstring */
TyObject *
TyErr_NewExceptionWithDoc(const char *name, const char *doc,
                          TyObject *base, TyObject *dict)
{
    int result;
    TyObject *ret = NULL;
    TyObject *mydict = NULL; /* points to the dict only if we create it */
    TyObject *docobj;

    if (dict == NULL) {
        dict = mydict = TyDict_New();
        if (dict == NULL) {
            return NULL;
        }
    }

    if (doc != NULL) {
        docobj = TyUnicode_FromString(doc);
        if (docobj == NULL)
            goto failure;
        result = TyDict_SetItemString(dict, "__doc__", docobj);
        Ty_DECREF(docobj);
        if (result < 0)
            goto failure;
    }

    ret = TyErr_NewException(name, base, dict);
  failure:
    Ty_XDECREF(mydict);
    return ret;
}


TyDoc_STRVAR(UnraisableHookArgs__doc__,
"UnraisableHookArgs\n\
\n\
Type used to pass arguments to sys.unraisablehook.");

static TyTypeObject UnraisableHookArgsType;

static TyStructSequence_Field UnraisableHookArgs_fields[] = {
    {"exc_type", "Exception type"},
    {"exc_value", "Exception value"},
    {"exc_traceback", "Exception traceback"},
    {"err_msg", "Error message"},
    {"object", "Object causing the exception"},
    {0}
};

static TyStructSequence_Desc UnraisableHookArgs_desc = {
    .name = "UnraisableHookArgs",
    .doc = UnraisableHookArgs__doc__,
    .fields = UnraisableHookArgs_fields,
    .n_in_sequence = 5
};


TyStatus
_TyErr_InitTypes(TyInterpreterState *interp)
{
    if (_PyStructSequence_InitBuiltin(interp, &UnraisableHookArgsType,
                                      &UnraisableHookArgs_desc) < 0)
    {
        return _TyStatus_ERR("failed to initialize UnraisableHookArgs type");
    }
    return _TyStatus_OK();
}


void
_TyErr_FiniTypes(TyInterpreterState *interp)
{
    _PyStructSequence_FiniBuiltin(interp, &UnraisableHookArgsType);
}


static TyObject *
make_unraisable_hook_args(TyThreadState *tstate, TyObject *exc_type,
                          TyObject *exc_value, TyObject *exc_tb,
                          TyObject *err_msg, TyObject *obj)
{
    TyObject *args = TyStructSequence_New(&UnraisableHookArgsType);
    if (args == NULL) {
        return NULL;
    }

    Ty_ssize_t pos = 0;
#define ADD_ITEM(exc_type) \
        do { \
            if (exc_type == NULL) { \
                exc_type = Ty_None; \
            } \
            TyStructSequence_SET_ITEM(args, pos++, Ty_NewRef(exc_type)); \
        } while (0)


    ADD_ITEM(exc_type);
    ADD_ITEM(exc_value);
    ADD_ITEM(exc_tb);
    ADD_ITEM(err_msg);
    ADD_ITEM(obj);
#undef ADD_ITEM

    if (_TyErr_Occurred(tstate)) {
        Ty_DECREF(args);
        return NULL;
    }
    return args;
}



/* Default implementation of sys.unraisablehook.

   It can be called to log the exception of a custom sys.unraisablehook.

   Do nothing if sys.stderr attribute doesn't exist or is set to None. */
static int
write_unraisable_exc_file(TyThreadState *tstate, TyObject *exc_type,
                          TyObject *exc_value, TyObject *exc_tb,
                          TyObject *err_msg, TyObject *obj, TyObject *file)
{
    if (obj != NULL && obj != Ty_None) {
        if (err_msg != NULL && err_msg != Ty_None) {
            if (TyFile_WriteObject(err_msg, file, Ty_PRINT_RAW) < 0) {
                return -1;
            }
            if (TyFile_WriteString(": ", file) < 0) {
                return -1;
            }
        }
        else {
            if (TyFile_WriteString("Exception ignored in: ", file) < 0) {
                return -1;
            }
        }

        if (TyFile_WriteObject(obj, file, 0) < 0) {
            _TyErr_Clear(tstate);
            if (TyFile_WriteString("<object repr() failed>", file) < 0) {
                return -1;
            }
        }
        if (TyFile_WriteString("\n", file) < 0) {
            return -1;
        }
    }
    else if (err_msg != NULL && err_msg != Ty_None) {
        if (TyFile_WriteObject(err_msg, file, Ty_PRINT_RAW) < 0) {
            return -1;
        }
        if (TyFile_WriteString(":\n", file) < 0) {
            return -1;
        }
    }

    if (exc_tb != NULL && exc_tb != Ty_None) {
        if (PyTraceBack_Print(exc_tb, file) < 0) {
            /* continue even if writing the traceback failed */
            _TyErr_Clear(tstate);
        }
    }

    if (exc_type == NULL || exc_type == Ty_None) {
        return -1;
    }

    assert(PyExceptionClass_Check(exc_type));

    TyObject *modulename = PyObject_GetAttr(exc_type, &_Ty_ID(__module__));
    if (modulename == NULL || !TyUnicode_Check(modulename)) {
        Ty_XDECREF(modulename);
        _TyErr_Clear(tstate);
        if (TyFile_WriteString("<unknown>", file) < 0) {
            return -1;
        }
    }
    else {
        if (!_TyUnicode_Equal(modulename, &_Ty_ID(builtins)) &&
            !_TyUnicode_Equal(modulename, &_Ty_ID(__main__))) {
            if (TyFile_WriteObject(modulename, file, Ty_PRINT_RAW) < 0) {
                Ty_DECREF(modulename);
                return -1;
            }
            Ty_DECREF(modulename);
            if (TyFile_WriteString(".", file) < 0) {
                return -1;
            }
        }
        else {
            Ty_DECREF(modulename);
        }
    }

    TyObject *qualname = TyType_GetQualName((TyTypeObject *)exc_type);
    if (qualname == NULL || !TyUnicode_Check(qualname)) {
        Ty_XDECREF(qualname);
        _TyErr_Clear(tstate);
        if (TyFile_WriteString("<unknown>", file) < 0) {
            return -1;
        }
    }
    else {
        if (TyFile_WriteObject(qualname, file, Ty_PRINT_RAW) < 0) {
            Ty_DECREF(qualname);
            return -1;
        }
        Ty_DECREF(qualname);
    }

    if (exc_value && exc_value != Ty_None) {
        if (TyFile_WriteString(": ", file) < 0) {
            return -1;
        }
        if (TyFile_WriteObject(exc_value, file, Ty_PRINT_RAW) < 0) {
            _TyErr_Clear(tstate);
            if (TyFile_WriteString("<exception str() failed>", file) < 0) {
                return -1;
            }
        }
    }

    if (TyFile_WriteString("\n", file) < 0) {
        return -1;
    }

    /* Explicitly call file.flush() */
    if (_PyFile_Flush(file) < 0) {
        return -1;
    }

    return 0;
}


static int
write_unraisable_exc(TyThreadState *tstate, TyObject *exc_type,
                     TyObject *exc_value, TyObject *exc_tb, TyObject *err_msg,
                     TyObject *obj)
{
    TyObject *file;
    if (_TySys_GetOptionalAttr(&_Ty_ID(stderr), &file) < 0) {
        return -1;
    }
    if (file == NULL || file == Ty_None) {
        Ty_XDECREF(file);
        return 0;
    }

    int res = write_unraisable_exc_file(tstate, exc_type, exc_value, exc_tb,
                                        err_msg, obj, file);
    Ty_DECREF(file);

    return res;
}


TyObject*
_TyErr_WriteUnraisableDefaultHook(TyObject *args)
{
    TyThreadState *tstate = _TyThreadState_GET();

    if (!Ty_IS_TYPE(args, &UnraisableHookArgsType)) {
        _TyErr_SetString(tstate, TyExc_TypeError,
                         "sys.unraisablehook argument type "
                         "must be UnraisableHookArgs");
        return NULL;
    }

    /* Borrowed references */
    TyObject *exc_type = TyStructSequence_GET_ITEM(args, 0);
    TyObject *exc_value = TyStructSequence_GET_ITEM(args, 1);
    TyObject *exc_tb = TyStructSequence_GET_ITEM(args, 2);
    TyObject *err_msg = TyStructSequence_GET_ITEM(args, 3);
    TyObject *obj = TyStructSequence_GET_ITEM(args, 4);

    if (write_unraisable_exc(tstate, exc_type, exc_value, exc_tb, err_msg, obj) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


/* Call sys.unraisablehook().

   This function can be used when an exception has occurred but there is no way
   for Python to handle it. For example, when a destructor raises an exception
   or during garbage collection (gc.collect()).

   If format is non-NULL, the error message is formatted using format and
   variable arguments as in TyUnicode_FromFormat().
   Otherwise, use "Exception ignored in" error message.

   An exception must be set when calling this function. */

static void
format_unraisable_v(const char *format, va_list va, TyObject *obj)
{
    const char *err_msg_str;
    TyThreadState *tstate = _TyThreadState_GET();
    _Ty_EnsureTstateNotNULL(tstate);

    TyObject *err_msg = NULL;
    TyObject *exc_type, *exc_value, *exc_tb;
    _TyErr_Fetch(tstate, &exc_type, &exc_value, &exc_tb);

    assert(exc_type != NULL);

    if (exc_type == NULL) {
        /* sys.unraisablehook requires that at least exc_type is set */
        goto default_hook;
    }

    if (exc_tb == NULL) {
        PyFrameObject *frame = TyThreadState_GetFrame(tstate);
        if (frame != NULL) {
            exc_tb = _PyTraceBack_FromFrame(NULL, frame);
            if (exc_tb == NULL) {
                _TyErr_Clear(tstate);
            }
            Ty_DECREF(frame);
        }
    }

    _TyErr_NormalizeException(tstate, &exc_type, &exc_value, &exc_tb);

    if (exc_tb != NULL && exc_tb != Ty_None && PyTraceBack_Check(exc_tb)) {
        if (PyException_SetTraceback(exc_value, exc_tb) < 0) {
            _TyErr_Clear(tstate);
        }
    }

    if (format != NULL) {
        err_msg = TyUnicode_FromFormatV(format, va);
        if (err_msg == NULL) {
            TyErr_Clear();
        }
    }

    TyObject *hook_args = make_unraisable_hook_args(
        tstate, exc_type, exc_value, exc_tb, err_msg, obj);
    if (hook_args == NULL) {
        err_msg_str = ("Exception ignored while building "
                       "sys.unraisablehook arguments");
        goto error;
    }

    TyObject *hook;
    if (_TySys_GetOptionalAttr(&_Ty_ID(unraisablehook), &hook) < 0) {
        Ty_DECREF(hook_args);
        err_msg_str = NULL;
        obj = NULL;
        goto error;
    }
    if (hook == NULL) {
        Ty_DECREF(hook_args);
        goto default_hook;
    }

    if (_TySys_Audit(tstate, "sys.unraisablehook", "OO", hook, hook_args) < 0) {
        Ty_DECREF(hook);
        Ty_DECREF(hook_args);
        err_msg_str = "Exception ignored in audit hook";
        obj = NULL;
        goto error;
    }

    if (hook == Ty_None) {
        Ty_DECREF(hook);
        Ty_DECREF(hook_args);
        goto default_hook;
    }

    TyObject *res = PyObject_CallOneArg(hook, hook_args);
    Ty_DECREF(hook);
    Ty_DECREF(hook_args);
    if (res != NULL) {
        Ty_DECREF(res);
        goto done;
    }

    /* sys.unraisablehook failed: log its error using default hook */
    obj = hook;
    err_msg_str = NULL;

error:
    /* err_msg_str and obj have been updated and we have a new exception */
    Ty_XSETREF(err_msg, TyUnicode_FromString(err_msg_str ?
        err_msg_str : "Exception ignored in sys.unraisablehook"));
    Ty_XDECREF(exc_type);
    Ty_XDECREF(exc_value);
    Ty_XDECREF(exc_tb);
    _TyErr_Fetch(tstate, &exc_type, &exc_value, &exc_tb);

default_hook:
    /* Call the default unraisable hook (ignore failure) */
    (void)write_unraisable_exc(tstate, exc_type, exc_value, exc_tb,
                               err_msg, obj);

done:
    Ty_XDECREF(exc_type);
    Ty_XDECREF(exc_value);
    Ty_XDECREF(exc_tb);
    Ty_XDECREF(err_msg);
    _TyErr_Clear(tstate); /* Just in case */
}

void
TyErr_FormatUnraisable(const char *format, ...)
{
    va_list va;

    va_start(va, format);
    format_unraisable_v(format, va, NULL);
    va_end(va);
}

static void
format_unraisable(TyObject *obj, const char *format, ...)
{
    va_list va;

    va_start(va, format);
    format_unraisable_v(format, va, obj);
    va_end(va);
}

void
TyErr_WriteUnraisable(TyObject *obj)
{
    format_unraisable(obj, NULL);
}


void
TyErr_SyntaxLocation(const char *filename, int lineno)
{
    TyErr_SyntaxLocationEx(filename, lineno, -1);
}


/* Set file and line information for the current exception.
   If the exception is not a SyntaxError, also sets additional attributes
   to make printing of exceptions believe it is a syntax error. */

static void
TyErr_SyntaxLocationObjectEx(TyObject *filename, int lineno, int col_offset,
                             int end_lineno, int end_col_offset)
{
    TyThreadState *tstate = _TyThreadState_GET();

    /* add attributes for the line number and filename for the error */
    TyObject *exc = _TyErr_GetRaisedException(tstate);
    /* XXX check that it is, indeed, a syntax error. It might not
     * be, though. */
    TyObject *tmp = TyLong_FromLong(lineno);
    if (tmp == NULL) {
        _TyErr_Clear(tstate);
    }
    else {
        if (PyObject_SetAttr(exc, &_Ty_ID(lineno), tmp)) {
            _TyErr_Clear(tstate);
        }
        Ty_DECREF(tmp);
    }
    tmp = NULL;
    if (col_offset >= 0) {
        tmp = TyLong_FromLong(col_offset);
        if (tmp == NULL) {
            _TyErr_Clear(tstate);
        }
    }
    if (PyObject_SetAttr(exc, &_Ty_ID(offset), tmp ? tmp : Ty_None)) {
        _TyErr_Clear(tstate);
    }
    Ty_XDECREF(tmp);

    tmp = NULL;
    if (end_lineno >= 0) {
        tmp = TyLong_FromLong(end_lineno);
        if (tmp == NULL) {
            _TyErr_Clear(tstate);
        }
    }
    if (PyObject_SetAttr(exc, &_Ty_ID(end_lineno), tmp ? tmp : Ty_None)) {
        _TyErr_Clear(tstate);
    }
    Ty_XDECREF(tmp);

    tmp = NULL;
    if (end_col_offset >= 0) {
        tmp = TyLong_FromLong(end_col_offset);
        if (tmp == NULL) {
            _TyErr_Clear(tstate);
        }
    }
    if (PyObject_SetAttr(exc, &_Ty_ID(end_offset), tmp ? tmp : Ty_None)) {
        _TyErr_Clear(tstate);
    }
    Ty_XDECREF(tmp);

    tmp = NULL;
    if (filename != NULL) {
        if (PyObject_SetAttr(exc, &_Ty_ID(filename), filename)) {
            _TyErr_Clear(tstate);
        }

        tmp = TyErr_ProgramTextObject(filename, lineno);
        if (tmp) {
            if (PyObject_SetAttr(exc, &_Ty_ID(text), tmp)) {
                _TyErr_Clear(tstate);
            }
            Ty_DECREF(tmp);
        }
        else {
            _TyErr_Clear(tstate);
        }
    }
    if ((TyObject *)Ty_TYPE(exc) != TyExc_SyntaxError) {
        int rc = PyObject_HasAttrWithError(exc, &_Ty_ID(msg));
        if (rc < 0) {
            _TyErr_Clear(tstate);
        }
        else if (!rc) {
            tmp = PyObject_Str(exc);
            if (tmp) {
                if (PyObject_SetAttr(exc, &_Ty_ID(msg), tmp)) {
                    _TyErr_Clear(tstate);
                }
                Ty_DECREF(tmp);
            }
            else {
                _TyErr_Clear(tstate);
            }
        }

        rc = PyObject_HasAttrWithError(exc, &_Ty_ID(print_file_and_line));
        if (rc < 0) {
            _TyErr_Clear(tstate);
        }
        else if (!rc) {
            if (PyObject_SetAttr(exc, &_Ty_ID(print_file_and_line), Ty_None)) {
                _TyErr_Clear(tstate);
            }
        }
    }
    _TyErr_SetRaisedException(tstate, exc);
}

void
TyErr_SyntaxLocationObject(TyObject *filename, int lineno, int col_offset) {
    TyErr_SyntaxLocationObjectEx(filename, lineno, col_offset, lineno, -1);
}

void
TyErr_RangedSyntaxLocationObject(TyObject *filename, int lineno, int col_offset,
                                 int end_lineno, int end_col_offset) {
    TyErr_SyntaxLocationObjectEx(filename, lineno, col_offset, end_lineno, end_col_offset);
}

void
TyErr_SyntaxLocationEx(const char *filename, int lineno, int col_offset)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *fileobj;
    if (filename != NULL) {
        fileobj = TyUnicode_DecodeFSDefault(filename);
        if (fileobj == NULL) {
            _TyErr_Clear(tstate);
        }
    }
    else {
        fileobj = NULL;
    }
    TyErr_SyntaxLocationObject(fileobj, lineno, col_offset);
    Ty_XDECREF(fileobj);
}

/* Raises a SyntaxError.
 * If something goes wrong, a different exception may be raised.
 */
void
_TyErr_RaiseSyntaxError(TyObject *msg, TyObject *filename, int lineno, int col_offset,
                        int end_lineno, int end_col_offset)
{
    TyObject *text = TyErr_ProgramTextObject(filename, lineno);
    if (text == NULL) {
        text = Ty_NewRef(Ty_None);
    }
    TyObject *args = Ty_BuildValue("O(OiiOii)", msg, filename,
                                   lineno, col_offset, text,
                                   end_lineno, end_col_offset);
    if (args == NULL) {
        goto exit;
    }
    TyErr_SetObject(TyExc_SyntaxError, args);
 exit:
    Ty_DECREF(text);
    Ty_XDECREF(args);
}

/* Emits a SyntaxWarning and returns 0 on success.
   If a SyntaxWarning is raised as error, replaces it with a SyntaxError
   and returns -1.
*/
int
_TyErr_EmitSyntaxWarning(TyObject *msg, TyObject *filename, int lineno, int col_offset,
                         int end_lineno, int end_col_offset)
{
    if (_TyErr_WarnExplicitObjectWithContext(TyExc_SyntaxWarning, msg,
                                             filename, lineno) < 0)
    {
        if (TyErr_ExceptionMatches(TyExc_SyntaxWarning)) {
            /* Replace the SyntaxWarning exception with a SyntaxError
               to get a more accurate error report */
            TyErr_Clear();
            _TyErr_RaiseSyntaxError(msg, filename, lineno, col_offset,
                                    end_lineno, end_col_offset);
        }
        return -1;
    }
    return 0;
}

/* Attempt to load the line of text that the exception refers to.  If it
   fails, it will return NULL but will not set an exception.

   XXX The functionality of this function is quite similar to the
   functionality in tb_displayline() in traceback.c. */

static TyObject *
err_programtext(FILE *fp, int lineno, const char* encoding)
{
    char linebuf[1000];
    size_t line_size = 0;

    for (int i = 0; i < lineno; ) {
        line_size = 0;
        if (_Ty_UniversalNewlineFgetsWithSize(linebuf, sizeof(linebuf),
                                              fp, NULL, &line_size) == NULL)
        {
            /* Error or EOF. */
            return NULL;
        }
        /* fgets read *something*; if it didn't fill the
           whole buffer, it must have found a newline
           or hit the end of the file; if the last character is \n,
           it obviously found a newline; else we haven't
           yet seen a newline, so must continue */
        if (i + 1 < lineno
            && line_size == sizeof(linebuf) - 1
            && linebuf[sizeof(linebuf) - 2] != '\n')
        {
            continue;
        }
        i++;
    }

    const char *line = linebuf;
    /* Skip BOM. */
    if (lineno == 1 && line_size >= 3 && memcmp(line, "\xef\xbb\xbf", 3) == 0) {
        line += 3;
        line_size -= 3;
    }
    TyObject *res = TyUnicode_Decode(line, line_size, encoding, "replace");
    if (res == NULL) {
        TyErr_Clear();
    }
    return res;
}

TyObject *
TyErr_ProgramText(const char *filename, int lineno)
{
    if (filename == NULL) {
        return NULL;
    }

    TyObject *filename_obj = TyUnicode_DecodeFSDefault(filename);
    if (filename_obj == NULL) {
        TyErr_Clear();
        return NULL;
    }
    TyObject *res = TyErr_ProgramTextObject(filename_obj, lineno);
    Ty_DECREF(filename_obj);
    return res;
}

/* Function from Parser/tokenizer/file_tokenizer.c */
extern char* _PyTokenizer_FindEncodingFilename(int, TyObject *);

TyObject *
_TyErr_ProgramDecodedTextObject(TyObject *filename, int lineno, const char* encoding)
{
    char *found_encoding = NULL;
    if (filename == NULL || lineno <= 0) {
        return NULL;
    }

    FILE *fp = Ty_fopen(filename, "r" PY_STDIOTEXTMODE);
    if (fp == NULL) {
        TyErr_Clear();
        return NULL;
    }
    if (encoding == NULL) {
        int fd = fileno(fp);
        found_encoding = _PyTokenizer_FindEncodingFilename(fd, filename);
        encoding = found_encoding;
        if (encoding == NULL) {
            TyErr_Clear();
            encoding = "utf-8";
        }
        /* Reset position */
        if (lseek(fd, 0, SEEK_SET) == (off_t)-1) {
            fclose(fp);
            TyMem_Free(found_encoding);
            return NULL;
        }
    }
    TyObject *res = err_programtext(fp, lineno, encoding);
    fclose(fp);
    TyMem_Free(found_encoding);
    return res;
}

TyObject *
TyErr_ProgramTextObject(TyObject *filename, int lineno)
{
    return _TyErr_ProgramDecodedTextObject(filename, lineno, NULL);
}
