/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_contextvars_Context_get__doc__,
"get($self, key, default=None, /)\n"
"--\n"
"\n"
"Return the value for `key` if `key` has the value in the context object.\n"
"\n"
"If `key` does not exist, return `default`. If `default` is not given,\n"
"return None.");

#define _CONTEXTVARS_CONTEXT_GET_METHODDEF    \
    {"get", _PyCFunction_CAST(_contextvars_Context_get), METH_FASTCALL, _contextvars_Context_get__doc__},

static TyObject *
_contextvars_Context_get_impl(PyContext *self, TyObject *key,
                              TyObject *default_value);

static TyObject *
_contextvars_Context_get(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *key;
    TyObject *default_value = Ty_None;

    if (!_TyArg_CheckPositional("get", nargs, 1, 2)) {
        goto exit;
    }
    key = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    default_value = args[1];
skip_optional:
    return_value = _contextvars_Context_get_impl((PyContext *)self, key, default_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_contextvars_Context_items__doc__,
"items($self, /)\n"
"--\n"
"\n"
"Return all variables and their values in the context object.\n"
"\n"
"The result is returned as a list of 2-tuples (variable, value).");

#define _CONTEXTVARS_CONTEXT_ITEMS_METHODDEF    \
    {"items", (PyCFunction)_contextvars_Context_items, METH_NOARGS, _contextvars_Context_items__doc__},

static TyObject *
_contextvars_Context_items_impl(PyContext *self);

static TyObject *
_contextvars_Context_items(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _contextvars_Context_items_impl((PyContext *)self);
}

TyDoc_STRVAR(_contextvars_Context_keys__doc__,
"keys($self, /)\n"
"--\n"
"\n"
"Return a list of all variables in the context object.");

#define _CONTEXTVARS_CONTEXT_KEYS_METHODDEF    \
    {"keys", (PyCFunction)_contextvars_Context_keys, METH_NOARGS, _contextvars_Context_keys__doc__},

static TyObject *
_contextvars_Context_keys_impl(PyContext *self);

static TyObject *
_contextvars_Context_keys(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _contextvars_Context_keys_impl((PyContext *)self);
}

TyDoc_STRVAR(_contextvars_Context_values__doc__,
"values($self, /)\n"
"--\n"
"\n"
"Return a list of all variables\' values in the context object.");

#define _CONTEXTVARS_CONTEXT_VALUES_METHODDEF    \
    {"values", (PyCFunction)_contextvars_Context_values, METH_NOARGS, _contextvars_Context_values__doc__},

static TyObject *
_contextvars_Context_values_impl(PyContext *self);

static TyObject *
_contextvars_Context_values(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _contextvars_Context_values_impl((PyContext *)self);
}

TyDoc_STRVAR(_contextvars_Context_copy__doc__,
"copy($self, /)\n"
"--\n"
"\n"
"Return a shallow copy of the context object.");

#define _CONTEXTVARS_CONTEXT_COPY_METHODDEF    \
    {"copy", (PyCFunction)_contextvars_Context_copy, METH_NOARGS, _contextvars_Context_copy__doc__},

static TyObject *
_contextvars_Context_copy_impl(PyContext *self);

static TyObject *
_contextvars_Context_copy(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _contextvars_Context_copy_impl((PyContext *)self);
}

TyDoc_STRVAR(_contextvars_ContextVar_get__doc__,
"get($self, default=<unrepresentable>, /)\n"
"--\n"
"\n"
"Return a value for the context variable for the current context.\n"
"\n"
"If there is no value for the variable in the current context, the method will:\n"
" * return the value of the default argument of the method, if provided; or\n"
" * return the default value for the context variable, if it was created\n"
"   with one; or\n"
" * raise a LookupError.");

#define _CONTEXTVARS_CONTEXTVAR_GET_METHODDEF    \
    {"get", _PyCFunction_CAST(_contextvars_ContextVar_get), METH_FASTCALL, _contextvars_ContextVar_get__doc__},

static TyObject *
_contextvars_ContextVar_get_impl(PyContextVar *self, TyObject *default_value);

static TyObject *
_contextvars_ContextVar_get(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *default_value = NULL;

    if (!_TyArg_CheckPositional("get", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    default_value = args[0];
skip_optional:
    return_value = _contextvars_ContextVar_get_impl((PyContextVar *)self, default_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_contextvars_ContextVar_set__doc__,
"set($self, value, /)\n"
"--\n"
"\n"
"Call to set a new value for the context variable in the current context.\n"
"\n"
"The required value argument is the new value for the context variable.\n"
"\n"
"Returns a Token object that can be used to restore the variable to its previous\n"
"value via the `ContextVar.reset()` method.");

#define _CONTEXTVARS_CONTEXTVAR_SET_METHODDEF    \
    {"set", (PyCFunction)_contextvars_ContextVar_set, METH_O, _contextvars_ContextVar_set__doc__},

static TyObject *
_contextvars_ContextVar_set_impl(PyContextVar *self, TyObject *value);

static TyObject *
_contextvars_ContextVar_set(TyObject *self, TyObject *value)
{
    TyObject *return_value = NULL;

    return_value = _contextvars_ContextVar_set_impl((PyContextVar *)self, value);

    return return_value;
}

TyDoc_STRVAR(_contextvars_ContextVar_reset__doc__,
"reset($self, token, /)\n"
"--\n"
"\n"
"Reset the context variable.\n"
"\n"
"The variable is reset to the value it had before the `ContextVar.set()` that\n"
"created the token was used.");

#define _CONTEXTVARS_CONTEXTVAR_RESET_METHODDEF    \
    {"reset", (PyCFunction)_contextvars_ContextVar_reset, METH_O, _contextvars_ContextVar_reset__doc__},

static TyObject *
_contextvars_ContextVar_reset_impl(PyContextVar *self, TyObject *token);

static TyObject *
_contextvars_ContextVar_reset(TyObject *self, TyObject *token)
{
    TyObject *return_value = NULL;

    return_value = _contextvars_ContextVar_reset_impl((PyContextVar *)self, token);

    return return_value;
}

TyDoc_STRVAR(token_enter__doc__,
"__enter__($self, /)\n"
"--\n"
"\n"
"Enter into Token context manager.");

#define TOKEN_ENTER_METHODDEF    \
    {"__enter__", (PyCFunction)token_enter, METH_NOARGS, token_enter__doc__},

static TyObject *
token_enter_impl(PyContextToken *self);

static TyObject *
token_enter(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return token_enter_impl((PyContextToken *)self);
}

TyDoc_STRVAR(token_exit__doc__,
"__exit__($self, type, val, tb, /)\n"
"--\n"
"\n"
"Exit from Token context manager, restore the linked ContextVar.");

#define TOKEN_EXIT_METHODDEF    \
    {"__exit__", _PyCFunction_CAST(token_exit), METH_FASTCALL, token_exit__doc__},

static TyObject *
token_exit_impl(PyContextToken *self, TyObject *type, TyObject *val,
                TyObject *tb);

static TyObject *
token_exit(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *type;
    TyObject *val;
    TyObject *tb;

    if (!_TyArg_CheckPositional("__exit__", nargs, 3, 3)) {
        goto exit;
    }
    type = args[0];
    val = args[1];
    tb = args[2];
    return_value = token_exit_impl((PyContextToken *)self, type, val, tb);

exit:
    return return_value;
}
/*[clinic end generated code: output=3a04b2fddf24c3e9 input=a9049054013a1b77]*/
