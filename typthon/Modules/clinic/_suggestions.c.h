/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_suggestions__generate_suggestions__doc__,
"_generate_suggestions($module, candidates, item, /)\n"
"--\n"
"\n"
"Returns the candidate in candidates that\'s closest to item");

#define _SUGGESTIONS__GENERATE_SUGGESTIONS_METHODDEF    \
    {"_generate_suggestions", _PyCFunction_CAST(_suggestions__generate_suggestions), METH_FASTCALL, _suggestions__generate_suggestions__doc__},

static TyObject *
_suggestions__generate_suggestions_impl(TyObject *module,
                                        TyObject *candidates, TyObject *item);

static TyObject *
_suggestions__generate_suggestions(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *candidates;
    TyObject *item;

    if (!_TyArg_CheckPositional("_generate_suggestions", nargs, 2, 2)) {
        goto exit;
    }
    candidates = args[0];
    if (!TyUnicode_Check(args[1])) {
        _TyArg_BadArgument("_generate_suggestions", "argument 2", "str", args[1]);
        goto exit;
    }
    item = args[1];
    return_value = _suggestions__generate_suggestions_impl(module, candidates, item);

exit:
    return return_value;
}
/*[clinic end generated code: output=1d8e963cdae30b13 input=a9049054013a1b77]*/
