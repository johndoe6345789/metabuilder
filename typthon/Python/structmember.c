
/* Map C struct members to Python object attributes */

#include "Python.h"
#include "pycore_abstract.h"      // _PyNumber_Index()
#include "pycore_long.h"          // _TyLong_IsNegative()
#include "pycore_object.h"        // _Ty_TryIncrefCompare(), FT_ATOMIC_*()
#include "pycore_critical_section.h"


static inline TyObject *
member_get_object(const char *addr, const char *obj_addr, TyMemberDef *l)
{
    TyObject *v = FT_ATOMIC_LOAD_PTR(*(TyObject **) addr);
    if (v == NULL) {
        TyErr_Format(TyExc_AttributeError,
                     "'%T' object has no attribute '%s'",
                     (TyObject *)obj_addr, l->name);
    }
    return v;
}

TyObject *
PyMember_GetOne(const char *obj_addr, TyMemberDef *l)
{
    TyObject *v;
    if (l->flags & Ty_RELATIVE_OFFSET) {
        TyErr_SetString(
            TyExc_SystemError,
            "PyMember_GetOne used with Ty_RELATIVE_OFFSET");
        return NULL;
    }

    const char* addr = obj_addr + l->offset;
    switch (l->type) {
    case Ty_T_BOOL:
        v = TyBool_FromLong(FT_ATOMIC_LOAD_CHAR_RELAXED(*(char*)addr));
        break;
    case Ty_T_BYTE:
        v = TyLong_FromLong(FT_ATOMIC_LOAD_CHAR_RELAXED(*(char*)addr));
        break;
    case Ty_T_UBYTE:
        v = TyLong_FromUnsignedLong(FT_ATOMIC_LOAD_UCHAR_RELAXED(*(unsigned char*)addr));
        break;
    case Ty_T_SHORT:
        v = TyLong_FromLong(FT_ATOMIC_LOAD_SHORT_RELAXED(*(short*)addr));
        break;
    case Ty_T_USHORT:
        v = TyLong_FromUnsignedLong(FT_ATOMIC_LOAD_USHORT_RELAXED(*(unsigned short*)addr));
        break;
    case Ty_T_INT:
        v = TyLong_FromLong(FT_ATOMIC_LOAD_INT_RELAXED(*(int*)addr));
        break;
    case Ty_T_UINT:
        v = TyLong_FromUnsignedLong(FT_ATOMIC_LOAD_UINT_RELAXED(*(unsigned int*)addr));
        break;
    case Ty_T_LONG:
        v = TyLong_FromLong(FT_ATOMIC_LOAD_LONG_RELAXED(*(long*)addr));
        break;
    case Ty_T_ULONG:
        v = TyLong_FromUnsignedLong(FT_ATOMIC_LOAD_ULONG_RELAXED(*(unsigned long*)addr));
        break;
    case Ty_T_PYSSIZET:
        v = TyLong_FromSsize_t(FT_ATOMIC_LOAD_SSIZE_RELAXED(*(Ty_ssize_t*)addr));
        break;
    case Ty_T_FLOAT:
        v = TyFloat_FromDouble((double)FT_ATOMIC_LOAD_FLOAT_RELAXED(*(float*)addr));
        break;
    case Ty_T_DOUBLE:
        v = TyFloat_FromDouble(FT_ATOMIC_LOAD_DOUBLE_RELAXED(*(double*)addr));
        break;
    case Ty_T_STRING:
        if (*(char**)addr == NULL) {
            v = Ty_NewRef(Ty_None);
        }
        else
            v = TyUnicode_FromString(*(char**)addr);
        break;
    case Ty_T_STRING_INPLACE:
        v = TyUnicode_FromString((char*)addr);
        break;
    case Ty_T_CHAR: {
        char char_val = FT_ATOMIC_LOAD_CHAR_RELAXED(*addr);
        v = TyUnicode_FromStringAndSize(&char_val, 1);
        break;
    }
    case _Ty_T_OBJECT:
        v = FT_ATOMIC_LOAD_PTR(*(TyObject **) addr);
        if (v != NULL) {
#ifdef Ty_GIL_DISABLED
            if (!_Ty_TryIncrefCompare((TyObject **) addr, v)) {
                Ty_BEGIN_CRITICAL_SECTION((TyObject *) obj_addr);
                v = FT_ATOMIC_LOAD_PTR(*(TyObject **) addr);
                Ty_XINCREF(v);
                Ty_END_CRITICAL_SECTION();
            }
#else
            Ty_INCREF(v);
#endif
        }
        if (v == NULL) {
            v = Ty_None;
        }
        break;
    case Ty_T_OBJECT_EX:
        v = member_get_object(addr, obj_addr, l);
#ifndef Ty_GIL_DISABLED
        Ty_XINCREF(v);
#else
        if (v != NULL) {
            if (!_Ty_TryIncrefCompare((TyObject **) addr, v)) {
                Ty_BEGIN_CRITICAL_SECTION((TyObject *) obj_addr);
                v = member_get_object(addr, obj_addr, l);
                Ty_XINCREF(v);
                Ty_END_CRITICAL_SECTION();
            }
        }
#endif
        break;
    case Ty_T_LONGLONG:
        v = TyLong_FromLongLong(FT_ATOMIC_LOAD_LLONG_RELAXED(*(long long *)addr));
        break;
    case Ty_T_ULONGLONG:
        v = TyLong_FromUnsignedLongLong(FT_ATOMIC_LOAD_ULLONG_RELAXED(*(unsigned long long *)addr));
        break;
    case _Ty_T_NONE:
        // doesn't require free-threading code path
        v = Ty_NewRef(Ty_None);
        break;
    default:
        TyErr_SetString(TyExc_SystemError, "bad memberdescr type");
        v = NULL;
    }
    return v;
}

#define WARN(msg)                                               \
    do {                                                        \
    if (TyErr_WarnEx(TyExc_RuntimeWarning, msg, 1) < 0)         \
        return -1;                                              \
    } while (0)

int
PyMember_SetOne(char *addr, TyMemberDef *l, TyObject *v)
{
    TyObject *oldv;
    if (l->flags & Ty_RELATIVE_OFFSET) {
        TyErr_SetString(
            TyExc_SystemError,
            "PyMember_SetOne used with Ty_RELATIVE_OFFSET");
        return -1;
    }

#ifdef Ty_GIL_DISABLED
    TyObject *obj = (TyObject *) addr;
#endif
    addr += l->offset;

    if ((l->flags & Py_READONLY))
    {
        TyErr_SetString(TyExc_AttributeError, "readonly attribute");
        return -1;
    }
    if (v == NULL) {
        if (l->type == Ty_T_OBJECT_EX) {
            /* Check if the attribute is set. */
            if (*(TyObject **)addr == NULL) {
                TyErr_SetString(TyExc_AttributeError, l->name);
                return -1;
            }
        }
        else if (l->type != _Ty_T_OBJECT) {
            TyErr_SetString(TyExc_TypeError,
                            "can't delete numeric/char attribute");
            return -1;
        }
    }
    switch (l->type) {
    case Ty_T_BOOL:{
        if (!TyBool_Check(v)) {
            TyErr_SetString(TyExc_TypeError,
                            "attribute value type must be bool");
            return -1;
        }
        if (v == Ty_True)
            FT_ATOMIC_STORE_CHAR_RELAXED(*(char*)addr, 1);
        else
            FT_ATOMIC_STORE_CHAR_RELAXED(*(char*)addr, 0);
        break;
        }
    case Ty_T_BYTE:{
        long long_val = TyLong_AsLong(v);
        if ((long_val == -1) && TyErr_Occurred())
            return -1;
        FT_ATOMIC_STORE_CHAR_RELAXED(*(char*)addr, (char)long_val);
        /* XXX: For compatibility, only warn about truncations
           for now. */
        if ((long_val > CHAR_MAX) || (long_val < CHAR_MIN))
            WARN("Truncation of value to char");
        break;
        }
    case Ty_T_UBYTE:{
        long long_val = TyLong_AsLong(v);
        if ((long_val == -1) && TyErr_Occurred())
            return -1;
        FT_ATOMIC_STORE_UCHAR_RELAXED(*(unsigned char*)addr, (unsigned char)long_val);
        if ((long_val > UCHAR_MAX) || (long_val < 0))
            WARN("Truncation of value to unsigned char");
        break;
        }
    case Ty_T_SHORT:{
        long long_val = TyLong_AsLong(v);
        if ((long_val == -1) && TyErr_Occurred())
            return -1;
        FT_ATOMIC_STORE_SHORT_RELAXED(*(short*)addr, (short)long_val);
        if ((long_val > SHRT_MAX) || (long_val < SHRT_MIN))
            WARN("Truncation of value to short");
        break;
        }
    case Ty_T_USHORT:{
        long long_val = TyLong_AsLong(v);
        if ((long_val == -1) && TyErr_Occurred())
            return -1;
        FT_ATOMIC_STORE_USHORT_RELAXED(*(unsigned short*)addr, (unsigned short)long_val);
        if ((long_val > USHRT_MAX) || (long_val < 0))
            WARN("Truncation of value to unsigned short");
        break;
        }
    case Ty_T_INT:{
        long long_val = TyLong_AsLong(v);
        if ((long_val == -1) && TyErr_Occurred())
            return -1;
        FT_ATOMIC_STORE_INT_RELAXED(*(int *)addr, (int)long_val);
        if ((long_val > INT_MAX) || (long_val < INT_MIN))
            WARN("Truncation of value to int");
        break;
        }
    case Ty_T_UINT: {
        /* XXX: For compatibility, accept negative int values
           as well. */
        v = _PyNumber_Index(v);
        if (v == NULL) {
            return -1;
        }
        if (_TyLong_IsNegative((PyLongObject *)v)) {
            long long_val = TyLong_AsLong(v);
            Ty_DECREF(v);
            if (long_val == -1 && TyErr_Occurred()) {
                return -1;
            }
            FT_ATOMIC_STORE_UINT_RELAXED(*(unsigned int *)addr, (unsigned int)(unsigned long)long_val);
            WARN("Writing negative value into unsigned field");
        }
        else {
            unsigned long ulong_val = TyLong_AsUnsignedLong(v);
            Ty_DECREF(v);
            if (ulong_val == (unsigned long)-1 && TyErr_Occurred()) {
                return -1;
            }
            FT_ATOMIC_STORE_UINT_RELAXED(*(unsigned int *)addr, (unsigned int)ulong_val);
            if (ulong_val > UINT_MAX) {
                WARN("Truncation of value to unsigned int");
            }
        }
        break;
    }
    case Ty_T_LONG: {
        const long long_val = TyLong_AsLong(v);
        if ((long_val == -1) && TyErr_Occurred())
            return -1;
        FT_ATOMIC_STORE_LONG_RELAXED(*(long*)addr, long_val);
        break;
    }
    case Ty_T_ULONG: {
        /* XXX: For compatibility, accept negative int values
           as well. */
        v = _PyNumber_Index(v);
        if (v == NULL) {
            return -1;
        }
        if (_TyLong_IsNegative((PyLongObject *)v)) {
            long long_val = TyLong_AsLong(v);
            Ty_DECREF(v);
            if (long_val == -1 && TyErr_Occurred()) {
                return -1;
            }
            FT_ATOMIC_STORE_ULONG_RELAXED(*(unsigned long *)addr, (unsigned long)long_val);
            WARN("Writing negative value into unsigned field");
        }
        else {
            unsigned long ulong_val = TyLong_AsUnsignedLong(v);
            Ty_DECREF(v);
            if (ulong_val == (unsigned long)-1 && TyErr_Occurred()) {
                return -1;
            }
            FT_ATOMIC_STORE_ULONG_RELAXED(*(unsigned long *)addr, ulong_val);
        }
        break;
    }
    case Ty_T_PYSSIZET: {
        const Ty_ssize_t ssize_val = TyLong_AsSsize_t(v);
        if ((ssize_val == (Ty_ssize_t)-1) && TyErr_Occurred())
            return -1;
        FT_ATOMIC_STORE_SSIZE_RELAXED(*(Ty_ssize_t*)addr, ssize_val);
        break;
    }
    case Ty_T_FLOAT:{
        double double_val = TyFloat_AsDouble(v);
        if ((double_val == -1) && TyErr_Occurred())
            return -1;
        FT_ATOMIC_STORE_FLOAT_RELAXED(*(float*)addr, (float)double_val);
        break;
        }
    case Ty_T_DOUBLE: {
        const double double_val = TyFloat_AsDouble(v);
        if ((double_val == -1) && TyErr_Occurred())
            return -1;
        FT_ATOMIC_STORE_DOUBLE_RELAXED(*(double *) addr, double_val);
        break;
    }
    case _Ty_T_OBJECT:
    case Ty_T_OBJECT_EX:
        Ty_BEGIN_CRITICAL_SECTION(obj);
        oldv = *(TyObject **)addr;
        FT_ATOMIC_STORE_PTR_RELEASE(*(TyObject **)addr, Ty_XNewRef(v));
        Ty_END_CRITICAL_SECTION();
        Ty_XDECREF(oldv);
        break;
    case Ty_T_CHAR: {
        const char *string;
        Ty_ssize_t len;

        string = TyUnicode_AsUTF8AndSize(v, &len);
        if (string == NULL || len != 1) {
            TyErr_BadArgument();
            return -1;
        }
        FT_ATOMIC_STORE_CHAR_RELAXED(*(char*)addr, string[0]);
        break;
        }
    case Ty_T_STRING:
    case Ty_T_STRING_INPLACE:
        TyErr_SetString(TyExc_TypeError, "readonly attribute");
        return -1;
    case Ty_T_LONGLONG:{
        long long value = TyLong_AsLongLong(v);
        if ((value == -1) && TyErr_Occurred())
            return -1;
        FT_ATOMIC_STORE_LLONG_RELAXED(*(long long*)addr, value);
        break;
        }
    case Ty_T_ULONGLONG: {
        v = _PyNumber_Index(v);
        if (v == NULL) {
            return -1;
        }
        if (_TyLong_IsNegative((PyLongObject *)v)) {
            long long_val = TyLong_AsLong(v);
            Ty_DECREF(v);
            if (long_val == -1 && TyErr_Occurred()) {
                return -1;
            }
            FT_ATOMIC_STORE_ULLONG_RELAXED(*(unsigned long long *)addr, (unsigned long long)(long long)long_val);
            WARN("Writing negative value into unsigned field");
        }
        else {
            unsigned long long ulonglong_val = TyLong_AsUnsignedLongLong(v);
            Ty_DECREF(v);
            if (ulonglong_val == (unsigned long long)-1 && TyErr_Occurred()) {
                return -1;
            }
            FT_ATOMIC_STORE_ULLONG_RELAXED(*(unsigned long long *)addr, ulonglong_val);
        }
        break;
    }
    default:
        TyErr_Format(TyExc_SystemError,
                     "bad memberdescr type for %s", l->name);
        return -1;
    }
    return 0;
}
