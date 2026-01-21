/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(code_new__doc__,
"code(argcount, posonlyargcount, kwonlyargcount, nlocals, stacksize,\n"
"     flags, codestring, constants, names, varnames, filename, name,\n"
"     qualname, firstlineno, linetable, exceptiontable, freevars=(),\n"
"     cellvars=(), /)\n"
"--\n"
"\n"
"Create a code object.  Not for the faint of heart.");

static TyObject *
code_new_impl(TyTypeObject *type, int argcount, int posonlyargcount,
              int kwonlyargcount, int nlocals, int stacksize, int flags,
              TyObject *code, TyObject *consts, TyObject *names,
              TyObject *varnames, TyObject *filename, TyObject *name,
              TyObject *qualname, int firstlineno, TyObject *linetable,
              TyObject *exceptiontable, TyObject *freevars,
              TyObject *cellvars);

static TyObject *
code_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    TyTypeObject *base_tp = &TyCode_Type;
    int argcount;
    int posonlyargcount;
    int kwonlyargcount;
    int nlocals;
    int stacksize;
    int flags;
    TyObject *code;
    TyObject *consts;
    TyObject *names;
    TyObject *varnames;
    TyObject *filename;
    TyObject *name;
    TyObject *qualname;
    int firstlineno;
    TyObject *linetable;
    TyObject *exceptiontable;
    TyObject *freevars = NULL;
    TyObject *cellvars = NULL;

    if ((type == base_tp || type->tp_init == base_tp->tp_init) &&
        !_TyArg_NoKeywords("code", kwargs)) {
        goto exit;
    }
    if (!_TyArg_CheckPositional("code", TyTuple_GET_SIZE(args), 16, 18)) {
        goto exit;
    }
    argcount = TyLong_AsInt(TyTuple_GET_ITEM(args, 0));
    if (argcount == -1 && TyErr_Occurred()) {
        goto exit;
    }
    posonlyargcount = TyLong_AsInt(TyTuple_GET_ITEM(args, 1));
    if (posonlyargcount == -1 && TyErr_Occurred()) {
        goto exit;
    }
    kwonlyargcount = TyLong_AsInt(TyTuple_GET_ITEM(args, 2));
    if (kwonlyargcount == -1 && TyErr_Occurred()) {
        goto exit;
    }
    nlocals = TyLong_AsInt(TyTuple_GET_ITEM(args, 3));
    if (nlocals == -1 && TyErr_Occurred()) {
        goto exit;
    }
    stacksize = TyLong_AsInt(TyTuple_GET_ITEM(args, 4));
    if (stacksize == -1 && TyErr_Occurred()) {
        goto exit;
    }
    flags = TyLong_AsInt(TyTuple_GET_ITEM(args, 5));
    if (flags == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!TyBytes_Check(TyTuple_GET_ITEM(args, 6))) {
        _TyArg_BadArgument("code", "argument 7", "bytes", TyTuple_GET_ITEM(args, 6));
        goto exit;
    }
    code = TyTuple_GET_ITEM(args, 6);
    if (!TyTuple_Check(TyTuple_GET_ITEM(args, 7))) {
        _TyArg_BadArgument("code", "argument 8", "tuple", TyTuple_GET_ITEM(args, 7));
        goto exit;
    }
    consts = TyTuple_GET_ITEM(args, 7);
    if (!TyTuple_Check(TyTuple_GET_ITEM(args, 8))) {
        _TyArg_BadArgument("code", "argument 9", "tuple", TyTuple_GET_ITEM(args, 8));
        goto exit;
    }
    names = TyTuple_GET_ITEM(args, 8);
    if (!TyTuple_Check(TyTuple_GET_ITEM(args, 9))) {
        _TyArg_BadArgument("code", "argument 10", "tuple", TyTuple_GET_ITEM(args, 9));
        goto exit;
    }
    varnames = TyTuple_GET_ITEM(args, 9);
    if (!TyUnicode_Check(TyTuple_GET_ITEM(args, 10))) {
        _TyArg_BadArgument("code", "argument 11", "str", TyTuple_GET_ITEM(args, 10));
        goto exit;
    }
    filename = TyTuple_GET_ITEM(args, 10);
    if (!TyUnicode_Check(TyTuple_GET_ITEM(args, 11))) {
        _TyArg_BadArgument("code", "argument 12", "str", TyTuple_GET_ITEM(args, 11));
        goto exit;
    }
    name = TyTuple_GET_ITEM(args, 11);
    if (!TyUnicode_Check(TyTuple_GET_ITEM(args, 12))) {
        _TyArg_BadArgument("code", "argument 13", "str", TyTuple_GET_ITEM(args, 12));
        goto exit;
    }
    qualname = TyTuple_GET_ITEM(args, 12);
    firstlineno = TyLong_AsInt(TyTuple_GET_ITEM(args, 13));
    if (firstlineno == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!TyBytes_Check(TyTuple_GET_ITEM(args, 14))) {
        _TyArg_BadArgument("code", "argument 15", "bytes", TyTuple_GET_ITEM(args, 14));
        goto exit;
    }
    linetable = TyTuple_GET_ITEM(args, 14);
    if (!TyBytes_Check(TyTuple_GET_ITEM(args, 15))) {
        _TyArg_BadArgument("code", "argument 16", "bytes", TyTuple_GET_ITEM(args, 15));
        goto exit;
    }
    exceptiontable = TyTuple_GET_ITEM(args, 15);
    if (TyTuple_GET_SIZE(args) < 17) {
        goto skip_optional;
    }
    if (!TyTuple_Check(TyTuple_GET_ITEM(args, 16))) {
        _TyArg_BadArgument("code", "argument 17", "tuple", TyTuple_GET_ITEM(args, 16));
        goto exit;
    }
    freevars = TyTuple_GET_ITEM(args, 16);
    if (TyTuple_GET_SIZE(args) < 18) {
        goto skip_optional;
    }
    if (!TyTuple_Check(TyTuple_GET_ITEM(args, 17))) {
        _TyArg_BadArgument("code", "argument 18", "tuple", TyTuple_GET_ITEM(args, 17));
        goto exit;
    }
    cellvars = TyTuple_GET_ITEM(args, 17);
skip_optional:
    return_value = code_new_impl(type, argcount, posonlyargcount, kwonlyargcount, nlocals, stacksize, flags, code, consts, names, varnames, filename, name, qualname, firstlineno, linetable, exceptiontable, freevars, cellvars);

exit:
    return return_value;
}

TyDoc_STRVAR(code_replace__doc__,
"replace($self, /, **changes)\n"
"--\n"
"\n"
"Return a copy of the code object with new values for the specified fields.");

#define CODE_REPLACE_METHODDEF    \
    {"replace", _PyCFunction_CAST(code_replace), METH_FASTCALL|METH_KEYWORDS, code_replace__doc__},

static TyObject *
code_replace_impl(PyCodeObject *self, int co_argcount,
                  int co_posonlyargcount, int co_kwonlyargcount,
                  int co_nlocals, int co_stacksize, int co_flags,
                  int co_firstlineno, TyObject *co_code, TyObject *co_consts,
                  TyObject *co_names, TyObject *co_varnames,
                  TyObject *co_freevars, TyObject *co_cellvars,
                  TyObject *co_filename, TyObject *co_name,
                  TyObject *co_qualname, TyObject *co_linetable,
                  TyObject *co_exceptiontable);

static TyObject *
code_replace(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 18
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(co_argcount), &_Ty_ID(co_posonlyargcount), &_Ty_ID(co_kwonlyargcount), &_Ty_ID(co_nlocals), &_Ty_ID(co_stacksize), &_Ty_ID(co_flags), &_Ty_ID(co_firstlineno), &_Ty_ID(co_code), &_Ty_ID(co_consts), &_Ty_ID(co_names), &_Ty_ID(co_varnames), &_Ty_ID(co_freevars), &_Ty_ID(co_cellvars), &_Ty_ID(co_filename), &_Ty_ID(co_name), &_Ty_ID(co_qualname), &_Ty_ID(co_linetable), &_Ty_ID(co_exceptiontable), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"co_argcount", "co_posonlyargcount", "co_kwonlyargcount", "co_nlocals", "co_stacksize", "co_flags", "co_firstlineno", "co_code", "co_consts", "co_names", "co_varnames", "co_freevars", "co_cellvars", "co_filename", "co_name", "co_qualname", "co_linetable", "co_exceptiontable", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "replace",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[18];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int co_argcount = ((PyCodeObject *)self)->co_argcount;
    int co_posonlyargcount = ((PyCodeObject *)self)->co_posonlyargcount;
    int co_kwonlyargcount = ((PyCodeObject *)self)->co_kwonlyargcount;
    int co_nlocals = ((PyCodeObject *)self)->co_nlocals;
    int co_stacksize = ((PyCodeObject *)self)->co_stacksize;
    int co_flags = ((PyCodeObject *)self)->co_flags;
    int co_firstlineno = ((PyCodeObject *)self)->co_firstlineno;
    TyObject *co_code = NULL;
    TyObject *co_consts = ((PyCodeObject *)self)->co_consts;
    TyObject *co_names = ((PyCodeObject *)self)->co_names;
    TyObject *co_varnames = NULL;
    TyObject *co_freevars = NULL;
    TyObject *co_cellvars = NULL;
    TyObject *co_filename = ((PyCodeObject *)self)->co_filename;
    TyObject *co_name = ((PyCodeObject *)self)->co_name;
    TyObject *co_qualname = ((PyCodeObject *)self)->co_qualname;
    TyObject *co_linetable = ((PyCodeObject *)self)->co_linetable;
    TyObject *co_exceptiontable = ((PyCodeObject *)self)->co_exceptiontable;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[0]) {
        co_argcount = TyLong_AsInt(args[0]);
        if (co_argcount == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[1]) {
        co_posonlyargcount = TyLong_AsInt(args[1]);
        if (co_posonlyargcount == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[2]) {
        co_kwonlyargcount = TyLong_AsInt(args[2]);
        if (co_kwonlyargcount == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[3]) {
        co_nlocals = TyLong_AsInt(args[3]);
        if (co_nlocals == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[4]) {
        co_stacksize = TyLong_AsInt(args[4]);
        if (co_stacksize == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[5]) {
        co_flags = TyLong_AsInt(args[5]);
        if (co_flags == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[6]) {
        co_firstlineno = TyLong_AsInt(args[6]);
        if (co_firstlineno == -1 && TyErr_Occurred()) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[7]) {
        if (!TyBytes_Check(args[7])) {
            _TyArg_BadArgument("replace", "argument 'co_code'", "bytes", args[7]);
            goto exit;
        }
        co_code = args[7];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[8]) {
        if (!TyTuple_Check(args[8])) {
            _TyArg_BadArgument("replace", "argument 'co_consts'", "tuple", args[8]);
            goto exit;
        }
        co_consts = args[8];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[9]) {
        if (!TyTuple_Check(args[9])) {
            _TyArg_BadArgument("replace", "argument 'co_names'", "tuple", args[9]);
            goto exit;
        }
        co_names = args[9];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[10]) {
        if (!TyTuple_Check(args[10])) {
            _TyArg_BadArgument("replace", "argument 'co_varnames'", "tuple", args[10]);
            goto exit;
        }
        co_varnames = args[10];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[11]) {
        if (!TyTuple_Check(args[11])) {
            _TyArg_BadArgument("replace", "argument 'co_freevars'", "tuple", args[11]);
            goto exit;
        }
        co_freevars = args[11];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[12]) {
        if (!TyTuple_Check(args[12])) {
            _TyArg_BadArgument("replace", "argument 'co_cellvars'", "tuple", args[12]);
            goto exit;
        }
        co_cellvars = args[12];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[13]) {
        if (!TyUnicode_Check(args[13])) {
            _TyArg_BadArgument("replace", "argument 'co_filename'", "str", args[13]);
            goto exit;
        }
        co_filename = args[13];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[14]) {
        if (!TyUnicode_Check(args[14])) {
            _TyArg_BadArgument("replace", "argument 'co_name'", "str", args[14]);
            goto exit;
        }
        co_name = args[14];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[15]) {
        if (!TyUnicode_Check(args[15])) {
            _TyArg_BadArgument("replace", "argument 'co_qualname'", "str", args[15]);
            goto exit;
        }
        co_qualname = args[15];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[16]) {
        if (!TyBytes_Check(args[16])) {
            _TyArg_BadArgument("replace", "argument 'co_linetable'", "bytes", args[16]);
            goto exit;
        }
        co_linetable = args[16];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (!TyBytes_Check(args[17])) {
        _TyArg_BadArgument("replace", "argument 'co_exceptiontable'", "bytes", args[17]);
        goto exit;
    }
    co_exceptiontable = args[17];
skip_optional_kwonly:
    return_value = code_replace_impl((PyCodeObject *)self, co_argcount, co_posonlyargcount, co_kwonlyargcount, co_nlocals, co_stacksize, co_flags, co_firstlineno, co_code, co_consts, co_names, co_varnames, co_freevars, co_cellvars, co_filename, co_name, co_qualname, co_linetable, co_exceptiontable);

exit:
    return return_value;
}

TyDoc_STRVAR(code__varname_from_oparg__doc__,
"_varname_from_oparg($self, /, oparg)\n"
"--\n"
"\n"
"(internal-only) Return the local variable name for the given oparg.\n"
"\n"
"WARNING: this method is for internal use only and may change or go away.");

#define CODE__VARNAME_FROM_OPARG_METHODDEF    \
    {"_varname_from_oparg", _PyCFunction_CAST(code__varname_from_oparg), METH_FASTCALL|METH_KEYWORDS, code__varname_from_oparg__doc__},

static TyObject *
code__varname_from_oparg_impl(PyCodeObject *self, int oparg);

static TyObject *
code__varname_from_oparg(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 1
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(oparg), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"oparg", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "_varname_from_oparg",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int oparg;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    oparg = TyLong_AsInt(args[0]);
    if (oparg == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = code__varname_from_oparg_impl((PyCodeObject *)self, oparg);

exit:
    return return_value;
}
/*[clinic end generated code: output=c5c6e40fc357defe input=a9049054013a1b77]*/
