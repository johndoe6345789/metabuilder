/*[clinic input]
preserve
[clinic start generated code]*/

#if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#  include "pycore_gc.h"          // TyGC_Head
#  include "pycore_runtime.h"     // _Ty_ID()
#endif
#include "pycore_critical_section.h"// Ty_BEGIN_CRITICAL_SECTION()
#include "pycore_modsupport.h"    // _TyArg_UnpackKeywords()

#if defined(HAVE_MP_SEMAPHORE) && defined(MS_WINDOWS)

TyDoc_STRVAR(_multiprocessing_SemLock_acquire__doc__,
"acquire($self, /, block=True, timeout=None)\n"
"--\n"
"\n"
"Acquire the semaphore/lock.");

#define _MULTIPROCESSING_SEMLOCK_ACQUIRE_METHODDEF    \
    {"acquire", _PyCFunction_CAST(_multiprocessing_SemLock_acquire), METH_FASTCALL|METH_KEYWORDS, _multiprocessing_SemLock_acquire__doc__},

static TyObject *
_multiprocessing_SemLock_acquire_impl(SemLockObject *self, int blocking,
                                      TyObject *timeout_obj);

static TyObject *
_multiprocessing_SemLock_acquire(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(block), &_Ty_ID(timeout), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"block", "timeout", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "acquire",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int blocking = 1;
    TyObject *timeout_obj = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        blocking = PyObject_IsTrue(args[0]);
        if (blocking < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    timeout_obj = args[1];
skip_optional_pos:
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _multiprocessing_SemLock_acquire_impl((SemLockObject *)self, blocking, timeout_obj);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

#endif /* defined(HAVE_MP_SEMAPHORE) && defined(MS_WINDOWS) */

#if defined(HAVE_MP_SEMAPHORE) && defined(MS_WINDOWS)

TyDoc_STRVAR(_multiprocessing_SemLock_release__doc__,
"release($self, /)\n"
"--\n"
"\n"
"Release the semaphore/lock.");

#define _MULTIPROCESSING_SEMLOCK_RELEASE_METHODDEF    \
    {"release", (PyCFunction)_multiprocessing_SemLock_release, METH_NOARGS, _multiprocessing_SemLock_release__doc__},

static TyObject *
_multiprocessing_SemLock_release_impl(SemLockObject *self);

static TyObject *
_multiprocessing_SemLock_release(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _multiprocessing_SemLock_release_impl((SemLockObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#endif /* defined(HAVE_MP_SEMAPHORE) && defined(MS_WINDOWS) */

#if defined(HAVE_MP_SEMAPHORE) && !defined(MS_WINDOWS)

TyDoc_STRVAR(_multiprocessing_SemLock_acquire__doc__,
"acquire($self, /, block=True, timeout=None)\n"
"--\n"
"\n"
"Acquire the semaphore/lock.");

#define _MULTIPROCESSING_SEMLOCK_ACQUIRE_METHODDEF    \
    {"acquire", _PyCFunction_CAST(_multiprocessing_SemLock_acquire), METH_FASTCALL|METH_KEYWORDS, _multiprocessing_SemLock_acquire__doc__},

static TyObject *
_multiprocessing_SemLock_acquire_impl(SemLockObject *self, int blocking,
                                      TyObject *timeout_obj);

static TyObject *
_multiprocessing_SemLock_acquire(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
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
        .ob_item = { &_Ty_ID(block), &_Ty_ID(timeout), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"block", "timeout", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "acquire",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[2];
    Ty_ssize_t noptargs = nargs + (kwnames ? TyTuple_GET_SIZE(kwnames) : 0) - 0;
    int blocking = 1;
    TyObject *timeout_obj = Ty_None;

    args = _TyArg_UnpackKeywords(args, nargs, NULL, kwnames, &_parser,
            /*minpos*/ 0, /*maxpos*/ 2, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!args) {
        goto exit;
    }
    if (!noptargs) {
        goto skip_optional_pos;
    }
    if (args[0]) {
        blocking = PyObject_IsTrue(args[0]);
        if (blocking < 0) {
            goto exit;
        }
        if (!--noptargs) {
            goto skip_optional_pos;
        }
    }
    timeout_obj = args[1];
skip_optional_pos:
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _multiprocessing_SemLock_acquire_impl((SemLockObject *)self, blocking, timeout_obj);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

#endif /* defined(HAVE_MP_SEMAPHORE) && !defined(MS_WINDOWS) */

#if defined(HAVE_MP_SEMAPHORE) && !defined(MS_WINDOWS)

TyDoc_STRVAR(_multiprocessing_SemLock_release__doc__,
"release($self, /)\n"
"--\n"
"\n"
"Release the semaphore/lock.");

#define _MULTIPROCESSING_SEMLOCK_RELEASE_METHODDEF    \
    {"release", (PyCFunction)_multiprocessing_SemLock_release, METH_NOARGS, _multiprocessing_SemLock_release__doc__},

static TyObject *
_multiprocessing_SemLock_release_impl(SemLockObject *self);

static TyObject *
_multiprocessing_SemLock_release(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _multiprocessing_SemLock_release_impl((SemLockObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#endif /* defined(HAVE_MP_SEMAPHORE) && !defined(MS_WINDOWS) */

#if defined(HAVE_MP_SEMAPHORE)

static TyObject *
_multiprocessing_SemLock_impl(TyTypeObject *type, int kind, int value,
                              int maxvalue, const char *name, int unlink);

static TyObject *
_multiprocessing_SemLock(TyTypeObject *type, TyObject *args, TyObject *kwargs)
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
        .ob_item = { &_Ty_ID(kind), &_Ty_ID(value), &_Ty_ID(maxvalue), &_Ty_ID(name), &_Ty_ID(unlink), },
    };
    #undef NUM_KEYWORDS
    #define KWTUPLE (&_kwtuple.ob_base.ob_base)

    #else  // !Ty_BUILD_CORE
    #  define KWTUPLE NULL
    #endif  // !Ty_BUILD_CORE

    static const char * const _keywords[] = {"kind", "value", "maxvalue", "name", "unlink", NULL};
    static _TyArg_Parser _parser = {
        .keywords = _keywords,
        .fname = "SemLock",
        .kwtuple = KWTUPLE,
    };
    #undef KWTUPLE
    TyObject *argsbuf[5];
    TyObject * const *fastargs;
    Ty_ssize_t nargs = TyTuple_GET_SIZE(args);
    int kind;
    int value;
    int maxvalue;
    const char *name;
    int unlink;

    fastargs = _TyArg_UnpackKeywords(_TyTuple_CAST(args)->ob_item, nargs, kwargs, NULL, &_parser,
            /*minpos*/ 5, /*maxpos*/ 5, /*minkw*/ 0, /*varpos*/ 0, argsbuf);
    if (!fastargs) {
        goto exit;
    }
    kind = TyLong_AsInt(fastargs[0]);
    if (kind == -1 && TyErr_Occurred()) {
        goto exit;
    }
    value = TyLong_AsInt(fastargs[1]);
    if (value == -1 && TyErr_Occurred()) {
        goto exit;
    }
    maxvalue = TyLong_AsInt(fastargs[2]);
    if (maxvalue == -1 && TyErr_Occurred()) {
        goto exit;
    }
    if (!TyUnicode_Check(fastargs[3])) {
        _TyArg_BadArgument("SemLock", "argument 'name'", "str", fastargs[3]);
        goto exit;
    }
    Ty_ssize_t name_length;
    name = TyUnicode_AsUTF8AndSize(fastargs[3], &name_length);
    if (name == NULL) {
        goto exit;
    }
    if (strlen(name) != (size_t)name_length) {
        TyErr_SetString(TyExc_ValueError, "embedded null character");
        goto exit;
    }
    unlink = PyObject_IsTrue(fastargs[4]);
    if (unlink < 0) {
        goto exit;
    }
    return_value = _multiprocessing_SemLock_impl(type, kind, value, maxvalue, name, unlink);

exit:
    return return_value;
}

#endif /* defined(HAVE_MP_SEMAPHORE) */

#if defined(HAVE_MP_SEMAPHORE)

TyDoc_STRVAR(_multiprocessing_SemLock__rebuild__doc__,
"_rebuild($type, handle, kind, maxvalue, name, /)\n"
"--\n"
"\n");

#define _MULTIPROCESSING_SEMLOCK__REBUILD_METHODDEF    \
    {"_rebuild", _PyCFunction_CAST(_multiprocessing_SemLock__rebuild), METH_FASTCALL|METH_CLASS, _multiprocessing_SemLock__rebuild__doc__},

static TyObject *
_multiprocessing_SemLock__rebuild_impl(TyTypeObject *type, SEM_HANDLE handle,
                                       int kind, int maxvalue,
                                       const char *name);

static TyObject *
_multiprocessing_SemLock__rebuild(TyObject *type, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    SEM_HANDLE handle;
    int kind;
    int maxvalue;
    const char *name;

    if (!_TyArg_ParseStack(args, nargs, ""F_SEM_HANDLE"iiz:_rebuild",
        &handle, &kind, &maxvalue, &name)) {
        goto exit;
    }
    return_value = _multiprocessing_SemLock__rebuild_impl((TyTypeObject *)type, handle, kind, maxvalue, name);

exit:
    return return_value;
}

#endif /* defined(HAVE_MP_SEMAPHORE) */

#if defined(HAVE_MP_SEMAPHORE)

TyDoc_STRVAR(_multiprocessing_SemLock__count__doc__,
"_count($self, /)\n"
"--\n"
"\n"
"Num of `acquire()`s minus num of `release()`s for this process.");

#define _MULTIPROCESSING_SEMLOCK__COUNT_METHODDEF    \
    {"_count", (PyCFunction)_multiprocessing_SemLock__count, METH_NOARGS, _multiprocessing_SemLock__count__doc__},

static TyObject *
_multiprocessing_SemLock__count_impl(SemLockObject *self);

static TyObject *
_multiprocessing_SemLock__count(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _multiprocessing_SemLock__count_impl((SemLockObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#endif /* defined(HAVE_MP_SEMAPHORE) */

#if defined(HAVE_MP_SEMAPHORE)

TyDoc_STRVAR(_multiprocessing_SemLock__is_mine__doc__,
"_is_mine($self, /)\n"
"--\n"
"\n"
"Whether the lock is owned by this thread.");

#define _MULTIPROCESSING_SEMLOCK__IS_MINE_METHODDEF    \
    {"_is_mine", (PyCFunction)_multiprocessing_SemLock__is_mine, METH_NOARGS, _multiprocessing_SemLock__is_mine__doc__},

static TyObject *
_multiprocessing_SemLock__is_mine_impl(SemLockObject *self);

static TyObject *
_multiprocessing_SemLock__is_mine(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _multiprocessing_SemLock__is_mine_impl((SemLockObject *)self);
}

#endif /* defined(HAVE_MP_SEMAPHORE) */

#if defined(HAVE_MP_SEMAPHORE)

TyDoc_STRVAR(_multiprocessing_SemLock__get_value__doc__,
"_get_value($self, /)\n"
"--\n"
"\n"
"Get the value of the semaphore.");

#define _MULTIPROCESSING_SEMLOCK__GET_VALUE_METHODDEF    \
    {"_get_value", (PyCFunction)_multiprocessing_SemLock__get_value, METH_NOARGS, _multiprocessing_SemLock__get_value__doc__},

static TyObject *
_multiprocessing_SemLock__get_value_impl(SemLockObject *self);

static TyObject *
_multiprocessing_SemLock__get_value(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _multiprocessing_SemLock__get_value_impl((SemLockObject *)self);
}

#endif /* defined(HAVE_MP_SEMAPHORE) */

#if defined(HAVE_MP_SEMAPHORE)

TyDoc_STRVAR(_multiprocessing_SemLock__is_zero__doc__,
"_is_zero($self, /)\n"
"--\n"
"\n"
"Return whether semaphore has value zero.");

#define _MULTIPROCESSING_SEMLOCK__IS_ZERO_METHODDEF    \
    {"_is_zero", (PyCFunction)_multiprocessing_SemLock__is_zero, METH_NOARGS, _multiprocessing_SemLock__is_zero__doc__},

static TyObject *
_multiprocessing_SemLock__is_zero_impl(SemLockObject *self);

static TyObject *
_multiprocessing_SemLock__is_zero(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _multiprocessing_SemLock__is_zero_impl((SemLockObject *)self);
}

#endif /* defined(HAVE_MP_SEMAPHORE) */

#if defined(HAVE_MP_SEMAPHORE)

TyDoc_STRVAR(_multiprocessing_SemLock__after_fork__doc__,
"_after_fork($self, /)\n"
"--\n"
"\n"
"Rezero the net acquisition count after fork().");

#define _MULTIPROCESSING_SEMLOCK__AFTER_FORK_METHODDEF    \
    {"_after_fork", (PyCFunction)_multiprocessing_SemLock__after_fork, METH_NOARGS, _multiprocessing_SemLock__after_fork__doc__},

static TyObject *
_multiprocessing_SemLock__after_fork_impl(SemLockObject *self);

static TyObject *
_multiprocessing_SemLock__after_fork(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _multiprocessing_SemLock__after_fork_impl((SemLockObject *)self);
}

#endif /* defined(HAVE_MP_SEMAPHORE) */

#if defined(HAVE_MP_SEMAPHORE)

TyDoc_STRVAR(_multiprocessing_SemLock___enter____doc__,
"__enter__($self, /)\n"
"--\n"
"\n"
"Enter the semaphore/lock.");

#define _MULTIPROCESSING_SEMLOCK___ENTER___METHODDEF    \
    {"__enter__", (PyCFunction)_multiprocessing_SemLock___enter__, METH_NOARGS, _multiprocessing_SemLock___enter____doc__},

static TyObject *
_multiprocessing_SemLock___enter___impl(SemLockObject *self);

static TyObject *
_multiprocessing_SemLock___enter__(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _multiprocessing_SemLock___enter___impl((SemLockObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

#endif /* defined(HAVE_MP_SEMAPHORE) */

#if defined(HAVE_MP_SEMAPHORE)

TyDoc_STRVAR(_multiprocessing_SemLock___exit____doc__,
"__exit__($self, exc_type=None, exc_value=None, exc_tb=None, /)\n"
"--\n"
"\n"
"Exit the semaphore/lock.");

#define _MULTIPROCESSING_SEMLOCK___EXIT___METHODDEF    \
    {"__exit__", _PyCFunction_CAST(_multiprocessing_SemLock___exit__), METH_FASTCALL, _multiprocessing_SemLock___exit____doc__},

static TyObject *
_multiprocessing_SemLock___exit___impl(SemLockObject *self,
                                       TyObject *exc_type,
                                       TyObject *exc_value, TyObject *exc_tb);

static TyObject *
_multiprocessing_SemLock___exit__(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *exc_type = Ty_None;
    TyObject *exc_value = Ty_None;
    TyObject *exc_tb = Ty_None;

    if (!_TyArg_CheckPositional("__exit__", nargs, 0, 3)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    exc_type = args[0];
    if (nargs < 2) {
        goto skip_optional;
    }
    exc_value = args[1];
    if (nargs < 3) {
        goto skip_optional;
    }
    exc_tb = args[2];
skip_optional:
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _multiprocessing_SemLock___exit___impl((SemLockObject *)self, exc_type, exc_value, exc_tb);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

#endif /* defined(HAVE_MP_SEMAPHORE) */

#ifndef _MULTIPROCESSING_SEMLOCK_ACQUIRE_METHODDEF
    #define _MULTIPROCESSING_SEMLOCK_ACQUIRE_METHODDEF
#endif /* !defined(_MULTIPROCESSING_SEMLOCK_ACQUIRE_METHODDEF) */

#ifndef _MULTIPROCESSING_SEMLOCK_RELEASE_METHODDEF
    #define _MULTIPROCESSING_SEMLOCK_RELEASE_METHODDEF
#endif /* !defined(_MULTIPROCESSING_SEMLOCK_RELEASE_METHODDEF) */

#ifndef _MULTIPROCESSING_SEMLOCK__REBUILD_METHODDEF
    #define _MULTIPROCESSING_SEMLOCK__REBUILD_METHODDEF
#endif /* !defined(_MULTIPROCESSING_SEMLOCK__REBUILD_METHODDEF) */

#ifndef _MULTIPROCESSING_SEMLOCK__COUNT_METHODDEF
    #define _MULTIPROCESSING_SEMLOCK__COUNT_METHODDEF
#endif /* !defined(_MULTIPROCESSING_SEMLOCK__COUNT_METHODDEF) */

#ifndef _MULTIPROCESSING_SEMLOCK__IS_MINE_METHODDEF
    #define _MULTIPROCESSING_SEMLOCK__IS_MINE_METHODDEF
#endif /* !defined(_MULTIPROCESSING_SEMLOCK__IS_MINE_METHODDEF) */

#ifndef _MULTIPROCESSING_SEMLOCK__GET_VALUE_METHODDEF
    #define _MULTIPROCESSING_SEMLOCK__GET_VALUE_METHODDEF
#endif /* !defined(_MULTIPROCESSING_SEMLOCK__GET_VALUE_METHODDEF) */

#ifndef _MULTIPROCESSING_SEMLOCK__IS_ZERO_METHODDEF
    #define _MULTIPROCESSING_SEMLOCK__IS_ZERO_METHODDEF
#endif /* !defined(_MULTIPROCESSING_SEMLOCK__IS_ZERO_METHODDEF) */

#ifndef _MULTIPROCESSING_SEMLOCK__AFTER_FORK_METHODDEF
    #define _MULTIPROCESSING_SEMLOCK__AFTER_FORK_METHODDEF
#endif /* !defined(_MULTIPROCESSING_SEMLOCK__AFTER_FORK_METHODDEF) */

#ifndef _MULTIPROCESSING_SEMLOCK___ENTER___METHODDEF
    #define _MULTIPROCESSING_SEMLOCK___ENTER___METHODDEF
#endif /* !defined(_MULTIPROCESSING_SEMLOCK___ENTER___METHODDEF) */

#ifndef _MULTIPROCESSING_SEMLOCK___EXIT___METHODDEF
    #define _MULTIPROCESSING_SEMLOCK___EXIT___METHODDEF
#endif /* !defined(_MULTIPROCESSING_SEMLOCK___EXIT___METHODDEF) */
/*[clinic end generated code: output=d1e349d4ee3d4bbf input=a9049054013a1b77]*/
