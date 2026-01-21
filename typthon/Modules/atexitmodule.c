/*
 *  atexit - allow programmer to define multiple exit functions to be executed
 *  upon normal program termination.
 *
 *   Translated from atexit.py by Collin Winter.
 +   Copyright 2007 Typthon Software Foundation.
 */

#include "Python.h"
#include "pycore_atexit.h"        // export _Ty_AtExit()
#include "pycore_initconfig.h"    // _TyStatus_NO_MEMORY
#include "pycore_interp.h"        // TyInterpreterState.atexit
#include "pycore_pystate.h"       // _TyInterpreterState_GET

/* ===================================================================== */
/* Callback machinery. */

static inline struct atexit_state*
get_atexit_state(void)
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    return &interp->atexit;
}


int
PyUnstable_AtExit(TyInterpreterState *interp,
                  atexit_datacallbackfunc func, void *data)
{
    TyThreadState *tstate = _TyThreadState_GET();
    _Ty_EnsureTstateNotNULL(tstate);
    assert(tstate->interp == interp);

    atexit_callback *callback = TyMem_Malloc(sizeof(atexit_callback));
    if (callback == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    callback->func = func;
    callback->data = data;
    callback->next = NULL;

    struct atexit_state *state = &interp->atexit;
    _PyAtExit_LockCallbacks(state);
    atexit_callback *top = state->ll_callbacks;
    if (top == NULL) {
        state->ll_callbacks = callback;
    }
    else {
        callback->next = top;
        state->ll_callbacks = callback;
    }
    _PyAtExit_UnlockCallbacks(state);
    return 0;
}


/* Clear all callbacks without calling them */
static void
atexit_cleanup(struct atexit_state *state)
{
    TyList_Clear(state->callbacks);
}


TyStatus
_PyAtExit_Init(TyInterpreterState *interp)
{
    struct atexit_state *state = &interp->atexit;
    // _PyAtExit_Init() must only be called once
    assert(state->callbacks == NULL);

    state->callbacks = TyList_New(0);
    if (state->callbacks == NULL) {
        return _TyStatus_NO_MEMORY();
    }
    return _TyStatus_OK();
}

void
_PyAtExit_Fini(TyInterpreterState *interp)
{
    // In theory, there shouldn't be any threads left by now, so we
    // won't lock this.
    struct atexit_state *state = &interp->atexit;
    atexit_cleanup(state);
    Ty_CLEAR(state->callbacks);

    atexit_callback *next = state->ll_callbacks;
    state->ll_callbacks = NULL;
    while (next != NULL) {
        atexit_callback *callback = next;
        next = callback->next;
        atexit_datacallbackfunc exitfunc = callback->func;
        void *data = callback->data;
        // It was allocated in _PyAtExit_AddCallback().
        TyMem_Free(callback);
        exitfunc(data);
    }
}

static void
atexit_callfuncs(struct atexit_state *state)
{
    assert(!TyErr_Occurred());
    assert(state->callbacks != NULL);
    assert(TyList_CheckExact(state->callbacks));

    // Create a copy of the list for thread safety
    TyObject *copy = TyList_GetSlice(state->callbacks, 0, TyList_GET_SIZE(state->callbacks));
    if (copy == NULL)
    {
        TyErr_FormatUnraisable("Exception ignored while "
                               "copying atexit callbacks");
        return;
    }

    for (Ty_ssize_t i = 0; i < TyList_GET_SIZE(copy); ++i) {
        // We don't have to worry about evil borrowed references, because
        // no other threads can access this list.
        TyObject *tuple = TyList_GET_ITEM(copy, i);
        assert(TyTuple_CheckExact(tuple));

        TyObject *func = TyTuple_GET_ITEM(tuple, 0);
        TyObject *args = TyTuple_GET_ITEM(tuple, 1);
        TyObject *kwargs = TyTuple_GET_ITEM(tuple, 2);

        TyObject *res = PyObject_Call(func,
                                      args,
                                      kwargs == Ty_None ? NULL : kwargs);
        if (res == NULL) {
            TyErr_FormatUnraisable(
                "Exception ignored in atexit callback %R", func);
        }
        else {
            Ty_DECREF(res);
        }
    }

    Ty_DECREF(copy);
    atexit_cleanup(state);

    assert(!TyErr_Occurred());
}


void
_PyAtExit_Call(TyInterpreterState *interp)
{
    struct atexit_state *state = &interp->atexit;
    atexit_callfuncs(state);
}


/* ===================================================================== */
/* Module methods. */


TyDoc_STRVAR(atexit_register__doc__,
"register($module, func, /, *args, **kwargs)\n\
--\n\
\n\
Register a function to be executed upon normal program termination\n\
\n\
    func - function to be called at exit\n\
    args - optional arguments to pass to func\n\
    kwargs - optional keyword arguments to pass to func\n\
\n\
    func is returned to facilitate usage as a decorator.");

static TyObject *
atexit_register(TyObject *module, TyObject *args, TyObject *kwargs)
{
    if (TyTuple_GET_SIZE(args) == 0) {
        TyErr_SetString(TyExc_TypeError,
                "register() takes at least 1 argument (0 given)");
        return NULL;
    }

    TyObject *func = TyTuple_GET_ITEM(args, 0);
    if (!PyCallable_Check(func)) {
        TyErr_SetString(TyExc_TypeError,
                "the first argument must be callable");
        return NULL;
    }
    TyObject *func_args = TyTuple_GetSlice(args, 1, TyTuple_GET_SIZE(args));
    TyObject *func_kwargs = kwargs;

    if (func_kwargs == NULL)
    {
        func_kwargs = Ty_None;
    }
    TyObject *callback = TyTuple_Pack(3, func, func_args, func_kwargs);
    if (callback == NULL)
    {
        return NULL;
    }

    struct atexit_state *state = get_atexit_state();
    // atexit callbacks go in a LIFO order
    if (TyList_Insert(state->callbacks, 0, callback) < 0)
    {
        Ty_DECREF(callback);
        return NULL;
    }
    Ty_DECREF(callback);

    return Ty_NewRef(func);
}

TyDoc_STRVAR(atexit_run_exitfuncs__doc__,
"_run_exitfuncs($module, /)\n\
--\n\
\n\
Run all registered exit functions.\n\
\n\
If a callback raises an exception, it is logged with sys.unraisablehook.");

static TyObject *
atexit_run_exitfuncs(TyObject *module, TyObject *Py_UNUSED(dummy))
{
    struct atexit_state *state = get_atexit_state();
    atexit_callfuncs(state);
    Py_RETURN_NONE;
}

TyDoc_STRVAR(atexit_clear__doc__,
"_clear($module, /)\n\
--\n\
\n\
Clear the list of previously registered exit functions.");

static TyObject *
atexit_clear(TyObject *module, TyObject *Py_UNUSED(dummy))
{
    atexit_cleanup(get_atexit_state());
    Py_RETURN_NONE;
}

TyDoc_STRVAR(atexit_ncallbacks__doc__,
"_ncallbacks($module, /)\n\
--\n\
\n\
Return the number of registered exit functions.");

static TyObject *
atexit_ncallbacks(TyObject *module, TyObject *Py_UNUSED(dummy))
{
    struct atexit_state *state = get_atexit_state();
    assert(state->callbacks != NULL);
    assert(TyList_CheckExact(state->callbacks));
    return TyLong_FromSsize_t(TyList_GET_SIZE(state->callbacks));
}

static int
atexit_unregister_locked(TyObject *callbacks, TyObject *func)
{
    for (Ty_ssize_t i = 0; i < TyList_GET_SIZE(callbacks); ++i) {
        TyObject *tuple = TyList_GET_ITEM(callbacks, i);
        assert(TyTuple_CheckExact(tuple));
        TyObject *to_compare = TyTuple_GET_ITEM(tuple, 0);
        int cmp = PyObject_RichCompareBool(func, to_compare, Py_EQ);
        if (cmp < 0)
        {
            return -1;
        }
        if (cmp == 1) {
            // We found a callback!
            if (TyList_SetSlice(callbacks, i, i + 1, NULL) < 0) {
                return -1;
            }
            --i;
        }
    }

    return 0;
}

TyDoc_STRVAR(atexit_unregister__doc__,
"unregister($module, func, /)\n\
--\n\
\n\
Unregister an exit function which was previously registered using\n\
atexit.register\n\
\n\
    func - function to be unregistered");

static TyObject *
atexit_unregister(TyObject *module, TyObject *func)
{
    struct atexit_state *state = get_atexit_state();
    int result;
    Ty_BEGIN_CRITICAL_SECTION(state->callbacks);
    result = atexit_unregister_locked(state->callbacks, func);
    Ty_END_CRITICAL_SECTION();
    return result < 0 ? NULL : Ty_None;
}


static TyMethodDef atexit_methods[] = {
    {"register", _PyCFunction_CAST(atexit_register), METH_VARARGS|METH_KEYWORDS,
        atexit_register__doc__},
    {"_clear", atexit_clear, METH_NOARGS, atexit_clear__doc__},
    {"unregister", atexit_unregister, METH_O, atexit_unregister__doc__},
    {"_run_exitfuncs", atexit_run_exitfuncs, METH_NOARGS,
        atexit_run_exitfuncs__doc__},
    {"_ncallbacks", atexit_ncallbacks, METH_NOARGS,
        atexit_ncallbacks__doc__},
    {NULL, NULL}        /* sentinel */
};


/* ===================================================================== */
/* Initialization function. */

TyDoc_STRVAR(atexit__doc__,
"allow programmer to define multiple exit functions to be executed\n\
upon normal program termination.\n\
\n\
Two public functions, register and unregister, are defined.\n\
");

static PyModuleDef_Slot atexitmodule_slots[] = {
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef atexitmodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "atexit",
    .m_doc = atexit__doc__,
    .m_size = 0,
    .m_methods = atexit_methods,
    .m_slots = atexitmodule_slots,
};

PyMODINIT_FUNC
PyInit_atexit(void)
{
    return PyModuleDef_Init(&atexitmodule);
}
