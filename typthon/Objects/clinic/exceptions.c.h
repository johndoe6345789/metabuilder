/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_critical_section.h"// Ty_BEGIN_CRITICAL_SECTION()
#include "pycore_modsupport.h"    // _TyArg_BadArgument()

TyDoc_STRVAR(BaseException___reduce____doc__,
"__reduce__($self, /)\n"
"--\n"
"\n");

#define BASEEXCEPTION___REDUCE___METHODDEF    \
    {"__reduce__", (PyCFunction)BaseException___reduce__, METH_NOARGS, BaseException___reduce____doc__},

static TyObject *
BaseException___reduce___impl(TyBaseExceptionObject *self);

static TyObject *
BaseException___reduce__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseException___reduce___impl((TyBaseExceptionObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(BaseException___setstate____doc__,
"__setstate__($self, state, /)\n"
"--\n"
"\n");

#define BASEEXCEPTION___SETSTATE___METHODDEF    \
    {"__setstate__", (PyCFunction)BaseException___setstate__, METH_O, BaseException___setstate____doc__},

static TyObject *
BaseException___setstate___impl(TyBaseExceptionObject *self, TyObject *state);

static TyObject *
BaseException___setstate__(TyObject *self, TyObject *state)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseException___setstate___impl((TyBaseExceptionObject *)self, state);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(BaseException_with_traceback__doc__,
"with_traceback($self, tb, /)\n"
"--\n"
"\n"
"Set self.__traceback__ to tb and return self.");

#define BASEEXCEPTION_WITH_TRACEBACK_METHODDEF    \
    {"with_traceback", (PyCFunction)BaseException_with_traceback, METH_O, BaseException_with_traceback__doc__},

static TyObject *
BaseException_with_traceback_impl(TyBaseExceptionObject *self, TyObject *tb);

static TyObject *
BaseException_with_traceback(TyObject *self, TyObject *tb)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseException_with_traceback_impl((TyBaseExceptionObject *)self, tb);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(BaseException_add_note__doc__,
"add_note($self, note, /)\n"
"--\n"
"\n"
"Add a note to the exception");

#define BASEEXCEPTION_ADD_NOTE_METHODDEF    \
    {"add_note", (PyCFunction)BaseException_add_note, METH_O, BaseException_add_note__doc__},

static TyObject *
BaseException_add_note_impl(TyBaseExceptionObject *self, TyObject *note);

static TyObject *
BaseException_add_note(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    TyObject *note;

    if (!TyUnicode_Check(arg)) {
        _TyArg_BadArgument("add_note", "argument", "str", arg);
        goto exit;
    }
    note = arg;
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseException_add_note_impl((TyBaseExceptionObject *)self, note);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

#if !defined(BaseException_args_DOCSTR)
#  define BaseException_args_DOCSTR NULL
#endif
#if defined(BASEEXCEPTION_ARGS_GETSETDEF)
#  undef BASEEXCEPTION_ARGS_GETSETDEF
#  define BASEEXCEPTION_ARGS_GETSETDEF {"args", (getter)BaseException_args_get, (setter)BaseException_args_set, BaseException_args_DOCSTR},
#else
#  define BASEEXCEPTION_ARGS_GETSETDEF {"args", (getter)BaseException_args_get, NULL, BaseException_args_DOCSTR},
#endif

static TyObject *
BaseException_args_get_impl(TyBaseExceptionObject *self);

static TyObject *
BaseException_args_get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseException_args_get_impl((TyBaseExceptionObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(BaseException_args_DOCSTR)
#  define BaseException_args_DOCSTR NULL
#endif
#if defined(BASEEXCEPTION_ARGS_GETSETDEF)
#  undef BASEEXCEPTION_ARGS_GETSETDEF
#  define BASEEXCEPTION_ARGS_GETSETDEF {"args", (getter)BaseException_args_get, (setter)BaseException_args_set, BaseException_args_DOCSTR},
#else
#  define BASEEXCEPTION_ARGS_GETSETDEF {"args", NULL, (setter)BaseException_args_set, NULL},
#endif

static int
BaseException_args_set_impl(TyBaseExceptionObject *self, TyObject *value);

static int
BaseException_args_set(TyObject *self, TyObject *value, void *Py_UNUSED(context))
{
    int return_value;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseException_args_set_impl((TyBaseExceptionObject *)self, value);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(BaseException___traceback___DOCSTR)
#  define BaseException___traceback___DOCSTR NULL
#endif
#if defined(BASEEXCEPTION___TRACEBACK___GETSETDEF)
#  undef BASEEXCEPTION___TRACEBACK___GETSETDEF
#  define BASEEXCEPTION___TRACEBACK___GETSETDEF {"__traceback__", (getter)BaseException___traceback___get, (setter)BaseException___traceback___set, BaseException___traceback___DOCSTR},
#else
#  define BASEEXCEPTION___TRACEBACK___GETSETDEF {"__traceback__", (getter)BaseException___traceback___get, NULL, BaseException___traceback___DOCSTR},
#endif

static TyObject *
BaseException___traceback___get_impl(TyBaseExceptionObject *self);

static TyObject *
BaseException___traceback___get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseException___traceback___get_impl((TyBaseExceptionObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(BaseException___traceback___DOCSTR)
#  define BaseException___traceback___DOCSTR NULL
#endif
#if defined(BASEEXCEPTION___TRACEBACK___GETSETDEF)
#  undef BASEEXCEPTION___TRACEBACK___GETSETDEF
#  define BASEEXCEPTION___TRACEBACK___GETSETDEF {"__traceback__", (getter)BaseException___traceback___get, (setter)BaseException___traceback___set, BaseException___traceback___DOCSTR},
#else
#  define BASEEXCEPTION___TRACEBACK___GETSETDEF {"__traceback__", NULL, (setter)BaseException___traceback___set, NULL},
#endif

static int
BaseException___traceback___set_impl(TyBaseExceptionObject *self,
                                     TyObject *value);

static int
BaseException___traceback___set(TyObject *self, TyObject *value, void *Py_UNUSED(context))
{
    int return_value;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseException___traceback___set_impl((TyBaseExceptionObject *)self, value);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(BaseException___context___DOCSTR)
#  define BaseException___context___DOCSTR NULL
#endif
#if defined(BASEEXCEPTION___CONTEXT___GETSETDEF)
#  undef BASEEXCEPTION___CONTEXT___GETSETDEF
#  define BASEEXCEPTION___CONTEXT___GETSETDEF {"__context__", (getter)BaseException___context___get, (setter)BaseException___context___set, BaseException___context___DOCSTR},
#else
#  define BASEEXCEPTION___CONTEXT___GETSETDEF {"__context__", (getter)BaseException___context___get, NULL, BaseException___context___DOCSTR},
#endif

static TyObject *
BaseException___context___get_impl(TyBaseExceptionObject *self);

static TyObject *
BaseException___context___get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseException___context___get_impl((TyBaseExceptionObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(BaseException___context___DOCSTR)
#  define BaseException___context___DOCSTR NULL
#endif
#if defined(BASEEXCEPTION___CONTEXT___GETSETDEF)
#  undef BASEEXCEPTION___CONTEXT___GETSETDEF
#  define BASEEXCEPTION___CONTEXT___GETSETDEF {"__context__", (getter)BaseException___context___get, (setter)BaseException___context___set, BaseException___context___DOCSTR},
#else
#  define BASEEXCEPTION___CONTEXT___GETSETDEF {"__context__", NULL, (setter)BaseException___context___set, NULL},
#endif

static int
BaseException___context___set_impl(TyBaseExceptionObject *self,
                                   TyObject *value);

static int
BaseException___context___set(TyObject *self, TyObject *value, void *Py_UNUSED(context))
{
    int return_value;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseException___context___set_impl((TyBaseExceptionObject *)self, value);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(BaseException___cause___DOCSTR)
#  define BaseException___cause___DOCSTR NULL
#endif
#if defined(BASEEXCEPTION___CAUSE___GETSETDEF)
#  undef BASEEXCEPTION___CAUSE___GETSETDEF
#  define BASEEXCEPTION___CAUSE___GETSETDEF {"__cause__", (getter)BaseException___cause___get, (setter)BaseException___cause___set, BaseException___cause___DOCSTR},
#else
#  define BASEEXCEPTION___CAUSE___GETSETDEF {"__cause__", (getter)BaseException___cause___get, NULL, BaseException___cause___DOCSTR},
#endif

static TyObject *
BaseException___cause___get_impl(TyBaseExceptionObject *self);

static TyObject *
BaseException___cause___get(TyObject *self, void *Py_UNUSED(context))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseException___cause___get_impl((TyBaseExceptionObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#if !defined(BaseException___cause___DOCSTR)
#  define BaseException___cause___DOCSTR NULL
#endif
#if defined(BASEEXCEPTION___CAUSE___GETSETDEF)
#  undef BASEEXCEPTION___CAUSE___GETSETDEF
#  define BASEEXCEPTION___CAUSE___GETSETDEF {"__cause__", (getter)BaseException___cause___get, (setter)BaseException___cause___set, BaseException___cause___DOCSTR},
#else
#  define BASEEXCEPTION___CAUSE___GETSETDEF {"__cause__", NULL, (setter)BaseException___cause___set, NULL},
#endif

static int
BaseException___cause___set_impl(TyBaseExceptionObject *self,
                                 TyObject *value);

static int
BaseException___cause___set(TyObject *self, TyObject *value, void *Py_UNUSED(context))
{
    int return_value;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseException___cause___set_impl((TyBaseExceptionObject *)self, value);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(BaseExceptionGroup_derive__doc__,
"derive($self, excs, /)\n"
"--\n"
"\n");

#define BASEEXCEPTIONGROUP_DERIVE_METHODDEF    \
    {"derive", (PyCFunction)BaseExceptionGroup_derive, METH_O, BaseExceptionGroup_derive__doc__},

static TyObject *
BaseExceptionGroup_derive_impl(TyBaseExceptionGroupObject *self,
                               TyObject *excs);

static TyObject *
BaseExceptionGroup_derive(TyObject *self, TyObject *excs)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseExceptionGroup_derive_impl((TyBaseExceptionGroupObject *)self, excs);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(BaseExceptionGroup_split__doc__,
"split($self, matcher_value, /)\n"
"--\n"
"\n");

#define BASEEXCEPTIONGROUP_SPLIT_METHODDEF    \
    {"split", (PyCFunction)BaseExceptionGroup_split, METH_O, BaseExceptionGroup_split__doc__},

static TyObject *
BaseExceptionGroup_split_impl(TyBaseExceptionGroupObject *self,
                              TyObject *matcher_value);

static TyObject *
BaseExceptionGroup_split(TyObject *self, TyObject *matcher_value)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseExceptionGroup_split_impl((TyBaseExceptionGroupObject *)self, matcher_value);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(BaseExceptionGroup_subgroup__doc__,
"subgroup($self, matcher_value, /)\n"
"--\n"
"\n");

#define BASEEXCEPTIONGROUP_SUBGROUP_METHODDEF    \
    {"subgroup", (PyCFunction)BaseExceptionGroup_subgroup, METH_O, BaseExceptionGroup_subgroup__doc__},

static TyObject *
BaseExceptionGroup_subgroup_impl(TyBaseExceptionGroupObject *self,
                                 TyObject *matcher_value);

static TyObject *
BaseExceptionGroup_subgroup(TyObject *self, TyObject *matcher_value)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = BaseExceptionGroup_subgroup_impl((TyBaseExceptionGroupObject *)self, matcher_value);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}
/*[clinic end generated code: output=fcf70b3b71f3d14a input=a9049054013a1b77]*/
