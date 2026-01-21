/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_symtable_symtable__doc__,
"symtable($module, source, filename, startstr, /)\n"
"--\n"
"\n"
"Return symbol and scope dictionaries used internally by compiler.");

#define _SYMTABLE_SYMTABLE_METHODDEF    \
    {"symtable", _PyCFunction_CAST(_symtable_symtable), METH_FASTCALL, _symtable_symtable__doc__},

static TyObject *
_symtable_symtable_impl(TyObject *module, TyObject *source,
                        TyObject *filename, const char *startstr);

static TyObject *
_symtable_symtable(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *source;
    TyObject *filename;
    const char *startstr;

    if (!_TyArg_CheckPositional("symtable", nargs, 3, 3)) {
        goto exit;
    }
    source = args[0];
    if (!TyUnicode_FSDecoder(args[1], &filename)) {
        goto exit;
    }
    if (!TyUnicode_Check(args[2])) {
        _TyArg_BadArgument("symtable", "argument 3", "str", args[2]);
        goto exit;
    }
    Ty_ssize_t startstr_length;
    startstr = TyUnicode_AsUTF8AndSize(args[2], &startstr_length);
    if (startstr == NULL) {
        goto exit;
    }
    if (strlen(startstr) != (size_t)startstr_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    return_value = _symtable_symtable_impl(module, source, filename, startstr);

exit:
    return return_value;
}
/*[clinic end generated code: output=931964a76a72f850 input=a9049054013a1b77]*/
