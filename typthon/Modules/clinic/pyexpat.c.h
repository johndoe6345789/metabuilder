/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_SINGLETON()
#endif
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(pyexpat_xmlparser_SetReparseDeferralEnabled__doc__,
"SetReparseDeferralEnabled($self, enabled, /)\n"
"--\n"
"\n"
"Enable/Disable reparse deferral; enabled by default with Expat >=2.6.0.");

#define PYEXPAT_XMLPARSER_SETREPARSEDEFERRALENABLED_METHODDEF    \
    {"SetReparseDeferralEnabled", (PyCFunction)pyexpat_xmlparser_SetReparseDeferralEnabled, METH_O, pyexpat_xmlparser_SetReparseDeferralEnabled__doc__},

static TyObject *
pyexpat_xmlparser_SetReparseDeferralEnabled_impl(xmlparseobject *self,
                                                 int enabled);

static TyObject *
pyexpat_xmlparser_SetReparseDeferralEnabled(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    int enabled;

    enabled = PyObject_IsTrue(arg);
    if (enabled < 0) {
        goto exit;
    }
    return_value = pyexpat_xmlparser_SetReparseDeferralEnabled_impl((xmlparseobject *)self, enabled);

exit:
    return return_value;
}

TyDoc_STRVAR(pyexpat_xmlparser_GetReparseDeferralEnabled__doc__,
"GetReparseDeferralEnabled($self, /)\n"
"--\n"
"\n"
"Retrieve reparse deferral enabled status; always returns false with Expat <2.6.0.");

#define PYEXPAT_XMLPARSER_GETREPARSEDEFERRALENABLED_METHODDEF    \
    {"GetReparseDeferralEnabled", (PyCFunction)pyexpat_xmlparser_GetReparseDeferralEnabled, METH_NOARGS, pyexpat_xmlparser_GetReparseDeferralEnabled__doc__},

static TyObject *
pyexpat_xmlparser_GetReparseDeferralEnabled_impl(xmlparseobject *self);

static TyObject *
pyexpat_xmlparser_GetReparseDeferralEnabled(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return pyexpat_xmlparser_GetReparseDeferralEnabled_impl((xmlparseobject *)self);
}

TyDoc_STRVAR(pyexpat_xmlparser_Parse__doc__,
"Parse($self, data, isfinal=False, /)\n"
"--\n"
"\n"
"Parse XML data.\n"
"\n"
"\'isfinal\' should be true at end of input.");

#define PYEXPAT_XMLPARSER_PARSE_METHODDEF    \
    {"Parse", _PyCFunction_CAST(pyexpat_xmlparser_Parse), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, pyexpat_xmlparser_Parse__doc__},

static TyObject *
pyexpat_xmlparser_Parse_impl(xmlparseobject *self, TyTypeObject *cls,
                             TyObject *data, int isfinal);

static TyObject *
pyexpat_xmlparser_Parse(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "Parse",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    TyObject *data;
    int isfinal = 0;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    data = args[0];
    if (nargs < 2) {
        goto skip_optional_posonly;
    }
    isfinal = PyObject_IsTrue(args[1]);
    if (isfinal < 0) {
        goto exit;
    }
skip_optional_posonly:
    return_value = pyexpat_xmlparser_Parse_impl((xmlparseobject *)self, cls, data, isfinal);

exit:
    return return_value;
}

TyDoc_STRVAR(pyexpat_xmlparser_ParseFile__doc__,
"ParseFile($self, file, /)\n"
"--\n"
"\n"
"Parse XML data from file-like object.");

#define PYEXPAT_XMLPARSER_PARSEFILE_METHODDEF    \
    {"ParseFile", _PyCFunction_CAST(pyexpat_xmlparser_ParseFile), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, pyexpat_xmlparser_ParseFile__doc__},

static TyObject *
pyexpat_xmlparser_ParseFile_impl(xmlparseobject *self, TyTypeObject *cls,
                                 TyObject *file);

static TyObject *
pyexpat_xmlparser_ParseFile(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "ParseFile",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    TyObject *file;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    file = args[0];
    return_value = pyexpat_xmlparser_ParseFile_impl((xmlparseobject *)self, cls, file);

exit:
    return return_value;
}

TyDoc_STRVAR(pyexpat_xmlparser_SetBase__doc__,
"SetBase($self, base, /)\n"
"--\n"
"\n"
"Set the base URL for the parser.");

#define PYEXPAT_XMLPARSER_SETBASE_METHODDEF    \
    {"SetBase", (PyCFunction)pyexpat_xmlparser_SetBase, METH_O, pyexpat_xmlparser_SetBase__doc__},

static TyObject *
pyexpat_xmlparser_SetBase_impl(xmlparseobject *self, const char *base);

static TyObject *
pyexpat_xmlparser_SetBase(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    const char *base;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("SetBase", "argument", "str", arg);
        goto exit;
    }
    Ty_ssize_t base_length;
    base = TyUnicode_AsUTF8AndSize(arg, &base_length);
    if (base == NULL) {
        goto exit;
    }
    if (strlen(base) != (size_t)base_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    return_value = pyexpat_xmlparser_SetBase_impl((xmlparseobject *)self, base);

exit:
    return return_value;
}

TyDoc_STRVAR(pyexpat_xmlparser_GetBase__doc__,
"GetBase($self, /)\n"
"--\n"
"\n"
"Return base URL string for the parser.");

#define PYEXPAT_XMLPARSER_GETBASE_METHODDEF    \
    {"GetBase", (PyCFunction)pyexpat_xmlparser_GetBase, METH_NOARGS, pyexpat_xmlparser_GetBase__doc__},

static TyObject *
pyexpat_xmlparser_GetBase_impl(xmlparseobject *self);

static TyObject *
pyexpat_xmlparser_GetBase(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return pyexpat_xmlparser_GetBase_impl((xmlparseobject *)self);
}

TyDoc_STRVAR(pyexpat_xmlparser_GetInputContext__doc__,
"GetInputContext($self, /)\n"
"--\n"
"\n"
"Return the untranslated text of the input that caused the current event.\n"
"\n"
"If the event was generated by a large amount of text (such as a start tag\n"
"for an element with many attributes), not all of the text may be available.");

#define PYEXPAT_XMLPARSER_GETINPUTCONTEXT_METHODDEF    \
    {"GetInputContext", (PyCFunction)pyexpat_xmlparser_GetInputContext, METH_NOARGS, pyexpat_xmlparser_GetInputContext__doc__},

static TyObject *
pyexpat_xmlparser_GetInputContext_impl(xmlparseobject *self);

static TyObject *
pyexpat_xmlparser_GetInputContext(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return pyexpat_xmlparser_GetInputContext_impl((xmlparseobject *)self);
}

TyDoc_STRVAR(pyexpat_xmlparser_ExternalEntityParserCreate__doc__,
"ExternalEntityParserCreate($self, context, encoding=<unrepresentable>,\n"
"                           /)\n"
"--\n"
"\n"
"Create a parser for parsing an external entity based on the information passed to the ExternalEntityRefHandler.");

#define PYEXPAT_XMLPARSER_EXTERNALENTITYPARSERCREATE_METHODDEF    \
    {"ExternalEntityParserCreate", _PyCFunction_CAST(pyexpat_xmlparser_ExternalEntityParserCreate), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, pyexpat_xmlparser_ExternalEntityParserCreate__doc__},

static TyObject *
pyexpat_xmlparser_ExternalEntityParserCreate_impl(xmlparseobject *self,
                                                  TyTypeObject *cls,
                                                  const char *context,
                                                  const char *encoding);

static TyObject *
pyexpat_xmlparser_ExternalEntityParserCreate(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "ExternalEntityParserCreate",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    const char *context;
    const char *encoding = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 1, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (args[0] == Ty_None) {
        context = NULL;
    }
    else if (TyUnicode_Check(args[0])) {
        Ty_ssize_t context_length;
        context = TyUnicode_AsUTF8AndSize(args[0], &context_length);
        if (context == NULL) {
            goto exit;
        }
        if (strlen(context) != (size_t)context_length) {
            TyErr_SetString(TyExc_ValueError, "embedded null character");
            goto exit;
        }
    }
    else {
        _TyArg_BadArgument("ExternalEntityParserCreate", "argument 1", "str or None", args[0]);
        goto exit;
    }
    if (nargs < 2) {
        goto skip_optional_posonly;
    }
    if (!TyUnicode_Check(args[1])) {
        _TyArg_BadArgument("ExternalEntityParserCreate", "argument 2", "str", args[1]);
        goto exit;
    }
    Ty_ssize_t encoding_length;
    encoding = TyUnicode_AsUTF8AndSize(args[1], &encoding_length);
    if (encoding == NULL) {
        goto exit;
    }
    if (strlen(encoding) != (size_t)encoding_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
skip_optional_posonly:
    return_value = pyexpat_xmlparser_ExternalEntityParserCreate_impl((xmlparseobject *)self, cls, context, encoding);

exit:
    return return_value;
}

TyDoc_STRVAR(pyexpat_xmlparser_SetParamEntityParsing__doc__,
"SetParamEntityParsing($self, flag, /)\n"
"--\n"
"\n"
"Controls parsing of parameter entities (including the external DTD subset).\n"
"\n"
"Possible flag values are XML_PARAM_ENTITY_PARSING_NEVER,\n"
"XML_PARAM_ENTITY_PARSING_UNLESS_STANDALONE and\n"
"XML_PARAM_ENTITY_PARSING_ALWAYS. Returns true if setting the flag\n"
"was successful.");

#define PYEXPAT_XMLPARSER_SETPARAMENTITYPARSING_METHODDEF    \
    {"SetParamEntityParsing", (PyCFunction)pyexpat_xmlparser_SetParamEntityParsing, METH_O, pyexpat_xmlparser_SetParamEntityParsing__doc__},

static TyObject *
pyexpat_xmlparser_SetParamEntityParsing_impl(xmlparseobject *self, int flag);

static TyObject *
pyexpat_xmlparser_SetParamEntityParsing(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    int flag;

    flag = TyLong_AsInt(arg);
    if (flag == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = pyexpat_xmlparser_SetParamEntityParsing_impl((xmlparseobject *)self, flag);

exit:
    return return_value;
}

#if (XML_COMBINED_VERSION >= 19505)

TyDoc_STRVAR(pyexpat_xmlparser_UseForeignDTD__doc__,
"UseForeignDTD($self, flag=True, /)\n"
"--\n"
"\n"
"Allows the application to provide an artificial external subset if one is not specified as part of the document instance.\n"
"\n"
"This readily allows the use of a \'default\' document type controlled by the\n"
"application, while still getting the advantage of providing document type\n"
"information to the parser. \'flag\' defaults to True if not provided.");

#define PYEXPAT_XMLPARSER_USEFOREIGNDTD_METHODDEF    \
    {"UseForeignDTD", _PyCFunction_CAST(pyexpat_xmlparser_UseForeignDTD), METH_METHOD|METH_FASTCALL|METH_KEYWORDS, pyexpat_xmlparser_UseForeignDTD__doc__},

static TyObject *
pyexpat_xmlparser_UseForeignDTD_impl(xmlparseobject *self, TyTypeObject *cls,
                                     int flag);

static TyObject *
pyexpat_xmlparser_UseForeignDTD(TyObject *self, TyTypeObject *cls, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .fname = "UseForeignDTD",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[1];
    int flag = 1;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 1, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional_posonly;
    }
    flag = PyObject_IsTrue(args[0]);
    if (flag < 0) {
        goto exit;
    }
skip_optional_posonly:
    return_value = pyexpat_xmlparser_UseForeignDTD_impl((xmlparseobject *)self, cls, flag);

exit:
    return return_value;
}

#endif /* (XML_COMBINED_VERSION >= 19505) */

TyDoc_STRVAR(pyexpat_ParserCreate__doc__,
"ParserCreate($module, /, encoding=None, namespace_separator=None,\n"
"             intern=<unrepresentable>)\n"
"--\n"
"\n"
"Return a new XML parser object.");

#define PYEXPAT_PARSERCREATE_METHODDEF    \
    {"ParserCreate", _PyCFunction_CAST(pyexpat_ParserCreate), METH_FASTCALL|METH_KEYWORDS, pyexpat_ParserCreate__doc__},

static TyObject *
pyexpat_ParserCreate_impl(TyObject *module, const char *encoding,
                          const char *namespace_separator, TyObject *intern);

static TyObject *
pyexpat_ParserCreate(TyObject *module, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(encoding), &_Ty_ID(namespace_separator), &_Ty_ID(intern), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"encoding", "namespace_separator", "intern", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "ParserCreate",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[3];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    const char *encoding = NULL;
    const char *namespace_separator = NULL;
    TyObject *intern = NULL;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 3, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        if (args[0] == Ty_None) {
            encoding = NULL;
        }
        else if (TyUnicode_Check(args[0])) {
            Ty_ssize_t encoding_length;
            encoding = TyUnicode_AsUTF8AndSize(args[0], &encoding_length);
            if (encoding == NULL) {
                goto exit;
            }
            if (strlen(encoding) != (size_t)encoding_length) {
                TyErr_SetString(TyExc_ValueError, "embedded null character");
                goto exit;
            }
        }
        else {
            _TyArg_BadArgument("ParserCreate", "argument 'encoding'", "str or None", args[0]);
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    if (args[1]) {
        if (args[1] == Ty_None) {
            namespace_separator = NULL;
        }
        else if (TyUnicode_Check(args[1])) {
            Ty_ssize_t namespace_separator_length;
            namespace_separator = TyUnicode_AsUTF8AndSize(args[1], &namespace_separator_length);
            if (namespace_separator == NULL) {
                goto exit;
            }
            if (strlen(namespace_separator) != (size_t)namespace_separator_length) {
                TyErr_SetString(TyExc_ValueError, "embedded null character");
                goto exit;
            }
        }
        else {
            _TyArg_BadArgument("ParserCreate", "argument 'namespace_separator'", "str or None", args[1]);
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    intern = args[2];
skip_optional_pos:
    return_value = pyexpat_ParserCreate_impl(module, encoding, namespace_separator, intern);

exit:
    return return_value;
}

TyDoc_STRVAR(pyexpat_ErrorString__doc__,
"ErrorString($module, code, /)\n"
"--\n"
"\n"
"Returns string error for given number.");

#define PYEXPAT_ERRORSTRING_METHODDEF    \
    {"ErrorString", (PyCFunction)pyexpat_ErrorString, METH_O, pyexpat_ErrorString__doc__},

static TyObject *
pyexpat_ErrorString_impl(TyObject *module, long code);

static TyObject *
pyexpat_ErrorString(TyObject *module, TyObject *arg)
{
    TyObject *return_value = NULL;
    long code;

    code = TyLong_AsLong(arg);
    if (code == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = pyexpat_ErrorString_impl(module, code);

exit:
    return return_value;
}

#ifndef PYEXPAT_XMLPARSER_USEFOREIGNDTD_METHODDEF
    #define PYEXPAT_XMLPARSER_USEFOREIGNDTD_METHODDEF
#endif /* !defined(PYEXPAT_XMLPARSER_USEFOREIGNDTD_METHODDEF) */
/*[clinic end generated code: output=4dbdc959c67dc2d5 input=a9049054013a1b77]*/
