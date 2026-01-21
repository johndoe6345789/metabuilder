/*[clinic input]
preserve
[clinic start generated code]*/

#include "pycore_critical_section.h"// Ty_BEGIN_CRITICAL_SECTION()
#include "pycore_long.h"          // _TyLong_UInt64_Converter()
#include "pycore_modsupport.h"    // _TyArg_CheckPositional()

TyDoc_STRVAR(_random_Random_random__doc__,
"random($self, /)\n"
"--\n"
"\n"
"random() -> x in the interval [0, 1).");

#define _RANDOM_RANDOM_RANDOM_METHODDEF    \
    {"random", (PyCFunction)_random_Random_random, METH_NOARGS, _random_Random_random__doc__},

static TyObject *
_random_Random_random_impl(RandomObject *self);

static TyObject *
_random_Random_random(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _random_Random_random_impl((RandomObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_random_Random_seed__doc__,
"seed($self, n=None, /)\n"
"--\n"
"\n"
"seed([n]) -> None.\n"
"\n"
"Defaults to use urandom and falls back to a combination\n"
"of the current time and the process identifier.");

#define _RANDOM_RANDOM_SEED_METHODDEF    \
    {"seed", _PyCFunction_CAST(_random_Random_seed), METH_FASTCALL, _random_Random_seed__doc__},

static TyObject *
_random_Random_seed_impl(RandomObject *self, TyObject *n);

static TyObject *
_random_Random_seed(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *return_value = NULL;
    TyObject *n = Ty_None;

    if (!_TyArg_CheckPositional("seed", nargs, 0, 1)) {
        goto exit;
    }
    if (nargs < 1) {
        goto skip_optional;
    }
    n = args[0];
skip_optional:
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _random_Random_seed_impl((RandomObject *)self, n);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}

TyDoc_STRVAR(_random_Random_getstate__doc__,
"getstate($self, /)\n"
"--\n"
"\n"
"getstate() -> tuple containing the current state.");

#define _RANDOM_RANDOM_GETSTATE_METHODDEF    \
    {"getstate", (PyCFunction)_random_Random_getstate, METH_NOARGS, _random_Random_getstate__doc__},

static TyObject *
_random_Random_getstate_impl(RandomObject *self);

static TyObject *
_random_Random_getstate(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _random_Random_getstate_impl((RandomObject *)self);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_random_Random_setstate__doc__,
"setstate($self, state, /)\n"
"--\n"
"\n"
"setstate(state) -> None.  Restores generator state.");

#define _RANDOM_RANDOM_SETSTATE_METHODDEF    \
    {"setstate", (PyCFunction)_random_Random_setstate, METH_O, _random_Random_setstate__doc__},

static TyObject *
_random_Random_setstate_impl(RandomObject *self, TyObject *state);

static TyObject *
_random_Random_setstate(TyObject *self, TyObject *state)
{
    TyObject *return_value = NULL;

    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _random_Random_setstate_impl((RandomObject *)self, state);
    Ty_END_CRITICAL_SECTION();

    return return_value;
}

TyDoc_STRVAR(_random_Random_getrandbits__doc__,
"getrandbits($self, k, /)\n"
"--\n"
"\n"
"getrandbits(k) -> x.  Generates an int with k random bits.");

#define _RANDOM_RANDOM_GETRANDBITS_METHODDEF    \
    {"getrandbits", (PyCFunction)_random_Random_getrandbits, METH_O, _random_Random_getrandbits__doc__},

static TyObject *
_random_Random_getrandbits_impl(RandomObject *self, uint64_t k);

static TyObject *
_random_Random_getrandbits(TyObject *self, TyObject *arg)
{
    TyObject *return_value = NULL;
    uint64_t k;

    if (!_TyLong_UInt64_Converter(arg, &k)) {
        goto exit;
    }
    Ty_BEGIN_CRITICAL_SECTION(self);
    return_value = _random_Random_getrandbits_impl((RandomObject *)self, k);
    Ty_END_CRITICAL_SECTION();

exit:
    return return_value;
}
/*[clinic end generated code: output=7ce97b2194eecaf7 input=a9049054013a1b77]*/
