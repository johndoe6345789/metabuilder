/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_critical_section.h"// Ty_BEGIN_CRITICAL_SECTION()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

TyDoc_STRVAR(tb_new__doc__,
"traceback(tb_next, tb_frame, tb_lasti, tb_lineno)\n"
"--\n"
"\n"
"Create a new traceback object.");

static TyObject *
tb_new_impl(TyTypeObject *type, TyObject *tb_next, PyFrameObject *tb_frame,
            int tb_lasti, int tb_lineno);

static TyObject *
tb_new(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(tb_next), &_Ty_ID(tb_frame), &_Ty_ID(tb_lasti), &_Ty_ID(tb_lineno), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"tb_next", "tb_frame", "tb_lasti", "tb_lineno", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "traceback",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[4];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    TyObject *tb_next;
    PyFrameObject *tb_frame;
    int tb_lasti;
    int tb_lineno;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 4, /*maxpos*/ 4, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    tb_next = fastargs[0];
    if (!PyObject_TypeCheck(fastargs[1], &TyFrame_Type)) {
        _TyArg_BadArgument("traceback", "argument 'tb_frame'", (&TyFrame_Type)->tp_name, fastargs[1]);
        goto exit;
    }
    tb_frame = (PyFrameObject *)fastargs[1];
    tb_lasti = TyLong_AsInt(fastargs[2]);
    if (tb_lasti == -1 && TyErr_Occurred()) {
        goto exit;
    }
    tb_lineno = TyLong_AsInt(fastargs[3]);
    if (tb_lineno == -1 && TyErr_Occurred()) {
        goto exit;
    }
    return_value = tb_new_impl(type, tb_next, tb_frame, tb_lasti, tb_lineno);

exit:
    return return_value;
}

#if !defined(traceback_tb_next_DOCSTR)
#  define traceback_tb_next_DOCSTR NULL
#endif
#if defined(TRACEBACK_TB_NEXT_GETSETDEF)
#  undef TRACEBACK_TB_NEXT_GETSETDEF
#  define TRACEBACK_TB_NEXT_GETSETDEF {"tb_next", (getter)traceback_tb_next_get, (setter)traceback_tb_next_set, traceback_tb_next_DOCSTR},
#else
#  define TRACEBACK_TB_NEXT_GETSETDEF {"tb_next", (getter)traceback_tb_next_get, NULL, traceback_tb_next_DOCSTR},
#endif

static TyObject *
traceback_tb_next_get_impl(PyTracebackObject *self);

static TyObject *
traceback_tb_next_get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = traceback_tb_next_get_impl((PyTracebackObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(traceback_tb_next_DOCSTR)
#  define traceback_tb_next_DOCSTR NULL
#endif
#if defined(TRACEBACK_TB_NEXT_GETSETDEF)
#  undef TRACEBACK_TB_NEXT_GETSETDEF
#  define TRACEBACK_TB_NEXT_GETSETDEF {"tb_next", (getter)traceback_tb_next_get, (setter)traceback_tb_next_set, traceback_tb_next_DOCSTR},
#else
#  define TRACEBACK_TB_NEXT_GETSETDEF {"tb_next", NULL, (setter)traceback_tb_next_set, NULL},
#endif

static int
traceback_tb_next_set_impl(PyTracebackObject *self, TyObject *value);

static int
traceback_tb_next_set(TyObject *self, TyObject *value, void *Py_UNUSED(context))
{
    int return_value;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = traceback_tb_next_set_impl((PyTracebackObject *)self, value);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}
/*[clinic end generated code: output=5361141395da963e input=a9049054013a1b77]*/
