
/* Module support implementation */

#include "Python.h"
#include "pycore_abstract.h"   // _PyIndex_Check()
#include "pycore_object.h"     // _TyType_IsReady()

typedef double va_double;

static TyObject *va_build_value(const char *, va_list);


int
_Ty_convert_optional_to_ssize_t(TyObject *obj, void *result)
{
    Ty_ssize_t limit;
    if (obj == Ty_None) {
        return 1;
    }
    else if (_PyIndex_Check(obj)) {
        limit = PyNumber_AsSsize_t(obj, TyExc_OverflowError);
        if (limit == -1 && TyErr_Occurred()) {
            return 0;
        }
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "argument should be integer or None, not '%.200s'",
                     Ty_TYPE(obj)->tp_name);
        return 0;
    }
    *((Ty_ssize_t *)result) = limit;
    return 1;
}


/* Helper for mkvalue() to scan the length of a format */

static Ty_ssize_t
countformat(const char *format, char endchar)
{
    Ty_ssize_t count = 0;
    int level = 0;
    while (level > 0 || *format != endchar) {
        switch (*format) {
        case '\0':
            /* Premature end */
            TyErr_SetString(TyExc_SystemError,
                            "unmatched paren in format");
            return -1;
        case '(':
        case '[':
        case '{':
            if (level == 0) {
                count++;
            }
            level++;
            break;
        case ')':
        case ']':
        case '}':
            level--;
            break;
        case '#':
        case '&':
        case ',':
        case ':':
        case ' ':
        case '\t':
            break;
        default:
            if (level == 0) {
                count++;
            }
        }
        format++;
    }
    return count;
}


/* Generic function to create a value -- the inverse of getargs() */
/* After an original idea and first implementation by Steven Miale */

static TyObject *do_mktuple(const char**, va_list *, char, Ty_ssize_t);
static int do_mkstack(TyObject **, const char**, va_list *, char, Ty_ssize_t);
static TyObject *do_mklist(const char**, va_list *, char, Ty_ssize_t);
static TyObject *do_mkdict(const char**, va_list *, char, Ty_ssize_t);
static TyObject *do_mkvalue(const char**, va_list *);

static int
check_end(const char **p_format, char endchar)
{
    const char *f = *p_format;
    while (*f != endchar) {
        if (*f != ' ' && *f != '\t' && *f != ',' && *f != ':') {
            TyErr_SetString(TyExc_SystemError,
                            "Unmatched paren in format");
            return 0;
        }
        f++;
    }
    if (endchar) {
        f++;
    }
    *p_format = f;
    return 1;
}

static void
do_ignore(const char **p_format, va_list *p_va, char endchar, Ty_ssize_t n)
{
    assert(TyErr_Occurred());
    TyObject *v = TyTuple_New(n);
    for (Ty_ssize_t i = 0; i < n; i++) {
        TyObject *exc = TyErr_GetRaisedException();
        TyObject *w = do_mkvalue(p_format, p_va);
        TyErr_SetRaisedException(exc);
        if (w != NULL) {
            if (v != NULL) {
                TyTuple_SET_ITEM(v, i, w);
            }
            else {
                Ty_DECREF(w);
            }
        }
    }
    Ty_XDECREF(v);
    if (!check_end(p_format, endchar)) {
        return;
    }
}

static TyObject *
do_mkdict(const char **p_format, va_list *p_va, char endchar, Ty_ssize_t n)
{
    TyObject *d;
    Ty_ssize_t i;
    if (n < 0)
        return NULL;
    if (n % 2) {
        TyErr_SetString(TyExc_SystemError,
                        "Bad dict format");
        do_ignore(p_format, p_va, endchar, n);
        return NULL;
    }
    /* Note that we can't bail immediately on error as this will leak
       refcounts on any 'N' arguments. */
    if ((d = TyDict_New()) == NULL) {
        do_ignore(p_format, p_va, endchar, n);
        return NULL;
    }
    for (i = 0; i < n; i+= 2) {
        TyObject *k, *v;

        k = do_mkvalue(p_format, p_va);
        if (k == NULL) {
            do_ignore(p_format, p_va, endchar, n - i - 1);
            Ty_DECREF(d);
            return NULL;
        }
        v = do_mkvalue(p_format, p_va);
        if (v == NULL || TyDict_SetItem(d, k, v) < 0) {
            do_ignore(p_format, p_va, endchar, n - i - 2);
            Ty_DECREF(k);
            Ty_XDECREF(v);
            Ty_DECREF(d);
            return NULL;
        }
        Ty_DECREF(k);
        Ty_DECREF(v);
    }
    if (!check_end(p_format, endchar)) {
        Ty_DECREF(d);
        return NULL;
    }
    return d;
}

static TyObject *
do_mklist(const char **p_format, va_list *p_va, char endchar, Ty_ssize_t n)
{
    TyObject *v;
    Ty_ssize_t i;
    if (n < 0)
        return NULL;
    /* Note that we can't bail immediately on error as this will leak
       refcounts on any 'N' arguments. */
    v = TyList_New(n);
    if (v == NULL) {
        do_ignore(p_format, p_va, endchar, n);
        return NULL;
    }
    for (i = 0; i < n; i++) {
        TyObject *w = do_mkvalue(p_format, p_va);
        if (w == NULL) {
            do_ignore(p_format, p_va, endchar, n - i - 1);
            Ty_DECREF(v);
            return NULL;
        }
        TyList_SET_ITEM(v, i, w);
    }
    if (!check_end(p_format, endchar)) {
        Ty_DECREF(v);
        return NULL;
    }
    return v;
}

static int
do_mkstack(TyObject **stack, const char **p_format, va_list *p_va,
           char endchar, Ty_ssize_t n)
{
    Ty_ssize_t i;

    if (n < 0) {
        return -1;
    }
    /* Note that we can't bail immediately on error as this will leak
       refcounts on any 'N' arguments. */
    for (i = 0; i < n; i++) {
        TyObject *w = do_mkvalue(p_format, p_va);
        if (w == NULL) {
            do_ignore(p_format, p_va, endchar, n - i - 1);
            goto error;
        }
        stack[i] = w;
    }
    if (!check_end(p_format, endchar)) {
        goto error;
    }
    return 0;

error:
    n = i;
    for (i=0; i < n; i++) {
        Ty_DECREF(stack[i]);
    }
    return -1;
}

static TyObject *
do_mktuple(const char **p_format, va_list *p_va, char endchar, Ty_ssize_t n)
{
    TyObject *v;
    Ty_ssize_t i;
    if (n < 0)
        return NULL;
    /* Note that we can't bail immediately on error as this will leak
       refcounts on any 'N' arguments. */
    if ((v = TyTuple_New(n)) == NULL) {
        do_ignore(p_format, p_va, endchar, n);
        return NULL;
    }
    for (i = 0; i < n; i++) {
        TyObject *w = do_mkvalue(p_format, p_va);
        if (w == NULL) {
            do_ignore(p_format, p_va, endchar, n - i - 1);
            Ty_DECREF(v);
            return NULL;
        }
        TyTuple_SET_ITEM(v, i, w);
    }
    if (!check_end(p_format, endchar)) {
        Ty_DECREF(v);
        return NULL;
    }
    return v;
}

static TyObject *
do_mkvalue(const char **p_format, va_list *p_va)
{
    for (;;) {
        switch (*(*p_format)++) {
        case '(':
            return do_mktuple(p_format, p_va, ')',
                              countformat(*p_format, ')'));

        case '[':
            return do_mklist(p_format, p_va, ']',
                             countformat(*p_format, ']'));

        case '{':
            return do_mkdict(p_format, p_va, '}',
                             countformat(*p_format, '}'));

        case 'b':
        case 'B':
        case 'h':
        case 'i':
            return TyLong_FromLong((long)va_arg(*p_va, int));

        case 'H':
            return TyLong_FromLong((long)va_arg(*p_va, unsigned int));

        case 'I':
        {
            unsigned int n;
            n = va_arg(*p_va, unsigned int);
            return TyLong_FromUnsignedLong(n);
        }

        case 'n':
#if SIZEOF_SIZE_T!=SIZEOF_LONG
            return TyLong_FromSsize_t(va_arg(*p_va, Ty_ssize_t));
#endif
            /* Fall through from 'n' to 'l' if Ty_ssize_t is long */
            _Ty_FALLTHROUGH;
        case 'l':
            return TyLong_FromLong(va_arg(*p_va, long));

        case 'k':
        {
            unsigned long n;
            n = va_arg(*p_va, unsigned long);
            return TyLong_FromUnsignedLong(n);
        }

        case 'L':
            return TyLong_FromLongLong((long long)va_arg(*p_va, long long));

        case 'K':
            return TyLong_FromUnsignedLongLong(
                va_arg(*p_va, unsigned long long));

        case 'u':
        {
            TyObject *v;
            const wchar_t *u = va_arg(*p_va, wchar_t*);
            Ty_ssize_t n;
            if (**p_format == '#') {
                ++*p_format;
                n = va_arg(*p_va, Ty_ssize_t);
            }
            else
                n = -1;
            if (u == NULL) {
                v = Ty_NewRef(Ty_None);
            }
            else {
                if (n < 0)
                    n = wcslen(u);
                v = TyUnicode_FromWideChar(u, n);
            }
            return v;
        }
        case 'f':
        case 'd':
            return TyFloat_FromDouble(
                (double)va_arg(*p_va, va_double));

        case 'D':
            return TyComplex_FromCComplex(
                *((Ty_complex *)va_arg(*p_va, Ty_complex *)));

        case 'c':
        {
            char p[1];
            p[0] = (char)va_arg(*p_va, int);
            return TyBytes_FromStringAndSize(p, 1);
        }
        case 'C':
        {
            int i = va_arg(*p_va, int);
            return TyUnicode_FromOrdinal(i);
        }
        case 'p':
        {
            int i = va_arg(*p_va, int);
            return TyBool_FromLong(i);
        }

        case 's':
        case 'z':
        case 'U':   /* XXX deprecated alias */
        {
            TyObject *v;
            const char *str = va_arg(*p_va, const char *);
            Ty_ssize_t n;
            if (**p_format == '#') {
                ++*p_format;
                n = va_arg(*p_va, Ty_ssize_t);
            }
            else
                n = -1;
            if (str == NULL) {
                v = Ty_NewRef(Ty_None);
            }
            else {
                if (n < 0) {
                    size_t m = strlen(str);
                    if (m > PY_SSIZE_T_MAX) {
                        TyErr_SetString(TyExc_OverflowError,
                            "string too long for Python string");
                        return NULL;
                    }
                    n = (Ty_ssize_t)m;
                }
                v = TyUnicode_FromStringAndSize(str, n);
            }
            return v;
        }

        case 'y':
        {
            TyObject *v;
            const char *str = va_arg(*p_va, const char *);
            Ty_ssize_t n;
            if (**p_format == '#') {
                ++*p_format;
                n = va_arg(*p_va, Ty_ssize_t);
            }
            else
                n = -1;
            if (str == NULL) {
                v = Ty_NewRef(Ty_None);
            }
            else {
                if (n < 0) {
                    size_t m = strlen(str);
                    if (m > PY_SSIZE_T_MAX) {
                        TyErr_SetString(TyExc_OverflowError,
                            "string too long for Python bytes");
                        return NULL;
                    }
                    n = (Ty_ssize_t)m;
                }
                v = TyBytes_FromStringAndSize(str, n);
            }
            return v;
        }

        case 'N':
        case 'S':
        case 'O':
        if (**p_format == '&') {
            typedef TyObject *(*converter)(void *);
            converter func = va_arg(*p_va, converter);
            void *arg = va_arg(*p_va, void *);
            ++*p_format;
            return (*func)(arg);
        }
        else {
            TyObject *v;
            v = va_arg(*p_va, TyObject *);
            if (v != NULL) {
                if (*(*p_format - 1) != 'N')
                    Ty_INCREF(v);
            }
            else if (!TyErr_Occurred())
                /* If a NULL was passed
                 * because a call that should
                 * have constructed a value
                 * failed, that's OK, and we
                 * pass the error on; but if
                 * no error occurred it's not
                 * clear that the caller knew
                 * what she was doing. */
                TyErr_SetString(TyExc_SystemError,
                    "NULL object passed to Ty_BuildValue");
            return v;
        }

        case ':':
        case ',':
        case ' ':
        case '\t':
            break;

        default:
            TyErr_SetString(TyExc_SystemError,
                "bad format char passed to Ty_BuildValue");
            return NULL;

        }
    }
}


TyObject *
Ty_BuildValue(const char *format, ...)
{
    va_list va;
    TyObject* retval;
    va_start(va, format);
    retval = va_build_value(format, va);
    va_end(va);
    return retval;
}

PyAPI_FUNC(TyObject *) /* abi only */
_Ty_BuildValue_SizeT(const char *format, ...)
{
    va_list va;
    TyObject* retval;
    va_start(va, format);
    retval = va_build_value(format, va);
    va_end(va);
    return retval;
}

TyObject *
Ty_VaBuildValue(const char *format, va_list va)
{
    return va_build_value(format, va);
}

PyAPI_FUNC(TyObject *) /* abi only */
_Ty_VaBuildValue_SizeT(const char *format, va_list va)
{
    return va_build_value(format, va);
}

static TyObject *
va_build_value(const char *format, va_list va)
{
    const char *f = format;
    Ty_ssize_t n = countformat(f, '\0');
    va_list lva;
    TyObject *retval;

    if (n < 0)
        return NULL;
    if (n == 0) {
        Py_RETURN_NONE;
    }
    va_copy(lva, va);
    if (n == 1) {
        retval = do_mkvalue(&f, &lva);
    } else {
        retval = do_mktuple(&f, &lva, '\0', n);
    }
    va_end(lva);
    return retval;
}

TyObject **
_Ty_VaBuildStack(TyObject **small_stack, Ty_ssize_t small_stack_len,
                const char *format, va_list va, Ty_ssize_t *p_nargs)
{
    const char *f;
    Ty_ssize_t n;
    va_list lva;
    TyObject **stack;
    int res;

    n = countformat(format, '\0');
    if (n < 0) {
        *p_nargs = 0;
        return NULL;
    }

    if (n == 0) {
        *p_nargs = 0;
        return small_stack;
    }

    if (n <= small_stack_len) {
        stack = small_stack;
    }
    else {
        stack = TyMem_Malloc(n * sizeof(stack[0]));
        if (stack == NULL) {
            TyErr_NoMemory();
            return NULL;
        }
    }

    va_copy(lva, va);
    f = format;
    res = do_mkstack(stack, &f, &lva, '\0', n);
    va_end(lva);

    if (res < 0) {
        if (stack != small_stack) {
            TyMem_Free(stack);
        }
        return NULL;
    }

    *p_nargs = n;
    return stack;
}


int
TyModule_AddObjectRef(TyObject *mod, const char *name, TyObject *value)
{
    if (!TyModule_Check(mod)) {
        TyErr_SetString(TyExc_TypeError,
                        "TyModule_AddObjectRef() first argument "
                        "must be a module");
        return -1;
    }
    if (!value) {
        if (!TyErr_Occurred()) {
            TyErr_SetString(TyExc_SystemError,
                            "TyModule_AddObjectRef() must be called "
                            "with an exception raised if value is NULL");
        }
        return -1;
    }

    TyObject *dict = TyModule_GetDict(mod);
    if (dict == NULL) {
        /* Internal error -- modules must have a dict! */
        TyErr_Format(TyExc_SystemError, "module '%s' has no __dict__",
                     TyModule_GetName(mod));
        return -1;
    }
    return TyDict_SetItemString(dict, name, value);
}

int
TyModule_Add(TyObject *mod, const char *name, TyObject *value)
{
    int res = TyModule_AddObjectRef(mod, name, value);
    Ty_XDECREF(value);
    return res;
}

int
TyModule_AddObject(TyObject *mod, const char *name, TyObject *value)
{
    int res = TyModule_AddObjectRef(mod, name, value);
    if (res == 0) {
        Ty_DECREF(value);
    }
    return res;
}

int
TyModule_AddIntConstant(TyObject *m, const char *name, long value)
{
    return TyModule_Add(m, name, TyLong_FromLong(value));
}

int
TyModule_AddStringConstant(TyObject *m, const char *name, const char *value)
{
    return TyModule_Add(m, name, TyUnicode_FromString(value));
}

int
TyModule_AddType(TyObject *module, TyTypeObject *type)
{
    if (!_TyType_IsReady(type) && TyType_Ready(type) < 0) {
        return -1;
    }

    const char *name = _TyType_Name(type);
    assert(name != NULL);

    return TyModule_AddObjectRef(module, name, (TyObject *)type);
}


/* Exported functions for version helper macros */

#undef Ty_PACK_FULL_VERSION
uint32_t
Ty_PACK_FULL_VERSION(int x, int y, int z, int level, int serial)
{
    return _Ty_PACK_FULL_VERSION(x, y, z, level, serial);
}

#undef Ty_PACK_VERSION
uint32_t
Ty_PACK_VERSION(int x, int y)
{
    return Ty_PACK_FULL_VERSION(x, y, 0, 0, 0);
}
