/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(marshal_dump__doc__,
"dump($module, value, file, version=version, /, *, allow_code=True)\n"
"--\n"
"\n"
"Write the value on the open file.\n"
"\n"
"  value\n"
"    Must be a supported type.\n"
"  file\n"
"    Must be a writeable binary file.\n"
"  version\n"
"    Indicates the data format that dump should use.\n"
"  allow_code\n"
"    Allow to write code objects.\n"
"\n"
"If the value has (or contains an object that has) an unsupported type, a\n"
"ValueError exception is raised - but garbage data will also be written\n"
"to the file. The object will not be properly read back by load().");

#define MARSHAL_DUMP_METHODDEF    \
    {"dump", _PyCFunction_CAST(marshal_dump), METH_FASTCALL|METH_KEYWORDS, marshal_dump__doc__},

static TyObject *
marshal_dump_impl(TyObject *module, TyObject *value, TyObject *file,
                  int version, int allow_code);

static TyObject *
marshal_dump(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(allow_code), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "", "", "allow_code", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "dump",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    TyObject *value;
    TyObject *file;
    int version = Ty_MARSHAL_VERSION;
    int allow_code = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    value = args[0];
    file = args[1];
    if (nargs < 3) {
        goto skip_optional_posonly;
    }
    noptargs--;
    version = TyLong_AsInt(args[2]);
    if (version == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_posonly:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    allow_code = PyObject_IsTrue(args[3]);
    if (allow_code < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = marshal_dump_impl(module, value, file, version, allow_code);

exit:
    return return_value;
}

TyDoc_STRVAR(marshal_load__doc__,
"load($module, file, /, *, allow_code=True)\n"
"--\n"
"\n"
"Read one value from the open file and return it.\n"
"\n"
"  file\n"
"    Must be readable binary file.\n"
"  allow_code\n"
"    Allow to load code objects.\n"
"\n"
"If no valid value is read (e.g. because the data has a different Python\n"
"version\'s incompatible marshal format), raise EOFError, ValueError or\n"
"TypeError.\n"
"\n"
"Note: If an object containing an unsupported type was marshalled with\n"
"dump(), load() will substitute None for the unmarshallable type.");

#define MARSHAL_LOAD_METHODDEF    \
    {"load", _PyCFunction_CAST(marshal_load), METH_FASTCALL|METH_KEYWORDS, marshal_load__doc__},

static TyObject *
marshal_load_impl(TyObject *module, TyObject *file, int allow_code);

static TyObject *
marshal_load(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(allow_code), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "allow_code", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "load",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *file;
    int allow_code = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    file = args[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    allow_code = PyObject_IsTrue(args[1]);
    if (allow_code < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = marshal_load_impl(module, file, allow_code);

exit:
    return return_value;
}

TyDoc_STRVAR(marshal_dumps__doc__,
"dumps($module, value, version=version, /, *, allow_code=True)\n"
"--\n"
"\n"
"Return the bytes object that would be written to a file by dump(value, file).\n"
"\n"
"  value\n"
"    Must be a supported type.\n"
"  version\n"
"    Indicates the data format that dumps should use.\n"
"  allow_code\n"
"    Allow to write code objects.\n"
"\n"
"Raise a ValueError exception if value has (or contains an object that has) an\n"
"unsupported type.");

#define MARSHAL_DUMPS_METHODDEF    \
    {"dumps", _PyCFunction_CAST(marshal_dumps), METH_FASTCALL|METH_KEYWORDS, marshal_dumps__doc__},

static TyObject *
marshal_dumps_impl(TyObject *module, TyObject *value, int version,
                   int allow_code);

static TyObject *
marshal_dumps(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(allow_code), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "", "allow_code", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "dumps",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *value;
    int version = Ty_MARSHAL_VERSION;
    int allow_code = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    value = args[0];
    if (nargs < 2) {
        goto skip_optional_posonly;
    }
    noptargs--;
    version = TyLong_AsInt(args[1]);
    if (version == -1 && TyErr_Occurred()) {
        goto exit;
    }
skip_optional_posonly:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    allow_code = PyObject_IsTrue(args[2]);
    if (allow_code < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = marshal_dumps_impl(module, value, version, allow_code);

exit:
    return return_value;
}

TyDoc_STRVAR(marshal_loads__doc__,
"loads($module, bytes, /, *, allow_code=True)\n"
"--\n"
"\n"
"Convert the bytes-like object to a value.\n"
"\n"
"  allow_code\n"
"    Allow to load code objects.\n"
"\n"
"If no valid value is found, raise EOFError, ValueError or TypeError.  Extra\n"
"bytes in the input are ignored.");

#define MARSHAL_LOADS_METHODDEF    \
    {"loads", _PyCFunction_CAST(marshal_loads), METH_FASTCALL|METH_KEYWORDS, marshal_loads__doc__},

static TyObject *
marshal_loads_impl(TyObject *module, Ty_buffer *bytes, int allow_code);

static TyObject *
marshal_loads(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(allow_code), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "allow_code", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "loads",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    Ty_buffer bytes = {NULL, NULL};
    int allow_code = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (PyObject_GetBuffer(args[0], &bytes, PyBUF_SIMPLE) != 0) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    allow_code = PyObject_IsTrue(args[1]);
    if (allow_code < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = marshal_loads_impl(module, &bytes, allow_code);

exit:
    /* Cleanup for bytes */
    if (bytes.obj) {
       PyBuffer_Release(&bytes);
    }

    return return_value;
}
/*[clinic end generated code: output=3e4bfc070a3c78ac input=a9049054013a1b77]*/
