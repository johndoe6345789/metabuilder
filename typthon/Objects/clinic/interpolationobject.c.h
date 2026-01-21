/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

static TyObject *
interpolation_new_impl(TyTypeObject *type, TyObject *value,
                       TyObject *expression, TyObject *conversion,
                       TyObject *format_spec);

static TyObject *
interpolation_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 4
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(value), &_Ty_ID(expression), &_Ty_ID(conversion), &_Ty_ID(format_spec), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"value", "expression", "conversion", "format_spec", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "Interpolation",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    TyObject *value;
    TyObject *expression = &_Ty_STR(empty);
    TyObject *conversion = Ty_None;
    TyObject *format_spec = &_Ty_STR(empty);

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 4, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    value = fastargs[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[1]) {
        if (!TyUnicode_Check(fastargs[1])) {
            _TyArg_BadArgument("Interpolation", "argument 'expression'", "str", fastargs[1]);
            goto exit;
        }
        expression = fastargs[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[2]) {
        if (!_conversion_converter(fastargs[2], &conversion)) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (!TyUnicode_Check(fastargs[3])) {
        _TyArg_BadArgument("Interpolation", "argument 'format_spec'", "str", fastargs[3]);
        goto exit;
    }
    format_spec = fastargs[3];
skip_optional_pos:
    return_value = interpolation_new_impl(type, value, expression, conversion, format_spec);

exit:
    return return_value;
}
/*[clinic end generated code: output=2391391e2d7708c0 input=a9049054013a1b77]*/
