/* struct module -- pack values into and (out of) bytes objects */

/* New version supporting byte order, alignment and size options,
   character strings, and unsigned numbers */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"
#include "pycore_bytesobject.h"   // _PyBytesWriter
#include "pycore_long.h"          // _TyLong_AsByteArray()
#include "pycore_moduleobject.h"  // _TyModule_GetState()
#include "pycore_weakref.h"       // FT_CLEAR_WEAKREFS()

#include <stddef.h>               // offsetof()

/*[clinic input]
class Struct "PyStructObject *" "&PyStructType"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=9b032058a83ed7c3]*/

typedef struct {
    TyObject *cache;
    TyObject *PyStructType;
    TyObject *unpackiter_type;
    TyObject *StructError;
} _structmodulestate;

static inline _structmodulestate*
get_struct_state(TyObject *module)
{
    void *state = _TyModule_GetState(module);
    assert(state != NULL);
    return (_structmodulestate *)state;
}

static struct TyModuleDef _structmodule;

#define get_struct_state_structinst(self) \
    (get_struct_state(TyType_GetModuleByDef(Ty_TYPE(self), &_structmodule)))
#define get_struct_state_iterinst(self) \
    (get_struct_state(TyType_GetModule(Ty_TYPE(self))))

/* The translation function for each format character is table driven */
typedef struct _formatdef {
    char format;
    Ty_ssize_t size;
    Ty_ssize_t alignment;
    TyObject* (*unpack)(_structmodulestate *, const char *,
                        const struct _formatdef *);
    int (*pack)(_structmodulestate *, char *, TyObject *,
                const struct _formatdef *);
} formatdef;

typedef struct _formatcode {
    const struct _formatdef *fmtdef;
    Ty_ssize_t offset;
    Ty_ssize_t size;
    Ty_ssize_t repeat;
} formatcode;

/* Struct object interface */

typedef struct {
    PyObject_HEAD
    Ty_ssize_t s_size;
    Ty_ssize_t s_len;
    formatcode *s_codes;
    TyObject *s_format;
    TyObject *weakreflist; /* List of weak references */
} PyStructObject;

#define PyStructObject_CAST(op)     ((PyStructObject *)(op))
#define PyStruct_Check(op, state)   PyObject_TypeCheck(op, (TyTypeObject *)(state)->PyStructType)

#ifdef __powerc
#pragma options align=reset
#endif

/*[python input]
class cache_struct_converter(CConverter):
    type = 'PyStructObject *'
    converter = 'cache_struct_converter'
    c_default = "NULL"
    broken_limited_capi = True

    def parse_arg(self, argname, displayname, *, limited_capi):
        assert not limited_capi
        return self.format_code("""
            if (!{converter}(module, {argname}, &{paramname})) {{{{
                goto exit;
            }}}}
            """,
            argname=argname,
            converter=self.converter)

    def cleanup(self):
        return "Ty_XDECREF(%s);\n" % self.name
[python start generated code]*/
/*[python end generated code: output=da39a3ee5e6b4b0d input=c33b27d6b06006c6]*/

static int cache_struct_converter(TyObject *, TyObject *, PyStructObject **);

#include "clinic/_struct.c.h"

/* Helper for integer format codes: converts an arbitrary Python object to a
   PyLongObject if possible, otherwise fails.  Caller should decref. */

static TyObject *
get_pylong(_structmodulestate *state, TyObject *v)
{
    assert(v != NULL);
    if (!TyLong_Check(v)) {
        /* Not an integer;  try to use __index__ to convert. */
        if (PyIndex_Check(v)) {
            v = _PyNumber_Index(v);
            if (v == NULL)
                return NULL;
        }
        else {
            TyErr_SetString(state->StructError,
                            "required argument is not an integer");
            return NULL;
        }
    }
    else
        Ty_INCREF(v);

    assert(TyLong_Check(v));
    return v;
}

/* Helper routine to get a C long and raise the appropriate error if it isn't
   one */

static int
get_long(_structmodulestate *state, TyObject *v, long *p)
{
    long x;

    v = get_pylong(state, v);
    if (v == NULL)
        return -1;
    assert(TyLong_Check(v));
    x = TyLong_AsLong(v);
    Ty_DECREF(v);
    if (x == (long)-1 && TyErr_Occurred()) {
        return -1;
    }
    *p = x;
    return 0;
}


/* Same, but handling unsigned long */

static int
get_ulong(_structmodulestate *state, TyObject *v, unsigned long *p)
{
    unsigned long x;

    v = get_pylong(state, v);
    if (v == NULL)
        return -1;
    assert(TyLong_Check(v));
    x = TyLong_AsUnsignedLong(v);
    Ty_DECREF(v);
    if (x == (unsigned long)-1 && TyErr_Occurred()) {
        return -1;
    }
    *p = x;
    return 0;
}

/* Same, but handling native long long. */

static int
get_longlong(_structmodulestate *state, TyObject *v, long long *p)
{
    long long x;

    v = get_pylong(state, v);
    if (v == NULL)
        return -1;
    assert(TyLong_Check(v));
    x = TyLong_AsLongLong(v);
    Ty_DECREF(v);
    if (x == (long long)-1 && TyErr_Occurred()) {
        return -1;
    }
    *p = x;
    return 0;
}

/* Same, but handling native unsigned long long. */

static int
get_ulonglong(_structmodulestate *state, TyObject *v, unsigned long long *p)
{
    unsigned long long x;

    v = get_pylong(state, v);
    if (v == NULL)
        return -1;
    assert(TyLong_Check(v));
    x = TyLong_AsUnsignedLongLong(v);
    Ty_DECREF(v);
    if (x == (unsigned long long)-1 && TyErr_Occurred()) {
        return -1;
    }
    *p = x;
    return 0;
}

/* Same, but handling Ty_ssize_t */

static int
get_ssize_t(_structmodulestate *state, TyObject *v, Ty_ssize_t *p)
{
    Ty_ssize_t x;

    v = get_pylong(state, v);
    if (v == NULL)
        return -1;
    assert(TyLong_Check(v));
    x = TyLong_AsSsize_t(v);
    Ty_DECREF(v);
    if (x == (Ty_ssize_t)-1 && TyErr_Occurred()) {
        return -1;
    }
    *p = x;
    return 0;
}

/* Same, but handling size_t */

static int
get_size_t(_structmodulestate *state, TyObject *v, size_t *p)
{
    size_t x;

    v = get_pylong(state, v);
    if (v == NULL)
        return -1;
    assert(TyLong_Check(v));
    x = TyLong_AsSize_t(v);
    Ty_DECREF(v);
    if (x == (size_t)-1 && TyErr_Occurred()) {
        return -1;
    }
    *p = x;
    return 0;
}


#define RANGE_ERROR(state, f, flag) return _range_error(state, f, flag)


/* Floating-point helpers */

static TyObject *
unpack_halffloat(const char *p,  /* start of 2-byte string */
                 int le)         /* true for little-endian, false for big-endian */
{
    double x = TyFloat_Unpack2(p, le);
    if (x == -1.0 && TyErr_Occurred()) {
        return NULL;
    }
    return TyFloat_FromDouble(x);
}

static int
pack_halffloat(_structmodulestate *state,
               char *p,      /* start of 2-byte string */
               TyObject *v,  /* value to pack */
               int le)       /* true for little-endian, false for big-endian */
{
    double x = TyFloat_AsDouble(v);
    if (x == -1.0 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a float");
        return -1;
    }
    return TyFloat_Pack2(x, p, le);
}

static TyObject *
unpack_float(const char *p,  /* start of 4-byte string */
         int le)             /* true for little-endian, false for big-endian */
{
    double x;

    x = TyFloat_Unpack4(p, le);
    if (x == -1.0 && TyErr_Occurred())
        return NULL;
    return TyFloat_FromDouble(x);
}

static TyObject *
unpack_double(const char *p,  /* start of 8-byte string */
          int le)         /* true for little-endian, false for big-endian */
{
    double x;

    x = TyFloat_Unpack8(p, le);
    if (x == -1.0 && TyErr_Occurred())
        return NULL;
    return TyFloat_FromDouble(x);
}

/* Helper to format the range error exceptions */
static int
_range_error(_structmodulestate *state, const formatdef *f, int is_unsigned)
{
    /* ulargest is the largest unsigned value with f->size bytes.
     * Note that the simpler:
     *     ((size_t)1 << (f->size * 8)) - 1
     * doesn't work when f->size == sizeof(size_t) because C doesn't
     * define what happens when a left shift count is >= the number of
     * bits in the integer being shifted; e.g., on some boxes it doesn't
     * shift at all when they're equal.
     */
    const size_t ulargest = (size_t)-1 >> ((SIZEOF_SIZE_T - f->size)*8);
    assert(f->size >= 1 && f->size <= SIZEOF_SIZE_T);
    if (is_unsigned)
        TyErr_Format(state->StructError,
            "'%c' format requires 0 <= number <= %zu",
            f->format,
            ulargest);
    else {
        const Ty_ssize_t largest = (Ty_ssize_t)(ulargest >> 1);
        TyErr_Format(state->StructError,
            "'%c' format requires %zd <= number <= %zd",
            f->format,
            ~ largest,
            largest);
    }

    return -1;
}



/* A large number of small routines follow, with names of the form

   [bln][up]_TYPE

   [bln] distinguishes among big-endian, little-endian and native.
   [pu] distinguishes between pack (to struct) and unpack (from struct).
   TYPE is one of char, byte, ubyte, etc.
*/

/* Native mode routines. ****************************************************/
/* NOTE:
   In all n[up]_<type> routines handling types larger than 1 byte, there is
   *no* guarantee that the p pointer is properly aligned for each type,
   therefore memcpy is called.  An intermediate variable is used to
   compensate for big-endian architectures.
   Normally both the intermediate variable and the memcpy call will be
   skipped by C optimisation in little-endian architectures (gcc >= 2.91
   does this). */

static TyObject *
nu_char(_structmodulestate *state, const char *p, const formatdef *f)
{
    return TyBytes_FromStringAndSize(p, 1);
}

static TyObject *
nu_byte(_structmodulestate *state, const char *p, const formatdef *f)
{
    return TyLong_FromLong((long) *(signed char *)p);
}

static TyObject *
nu_ubyte(_structmodulestate *state, const char *p, const formatdef *f)
{
    return TyLong_FromLong((long) *(unsigned char *)p);
}

static TyObject *
nu_short(_structmodulestate *state, const char *p, const formatdef *f)
{
    short x;
    memcpy(&x, p, sizeof x);
    return TyLong_FromLong((long)x);
}

static TyObject *
nu_ushort(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned short x;
    memcpy(&x, p, sizeof x);
    return TyLong_FromLong((long)x);
}

static TyObject *
nu_int(_structmodulestate *state, const char *p, const formatdef *f)
{
    int x;
    memcpy(&x, p, sizeof x);
    return TyLong_FromLong((long)x);
}

static TyObject *
nu_uint(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned int x;
    memcpy(&x, p, sizeof x);
    return TyLong_FromUnsignedLong((unsigned long)x);
}

static TyObject *
nu_long(_structmodulestate *state, const char *p, const formatdef *f)
{
    long x;
    memcpy(&x, p, sizeof x);
    return TyLong_FromLong(x);
}

static TyObject *
nu_ulong(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned long x;
    memcpy(&x, p, sizeof x);
    return TyLong_FromUnsignedLong(x);
}

static TyObject *
nu_ssize_t(_structmodulestate *state, const char *p, const formatdef *f)
{
    Ty_ssize_t x;
    memcpy(&x, p, sizeof x);
    return TyLong_FromSsize_t(x);
}

static TyObject *
nu_size_t(_structmodulestate *state, const char *p, const formatdef *f)
{
    size_t x;
    memcpy(&x, p, sizeof x);
    return TyLong_FromSize_t(x);
}

static TyObject *
nu_longlong(_structmodulestate *state, const char *p, const formatdef *f)
{
    long long x;
    memcpy(&x, p, sizeof x);
    return TyLong_FromLongLong(x);
}

static TyObject *
nu_ulonglong(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned long long x;
    memcpy(&x, p, sizeof x);
    return TyLong_FromUnsignedLongLong(x);
}

static TyObject *
nu_bool(_structmodulestate *state, const char *p, const formatdef *f)
{
    const _Bool bool_false = 0;
    return TyBool_FromLong(memcmp(p, &bool_false, sizeof(_Bool)));
}


static TyObject *
nu_halffloat(_structmodulestate *state, const char *p, const formatdef *f)
{
#if PY_LITTLE_ENDIAN
    return unpack_halffloat(p, 1);
#else
    return unpack_halffloat(p, 0);
#endif
}

static TyObject *
nu_float(_structmodulestate *state, const char *p, const formatdef *f)
{
    float x;
    memcpy(&x, p, sizeof x);
    return TyFloat_FromDouble((double)x);
}

static TyObject *
nu_double(_structmodulestate *state, const char *p, const formatdef *f)
{
    double x;
    memcpy(&x, p, sizeof x);
    return TyFloat_FromDouble(x);
}

static TyObject *
nu_float_complex(_structmodulestate *state, const char *p, const formatdef *f)
{
    float x[2];

    memcpy(&x, p, sizeof(x));
    return TyComplex_FromDoubles(x[0], x[1]);
}

static TyObject *
nu_double_complex(_structmodulestate *state, const char *p, const formatdef *f)
{
    double x[2];

    memcpy(&x, p, sizeof(x));
    return TyComplex_FromDoubles(x[0], x[1]);
}

static TyObject *
nu_void_p(_structmodulestate *state, const char *p, const formatdef *f)
{
    void *x;
    memcpy(&x, p, sizeof x);
    return TyLong_FromVoidPtr(x);
}

static int
np_byte(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    long x;
    if (get_long(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 0);
        }
        return -1;
    }
    if (x < -128 || x > 127) {
        RANGE_ERROR(state, f, 0);
    }
    *p = (char)x;
    return 0;
}

static int
np_ubyte(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    long x;
    if (get_long(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 1);
        }
        return -1;
    }
    if (x < 0 || x > 255) {
        RANGE_ERROR(state, f, 1);
    }
    *(unsigned char *)p = (unsigned char)x;
    return 0;
}

static int
np_char(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    if (!TyBytes_Check(v) || TyBytes_Size(v) != 1) {
        TyErr_SetString(state->StructError,
                        "char format requires a bytes object of length 1");
        return -1;
    }
    *p = *TyBytes_AS_STRING(v);
    return 0;
}

static int
np_short(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    long x;
    short y;
    if (get_long(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 0);
        }
        return -1;
    }
    if (x < SHRT_MIN || x > SHRT_MAX) {
        RANGE_ERROR(state, f, 0);
    }
    y = (short)x;
    memcpy(p, &y, sizeof y);
    return 0;
}

static int
np_ushort(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    long x;
    unsigned short y;
    if (get_long(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 1);
        }
        return -1;
    }
    if (x < 0 || x > USHRT_MAX) {
        RANGE_ERROR(state, f, 1);
    }
    y = (unsigned short)x;
    memcpy(p, &y, sizeof y);
    return 0;
}

static int
np_int(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    long x;
    int y;
    if (get_long(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 0);
        }
        return -1;
    }
#if (SIZEOF_LONG > SIZEOF_INT)
    if ((x < ((long)INT_MIN)) || (x > ((long)INT_MAX)))
        RANGE_ERROR(state, f, 0);
#endif
    y = (int)x;
    memcpy(p, &y, sizeof y);
    return 0;
}

static int
np_uint(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    unsigned long x;
    unsigned int y;
    if (get_ulong(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 1);
        }
        return -1;
    }
    y = (unsigned int)x;
#if (SIZEOF_LONG > SIZEOF_INT)
    if (x > ((unsigned long)UINT_MAX))
        RANGE_ERROR(state, f, 1);
#endif
    memcpy(p, &y, sizeof y);
    return 0;
}

static int
np_long(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    long x;
    if (get_long(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 0);
        }
        return -1;
    }
    memcpy(p, &x, sizeof x);
    return 0;
}

static int
np_ulong(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    unsigned long x;
    if (get_ulong(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 1);
        }
        return -1;
    }
    memcpy(p, &x, sizeof x);
    return 0;
}

static int
np_ssize_t(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    Ty_ssize_t x;
    if (get_ssize_t(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 0);
        }
        return -1;
    }
    memcpy(p, &x, sizeof x);
    return 0;
}

static int
np_size_t(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    size_t x;
    if (get_size_t(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 1);
        }
        return -1;
    }
    memcpy(p, &x, sizeof x);
    return 0;
}

static int
np_longlong(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    long long x;
    if (get_longlong(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            TyErr_Format(state->StructError,
                         "'%c' format requires %lld <= number <= %lld",
                         f->format,
                         LLONG_MIN,
                         LLONG_MAX);
        }
        return -1;
    }
    memcpy(p, &x, sizeof x);
    return 0;
}

static int
np_ulonglong(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    unsigned long long x;
    if (get_ulonglong(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            TyErr_Format(state->StructError,
                         "'%c' format requires 0 <= number <= %llu",
                         f->format,
                         ULLONG_MAX);
        }
        return -1;
    }
    memcpy(p, &x, sizeof x);
    return 0;
}


static int
np_bool(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    int y;
    _Bool x;
    y = PyObject_IsTrue(v);
    if (y < 0)
        return -1;
    x = y;
    memcpy(p, &x, sizeof x);
    return 0;
}

static int
np_halffloat(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
#if PY_LITTLE_ENDIAN
    return pack_halffloat(state, p, v, 1);
#else
    return pack_halffloat(state, p, v, 0);
#endif
}

static int
np_float(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    float x = (float)TyFloat_AsDouble(v);
    if (x == -1 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a float");
        return -1;
    }
    memcpy(p, &x, sizeof x);
    return 0;
}

static int
np_double(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    double x = TyFloat_AsDouble(v);
    if (x == -1 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a float");
        return -1;
    }
    memcpy(p, &x, sizeof(double));
    return 0;
}

static int
np_float_complex(_structmodulestate *state, char *p, TyObject *v,
                 const formatdef *f)
{
    Ty_complex c = TyComplex_AsCComplex(v);
    float x[2] = {(float)c.real, (float)c.imag};

    if (c.real == -1 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a complex");
        return -1;
    }
    memcpy(p, &x, sizeof(x));
    return 0;
}

static int
np_double_complex(_structmodulestate *state, char *p, TyObject *v,
                  const formatdef *f)
{
    Ty_complex c = TyComplex_AsCComplex(v);
    double x[2] = {c.real, c.imag};

    if (c.real == -1 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a complex");
        return -1;
    }
    memcpy(p, &x, sizeof(x));
    return 0;
}

static int
np_void_p(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    void *x;

    v = get_pylong(state, v);
    if (v == NULL)
        return -1;
    assert(TyLong_Check(v));
    x = TyLong_AsVoidPtr(v);
    Ty_DECREF(v);
    if (x == NULL && TyErr_Occurred())
        return -1;
    memcpy(p, &x, sizeof x);
    return 0;
}

static const formatdef native_table[] = {
    {'x',       sizeof(char),   0,              NULL},
    {'b',       sizeof(char),   0,              nu_byte,        np_byte},
    {'B',       sizeof(char),   0,              nu_ubyte,       np_ubyte},
    {'c',       sizeof(char),   0,              nu_char,        np_char},
    {'s',       sizeof(char),   0,              NULL},
    {'p',       sizeof(char),   0,              NULL},
    {'h',       sizeof(short),  _Alignof(short),    nu_short,       np_short},
    {'H',       sizeof(short),  _Alignof(short),    nu_ushort,      np_ushort},
    {'i',       sizeof(int),    _Alignof(int),      nu_int,         np_int},
    {'I',       sizeof(int),    _Alignof(int),      nu_uint,        np_uint},
    {'l',       sizeof(long),   _Alignof(long),     nu_long,        np_long},
    {'L',       sizeof(long),   _Alignof(long),     nu_ulong,       np_ulong},
    {'n',       sizeof(size_t), _Alignof(size_t),   nu_ssize_t,     np_ssize_t},
    {'N',       sizeof(size_t), _Alignof(size_t),   nu_size_t,      np_size_t},
    {'q',       sizeof(long long), _Alignof(long long), nu_longlong, np_longlong},
    {'Q',       sizeof(long long), _Alignof(long long), nu_ulonglong,np_ulonglong},
    {'?',       sizeof(_Bool),      _Alignof(_Bool),     nu_bool,        np_bool},
    {'e',       sizeof(short),  _Alignof(short),    nu_halffloat,   np_halffloat},
    {'f',       sizeof(float),  _Alignof(float),    nu_float,       np_float},
    {'d',       sizeof(double), _Alignof(double),   nu_double,      np_double},
    {'F',       2*sizeof(float), _Alignof(float), nu_float_complex, np_float_complex},
    {'D',       2*sizeof(double), _Alignof(double), nu_double_complex, np_double_complex},
    {'P',       sizeof(void *), _Alignof(void *),   nu_void_p,      np_void_p},
    {0}
};

/* Big-endian routines. *****************************************************/

static TyObject *
bu_short(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned long x = 0;

    /* This function is only ever used in the case f->size == 2. */
    assert(f->size == 2);
    Ty_ssize_t i = 2;
    const unsigned char *bytes = (const unsigned char *)p;
    do {
        x = (x<<8) | *bytes++;
    } while (--i > 0);
    /* Extend sign, avoiding implementation-defined or undefined behaviour. */
    x = (x ^ 0x8000U) - 0x8000U;
    return TyLong_FromLong(x & 0x8000U ? -1 - (long)(~x) : (long)x);
}

static TyObject *
bu_int(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned long x = 0;

    /* This function is only ever used in the case f->size == 4. */
    assert(f->size == 4);
    Ty_ssize_t i = 4;
    const unsigned char *bytes = (const unsigned char *)p;
    do {
        x = (x<<8) | *bytes++;
    } while (--i > 0);
    /* Extend sign, avoiding implementation-defined or undefined behaviour. */
    x = (x ^ 0x80000000U) - 0x80000000U;
    return TyLong_FromLong(x & 0x80000000U ? -1 - (long)(~x) : (long)x);
}

static TyObject *
bu_uint(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned long x = 0;
    Ty_ssize_t i = f->size;
    const unsigned char *bytes = (const unsigned char *)p;
    do {
        x = (x<<8) | *bytes++;
    } while (--i > 0);
    return TyLong_FromUnsignedLong(x);
}

static TyObject *
bu_longlong(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned long long x = 0;

    /* This function is only ever used in the case f->size == 8. */
    assert(f->size == 8);
    Ty_ssize_t i = 8;
    const unsigned char *bytes = (const unsigned char *)p;
    do {
        x = (x<<8) | *bytes++;
    } while (--i > 0);
    /* Extend sign, avoiding implementation-defined or undefined behaviour. */
    x = (x ^ 0x8000000000000000U) - 0x8000000000000000U;
    return TyLong_FromLongLong(
        x & 0x8000000000000000U ? -1 - (long long)(~x) : (long long)x);
}

static TyObject *
bu_ulonglong(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned long long x = 0;
    Ty_ssize_t i = f->size;
    const unsigned char *bytes = (const unsigned char *)p;
    do {
        x = (x<<8) | *bytes++;
    } while (--i > 0);
    return TyLong_FromUnsignedLongLong(x);
}

static TyObject *
bu_halffloat(_structmodulestate *state, const char *p, const formatdef *f)
{
    return unpack_halffloat(p, 0);
}

static TyObject *
bu_float(_structmodulestate *state, const char *p, const formatdef *f)
{
    return unpack_float(p, 0);
}

static TyObject *
bu_double(_structmodulestate *state, const char *p, const formatdef *f)
{
    return unpack_double(p, 0);
}

static TyObject *
bu_float_complex(_structmodulestate *state, const char *p, const formatdef *f)
{
    double x = TyFloat_Unpack4(p, 0);
    if (x == -1.0 && TyErr_Occurred()) {
        return NULL;
    }
    double y = TyFloat_Unpack4(p + 4, 0);
    if (y == -1.0 && TyErr_Occurred()) {
        return NULL;
    }
    return TyComplex_FromDoubles(x, y);
}

static TyObject *
bu_double_complex(_structmodulestate *state, const char *p, const formatdef *f)
{
    double x, y;

    x = TyFloat_Unpack8(p, 0);
    if (x == -1.0 && TyErr_Occurred()) {
        return NULL;
    }
    y = TyFloat_Unpack8(p + 8, 0);
    if (y == -1.0 && TyErr_Occurred()) {
        return NULL;
    }
    return TyComplex_FromDoubles(x, y);
}

static TyObject *
bu_bool(_structmodulestate *state, const char *p, const formatdef *f)
{
    return TyBool_FromLong(*p != 0);
}

static int
bp_int(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    long x;
    Ty_ssize_t i;
    unsigned char *q = (unsigned char *)p;
    if (get_long(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 0);
        }
        return -1;
    }
    i = f->size;
    if (i != SIZEOF_LONG) {
        if ((i == 2) && (x < -32768 || x > 32767))
            RANGE_ERROR(state, f, 0);
#if (SIZEOF_LONG != 4)
        else if ((i == 4) && (x < -2147483648L || x > 2147483647L))
            RANGE_ERROR(state, f, 0);
#endif
    }
    do {
        q[--i] = (unsigned char)(x & 0xffL);
        x >>= 8;
    } while (i > 0);
    return 0;
}

static int
bp_uint(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    unsigned long x;
    Ty_ssize_t i;
    unsigned char *q = (unsigned char *)p;
    if (get_ulong(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 1);
        }
        return -1;
    }
    i = f->size;
    if (i != SIZEOF_LONG) {
        unsigned long maxint = 1;
        maxint <<= (unsigned long)(i * 8);
        if (x >= maxint)
            RANGE_ERROR(state, f, 1);
    }
    do {
        q[--i] = (unsigned char)(x & 0xffUL);
        x >>= 8;
    } while (i > 0);
    return 0;
}

static int
bp_longlong(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    int res;
    v = get_pylong(state, v);
    if (v == NULL)
        return -1;
    res = _TyLong_AsByteArray((PyLongObject *)v,
                              (unsigned char *)p,
                              8,
                              0, /* little_endian */
                              1, /* signed */
                              0  /* !with_exceptions */);
    Ty_DECREF(v);
    if (res < 0) {
        TyErr_Format(state->StructError,
                     "'%c' format requires %lld <= number <= %lld",
                     f->format,
                     LLONG_MIN,
                     LLONG_MAX);
        return -1;
    }
    return res;
}

static int
bp_ulonglong(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    int res;
    v = get_pylong(state, v);
    if (v == NULL)
        return -1;
    res = _TyLong_AsByteArray((PyLongObject *)v,
                              (unsigned char *)p,
                              8,
                              0, /* little_endian */
                              0, /* signed */
                              0  /* !with_exceptions */);
    Ty_DECREF(v);
    if (res < 0) {
        TyErr_Format(state->StructError,
                     "'%c' format requires 0 <= number <= %llu",
                     f->format,
                     ULLONG_MAX);
        return -1;
    }
    return res;
}

static int
bp_halffloat(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    return pack_halffloat(state, p, v, 0);
}

static int
bp_float(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    double x = TyFloat_AsDouble(v);
    if (x == -1 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a float");
        return -1;
    }
    return TyFloat_Pack4(x, p, 0);
}

static int
bp_double(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    double x = TyFloat_AsDouble(v);
    if (x == -1 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a float");
        return -1;
    }
    return TyFloat_Pack8(x, p, 0);
}

static int
bp_float_complex(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    Ty_complex x = TyComplex_AsCComplex(v);
    if (x.real == -1 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a complex");
        return -1;
    }
    if (TyFloat_Pack4(x.real, p, 0)) {
        return -1;
    }
    return TyFloat_Pack4(x.imag, p + 4, 0);
}

static int
bp_double_complex(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    Ty_complex x = TyComplex_AsCComplex(v);
    if (x.real == -1 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a complex");
        return -1;
    }
    if (TyFloat_Pack8(x.real, p, 0)) {
        return -1;
    }
    return TyFloat_Pack8(x.imag, p + 8, 0);
}

static int
bp_bool(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    int y;
    y = PyObject_IsTrue(v);
    if (y < 0)
        return -1;
    *p = (char)y;
    return 0;
}

static formatdef bigendian_table[] = {
    {'x',       1,              0,              NULL},
    {'b',       1,              0,              nu_byte,        np_byte},
    {'B',       1,              0,              nu_ubyte,       np_ubyte},
    {'c',       1,              0,              nu_char,        np_char},
    {'s',       1,              0,              NULL},
    {'p',       1,              0,              NULL},
    {'h',       2,              0,              bu_short,       bp_int},
    {'H',       2,              0,              bu_uint,        bp_uint},
    {'i',       4,              0,              bu_int,         bp_int},
    {'I',       4,              0,              bu_uint,        bp_uint},
    {'l',       4,              0,              bu_int,         bp_int},
    {'L',       4,              0,              bu_uint,        bp_uint},
    {'q',       8,              0,              bu_longlong,    bp_longlong},
    {'Q',       8,              0,              bu_ulonglong,   bp_ulonglong},
    {'?',       1,              0,              bu_bool,        bp_bool},
    {'e',       2,              0,              bu_halffloat,   bp_halffloat},
    {'f',       4,              0,              bu_float,       bp_float},
    {'d',       8,              0,              bu_double,      bp_double},
    {'F',       8,              0,              bu_float_complex, bp_float_complex},
    {'D',       16,             0,              bu_double_complex, bp_double_complex},
    {0}
};

/* Little-endian routines. *****************************************************/

static TyObject *
lu_short(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned long x = 0;

    /* This function is only ever used in the case f->size == 2. */
    assert(f->size == 2);
    Ty_ssize_t i = 2;
    const unsigned char *bytes = (const unsigned char *)p;
    do {
        x = (x<<8) | bytes[--i];
    } while (i > 0);
    /* Extend sign, avoiding implementation-defined or undefined behaviour. */
    x = (x ^ 0x8000U) - 0x8000U;
    return TyLong_FromLong(x & 0x8000U ? -1 - (long)(~x) : (long)x);
}

static TyObject *
lu_int(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned long x = 0;

    /* This function is only ever used in the case f->size == 4. */
    assert(f->size == 4);
    Ty_ssize_t i = 4;
    const unsigned char *bytes = (const unsigned char *)p;
    do {
        x = (x<<8) | bytes[--i];
    } while (i > 0);
    /* Extend sign, avoiding implementation-defined or undefined behaviour. */
    x = (x ^ 0x80000000U) - 0x80000000U;
    return TyLong_FromLong(x & 0x80000000U ? -1 - (long)(~x) : (long)x);
}

static TyObject *
lu_uint(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned long x = 0;
    Ty_ssize_t i = f->size;
    const unsigned char *bytes = (const unsigned char *)p;
    do {
        x = (x<<8) | bytes[--i];
    } while (i > 0);
    return TyLong_FromUnsignedLong(x);
}

static TyObject *
lu_longlong(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned long long x = 0;

    /* This function is only ever used in the case f->size == 8. */
    assert(f->size == 8);
    Ty_ssize_t i = 8;
    const unsigned char *bytes = (const unsigned char *)p;
    do {
        x = (x<<8) | bytes[--i];
    } while (i > 0);
    /* Extend sign, avoiding implementation-defined or undefined behaviour. */
    x = (x ^ 0x8000000000000000U) - 0x8000000000000000U;
    return TyLong_FromLongLong(
        x & 0x8000000000000000U ? -1 - (long long)(~x) : (long long)x);
}

static TyObject *
lu_ulonglong(_structmodulestate *state, const char *p, const formatdef *f)
{
    unsigned long long x = 0;
    Ty_ssize_t i = f->size;
    const unsigned char *bytes = (const unsigned char *)p;
    do {
        x = (x<<8) | bytes[--i];
    } while (i > 0);
    return TyLong_FromUnsignedLongLong(x);
}

static TyObject *
lu_halffloat(_structmodulestate *state, const char *p, const formatdef *f)
{
    return unpack_halffloat(p, 1);
}

static TyObject *
lu_float(_structmodulestate *state, const char *p, const formatdef *f)
{
    return unpack_float(p, 1);
}

static TyObject *
lu_double(_structmodulestate *state, const char *p, const formatdef *f)
{
    return unpack_double(p, 1);
}

static TyObject *
lu_float_complex(_structmodulestate *state, const char *p, const formatdef *f)
{
    double x = TyFloat_Unpack4(p, 1);
    if (x == -1.0 && TyErr_Occurred()) {
        return NULL;
    }
    double y = TyFloat_Unpack4(p + 4, 1);
    if (y == -1.0 && TyErr_Occurred()) {
        return NULL;
    }
    return TyComplex_FromDoubles(x, y);
}

static TyObject *
lu_double_complex(_structmodulestate *state, const char *p, const formatdef *f)
{
    double x, y;

    x = TyFloat_Unpack8(p, 1);
    if (x == -1.0 && TyErr_Occurred()) {
        return NULL;
    }
    y = TyFloat_Unpack8(p + 8, 1);
    if (y == -1.0 && TyErr_Occurred()) {
        return NULL;
    }
    return TyComplex_FromDoubles(x, y);
}

static int
lp_int(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    long x;
    Ty_ssize_t i;
    unsigned char *q = (unsigned char *)p;
    if (get_long(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 0);
        }
        return -1;
    }
    i = f->size;
    if (i != SIZEOF_LONG) {
        if ((i == 2) && (x < -32768 || x > 32767))
            RANGE_ERROR(state, f, 0);
#if (SIZEOF_LONG != 4)
        else if ((i == 4) && (x < -2147483648L || x > 2147483647L))
            RANGE_ERROR(state, f, 0);
#endif
    }
    do {
        *q++ = (unsigned char)(x & 0xffL);
        x >>= 8;
    } while (--i > 0);
    return 0;
}

static int
lp_uint(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    unsigned long x;
    Ty_ssize_t i;
    unsigned char *q = (unsigned char *)p;
    if (get_ulong(state, v, &x) < 0) {
        if (TyErr_ExceptionMatches(TyExc_OverflowError)) {
            RANGE_ERROR(state, f, 1);
        }
        return -1;
    }
    i = f->size;
    if (i != SIZEOF_LONG) {
        unsigned long maxint = 1;
        maxint <<= (unsigned long)(i * 8);
        if (x >= maxint)
            RANGE_ERROR(state, f, 1);
    }
    do {
        *q++ = (unsigned char)(x & 0xffUL);
        x >>= 8;
    } while (--i > 0);
    return 0;
}

static int
lp_longlong(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    int res;
    v = get_pylong(state, v);
    if (v == NULL)
        return -1;
    res = _TyLong_AsByteArray((PyLongObject*)v,
                              (unsigned char *)p,
                              8,
                              1, /* little_endian */
                              1, /* signed */
                              0  /* !with_exceptions */);
    Ty_DECREF(v);
    if (res < 0) {
        TyErr_Format(state->StructError,
                     "'%c' format requires %lld <= number <= %lld",
                     f->format,
                     LLONG_MIN,
                     LLONG_MAX);
        return -1;
    }
    return res;
}

static int
lp_ulonglong(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    int res;
    v = get_pylong(state, v);
    if (v == NULL)
        return -1;
    res = _TyLong_AsByteArray((PyLongObject*)v,
                              (unsigned char *)p,
                              8,
                              1, /* little_endian */
                              0, /* signed */
                              0  /* !with_exceptions */);
    Ty_DECREF(v);
    if (res < 0) {
        TyErr_Format(state->StructError,
                     "'%c' format requires 0 <= number <= %llu",
                     f->format,
                     ULLONG_MAX);
        return -1;
    }
    return res;
}

static int
lp_halffloat(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    return pack_halffloat(state, p, v, 1);
}

static int
lp_float(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    double x = TyFloat_AsDouble(v);
    if (x == -1 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a float");
        return -1;
    }
    return TyFloat_Pack4(x, p, 1);
}

static int
lp_double(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    double x = TyFloat_AsDouble(v);
    if (x == -1 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a float");
        return -1;
    }
    return TyFloat_Pack8(x, p, 1);
}

static int
lp_float_complex(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    Ty_complex x = TyComplex_AsCComplex(v);
    if (x.real == -1 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a complex");
        return -1;
    }
    if (TyFloat_Pack4(x.real, p, 1)) {
        return -1;
    }
    return TyFloat_Pack4(x.imag, p + 4, 1);

}

static int
lp_double_complex(_structmodulestate *state, char *p, TyObject *v, const formatdef *f)
{
    Ty_complex x = TyComplex_AsCComplex(v);
    if (x.real == -1 && TyErr_Occurred()) {
        TyErr_SetString(state->StructError,
                        "required argument is not a complex");
        return -1;
    }
    if (TyFloat_Pack8(x.real, p, 1)) {
        return -1;
    }
    return TyFloat_Pack8(x.imag, p + 8, 1);
}

static formatdef lilendian_table[] = {
    {'x',       1,              0,              NULL},
    {'b',       1,              0,              nu_byte,        np_byte},
    {'B',       1,              0,              nu_ubyte,       np_ubyte},
    {'c',       1,              0,              nu_char,        np_char},
    {'s',       1,              0,              NULL},
    {'p',       1,              0,              NULL},
    {'h',       2,              0,              lu_short,       lp_int},
    {'H',       2,              0,              lu_uint,        lp_uint},
    {'i',       4,              0,              lu_int,         lp_int},
    {'I',       4,              0,              lu_uint,        lp_uint},
    {'l',       4,              0,              lu_int,         lp_int},
    {'L',       4,              0,              lu_uint,        lp_uint},
    {'q',       8,              0,              lu_longlong,    lp_longlong},
    {'Q',       8,              0,              lu_ulonglong,   lp_ulonglong},
    {'?',       1,              0,              bu_bool,        bp_bool}, /* Std rep not endian dep,
        but potentially different from native rep -- reuse bx_bool funcs. */
    {'e',       2,              0,              lu_halffloat,   lp_halffloat},
    {'f',       4,              0,              lu_float,       lp_float},
    {'d',       8,              0,              lu_double,      lp_double},
    {'F',       8,              0,              lu_float_complex, lp_float_complex},
    {'D',       16,             0,              lu_double_complex, lp_double_complex},
    {0}
};


static const formatdef *
whichtable(const char **pfmt)
{
    const char *fmt = (*pfmt)++; /* May be backed out of later */
    switch (*fmt) {
    case '<':
        return lilendian_table;
    case '>':
    case '!': /* Network byte order is big-endian */
        return bigendian_table;
    case '=': { /* Host byte order -- different from native in alignment! */
#if PY_LITTLE_ENDIAN
        return lilendian_table;
#else
        return bigendian_table;
#endif
    }
    default:
        --*pfmt; /* Back out of pointer increment */
        _Ty_FALLTHROUGH;
    case '@':
        return native_table;
    }
}


/* Get the table entry for a format code */

static const formatdef *
getentry(_structmodulestate *state, int c, const formatdef *f)
{
    for (; f->format != '\0'; f++) {
        if (f->format == c) {
            return f;
        }
    }
    TyErr_SetString(state->StructError, "bad char in struct format");
    return NULL;
}


/* Align a size according to a format code.  Return -1 on overflow. */

static Ty_ssize_t
align(Ty_ssize_t size, char c, const formatdef *e)
{
    Ty_ssize_t extra;

    if (e->format == c) {
        if (e->alignment && size > 0) {
            extra = (e->alignment - 1) - (size - 1) % (e->alignment);
            if (extra > PY_SSIZE_T_MAX - size)
                return -1;
            size += extra;
        }
    }
    return size;
}

/*
 * Struct object implementation.
 */

/* calculate the size of a format string */

static int
prepare_s(PyStructObject *self)
{
    const formatdef *f;
    const formatdef *e;
    formatcode *codes;

    const char *s;
    const char *fmt;
    char c;
    Ty_ssize_t size, len, num, itemsize;
    size_t ncodes;

    _structmodulestate *state = get_struct_state_structinst(self);

    fmt = TyBytes_AS_STRING(self->s_format);
    if (strlen(fmt) != (size_t)TyBytes_GET_SIZE(self->s_format)) {
        TyErr_SetString(state->StructError,
                        "embedded null character");
        return -1;
    }

    f = whichtable(&fmt);

    s = fmt;
    size = 0;
    len = 0;
    ncodes = 0;
    while ((c = *s++) != '\0') {
        if (Ty_ISSPACE(c))
            continue;
        if ('0' <= c && c <= '9') {
            num = c - '0';
            while ('0' <= (c = *s++) && c <= '9') {
                /* overflow-safe version of
                   if (num*10 + (c - '0') > PY_SSIZE_T_MAX) { ... } */
                if (num >= PY_SSIZE_T_MAX / 10 && (
                        num > PY_SSIZE_T_MAX / 10 ||
                        (c - '0') > PY_SSIZE_T_MAX % 10))
                    goto overflow;
                num = num*10 + (c - '0');
            }
            if (c == '\0') {
                TyErr_SetString(state->StructError,
                                "repeat count given without format specifier");
                return -1;
            }
        }
        else
            num = 1;

        e = getentry(state, c, f);
        if (e == NULL)
            return -1;

        switch (c) {
            case 's': _Ty_FALLTHROUGH;
            case 'p': len++; ncodes++; break;
            case 'x': break;
            default: len += num; if (num) ncodes++; break;
        }

        itemsize = e->size;
        size = align(size, c, e);
        if (size == -1)
            goto overflow;

        /* if (size + num * itemsize > PY_SSIZE_T_MAX) { ... } */
        if (num > (PY_SSIZE_T_MAX - size) / itemsize)
            goto overflow;
        size += num * itemsize;
    }

    /* check for overflow */
    if ((ncodes + 1) > ((size_t)PY_SSIZE_T_MAX / sizeof(formatcode))) {
        TyErr_NoMemory();
        return -1;
    }

    self->s_size = size;
    self->s_len = len;
    codes = TyMem_Malloc((ncodes + 1) * sizeof(formatcode));
    if (codes == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    /* Free any s_codes value left over from a previous initialization. */
    if (self->s_codes != NULL)
        TyMem_Free(self->s_codes);
    self->s_codes = codes;

    s = fmt;
    size = 0;
    while ((c = *s++) != '\0') {
        if (Ty_ISSPACE(c))
            continue;
        if ('0' <= c && c <= '9') {
            num = c - '0';
            while ('0' <= (c = *s++) && c <= '9')
                num = num*10 + (c - '0');
        }
        else
            num = 1;

        e = getentry(state, c, f);

        size = align(size, c, e);
        if (c == 's' || c == 'p') {
            codes->offset = size;
            codes->size = num;
            codes->fmtdef = e;
            codes->repeat = 1;
            codes++;
            size += num;
        } else if (c == 'x') {
            size += num;
        } else if (num) {
            codes->offset = size;
            codes->size = e->size;
            codes->fmtdef = e;
            codes->repeat = num;
            codes++;
            size += e->size * num;
        }
    }
    codes->fmtdef = NULL;
    codes->offset = size;
    codes->size = 0;
    codes->repeat = 0;

    return 0;

  overflow:
    TyErr_SetString(state->StructError,
                    "total struct size too long");
    return -1;
}

static TyObject *
s_new(TyTypeObject *type, TyObject *args, TyObject *kwds)
{
    TyObject *self;

    assert(type != NULL);
    allocfunc alloc_func = TyType_GetSlot(type, Ty_tp_alloc);
    assert(alloc_func != NULL);

    self = alloc_func(type, 0);
    if (self != NULL) {
        PyStructObject *s = (PyStructObject*)self;
        s->s_format = Ty_NewRef(Ty_None);
        s->s_codes = NULL;
        s->s_size = -1;
        s->s_len = -1;
    }
    return self;
}

/*[clinic input]
Struct.__init__

    format: object

Create a compiled struct object.

Return a new Struct object which writes and reads binary data according to
the format string.

See help(struct) for more on format strings.
[clinic start generated code]*/

static int
Struct___init___impl(PyStructObject *self, TyObject *format)
/*[clinic end generated code: output=b8e80862444e92d0 input=192a4575a3dde802]*/
{
    int ret = 0;

    if (TyUnicode_Check(format)) {
        format = TyUnicode_AsASCIIString(format);
        if (format == NULL)
            return -1;
    }
    else {
        Ty_INCREF(format);
    }

    if (!TyBytes_Check(format)) {
        Ty_DECREF(format);
        TyErr_Format(TyExc_TypeError,
                     "Struct() argument 1 must be a str or bytes object, "
                     "not %.200s",
                     _TyType_Name(Ty_TYPE(format)));
        return -1;
    }

    Ty_SETREF(self->s_format, format);

    ret = prepare_s(self);
    return ret;
}

static int
s_clear(TyObject *op)
{
    PyStructObject *s = PyStructObject_CAST(op);
    Ty_CLEAR(s->s_format);
    return 0;
}

static int
s_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyStructObject *s = PyStructObject_CAST(op);
    Ty_VISIT(Ty_TYPE(s));
    Ty_VISIT(s->s_format);
    return 0;
}

static void
s_dealloc(TyObject *op)
{
    PyStructObject *s = PyStructObject_CAST(op);
    TyTypeObject *tp = Ty_TYPE(s);
    PyObject_GC_UnTrack(s);
    FT_CLEAR_WEAKREFS(op, s->weakreflist);
    if (s->s_codes != NULL) {
        TyMem_Free(s->s_codes);
    }
    Ty_XDECREF(s->s_format);
    tp->tp_free(s);
    Ty_DECREF(tp);
}

static TyObject *
s_unpack_internal(PyStructObject *soself, const char *startfrom,
                  _structmodulestate *state) {
    formatcode *code;
    Ty_ssize_t i = 0;
    TyObject *result = TyTuple_New(soself->s_len);
    if (result == NULL)
        return NULL;

    for (code = soself->s_codes; code->fmtdef != NULL; code++) {
        const formatdef *e = code->fmtdef;
        const char *res = startfrom + code->offset;
        Ty_ssize_t j = code->repeat;
        while (j--) {
            TyObject *v;
            if (e->format == 's') {
                v = TyBytes_FromStringAndSize(res, code->size);
            } else if (e->format == 'p') {
                Ty_ssize_t n;
                if (code->size == 0) {
                    n = 0;
                }
                else {
                    n = *(unsigned char*)res;
                    if (n >= code->size) {
                        n = code->size - 1;
                    }
                }
                v = TyBytes_FromStringAndSize(res + 1, n);
            } else {
                v = e->unpack(state, res, e);
            }
            if (v == NULL)
                goto fail;
            TyTuple_SET_ITEM(result, i++, v);
            res += code->size;
        }
    }

    return result;
fail:
    Ty_DECREF(result);
    return NULL;
}


/*[clinic input]
Struct.unpack

    buffer: Ty_buffer
    /

Return a tuple containing unpacked values.

Unpack according to the format string Struct.format. The buffer's size
in bytes must be Struct.size.

See help(struct) for more on format strings.
[clinic start generated code]*/

static TyObject *
Struct_unpack_impl(PyStructObject *self, Ty_buffer *buffer)
/*[clinic end generated code: output=873a24faf02e848a input=3113f8e7038b2f6c]*/
{
    _structmodulestate *state = get_struct_state_structinst(self);
    assert(self->s_codes != NULL);
    if (buffer->len != self->s_size) {
        TyErr_Format(state->StructError,
                     "unpack requires a buffer of %zd bytes",
                     self->s_size);
        return NULL;
    }
    return s_unpack_internal(self, buffer->buf, state);
}

/*[clinic input]
Struct.unpack_from

    buffer: Ty_buffer
    offset: Ty_ssize_t = 0

Return a tuple containing unpacked values.

Values are unpacked according to the format string Struct.format.

The buffer's size in bytes, starting at position offset, must be
at least Struct.size.

See help(struct) for more on format strings.
[clinic start generated code]*/

static TyObject *
Struct_unpack_from_impl(PyStructObject *self, Ty_buffer *buffer,
                        Ty_ssize_t offset)
/*[clinic end generated code: output=57fac875e0977316 input=cafd4851d473c894]*/
{
    _structmodulestate *state = get_struct_state_structinst(self);
    assert(self->s_codes != NULL);

    if (offset < 0) {
        if (offset + self->s_size > 0) {
            TyErr_Format(state->StructError,
                         "not enough data to unpack %zd bytes at offset %zd",
                         self->s_size,
                         offset);
            return NULL;
        }

        if (offset + buffer->len < 0) {
            TyErr_Format(state->StructError,
                         "offset %zd out of range for %zd-byte buffer",
                         offset,
                         buffer->len);
            return NULL;
        }
        offset += buffer->len;
    }

    if ((buffer->len - offset) < self->s_size) {
        TyErr_Format(state->StructError,
                     "unpack_from requires a buffer of at least %zu bytes for "
                     "unpacking %zd bytes at offset %zd "
                     "(actual buffer size is %zd)",
                     (size_t)self->s_size + (size_t)offset,
                     self->s_size,
                     offset,
                     buffer->len);
        return NULL;
    }
    return s_unpack_internal(self, (char*)buffer->buf + offset, state);
}



/* Unpack iterator type */

typedef struct {
    PyObject_HEAD
    PyStructObject *so;
    Ty_buffer buf;
    Ty_ssize_t index;
} unpackiterobject;

#define unpackiterobject_CAST(op)   ((unpackiterobject *)(op))

static void
unpackiter_dealloc(TyObject *op)
{
    unpackiterobject *self = unpackiterobject_CAST(op);
    /* bpo-31095: UnTrack is needed before calling any callbacks */
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    Ty_XDECREF(self->so);
    PyBuffer_Release(&self->buf);
    PyObject_GC_Del(self);
    Ty_DECREF(tp);
}

static int
unpackiter_traverse(TyObject *op, visitproc visit, void *arg)
{
    unpackiterobject *self = unpackiterobject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->so);
    Ty_VISIT(self->buf.obj);
    return 0;
}

static TyObject *
unpackiter_len(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    Ty_ssize_t len;
    unpackiterobject *self = unpackiterobject_CAST(op);
    if (self->so == NULL) {
        len = 0;
    }
    else {
        len = (self->buf.len - self->index) / self->so->s_size;
    }
    return TyLong_FromSsize_t(len);
}

static TyMethodDef unpackiter_methods[] = {
    {"__length_hint__", unpackiter_len, METH_NOARGS, NULL},
    {NULL,              NULL}           /* sentinel */
};

static TyObject *
unpackiter_iternext(TyObject *op)
{
    unpackiterobject *self = unpackiterobject_CAST(op);
    _structmodulestate *state = get_struct_state_iterinst(self);
    TyObject *result;
    if (self->so == NULL) {
        return NULL;
    }
    if (self->index >= self->buf.len) {
        /* Iterator exhausted */
        Ty_CLEAR(self->so);
        PyBuffer_Release(&self->buf);
        return NULL;
    }
    assert(self->index + self->so->s_size <= self->buf.len);
    result = s_unpack_internal(self->so,
                               (char*)self->buf.buf + self->index,
                               state);
    self->index += self->so->s_size;
    return result;
}

static TyType_Slot unpackiter_type_slots[] = {
    {Ty_tp_dealloc, unpackiter_dealloc},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_traverse, unpackiter_traverse},
    {Ty_tp_iter, PyObject_SelfIter},
    {Ty_tp_iternext, unpackiter_iternext},
    {Ty_tp_methods, unpackiter_methods},
    {0, 0},
};

static TyType_Spec unpackiter_type_spec = {
    "_struct.unpack_iterator",
    sizeof(unpackiterobject),
    0,
    (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
     Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_DISALLOW_INSTANTIATION),
    unpackiter_type_slots
};

/*[clinic input]
Struct.iter_unpack

    buffer: object
    /

Return an iterator yielding tuples.

Tuples are unpacked from the given bytes source, like a repeated
invocation of unpack_from().

Requires that the bytes length be a multiple of the struct size.
[clinic start generated code]*/

static TyObject *
Struct_iter_unpack_impl(PyStructObject *self, TyObject *buffer)
/*[clinic end generated code: output=818f89ad4afa8d64 input=6d65b3f3107dbc99]*/
{
    _structmodulestate *state = get_struct_state_structinst(self);
    unpackiterobject *iter;

    assert(self->s_codes != NULL);

    if (self->s_size == 0) {
        TyErr_Format(state->StructError,
                     "cannot iteratively unpack with a struct of length 0");
        return NULL;
    }

    iter = (unpackiterobject *) TyType_GenericAlloc((TyTypeObject *)state->unpackiter_type, 0);
    if (iter == NULL)
        return NULL;

    if (PyObject_GetBuffer(buffer, &iter->buf, PyBUF_SIMPLE) < 0) {
        Ty_DECREF(iter);
        return NULL;
    }
    if (iter->buf.len % self->s_size != 0) {
        TyErr_Format(state->StructError,
                     "iterative unpacking requires a buffer of "
                     "a multiple of %zd bytes",
                     self->s_size);
        Ty_DECREF(iter);
        return NULL;
    }
    iter->so = (PyStructObject*)Ty_NewRef(self);
    iter->index = 0;
    return (TyObject *)iter;
}


/*
 * Guts of the pack function.
 *
 * Takes a struct object, a tuple of arguments, and offset in that tuple of
 * argument for where to start processing the arguments for packing, and a
 * character buffer for writing the packed string.  The caller must insure
 * that the buffer may contain the required length for packing the arguments.
 * 0 is returned on success, 1 is returned if there is an error.
 *
 */
static int
s_pack_internal(PyStructObject *soself, TyObject *const *args, int offset,
                char* buf, _structmodulestate *state)
{
    formatcode *code;
    /* XXX(nnorwitz): why does i need to be a local?  can we use
       the offset parameter or do we need the wider width? */
    Ty_ssize_t i;

    memset(buf, '\0', soself->s_size);
    i = offset;
    for (code = soself->s_codes; code->fmtdef != NULL; code++) {
        const formatdef *e = code->fmtdef;
        char *res = buf + code->offset;
        Ty_ssize_t j = code->repeat;
        while (j--) {
            TyObject *v = args[i++];
            if (e->format == 's') {
                Ty_ssize_t n;
                int isstring;
                const void *p;
                isstring = TyBytes_Check(v);
                if (!isstring && !TyByteArray_Check(v)) {
                    TyErr_SetString(state->StructError,
                                    "argument for 's' must be a bytes object");
                    return -1;
                }
                if (isstring) {
                    n = TyBytes_GET_SIZE(v);
                    p = TyBytes_AS_STRING(v);
                }
                else {
                    n = TyByteArray_GET_SIZE(v);
                    p = TyByteArray_AS_STRING(v);
                }
                if (n > code->size)
                    n = code->size;
                if (n > 0)
                    memcpy(res, p, n);
            } else if (e->format == 'p') {
                Ty_ssize_t n;
                int isstring;
                const void *p;
                isstring = TyBytes_Check(v);
                if (!isstring && !TyByteArray_Check(v)) {
                    TyErr_SetString(state->StructError,
                                    "argument for 'p' must be a bytes object");
                    return -1;
                }
                if (isstring) {
                    n = TyBytes_GET_SIZE(v);
                    p = TyBytes_AS_STRING(v);
                }
                else {
                    n = TyByteArray_GET_SIZE(v);
                    p = TyByteArray_AS_STRING(v);
                }
                if (code->size == 0) {
                    n = 0;
                }
                else if (n > (code->size - 1)) {
                    n = code->size - 1;
                }
                if (n > 0)
                    memcpy(res + 1, p, n);
                if (n > 255)
                    n = 255;
                *res = Ty_SAFE_DOWNCAST(n, Ty_ssize_t, unsigned char);
            } else {
                if (e->pack(state, res, v, e) < 0) {
                    if (TyLong_Check(v) && TyErr_ExceptionMatches(TyExc_OverflowError))
                        TyErr_SetString(state->StructError,
                                        "int too large to convert");
                    return -1;
                }
            }
            res += code->size;
        }
    }

    /* Success */
    return 0;
}


TyDoc_STRVAR(s_pack__doc__,
"S.pack(v1, v2, ...) -> bytes\n\
\n\
Return a bytes object containing values v1, v2, ... packed according\n\
to the format string S.format.  See help(struct) for more on format\n\
strings.");

static TyObject *
s_pack(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    char *buf;
    PyStructObject *soself;
    _structmodulestate *state = get_struct_state_structinst(self);

    /* Validate arguments. */
    soself = PyStructObject_CAST(self);
    assert(PyStruct_Check(self, state));
    assert(soself->s_codes != NULL);
    if (nargs != soself->s_len)
    {
        TyErr_Format(state->StructError,
            "pack expected %zd items for packing (got %zd)", soself->s_len, nargs);
        return NULL;
    }

    /* Allocate a new string */
    _PyBytesWriter writer;
    _PyBytesWriter_Init(&writer);
    buf = _PyBytesWriter_Alloc(&writer, soself->s_size);
    if (buf == NULL) {
        _PyBytesWriter_Dealloc(&writer);
        return NULL;
    }

    /* Call the guts */
    if ( s_pack_internal(soself, args, 0, buf, state) != 0 ) {
        _PyBytesWriter_Dealloc(&writer);
        return NULL;
    }

    return _PyBytesWriter_Finish(&writer, buf + soself->s_size);
}

TyDoc_STRVAR(s_pack_into__doc__,
"S.pack_into(buffer, offset, v1, v2, ...)\n\
\n\
Pack the values v1, v2, ... according to the format string S.format\n\
and write the packed bytes into the writable buffer buf starting at\n\
offset.  Note that the offset is a required argument.  See\n\
help(struct) for more on format strings.");

static TyObject *
s_pack_into(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    PyStructObject *soself;
    Ty_buffer buffer;
    Ty_ssize_t offset;
    _structmodulestate *state = get_struct_state_structinst(self);

    /* Validate arguments.  +1 is for the first arg as buffer. */
    soself = PyStructObject_CAST(self);
    assert(PyStruct_Check(self, state));
    assert(soself->s_codes != NULL);
    if (nargs != (soself->s_len + 2))
    {
        if (nargs == 0) {
            TyErr_Format(state->StructError,
                        "pack_into expected buffer argument");
        }
        else if (nargs == 1) {
            TyErr_Format(state->StructError,
                        "pack_into expected offset argument");
        }
        else {
            TyErr_Format(state->StructError,
                        "pack_into expected %zd items for packing (got %zd)",
                        soself->s_len, (nargs - 2));
        }
        return NULL;
    }

    /* Extract a writable memory buffer from the first argument */
    if (!TyArg_Parse(args[0], "w*", &buffer))
        return NULL;
    assert(buffer.len >= 0);

    /* Extract the offset from the first argument */
    offset = PyNumber_AsSsize_t(args[1], TyExc_IndexError);
    if (offset == -1 && TyErr_Occurred()) {
        PyBuffer_Release(&buffer);
        return NULL;
    }

    /* Support negative offsets. */
    if (offset < 0) {
         /* Check that negative offset is low enough to fit data */
        if (offset + soself->s_size > 0) {
            TyErr_Format(state->StructError,
                         "no space to pack %zd bytes at offset %zd",
                         soself->s_size,
                         offset);
            PyBuffer_Release(&buffer);
            return NULL;
        }

        /* Check that negative offset is not crossing buffer boundary */
        if (offset + buffer.len < 0) {
            TyErr_Format(state->StructError,
                         "offset %zd out of range for %zd-byte buffer",
                         offset,
                         buffer.len);
            PyBuffer_Release(&buffer);
            return NULL;
        }

        offset += buffer.len;
    }

    /* Check boundaries */
    if ((buffer.len - offset) < soself->s_size) {
        assert(offset >= 0);
        assert(soself->s_size >= 0);

        TyErr_Format(state->StructError,
                     "pack_into requires a buffer of at least %zu bytes for "
                     "packing %zd bytes at offset %zd "
                     "(actual buffer size is %zd)",
                     (size_t)soself->s_size + (size_t)offset,
                     soself->s_size,
                     offset,
                     buffer.len);
        PyBuffer_Release(&buffer);
        return NULL;
    }

    /* Call the guts */
    if (s_pack_internal(soself, args, 2, (char*)buffer.buf + offset, state) != 0) {
        PyBuffer_Release(&buffer);
        return NULL;
    }

    PyBuffer_Release(&buffer);
    Py_RETURN_NONE;
}

static TyObject *
s_get_format(TyObject *op, void *Py_UNUSED(closure))
{
    PyStructObject *self = PyStructObject_CAST(op);
    return TyUnicode_FromStringAndSize(TyBytes_AS_STRING(self->s_format),
                                       TyBytes_GET_SIZE(self->s_format));
}

static TyObject *
s_get_size(TyObject *op, void *Py_UNUSED(closure))
{
    PyStructObject *self = PyStructObject_CAST(op);
    return TyLong_FromSsize_t(self->s_size);
}

TyDoc_STRVAR(s_sizeof__doc__,
"S.__sizeof__() -> size of S in memory, in bytes");

static TyObject *
s_sizeof(TyObject *op, TyObject *Py_UNUSED(dummy))
{
    PyStructObject *self = PyStructObject_CAST(op);
    size_t size = _TyObject_SIZE(Ty_TYPE(self)) + sizeof(formatcode);
    for (formatcode *code = self->s_codes; code->fmtdef != NULL; code++) {
        size += sizeof(formatcode);
    }
    return TyLong_FromSize_t(size);
}

static TyObject *
s_repr(TyObject *op)
{
    PyStructObject *self = PyStructObject_CAST(op);
    TyObject* fmt = TyUnicode_FromStringAndSize(
        TyBytes_AS_STRING(self->s_format), TyBytes_GET_SIZE(self->s_format));
    if (fmt == NULL) {
        return NULL;
    }
    TyObject* s = TyUnicode_FromFormat("%s(%R)", _TyType_Name(Ty_TYPE(self)), fmt);
    Ty_DECREF(fmt);
    return s;
}

/* List of functions */

static struct TyMethodDef s_methods[] = {
    STRUCT_ITER_UNPACK_METHODDEF
    {"pack",            _PyCFunction_CAST(s_pack), METH_FASTCALL, s_pack__doc__},
    {"pack_into",       _PyCFunction_CAST(s_pack_into), METH_FASTCALL, s_pack_into__doc__},
    STRUCT_UNPACK_METHODDEF
    STRUCT_UNPACK_FROM_METHODDEF
    {"__sizeof__",      s_sizeof, METH_NOARGS, s_sizeof__doc__},
    {NULL,       NULL}          /* sentinel */
};

static TyMemberDef s_members[] = {
    {"__weaklistoffset__", Ty_T_PYSSIZET, offsetof(PyStructObject, weakreflist), Py_READONLY},
    {NULL}  /* sentinel */
};

static TyGetSetDef s_getsetlist[] = {
    {"format", s_get_format, NULL, TyDoc_STR("struct format string"), NULL},
    {"size", s_get_size, NULL, TyDoc_STR("struct size in bytes"), NULL},
    {NULL} /* sentinel */
};

TyDoc_STRVAR(s__doc__,
"Struct(fmt) --> compiled struct object\n"
"\n"
);

static TyType_Slot PyStructType_slots[] = {
    {Ty_tp_dealloc, s_dealloc},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_setattro, PyObject_GenericSetAttr},
    {Ty_tp_repr, s_repr},
    {Ty_tp_doc, (void*)s__doc__},
    {Ty_tp_traverse, s_traverse},
    {Ty_tp_clear, s_clear},
    {Ty_tp_methods, s_methods},
    {Ty_tp_members, s_members},
    {Ty_tp_getset, s_getsetlist},
    {Ty_tp_init, Struct___init__},
    {Ty_tp_alloc, TyType_GenericAlloc},
    {Ty_tp_new, s_new},
    {Ty_tp_free, PyObject_GC_Del},
    {0, 0},
};

static TyType_Spec PyStructType_spec = {
    "_struct.Struct",
    sizeof(PyStructObject),
    0,
    (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
     Ty_TPFLAGS_BASETYPE | Ty_TPFLAGS_IMMUTABLETYPE),
    PyStructType_slots
};


/* ---- Standalone functions  ---- */

#define MAXCACHE 100

static int
cache_struct_converter(TyObject *module, TyObject *fmt, PyStructObject **ptr)
{
    TyObject * s_object;
    _structmodulestate *state = get_struct_state(module);

    if (fmt == NULL) {
        Ty_SETREF(*ptr, NULL);
        return 1;
    }

    if (TyDict_GetItemRef(state->cache, fmt, &s_object) < 0) {
        return 0;
    }
    if (s_object != NULL) {
        *ptr = PyStructObject_CAST(s_object);
        return Ty_CLEANUP_SUPPORTED;
    }

    s_object = PyObject_CallOneArg(state->PyStructType, fmt);
    if (s_object != NULL) {
        if (TyDict_GET_SIZE(state->cache) >= MAXCACHE)
            TyDict_Clear(state->cache);
        /* Attempt to cache the result */
        if (TyDict_SetItem(state->cache, fmt, s_object) == -1)
            TyErr_Clear();
        *ptr = (PyStructObject *)s_object;
        return Ty_CLEANUP_SUPPORTED;
    }
    return 0;
}

/*[clinic input]
_clearcache

Clear the internal cache.
[clinic start generated code]*/

static TyObject *
_clearcache_impl(TyObject *module)
/*[clinic end generated code: output=ce4fb8a7bf7cb523 input=463eaae04bab3211]*/
{
    TyDict_Clear(get_struct_state(module)->cache);
    Py_RETURN_NONE;
}


/*[clinic input]
calcsize -> Ty_ssize_t

    format as s_object: cache_struct
    /

Return size in bytes of the struct described by the format string.
[clinic start generated code]*/

static Ty_ssize_t
calcsize_impl(TyObject *module, PyStructObject *s_object)
/*[clinic end generated code: output=db7d23d09c6932c4 input=96a6a590c7717ecd]*/
{
    return s_object->s_size;
}

TyDoc_STRVAR(pack_doc,
"pack(format, v1, v2, ...) -> bytes\n\
\n\
Return a bytes object containing the values v1, v2, ... packed according\n\
to the format string.  See help(struct) for more on format strings.");

static TyObject *
pack(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *s_object = NULL;
    TyObject *format, *result;

    if (nargs == 0) {
        TyErr_SetString(TyExc_TypeError, "missing format argument");
        return NULL;
    }
    format = args[0];

    if (!cache_struct_converter(module, format, (PyStructObject **)&s_object)) {
        return NULL;
    }
    result = s_pack(s_object, args + 1, nargs - 1);
    Ty_DECREF(s_object);
    return result;
}

TyDoc_STRVAR(pack_into_doc,
"pack_into(format, buffer, offset, v1, v2, ...)\n\
\n\
Pack the values v1, v2, ... according to the format string and write\n\
the packed bytes into the writable buffer buf starting at offset.  Note\n\
that the offset is a required argument.  See help(struct) for more\n\
on format strings.");

static TyObject *
pack_into(TyObject *module, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *s_object = NULL;
    TyObject *format, *result;

    if (nargs == 0) {
        TyErr_SetString(TyExc_TypeError, "missing format argument");
        return NULL;
    }
    format = args[0];

    if (!cache_struct_converter(module, format, (PyStructObject **)&s_object)) {
        return NULL;
    }
    result = s_pack_into(s_object, args + 1, nargs - 1);
    Ty_DECREF(s_object);
    return result;
}

/*[clinic input]
unpack

    format as s_object: cache_struct
    buffer: Ty_buffer
    /

Return a tuple containing values unpacked according to the format string.

The buffer's size in bytes must be calcsize(format).

See help(struct) for more on format strings.
[clinic start generated code]*/

static TyObject *
unpack_impl(TyObject *module, PyStructObject *s_object, Ty_buffer *buffer)
/*[clinic end generated code: output=48ddd4d88eca8551 input=05fa3b91678da727]*/
{
    return Struct_unpack_impl(s_object, buffer);
}

/*[clinic input]
unpack_from

    format as s_object: cache_struct
    /
    buffer: Ty_buffer
    offset: Ty_ssize_t = 0

Return a tuple containing values unpacked according to the format string.

The buffer's size, minus offset, must be at least calcsize(format).

See help(struct) for more on format strings.
[clinic start generated code]*/

static TyObject *
unpack_from_impl(TyObject *module, PyStructObject *s_object,
                 Ty_buffer *buffer, Ty_ssize_t offset)
/*[clinic end generated code: output=1042631674c6e0d3 input=6e80a5398e985025]*/
{
    return Struct_unpack_from_impl(s_object, buffer, offset);
}

/*[clinic input]
iter_unpack

    format as s_object: cache_struct
    buffer: object
    /

Return an iterator yielding tuples unpacked from the given bytes.

The bytes are unpacked according to the format string, like
a repeated invocation of unpack_from().

Requires that the bytes length be a multiple of the format struct size.
[clinic start generated code]*/

static TyObject *
iter_unpack_impl(TyObject *module, PyStructObject *s_object,
                 TyObject *buffer)
/*[clinic end generated code: output=0ae50e250d20e74d input=b214a58869a3c98d]*/
{
    return Struct_iter_unpack((TyObject*)s_object, buffer);
}

static struct TyMethodDef module_functions[] = {
    _CLEARCACHE_METHODDEF
    CALCSIZE_METHODDEF
    ITER_UNPACK_METHODDEF
    {"pack",            _PyCFunction_CAST(pack), METH_FASTCALL,   pack_doc},
    {"pack_into",       _PyCFunction_CAST(pack_into), METH_FASTCALL,   pack_into_doc},
    UNPACK_METHODDEF
    UNPACK_FROM_METHODDEF
    {NULL,       NULL}          /* sentinel */
};


/* Module initialization */

TyDoc_STRVAR(module_doc,
"Functions to convert between Python values and C structs.\n\
Python bytes objects are used to hold the data representing the C struct\n\
and also as format strings (explained below) to describe the layout of data\n\
in the C struct.\n\
\n\
The optional first format char indicates byte order, size and alignment:\n\
  @: native order, size & alignment (default)\n\
  =: native order, std. size & alignment\n\
  <: little-endian, std. size & alignment\n\
  >: big-endian, std. size & alignment\n\
  !: same as >\n\
\n\
The remaining chars indicate types of args and must match exactly;\n\
these can be preceded by a decimal repeat count:\n\
  x: pad byte (no data); c:char; b:signed byte; B:unsigned byte;\n\
  ?: _Bool (requires C99; if not available, char is used instead)\n\
  h:short; H:unsigned short; i:int; I:unsigned int;\n\
  l:long; L:unsigned long; f:float; d:double; e:half-float.\n\
Special cases (preceding decimal count indicates length):\n\
  s:string (array of char); p: pascal string (with count byte).\n\
Special cases (only available in native format):\n\
  n:ssize_t; N:size_t;\n\
  P:an integer type that is wide enough to hold a pointer.\n\
Special case (not in native mode unless 'long long' in platform C):\n\
  q:long long; Q:unsigned long long\n\
Whitespace between formats is ignored.\n\
\n\
The variable struct.error is an exception raised on errors.\n");


static int
_structmodule_traverse(TyObject *module, visitproc visit, void *arg)
{
    _structmodulestate *state = get_struct_state(module);
    if (state) {
        Ty_VISIT(state->cache);
        Ty_VISIT(state->PyStructType);
        Ty_VISIT(state->unpackiter_type);
        Ty_VISIT(state->StructError);
    }
    return 0;
}

static int
_structmodule_clear(TyObject *module)
{
    _structmodulestate *state = get_struct_state(module);
    if (state) {
        Ty_CLEAR(state->cache);
        Ty_CLEAR(state->PyStructType);
        Ty_CLEAR(state->unpackiter_type);
        Ty_CLEAR(state->StructError);
    }
    return 0;
}

static void
_structmodule_free(void *module)
{
    (void)_structmodule_clear((TyObject *)module);
}

static int
_structmodule_exec(TyObject *m)
{
    _structmodulestate *state = get_struct_state(m);

    state->cache = TyDict_New();
    if (state->cache == NULL) {
        return -1;
    }

    state->PyStructType = TyType_FromModuleAndSpec(
        m, &PyStructType_spec, NULL);
    if (state->PyStructType == NULL) {
        return -1;
    }
    if (TyModule_AddType(m, (TyTypeObject *)state->PyStructType) < 0) {
        return -1;
    }

    state->unpackiter_type = TyType_FromModuleAndSpec(
        m, &unpackiter_type_spec, NULL);
    if (state->unpackiter_type == NULL) {
        return -1;
    }

    /* Check endian and swap in faster functions */
    {
        const formatdef *native = native_table;
        formatdef *other, *ptr;
#if PY_LITTLE_ENDIAN
        other = lilendian_table;
#else
        other = bigendian_table;
#endif
        /* Scan through the native table, find a matching
           entry in the endian table and swap in the
           native implementations whenever possible
           (64-bit platforms may not have "standard" sizes) */
        while (native->format != '\0' && other->format != '\0') {
            ptr = other;
            while (ptr->format != '\0') {
                if (ptr->format == native->format) {
                    /* Match faster when formats are
                       listed in the same order */
                    if (ptr == other)
                        other++;
                    /* Only use the trick if the
                       size matches */
                    if (ptr->size != native->size)
                        break;
                    /* Skip float and double, could be
                       "unknown" float format */
                    if (ptr->format == 'd' || ptr->format == 'f')
                        break;
                    /* Skip _Bool, semantics are different for standard size */
                    if (ptr->format == '?')
                        break;
                    ptr->pack = native->pack;
                    ptr->unpack = native->unpack;
                    break;
                }
                ptr++;
            }
            native++;
        }
    }

    /* Add some symbolic constants to the module */
    state->StructError = TyErr_NewException("struct.error", NULL, NULL);
    if (state->StructError == NULL) {
        return -1;
    }
    if (TyModule_AddObjectRef(m, "error", state->StructError) < 0) {
        return -1;
    }

    return 0;
}

static PyModuleDef_Slot _structmodule_slots[] = {
    {Ty_mod_exec, _structmodule_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static struct TyModuleDef _structmodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_struct",
    .m_doc = module_doc,
    .m_size = sizeof(_structmodulestate),
    .m_methods = module_functions,
    .m_slots = _structmodule_slots,
    .m_traverse = _structmodule_traverse,
    .m_clear = _structmodule_clear,
    .m_free = _structmodule_free,
};

PyMODINIT_FUNC
PyInit__struct(void)
{
    return PyModuleDef_Init(&_structmodule);
}
