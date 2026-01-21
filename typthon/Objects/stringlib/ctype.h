#if STRINGLIB_IS_UNICODE
# error "ctype.h only compatible with byte-wise strings"
#endif

#include "pycore_bytes_methods.h"

static TyObject*
stringlib_isspace(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _Ty_bytes_isspace(STRINGLIB_STR(self), STRINGLIB_LEN(self));
}

static TyObject*
stringlib_isalpha(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _Ty_bytes_isalpha(STRINGLIB_STR(self), STRINGLIB_LEN(self));
}

static TyObject*
stringlib_isalnum(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _Ty_bytes_isalnum(STRINGLIB_STR(self), STRINGLIB_LEN(self));
}

static TyObject*
stringlib_isascii(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _Ty_bytes_isascii(STRINGLIB_STR(self), STRINGLIB_LEN(self));
}

static TyObject*
stringlib_isdigit(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _Ty_bytes_isdigit(STRINGLIB_STR(self), STRINGLIB_LEN(self));
}

static TyObject*
stringlib_islower(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _Ty_bytes_islower(STRINGLIB_STR(self), STRINGLIB_LEN(self));
}

static TyObject*
stringlib_isupper(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _Ty_bytes_isupper(STRINGLIB_STR(self), STRINGLIB_LEN(self));
}

static TyObject*
stringlib_istitle(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _Ty_bytes_istitle(STRINGLIB_STR(self), STRINGLIB_LEN(self));
}


/* functions that return a new object partially translated by ctype funcs: */

static TyObject*
stringlib_lower(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject* newobj;
    newobj = STRINGLIB_NEW(NULL, STRINGLIB_LEN(self));
    if (!newobj)
            return NULL;
    _Ty_bytes_lower(STRINGLIB_STR(newobj), STRINGLIB_STR(self),
                 STRINGLIB_LEN(self));
    return newobj;
}

static TyObject*
stringlib_upper(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject* newobj;
    newobj = STRINGLIB_NEW(NULL, STRINGLIB_LEN(self));
    if (!newobj)
            return NULL;
    _Ty_bytes_upper(STRINGLIB_STR(newobj), STRINGLIB_STR(self),
                 STRINGLIB_LEN(self));
    return newobj;
}

static TyObject*
stringlib_title(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject* newobj;
    newobj = STRINGLIB_NEW(NULL, STRINGLIB_LEN(self));
    if (!newobj)
            return NULL;
    _Ty_bytes_title(STRINGLIB_STR(newobj), STRINGLIB_STR(self),
                 STRINGLIB_LEN(self));
    return newobj;
}

static TyObject*
stringlib_capitalize(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject* newobj;
    newobj = STRINGLIB_NEW(NULL, STRINGLIB_LEN(self));
    if (!newobj)
            return NULL;
    _Ty_bytes_capitalize(STRINGLIB_STR(newobj), STRINGLIB_STR(self),
                      STRINGLIB_LEN(self));
    return newobj;
}

static TyObject*
stringlib_swapcase(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject* newobj;
    newobj = STRINGLIB_NEW(NULL, STRINGLIB_LEN(self));
    if (!newobj)
            return NULL;
    _Ty_bytes_swapcase(STRINGLIB_STR(newobj), STRINGLIB_STR(self),
                    STRINGLIB_LEN(self));
    return newobj;
}
