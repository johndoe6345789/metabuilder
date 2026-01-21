/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_SINGLETON()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(_pickle_Pickler_clear_memo__doc__,
"clear_memo($self, /)\n"
"--\n"
"\n"
"Clears the pickler\'s \"memo\".\n"
"\n"
"The memo is the data structure that remembers which objects the\n"
"pickler has already seen, so that shared or recursive objects are\n"
"pickled by reference and not by value.  This method is useful when\n"
"re-using picklers.");

#define _PICKLE_PICKLER_CLEAR_MEMO_METHODDEF    \
    {"clear_memo", (PyCFunction)_pickle_Pickler_clear_memo, METH_NOARGS, _pickle_Pickler_clear_memo__doc__},

static TyObject *
_pickle_Pickler_clear_memo_impl(PicklerObject *self);

static TyObject *
_pickle_Pickler_clear_memo(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _pickle_Pickler_clear_memo_impl((PicklerObject *)self);
}

TyDoc_STRVAR(_pickle_Pickler_dump__doc__,
"dump($self, obj, /)\n"
"--\n"
"\n"
"Write a pickled representation of the given object to the open file.");

#define _PICKLE_PICKLER_DUMP_METHODDEF    \
    {"dump", _PyCFunction_CAST(_pickle_Pickler_dump), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _pickle_Pickler_dump__doc__},

static TyObject *
_pickle_Pickler_dump_impl(PicklerObject *self, TyTypeObject *cls,
                          TyObject *obj);

static TyObject *
_pickle_Pickler_dump(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "dump",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *obj;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    obj = args[0];
    return_value = _pickle_Pickler_dump_impl((PicklerObject *)self, cls, obj);

exit:
    return return_value;
}

TyDoc_STRVAR(_pickle_Pickler___sizeof____doc__,
"__sizeof__($self, /)\n"
"--\n"
"\n"
"Returns size in memory, in bytes.");

#define _PICKLE_PICKLER___SIZEOF___METHODDEF    \
    {"__sizeof__", (PyCFunction)_pickle_Pickler___sizeof__, METH_NOARGS, _pickle_Pickler___sizeof____doc__},

static size_t
_pickle_Pickler___sizeof___impl(PicklerObject *self);

static TyObject *
_pickle_Pickler___sizeof__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    size_t _return_value;

    _return_value = _pickle_Pickler___sizeof___impl((PicklerObject *)self);
    if ((_return_value == (size_t)-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSize_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_pickle_Pickler___init____doc__,
"Pickler(file, protocol=None, fix_imports=True, buffer_callback=None)\n"
"--\n"
"\n"
"This takes a binary file for writing a pickle data stream.\n"
"\n"
"The optional *protocol* argument tells the pickler to use the given\n"
"protocol; supported protocols are 0, 1, 2, 3, 4 and 5.  The default\n"
"protocol is 5. It was introduced in Python 3.8, and is incompatible\n"
"with previous versions.\n"
"\n"
"Specifying a negative protocol version selects the highest protocol\n"
"version supported.  The higher the protocol used, the more recent the\n"
"version of Python needed to read the pickle produced.\n"
"\n"
"The *file* argument must have a write() method that accepts a single\n"
"bytes argument. It can thus be a file object opened for binary\n"
"writing, an io.BytesIO instance, or any other custom object that meets\n"
"this interface.\n"
"\n"
"If *fix_imports* is True and protocol is less than 3, pickle will try\n"
"to map the new Python 3 names to the old module names used in Python\n"
"2, so that the pickle data stream is readable with Python 2.\n"
"\n"
"If *buffer_callback* is None (the default), buffer views are\n"
"serialized into *file* as part of the pickle stream.\n"
"\n"
"If *buffer_callback* is not None, then it can be called any number\n"
"of times with a buffer view.  If the callback returns a false value\n"
"(such as None), the given buffer is out-of-band; otherwise the\n"
"buffer is serialized in-band, i.e. inside the pickle stream.\n"
"\n"
"It is an error if *buffer_callback* is not None and *protocol*\n"
"is None or smaller than 5.");

static int
_pickle_Pickler___init___impl(PicklerObject *self, TyObject *file,
                              TyObject *protocol, int fix_imports,
                              TyObject *buffer_callback);

static int
_pickle_Pickler___init__(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
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
        .ob_item = { &_Ty_ID(file), &_Ty_ID(protocol), &_Ty_ID(fix_imports), &_Ty_ID(buffer_callback), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"file", "protocol", "fix_imports", "buffer_callback", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "Pickler",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    TyObject *file;
    TyObject *protocol = Ty_None;
    int fix_imports = 1;
    TyObject *buffer_callback = Ty_None;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 4, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    file = fastargs[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[1]) {
        protocol = fastargs[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (fastargs[2]) {
        fix_imports = PyObject_IsTrue(fastargs[2]);
        if (fix_imports < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    buffer_callback = fastargs[3];
skip_optional_pos:
    return_value = _pickle_Pickler___init___impl((PicklerObject *)self, file, protocol, fix_imports, buffer_callback);

exit:
    return return_value;
}

TyDoc_STRVAR(_pickle_PicklerMemoProxy_clear__doc__,
"clear($self, /)\n"
"--\n"
"\n"
"Remove all items from memo.");

#define _PICKLE_PICKLERMEMOPROXY_CLEAR_METHODDEF    \
    {"clear", (PyCFunction)_pickle_PicklerMemoProxy_clear, METH_NOARGS, _pickle_PicklerMemoProxy_clear__doc__},

static TyObject *
_pickle_PicklerMemoProxy_clear_impl(PicklerMemoProxyObject *self);

static TyObject *
_pickle_PicklerMemoProxy_clear(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _pickle_PicklerMemoProxy_clear_impl((PicklerMemoProxyObject *)self);
}

TyDoc_STRVAR(_pickle_PicklerMemoProxy_copy__doc__,
"copy($self, /)\n"
"--\n"
"\n"
"Copy the memo to a new object.");

#define _PICKLE_PICKLERMEMOPROXY_COPY_METHODDEF    \
    {"copy", (PyCFunction)_pickle_PicklerMemoProxy_copy, METH_NOARGS, _pickle_PicklerMemoProxy_copy__doc__},

static TyObject *
_pickle_PicklerMemoProxy_copy_impl(PicklerMemoProxyObject *self);

static TyObject *
_pickle_PicklerMemoProxy_copy(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _pickle_PicklerMemoProxy_copy_impl((PicklerMemoProxyObject *)self);
}

TyDoc_STRVAR(_pickle_PicklerMemoProxy___reduce____doc__,
"__reduce__($self, /)\n"
"--\n"
"\n"
"Implement pickle support.");

#define _PICKLE_PICKLERMEMOPROXY___REDUCE___METHODDEF    \
    {"__reduce__", (PyCFunction)_pickle_PicklerMemoProxy___reduce__, METH_NOARGS, _pickle_PicklerMemoProxy___reduce____doc__},

static TyObject *
_pickle_PicklerMemoProxy___reduce___impl(PicklerMemoProxyObject *self);

static TyObject *
_pickle_PicklerMemoProxy___reduce__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _pickle_PicklerMemoProxy___reduce___impl((PicklerMemoProxyObject *)self);
}

TyDoc_STRVAR(_pickle_Unpickler_persistent_load__doc__,
"persistent_load($self, pid, /)\n"
"--\n"
"\n");

#define _PICKLE_UNPICKLER_PERSISTENT_LOAD_METHODDEF    \
    {"persistent_load", _PyCFunction_CAST(_pickle_Unpickler_persistent_load), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _pickle_Unpickler_persistent_load__doc__},

static TyObject *
_pickle_Unpickler_persistent_load_impl(UnpicklerObject *self,
                                       TyTypeObject *cls, TyObject *pid);

static TyObject *
_pickle_Unpickler_persistent_load(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "persistent_load",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *pid;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    pid = args[0];
    return_value = _pickle_Unpickler_persistent_load_impl((UnpicklerObject *)self, cls, pid);

exit:
    return return_value;
}

TyDoc_STRVAR(_pickle_Unpickler_load__doc__,
"load($self, /)\n"
"--\n"
"\n"
"Load a pickle.\n"
"\n"
"Read a pickled object representation from the open file object given\n"
"in the constructor, and return the reconstituted object hierarchy\n"
"specified therein.");

#define _PICKLE_UNPICKLER_LOAD_METHODDEF    \
    {"load", _PyCFunction_CAST(_pickle_Unpickler_load), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _pickle_Unpickler_load__doc__},

static TyObject *
_pickle_Unpickler_load_impl(UnpicklerObject *self, TyTypeObject *cls);

static TyObject *
_pickle_Unpickler_load(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "load() takes no arguments");
        return NULL;
    }
    return _pickle_Unpickler_load_impl((UnpicklerObject *)self, cls);
}

TyDoc_STRVAR(_pickle_Unpickler_find_class__doc__,
"find_class($self, module_name, global_name, /)\n"
"--\n"
"\n"
"Return an object from a specified module.\n"
"\n"
"If necessary, the module will be imported. Subclasses may override\n"
"this method (e.g. to restrict unpickling of arbitrary classes and\n"
"functions).\n"
"\n"
"This method is called whenever a class or a function object is\n"
"needed.  Both arguments passed are str objects.");

#define _PICKLE_UNPICKLER_FIND_CLASS_METHODDEF    \
    {"find_class", _PyCFunction_CAST(_pickle_Unpickler_find_class), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _pickle_Unpickler_find_class__doc__},

static TyObject *
_pickle_Unpickler_find_class_impl(UnpicklerObject *self, TyTypeObject *cls,
                                  TyObject *module_name,
                                  TyObject *global_name);

static TyObject *
_pickle_Unpickler_find_class(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
    #  define KWTUPLE (TyObject *)&_Ty_SINGLETON(tuple_empty)
    #else
    #  define KWTUPLE NULL
    #endif

    static const char * const _keywords[] = {"", "", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "find_class",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *module_name;
    TyObject *global_name;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    module_name = args[0];
    global_name = args[1];
    return_value = _pickle_Unpickler_find_class_impl((UnpicklerObject *)self, cls, module_name, global_name);

exit:
    return return_value;
}

TyDoc_STRVAR(_pickle_Unpickler___sizeof____doc__,
"__sizeof__($self, /)\n"
"--\n"
"\n"
"Returns size in memory, in bytes.");

#define _PICKLE_UNPICKLER___SIZEOF___METHODDEF    \
    {"__sizeof__", (PyCFunction)_pickle_Unpickler___sizeof__, METH_NOARGS, _pickle_Unpickler___sizeof____doc__},

static size_t
_pickle_Unpickler___sizeof___impl(UnpicklerObject *self);

static TyObject *
_pickle_Unpickler___sizeof__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    size_t _return_value;

    _return_value = _pickle_Unpickler___sizeof___impl((UnpicklerObject *)self);
    if ((_return_value == (size_t)-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSize_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_pickle_Unpickler___init____doc__,
"Unpickler(file, *, fix_imports=True, encoding=\'ASCII\', errors=\'strict\',\n"
"          buffers=())\n"
"--\n"
"\n"
"This takes a binary file for reading a pickle data stream.\n"
"\n"
"The protocol version of the pickle is detected automatically, so no\n"
"protocol argument is needed.  Bytes past the pickled object\'s\n"
"representation are ignored.\n"
"\n"
"The argument *file* must have two methods, a read() method that takes\n"
"an integer argument, and a readline() method that requires no\n"
"arguments.  Both methods should return bytes.  Thus *file* can be a\n"
"binary file object opened for reading, an io.BytesIO object, or any\n"
"other custom object that meets this interface.\n"
"\n"
"Optional keyword arguments are *fix_imports*, *encoding* and *errors*,\n"
"which are used to control compatibility support for pickle stream\n"
"generated by Python 2.  If *fix_imports* is True, pickle will try to\n"
"map the old Python 2 names to the new names used in Python 3.  The\n"
"*encoding* and *errors* tell pickle how to decode 8-bit string\n"
"instances pickled by Python 2; these default to \'ASCII\' and \'strict\',\n"
"respectively.  The *encoding* can be \'bytes\' to read these 8-bit\n"
"string instances as bytes objects.");

static int
_pickle_Unpickler___init___impl(UnpicklerObject *self, TyObject *file,
                                int fix_imports, const char *encoding,
                                const char *errors, TyObject *buffers);

static int
_pickle_Unpickler___init__(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(file), &_Ty_ID(fix_imports), &_Ty_ID(encoding), &_Ty_ID(errors), &_Ty_ID(buffers), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"file", "fix_imports", "encoding", "errors", "buffers", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "Unpickler",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 1;
    TyObject *file;
    int fix_imports = 1;
    const char *encoding = "ASCII";
    const char *errors = "strict";
    TyObject *buffers = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    file = fastargs[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[1]) {
        fix_imports = PyObject_IsTrue(fastargs[1]);
        if (fix_imports < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[2]) {
        if (!TyUnicode_Check(fastargs[2])) {
            _TyArg_BadArgument("Unpickler", "argument 'encoding'", "str", fastargs[2]);
            goto exit;
        }
        Ty_ssize_t encoding_length;
        encoding = TyUnicode_AsUTF8AndSize(fastargs[2], &encoding_length);
        if (encoding == NULL) {
            goto exit;
        }
        if (strlen(encoding) != (size_t)encoding_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[3]) {
        if (!TyUnicode_Check(fastargs[3])) {
            _TyArg_BadArgument("Unpickler", "argument 'errors'", "str", fastargs[3]);
            goto exit;
        }
        Ty_ssize_t errors_length;
        errors = TyUnicode_AsUTF8AndSize(fastargs[3], &errors_length);
        if (errors == NULL) {
            goto exit;
        }
        if (strlen(errors) != (size_t)errors_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    buffers = fastargs[4];
skip_optional_kwonly:
    return_value = _pickle_Unpickler___init___impl((UnpicklerObject *)self, file, fix_imports, encoding, errors, buffers);

exit:
    return return_value;
}

TyDoc_STRVAR(_pickle_UnpicklerMemoProxy_clear__doc__,
"clear($self, /)\n"
"--\n"
"\n"
"Remove all items from memo.");

#define _PICKLE_UNPICKLERMEMOPROXY_CLEAR_METHODDEF    \
    {"clear", (PyCFunction)_pickle_UnpicklerMemoProxy_clear, METH_NOARGS, _pickle_UnpicklerMemoProxy_clear__doc__},

static TyObject *
_pickle_UnpicklerMemoProxy_clear_impl(UnpicklerMemoProxyObject *self);

static TyObject *
_pickle_UnpicklerMemoProxy_clear(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _pickle_UnpicklerMemoProxy_clear_impl((UnpicklerMemoProxyObject *)self);
}

TyDoc_STRVAR(_pickle_UnpicklerMemoProxy_copy__doc__,
"copy($self, /)\n"
"--\n"
"\n"
"Copy the memo to a new object.");

#define _PICKLE_UNPICKLERMEMOPROXY_COPY_METHODDEF    \
    {"copy", (PyCFunction)_pickle_UnpicklerMemoProxy_copy, METH_NOARGS, _pickle_UnpicklerMemoProxy_copy__doc__},

static TyObject *
_pickle_UnpicklerMemoProxy_copy_impl(UnpicklerMemoProxyObject *self);

static TyObject *
_pickle_UnpicklerMemoProxy_copy(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _pickle_UnpicklerMemoProxy_copy_impl((UnpicklerMemoProxyObject *)self);
}

TyDoc_STRVAR(_pickle_UnpicklerMemoProxy___reduce____doc__,
"__reduce__($self, /)\n"
"--\n"
"\n"
"Implement pickling support.");

#define _PICKLE_UNPICKLERMEMOPROXY___REDUCE___METHODDEF    \
    {"__reduce__", (PyCFunction)_pickle_UnpicklerMemoProxy___reduce__, METH_NOARGS, _pickle_UnpicklerMemoProxy___reduce____doc__},

static TyObject *
_pickle_UnpicklerMemoProxy___reduce___impl(UnpicklerMemoProxyObject *self);

static TyObject *
_pickle_UnpicklerMemoProxy___reduce__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _pickle_UnpicklerMemoProxy___reduce___impl((UnpicklerMemoProxyObject *)self);
}

TyDoc_STRVAR(_pickle_dump__doc__,
"dump($module, /, obj, file, protocol=None, *, fix_imports=True,\n"
"     buffer_callback=None)\n"
"--\n"
"\n"
"Write a pickled representation of obj to the open file object file.\n"
"\n"
"This is equivalent to ``Pickler(file, protocol).dump(obj)``, but may\n"
"be more efficient.\n"
"\n"
"The optional *protocol* argument tells the pickler to use the given\n"
"protocol; supported protocols are 0, 1, 2, 3, 4 and 5.  The default\n"
"protocol is 5. It was introduced in Python 3.8, and is incompatible\n"
"with previous versions.\n"
"\n"
"Specifying a negative protocol version selects the highest protocol\n"
"version supported.  The higher the protocol used, the more recent the\n"
"version of Python needed to read the pickle produced.\n"
"\n"
"The *file* argument must have a write() method that accepts a single\n"
"bytes argument.  It can thus be a file object opened for binary\n"
"writing, an io.BytesIO instance, or any other custom object that meets\n"
"this interface.\n"
"\n"
"If *fix_imports* is True and protocol is less than 3, pickle will try\n"
"to map the new Python 3 names to the old module names used in Python\n"
"2, so that the pickle data stream is readable with Python 2.\n"
"\n"
"If *buffer_callback* is None (the default), buffer views are serialized\n"
"into *file* as part of the pickle stream.  It is an error if\n"
"*buffer_callback* is not None and *protocol* is None or smaller than 5.");

#define _PICKLE_DUMP_METHODDEF    \
    {"dump", _PyCFunction_CAST(_pickle_dump), METH_FASTCALL|METH_KEYWORDS, _pickle_dump__doc__},

static TyObject *
_pickle_dump_impl(TyObject *module, TyObject *obj, TyObject *file,
                  TyObject *protocol, int fix_imports,
                  TyObject *buffer_callback);

static TyObject *
_pickle_dump(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(obj), &_Ty_ID(file), &_Ty_ID(protocol), &_Ty_ID(fix_imports), &_Ty_ID(buffer_callback), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"obj", "file", "protocol", "fix_imports", "buffer_callback", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "dump",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 2;
    TyObject *obj;
    TyObject *file;
    TyObject *protocol = Ty_None;
    int fix_imports = 1;
    TyObject *buffer_callback = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    obj = args[0];
    file = args[1];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[2]) {
        protocol = args[2];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[3]) {
        fix_imports = PyObject_IsTrue(args[3]);
        if (fix_imports < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    buffer_callback = args[4];
skip_optional_kwonly:
    return_value = _pickle_dump_impl(module, obj, file, protocol, fix_imports, buffer_callback);

exit:
    return return_value;
}

TyDoc_STRVAR(_pickle_dumps__doc__,
"dumps($module, /, obj, protocol=None, *, fix_imports=True,\n"
"      buffer_callback=None)\n"
"--\n"
"\n"
"Return the pickled representation of the object as a bytes object.\n"
"\n"
"The optional *protocol* argument tells the pickler to use the given\n"
"protocol; supported protocols are 0, 1, 2, 3, 4 and 5.  The default\n"
"protocol is 5. It was introduced in Python 3.8, and is incompatible\n"
"with previous versions.\n"
"\n"
"Specifying a negative protocol version selects the highest protocol\n"
"version supported.  The higher the protocol used, the more recent the\n"
"version of Python needed to read the pickle produced.\n"
"\n"
"If *fix_imports* is True and *protocol* is less than 3, pickle will\n"
"try to map the new Python 3 names to the old module names used in\n"
"Python 2, so that the pickle data stream is readable with Python 2.\n"
"\n"
"If *buffer_callback* is None (the default), buffer views are serialized\n"
"into *file* as part of the pickle stream.  It is an error if\n"
"*buffer_callback* is not None and *protocol* is None or smaller than 5.");

#define _PICKLE_DUMPS_METHODDEF    \
    {"dumps", _PyCFunction_CAST(_pickle_dumps), METH_FASTCALL|METH_KEYWORDS, _pickle_dumps__doc__},

static TyObject *
_pickle_dumps_impl(TyObject *module, TyObject *obj, TyObject *protocol,
                   int fix_imports, TyObject *buffer_callback);

static TyObject *
_pickle_dumps(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(obj), &_Ty_ID(protocol), &_Ty_ID(fix_imports), &_Ty_ID(buffer_callback), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"obj", "protocol", "fix_imports", "buffer_callback", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "dumps",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *obj;
    TyObject *protocol = Ty_None;
    int fix_imports = 1;
    TyObject *buffer_callback = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    obj = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        protocol = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[2]) {
        fix_imports = PyObject_IsTrue(args[2]);
        if (fix_imports < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    buffer_callback = args[3];
skip_optional_kwonly:
    return_value = _pickle_dumps_impl(module, obj, protocol, fix_imports, buffer_callback);

exit:
    return return_value;
}

TyDoc_STRVAR(_pickle_load__doc__,
"load($module, /, file, *, fix_imports=True, encoding=\'ASCII\',\n"
"     errors=\'strict\', buffers=())\n"
"--\n"
"\n"
"Read and return an object from the pickle data stored in a file.\n"
"\n"
"This is equivalent to ``Unpickler(file).load()``, but may be more\n"
"efficient.\n"
"\n"
"The protocol version of the pickle is detected automatically, so no\n"
"protocol argument is needed.  Bytes past the pickled object\'s\n"
"representation are ignored.\n"
"\n"
"The argument *file* must have two methods, a read() method that takes\n"
"an integer argument, and a readline() method that requires no\n"
"arguments.  Both methods should return bytes.  Thus *file* can be a\n"
"binary file object opened for reading, an io.BytesIO object, or any\n"
"other custom object that meets this interface.\n"
"\n"
"Optional keyword arguments are *fix_imports*, *encoding* and *errors*,\n"
"which are used to control compatibility support for pickle stream\n"
"generated by Python 2.  If *fix_imports* is True, pickle will try to\n"
"map the old Python 2 names to the new names used in Python 3.  The\n"
"*encoding* and *errors* tell pickle how to decode 8-bit string\n"
"instances pickled by Python 2; these default to \'ASCII\' and \'strict\',\n"
"respectively.  The *encoding* can be \'bytes\' to read these 8-bit\n"
"string instances as bytes objects.");

#define _PICKLE_LOAD_METHODDEF    \
    {"load", _PyCFunction_CAST(_pickle_load), METH_FASTCALL|METH_KEYWORDS, _pickle_load__doc__},

static TyObject *
_pickle_load_impl(TyObject *module, TyObject *file, int fix_imports,
                  const char *encoding, const char *errors,
                  TyObject *buffers);

static TyObject *
_pickle_load(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 5
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(file), &_Ty_ID(fix_imports), &_Ty_ID(encoding), &_Ty_ID(errors), &_Ty_ID(buffers), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"file", "fix_imports", "encoding", "errors", "buffers", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "load",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *file;
    int fix_imports = 1;
    const char *encoding = "ASCII";
    const char *errors = "strict";
    TyObject *buffers = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    file = args[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[1]) {
        fix_imports = PyObject_IsTrue(args[1]);
        if (fix_imports < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[2]) {
        if (!TyUnicode_Check(args[2])) {
            _TyArg_BadArgument("load", "argument 'encoding'", "str", args[2]);
            goto exit;
        }
        Ty_ssize_t encoding_length;
        encoding = TyUnicode_AsUTF8AndSize(args[2], &encoding_length);
        if (encoding == NULL) {
            goto exit;
        }
        if (strlen(encoding) != (size_t)encoding_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[3]) {
        if (!TyUnicode_Check(args[3])) {
            _TyArg_BadArgument("load", "argument 'errors'", "str", args[3]);
            goto exit;
        }
        Ty_ssize_t errors_length;
        errors = TyUnicode_AsUTF8AndSize(args[3], &errors_length);
        if (errors == NULL) {
            goto exit;
        }
        if (strlen(errors) != (size_t)errors_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    buffers = args[4];
skip_optional_kwonly:
    return_value = _pickle_load_impl(module, file, fix_imports, encoding, errors, buffers);

exit:
    return return_value;
}

TyDoc_STRVAR(_pickle_loads__doc__,
"loads($module, data, /, *, fix_imports=True, encoding=\'ASCII\',\n"
"      errors=\'strict\', buffers=())\n"
"--\n"
"\n"
"Read and return an object from the given pickle data.\n"
"\n"
"The protocol version of the pickle is detected automatically, so no\n"
"protocol argument is needed.  Bytes past the pickled object\'s\n"
"representation are ignored.\n"
"\n"
"Optional keyword arguments are *fix_imports*, *encoding* and *errors*,\n"
"which are used to control compatibility support for pickle stream\n"
"generated by Python 2.  If *fix_imports* is True, pickle will try to\n"
"map the old Python 2 names to the new names used in Python 3.  The\n"
"*encoding* and *errors* tell pickle how to decode 8-bit string\n"
"instances pickled by Python 2; these default to \'ASCII\' and \'strict\',\n"
"respectively.  The *encoding* can be \'bytes\' to read these 8-bit\n"
"string instances as bytes objects.");

#define _PICKLE_LOADS_METHODDEF    \
    {"loads", _PyCFunction_CAST(_pickle_loads), METH_FASTCALL|METH_KEYWORDS, _pickle_loads__doc__},

static TyObject *
_pickle_loads_impl(TyObject *module, TyObject *data, int fix_imports,
                   const char *encoding, const char *errors,
                   TyObject *buffers);

static TyObject *
_pickle_loads(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(fix_imports), &_Ty_ID(encoding), &_Ty_ID(errors), &_Ty_ID(buffers), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"", "fix_imports", "encoding", "errors", "buffers", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "loads",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *data;
    int fix_imports = 1;
    const char *encoding = "ASCII";
    const char *errors = "strict";
    TyObject *buffers = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    data = args[0];
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (args[1]) {
        fix_imports = PyObject_IsTrue(args[1]);
        if (fix_imports < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[2]) {
        if (!TyUnicode_Check(args[2])) {
            _TyArg_BadArgument("loads", "argument 'encoding'", "str", args[2]);
            goto exit;
        }
        Ty_ssize_t encoding_length;
        encoding = TyUnicode_AsUTF8AndSize(args[2], &encoding_length);
        if (encoding == NULL) {
            goto exit;
        }
        if (strlen(encoding) != (size_t)encoding_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (args[3]) {
        if (!TyUnicode_Check(args[3])) {
            _TyArg_BadArgument("loads", "argument 'errors'", "str", args[3]);
            goto exit;
        }
        Ty_ssize_t errors_length;
        errors = TyUnicode_AsUTF8AndSize(args[3], &errors_length);
        if (errors == NULL) {
            goto exit;
        }
        if (strlen(errors) != (size_t)errors_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    buffers = args[4];
skip_optional_kwonly:
    return_value = _pickle_loads_impl(module, data, fix_imports, encoding, errors, buffers);

exit:
    return return_value;
}
/*[clinic end generated code: output=6331c72b3c427f63 input=a9049054013a1b77]*/
