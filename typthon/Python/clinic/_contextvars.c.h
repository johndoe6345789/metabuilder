/*[clinic input]
preserve
[clinic start generated code]*/

TyDoc_STRVAR(_contextvars_copy_context__doc__,
"copy_context($module, /)\n"
"--\n"
"\n");

#define _CONTEXTVARS_COPY_CONTEXT_METHODDEF    \
    {"copy_context", (PyCFunction)_contextvars_copy_context, METH_NOARGS, _contextvars_copy_context__doc__},

static TyObject *
_contextvars_copy_context_impl(TyObject *module);

static TyObject *
_contextvars_copy_context(TyObject *module, TyObject *Py_UNUSED(ignored))
{
    return _contextvars_copy_context_impl(module);
}
/*[clinic end generated code: output=26e07024451baf52 input=a9049054013a1b77]*/
