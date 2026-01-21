/* Built-in functions */

#include "Python.h"
#include "pycore_ast.h"           // _TyAST_Validate()
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_ceval.h"         // _TyEval_Vector()
#include "pycore_compile.h"       // _TyAST_Compile()
#include "pycore_fileutils.h"     // _PyFile_Flush
#include "pycore_floatobject.h"   // _TyFloat_ExactDealloc()
#include "pycore_interp.h"        // _TyInterpreterState_GetConfig()
#include "pycore_long.h"          // _TyLong_CompactValue
#include "pycore_modsupport.h"    // _TyArg_NoKwnames()
#include "pycore_object.h"        // _Ty_AddToAllObjects()
#include "pycore_pyerrors.h"      // _TyErr_NoMemory()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_pythonrun.h"     // _Ty_SourceAsString()
#include "pycore_sysmodule.h"     // _TySys_GetRequiredAttr()
#include "pycore_tuple.h"         // _TyTuple_FromArray()
#include "pycore_cell.h"          // TyCell_GetRef()

#include "clinic/bltinmodule.c.h"

#ifdef HAVE_UNISTD_H
#  include <unistd.h>             // isatty()
#endif


static TyObject*
update_bases(TyObject *bases, TyObject *const *args, Ty_ssize_t nargs)
{
    Ty_ssize_t i, j;
    TyObject *base, *meth, *new_base, *result, *new_bases = NULL;
    assert(TyTuple_Check(bases));

    for (i = 0; i < nargs; i++) {
        base  = args[i];
        if (TyType_Check(base)) {
            if (new_bases) {
                /* If we already have made a replacement, then we append every normal base,
                   otherwise just skip it. */
                if (TyList_Append(new_bases, base) < 0) {
                    goto error;
                }
            }
            continue;
        }
        if (PyObject_GetOptionalAttr(base, &_Ty_ID(__mro_entries__), &meth) < 0) {
            goto error;
        }
        if (!meth) {
            if (new_bases) {
                if (TyList_Append(new_bases, base) < 0) {
                    goto error;
                }
            }
            continue;
        }
        new_base = PyObject_CallOneArg(meth, bases);
        Ty_DECREF(meth);
        if (!new_base) {
            goto error;
        }
        if (!TyTuple_Check(new_base)) {
            TyErr_SetString(TyExc_TypeError,
                            "__mro_entries__ must return a tuple");
            Ty_DECREF(new_base);
            goto error;
        }
        if (!new_bases) {
            /* If this is a first successful replacement, create new_bases list and
               copy previously encountered bases. */
            if (!(new_bases = TyList_New(i))) {
                Ty_DECREF(new_base);
                goto error;
            }
            for (j = 0; j < i; j++) {
                base = args[j];
                TyList_SET_ITEM(new_bases, j, Ty_NewRef(base));
            }
        }
        j = TyList_GET_SIZE(new_bases);
        if (TyList_SetSlice(new_bases, j, j, new_base) < 0) {
            Ty_DECREF(new_base);
            goto error;
        }
        Ty_DECREF(new_base);
    }
    if (!new_bases) {
        return bases;
    }
    result = TyList_AsTuple(new_bases);
    Ty_DECREF(new_bases);
    return result;

error:
    Ty_XDECREF(new_bases);
    return NULL;
}

/* AC: cannot convert yet, waiting for *args support */
static TyObject *
builtin___build_class__(TyObject *self, TyObject *const *args, Ty_ssize_t nargs,
                        TyObject *kwnames)
{
    TyObject *func, *name, *winner, *prep;
    TyObject *cls = NULL, *cell = NULL, *ns = NULL, *meta = NULL, *orig_bases = NULL;
    TyObject *mkw = NULL, *bases = NULL;
    int isclass = 0;   /* initialize to prevent gcc warning */

    if (nargs < 2) {
        TyErr_SetString(TyExc_TypeError,
                        "__build_class__: not enough arguments");
        return NULL;
    }
    func = args[0];   /* Better be callable */
    if (!TyFunction_Check(func)) {
        TyErr_SetString(TyExc_TypeError,
                        "__build_class__: func must be a function");
        return NULL;
    }
    name = args[1];
    if (!TyUnicode_Check(name)) {
        TyErr_SetString(TyExc_TypeError,
                        "__build_class__: name is not a string");
        return NULL;
    }
    orig_bases = _TyTuple_FromArray(args + 2, nargs - 2);
    if (orig_bases == NULL)
        return NULL;

    bases = update_bases(orig_bases, args + 2, nargs - 2);
    if (bases == NULL) {
        Ty_DECREF(orig_bases);
        return NULL;
    }

    if (kwnames == NULL) {
        meta = NULL;
        mkw = NULL;
    }
    else {
        mkw = _PyStack_AsDict(args + nargs, kwnames);
        if (mkw == NULL) {
            goto error;
        }

        if (TyDict_Pop(mkw, &_Ty_ID(metaclass), &meta) < 0) {
            goto error;
        }
        if (meta != NULL) {
            /* metaclass is explicitly given, check if it's indeed a class */
            isclass = TyType_Check(meta);
        }
    }
    if (meta == NULL) {
        /* if there are no bases, use type: */
        if (TyTuple_GET_SIZE(bases) == 0) {
            meta = (TyObject *) (&TyType_Type);
        }
        /* else get the type of the first base */
        else {
            TyObject *base0 = TyTuple_GET_ITEM(bases, 0);
            meta = (TyObject *)Ty_TYPE(base0);
        }
        Ty_INCREF(meta);
        isclass = 1;  /* meta is really a class */
    }

    if (isclass) {
        /* meta is really a class, so check for a more derived
           metaclass, or possible metaclass conflicts: */
        winner = (TyObject *)_TyType_CalculateMetaclass((TyTypeObject *)meta,
                                                        bases);
        if (winner == NULL) {
            goto error;
        }
        if (winner != meta) {
            Ty_SETREF(meta, Ty_NewRef(winner));
        }
    }
    /* else: meta is not a class, so we cannot do the metaclass
       calculation, so we will use the explicitly given object as it is */
    if (PyObject_GetOptionalAttr(meta, &_Ty_ID(__prepare__), &prep) < 0) {
        ns = NULL;
    }
    else if (prep == NULL) {
        ns = TyDict_New();
    }
    else {
        TyObject *pargs[2] = {name, bases};
        ns = PyObject_VectorcallDict(prep, pargs, 2, mkw);
        Ty_DECREF(prep);
    }
    if (ns == NULL) {
        goto error;
    }
    if (!PyMapping_Check(ns)) {
        TyErr_Format(TyExc_TypeError,
                     "%.200s.__prepare__() must return a mapping, not %.200s",
                     isclass ? ((TyTypeObject *)meta)->tp_name : "<metaclass>",
                     Ty_TYPE(ns)->tp_name);
        goto error;
    }
    TyThreadState *tstate = _TyThreadState_GET();
    EVAL_CALL_STAT_INC(EVAL_CALL_BUILD_CLASS);
    cell = _TyEval_Vector(tstate, (PyFunctionObject *)func, ns, NULL, 0, NULL);
    if (cell != NULL) {
        if (bases != orig_bases) {
            if (PyMapping_SetItemString(ns, "__orig_bases__", orig_bases) < 0) {
                goto error;
            }
        }
        TyObject *margs[3] = {name, bases, ns};
        cls = PyObject_VectorcallDict(meta, margs, 3, mkw);
        if (cls != NULL && TyType_Check(cls) && TyCell_Check(cell)) {
            TyObject *cell_cls = TyCell_GetRef((PyCellObject *)cell);
            if (cell_cls != cls) {
                if (cell_cls == NULL) {
                    const char *msg =
                        "__class__ not set defining %.200R as %.200R. "
                        "Was __classcell__ propagated to type.__new__?";
                    TyErr_Format(TyExc_RuntimeError, msg, name, cls);
                } else {
                    const char *msg =
                        "__class__ set to %.200R defining %.200R as %.200R";
                    TyErr_Format(TyExc_TypeError, msg, cell_cls, name, cls);
                }
                Ty_XDECREF(cell_cls);
                Ty_SETREF(cls, NULL);
                goto error;
            }
            else {
                Ty_DECREF(cell_cls);
            }
        }
    }
error:
    Ty_XDECREF(cell);
    Ty_XDECREF(ns);
    Ty_XDECREF(meta);
    Ty_XDECREF(mkw);
    if (bases != orig_bases) {
        Ty_DECREF(orig_bases);
    }
    Ty_DECREF(bases);
    return cls;
}

TyDoc_STRVAR(build_class_doc,
"__build_class__(func, name, /, *bases, [metaclass], **kwds) -> class\n\
\n\
Internal helper function used by the class statement.");

/*[clinic input]
__import__ as builtin___import__

    name: object
    globals: object(c_default="NULL") = None
    locals: object(c_default="NULL") = None
    fromlist: object(c_default="NULL") = ()
    level: int = 0

Import a module.

Because this function is meant for use by the Python
interpreter and not for general use, it is better to use
importlib.import_module() to programmatically import a module.

The globals argument is only used to determine the context;
they are not modified.  The locals argument is unused.  The fromlist
should be a list of names to emulate ``from name import ...``, or an
empty list to emulate ``import name``.
When importing a module from a package, note that __import__('A.B', ...)
returns package A when fromlist is empty, but its submodule B when
fromlist is not empty.  The level argument is used to determine whether to
perform absolute or relative imports: 0 is absolute, while a positive number
is the number of parent directories to search relative to the current module.
[clinic start generated code]*/

static TyObject *
builtin___import___impl(TyObject *module, TyObject *name, TyObject *globals,
                        TyObject *locals, TyObject *fromlist, int level)
/*[clinic end generated code: output=4febeda88a0cd245 input=73f4b960ea5b9dd6]*/
{
    return TyImport_ImportModuleLevelObject(name, globals, locals,
                                            fromlist, level);
}


/*[clinic input]
abs as builtin_abs

    x: object
    /

Return the absolute value of the argument.
[clinic start generated code]*/

static TyObject *
builtin_abs(TyObject *module, TyObject *x)
/*[clinic end generated code: output=b1b433b9e51356f5 input=bed4ca14e29c20d1]*/
{
    return PyNumber_Absolute(x);
}

/*[clinic input]
all as builtin_all

    iterable: object
    /

Return True if bool(x) is True for all values x in the iterable.

If the iterable is empty, return True.
[clinic start generated code]*/

static TyObject *
builtin_all(TyObject *module, TyObject *iterable)
/*[clinic end generated code: output=ca2a7127276f79b3 input=1a7c5d1bc3438a21]*/
{
    TyObject *it, *item;
    TyObject *(*iternext)(TyObject *);
    int cmp;

    it = PyObject_GetIter(iterable);
    if (it == NULL)
        return NULL;
    iternext = *Ty_TYPE(it)->tp_iternext;

    for (;;) {
        item = iternext(it);
        if (item == NULL)
            break;
        cmp = PyObject_IsTrue(item);
        Ty_DECREF(item);
        if (cmp < 0) {
            Ty_DECREF(it);
            return NULL;
        }
        if (cmp == 0) {
            Ty_DECREF(it);
            Py_RETURN_FALSE;
        }
    }
    Ty_DECREF(it);
    if (TyErr_Occurred()) {
        if (TyErr_ExceptionMatches(TyExc_StopIteration))
            TyErr_Clear();
        else
            return NULL;
    }
    Py_RETURN_TRUE;
}

/*[clinic input]
any as builtin_any

    iterable: object
    /

Return True if bool(x) is True for any x in the iterable.

If the iterable is empty, return False.
[clinic start generated code]*/

static TyObject *
builtin_any(TyObject *module, TyObject *iterable)
/*[clinic end generated code: output=fa65684748caa60e input=41d7451c23384f24]*/
{
    TyObject *it, *item;
    TyObject *(*iternext)(TyObject *);
    int cmp;

    it = PyObject_GetIter(iterable);
    if (it == NULL)
        return NULL;
    iternext = *Ty_TYPE(it)->tp_iternext;

    for (;;) {
        item = iternext(it);
        if (item == NULL)
            break;
        cmp = PyObject_IsTrue(item);
        Ty_DECREF(item);
        if (cmp < 0) {
            Ty_DECREF(it);
            return NULL;
        }
        if (cmp > 0) {
            Ty_DECREF(it);
            Py_RETURN_TRUE;
        }
    }
    Ty_DECREF(it);
    if (TyErr_Occurred()) {
        if (TyErr_ExceptionMatches(TyExc_StopIteration))
            TyErr_Clear();
        else
            return NULL;
    }
    Py_RETURN_FALSE;
}

/*[clinic input]
ascii as builtin_ascii

    obj: object
    /

Return an ASCII-only representation of an object.

As repr(), return a string containing a printable representation of an
object, but escape the non-ASCII characters in the string returned by
repr() using \\x, \\u or \\U escapes. This generates a string similar
to that returned by repr() in Python 2.
[clinic start generated code]*/

static TyObject *
builtin_ascii(TyObject *module, TyObject *obj)
/*[clinic end generated code: output=6d37b3f0984c7eb9 input=4c62732e1b3a3cc9]*/
{
    return PyObject_ASCII(obj);
}


/*[clinic input]
bin as builtin_bin

    number: object
    /

Return the binary representation of an integer.

   >>> bin(2796202)
   '0b1010101010101010101010'
[clinic start generated code]*/

static TyObject *
builtin_bin(TyObject *module, TyObject *number)
/*[clinic end generated code: output=b6fc4ad5e649f4f7 input=53f8a0264bacaf90]*/
{
    return PyNumber_ToBase(number, 2);
}


/*[clinic input]
callable as builtin_callable

    obj: object
    /

Return whether the object is callable (i.e., some kind of function).

Note that classes are callable, as are instances of classes with a
__call__() method.
[clinic start generated code]*/

static TyObject *
builtin_callable(TyObject *module, TyObject *obj)
/*[clinic end generated code: output=2b095d59d934cb7e input=1423bab99cc41f58]*/
{
    return TyBool_FromLong((long)PyCallable_Check(obj));
}

static TyObject *
builtin_breakpoint(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *keywords)
{
    TyObject *hook = _TySys_GetRequiredAttrString("breakpointhook");
    if (hook == NULL) {
        return NULL;
    }

    if (TySys_Audit("builtins.breakpoint", "O", hook) < 0) {
        Ty_DECREF(hook);
        return NULL;
    }

    TyObject *retval = PyObject_Vectorcall(hook, args, nargs, keywords);
    Ty_DECREF(hook);
    return retval;
}

TyDoc_STRVAR(breakpoint_doc,
"breakpoint($module, /, *args, **kws)\n\
--\n\
\n\
Call sys.breakpointhook(*args, **kws).  sys.breakpointhook() must accept\n\
whatever arguments are passed.\n\
\n\
By default, this drops you into the pdb debugger.");

typedef struct {
    PyObject_HEAD
    TyObject *func;
    TyObject *it;
} filterobject;

#define _filterobject_CAST(op)      ((filterobject *)(op))

static TyObject *
filter_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    TyObject *func, *seq;
    TyObject *it;
    filterobject *lz;

    if ((type == &PyFilter_Type || type->tp_init == PyFilter_Type.tp_init) &&
        !_TyArg_NoKeywords("filter", kwds))
        return NULL;

    if (!TyArg_UnpackTuple(args, "filter", 2, 2, &func, &seq))
        return NULL;

    /* Get iterator. */
    it = PyObject_GetIter(seq);
    if (it == NULL)
        return NULL;

    /* create filterobject structure */
    lz = (filterobject *)type->tp_alloc(type, 0);
    if (lz == NULL) {
        Ty_DECREF(it);
        return NULL;
    }

    lz->func = Ty_NewRef(func);
    lz->it = it;

    return (TyObject *)lz;
}

static TyObject *
filter_vectorcall(TyObject *type, TyObject * const*args,
                size_t nargsf, TyObject *kwnames)
{
    TyTypeObject *tp = _TyType_CAST(type);
    if (tp == &PyFilter_Type && !_TyArg_NoKwnames("filter", kwnames)) {
        return NULL;
    }

    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (!_TyArg_CheckPositional("filter", nargs, 2, 2)) {
        return NULL;
    }

    TyObject *it = PyObject_GetIter(args[1]);
    if (it == NULL) {
        return NULL;
    }

    filterobject *lz = (filterobject *)tp->tp_alloc(tp, 0);

    if (lz == NULL) {
        Ty_DECREF(it);
        return NULL;
    }

    lz->func = Ty_NewRef(args[0]);
    lz->it = it;

    return (TyObject *)lz;
}

static void
filter_dealloc(TyObject *self)
{
    filterobject *lz = _filterobject_CAST(self);
    PyObject_GC_UnTrack(lz);
    Ty_XDECREF(lz->func);
    Ty_XDECREF(lz->it);
    Ty_TYPE(lz)->tp_free(lz);
}

static int
filter_traverse(TyObject *self, visitproc visit, void *arg)
{
    filterobject *lz = _filterobject_CAST(self);
    Ty_VISIT(lz->it);
    Ty_VISIT(lz->func);
    return 0;
}

static TyObject *
filter_next(TyObject *self)
{
    filterobject *lz = _filterobject_CAST(self);
    TyObject *item;
    TyObject *it = lz->it;
    long ok;
    TyObject *(*iternext)(TyObject *);
    int checktrue = lz->func == Ty_None || lz->func == (TyObject *)&TyBool_Type;

    iternext = *Ty_TYPE(it)->tp_iternext;
    for (;;) {
        item = iternext(it);
        if (item == NULL)
            return NULL;

        if (checktrue) {
            ok = PyObject_IsTrue(item);
        } else {
            TyObject *good;
            good = PyObject_CallOneArg(lz->func, item);
            if (good == NULL) {
                Ty_DECREF(item);
                return NULL;
            }
            ok = PyObject_IsTrue(good);
            Ty_DECREF(good);
        }
        if (ok > 0)
            return item;
        Ty_DECREF(item);
        if (ok < 0)
            return NULL;
    }
}

static TyObject *
filter_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    filterobject *lz = _filterobject_CAST(self);
    return Ty_BuildValue("O(OO)", Ty_TYPE(lz), lz->func, lz->it);
}

TyDoc_STRVAR(reduce_doc, "Return state information for pickling.");

static TyMethodDef filter_methods[] = {
    {"__reduce__", filter_reduce, METH_NOARGS, reduce_doc},
    {NULL,           NULL}           /* sentinel */
};

TyDoc_STRVAR(filter_doc,
"filter(function, iterable, /)\n\
--\n\
\n\
Return an iterator yielding those items of iterable for which function(item)\n\
is true. If function is None, return the items that are true.");

TyTypeObject PyFilter_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "filter",                           /* tp_name */
    sizeof(filterobject),               /* tp_basicsize */
    0,                                  /* tp_itemsize */
    /* methods */
    filter_dealloc,                     /* tp_dealloc */
    0,                                  /* tp_vectorcall_offset */
    0,                                  /* tp_getattr */
    0,                                  /* tp_setattr */
    0,                                  /* tp_as_async */
    0,                                  /* tp_repr */
    0,                                  /* tp_as_number */
    0,                                  /* tp_as_sequence */
    0,                                  /* tp_as_mapping */
    0,                                  /* tp_hash */
    0,                                  /* tp_call */
    0,                                  /* tp_str */
    PyObject_GenericGetAttr,            /* tp_getattro */
    0,                                  /* tp_setattro */
    0,                                  /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE,            /* tp_flags */
    filter_doc,                         /* tp_doc */
    filter_traverse,                    /* tp_traverse */
    0,                                  /* tp_clear */
    0,                                  /* tp_richcompare */
    0,                                  /* tp_weaklistoffset */
    PyObject_SelfIter,                  /* tp_iter */
    filter_next,                        /* tp_iternext */
    filter_methods,                     /* tp_methods */
    0,                                  /* tp_members */
    0,                                  /* tp_getset */
    0,                                  /* tp_base */
    0,                                  /* tp_dict */
    0,                                  /* tp_descr_get */
    0,                                  /* tp_descr_set */
    0,                                  /* tp_dictoffset */
    0,                                  /* tp_init */
    TyType_GenericAlloc,                /* tp_alloc */
    filter_new,                         /* tp_new */
    PyObject_GC_Del,                    /* tp_free */
    .tp_vectorcall = filter_vectorcall
};


/*[clinic input]
format as builtin_format

    value: object
    format_spec: unicode(c_default="NULL") = ''
    /

Return type(value).__format__(value, format_spec)

Many built-in types implement format_spec according to the
Format Specification Mini-language. See help('FORMATTING').

If type(value) does not supply a method named __format__
and format_spec is empty, then str(value) is returned.
See also help('SPECIALMETHODS').
[clinic start generated code]*/

static TyObject *
builtin_format_impl(TyObject *module, TyObject *value, TyObject *format_spec)
/*[clinic end generated code: output=2f40bdfa4954b077 input=45ef3934b86d5624]*/
{
    return PyObject_Format(value, format_spec);
}

/*[clinic input]
chr as builtin_chr

    i: object
    /

Return a Unicode string of one character with ordinal i; 0 <= i <= 0x10ffff.
[clinic start generated code]*/

static TyObject *
builtin_chr(TyObject *module, TyObject *i)
/*[clinic end generated code: output=d34f25b8035a9b10 input=f919867f0ba2f496]*/
{
    int overflow;
    long v = TyLong_AsLongAndOverflow(i, &overflow);
    if (v == -1 && TyErr_Occurred()) {
        return NULL;
    }
    if (overflow) {
        v = overflow < 0 ? INT_MIN : INT_MAX;
        /* Allow TyUnicode_FromOrdinal() to raise an exception */
    }
#if SIZEOF_INT < SIZEOF_LONG
    else if (v < INT_MIN) {
        v = INT_MIN;
    }
    else if (v > INT_MAX) {
        v = INT_MAX;
    }
#endif
    return TyUnicode_FromOrdinal(v);
}


/*[clinic input]
compile as builtin_compile

    source: object
    filename: object(converter="TyUnicode_FSDecoder")
    mode: str
    flags: int = 0
    dont_inherit: bool = False
    optimize: int = -1
    *
    _feature_version as feature_version: int = -1

Compile source into a code object that can be executed by exec() or eval().

The source code may represent a Python module, statement or expression.
The filename will be used for run-time error messages.
The mode must be 'exec' to compile a module, 'single' to compile a
single (interactive) statement, or 'eval' to compile an expression.
The flags argument, if present, controls which future statements influence
the compilation of the code.
The dont_inherit argument, if true, stops the compilation inheriting
the effects of any future statements in effect in the code calling
compile; if absent or false these statements do influence the compilation,
in addition to any features explicitly specified.
[clinic start generated code]*/

static TyObject *
builtin_compile_impl(TyObject *module, TyObject *source, TyObject *filename,
                     const char *mode, int flags, int dont_inherit,
                     int optimize, int feature_version)
/*[clinic end generated code: output=b0c09c84f116d3d7 input=cc78e20e7c7682ba]*/
{
    TyObject *source_copy;
    const char *str;
    int compile_mode = -1;
    int is_ast;
    int start[] = {Ty_file_input, Ty_eval_input, Ty_single_input, Ty_func_type_input};
    TyObject *result;

    PyCompilerFlags cf = _PyCompilerFlags_INIT;
    cf.cf_flags = flags | PyCF_SOURCE_IS_UTF8;
    if (feature_version >= 0 && (flags & PyCF_ONLY_AST)) {
        cf.cf_feature_version = feature_version;
    }

    if (flags &
        ~(PyCF_MASK | PyCF_MASK_OBSOLETE | PyCF_COMPILE_MASK))
    {
        TyErr_SetString(TyExc_ValueError,
                        "compile(): unrecognised flags");
        goto error;
    }
    /* XXX Warn if (supplied_flags & PyCF_MASK_OBSOLETE) != 0? */

    if (optimize < -1 || optimize > 2) {
        TyErr_SetString(TyExc_ValueError,
                        "compile(): invalid optimize value");
        goto error;
    }

    if (!dont_inherit) {
        TyEval_MergeCompilerFlags(&cf);
    }

    if (strcmp(mode, "exec") == 0)
        compile_mode = 0;
    else if (strcmp(mode, "eval") == 0)
        compile_mode = 1;
    else if (strcmp(mode, "single") == 0)
        compile_mode = 2;
    else if (strcmp(mode, "func_type") == 0) {
        if (!(flags & PyCF_ONLY_AST)) {
            TyErr_SetString(TyExc_ValueError,
                            "compile() mode 'func_type' requires flag PyCF_ONLY_AST");
            goto error;
        }
        compile_mode = 3;
    }
    else {
        const char *msg;
        if (flags & PyCF_ONLY_AST)
            msg = "compile() mode must be 'exec', 'eval', 'single' or 'func_type'";
        else
            msg = "compile() mode must be 'exec', 'eval' or 'single'";
        TyErr_SetString(TyExc_ValueError, msg);
        goto error;
    }

    is_ast = TyAST_Check(source);
    if (is_ast == -1)
        goto error;
    if (is_ast) {
        PyArena *arena = _TyArena_New();
        if (arena == NULL) {
            goto error;
        }

        if (flags & PyCF_ONLY_AST) {
            mod_ty mod = TyAST_obj2mod(source, arena, compile_mode);
            if (mod == NULL || !_TyAST_Validate(mod)) {
                _TyArena_Free(arena);
                goto error;
            }
            int syntax_check_only = ((flags & PyCF_OPTIMIZED_AST) == PyCF_ONLY_AST); /* unoptiomized AST */
            if (_PyCompile_AstPreprocess(mod, filename, &cf, optimize,
                                           arena, syntax_check_only) < 0) {
                _TyArena_Free(arena);
                goto error;
            }
            result = TyAST_mod2obj(mod);
        }
        else {
            mod_ty mod = TyAST_obj2mod(source, arena, compile_mode);
            if (mod == NULL || !_TyAST_Validate(mod)) {
                _TyArena_Free(arena);
                goto error;
            }
            result = (TyObject*)_TyAST_Compile(mod, filename,
                                               &cf, optimize, arena);
        }
        _TyArena_Free(arena);
        goto finally;
    }

    str = _Ty_SourceAsString(source, "compile", "string, bytes or AST", &cf, &source_copy);
    if (str == NULL)
        goto error;

#ifdef Ty_GIL_DISABLED
    // Disable immortalization of code constants for explicit
    // compile() calls to get consistent frozen outputs between the default
    // and free-threaded builds.
    _PyThreadStateImpl *tstate = (_PyThreadStateImpl *)_TyThreadState_GET();
    tstate->suppress_co_const_immortalization++;
#endif

    result = Ty_CompileStringObject(str, filename, start[compile_mode], &cf, optimize);

#ifdef Ty_GIL_DISABLED
    tstate->suppress_co_const_immortalization--;
#endif

    Ty_XDECREF(source_copy);
    goto finally;

error:
    result = NULL;
finally:
    Ty_DECREF(filename);
    return result;
}

/* AC: cannot convert yet, as needs PEP 457 group support in inspect */
static TyObject *
builtin_dir(TyObject *self, TyObject *args)
{
    TyObject *arg = NULL;

    if (!TyArg_UnpackTuple(args, "dir", 0, 1, &arg))
        return NULL;
    return PyObject_Dir(arg);
}

TyDoc_STRVAR(dir_doc,
"dir([object]) -> list of strings\n"
"\n"
"If called without an argument, return the names in the current scope.\n"
"Else, return an alphabetized list of names comprising (some of) the attributes\n"
"of the given object, and of attributes reachable from it.\n"
"If the object supplies a method named __dir__, it will be used; otherwise\n"
"the default dir() logic is used and returns:\n"
"  for a module object: the module's attributes.\n"
"  for a class object:  its attributes, and recursively the attributes\n"
"    of its bases.\n"
"  for any other object: its attributes, its class's attributes, and\n"
"    recursively the attributes of its class's base classes.");

/*[clinic input]
divmod as builtin_divmod

    x: object
    y: object
    /

Return the tuple (x//y, x%y).  Invariant: div*y + mod == x.
[clinic start generated code]*/

static TyObject *
builtin_divmod_impl(TyObject *module, TyObject *x, TyObject *y)
/*[clinic end generated code: output=b06d8a5f6e0c745e input=175ad9c84ff41a85]*/
{
    return PyNumber_Divmod(x, y);
}


/*[clinic input]
eval as builtin_eval

    source: object
    /
    globals: object = None
    locals: object = None

Evaluate the given source in the context of globals and locals.

The source may be a string representing a Python expression
or a code object as returned by compile().
The globals must be a dictionary and locals can be any mapping,
defaulting to the current globals and locals.
If only globals is given, locals defaults to it.
[clinic start generated code]*/

static TyObject *
builtin_eval_impl(TyObject *module, TyObject *source, TyObject *globals,
                  TyObject *locals)
/*[clinic end generated code: output=0a0824aa70093116 input=7c7bce5299a89062]*/
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *result = NULL, *source_copy;
    const char *str;

    if (locals != Ty_None && !PyMapping_Check(locals)) {
        TyErr_SetString(TyExc_TypeError, "locals must be a mapping");
        return NULL;
    }
    if (globals != Ty_None && !TyDict_Check(globals)) {
        TyErr_SetString(TyExc_TypeError, PyMapping_Check(globals) ?
            "globals must be a real dict; try eval(expr, {}, mapping)"
            : "globals must be a dict");
        return NULL;
    }

    int fromframe = 0;
    if (globals != Ty_None) {
        Ty_INCREF(globals);
    }
    else if (_TyEval_GetFrame() != NULL) {
        fromframe = 1;
        globals = TyEval_GetGlobals();
        assert(globals != NULL);
        Ty_INCREF(globals);
    }
    else {
        globals = _TyEval_GetGlobalsFromRunningMain(tstate);
        if (globals == NULL) {
            if (!_TyErr_Occurred(tstate)) {
                TyErr_SetString(TyExc_TypeError,
                    "eval must be given globals and locals "
                    "when called without a frame");
            }
            return NULL;
        }
        Ty_INCREF(globals);
    }

    if (locals != Ty_None) {
        Ty_INCREF(locals);
    }
    else if (fromframe) {
        locals = _TyEval_GetFrameLocals();
        if (locals == NULL) {
            assert(TyErr_Occurred());
            Ty_DECREF(globals);
            return NULL;
        }
    }
    else {
        locals = Ty_NewRef(globals);
    }

    if (_TyEval_EnsureBuiltins(tstate, globals, NULL) < 0) {
        goto error;
    }

    if (TyCode_Check(source)) {
        if (TySys_Audit("exec", "O", source) < 0) {
            goto error;
        }

        if (TyCode_GetNumFree((PyCodeObject *)source) > 0) {
            TyErr_SetString(TyExc_TypeError,
                "code object passed to eval() may not contain free variables");
            goto error;
        }
        result = TyEval_EvalCode(source, globals, locals);
    }
    else {
        PyCompilerFlags cf = _PyCompilerFlags_INIT;
        cf.cf_flags = PyCF_SOURCE_IS_UTF8;
        str = _Ty_SourceAsString(source, "eval", "string, bytes or code", &cf, &source_copy);
        if (str == NULL)
            goto error;

        while (*str == ' ' || *str == '\t')
            str++;

        (void)TyEval_MergeCompilerFlags(&cf);
#ifdef Ty_GIL_DISABLED
        // Don't immortalize code constants for explicit eval() calls
        // to avoid memory leaks.
        _PyThreadStateImpl *tstate = (_PyThreadStateImpl *)_TyThreadState_GET();
        tstate->suppress_co_const_immortalization++;
#endif
        result = TyRun_StringFlags(str, Ty_eval_input, globals, locals, &cf);
#ifdef Ty_GIL_DISABLED
        tstate->suppress_co_const_immortalization--;
#endif
        Ty_XDECREF(source_copy);
    }

  error:
    Ty_XDECREF(globals);
    Ty_XDECREF(locals);
    return result;
}

/*[clinic input]
exec as builtin_exec

    source: object
    /
    globals: object = None
    locals: object = None
    *
    closure: object(c_default="NULL") = None

Execute the given source in the context of globals and locals.

The source may be a string representing one or more Python statements
or a code object as returned by compile().
The globals must be a dictionary and locals can be any mapping,
defaulting to the current globals and locals.
If only globals is given, locals defaults to it.
The closure must be a tuple of cellvars, and can only be used
when source is a code object requiring exactly that many cellvars.
[clinic start generated code]*/

static TyObject *
builtin_exec_impl(TyObject *module, TyObject *source, TyObject *globals,
                  TyObject *locals, TyObject *closure)
/*[clinic end generated code: output=7579eb4e7646743d input=25e989b6d87a3a21]*/
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *v;

    int fromframe = 0;
    if (globals != Ty_None) {
        Ty_INCREF(globals);
    }
    else if (_TyEval_GetFrame() != NULL) {
        fromframe = 1;
        globals = TyEval_GetGlobals();
        assert(globals != NULL);
        Ty_INCREF(globals);
    }
    else {
        globals = _TyEval_GetGlobalsFromRunningMain(tstate);
        if (globals == NULL) {
            if (!_TyErr_Occurred(tstate)) {
                TyErr_SetString(TyExc_SystemError,
                                "globals and locals cannot be NULL");
            }
            goto error;
        }
        Ty_INCREF(globals);
    }

    if (locals != Ty_None) {
        Ty_INCREF(locals);
    }
    else if (fromframe) {
        locals = _TyEval_GetFrameLocals();
        if (locals == NULL) {
            assert(TyErr_Occurred());
            Ty_DECREF(globals);
            return NULL;
        }
    }
    else {
        locals = Ty_NewRef(globals);
    }

    if (!TyDict_Check(globals)) {
        TyErr_Format(TyExc_TypeError, "exec() globals must be a dict, not %.100s",
                     Ty_TYPE(globals)->tp_name);
        goto error;
    }
    if (!PyMapping_Check(locals)) {
        TyErr_Format(TyExc_TypeError,
            "locals must be a mapping or None, not %.100s",
            Ty_TYPE(locals)->tp_name);
        goto error;
    }

    if (_TyEval_EnsureBuiltins(tstate, globals, NULL) < 0) {
        goto error;
    }

    if (closure == Ty_None) {
        closure = NULL;
    }

    if (TyCode_Check(source)) {
        Ty_ssize_t num_free = TyCode_GetNumFree((PyCodeObject *)source);
        if (num_free == 0) {
            if (closure) {
                TyErr_SetString(TyExc_TypeError,
                    "cannot use a closure with this code object");
                goto error;
            }
        } else {
            int closure_is_ok =
                closure
                && TyTuple_CheckExact(closure)
                && (TyTuple_GET_SIZE(closure) == num_free);
            if (closure_is_ok) {
                for (Ty_ssize_t i = 0; i < num_free; i++) {
                    TyObject *cell = TyTuple_GET_ITEM(closure, i);
                    if (!TyCell_Check(cell)) {
                        closure_is_ok = 0;
                        break;
                    }
                }
            }
            if (!closure_is_ok) {
                TyErr_Format(TyExc_TypeError,
                    "code object requires a closure of exactly length %zd",
                    num_free);
                goto error;
            }
        }

        if (TySys_Audit("exec", "O", source) < 0) {
            goto error;
        }

        if (!closure) {
            v = TyEval_EvalCode(source, globals, locals);
        } else {
            v = TyEval_EvalCodeEx(source, globals, locals,
                NULL, 0,
                NULL, 0,
                NULL, 0,
                NULL,
                closure);
        }
    }
    else {
        if (closure != NULL) {
            TyErr_SetString(TyExc_TypeError,
                "closure can only be used when source is a code object");
            goto error;
        }
        TyObject *source_copy;
        const char *str;
        PyCompilerFlags cf = _PyCompilerFlags_INIT;
        cf.cf_flags = PyCF_SOURCE_IS_UTF8;
        str = _Ty_SourceAsString(source, "exec",
                                       "string, bytes or code", &cf,
                                       &source_copy);
        if (str == NULL)
            goto error;
        if (TyEval_MergeCompilerFlags(&cf))
            v = TyRun_StringFlags(str, Ty_file_input, globals,
                                  locals, &cf);
        else
            v = TyRun_String(str, Ty_file_input, globals, locals);
        Ty_XDECREF(source_copy);
    }
    if (v == NULL)
        goto error;
    Ty_DECREF(globals);
    Ty_DECREF(locals);
    Ty_DECREF(v);
    Py_RETURN_NONE;

  error:
    Ty_XDECREF(globals);
    Ty_XDECREF(locals);
    return NULL;
}


/* AC: cannot convert yet, as needs PEP 457 group support in inspect */
static TyObject *
builtin_getattr(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *v, *name, *result;

    if (!_TyArg_CheckPositional("getattr", nargs, 2, 3))
        return NULL;

    v = args[0];
    name = args[1];
    if (nargs > 2) {
        if (PyObject_GetOptionalAttr(v, name, &result) == 0) {
            TyObject *dflt = args[2];
            return Ty_NewRef(dflt);
        }
    }
    else {
        result = PyObject_GetAttr(v, name);
    }
    return result;
}

TyDoc_STRVAR(getattr_doc,
"getattr(object, name[, default]) -> value\n\
\n\
Get a named attribute from an object; getattr(x, 'y') is equivalent to x.y.\n\
When a default argument is given, it is returned when the attribute doesn't\n\
exist; without it, an exception is raised in that case.");


/*[clinic input]
globals as builtin_globals

Return the dictionary containing the current scope's global variables.

NOTE: Updates to this dictionary *will* affect name lookups in the current
global scope and vice-versa.
[clinic start generated code]*/

static TyObject *
builtin_globals_impl(TyObject *module)
/*[clinic end generated code: output=e5dd1527067b94d2 input=9327576f92bb48ba]*/
{
    TyObject *globals;
    if (_TyEval_GetFrame() != NULL) {
        globals = TyEval_GetGlobals();
        assert(globals != NULL);
        return Ty_NewRef(globals);
    }
    TyThreadState *tstate = _TyThreadState_GET();
    globals = _TyEval_GetGlobalsFromRunningMain(tstate);
    if (globals == NULL) {
        if (_TyErr_Occurred(tstate)) {
            return NULL;
        }
        Py_RETURN_NONE;
    }
    return Ty_NewRef(globals);
}


/*[clinic input]
hasattr as builtin_hasattr

    obj: object
    name: object
    /

Return whether the object has an attribute with the given name.

This is done by calling getattr(obj, name) and catching AttributeError.
[clinic start generated code]*/

static TyObject *
builtin_hasattr_impl(TyObject *module, TyObject *obj, TyObject *name)
/*[clinic end generated code: output=a7aff2090a4151e5 input=0faec9787d979542]*/
{
    TyObject *v;

    if (PyObject_GetOptionalAttr(obj, name, &v) < 0) {
        return NULL;
    }
    if (v == NULL) {
        Py_RETURN_FALSE;
    }
    Ty_DECREF(v);
    Py_RETURN_TRUE;
}


/* AC: gdb's integration with CPython relies on builtin_id having
 * the *exact* parameter names of "self" and "v", so we ensure we
 * preserve those name rather than using the AC defaults.
 */
/*[clinic input]
id as builtin_id

    self: self(type="TyModuleDef *")
    obj as v: object
    /

Return the identity of an object.

This is guaranteed to be unique among simultaneously existing objects.
(CPython uses the object's memory address.)
[clinic start generated code]*/

static TyObject *
builtin_id_impl(TyModuleDef *self, TyObject *v)
/*[clinic end generated code: output=4908a6782ed343e9 input=5a534136419631f4]*/
{
    TyObject *id = TyLong_FromVoidPtr(v);

    if (id && TySys_Audit("builtins.id", "O", id) < 0) {
        Ty_DECREF(id);
        return NULL;
    }

    return id;
}


/* map object ************************************************************/

typedef struct {
    PyObject_HEAD
    TyObject *iters;
    TyObject *func;
    int strict;
} mapobject;

#define _mapobject_CAST(op)     ((mapobject *)(op))

static TyObject *
map_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    TyObject *it, *iters, *func;
    mapobject *lz;
    Ty_ssize_t numargs, i;
    int strict = 0;

    if (kwds) {
        TyObject *empty = TyTuple_New(0);
        if (empty == NULL) {
            return NULL;
        }
        static char *kwlist[] = {"strict", NULL};
        int parsed = TyArg_ParseTupleAndKeywords(
                empty, kwds, "|$p:map", kwlist, &strict);
        Ty_DECREF(empty);
        if (!parsed) {
            return NULL;
        }
    }

    numargs = TyTuple_Size(args);
    if (numargs < 2) {
        TyErr_SetString(TyExc_TypeError,
           "map() must have at least two arguments.");
        return NULL;
    }

    iters = TyTuple_New(numargs-1);
    if (iters == NULL)
        return NULL;

    for (i=1 ; i<numargs ; i++) {
        /* Get iterator. */
        it = PyObject_GetIter(TyTuple_GET_ITEM(args, i));
        if (it == NULL) {
            Ty_DECREF(iters);
            return NULL;
        }
        TyTuple_SET_ITEM(iters, i-1, it);
    }

    /* create mapobject structure */
    lz = (mapobject *)type->tp_alloc(type, 0);
    if (lz == NULL) {
        Ty_DECREF(iters);
        return NULL;
    }
    lz->iters = iters;
    func = TyTuple_GET_ITEM(args, 0);
    lz->func = Ty_NewRef(func);
    lz->strict = strict;

    return (TyObject *)lz;
}

static TyObject *
map_vectorcall(TyObject *type, TyObject * const*args,
                size_t nargsf, TyObject *kwnames)
{
    TyTypeObject *tp = _TyType_CAST(type);

    Ty_ssize_t nargs = PyVectorcall_NARGS(nargsf);
    if (kwnames != NULL && TyTuple_GET_SIZE(kwnames) != 0) {
        // Fallback to map_new()
        TyThreadState *tstate = _TyThreadState_GET();
        return _TyObject_MakeTpCall(tstate, type, args, nargs, kwnames);
    }

    if (nargs < 2) {
        TyErr_SetString(TyExc_TypeError,
           "map() must have at least two arguments.");
        return NULL;
    }

    TyObject *iters = TyTuple_New(nargs-1);
    if (iters == NULL) {
        return NULL;
    }

    for (int i=1; i<nargs; i++) {
        TyObject *it = PyObject_GetIter(args[i]);
        if (it == NULL) {
            Ty_DECREF(iters);
            return NULL;
        }
        TyTuple_SET_ITEM(iters, i-1, it);
    }

    mapobject *lz = (mapobject *)tp->tp_alloc(tp, 0);
    if (lz == NULL) {
        Ty_DECREF(iters);
        return NULL;
    }
    lz->iters = iters;
    lz->func = Ty_NewRef(args[0]);
    lz->strict = 0;

    return (TyObject *)lz;
}

static void
map_dealloc(TyObject *self)
{
    mapobject *lz = _mapobject_CAST(self);
    PyObject_GC_UnTrack(lz);
    Ty_XDECREF(lz->iters);
    Ty_XDECREF(lz->func);
    Ty_TYPE(lz)->tp_free(lz);
}

static int
map_traverse(TyObject *self, visitproc visit, void *arg)
{
    mapobject *lz = _mapobject_CAST(self);
    Ty_VISIT(lz->iters);
    Ty_VISIT(lz->func);
    return 0;
}

static TyObject *
map_next(TyObject *self)
{
    mapobject *lz = _mapobject_CAST(self);
    Ty_ssize_t i;
    TyObject *small_stack[_PY_FASTCALL_SMALL_STACK];
    TyObject **stack;
    TyObject *result = NULL;
    TyThreadState *tstate = _TyThreadState_GET();

    const Ty_ssize_t niters = TyTuple_GET_SIZE(lz->iters);
    if (niters <= (Ty_ssize_t)Ty_ARRAY_LENGTH(small_stack)) {
        stack = small_stack;
    }
    else {
        stack = TyMem_Malloc(niters * sizeof(stack[0]));
        if (stack == NULL) {
            _TyErr_NoMemory(tstate);
            return NULL;
        }
    }

    Ty_ssize_t nargs = 0;
    for (i=0; i < niters; i++) {
        TyObject *it = TyTuple_GET_ITEM(lz->iters, i);
        TyObject *val = Ty_TYPE(it)->tp_iternext(it);
        if (val == NULL) {
            if (lz->strict) {
                goto check;
            }
            goto exit;
        }
        stack[i] = val;
        nargs++;
    }

    result = _TyObject_VectorcallTstate(tstate, lz->func, stack, nargs, NULL);

exit:
    for (i=0; i < nargs; i++) {
        Ty_DECREF(stack[i]);
    }
    if (stack != small_stack) {
        TyMem_Free(stack);
    }
    return result;
check:
    if (TyErr_Occurred()) {
        if (!TyErr_ExceptionMatches(TyExc_StopIteration)) {
            // next() on argument i raised an exception (not StopIteration)
            return NULL;
        }
        TyErr_Clear();
    }
    if (i) {
        // ValueError: map() argument 2 is shorter than argument 1
        // ValueError: map() argument 3 is shorter than arguments 1-2
        const char* plural = i == 1 ? " " : "s 1-";
        return TyErr_Format(TyExc_ValueError,
                            "map() argument %d is shorter than argument%s%d",
                            i + 1, plural, i);
    }
    for (i = 1; i < niters; i++) {
        TyObject *it = TyTuple_GET_ITEM(lz->iters, i);
        TyObject *val = (*Ty_TYPE(it)->tp_iternext)(it);
        if (val) {
            Ty_DECREF(val);
            const char* plural = i == 1 ? " " : "s 1-";
            return TyErr_Format(TyExc_ValueError,
                                "map() argument %d is longer than argument%s%d",
                                i + 1, plural, i);
        }
        if (TyErr_Occurred()) {
            if (!TyErr_ExceptionMatches(TyExc_StopIteration)) {
                // next() on argument i raised an exception (not StopIteration)
                return NULL;
            }
            TyErr_Clear();
        }
        // Argument i is exhausted. So far so good...
    }
    // All arguments are exhausted. Success!
    goto exit;
}

static TyObject *
map_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    mapobject *lz = _mapobject_CAST(self);
    Ty_ssize_t numargs = TyTuple_GET_SIZE(lz->iters);
    TyObject *args = TyTuple_New(numargs+1);
    Ty_ssize_t i;
    if (args == NULL)
        return NULL;
    TyTuple_SET_ITEM(args, 0, Ty_NewRef(lz->func));
    for (i = 0; i<numargs; i++){
        TyObject *it = TyTuple_GET_ITEM(lz->iters, i);
        TyTuple_SET_ITEM(args, i+1, Ty_NewRef(it));
    }

    if (lz->strict) {
        return Ty_BuildValue("ONO", Ty_TYPE(lz), args, Ty_True);
    }
    return Ty_BuildValue("ON", Ty_TYPE(lz), args);
}

TyDoc_STRVAR(setstate_doc, "Set state information for unpickling.");

static TyObject *
map_setstate(TyObject *self, TyObject *state)
{
    int strict = PyObject_IsTrue(state);
    if (strict < 0) {
        return NULL;
    }
    mapobject *lz = _mapobject_CAST(self);
    lz->strict = strict;
    Py_RETURN_NONE;
}

static TyMethodDef map_methods[] = {
    {"__reduce__", map_reduce, METH_NOARGS, reduce_doc},
    {"__setstate__", map_setstate, METH_O, setstate_doc},
    {NULL,           NULL}           /* sentinel */
};


TyDoc_STRVAR(map_doc,
"map(function, iterable, /, *iterables, strict=False)\n\
--\n\
\n\
Make an iterator that computes the function using arguments from\n\
each of the iterables.  Stops when the shortest iterable is exhausted.\n\
\n\
If strict is true and one of the arguments is exhausted before the others,\n\
raise a ValueError.");

TyTypeObject PyMap_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "map",                              /* tp_name */
    sizeof(mapobject),                  /* tp_basicsize */
    0,                                  /* tp_itemsize */
    /* methods */
    map_dealloc,                        /* tp_dealloc */
    0,                                  /* tp_vectorcall_offset */
    0,                                  /* tp_getattr */
    0,                                  /* tp_setattr */
    0,                                  /* tp_as_async */
    0,                                  /* tp_repr */
    0,                                  /* tp_as_number */
    0,                                  /* tp_as_sequence */
    0,                                  /* tp_as_mapping */
    0,                                  /* tp_hash */
    0,                                  /* tp_call */
    0,                                  /* tp_str */
    PyObject_GenericGetAttr,            /* tp_getattro */
    0,                                  /* tp_setattro */
    0,                                  /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE,            /* tp_flags */
    map_doc,                            /* tp_doc */
    map_traverse,                       /* tp_traverse */
    0,                                  /* tp_clear */
    0,                                  /* tp_richcompare */
    0,                                  /* tp_weaklistoffset */
    PyObject_SelfIter,                  /* tp_iter */
    map_next,                           /* tp_iternext */
    map_methods,                        /* tp_methods */
    0,                                  /* tp_members */
    0,                                  /* tp_getset */
    0,                                  /* tp_base */
    0,                                  /* tp_dict */
    0,                                  /* tp_descr_get */
    0,                                  /* tp_descr_set */
    0,                                  /* tp_dictoffset */
    0,                                  /* tp_init */
    TyType_GenericAlloc,                /* tp_alloc */
    map_new,                            /* tp_new */
    PyObject_GC_Del,                    /* tp_free */
    .tp_vectorcall = map_vectorcall
};


/* AC: cannot convert yet, as needs PEP 457 group support in inspect */
static TyObject *
builtin_next(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *it, *res;

    if (!_TyArg_CheckPositional("next", nargs, 1, 2))
        return NULL;

    it = args[0];
    if (!TyIter_Check(it)) {
        TyErr_Format(TyExc_TypeError,
            "'%.200s' object is not an iterator",
            Ty_TYPE(it)->tp_name);
        return NULL;
    }

    res = (*Ty_TYPE(it)->tp_iternext)(it);
    if (res != NULL) {
        return res;
    } else if (nargs > 1) {
        TyObject *def = args[1];
        if (TyErr_Occurred()) {
            if(!TyErr_ExceptionMatches(TyExc_StopIteration))
                return NULL;
            TyErr_Clear();
        }
        return Ty_NewRef(def);
    } else if (TyErr_Occurred()) {
        return NULL;
    } else {
        TyErr_SetNone(TyExc_StopIteration);
        return NULL;
    }
}

TyDoc_STRVAR(next_doc,
"next(iterator[, default])\n\
\n\
Return the next item from the iterator. If default is given and the iterator\n\
is exhausted, it is returned instead of raising StopIteration.");


/*[clinic input]
setattr as builtin_setattr

    obj: object
    name: object
    value: object
    /

Sets the named attribute on the given object to the specified value.

setattr(x, 'y', v) is equivalent to ``x.y = v``
[clinic start generated code]*/

static TyObject *
builtin_setattr_impl(TyObject *module, TyObject *obj, TyObject *name,
                     TyObject *value)
/*[clinic end generated code: output=dc2ce1d1add9acb4 input=5e26417f2e8598d4]*/
{
    if (PyObject_SetAttr(obj, name, value) != 0)
        return NULL;
    Py_RETURN_NONE;
}


/*[clinic input]
delattr as builtin_delattr

    obj: object
    name: object
    /

Deletes the named attribute from the given object.

delattr(x, 'y') is equivalent to ``del x.y``
[clinic start generated code]*/

static TyObject *
builtin_delattr_impl(TyObject *module, TyObject *obj, TyObject *name)
/*[clinic end generated code: output=85134bc58dff79fa input=164865623abe7216]*/
{
    if (PyObject_DelAttr(obj, name) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


/*[clinic input]
hash as builtin_hash

    obj: object
    /

Return the hash value for the given object.

Two objects that compare equal must also have the same hash value, but the
reverse is not necessarily true.
[clinic start generated code]*/

static TyObject *
builtin_hash(TyObject *module, TyObject *obj)
/*[clinic end generated code: output=237668e9d7688db7 input=58c48be822bf9c54]*/
{
    Ty_hash_t x;

    x = PyObject_Hash(obj);
    if (x == -1)
        return NULL;
    return TyLong_FromSsize_t(x);
}


/*[clinic input]
hex as builtin_hex

    number: object
    /

Return the hexadecimal representation of an integer.

   >>> hex(12648430)
   '0xc0ffee'
[clinic start generated code]*/

static TyObject *
builtin_hex(TyObject *module, TyObject *number)
/*[clinic end generated code: output=e46b612169099408 input=e645aff5fc7d540e]*/
{
    return PyNumber_ToBase(number, 16);
}


/* AC: cannot convert yet, as needs PEP 457 group support in inspect */
static TyObject *
builtin_iter(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *v;

    if (!_TyArg_CheckPositional("iter", nargs, 1, 2))
        return NULL;
    v = args[0];
    if (nargs == 1)
        return PyObject_GetIter(v);
    if (!PyCallable_Check(v)) {
        TyErr_SetString(TyExc_TypeError,
                        "iter(v, w): v must be callable");
        return NULL;
    }
    TyObject *sentinel = args[1];
    return TyCallIter_New(v, sentinel);
}

TyDoc_STRVAR(iter_doc,
"iter(iterable) -> iterator\n\
iter(callable, sentinel) -> iterator\n\
\n\
Get an iterator from an object.  In the first form, the argument must\n\
supply its own iterator, or be a sequence.\n\
In the second form, the callable is called until it returns the sentinel.");


/*[clinic input]
aiter as builtin_aiter

    async_iterable: object
    /

Return an AsyncIterator for an AsyncIterable object.
[clinic start generated code]*/

static TyObject *
builtin_aiter(TyObject *module, TyObject *async_iterable)
/*[clinic end generated code: output=1bae108d86f7960e input=473993d0cacc7d23]*/
{
    return PyObject_GetAIter(async_iterable);
}

TyObject *PyAnextAwaitable_New(TyObject *, TyObject *);

/*[clinic input]
anext as builtin_anext

    aiterator: object
    default: object = NULL
    /

Return the next item from the async iterator.

If default is given and the async iterator is exhausted,
it is returned instead of raising StopAsyncIteration.
[clinic start generated code]*/

static TyObject *
builtin_anext_impl(TyObject *module, TyObject *aiterator,
                   TyObject *default_value)
/*[clinic end generated code: output=f02c060c163a81fa input=2900e4a370d39550]*/
{
    TyTypeObject *t;
    TyObject *awaitable;

    t = Ty_TYPE(aiterator);
    if (t->tp_as_async == NULL || t->tp_as_async->am_anext == NULL) {
        TyErr_Format(TyExc_TypeError,
            "'%.200s' object is not an async iterator",
            t->tp_name);
        return NULL;
    }

    awaitable = (*t->tp_as_async->am_anext)(aiterator);
    if (awaitable == NULL) {
        return NULL;
    }
    if (default_value == NULL) {
        return awaitable;
    }

    TyObject* new_awaitable = PyAnextAwaitable_New(
            awaitable, default_value);
    Ty_DECREF(awaitable);
    return new_awaitable;
}


/*[clinic input]
len as builtin_len

    obj: object
    /

Return the number of items in a container.
[clinic start generated code]*/

static TyObject *
builtin_len(TyObject *module, TyObject *obj)
/*[clinic end generated code: output=fa7a270d314dfb6c input=bc55598da9e9c9b5]*/
{
    Ty_ssize_t res;

    res = PyObject_Size(obj);
    if (res < 0) {
        assert(TyErr_Occurred());
        return NULL;
    }
    return TyLong_FromSsize_t(res);
}


/*[clinic input]
locals as builtin_locals

Return a dictionary containing the current scope's local variables.

NOTE: Whether or not updates to this dictionary will affect name lookups in
the local scope and vice-versa is *implementation dependent* and not
covered by any backwards compatibility guarantees.
[clinic start generated code]*/

static TyObject *
builtin_locals_impl(TyObject *module)
/*[clinic end generated code: output=b46c94015ce11448 input=7874018d478d5c4b]*/
{
    TyObject *locals;
    if (_TyEval_GetFrame() != NULL) {
        locals = _TyEval_GetFrameLocals();
        assert(locals != NULL || TyErr_Occurred());
        return locals;
    }
    TyThreadState *tstate = _TyThreadState_GET();
    locals = _TyEval_GetGlobalsFromRunningMain(tstate);
    if (locals == NULL) {
        if (_TyErr_Occurred(tstate)) {
            return NULL;
        }
        Py_RETURN_NONE;
    }
    return Ty_NewRef(locals);
}


static TyObject *
min_max(TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames, int op)
{
    TyObject *it = NULL, *item, *val, *maxitem, *maxval, *keyfunc=NULL;
    TyObject *defaultval = NULL;
    static const char * const keywords[] = {"key", "default", NULL};
    static _TyArg_Parser _parser_min = {"|$OO:min", keywords, 0};
    static _TyArg_Parser _parser_max = {"|$OO:max", keywords, 0};
    const char *name = (op == Py_LT) ? "min" : "max";
    _TyArg_Parser *_parser = (op == Py_LT) ? &_parser_min : &_parser_max;

    if (nargs == 0) {
        TyErr_Format(TyExc_TypeError, "%s expected at least 1 argument, got 0", name);
        return NULL;
    }

    if (kwnames != NULL && !_TyArg_ParseStackAndKeywords(args + nargs, 0, kwnames, _parser,
                                                         &keyfunc, &defaultval)) {
        return NULL;
    }

    const int positional = nargs > 1; // False iff nargs == 1
    if (positional && defaultval != NULL) {
        TyErr_Format(TyExc_TypeError,
                        "Cannot specify a default for %s() with multiple "
                        "positional arguments", name);
        return NULL;
    }

    if (!positional) {
        it = PyObject_GetIter(args[0]);
        if (it == NULL) {
            return NULL;
        }
    }

    if (keyfunc == Ty_None) {
        keyfunc = NULL;
    }

    maxitem = NULL; /* the result */
    maxval = NULL;  /* the value associated with the result */
    while (1) {
        if (it == NULL) {
            if (nargs-- <= 0) {
                break;
            }
            item = *args++;
            Ty_INCREF(item);
        }
        else {
            item = TyIter_Next(it);
            if (item == NULL) {
                if (TyErr_Occurred()) {
                    goto Fail_it;
                }
                break;
            }
        }

        /* get the value from the key function */
        if (keyfunc != NULL) {
            val = PyObject_CallOneArg(keyfunc, item);
            if (val == NULL)
                goto Fail_it_item;
        }
        /* no key function; the value is the item */
        else {
            val = Ty_NewRef(item);
        }

        /* maximum value and item are unset; set them */
        if (maxval == NULL) {
            maxitem = item;
            maxval = val;
        }
        /* maximum value and item are set; update them as necessary */
        else {
            int cmp = PyObject_RichCompareBool(val, maxval, op);
            if (cmp < 0)
                goto Fail_it_item_and_val;
            else if (cmp > 0) {
                Ty_DECREF(maxval);
                Ty_DECREF(maxitem);
                maxval = val;
                maxitem = item;
            }
            else {
                Ty_DECREF(item);
                Ty_DECREF(val);
            }
        }
    }
    if (maxval == NULL) {
        assert(maxitem == NULL);
        if (defaultval != NULL) {
            maxitem = Ty_NewRef(defaultval);
        } else {
            TyErr_Format(TyExc_ValueError,
                         "%s() iterable argument is empty", name);
        }
    }
    else
        Ty_DECREF(maxval);
    Ty_XDECREF(it);
    return maxitem;

Fail_it_item_and_val:
    Ty_DECREF(val);
Fail_it_item:
    Ty_DECREF(item);
Fail_it:
    Ty_XDECREF(maxval);
    Ty_XDECREF(maxitem);
    Ty_XDECREF(it);
    return NULL;
}

/* AC: cannot convert yet, waiting for *args support */
static TyObject *
builtin_min(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    return min_max(args, nargs, kwnames, Py_LT);
}

TyDoc_STRVAR(min_doc,
"min(iterable, *[, default=obj, key=func]) -> value\n\
min(arg1, arg2, *args, *[, key=func]) -> value\n\
\n\
With a single iterable argument, return its smallest item. The\n\
default keyword-only argument specifies an object to return if\n\
the provided iterable is empty.\n\
With two or more positional arguments, return the smallest argument.");


/* AC: cannot convert yet, waiting for *args support */
static TyObject *
builtin_max(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    return min_max(args, nargs, kwnames, Py_GT);
}

TyDoc_STRVAR(max_doc,
"max(iterable, *[, default=obj, key=func]) -> value\n\
max(arg1, arg2, *args, *[, key=func]) -> value\n\
\n\
With a single iterable argument, return its biggest item. The\n\
default keyword-only argument specifies an object to return if\n\
the provided iterable is empty.\n\
With two or more positional arguments, return the largest argument.");


/*[clinic input]
oct as builtin_oct

    number: object
    /

Return the octal representation of an integer.

   >>> oct(342391)
   '0o1234567'
[clinic start generated code]*/

static TyObject *
builtin_oct(TyObject *module, TyObject *number)
/*[clinic end generated code: output=40a34656b6875352 input=ad6b274af4016c72]*/
{
    return PyNumber_ToBase(number, 8);
}


/*[clinic input]
ord as builtin_ord

    c: object
    /

Return the Unicode code point for a one-character string.
[clinic start generated code]*/

static TyObject *
builtin_ord(TyObject *module, TyObject *c)
/*[clinic end generated code: output=4fa5e87a323bae71 input=3064e5d6203ad012]*/
{
    long ord;
    Ty_ssize_t size;

    if (TyBytes_Check(c)) {
        size = TyBytes_GET_SIZE(c);
        if (size == 1) {
            ord = (long)((unsigned char)*TyBytes_AS_STRING(c));
            return TyLong_FromLong(ord);
        }
    }
    else if (TyUnicode_Check(c)) {
        size = TyUnicode_GET_LENGTH(c);
        if (size == 1) {
            ord = (long)TyUnicode_READ_CHAR(c, 0);
            return TyLong_FromLong(ord);
        }
    }
    else if (TyByteArray_Check(c)) {
        /* XXX Hopefully this is temporary */
        size = TyByteArray_GET_SIZE(c);
        if (size == 1) {
            ord = (long)((unsigned char)*TyByteArray_AS_STRING(c));
            return TyLong_FromLong(ord);
        }
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "ord() expected string of length 1, but " \
                     "%.200s found", Ty_TYPE(c)->tp_name);
        return NULL;
    }

    TyErr_Format(TyExc_TypeError,
                 "ord() expected a character, "
                 "but string of length %zd found",
                 size);
    return NULL;
}


/*[clinic input]
pow as builtin_pow

    base: object
    exp: object
    mod: object = None

Equivalent to base**exp with 2 arguments or base**exp % mod with 3 arguments

Some types, such as ints, are able to use a more efficient algorithm when
invoked using the three argument form.
[clinic start generated code]*/

static TyObject *
builtin_pow_impl(TyObject *module, TyObject *base, TyObject *exp,
                 TyObject *mod)
/*[clinic end generated code: output=3ca1538221bbf15f input=435dbd48a12efb23]*/
{
    return PyNumber_Power(base, exp, mod);
}

/*[clinic input]
print as builtin_print

    *args: array
    sep: object(c_default="Ty_None") = ' '
        string inserted between values, default a space.
    end: object(c_default="Ty_None") = '\n'
        string appended after the last value, default a newline.
    file: object = None
        a file-like object (stream); defaults to the current sys.stdout.
    flush: bool = False
        whether to forcibly flush the stream.

Prints the values to a stream, or to sys.stdout by default.

[clinic start generated code]*/

static TyObject *
builtin_print_impl(TyObject *module, TyObject * const *args,
                   Ty_ssize_t args_length, TyObject *sep, TyObject *end,
                   TyObject *file, int flush)
/*[clinic end generated code: output=3cb7e5b66f1a8547 input=66ea4de1605a2437]*/
{
    int i, err;

    if (file == Ty_None) {
        file = _TySys_GetRequiredAttr(&_Ty_ID(stdout));
        if (file == NULL) {
            return NULL;
        }

        /* sys.stdout may be None when FILE* stdout isn't connected */
        if (file == Ty_None) {
            Ty_DECREF(file);
            Py_RETURN_NONE;
        }
    }
    else {
        Ty_INCREF(file);
    }

    if (sep == Ty_None) {
        sep = NULL;
    }
    else if (sep && !TyUnicode_Check(sep)) {
        TyErr_Format(TyExc_TypeError,
                     "sep must be None or a string, not %.200s",
                     Ty_TYPE(sep)->tp_name);
        Ty_DECREF(file);
        return NULL;
    }
    if (end == Ty_None) {
        end = NULL;
    }
    else if (end && !TyUnicode_Check(end)) {
        TyErr_Format(TyExc_TypeError,
                     "end must be None or a string, not %.200s",
                     Ty_TYPE(end)->tp_name);
        Ty_DECREF(file);
        return NULL;
    }

    for (i = 0; i < args_length; i++) {
        if (i > 0) {
            if (sep == NULL) {
                err = TyFile_WriteString(" ", file);
            }
            else {
                err = TyFile_WriteObject(sep, file, Ty_PRINT_RAW);
            }
            if (err) {
                Ty_DECREF(file);
                return NULL;
            }
        }
        err = TyFile_WriteObject(args[i], file, Ty_PRINT_RAW);
        if (err) {
            Ty_DECREF(file);
            return NULL;
        }
    }

    if (end == NULL) {
        err = TyFile_WriteString("\n", file);
    }
    else {
        err = TyFile_WriteObject(end, file, Ty_PRINT_RAW);
    }
    if (err) {
        Ty_DECREF(file);
        return NULL;
    }

    if (flush) {
        if (_PyFile_Flush(file) < 0) {
            Ty_DECREF(file);
            return NULL;
        }
    }
    Ty_DECREF(file);

    Py_RETURN_NONE;
}


/*[clinic input]
input as builtin_input

    prompt: object(c_default="NULL") = ""
    /

Read a string from standard input.  The trailing newline is stripped.

The prompt string, if given, is printed to standard output without a
trailing newline before reading input.

If the user hits EOF (*nix: Ctrl-D, Windows: Ctrl-Z+Return), raise EOFError.
On *nix systems, readline is used if available.
[clinic start generated code]*/

static TyObject *
builtin_input_impl(TyObject *module, TyObject *prompt)
/*[clinic end generated code: output=83db5a191e7a0d60 input=159c46d4ae40977e]*/
{
    TyObject *fin = NULL;
    TyObject *fout = NULL;
    TyObject *ferr = NULL;
    TyObject *tmp;
    long fd;
    int tty;

    /* Check that stdin/out/err are intact */
    fin = _TySys_GetRequiredAttr(&_Ty_ID(stdin));
    if (fin == NULL) {
        goto error;
    }
    if (fin == Ty_None) {
        TyErr_SetString(TyExc_RuntimeError, "lost sys.stdin");
        goto error;
    }
    fout = _TySys_GetRequiredAttr(&_Ty_ID(stdout));
    if (fout == NULL) {
        goto error;
    }
    if (fout == Ty_None) {
        TyErr_SetString(TyExc_RuntimeError, "lost sys.stdout");
        goto error;
    }
    ferr = _TySys_GetRequiredAttr(&_Ty_ID(stderr));
    if (ferr == NULL) {
        goto error;
    }
    if (ferr == Ty_None) {
        TyErr_SetString(TyExc_RuntimeError, "lost sys.stderr");
        goto error;
    }

    if (TySys_Audit("builtins.input", "O", prompt ? prompt : Ty_None) < 0) {
        goto error;
    }

    /* First of all, flush stderr */
    if (_PyFile_Flush(ferr) < 0) {
        TyErr_Clear();
    }

    /* We should only use (GNU) readline if Python's sys.stdin and
       sys.stdout are the same as C's stdin and stdout, because we
       need to pass it those. */
    tmp = PyObject_CallMethodNoArgs(fin, &_Ty_ID(fileno));
    if (tmp == NULL) {
        TyErr_Clear();
        tty = 0;
    }
    else {
        fd = TyLong_AsLong(tmp);
        Ty_DECREF(tmp);
        if (fd < 0 && TyErr_Occurred()) {
            goto error;
        }
        tty = fd == fileno(stdin) && isatty(fd);
    }
    if (tty) {
        tmp = PyObject_CallMethodNoArgs(fout, &_Ty_ID(fileno));
        if (tmp == NULL) {
            TyErr_Clear();
            tty = 0;
        }
        else {
            fd = TyLong_AsLong(tmp);
            Ty_DECREF(tmp);
            if (fd < 0 && TyErr_Occurred())
                goto error;
            tty = fd == fileno(stdout) && isatty(fd);
        }
    }

    /* If we're interactive, use (GNU) readline */
    if (tty) {
        TyObject *po = NULL;
        const char *promptstr;
        char *s = NULL;
        TyObject *stdin_encoding = NULL, *stdin_errors = NULL;
        TyObject *stdout_encoding = NULL, *stdout_errors = NULL;
        const char *stdin_encoding_str, *stdin_errors_str;
        TyObject *result;
        size_t len;

        /* stdin is a text stream, so it must have an encoding. */
        stdin_encoding = PyObject_GetAttr(fin, &_Ty_ID(encoding));
        if (stdin_encoding == NULL) {
            tty = 0;
            goto _readline_errors;
        }
        stdin_errors = PyObject_GetAttr(fin, &_Ty_ID(errors));
        if (stdin_errors == NULL) {
            tty = 0;
            goto _readline_errors;
        }
        if (!TyUnicode_Check(stdin_encoding) ||
            !TyUnicode_Check(stdin_errors))
        {
            tty = 0;
            goto _readline_errors;
        }
        stdin_encoding_str = TyUnicode_AsUTF8(stdin_encoding);
        if (stdin_encoding_str == NULL) {
            goto _readline_errors;
        }
        stdin_errors_str = TyUnicode_AsUTF8(stdin_errors);
        if (stdin_errors_str == NULL) {
            goto _readline_errors;
        }
        if (_PyFile_Flush(fout) < 0) {
            TyErr_Clear();
        }
        if (prompt != NULL) {
            /* We have a prompt, encode it as stdout would */
            const char *stdout_encoding_str, *stdout_errors_str;
            TyObject *stringpo;
            stdout_encoding = PyObject_GetAttr(fout, &_Ty_ID(encoding));
            if (stdout_encoding == NULL) {
                tty = 0;
                goto _readline_errors;
            }
            stdout_errors = PyObject_GetAttr(fout, &_Ty_ID(errors));
            if (stdout_errors == NULL) {
                tty = 0;
                goto _readline_errors;
            }
            if (!TyUnicode_Check(stdout_encoding) ||
                !TyUnicode_Check(stdout_errors))
            {
                tty = 0;
                goto _readline_errors;
            }
            stdout_encoding_str = TyUnicode_AsUTF8(stdout_encoding);
            if (stdout_encoding_str == NULL) {
                goto _readline_errors;
            }
            stdout_errors_str = TyUnicode_AsUTF8(stdout_errors);
            if (stdout_errors_str == NULL) {
                goto _readline_errors;
            }
            stringpo = PyObject_Str(prompt);
            if (stringpo == NULL)
                goto _readline_errors;
            po = TyUnicode_AsEncodedString(stringpo,
                stdout_encoding_str, stdout_errors_str);
            Ty_CLEAR(stdout_encoding);
            Ty_CLEAR(stdout_errors);
            Ty_CLEAR(stringpo);
            if (po == NULL)
                goto _readline_errors;
            assert(TyBytes_Check(po));
            promptstr = TyBytes_AS_STRING(po);
            if ((Ty_ssize_t)strlen(promptstr) != TyBytes_GET_SIZE(po)) {
                TyErr_SetString(TyExc_ValueError,
                        "input: prompt string cannot contain null characters");
                goto _readline_errors;
            }
        }
        else {
            po = NULL;
            promptstr = "";
        }
        s = TyOS_Readline(stdin, stdout, promptstr);
        if (s == NULL) {
            TyErr_CheckSignals();
            if (!TyErr_Occurred())
                TyErr_SetNone(TyExc_KeyboardInterrupt);
            goto _readline_errors;
        }

        len = strlen(s);
        if (len == 0) {
            TyErr_SetNone(TyExc_EOFError);
            result = NULL;
        }
        else {
            if (len > PY_SSIZE_T_MAX) {
                TyErr_SetString(TyExc_OverflowError,
                                "input: input too long");
                result = NULL;
            }
            else {
                len--;   /* strip trailing '\n' */
                if (len != 0 && s[len-1] == '\r')
                    len--;   /* strip trailing '\r' */
                result = TyUnicode_Decode(s, len, stdin_encoding_str,
                                                  stdin_errors_str);
            }
        }
        Ty_DECREF(stdin_encoding);
        Ty_DECREF(stdin_errors);
        Ty_XDECREF(po);
        TyMem_Free(s);

        if (result != NULL) {
            if (TySys_Audit("builtins.input/result", "O", result) < 0) {
                goto error;
            }
        }

        Ty_DECREF(fin);
        Ty_DECREF(fout);
        Ty_DECREF(ferr);
        return result;

    _readline_errors:
        Ty_XDECREF(stdin_encoding);
        Ty_XDECREF(stdout_encoding);
        Ty_XDECREF(stdin_errors);
        Ty_XDECREF(stdout_errors);
        Ty_XDECREF(po);
        if (tty)
            goto error;

        TyErr_Clear();
    }

    /* Fallback if we're not interactive */
    if (prompt != NULL) {
        if (TyFile_WriteObject(prompt, fout, Ty_PRINT_RAW) != 0)
            goto error;
    }
    if (_PyFile_Flush(fout) < 0) {
        TyErr_Clear();
    }
    tmp = TyFile_GetLine(fin, -1);
    Ty_DECREF(fin);
    Ty_DECREF(fout);
    Ty_DECREF(ferr);
    return tmp;

error:
    Ty_XDECREF(fin);
    Ty_XDECREF(fout);
    Ty_XDECREF(ferr);
    return NULL;
}


/*[clinic input]
repr as builtin_repr

    obj: object
    /

Return the canonical string representation of the object.

For many object types, including most builtins, eval(repr(obj)) == obj.
[clinic start generated code]*/

static TyObject *
builtin_repr(TyObject *module, TyObject *obj)
/*[clinic end generated code: output=7ed3778c44fd0194 input=1c9e6d66d3e3be04]*/
{
    return PyObject_Repr(obj);
}


/*[clinic input]
round as builtin_round

    number: object
    ndigits: object = None

Round a number to a given precision in decimal digits.

The return value is an integer if ndigits is omitted or None.  Otherwise
the return value has the same type as the number.  ndigits may be negative.
[clinic start generated code]*/

static TyObject *
builtin_round_impl(TyObject *module, TyObject *number, TyObject *ndigits)
/*[clinic end generated code: output=ff0d9dd176c02ede input=275678471d7aca15]*/
{
    TyObject *result;
    if (ndigits == Ty_None) {
        result = _TyObject_MaybeCallSpecialNoArgs(number, &_Ty_ID(__round__));
    }
    else {
        result = _TyObject_MaybeCallSpecialOneArg(number, &_Ty_ID(__round__),
                                                  ndigits);
    }
    if (result == NULL && !TyErr_Occurred()) {
        TyErr_Format(TyExc_TypeError,
                     "type %.100s doesn't define __round__ method",
                     Ty_TYPE(number)->tp_name);
    }
    return result;
}


/*AC: we need to keep the kwds dict intact to easily call into the
 * list.sort method, which isn't currently supported in AC. So we just use
 * the initially generated signature with a custom implementation.
 */
/* [disabled clinic input]
sorted as builtin_sorted

    iterable as seq: object
    key as keyfunc: object = None
    reverse: object = False

Return a new list containing all items from the iterable in ascending order.

A custom key function can be supplied to customize the sort order, and the
reverse flag can be set to request the result in descending order.
[end disabled clinic input]*/

TyDoc_STRVAR(builtin_sorted__doc__,
"sorted($module, iterable, /, *, key=None, reverse=False)\n"
"--\n"
"\n"
"Return a new list containing all items from the iterable in ascending order.\n"
"\n"
"A custom key function can be supplied to customize the sort order, and the\n"
"reverse flag can be set to request the result in descending order.");

#define BUILTIN_SORTED_METHODDEF    \
    {"sorted", _PyCFunction_CAST(builtin_sorted), METH_FASTCALL | METH_KEYWORDS, builtin_sorted__doc__},

static TyObject *
builtin_sorted(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *newlist, *v, *seq, *callable;

    /* Keyword arguments are passed through list.sort() which will check
       them. */
    if (!_TyArg_UnpackStack(args, nargs, "sorted", 1, 1, &seq))
        return NULL;

    newlist = PySequence_List(seq);
    if (newlist == NULL)
        return NULL;

    callable = PyObject_GetAttr(newlist, &_Ty_ID(sort));
    if (callable == NULL) {
        Ty_DECREF(newlist);
        return NULL;
    }

    assert(nargs >= 1);
    v = PyObject_Vectorcall(callable, args + 1, nargs - 1, kwnames);
    Ty_DECREF(callable);
    if (v == NULL) {
        Ty_DECREF(newlist);
        return NULL;
    }
    Ty_DECREF(v);
    return newlist;
}


/* AC: cannot convert yet, as needs PEP 457 group support in inspect */
static TyObject *
builtin_vars(TyObject *self, TyObject *args)
{
    TyObject *v = NULL;
    TyObject *d;

    if (!TyArg_UnpackTuple(args, "vars", 0, 1, &v))
        return NULL;
    if (v == NULL) {
        if (_TyEval_GetFrame() != NULL) {
            d = _TyEval_GetFrameLocals();
        }
        else {
            TyThreadState *tstate = _TyThreadState_GET();
            d = _TyEval_GetGlobalsFromRunningMain(tstate);
            if (d == NULL) {
                if (!_TyErr_Occurred(tstate)) {
                    d = _TyEval_GetFrameLocals();
                    assert(_TyErr_Occurred(tstate));
                }
            }
            else {
                Ty_INCREF(d);
            }
        }
    }
    else {
        if (PyObject_GetOptionalAttr(v, &_Ty_ID(__dict__), &d) == 0) {
            TyErr_SetString(TyExc_TypeError,
                "vars() argument must have __dict__ attribute");
        }
    }
    return d;
}

TyDoc_STRVAR(vars_doc,
"vars([object]) -> dictionary\n\
\n\
Without arguments, equivalent to locals().\n\
With an argument, equivalent to object.__dict__.");


/* Improved Kahan–Babuška algorithm by Arnold Neumaier
   Neumaier, A. (1974), Rundungsfehleranalyse einiger Verfahren
   zur Summation endlicher Summen.  Z. angew. Math. Mech.,
   54: 39-51. https://doi.org/10.1002/zamm.19740540106
   https://en.wikipedia.org/wiki/Kahan_summation_algorithm#Further_enhancements
 */

typedef struct {
    double hi;     /* high-order bits for a running sum */
    double lo;     /* a running compensation for lost low-order bits */
} CompensatedSum;

static inline CompensatedSum
cs_from_double(double x)
{
    return (CompensatedSum) {x};
}

static inline CompensatedSum
cs_add(CompensatedSum total, double x)
{
    double t = total.hi + x;
    if (fabs(total.hi) >= fabs(x)) {
        total.lo += (total.hi - t) + x;
    }
    else {
        total.lo += (x - t) + total.hi;
    }
    return (CompensatedSum) {t, total.lo};
}

static inline double
cs_to_double(CompensatedSum total)
{
    /* Avoid losing the sign on a negative result,
       and don't let adding the compensation convert
       an infinite or overflowed sum to a NaN. */
    if (total.lo && isfinite(total.lo)) {
        return total.hi + total.lo;
    }
    return total.hi;
}

/*[clinic input]
sum as builtin_sum

    iterable: object
    /
    start: object(c_default="NULL") = 0

Return the sum of a 'start' value (default: 0) plus an iterable of numbers

When the iterable is empty, return the start value.
This function is intended specifically for use with numeric values and may
reject non-numeric types.
[clinic start generated code]*/

static TyObject *
builtin_sum_impl(TyObject *module, TyObject *iterable, TyObject *start)
/*[clinic end generated code: output=df758cec7d1d302f input=162b50765250d222]*/
{
    TyObject *result = start;
    TyObject *temp, *item, *iter;

    iter = PyObject_GetIter(iterable);
    if (iter == NULL)
        return NULL;

    if (result == NULL) {
        result = TyLong_FromLong(0);
        if (result == NULL) {
            Ty_DECREF(iter);
            return NULL;
        }
    } else {
        /* reject string values for 'start' parameter */
        if (TyUnicode_Check(result)) {
            TyErr_SetString(TyExc_TypeError,
                "sum() can't sum strings [use ''.join(seq) instead]");
            Ty_DECREF(iter);
            return NULL;
        }
        if (TyBytes_Check(result)) {
            TyErr_SetString(TyExc_TypeError,
                "sum() can't sum bytes [use b''.join(seq) instead]");
            Ty_DECREF(iter);
            return NULL;
        }
        if (TyByteArray_Check(result)) {
            TyErr_SetString(TyExc_TypeError,
                "sum() can't sum bytearray [use b''.join(seq) instead]");
            Ty_DECREF(iter);
            return NULL;
        }
        Ty_INCREF(result);
    }

#ifndef SLOW_SUM
    /* Fast addition by keeping temporary sums in C instead of new Python objects.
       Assumes all inputs are the same type.  If the assumption fails, default
       to the more general routine.
    */
    if (TyLong_CheckExact(result)) {
        int overflow;
        Ty_ssize_t i_result = TyLong_AsLongAndOverflow(result, &overflow);
        /* If this already overflowed, don't even enter the loop. */
        if (overflow == 0) {
            Ty_SETREF(result, NULL);
        }
        while(result == NULL) {
            item = TyIter_Next(iter);
            if (item == NULL) {
                Ty_DECREF(iter);
                if (TyErr_Occurred())
                    return NULL;
                return TyLong_FromSsize_t(i_result);
            }
            if (TyLong_CheckExact(item) || TyBool_Check(item)) {
                Ty_ssize_t b;
                overflow = 0;
                /* Single digits are common, fast, and cannot overflow on unpacking. */
                if (_TyLong_IsCompact((PyLongObject *)item)) {
                    b = _TyLong_CompactValue((PyLongObject *)item);
                }
                else {
                    b = TyLong_AsLongAndOverflow(item, &overflow);
                }
                if (overflow == 0 &&
                    (i_result >= 0 ? (b <= PY_SSIZE_T_MAX - i_result)
                                   : (b >= PY_SSIZE_T_MIN - i_result)))
                {
                    i_result += b;
                    Ty_DECREF(item);
                    continue;
                }
            }
            /* Either overflowed or is not an int. Restore real objects and process normally */
            result = TyLong_FromSsize_t(i_result);
            if (result == NULL) {
                Ty_DECREF(item);
                Ty_DECREF(iter);
                return NULL;
            }
            temp = PyNumber_Add(result, item);
            Ty_DECREF(result);
            Ty_DECREF(item);
            result = temp;
            if (result == NULL) {
                Ty_DECREF(iter);
                return NULL;
            }
        }
    }

    if (TyFloat_CheckExact(result)) {
        CompensatedSum re_sum = cs_from_double(TyFloat_AS_DOUBLE(result));
        Ty_SETREF(result, NULL);
        while(result == NULL) {
            item = TyIter_Next(iter);
            if (item == NULL) {
                Ty_DECREF(iter);
                if (TyErr_Occurred())
                    return NULL;
                return TyFloat_FromDouble(cs_to_double(re_sum));
            }
            if (TyFloat_CheckExact(item)) {
                re_sum = cs_add(re_sum, TyFloat_AS_DOUBLE(item));
                _Ty_DECREF_SPECIALIZED(item, _TyFloat_ExactDealloc);
                continue;
            }
            if (TyLong_Check(item)) {
                double value = TyLong_AsDouble(item);
                if (value != -1.0 || !TyErr_Occurred()) {
                    re_sum = cs_add(re_sum, value);
                    Ty_DECREF(item);
                    continue;
                }
                else {
                    Ty_DECREF(item);
                    Ty_DECREF(iter);
                    return NULL;
                }
            }
            result = TyFloat_FromDouble(cs_to_double(re_sum));
            if (result == NULL) {
                Ty_DECREF(item);
                Ty_DECREF(iter);
                return NULL;
            }
            temp = PyNumber_Add(result, item);
            Ty_DECREF(result);
            Ty_DECREF(item);
            result = temp;
            if (result == NULL) {
                Ty_DECREF(iter);
                return NULL;
            }
        }
    }

    if (TyComplex_CheckExact(result)) {
        Ty_complex z = TyComplex_AsCComplex(result);
        CompensatedSum re_sum = cs_from_double(z.real);
        CompensatedSum im_sum = cs_from_double(z.imag);
        Ty_SETREF(result, NULL);
        while (result == NULL) {
            item = TyIter_Next(iter);
            if (item == NULL) {
                Ty_DECREF(iter);
                if (TyErr_Occurred()) {
                    return NULL;
                }
                return TyComplex_FromDoubles(cs_to_double(re_sum),
                                             cs_to_double(im_sum));
            }
            if (TyComplex_CheckExact(item)) {
                z = TyComplex_AsCComplex(item);
                re_sum = cs_add(re_sum, z.real);
                im_sum = cs_add(im_sum, z.imag);
                Ty_DECREF(item);
                continue;
            }
            if (TyLong_Check(item)) {
                double value = TyLong_AsDouble(item);
                if (value != -1.0 || !TyErr_Occurred()) {
                    re_sum = cs_add(re_sum, value);
                    Ty_DECREF(item);
                    continue;
                }
                else {
                    Ty_DECREF(item);
                    Ty_DECREF(iter);
                    return NULL;
                }
            }
            if (TyFloat_Check(item)) {
                double value = TyFloat_AS_DOUBLE(item);
                re_sum = cs_add(re_sum, value);
                _Ty_DECREF_SPECIALIZED(item, _TyFloat_ExactDealloc);
                continue;
            }
            result = TyComplex_FromDoubles(cs_to_double(re_sum),
                                           cs_to_double(im_sum));
            if (result == NULL) {
                Ty_DECREF(item);
                Ty_DECREF(iter);
                return NULL;
            }
            temp = PyNumber_Add(result, item);
            Ty_DECREF(result);
            Ty_DECREF(item);
            result = temp;
            if (result == NULL) {
                Ty_DECREF(iter);
                return NULL;
            }
        }
    }
#endif

    for(;;) {
        item = TyIter_Next(iter);
        if (item == NULL) {
            /* error, or end-of-sequence */
            if (TyErr_Occurred()) {
                Ty_SETREF(result, NULL);
            }
            break;
        }
        /* It's tempting to use PyNumber_InPlaceAdd instead of
           PyNumber_Add here, to avoid quadratic running time
           when doing 'sum(list_of_lists, [])'.  However, this
           would produce a change in behaviour: a snippet like

             empty = []
             sum([[x] for x in range(10)], empty)

           would change the value of empty. In fact, using
           in-place addition rather that binary addition for
           any of the steps introduces subtle behavior changes:

           https://bugs.python.org/issue18305 */
        temp = PyNumber_Add(result, item);
        Ty_DECREF(result);
        Ty_DECREF(item);
        result = temp;
        if (result == NULL)
            break;
    }
    Ty_DECREF(iter);
    return result;
}


/*[clinic input]
isinstance as builtin_isinstance

    obj: object
    class_or_tuple: object
    /

Return whether an object is an instance of a class or of a subclass thereof.

A tuple, as in ``isinstance(x, (A, B, ...))``, may be given as the target to
check against. This is equivalent to ``isinstance(x, A) or isinstance(x, B)
or ...`` etc.
[clinic start generated code]*/

static TyObject *
builtin_isinstance_impl(TyObject *module, TyObject *obj,
                        TyObject *class_or_tuple)
/*[clinic end generated code: output=6faf01472c13b003 input=ffa743db1daf7549]*/
{
    int retval;

    retval = PyObject_IsInstance(obj, class_or_tuple);
    if (retval < 0)
        return NULL;
    return TyBool_FromLong(retval);
}


/*[clinic input]
issubclass as builtin_issubclass

    cls: object
    class_or_tuple: object
    /

Return whether 'cls' is derived from another class or is the same class.

A tuple, as in ``issubclass(x, (A, B, ...))``, may be given as the target to
check against. This is equivalent to ``issubclass(x, A) or issubclass(x, B)
or ...``.
[clinic start generated code]*/

static TyObject *
builtin_issubclass_impl(TyObject *module, TyObject *cls,
                        TyObject *class_or_tuple)
/*[clinic end generated code: output=358412410cd7a250 input=a24b9f3d58c370d6]*/
{
    int retval;

    retval = PyObject_IsSubclass(cls, class_or_tuple);
    if (retval < 0)
        return NULL;
    return TyBool_FromLong(retval);
}

typedef struct {
    PyObject_HEAD
    Ty_ssize_t tuplesize;
    TyObject *ittuple;     /* tuple of iterators */
    TyObject *result;
    int strict;
} zipobject;

#define _zipobject_CAST(op)     ((zipobject *)(op))

static TyObject *
zip_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    zipobject *lz;
    Ty_ssize_t i;
    TyObject *ittuple;  /* tuple of iterators */
    TyObject *result;
    Ty_ssize_t tuplesize;
    int strict = 0;

    if (kwds) {
        TyObject *empty = TyTuple_New(0);
        if (empty == NULL) {
            return NULL;
        }
        static char *kwlist[] = {"strict", NULL};
        int parsed = TyArg_ParseTupleAndKeywords(
                empty, kwds, "|$p:zip", kwlist, &strict);
        Ty_DECREF(empty);
        if (!parsed) {
            return NULL;
        }
    }

    /* args must be a tuple */
    assert(TyTuple_Check(args));
    tuplesize = TyTuple_GET_SIZE(args);

    /* obtain iterators */
    ittuple = TyTuple_New(tuplesize);
    if (ittuple == NULL)
        return NULL;
    for (i=0; i < tuplesize; ++i) {
        TyObject *item = TyTuple_GET_ITEM(args, i);
        TyObject *it = PyObject_GetIter(item);
        if (it == NULL) {
            Ty_DECREF(ittuple);
            return NULL;
        }
        TyTuple_SET_ITEM(ittuple, i, it);
    }

    /* create a result holder */
    result = TyTuple_New(tuplesize);
    if (result == NULL) {
        Ty_DECREF(ittuple);
        return NULL;
    }
    for (i=0 ; i < tuplesize ; i++) {
        TyTuple_SET_ITEM(result, i, Ty_NewRef(Ty_None));
    }

    /* create zipobject structure */
    lz = (zipobject *)type->tp_alloc(type, 0);
    if (lz == NULL) {
        Ty_DECREF(ittuple);
        Ty_DECREF(result);
        return NULL;
    }
    lz->ittuple = ittuple;
    lz->tuplesize = tuplesize;
    lz->result = result;
    lz->strict = strict;

    return (TyObject *)lz;
}

static void
zip_dealloc(TyObject *self)
{
    zipobject *lz = _zipobject_CAST(self);
    PyObject_GC_UnTrack(lz);
    Ty_XDECREF(lz->ittuple);
    Ty_XDECREF(lz->result);
    Ty_TYPE(lz)->tp_free(lz);
}

static int
zip_traverse(TyObject *self, visitproc visit, void *arg)
{
    zipobject *lz = _zipobject_CAST(self);
    Ty_VISIT(lz->ittuple);
    Ty_VISIT(lz->result);
    return 0;
}

static TyObject *
zip_next(TyObject *self)
{
    zipobject *lz = _zipobject_CAST(self);

    Ty_ssize_t i;
    Ty_ssize_t tuplesize = lz->tuplesize;
    TyObject *result = lz->result;
    TyObject *it;
    TyObject *item;
    TyObject *olditem;

    if (tuplesize == 0)
        return NULL;

    if (_TyObject_IsUniquelyReferenced(result)) {
        Ty_INCREF(result);
        for (i=0 ; i < tuplesize ; i++) {
            it = TyTuple_GET_ITEM(lz->ittuple, i);
            item = (*Ty_TYPE(it)->tp_iternext)(it);
            if (item == NULL) {
                Ty_DECREF(result);
                if (lz->strict) {
                    goto check;
                }
                return NULL;
            }
            olditem = TyTuple_GET_ITEM(result, i);
            TyTuple_SET_ITEM(result, i, item);
            Ty_DECREF(olditem);
        }
        // bpo-42536: The GC may have untracked this result tuple. Since we're
        // recycling it, make sure it's tracked again:
        _TyTuple_Recycle(result);
    } else {
        result = TyTuple_New(tuplesize);
        if (result == NULL)
            return NULL;
        for (i=0 ; i < tuplesize ; i++) {
            it = TyTuple_GET_ITEM(lz->ittuple, i);
            item = (*Ty_TYPE(it)->tp_iternext)(it);
            if (item == NULL) {
                Ty_DECREF(result);
                if (lz->strict) {
                    goto check;
                }
                return NULL;
            }
            TyTuple_SET_ITEM(result, i, item);
        }
    }
    return result;
check:
    if (TyErr_Occurred()) {
        if (!TyErr_ExceptionMatches(TyExc_StopIteration)) {
            // next() on argument i raised an exception (not StopIteration)
            return NULL;
        }
        TyErr_Clear();
    }
    if (i) {
        // ValueError: zip() argument 2 is shorter than argument 1
        // ValueError: zip() argument 3 is shorter than arguments 1-2
        const char* plural = i == 1 ? " " : "s 1-";
        return TyErr_Format(TyExc_ValueError,
                            "zip() argument %d is shorter than argument%s%d",
                            i + 1, plural, i);
    }
    for (i = 1; i < tuplesize; i++) {
        it = TyTuple_GET_ITEM(lz->ittuple, i);
        item = (*Ty_TYPE(it)->tp_iternext)(it);
        if (item) {
            Ty_DECREF(item);
            const char* plural = i == 1 ? " " : "s 1-";
            return TyErr_Format(TyExc_ValueError,
                                "zip() argument %d is longer than argument%s%d",
                                i + 1, plural, i);
        }
        if (TyErr_Occurred()) {
            if (!TyErr_ExceptionMatches(TyExc_StopIteration)) {
                // next() on argument i raised an exception (not StopIteration)
                return NULL;
            }
            TyErr_Clear();
        }
        // Argument i is exhausted. So far so good...
    }
    // All arguments are exhausted. Success!
    return NULL;
}

static TyObject *
zip_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    zipobject *lz = _zipobject_CAST(self);
    /* Just recreate the zip with the internal iterator tuple */
    if (lz->strict) {
        return TyTuple_Pack(3, Ty_TYPE(lz), lz->ittuple, Ty_True);
    }
    return TyTuple_Pack(2, Ty_TYPE(lz), lz->ittuple);
}

static TyObject *
zip_setstate(TyObject *self, TyObject *state)
{
    int strict = PyObject_IsTrue(state);
    if (strict < 0) {
        return NULL;
    }
    zipobject *lz = _zipobject_CAST(self);
    lz->strict = strict;
    Py_RETURN_NONE;
}

static TyMethodDef zip_methods[] = {
    {"__reduce__", zip_reduce, METH_NOARGS, reduce_doc},
    {"__setstate__", zip_setstate, METH_O, setstate_doc},
    {NULL}  /* sentinel */
};

TyDoc_STRVAR(zip_doc,
"zip(*iterables, strict=False)\n\
--\n\
\n\
The zip object yields n-length tuples, where n is the number of iterables\n\
passed as positional arguments to zip().  The i-th element in every tuple\n\
comes from the i-th iterable argument to zip().  This continues until the\n\
shortest argument is exhausted.\n\
\n\
If strict is true and one of the arguments is exhausted before the others,\n\
raise a ValueError.\n\
\n\
   >>> list(zip('abcdefg', range(3), range(4)))\n\
   [('a', 0, 0), ('b', 1, 1), ('c', 2, 2)]");

TyTypeObject PyZip_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "zip",                              /* tp_name */
    sizeof(zipobject),                  /* tp_basicsize */
    0,                                  /* tp_itemsize */
    /* methods */
    zip_dealloc,                        /* tp_dealloc */
    0,                                  /* tp_vectorcall_offset */
    0,                                  /* tp_getattr */
    0,                                  /* tp_setattr */
    0,                                  /* tp_as_async */
    0,                                  /* tp_repr */
    0,                                  /* tp_as_number */
    0,                                  /* tp_as_sequence */
    0,                                  /* tp_as_mapping */
    0,                                  /* tp_hash */
    0,                                  /* tp_call */
    0,                                  /* tp_str */
    PyObject_GenericGetAttr,            /* tp_getattro */
    0,                                  /* tp_setattro */
    0,                                  /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
        Ty_TPFLAGS_BASETYPE,            /* tp_flags */
    zip_doc,                            /* tp_doc */
    zip_traverse,                       /* tp_traverse */
    0,                                  /* tp_clear */
    0,                                  /* tp_richcompare */
    0,                                  /* tp_weaklistoffset */
    PyObject_SelfIter,                  /* tp_iter */
    zip_next,                           /* tp_iternext */
    zip_methods,                        /* tp_methods */
    0,                                  /* tp_members */
    0,                                  /* tp_getset */
    0,                                  /* tp_base */
    0,                                  /* tp_dict */
    0,                                  /* tp_descr_get */
    0,                                  /* tp_descr_set */
    0,                                  /* tp_dictoffset */
    0,                                  /* tp_init */
    TyType_GenericAlloc,                /* tp_alloc */
    zip_new,                            /* tp_new */
    PyObject_GC_Del,                    /* tp_free */
};


static TyMethodDef builtin_methods[] = {
    {"__build_class__", _PyCFunction_CAST(builtin___build_class__),
     METH_FASTCALL | METH_KEYWORDS, build_class_doc},
    BUILTIN___IMPORT___METHODDEF
    BUILTIN_ABS_METHODDEF
    BUILTIN_ALL_METHODDEF
    BUILTIN_ANY_METHODDEF
    BUILTIN_ASCII_METHODDEF
    BUILTIN_BIN_METHODDEF
    {"breakpoint", _PyCFunction_CAST(builtin_breakpoint), METH_FASTCALL | METH_KEYWORDS, breakpoint_doc},
    BUILTIN_CALLABLE_METHODDEF
    BUILTIN_CHR_METHODDEF
    BUILTIN_COMPILE_METHODDEF
    BUILTIN_DELATTR_METHODDEF
    {"dir", builtin_dir, METH_VARARGS, dir_doc},
    BUILTIN_DIVMOD_METHODDEF
    BUILTIN_EVAL_METHODDEF
    BUILTIN_EXEC_METHODDEF
    BUILTIN_FORMAT_METHODDEF
    {"getattr", _PyCFunction_CAST(builtin_getattr), METH_FASTCALL, getattr_doc},
    BUILTIN_GLOBALS_METHODDEF
    BUILTIN_HASATTR_METHODDEF
    BUILTIN_HASH_METHODDEF
    BUILTIN_HEX_METHODDEF
    BUILTIN_ID_METHODDEF
    BUILTIN_INPUT_METHODDEF
    BUILTIN_ISINSTANCE_METHODDEF
    BUILTIN_ISSUBCLASS_METHODDEF
    {"iter", _PyCFunction_CAST(builtin_iter), METH_FASTCALL, iter_doc},
    BUILTIN_AITER_METHODDEF
    BUILTIN_LEN_METHODDEF
    BUILTIN_LOCALS_METHODDEF
    {"max", _PyCFunction_CAST(builtin_max), METH_FASTCALL | METH_KEYWORDS, max_doc},
    {"min", _PyCFunction_CAST(builtin_min), METH_FASTCALL | METH_KEYWORDS, min_doc},
    {"next", _PyCFunction_CAST(builtin_next), METH_FASTCALL, next_doc},
    BUILTIN_ANEXT_METHODDEF
    BUILTIN_OCT_METHODDEF
    BUILTIN_ORD_METHODDEF
    BUILTIN_POW_METHODDEF
    BUILTIN_PRINT_METHODDEF
    BUILTIN_REPR_METHODDEF
    BUILTIN_ROUND_METHODDEF
    BUILTIN_SETATTR_METHODDEF
    BUILTIN_SORTED_METHODDEF
    BUILTIN_SUM_METHODDEF
    {"vars",            builtin_vars,       METH_VARARGS, vars_doc},
    {NULL,              NULL},
};

TyDoc_STRVAR(builtin_doc,
"Built-in functions, types, exceptions, and other objects.\n\
\n\
This module provides direct access to all 'built-in'\n\
identifiers of Python; for example, builtins.len is\n\
the full name for the built-in function len().\n\
\n\
This module is not normally accessed explicitly by most\n\
applications, but can be useful in modules that provide\n\
objects with the same name as a built-in value, but in\n\
which the built-in of that name is also needed.");

static struct TyModuleDef builtinsmodule = {
    PyModuleDef_HEAD_INIT,
    "builtins",
    builtin_doc,
    -1, /* multiple "initialization" just copies the module dict. */
    builtin_methods,
    NULL,
    NULL,
    NULL,
    NULL
};


TyObject *
_PyBuiltin_Init(TyInterpreterState *interp)
{
    TyObject *mod, *dict, *debug;

    const TyConfig *config = _TyInterpreterState_GetConfig(interp);

    mod = _TyModule_CreateInitialized(&builtinsmodule, PYTHON_API_VERSION);
    if (mod == NULL)
        return NULL;
#ifdef Ty_GIL_DISABLED
    PyUnstable_Module_SetGIL(mod, Ty_MOD_GIL_NOT_USED);
#endif
    dict = TyModule_GetDict(mod);

#ifdef Ty_TRACE_REFS
    /* "builtins" exposes a number of statically allocated objects
     * that, before this code was added in 2.3, never showed up in
     * the list of "all objects" maintained by Ty_TRACE_REFS.  As a
     * result, programs leaking references to None and False (etc)
     * couldn't be diagnosed by examining sys.getobjects(0).
     */
#define ADD_TO_ALL(OBJECT) _Ty_AddToAllObjects((TyObject *)(OBJECT))
#else
#define ADD_TO_ALL(OBJECT) (void)0
#endif

#define SETBUILTIN(NAME, OBJECT) \
    if (TyDict_SetItemString(dict, NAME, (TyObject *)OBJECT) < 0)       \
        return NULL;                                                    \
    ADD_TO_ALL(OBJECT)

    SETBUILTIN("None",                  Ty_None);
    SETBUILTIN("Ellipsis",              Ty_Ellipsis);
    SETBUILTIN("NotImplemented",        Ty_NotImplemented);
    SETBUILTIN("False",                 Ty_False);
    SETBUILTIN("True",                  Ty_True);
    SETBUILTIN("bool",                  &TyBool_Type);
    SETBUILTIN("memoryview",            &TyMemoryView_Type);
    SETBUILTIN("bytearray",             &TyByteArray_Type);
    SETBUILTIN("bytes",                 &TyBytes_Type);
    SETBUILTIN("classmethod",           &TyClassMethod_Type);
    SETBUILTIN("complex",               &TyComplex_Type);
    SETBUILTIN("dict",                  &TyDict_Type);
    SETBUILTIN("enumerate",             &PyEnum_Type);
    SETBUILTIN("filter",                &PyFilter_Type);
    SETBUILTIN("float",                 &TyFloat_Type);
    SETBUILTIN("frozenset",             &TyFrozenSet_Type);
    SETBUILTIN("property",              &TyProperty_Type);
    SETBUILTIN("int",                   &TyLong_Type);
    SETBUILTIN("list",                  &TyList_Type);
    SETBUILTIN("map",                   &PyMap_Type);
    SETBUILTIN("object",                &PyBaseObject_Type);
    SETBUILTIN("range",                 &TyRange_Type);
    SETBUILTIN("reversed",              &PyReversed_Type);
    SETBUILTIN("set",                   &TySet_Type);
    SETBUILTIN("slice",                 &TySlice_Type);
    SETBUILTIN("staticmethod",          &TyStaticMethod_Type);
    SETBUILTIN("str",                   &TyUnicode_Type);
    SETBUILTIN("super",                 &TySuper_Type);
    SETBUILTIN("tuple",                 &TyTuple_Type);
    SETBUILTIN("type",                  &TyType_Type);
    SETBUILTIN("zip",                   &PyZip_Type);
    debug = TyBool_FromLong(config->optimization_level == 0);
    if (TyDict_SetItemString(dict, "__debug__", debug) < 0) {
        Ty_DECREF(debug);
        return NULL;
    }
    Ty_DECREF(debug);

    return mod;
#undef ADD_TO_ALL
#undef SETBUILTIN
}
