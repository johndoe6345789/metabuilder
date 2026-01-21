/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_SINGLETON()
#endif
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(_elementtree_Element_append__doc__,
"append($self, subelement, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_APPEND_METHODDEF    \
    {"append", _PyCFunction_CAST(_elementtree_Element_append), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _elementtree_Element_append__doc__},

static TyObject *
_elementtree_Element_append_impl(ElementObject *self, TyTypeObject *cls,
                                 TyObject *subelement);

static TyObject *
_elementtree_Element_append(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "append",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *subelement;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!PyObject_TypeCheck(args[0], clinic_state()->Element_Type)) {
        _TyArg_BadArgument("append", "argument 1", (clinic_state()->Element_Type)->tp_name, args[0]);
        goto exit;
    }
    subelement = args[0];
    return_value = _elementtree_Element_append_impl((ElementObject *)self, cls, subelement);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element_clear__doc__,
"clear($self, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_CLEAR_METHODDEF    \
    {"clear", (PyCFunction)_elementtree_Element_clear, METH_NOARGS, _elementtree_Element_clear__doc__},

static TyObject *
_elementtree_Element_clear_impl(ElementObject *self);

static TyObject *
_elementtree_Element_clear(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _elementtree_Element_clear_impl((ElementObject *)self);
}

TyDoc_STRVAR(_elementtree_Element___copy____doc__,
"__copy__($self, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT___COPY___METHODDEF    \
    {"__copy__", _PyCFunction_CAST(_elementtree_Element___copy__), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _elementtree_Element___copy____doc__},

static TyObject *
_elementtree_Element___copy___impl(ElementObject *self, TyTypeObject *cls);

static TyObject *
_elementtree_Element___copy__(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "__copy__() takes no arguments");
        return NULL;
    }
    return _elementtree_Element___copy___impl((ElementObject *)self, cls);
}

TyDoc_STRVAR(_elementtree_Element___deepcopy____doc__,
"__deepcopy__($self, memo, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT___DEEPCOPY___METHODDEF    \
    {"__deepcopy__", (PyCFunction)_elementtree_Element___deepcopy__, METH_O, _elementtree_Element___deepcopy____doc__},

static TyObject *
_elementtree_Element___deepcopy___impl(ElementObject *self, TyObject *memo);

static TyObject *
_elementtree_Element___deepcopy__(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *memo;

    if (!TyDict_Check(arg)) {
        _TyArg_BadArgument("__deepcopy__", "argument", "dict", arg);
        goto exit;
    }
    memo = arg;
    return_value = _elementtree_Element___deepcopy___impl((ElementObject *)self, memo);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element___sizeof____doc__,
"__sizeof__($self, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT___SIZEOF___METHODDEF    \
    {"__sizeof__", (PyCFunction)_elementtree_Element___sizeof__, METH_NOARGS, _elementtree_Element___sizeof____doc__},

static size_t
_elementtree_Element___sizeof___impl(ElementObject *self);

static TyObject *
_elementtree_Element___sizeof__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;
    size_t _return_value;

    _return_value = _elementtree_Element___sizeof___impl((ElementObject *)self);
    if ((_return_value == (size_t)-1) && TyErr_Occurred()) {
        goto exit;
    }
    return_value = TyLong_FromSize_t(_return_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element___getstate____doc__,
"__getstate__($self, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT___GETSTATE___METHODDEF    \
    {"__getstate__", (PyCFunction)_elementtree_Element___getstate__, METH_NOARGS, _elementtree_Element___getstate____doc__},

static TyObject *
_elementtree_Element___getstate___impl(ElementObject *self);

static TyObject *
_elementtree_Element___getstate__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _elementtree_Element___getstate___impl((ElementObject *)self);
}

TyDoc_STRVAR(_elementtree_Element___setstate____doc__,
"__setstate__($self, state, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT___SETSTATE___METHODDEF    \
    {"__setstate__", _PyCFunction_CAST(_elementtree_Element___setstate__), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _elementtree_Element___setstate____doc__},

static TyObject *
_elementtree_Element___setstate___impl(ElementObject *self,
                                       TyTypeObject *cls, TyObject *state);

static TyObject *
_elementtree_Element___setstate__(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "__setstate__",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *state;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    state = args[0];
    return_value = _elementtree_Element___setstate___impl((ElementObject *)self, cls, state);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element_extend__doc__,
"extend($self, elements, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_EXTEND_METHODDEF    \
    {"extend", _PyCFunction_CAST(_elementtree_Element_extend), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _elementtree_Element_extend__doc__},

static TyObject *
_elementtree_Element_extend_impl(ElementObject *self, TyTypeObject *cls,
                                 TyObject *elements);

static TyObject *
_elementtree_Element_extend(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "extend",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *elements;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    elements = args[0];
    return_value = _elementtree_Element_extend_impl((ElementObject *)self, cls, elements);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element_find__doc__,
"find($self, /, path, namespaces=None)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_FIND_METHODDEF    \
    {"find", _PyCFunction_CAST(_elementtree_Element_find), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _elementtree_Element_find__doc__},

static TyObject *
_elementtree_Element_find_impl(ElementObject *self, TyTypeObject *cls,
                               TyObject *path, TyObject *namespaces);

static TyObject *
_elementtree_Element_find(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(namespaces), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "namespaces", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "find",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *path;
    TyObject *namespaces = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    path = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    namespaces = args[1];
skip_optional_pos:
    return_value = _elementtree_Element_find_impl((ElementObject *)self, cls, path, namespaces);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element_findtext__doc__,
"findtext($self, /, path, default=None, namespaces=None)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_FINDTEXT_METHODDEF    \
    {"findtext", _PyCFunction_CAST(_elementtree_Element_findtext), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _elementtree_Element_findtext__doc__},

static TyObject *
_elementtree_Element_findtext_impl(ElementObject *self, TyTypeObject *cls,
                                   TyObject *path, TyObject *default_value,
                                   TyObject *namespaces);

static TyObject *
_elementtree_Element_findtext(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 3
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(default), &_Ty_ID(namespaces), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "default", "namespaces", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "findtext",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *path;
    TyObject *default_value = Ty_None;
    TyObject *namespaces = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    path = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[1]) {
        default_value = args[1];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    namespaces = args[2];
skip_optional_pos:
    return_value = _elementtree_Element_findtext_impl((ElementObject *)self, cls, path, default_value, namespaces);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element_findall__doc__,
"findall($self, /, path, namespaces=None)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_FINDALL_METHODDEF    \
    {"findall", _PyCFunction_CAST(_elementtree_Element_findall), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _elementtree_Element_findall__doc__},

static TyObject *
_elementtree_Element_findall_impl(ElementObject *self, TyTypeObject *cls,
                                  TyObject *path, TyObject *namespaces);

static TyObject *
_elementtree_Element_findall(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(namespaces), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "namespaces", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "findall",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *path;
    TyObject *namespaces = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    path = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    namespaces = args[1];
skip_optional_pos:
    return_value = _elementtree_Element_findall_impl((ElementObject *)self, cls, path, namespaces);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element_iterfind__doc__,
"iterfind($self, /, path, namespaces=None)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_ITERFIND_METHODDEF    \
    {"iterfind", _PyCFunction_CAST(_elementtree_Element_iterfind), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _elementtree_Element_iterfind__doc__},

static TyObject *
_elementtree_Element_iterfind_impl(ElementObject *self, TyTypeObject *cls,
                                   TyObject *path, TyObject *namespaces);

static TyObject *
_elementtree_Element_iterfind(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(path), &_Ty_ID(namespaces), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"path", "namespaces", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "iterfind",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *path;
    TyObject *namespaces = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    path = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    namespaces = args[1];
skip_optional_pos:
    return_value = _elementtree_Element_iterfind_impl((ElementObject *)self, cls, path, namespaces);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element_get__doc__,
"get($self, /, key, default=None)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_GET_METHODDEF    \
    {"get", _PyCFunction_CAST(_elementtree_Element_get), METH_FASTCALL|METH_KEYWORDS, _elementtree_Element_get__doc__},

static TyObject *
_elementtree_Element_get_impl(ElementObject *self, TyObject *key,
                              TyObject *default_value);

static TyObject *
_elementtree_Element_get(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *return_value = NULL;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(key), &_Ty_ID(default), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"key", "default", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "get",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 1;
    TyObject *key;
    TyObject *default_value = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    key = args[0];
    if (!noptargs) {
        goto skip_optional_pos;
    }
    default_value = args[1];
skip_optional_pos:
    return_value = _elementtree_Element_get_impl((ElementObject *)self, key, default_value);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element_iter__doc__,
"iter($self, /, tag=None)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_ITER_METHODDEF    \
    {"iter", _PyCFunction_CAST(_elementtree_Element_iter), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _elementtree_Element_iter__doc__},

static TyObject *
_elementtree_Element_iter_impl(ElementObject *self, TyTypeObject *cls,
                               TyObject *tag);

static TyObject *
_elementtree_Element_iter(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(tag), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"tag", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "iter",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    TyObject *tag = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    tag = args[0];
skip_optional_pos:
    return_value = _elementtree_Element_iter_impl((ElementObject *)self, cls, tag);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element_itertext__doc__,
"itertext($self, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_ITERTEXT_METHODDEF    \
    {"itertext", _PyCFunction_CAST(_elementtree_Element_itertext), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _elementtree_Element_itertext__doc__},

static TyObject *
_elementtree_Element_itertext_impl(ElementObject *self, TyTypeObject *cls);

static TyObject *
_elementtree_Element_itertext(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    if (nargs || (kwnames && TyTuple_GET_SIZE(kwnames))) {
        TyErr_SetString(TyExc_TypeError, "itertext() takes no arguments");
        return NULL;
    }
    return _elementtree_Element_itertext_impl((ElementObject *)self, cls);
}

TyDoc_STRVAR(_elementtree_Element_insert__doc__,
"insert($self, index, subelement, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_INSERT_METHODDEF    \
    {"insert", _PyCFunction_CAST(_elementtree_Element_insert), METH_FASTCALL, _elementtree_Element_insert__doc__},

static TyObject *
_elementtree_Element_insert_impl(ElementObject *self, Ty_ssize_t index,
                                 TyObject *subelement);

static TyObject *
_elementtree_Element_insert(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    Ty_ssize_t index;
    TyObject *subelement;

    if (!_TyArg_CheckPositional("insert", nargs, 2, 2)) {
        goto exit;
    }
    {
        Ty_ssize_t ival = -1;
        TyObject *iobj = _PyNumber_Index(args[0]);
        if (iobj != NULL) {
            ival = TyLong_AsSsize_t(iobj);
            Ty_DECREF(iobj);
        }
        if (ival == -1 && TyErr_Occurred()) {
            goto exit;
        }
        index = ival;
    }
    if (!PyObject_TypeCheck(args[1], clinic_state()->Element_Type)) {
        _TyArg_BadArgument("insert", "argument 2", (clinic_state()->Element_Type)->tp_name, args[1]);
        goto exit;
    }
    subelement = args[1];
    return_value = _elementtree_Element_insert_impl((ElementObject *)self, index, subelement);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element_items__doc__,
"items($self, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_ITEMS_METHODDEF    \
    {"items", (PyCFunction)_elementtree_Element_items, METH_NOARGS, _elementtree_Element_items__doc__},

static TyObject *
_elementtree_Element_items_impl(ElementObject *self);

static TyObject *
_elementtree_Element_items(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _elementtree_Element_items_impl((ElementObject *)self);
}

TyDoc_STRVAR(_elementtree_Element_keys__doc__,
"keys($self, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_KEYS_METHODDEF    \
    {"keys", (PyCFunction)_elementtree_Element_keys, METH_NOARGS, _elementtree_Element_keys__doc__},

static TyObject *
_elementtree_Element_keys_impl(ElementObject *self);

static TyObject *
_elementtree_Element_keys(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _elementtree_Element_keys_impl((ElementObject *)self);
}

TyDoc_STRVAR(_elementtree_Element_makeelement__doc__,
"makeelement($self, tag, attrib, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_MAKEELEMENT_METHODDEF    \
    {"makeelement", _PyCFunction_CAST(_elementtree_Element_makeelement), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, _elementtree_Element_makeelement__doc__},

static TyObject *
_elementtree_Element_makeelement_impl(ElementObject *self, TyTypeObject *cls,
                                      TyObject *tag, TyObject *attrib);

static TyObject *
_elementtree_Element_makeelement(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "makeelement",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *tag;
    TyObject *attrib;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 2, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    tag = args[0];
    if (!TyDict_Check(args[1])) {
        _TyArg_BadArgument("makeelement", "argument 2", "dict", args[1]);
        goto exit;
    }
    attrib = args[1];
    return_value = _elementtree_Element_makeelement_impl((ElementObject *)self, cls, tag, attrib);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element_remove__doc__,
"remove($self, subelement, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_REMOVE_METHODDEF    \
    {"remove", (PyCFunction)_elementtree_Element_remove, METH_O, _elementtree_Element_remove__doc__},

static TyObject *
_elementtree_Element_remove_impl(ElementObject *self, TyObject *subelement);

static TyObject *
_elementtree_Element_remove(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *subelement;

    if (!PyObject_TypeCheck(arg, clinic_state()->Element_Type)) {
        _TyArg_BadArgument("remove", "argument", (clinic_state()->Element_Type)->tp_name, arg);
        goto exit;
    }
    subelement = arg;
    return_value = _elementtree_Element_remove_impl((ElementObject *)self, subelement);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_Element_set__doc__,
"set($self, key, value, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_ELEMENT_SET_METHODDEF    \
    {"set", _PyCFunction_CAST(_elementtree_Element_set), METH_FASTCALL, _elementtree_Element_set__doc__},

static TyObject *
_elementtree_Element_set_impl(ElementObject *self, TyObject *key,
                              TyObject *value);

static TyObject *
_elementtree_Element_set(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *key;
    TyObject *value;

    if (!_TyArg_CheckPositional("set", nargs, 2, 2)) {
        goto exit;
    }
    key = args[0];
    value = args[1];
    return_value = _elementtree_Element_set_impl((ElementObject *)self, key, value);

exit:
    return return_value;
}

static int
_elementtree_TreeBuilder___init___impl(TreeBuilderObject *self,
                                       TyObject *element_factory,
                                       TyObject *comment_factory,
                                       TyObject *pi_factory,
                                       int insert_comments, int insert_pis);

static int
_elementtree_TreeBuilder___init__(TyObject *self, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(element_factory), &_Ty_ID(comment_factory), &_Ty_ID(pi_factory), &_Ty_ID(insert_comments), &_Ty_ID(insert_pis), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"element_factory", "comment_factory", "pi_factory", "insert_comments", "insert_pis", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "TreeBuilder",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *element_factory = Ty_None;
    TyObject *comment_factory = Ty_None;
    TyObject *pi_factory = Ty_None;
    int insert_comments = 0;
    int insert_pis = 0;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (fastargs[0]) {
        element_factory = fastargs[0];
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
skip_optional_pos:
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[1]) {
        comment_factory = fastargs[1];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[2]) {
        pi_factory = fastargs[2];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[3]) {
        insert_comments = PyObject_IsTrue(fastargs[3]);
        if (insert_comments < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    insert_pis = PyObject_IsTrue(fastargs[4]);
    if (insert_pis < 0) {
        goto exit;
    }
skip_optional_kwonly:
    return_value = _elementtree_TreeBuilder___init___impl((TreeBuilderObject *)self, element_factory, comment_factory, pi_factory, insert_comments, insert_pis);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree__set_factories__doc__,
"_set_factories($module, comment_factory, pi_factory, /)\n"
"--\n"
"\n"
"Change the factories used to create comments and processing instructions.\n"
"\n"
"For internal use only.");

#define _ELEMENTTREE__SET_FACTORIES_METHODDEF    \
    {"_set_factories", _PyCFunction_CAST(_elementtree__set_factories), METH_FASTCALL, _elementtree__set_factories__doc__},

static TyObject *
_elementtree__set_factories_impl(TyObject *module, TyObject *comment_factory,
                                 TyObject *pi_factory);

static TyObject *
_elementtree__set_factories(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *comment_factory;
    TyObject *pi_factory;

    if (!_TyArg_CheckPositional("_set_factories", nargs, 2, 2)) {
        goto exit;
    }
    comment_factory = args[0];
    pi_factory = args[1];
    return_value = _elementtree__set_factories_impl(module, comment_factory, pi_factory);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_TreeBuilder_data__doc__,
"data($self, data, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_TREEBUILDER_DATA_METHODDEF    \
    {"data", (PyCFunction)_elementtree_TreeBuilder_data, METH_O, _elementtree_TreeBuilder_data__doc__},

static TyObject *
_elementtree_TreeBuilder_data_impl(TreeBuilderObject *self, TyObject *data);

static TyObject *
_elementtree_TreeBuilder_data(TyObject *self, TyObject *data)
{
    TyObject *return_value = NULL;

    return_value = _elementtree_TreeBuilder_data_impl((TreeBuilderObject *)self, data);

    return return_value;
}

TyDoc_STRVAR(_elementtree_TreeBuilder_end__doc__,
"end($self, tag, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_TREEBUILDER_END_METHODDEF    \
    {"end", (PyCFunction)_elementtree_TreeBuilder_end, METH_O, _elementtree_TreeBuilder_end__doc__},

static TyObject *
_elementtree_TreeBuilder_end_impl(TreeBuilderObject *self, TyObject *tag);

static TyObject *
_elementtree_TreeBuilder_end(TyObject *self, TyObject *tag)
{
    TyObject *return_value = NULL;

    return_value = _elementtree_TreeBuilder_end_impl((TreeBuilderObject *)self, tag);

    return return_value;
}

TyDoc_STRVAR(_elementtree_TreeBuilder_comment__doc__,
"comment($self, text, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_TREEBUILDER_COMMENT_METHODDEF    \
    {"comment", (PyCFunction)_elementtree_TreeBuilder_comment, METH_O, _elementtree_TreeBuilder_comment__doc__},

static TyObject *
_elementtree_TreeBuilder_comment_impl(TreeBuilderObject *self,
                                      TyObject *text);

static TyObject *
_elementtree_TreeBuilder_comment(TyObject *self, TyObject *text)
{
    TyObject *return_value = NULL;

    return_value = _elementtree_TreeBuilder_comment_impl((TreeBuilderObject *)self, text);

    return return_value;
}

TyDoc_STRVAR(_elementtree_TreeBuilder_pi__doc__,
"pi($self, target, text=None, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_TREEBUILDER_PI_METHODDEF    \
    {"pi", _PyCFunction_CAST(_elementtree_TreeBuilder_pi), METH_FASTCALL, _elementtree_TreeBuilder_pi__doc__},

static TyObject *
_elementtree_TreeBuilder_pi_impl(TreeBuilderObject *self, TyObject *target,
                                 TyObject *text);

static TyObject *
_elementtree_TreeBuilder_pi(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *target;
    TyObject *text = Ty_None;

    if (!_TyArg_CheckPositional("pi", nargs, 1, 2)) {
        goto exit;
    }
    target = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    text = args[1];
skip_optional:
    return_value = _elementtree_TreeBuilder_pi_impl((TreeBuilderObject *)self, target, text);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_TreeBuilder_close__doc__,
"close($self, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_TREEBUILDER_CLOSE_METHODDEF    \
    {"close", (PyCFunction)_elementtree_TreeBuilder_close, METH_NOARGS, _elementtree_TreeBuilder_close__doc__},

static TyObject *
_elementtree_TreeBuilder_close_impl(TreeBuilderObject *self);

static TyObject *
_elementtree_TreeBuilder_close(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _elementtree_TreeBuilder_close_impl((TreeBuilderObject *)self);
}

TyDoc_STRVAR(_elementtree_TreeBuilder_start__doc__,
"start($self, tag, attrs, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_TREEBUILDER_START_METHODDEF    \
    {"start", _PyCFunction_CAST(_elementtree_TreeBuilder_start), METH_FASTCALL, _elementtree_TreeBuilder_start__doc__},

static TyObject *
_elementtree_TreeBuilder_start_impl(TreeBuilderObject *self, TyObject *tag,
                                    TyObject *attrs);

static TyObject *
_elementtree_TreeBuilder_start(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *tag;
    TyObject *attrs;

    if (!_TyArg_CheckPositional("start", nargs, 2, 2)) {
        goto exit;
    }
    tag = args[0];
    if (!TyDict_Check(args[1])) {
        _TyArg_BadArgument("start", "argument 2", "dict", args[1]);
        goto exit;
    }
    attrs = args[1];
    return_value = _elementtree_TreeBuilder_start_impl((TreeBuilderObject *)self, tag, attrs);

exit:
    return return_value;
}

static int
_elementtree_XMLParser___init___impl(XMLParserObject *self, TyObject *target,
                                     const char *encoding);

static int
_elementtree_XMLParser___init__(TyObject *self, TyObject *args, TyObject *kwargs)
{
    int return_value = -1;
    #if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)

    #define NUM_KEYWORDS 2
    static struct {
        TyGC_Head _this_is_not_used;
        PyObject_VAR_HEAD
        Ty_hash_t ob_hash;
        TyObject *ob_item[NUM_KEYWORDS];
    } _kwtuple = {
        .ob_base = TyVarObject_HEAD_INIT(&TyTuple_Type, NUM_KEYWORDS)
        .ob_hash = -1,
        .ob_item = { &_Ty_ID(target), &_Ty_ID(encoding), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"target", "encoding", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "XMLParser",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    Ty_ssize_t noptargs = nargs + (kwargs ? TyDict_GET_SIZE(kwargs) : 0) - 0;
    TyObject *target = Ty_None;
    const char *encoding = NULL;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 0, /*maxpos*/ 0, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_kwonly;
    }
    if (fastargs[0]) {
        target = fastargs[0];
        if (!--noptargs) {
            goto skip_optional_kwonly;
        }
    }
    if (fastargs[1] == Ty_None) {
        encoding = NULL;
    }
    else if (TyUnicode_Check(fastargs[1])) {
        Ty_ssize_t encoding_length;
        encoding = TyUnicode_AsUTF8AndSize(fastargs[1], &encoding_length);
        if (encoding == NULL) {
            goto exit;
        }
        if (strlen(encoding) != (size_t)encoding_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
    }
    else {
        _TyArg_BadArgument("XMLParser", "argument 'encoding'", "str or None", fastargs[1]);
        goto exit;
    }
skip_optional_kwonly:
    return_value = _elementtree_XMLParser___init___impl((XMLParserObject *)self, target, encoding);

exit:
    return return_value;
}

TyDoc_STRVAR(_elementtree_XMLParser_close__doc__,
"close($self, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_XMLPARSER_CLOSE_METHODDEF    \
    {"close", (PyCFunction)_elementtree_XMLParser_close, METH_NOARGS, _elementtree_XMLParser_close__doc__},

static TyObject *
_elementtree_XMLParser_close_impl(XMLParserObject *self);

static TyObject *
_elementtree_XMLParser_close(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _elementtree_XMLParser_close_impl((XMLParserObject *)self);
}

TyDoc_STRVAR(_elementtree_XMLParser_flush__doc__,
"flush($self, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_XMLPARSER_FLUSH_METHODDEF    \
    {"flush", (PyCFunction)_elementtree_XMLParser_flush, METH_NOARGS, _elementtree_XMLParser_flush__doc__},

static TyObject *
_elementtree_XMLParser_flush_impl(XMLParserObject *self);

static TyObject *
_elementtree_XMLParser_flush(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _elementtree_XMLParser_flush_impl((XMLParserObject *)self);
}

TyDoc_STRVAR(_elementtree_XMLParser_feed__doc__,
"feed($self, data, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_XMLPARSER_FEED_METHODDEF    \
    {"feed", (PyCFunction)_elementtree_XMLParser_feed, METH_O, _elementtree_XMLParser_feed__doc__},

static TyObject *
_elementtree_XMLParser_feed_impl(XMLParserObject *self, TyObject *data);

static TyObject *
_elementtree_XMLParser_feed(TyObject *self, TyObject *data)
{
    TyObject *return_value = NULL;

    return_value = _elementtree_XMLParser_feed_impl((XMLParserObject *)self, data);

    return return_value;
}

TyDoc_STRVAR(_elementtree_XMLParser__parse_whole__doc__,
"_parse_whole($self, file, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_XMLPARSER__PARSE_WHOLE_METHODDEF    \
    {"_parse_whole", (PyCFunction)_elementtree_XMLParser__parse_whole, METH_O, _elementtree_XMLParser__parse_whole__doc__},

static TyObject *
_elementtree_XMLParser__parse_whole_impl(XMLParserObject *self,
                                         TyObject *file);

static TyObject *
_elementtree_XMLParser__parse_whole(TyObject *self, TyObject *file)
{
    TyObject *return_value = NULL;

    return_value = _elementtree_XMLParser__parse_whole_impl((XMLParserObject *)self, file);

    return return_value;
}

TyDoc_STRVAR(_elementtree_XMLParser__setevents__doc__,
"_setevents($self, events_queue, events_to_report=None, /)\n"
"--\n"
"\n");

#define _ELEMENTTREE_XMLPARSER__SETEVENTS_METHODDEF    \
    {"_setevents", _PyCFunction_CAST(_elementtree_XMLParser__setevents), METH_FASTCALL, _elementtree_XMLParser__setevents__doc__},

static TyObject *
_elementtree_XMLParser__setevents_impl(XMLParserObject *self,
                                       TyObject *events_queue,
                                       TyObject *events_to_report);

static TyObject *
_elementtree_XMLParser__setevents(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *events_queue;
    TyObject *events_to_report = Ty_None;

    if (!_TyArg_CheckPositional("_setevents", nargs, 1, 2)) {
        goto exit;
    }
    events_queue = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    events_to_report = args[1];
skip_optional:
    return_value = _elementtree_XMLParser__setevents_impl((XMLParserObject *)self, events_queue, events_to_report);

exit:
    return return_value;
}
/*[clinic end generated code: output=c863ce16d8566291 input=a9049054013a1b77]*/
