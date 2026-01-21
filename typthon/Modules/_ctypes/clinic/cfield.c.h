/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

static TyObject *
PyCField_new_impl(TyTypeObject *type, TyObject *name, TyObject *proto,
                  Ty_ssize_t byte_size, Ty_ssize_t byte_offset,
                  Ty_ssize_t index, int _internal_use,
                  TyObject *bit_size_obj, TyObject *bit_offset_obj);

static TyObject *
PyCField_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 8
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(name), &_Ty_ID(type), &_Ty_ID(byte_size), &_Ty_ID(byte_offset), &_Ty_ID(index), &_Ty_ID(_internal_use), &_Ty_ID(bit_size), &_Ty_ID(bit_offset), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"name", "type", "byte_size", "byte_offset", "index", "_internal_use", "bit_size", "bit_offset", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "CField",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[8];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 6;
    TyObject *name;
    TyObject *proto;
    Ty_ssize_t byte_size;
    Ty_ssize_t byte_offset;
    Ty_ssize_t index;
    int _internal_use;
    TyObject *bit_size_obj = Ty_None;
    TyObject *bit_offset_obj = Ty_None;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 6, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!TyUnicode_Check(fastargs[0])) {
        _TyArg_BadArgument("CField", "argument 'name'", "str", fastargs[0]);
        goto exit;
    }
    name = fastargs[0];
    proto = fastargs[1];
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(fastargs[2]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        byte_size = ival;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(fastargs[3]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        byte_offset = ival;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(fastargs[4]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        index = ival;
    }
    _internal_use = PyObject_IsTrue(fastargs[5]);
    if (_internal_use < 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[6]) {
        bit_size_obj = fastargs[6];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    bit_offset_obj = fastargs[7];
skip_optional_kwonly:
    return_value = PyCField_new_impl(type, name, proto, byte_size, byte_offset, index, _internal_use, bit_size_obj, bit_offset_obj);

exit:
    return return_value;
}
/*[clinic end generated code: output=7eb1621e22ea2e05 input=a9049054013a1b77]*/
