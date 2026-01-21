/* PyByteArray (bytearray) implementation */

#include "Python.h"
#include "pycore_abstract.h"      // _PyIndex_Check()
#include "pycore_bytes_methods.h"
#include "pycore_bytesobject.h"
#include "pycore_ceval.h"         // _TyEval_GetBuiltin()
#include "pycore_critical_section.h"
#include "pycore_object.h"        // _TyObject_GC_UNTRACK()
#include "pycore_strhex.h"        // _Ty_strhex_with_sep()
#include "pycore_long.h"          // _TyLong_FromUnsignedChar()
#include "pycore_pyatomic_ft_wrappers.h"
#include "bytesobject.h"

/*[clinic input]
class bytearray "PyByteArrayObject *" "&TyByteArray_Type"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=5535b77c37a119e0]*/

/* For TyByteArray_AS_STRING(). */
char _PyByteArray_empty_string[] = "";

/* Helpers */

static int
_getbytevalue(TyObject* arg, int *value)
{
    int overflow;
    long face_value = TyLong_AsLongAndOverflow(arg, &overflow);

    if (face_value == -1 && TyErr_Occurred()) {
        *value = -1;
        return 0;
    }
    if (face_value < 0 || face_value >= 256) {
        /* this includes an overflow in converting to C long */
        TyErr_SetString(TyExc_ValueError, "byte must be in range(0, 256)");
        *value = -1;
        return 0;
    }

    *value = face_value;
    return 1;
}

static int
bytearray_getbuffer_lock_held(TyObject *self, Ty_buffer *view, int flags)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(self);
    PyByteArrayObject *obj = _PyByteArray_CAST(self);
    if (view == NULL) {
        TyErr_SetString(TyExc_BufferError,
            "bytearray_getbuffer: view==NULL argument is obsolete");
        return -1;
    }

    void *ptr = (void *) TyByteArray_AS_STRING(obj);
    if (PyBuffer_FillInfo(view, (TyObject*)obj, ptr, Ty_SIZE(obj), 0, flags) < 0) {
        return -1;
    }
    obj->ob_exports++;
    return 0;
}

static int
bytearray_getbuffer(TyObject *self, Ty_buffer *view, int flags)
{
    int ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = bytearray_getbuffer_lock_held(self, view, flags);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static void
bytearray_releasebuffer(TyObject *self, Ty_buffer *view)
{
    Ty_BEGIN_CRITICAL_SECTION(self);
    PyByteArrayObject *obj = _PyByteArray_CAST(self);
    obj->ob_exports--;
    assert(obj->ob_exports >= 0);
    Ty_END_CRITICAL_SECTION();
}

static int
_canresize(PyByteArrayObject *self)
{
    if (self->ob_exports > 0) {
        TyErr_SetString(TyExc_BufferError,
                "Existing exports of data: object cannot be re-sized");
        return 0;
    }
    return 1;
}

#include "clinic/bytearrayobject.c.h"

/* Direct API functions */

TyObject *
TyByteArray_FromObject(TyObject *input)
{
    return PyObject_CallOneArg((TyObject *)&TyByteArray_Type, input);
}

static TyObject *
_PyByteArray_FromBufferObject(TyObject *obj)
{
    TyObject *result;
    Ty_buffer view;

    if (PyObject_GetBuffer(obj, &view, PyBUF_FULL_RO) < 0) {
        return NULL;
    }
    result = TyByteArray_FromStringAndSize(NULL, view.len);
    if (result != NULL &&
        PyBuffer_ToContiguous(TyByteArray_AS_STRING(result),
                              &view, view.len, 'C') < 0)
    {
        Ty_CLEAR(result);
    }
    PyBuffer_Release(&view);
    return result;
}

TyObject *
TyByteArray_FromStringAndSize(const char *bytes, Ty_ssize_t size)
{
    PyByteArrayObject *new;
    Ty_ssize_t alloc;

    if (size < 0) {
        TyErr_SetString(TyExc_SystemError,
            "Negative size passed to TyByteArray_FromStringAndSize");
        return NULL;
    }

    /* Prevent buffer overflow when setting alloc to size+1. */
    if (size == PY_SSIZE_T_MAX) {
        return TyErr_NoMemory();
    }

    new = PyObject_New(PyByteArrayObject, &TyByteArray_Type);
    if (new == NULL)
        return NULL;

    if (size == 0) {
        new->ob_bytes = NULL;
        alloc = 0;
    }
    else {
        alloc = size + 1;
        new->ob_bytes = TyMem_Malloc(alloc);
        if (new->ob_bytes == NULL) {
            Ty_DECREF(new);
            return TyErr_NoMemory();
        }
        if (bytes != NULL && size > 0)
            memcpy(new->ob_bytes, bytes, size);
        new->ob_bytes[size] = '\0';  /* Trailing null byte */
    }
    Ty_SET_SIZE(new, size);
    new->ob_alloc = alloc;
    new->ob_start = new->ob_bytes;
    new->ob_exports = 0;

    return (TyObject *)new;
}

Ty_ssize_t
TyByteArray_Size(TyObject *self)
{
    assert(self != NULL);
    assert(TyByteArray_Check(self));

    return TyByteArray_GET_SIZE(self);
}

char  *
TyByteArray_AsString(TyObject *self)
{
    assert(self != NULL);
    assert(TyByteArray_Check(self));

    return TyByteArray_AS_STRING(self);
}

static int
bytearray_resize_lock_held(TyObject *self, Ty_ssize_t requested_size)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(self);
    void *sval;
    PyByteArrayObject *obj = ((PyByteArrayObject *)self);
    /* All computations are done unsigned to avoid integer overflows
       (see issue #22335). */
    size_t alloc = (size_t) obj->ob_alloc;
    size_t logical_offset = (size_t) (obj->ob_start - obj->ob_bytes);
    size_t size = (size_t) requested_size;

    assert(self != NULL);
    assert(TyByteArray_Check(self));
    assert(logical_offset <= alloc);

    if (requested_size < 0) {
        TyErr_Format(TyExc_ValueError,
            "Can only resize to positive sizes, got %zd", requested_size);
        return -1;
    }

    if (requested_size == Ty_SIZE(self)) {
        return 0;
    }
    if (!_canresize(obj)) {
        return -1;
    }

    if (size + logical_offset + 1 <= alloc) {
        /* Current buffer is large enough to host the requested size,
           decide on a strategy. */
        if (size < alloc / 2) {
            /* Major downsize; resize down to exact size */
            alloc = size + 1;
        }
        else {
            /* Minor downsize; quick exit */
            Ty_SET_SIZE(self, size);
            TyByteArray_AS_STRING(self)[size] = '\0'; /* Trailing null */
            return 0;
        }
    }
    else {
        /* Need growing, decide on a strategy */
        if (size <= alloc * 1.125) {
            /* Moderate upsize; overallocate similar to list_resize() */
            alloc = size + (size >> 3) + (size < 9 ? 3 : 6);
        }
        else {
            /* Major upsize; resize up to exact size */
            alloc = size + 1;
        }
    }
    if (alloc > PY_SSIZE_T_MAX) {
        TyErr_NoMemory();
        return -1;
    }

    if (logical_offset > 0) {
        sval = TyMem_Malloc(alloc);
        if (sval == NULL) {
            TyErr_NoMemory();
            return -1;
        }
        memcpy(sval, TyByteArray_AS_STRING(self),
               Ty_MIN((size_t)requested_size, (size_t)Ty_SIZE(self)));
        TyMem_Free(obj->ob_bytes);
    }
    else {
        sval = TyMem_Realloc(obj->ob_bytes, alloc);
        if (sval == NULL) {
            TyErr_NoMemory();
            return -1;
        }
    }

    obj->ob_bytes = obj->ob_start = sval;
    Ty_SET_SIZE(self, size);
    FT_ATOMIC_STORE_SSIZE_RELAXED(obj->ob_alloc, alloc);
    obj->ob_bytes[size] = '\0'; /* Trailing null byte */

    return 0;
}

int
TyByteArray_Resize(TyObject *self, Ty_ssize_t requested_size)
{
    int ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = bytearray_resize_lock_held(self, requested_size);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

TyObject *
TyByteArray_Concat(TyObject *a, TyObject *b)
{
    Ty_buffer va, vb;
    PyByteArrayObject *result = NULL;

    va.len = -1;
    vb.len = -1;
    if (PyObject_GetBuffer(a, &va, PyBUF_SIMPLE) != 0 ||
        PyObject_GetBuffer(b, &vb, PyBUF_SIMPLE) != 0) {
            TyErr_Format(TyExc_TypeError, "can't concat %.100s to %.100s",
                         Ty_TYPE(b)->tp_name, Ty_TYPE(a)->tp_name);
            goto done;
    }

    if (va.len > PY_SSIZE_T_MAX - vb.len) {
        TyErr_NoMemory();
        goto done;
    }

    result = (PyByteArrayObject *) \
        TyByteArray_FromStringAndSize(NULL, va.len + vb.len);
    // result->ob_bytes is NULL if result is an empty bytearray:
    // if va.len + vb.len equals zero.
    if (result != NULL && result->ob_bytes != NULL) {
        memcpy(result->ob_bytes, va.buf, va.len);
        memcpy(result->ob_bytes + va.len, vb.buf, vb.len);
    }

  done:
    if (va.len != -1)
        PyBuffer_Release(&va);
    if (vb.len != -1)
        PyBuffer_Release(&vb);
    return (TyObject *)result;
}

/* Functions stuffed into the type object */

static Ty_ssize_t
bytearray_length(TyObject *op)
{
    return TyByteArray_GET_SIZE(op);
}

static TyObject *
bytearray_iconcat_lock_held(TyObject *op, TyObject *other)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(op);
    PyByteArrayObject *self = _PyByteArray_CAST(op);

    Ty_buffer vo;
    if (PyObject_GetBuffer(other, &vo, PyBUF_SIMPLE) != 0) {
        TyErr_Format(TyExc_TypeError, "can't concat %.100s to %.100s",
                     Ty_TYPE(other)->tp_name, Ty_TYPE(self)->tp_name);
        return NULL;
    }

    Ty_ssize_t size = Ty_SIZE(self);
    if (size > PY_SSIZE_T_MAX - vo.len) {
        PyBuffer_Release(&vo);
        return TyErr_NoMemory();
    }

    if (bytearray_resize_lock_held((TyObject *)self, size + vo.len) < 0) {
        PyBuffer_Release(&vo);
        return NULL;
    }

    memcpy(TyByteArray_AS_STRING(self) + size, vo.buf, vo.len);
    PyBuffer_Release(&vo);
    return Ty_NewRef(self);
}

static TyObject *
bytearray_iconcat(TyObject *op, TyObject *other)
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(op);
    ret = bytearray_iconcat_lock_held(op, other);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_repeat_lock_held(TyObject *op, Ty_ssize_t count)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(op);
    PyByteArrayObject *self = _PyByteArray_CAST(op);
    if (count < 0) {
        count = 0;
    }
    const Ty_ssize_t mysize = Ty_SIZE(self);
    if (count > 0 && mysize > PY_SSIZE_T_MAX / count) {
        return TyErr_NoMemory();
    }
    Ty_ssize_t size = mysize * count;

    PyByteArrayObject* result = (PyByteArrayObject *)TyByteArray_FromStringAndSize(NULL, size);
    const char* buf = TyByteArray_AS_STRING(self);
    if (result != NULL && size != 0) {
        _TyBytes_Repeat(result->ob_bytes, size, buf, mysize);
    }
    return (TyObject *)result;
}

static TyObject *
bytearray_repeat(TyObject *op, Ty_ssize_t count)
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(op);
    ret = bytearray_repeat_lock_held(op, count);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_irepeat_lock_held(TyObject *op, Ty_ssize_t count)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(op);
    PyByteArrayObject *self = _PyByteArray_CAST(op);
    if (count < 0) {
        count = 0;
    }
    else if (count == 1) {
        return Ty_NewRef(self);
    }

    const Ty_ssize_t mysize = Ty_SIZE(self);
    if (count > 0 && mysize > PY_SSIZE_T_MAX / count) {
        return TyErr_NoMemory();
    }
    const Ty_ssize_t size = mysize * count;
    if (bytearray_resize_lock_held((TyObject *)self, size) < 0) {
        return NULL;
    }

    char* buf = TyByteArray_AS_STRING(self);
    _TyBytes_Repeat(buf, size, buf, mysize);

    return Ty_NewRef(self);
}

static TyObject *
bytearray_irepeat(TyObject *op, Ty_ssize_t count)
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(op);
    ret = bytearray_irepeat_lock_held(op, count);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_getitem_lock_held(TyObject *op, Ty_ssize_t i)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(op);
    PyByteArrayObject *self = _PyByteArray_CAST(op);
    if (i < 0 || i >= Ty_SIZE(self)) {
        TyErr_SetString(TyExc_IndexError, "bytearray index out of range");
        return NULL;
    }
    return _TyLong_FromUnsignedChar((unsigned char)(self->ob_start[i]));
}

static TyObject *
bytearray_getitem(TyObject *op, Ty_ssize_t i)
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(op);
    ret = bytearray_getitem_lock_held(op, i);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_subscript_lock_held(TyObject *op, TyObject *index)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(op);
    PyByteArrayObject *self = _PyByteArray_CAST(op);
    if (_PyIndex_Check(index)) {
        Ty_ssize_t i = PyNumber_AsSsize_t(index, TyExc_IndexError);

        if (i == -1 && TyErr_Occurred())
            return NULL;

        if (i < 0)
            i += TyByteArray_GET_SIZE(self);

        if (i < 0 || i >= Ty_SIZE(self)) {
            TyErr_SetString(TyExc_IndexError, "bytearray index out of range");
            return NULL;
        }
        return _TyLong_FromUnsignedChar((unsigned char)(self->ob_start[i]));
    }
    else if (TySlice_Check(index)) {
        Ty_ssize_t start, stop, step, slicelength, i;
        size_t cur;
        if (TySlice_Unpack(index, &start, &stop, &step) < 0) {
            return NULL;
        }
        slicelength = TySlice_AdjustIndices(TyByteArray_GET_SIZE(self),
                                            &start, &stop, step);

        if (slicelength <= 0)
            return TyByteArray_FromStringAndSize("", 0);
        else if (step == 1) {
            return TyByteArray_FromStringAndSize(
                TyByteArray_AS_STRING(self) + start, slicelength);
        }
        else {
            char *source_buf = TyByteArray_AS_STRING(self);
            char *result_buf;
            TyObject *result;

            result = TyByteArray_FromStringAndSize(NULL, slicelength);
            if (result == NULL)
                return NULL;

            result_buf = TyByteArray_AS_STRING(result);
            for (cur = start, i = 0; i < slicelength;
                 cur += step, i++) {
                     result_buf[i] = source_buf[cur];
            }
            return result;
        }
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "bytearray indices must be integers or slices, not %.200s",
                     Ty_TYPE(index)->tp_name);
        return NULL;
    }
}

static TyObject *
bytearray_subscript(TyObject *op, TyObject *index)
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(op);
    ret = bytearray_subscript_lock_held(op, index);
    Ty_END_CRITICAL_SECTION();
    return ret;

}

static int
bytearray_setslice_linear(PyByteArrayObject *self,
                          Ty_ssize_t lo, Ty_ssize_t hi,
                          char *bytes, Ty_ssize_t bytes_len)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(self);
    Ty_ssize_t avail = hi - lo;
    char *buf = TyByteArray_AS_STRING(self);
    Ty_ssize_t growth = bytes_len - avail;
    int res = 0;
    assert(avail >= 0);

    if (growth < 0) {
        if (!_canresize(self))
            return -1;

        if (lo == 0) {
            /* Shrink the buffer by advancing its logical start */
            self->ob_start -= growth;
            /*
              0   lo               hi             old_size
              |   |<----avail----->|<-----tail------>|
              |      |<-bytes_len->|<-----tail------>|
              0    new_lo         new_hi          new_size
            */
        }
        else {
            /*
              0   lo               hi               old_size
              |   |<----avail----->|<-----tomove------>|
              |   |<-bytes_len->|<-----tomove------>|
              0   lo         new_hi              new_size
            */
            memmove(buf + lo + bytes_len, buf + hi,
                    Ty_SIZE(self) - hi);
        }
        if (bytearray_resize_lock_held((TyObject *)self,
                               Ty_SIZE(self) + growth) < 0) {
            /* Issue #19578: Handling the memory allocation failure here is
               tricky here because the bytearray object has already been
               modified. Depending on growth and lo, the behaviour is
               different.

               If growth < 0 and lo != 0, the operation is completed, but a
               MemoryError is still raised and the memory block is not
               shrunk. Otherwise, the bytearray is restored in its previous
               state and a MemoryError is raised. */
            if (lo == 0) {
                self->ob_start += growth;
                return -1;
            }
            /* memmove() removed bytes, the bytearray object cannot be
               restored in its previous state. */
            Ty_SET_SIZE(self, Ty_SIZE(self) + growth);
            res = -1;
        }
        buf = TyByteArray_AS_STRING(self);
    }
    else if (growth > 0) {
        if (Ty_SIZE(self) > (Ty_ssize_t)PY_SSIZE_T_MAX - growth) {
            TyErr_NoMemory();
            return -1;
        }

        if (bytearray_resize_lock_held((TyObject *)self,
                               Ty_SIZE(self) + growth) < 0) {
            return -1;
        }
        buf = TyByteArray_AS_STRING(self);
        /* Make the place for the additional bytes */
        /*
          0   lo        hi               old_size
          |   |<-avail->|<-----tomove------>|
          |   |<---bytes_len-->|<-----tomove------>|
          0   lo            new_hi              new_size
         */
        memmove(buf + lo + bytes_len, buf + hi,
                Ty_SIZE(self) - lo - bytes_len);
    }

    if (bytes_len > 0)
        memcpy(buf + lo, bytes, bytes_len);
    return res;
}

static int
bytearray_setslice(PyByteArrayObject *self, Ty_ssize_t lo, Ty_ssize_t hi,
               TyObject *values)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(self);
    Ty_ssize_t needed;
    void *bytes;
    Ty_buffer vbytes;
    int res = 0;

    vbytes.len = -1;
    if (values == (TyObject *)self) {
        /* Make a copy and call this function recursively */
        int err;
        values = TyByteArray_FromStringAndSize(TyByteArray_AS_STRING(values),
                                               TyByteArray_GET_SIZE(values));
        if (values == NULL)
            return -1;
        err = bytearray_setslice(self, lo, hi, values);
        Ty_DECREF(values);
        return err;
    }
    if (values == NULL) {
        /* del b[lo:hi] */
        bytes = NULL;
        needed = 0;
    }
    else {
        if (PyObject_GetBuffer(values, &vbytes, PyBUF_SIMPLE) != 0) {
            TyErr_Format(TyExc_TypeError,
                         "can't set bytearray slice from %.100s",
                         Ty_TYPE(values)->tp_name);
            return -1;
        }
        needed = vbytes.len;
        bytes = vbytes.buf;
    }

    if (lo < 0)
        lo = 0;
    if (hi < lo)
        hi = lo;
    if (hi > Ty_SIZE(self))
        hi = Ty_SIZE(self);

    res = bytearray_setslice_linear(self, lo, hi, bytes, needed);
    if (vbytes.len != -1)
        PyBuffer_Release(&vbytes);
    return res;
}

static int
bytearray_setitem_lock_held(TyObject *op, Ty_ssize_t i, TyObject *value)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(op);
    PyByteArrayObject *self = _PyByteArray_CAST(op);

    // GH-91153: We need to do this *before* the size check, in case value has a
    // nasty __index__ method that changes the size of the bytearray:
    int ival = -1;
    if (value && !_getbytevalue(value, &ival)) {
        return -1;
    }

    if (i < 0) {
        i += Ty_SIZE(self);
    }

    if (i < 0 || i >= Ty_SIZE(self)) {
        TyErr_SetString(TyExc_IndexError, "bytearray index out of range");
        return -1;
    }

    if (value == NULL) {
        return bytearray_setslice(self, i, i+1, NULL);
    }

    assert(0 <= ival && ival < 256);
    TyByteArray_AS_STRING(self)[i] = ival;
    return 0;
}

static int
bytearray_setitem(TyObject *op, Ty_ssize_t i, TyObject *value)
{
    int ret;
    Ty_BEGIN_CRITICAL_SECTION(op);
    ret = bytearray_setitem_lock_held(op, i, value);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static int
bytearray_ass_subscript_lock_held(TyObject *op, TyObject *index, TyObject *values)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(op);
    PyByteArrayObject *self = _PyByteArray_CAST(op);
    Ty_ssize_t start, stop, step, slicelen;
    // Do not store a reference to the internal buffer since
    // index.__index__() or _getbytevalue() may alter 'self'.
    // See https://github.com/python/cpython/issues/91153.

    if (_PyIndex_Check(index)) {
        Ty_ssize_t i = PyNumber_AsSsize_t(index, TyExc_IndexError);

        if (i == -1 && TyErr_Occurred()) {
            return -1;
        }

        int ival = -1;

        // GH-91153: We need to do this *before* the size check, in case values
        // has a nasty __index__ method that changes the size of the bytearray:
        if (values && !_getbytevalue(values, &ival)) {
            return -1;
        }

        if (i < 0) {
            i += TyByteArray_GET_SIZE(self);
        }

        if (i < 0 || i >= Ty_SIZE(self)) {
            TyErr_SetString(TyExc_IndexError, "bytearray index out of range");
            return -1;
        }

        if (values == NULL) {
            /* Fall through to slice assignment */
            start = i;
            stop = i + 1;
            step = 1;
            slicelen = 1;
        }
        else {
            assert(0 <= ival && ival < 256);
            TyByteArray_AS_STRING(self)[i] = (char)ival;
            return 0;
        }
    }
    else if (TySlice_Check(index)) {
        if (TySlice_Unpack(index, &start, &stop, &step) < 0) {
            return -1;
        }
        slicelen = TySlice_AdjustIndices(TyByteArray_GET_SIZE(self), &start,
                                         &stop, step);
    }
    else {
        TyErr_Format(TyExc_TypeError,
                     "bytearray indices must be integers or slices, not %.200s",
                      Ty_TYPE(index)->tp_name);
        return -1;
    }

    char *bytes;
    Ty_ssize_t needed;
    if (values == NULL) {
        bytes = NULL;
        needed = 0;
    }
    else if (values == (TyObject *)self || !TyByteArray_Check(values)) {
        int err;
        if (PyNumber_Check(values) || TyUnicode_Check(values)) {
            TyErr_SetString(TyExc_TypeError,
                            "can assign only bytes, buffers, or iterables "
                            "of ints in range(0, 256)");
            return -1;
        }
        /* Make a copy and call this function recursively */
        values = TyByteArray_FromObject(values);
        if (values == NULL)
            return -1;
        err = bytearray_ass_subscript_lock_held((TyObject*)self, index, values);
        Ty_DECREF(values);
        return err;
    }
    else {
        assert(TyByteArray_Check(values));
        bytes = TyByteArray_AS_STRING(values);
        needed = Ty_SIZE(values);
    }

    /* Make sure b[5:2] = ... inserts before 5, not before 2. */
    if ((step < 0 && start < stop) ||
        (step > 0 && start > stop))
    {
        stop = start;
    }

    if (step == 1) {
        return bytearray_setslice_linear(self, start, stop, bytes, needed);
    }
    else {
        if (needed == 0) {
            /* Delete slice */
            size_t cur;
            Ty_ssize_t i;
            char *buf = TyByteArray_AS_STRING(self);

            if (!_canresize(self))
                return -1;

            if (slicelen == 0)
                /* Nothing to do here. */
                return 0;

            if (step < 0) {
                stop = start + 1;
                start = stop + step * (slicelen - 1) - 1;
                step = -step;
            }
            for (cur = start, i = 0;
                 i < slicelen; cur += step, i++) {
                Ty_ssize_t lim = step - 1;

                if (cur + step >= (size_t)TyByteArray_GET_SIZE(self))
                    lim = TyByteArray_GET_SIZE(self) - cur - 1;

                memmove(buf + cur - i,
                        buf + cur + 1, lim);
            }
            /* Move the tail of the bytes, in one chunk */
            cur = start + (size_t)slicelen*step;
            if (cur < (size_t)TyByteArray_GET_SIZE(self)) {
                memmove(buf + cur - slicelen,
                        buf + cur,
                        TyByteArray_GET_SIZE(self) - cur);
            }
            if (bytearray_resize_lock_held((TyObject *)self,
                               TyByteArray_GET_SIZE(self) - slicelen) < 0)
                return -1;

            return 0;
        }
        else {
            /* Assign slice */
            Ty_ssize_t i;
            size_t cur;
            char *buf = TyByteArray_AS_STRING(self);

            if (needed != slicelen) {
                TyErr_Format(TyExc_ValueError,
                             "attempt to assign bytes of size %zd "
                             "to extended slice of size %zd",
                             needed, slicelen);
                return -1;
            }
            for (cur = start, i = 0; i < slicelen; cur += step, i++)
                buf[cur] = bytes[i];
            return 0;
        }
    }
}

static int
bytearray_ass_subscript(TyObject *op, TyObject *index, TyObject *values)
{
    int ret;
    if (values != NULL && TyByteArray_Check(values)) {
        Ty_BEGIN_CRITICAL_SECTION2(op, values);
        ret = bytearray_ass_subscript_lock_held(op, index, values);
        Ty_END_CRITICAL_SECTION2();
    }
    else {
        Ty_BEGIN_CRITICAL_SECTION(op);
        ret = bytearray_ass_subscript_lock_held(op, index, values);
        Ty_END_CRITICAL_SECTION();
    }
    return ret;
}

/*[clinic input]
bytearray.__init__

    source as arg: object = NULL
    encoding: str = NULL
    errors: str = NULL

[clinic start generated code]*/

static int
bytearray___init___impl(PyByteArrayObject *self, TyObject *arg,
                        const char *encoding, const char *errors)
/*[clinic end generated code: output=4ce1304649c2f8b3 input=1141a7122eefd7b9]*/
{
    Ty_ssize_t count;
    TyObject *it;
    TyObject *(*iternext)(TyObject *);

    if (Ty_SIZE(self) != 0) {
        /* Empty previous contents (yes, do this first of all!) */
        if (TyByteArray_Resize((TyObject *)self, 0) < 0)
            return -1;
    }

    /* Make a quick exit if no first argument */
    if (arg == NULL) {
        if (encoding != NULL || errors != NULL) {
            TyErr_SetString(TyExc_TypeError,
                            encoding != NULL ?
                            "encoding without a string argument" :
                            "errors without a string argument");
            return -1;
        }
        return 0;
    }

    if (TyUnicode_Check(arg)) {
        /* Encode via the codec registry */
        TyObject *encoded, *new;
        if (encoding == NULL) {
            TyErr_SetString(TyExc_TypeError,
                            "string argument without an encoding");
            return -1;
        }
        encoded = TyUnicode_AsEncodedString(arg, encoding, errors);
        if (encoded == NULL)
            return -1;
        assert(TyBytes_Check(encoded));
        new = bytearray_iconcat((TyObject*)self, encoded);
        Ty_DECREF(encoded);
        if (new == NULL)
            return -1;
        Ty_DECREF(new);
        return 0;
    }

    /* If it's not unicode, there can't be encoding or errors */
    if (encoding != NULL || errors != NULL) {
        TyErr_SetString(TyExc_TypeError,
                        encoding != NULL ?
                        "encoding without a string argument" :
                        "errors without a string argument");
        return -1;
    }

    /* Is it an int? */
    if (_PyIndex_Check(arg)) {
        count = PyNumber_AsSsize_t(arg, TyExc_OverflowError);
        if (count == -1 && TyErr_Occurred()) {
            if (!TyErr_ExceptionMatches(TyExc_TypeError))
                return -1;
            TyErr_Clear();  /* fall through */
        }
        else {
            if (count < 0) {
                TyErr_SetString(TyExc_ValueError, "negative count");
                return -1;
            }
            if (count > 0) {
                if (TyByteArray_Resize((TyObject *)self, count))
                    return -1;
                memset(TyByteArray_AS_STRING(self), 0, count);
            }
            return 0;
        }
    }

    /* Use the buffer API */
    if (PyObject_CheckBuffer(arg)) {
        Ty_ssize_t size;
        Ty_buffer view;
        if (PyObject_GetBuffer(arg, &view, PyBUF_FULL_RO) < 0)
            return -1;
        size = view.len;
        if (TyByteArray_Resize((TyObject *)self, size) < 0) goto fail;
        if (PyBuffer_ToContiguous(TyByteArray_AS_STRING(self),
            &view, size, 'C') < 0)
            goto fail;
        PyBuffer_Release(&view);
        return 0;
    fail:
        PyBuffer_Release(&view);
        return -1;
    }

    if (TyList_CheckExact(arg) || TyTuple_CheckExact(arg)) {
        Ty_ssize_t size = PySequence_Fast_GET_SIZE(arg);
        if (TyByteArray_Resize((TyObject *)self, size) < 0) {
            return -1;
        }
        TyObject **items = PySequence_Fast_ITEMS(arg);
        char *s = TyByteArray_AS_STRING(self);
        for (Ty_ssize_t i = 0; i < size; i++) {
            int value;
            if (!TyLong_CheckExact(items[i])) {
                /* Resize to 0 and go through slowpath */
                if (Ty_SIZE(self) != 0) {
                   if (TyByteArray_Resize((TyObject *)self, 0) < 0) {
                       return -1;
                   }
                }
                goto slowpath;
            }
            int rc = _getbytevalue(items[i], &value);
            if (!rc) {
                return -1;
            }
            s[i] = value;
        }
        return 0;
    }
slowpath:
    /* Get the iterator */
    it = PyObject_GetIter(arg);
    if (it == NULL) {
        if (TyErr_ExceptionMatches(TyExc_TypeError)) {
            TyErr_Format(TyExc_TypeError,
                         "cannot convert '%.200s' object to bytearray",
                         Ty_TYPE(arg)->tp_name);
        }
        return -1;
    }
    iternext = *Ty_TYPE(it)->tp_iternext;

    /* Run the iterator to exhaustion */
    for (;;) {
        TyObject *item;
        int rc, value;

        /* Get the next item */
        item = iternext(it);
        if (item == NULL) {
            if (TyErr_Occurred()) {
                if (!TyErr_ExceptionMatches(TyExc_StopIteration))
                    goto error;
                TyErr_Clear();
            }
            break;
        }

        /* Interpret it as an int (__index__) */
        rc = _getbytevalue(item, &value);
        Ty_DECREF(item);
        if (!rc)
            goto error;

        /* Append the byte */
        if (Ty_SIZE(self) + 1 < self->ob_alloc) {
            Ty_SET_SIZE(self, Ty_SIZE(self) + 1);
            TyByteArray_AS_STRING(self)[Ty_SIZE(self)] = '\0';
        }
        else if (TyByteArray_Resize((TyObject *)self, Ty_SIZE(self)+1) < 0)
            goto error;
        TyByteArray_AS_STRING(self)[Ty_SIZE(self)-1] = value;
    }

    /* Clean up and return success */
    Ty_DECREF(it);
    return 0;

 error:
    /* Error handling when it != NULL */
    Ty_DECREF(it);
    return -1;
}

/* Mostly copied from string_repr, but without the
   "smart quote" functionality. */
static TyObject *
bytearray_repr_lock_held(TyObject *op)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(op);
    PyByteArrayObject *self = _PyByteArray_CAST(op);
    const char *className = _TyType_Name(Ty_TYPE(self));
    const char *quote_prefix = "(b";
    const char *quote_postfix = ")";
    Ty_ssize_t length = Ty_SIZE(self);
    /* 6 == strlen(quote_prefix) + 2 + strlen(quote_postfix) + 1 */
    Ty_ssize_t newsize;
    TyObject *v;
    Ty_ssize_t i;
    char *bytes;
    char c;
    char *p;
    int quote;
    char *test, *start;
    char *buffer;

    newsize = strlen(className);
    if (length > (PY_SSIZE_T_MAX - 6 - newsize) / 4) {
        TyErr_SetString(TyExc_OverflowError,
            "bytearray object is too large to make repr");
        return NULL;
    }

    newsize += 6 + length * 4;
    buffer = TyMem_Malloc(newsize);
    if (buffer == NULL) {
        TyErr_NoMemory();
        return NULL;
    }

    /* Figure out which quote to use; single is preferred */
    quote = '\'';
    start = TyByteArray_AS_STRING(self);
    for (test = start; test < start+length; ++test) {
        if (*test == '"') {
            quote = '\''; /* back to single */
            break;
        }
        else if (*test == '\'')
            quote = '"';
    }

    p = buffer;
    while (*className)
        *p++ = *className++;
    while (*quote_prefix)
        *p++ = *quote_prefix++;
    *p++ = quote;

    bytes = TyByteArray_AS_STRING(self);
    for (i = 0; i < length; i++) {
        /* There's at least enough room for a hex escape
           and a closing quote. */
        assert(newsize - (p - buffer) >= 5);
        c = bytes[i];
        if (c == '\'' || c == '\\')
            *p++ = '\\', *p++ = c;
        else if (c == '\t')
            *p++ = '\\', *p++ = 't';
        else if (c == '\n')
            *p++ = '\\', *p++ = 'n';
        else if (c == '\r')
            *p++ = '\\', *p++ = 'r';
        else if (c == 0)
            *p++ = '\\', *p++ = 'x', *p++ = '0', *p++ = '0';
        else if (c < ' ' || c >= 0x7f) {
            *p++ = '\\';
            *p++ = 'x';
            *p++ = Ty_hexdigits[(c & 0xf0) >> 4];
            *p++ = Ty_hexdigits[c & 0xf];
        }
        else
            *p++ = c;
    }
    assert(newsize - (p - buffer) >= 1);
    *p++ = quote;
    while (*quote_postfix) {
       *p++ = *quote_postfix++;
    }

    v = TyUnicode_FromStringAndSize(buffer, p - buffer);
    TyMem_Free(buffer);
    return v;
}

static TyObject *
bytearray_repr(TyObject *op)
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(op);
    ret = bytearray_repr_lock_held(op);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_str(TyObject *op)
{
    if (_Ty_GetConfig()->bytes_warning) {
        if (TyErr_WarnEx(TyExc_BytesWarning,
                         "str() on a bytearray instance", 1)) {
                return NULL;
        }
    }
    return bytearray_repr(op);
}

static TyObject *
bytearray_richcompare(TyObject *self, TyObject *other, int op)
{
    Ty_ssize_t self_size, other_size;
    Ty_buffer self_bytes, other_bytes;
    int cmp;

    if (!PyObject_CheckBuffer(self) || !PyObject_CheckBuffer(other)) {
        if (TyUnicode_Check(self) || TyUnicode_Check(other)) {
            if (_Ty_GetConfig()->bytes_warning && (op == Py_EQ || op == Py_NE)) {
                if (TyErr_WarnEx(TyExc_BytesWarning,
                                "Comparison between bytearray and string", 1))
                    return NULL;
            }
        }
        Py_RETURN_NOTIMPLEMENTED;
    }

    /* Bytearrays can be compared to anything that supports the buffer API. */
    if (PyObject_GetBuffer(self, &self_bytes, PyBUF_SIMPLE) != 0) {
        TyErr_Clear();
        Py_RETURN_NOTIMPLEMENTED;
    }
    self_size = self_bytes.len;

    if (PyObject_GetBuffer(other, &other_bytes, PyBUF_SIMPLE) != 0) {
        TyErr_Clear();
        PyBuffer_Release(&self_bytes);
        Py_RETURN_NOTIMPLEMENTED;
    }
    other_size = other_bytes.len;

    if (self_size != other_size && (op == Py_EQ || op == Py_NE)) {
        /* Shortcut: if the lengths differ, the objects differ */
        PyBuffer_Release(&self_bytes);
        PyBuffer_Release(&other_bytes);
        return TyBool_FromLong((op == Py_NE));
    }
    else {
        cmp = memcmp(self_bytes.buf, other_bytes.buf,
                     Ty_MIN(self_size, other_size));
        /* In ISO C, memcmp() guarantees to use unsigned bytes! */

        PyBuffer_Release(&self_bytes);
        PyBuffer_Release(&other_bytes);

        if (cmp != 0) {
            Py_RETURN_RICHCOMPARE(cmp, 0, op);
        }

        Py_RETURN_RICHCOMPARE(self_size, other_size, op);
    }

}

static void
bytearray_dealloc(TyObject *op)
{
    PyByteArrayObject *self = _PyByteArray_CAST(op);
    if (self->ob_exports > 0) {
        TyErr_SetString(TyExc_SystemError,
                        "deallocated bytearray object has exported buffers");
        TyErr_Print();
    }
    if (self->ob_bytes != 0) {
        TyMem_Free(self->ob_bytes);
    }
    Ty_TYPE(self)->tp_free((TyObject *)self);
}


/* -------------------------------------------------------------------- */
/* Methods */

#define STRINGLIB_IS_UNICODE 0
#define FASTSEARCH fastsearch
#define STRINGLIB(F) stringlib_##F
#define STRINGLIB_CHAR char
#define STRINGLIB_SIZEOF_CHAR 1
#define STRINGLIB_LEN TyByteArray_GET_SIZE
#define STRINGLIB_STR TyByteArray_AS_STRING
#define STRINGLIB_NEW TyByteArray_FromStringAndSize
#define STRINGLIB_ISSPACE Ty_ISSPACE
#define STRINGLIB_ISLINEBREAK(x) ((x == '\n') || (x == '\r'))
#define STRINGLIB_CHECK_EXACT TyByteArray_CheckExact
#define STRINGLIB_FAST_MEMCHR memchr
#define STRINGLIB_MUTABLE 1

#include "stringlib/fastsearch.h"
#include "stringlib/count.h"
#include "stringlib/find.h"
#include "stringlib/join.h"
#include "stringlib/partition.h"
#include "stringlib/split.h"
#include "stringlib/ctype.h"
#include "stringlib/transmogrify.h"


/*[clinic input]
@critical_section
@text_signature "($self, sub[, start[, end]], /)"
bytearray.find

    sub: object
    start: slice_index(accept={int, NoneType}, c_default='0') = None
         Optional start position. Default: start of the bytes.
    end: slice_index(accept={int, NoneType}, c_default='PY_SSIZE_T_MAX') = None
         Optional stop position. Default: end of the bytes.
    /

Return the lowest index in B where subsection 'sub' is found, such that 'sub' is contained within B[start:end].

Return -1 on failure.
[clinic start generated code]*/

static TyObject *
bytearray_find_impl(PyByteArrayObject *self, TyObject *sub, Ty_ssize_t start,
                    Ty_ssize_t end)
/*[clinic end generated code: output=413e1cab2ae87da0 input=1de9f4558df68336]*/
{
    return _Ty_bytes_find(TyByteArray_AS_STRING(self), TyByteArray_GET_SIZE(self),
                          sub, start, end);
}

/*[clinic input]
@critical_section
bytearray.count = bytearray.find

Return the number of non-overlapping occurrences of subsection 'sub' in bytes B[start:end].
[clinic start generated code]*/

static TyObject *
bytearray_count_impl(PyByteArrayObject *self, TyObject *sub,
                     Ty_ssize_t start, Ty_ssize_t end)
/*[clinic end generated code: output=a21ee2692e4f1233 input=2608c30644614724]*/
{
    return _Ty_bytes_count(TyByteArray_AS_STRING(self), TyByteArray_GET_SIZE(self),
                           sub, start, end);
}

/*[clinic input]
bytearray.clear

Remove all items from the bytearray.
[clinic start generated code]*/

static TyObject *
bytearray_clear_impl(PyByteArrayObject *self)
/*[clinic end generated code: output=85c2fe6aede0956c input=ed6edae9de447ac4]*/
{
    if (TyByteArray_Resize((TyObject *)self, 0) < 0)
        return NULL;
    Py_RETURN_NONE;
}

/*[clinic input]
@critical_section
bytearray.copy

Return a copy of B.
[clinic start generated code]*/

static TyObject *
bytearray_copy_impl(PyByteArrayObject *self)
/*[clinic end generated code: output=68cfbcfed484c132 input=b96f8b01f73851ad]*/
{
    return TyByteArray_FromStringAndSize(TyByteArray_AS_STRING((TyObject *)self),
                                         TyByteArray_GET_SIZE(self));
}

/*[clinic input]
@critical_section
bytearray.index = bytearray.find

Return the lowest index in B where subsection 'sub' is found, such that 'sub' is contained within B[start:end].

Raise ValueError if the subsection is not found.
[clinic start generated code]*/

static TyObject *
bytearray_index_impl(PyByteArrayObject *self, TyObject *sub,
                     Ty_ssize_t start, Ty_ssize_t end)
/*[clinic end generated code: output=067a1e78efc672a7 input=0086ba0ab9bf44a5]*/
{
    return _Ty_bytes_index(TyByteArray_AS_STRING(self), TyByteArray_GET_SIZE(self),
                           sub, start, end);
}

/*[clinic input]
@critical_section
bytearray.rfind = bytearray.find

Return the highest index in B where subsection 'sub' is found, such that 'sub' is contained within B[start:end].

Return -1 on failure.
[clinic start generated code]*/

static TyObject *
bytearray_rfind_impl(PyByteArrayObject *self, TyObject *sub,
                     Ty_ssize_t start, Ty_ssize_t end)
/*[clinic end generated code: output=51bf886f932b283c input=ac73593305d5c1d1]*/
{
    return _Ty_bytes_rfind(TyByteArray_AS_STRING(self), TyByteArray_GET_SIZE(self),
                           sub, start, end);
}

/*[clinic input]
@critical_section
bytearray.rindex = bytearray.find

Return the highest index in B where subsection 'sub' is found, such that 'sub' is contained within B[start:end].

Raise ValueError if the subsection is not found.
[clinic start generated code]*/

static TyObject *
bytearray_rindex_impl(PyByteArrayObject *self, TyObject *sub,
                      Ty_ssize_t start, Ty_ssize_t end)
/*[clinic end generated code: output=38e1cf66bafb08b9 input=0cf331bf5ebe0e91]*/
{
    return _Ty_bytes_rindex(TyByteArray_AS_STRING(self), TyByteArray_GET_SIZE(self),
                            sub, start, end);
}

static int
bytearray_contains(TyObject *self, TyObject *arg)
{
    int ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = _Ty_bytes_contains(TyByteArray_AS_STRING(self),
                             TyByteArray_GET_SIZE(self),
                             arg);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

/*[clinic input]
@critical_section
@text_signature "($self, prefix[, start[, end]], /)"
bytearray.startswith

    prefix as subobj: object
        A bytes or a tuple of bytes to try.
    start: slice_index(accept={int, NoneType}, c_default='0') = None
        Optional start position. Default: start of the bytearray.
    end: slice_index(accept={int, NoneType}, c_default='PY_SSIZE_T_MAX') = None
        Optional stop position. Default: end of the bytearray.
    /

Return True if the bytearray starts with the specified prefix, False otherwise.
[clinic start generated code]*/

static TyObject *
bytearray_startswith_impl(PyByteArrayObject *self, TyObject *subobj,
                          Ty_ssize_t start, Ty_ssize_t end)
/*[clinic end generated code: output=a3d9b6d44d3662a6 input=ea8d036d09df34b2]*/
{
    return _Ty_bytes_startswith(TyByteArray_AS_STRING(self), TyByteArray_GET_SIZE(self),
                                subobj, start, end);
}

/*[clinic input]
@critical_section
@text_signature "($self, suffix[, start[, end]], /)"
bytearray.endswith

    suffix as subobj: object
        A bytes or a tuple of bytes to try.
    start: slice_index(accept={int, NoneType}, c_default='0') = None
         Optional start position. Default: start of the bytearray.
    end: slice_index(accept={int, NoneType}, c_default='PY_SSIZE_T_MAX') = None
         Optional stop position. Default: end of the bytearray.
    /

Return True if the bytearray ends with the specified suffix, False otherwise.
[clinic start generated code]*/

static TyObject *
bytearray_endswith_impl(PyByteArrayObject *self, TyObject *subobj,
                        Ty_ssize_t start, Ty_ssize_t end)
/*[clinic end generated code: output=e75ea8c227954caa input=c61b90bb23a689ce]*/
{
    return _Ty_bytes_endswith(TyByteArray_AS_STRING(self), TyByteArray_GET_SIZE(self),
                              subobj, start, end);
}

/*[clinic input]
@critical_section
bytearray.removeprefix as bytearray_removeprefix

    prefix: Ty_buffer
    /

Return a bytearray with the given prefix string removed if present.

If the bytearray starts with the prefix string, return
bytearray[len(prefix):].  Otherwise, return a copy of the original
bytearray.
[clinic start generated code]*/

static TyObject *
bytearray_removeprefix_impl(PyByteArrayObject *self, Ty_buffer *prefix)
/*[clinic end generated code: output=6cabc585e7f502e0 input=4323ba6d275fe7a8]*/
{
    const char *self_start = TyByteArray_AS_STRING(self);
    Ty_ssize_t self_len = TyByteArray_GET_SIZE(self);
    const char *prefix_start = prefix->buf;
    Ty_ssize_t prefix_len = prefix->len;

    if (self_len >= prefix_len
        && memcmp(self_start, prefix_start, prefix_len) == 0)
    {
        return TyByteArray_FromStringAndSize(self_start + prefix_len,
                                             self_len - prefix_len);
    }

    return TyByteArray_FromStringAndSize(self_start, self_len);
}

/*[clinic input]
@critical_section
bytearray.removesuffix as bytearray_removesuffix

    suffix: Ty_buffer
    /

Return a bytearray with the given suffix string removed if present.

If the bytearray ends with the suffix string and that suffix is not
empty, return bytearray[:-len(suffix)].  Otherwise, return a copy of
the original bytearray.
[clinic start generated code]*/

static TyObject *
bytearray_removesuffix_impl(PyByteArrayObject *self, Ty_buffer *suffix)
/*[clinic end generated code: output=2bc8cfb79de793d3 input=f71ba2e1a40c47dd]*/
{
    const char *self_start = TyByteArray_AS_STRING(self);
    Ty_ssize_t self_len = TyByteArray_GET_SIZE(self);
    const char *suffix_start = suffix->buf;
    Ty_ssize_t suffix_len = suffix->len;

    if (self_len >= suffix_len
        && memcmp(self_start + self_len - suffix_len,
                  suffix_start, suffix_len) == 0)
    {
        return TyByteArray_FromStringAndSize(self_start,
                                             self_len - suffix_len);
    }

    return TyByteArray_FromStringAndSize(self_start, self_len);
}


/*[clinic input]
bytearray.resize
    size: Ty_ssize_t
        New size to resize to..
    /
Resize the internal buffer of bytearray to len.
[clinic start generated code]*/

static TyObject *
bytearray_resize_impl(PyByteArrayObject *self, Ty_ssize_t size)
/*[clinic end generated code: output=f73524922990b2d9 input=75fd4d17c4aa47d3]*/
{
    Ty_ssize_t start_size = TyByteArray_GET_SIZE(self);
    int result = TyByteArray_Resize((TyObject *)self, size);
    if (result < 0) {
        return NULL;
    }
    // Set new bytes to null bytes
    if (size > start_size) {
        memset(TyByteArray_AS_STRING(self) + start_size, 0, size - start_size);
    }
    Py_RETURN_NONE;
}


/*[clinic input]
@critical_section
bytearray.translate

    table: object
        Translation table, which must be a bytes object of length 256.
    /
    delete as deletechars: object(c_default="NULL") = b''

Return a copy with each character mapped by the given translation table.

All characters occurring in the optional argument delete are removed.
The remaining characters are mapped through the given translation table.
[clinic start generated code]*/

static TyObject *
bytearray_translate_impl(PyByteArrayObject *self, TyObject *table,
                         TyObject *deletechars)
/*[clinic end generated code: output=b6a8f01c2a74e446 input=cd6fa93ca04e05bc]*/
{
    char *input, *output;
    const char *table_chars;
    Ty_ssize_t i, c;
    TyObject *input_obj = (TyObject*)self;
    const char *output_start;
    Ty_ssize_t inlen;
    TyObject *result = NULL;
    int trans_table[256];
    Ty_buffer vtable, vdel;

    if (table == Ty_None) {
        table_chars = NULL;
        table = NULL;
    } else if (PyObject_GetBuffer(table, &vtable, PyBUF_SIMPLE) != 0) {
        return NULL;
    } else {
        if (vtable.len != 256) {
            TyErr_SetString(TyExc_ValueError,
                            "translation table must be 256 characters long");
            PyBuffer_Release(&vtable);
            return NULL;
        }
        table_chars = (const char*)vtable.buf;
    }

    if (deletechars != NULL) {
        if (PyObject_GetBuffer(deletechars, &vdel, PyBUF_SIMPLE) != 0) {
            if (table != NULL)
                PyBuffer_Release(&vtable);
            return NULL;
        }
    }
    else {
        vdel.buf = NULL;
        vdel.len = 0;
    }

    inlen = TyByteArray_GET_SIZE(input_obj);
    result = TyByteArray_FromStringAndSize((char *)NULL, inlen);
    if (result == NULL)
        goto done;
    output_start = output = TyByteArray_AS_STRING(result);
    input = TyByteArray_AS_STRING(input_obj);

    if (vdel.len == 0 && table_chars != NULL) {
        /* If no deletions are required, use faster code */
        for (i = inlen; --i >= 0; ) {
            c = Ty_CHARMASK(*input++);
            *output++ = table_chars[c];
        }
        goto done;
    }

    if (table_chars == NULL) {
        for (i = 0; i < 256; i++)
            trans_table[i] = Ty_CHARMASK(i);
    } else {
        for (i = 0; i < 256; i++)
            trans_table[i] = Ty_CHARMASK(table_chars[i]);
    }

    for (i = 0; i < vdel.len; i++)
        trans_table[(int) Ty_CHARMASK( ((unsigned char*)vdel.buf)[i] )] = -1;

    for (i = inlen; --i >= 0; ) {
        c = Ty_CHARMASK(*input++);
        if (trans_table[c] != -1)
            *output++ = (char)trans_table[c];
    }
    /* Fix the size of the resulting bytearray */
    if (inlen > 0)
        if (TyByteArray_Resize(result, output - output_start) < 0) {
            Ty_CLEAR(result);
            goto done;
        }

done:
    if (table != NULL)
        PyBuffer_Release(&vtable);
    if (deletechars != NULL)
        PyBuffer_Release(&vdel);
    return result;
}


/*[clinic input]

@staticmethod
bytearray.maketrans

    frm: Ty_buffer
    to: Ty_buffer
    /

Return a translation table usable for the bytes or bytearray translate method.

The returned table will be one where each byte in frm is mapped to the byte at
the same position in to.

The bytes objects frm and to must be of the same length.
[clinic start generated code]*/

static TyObject *
bytearray_maketrans_impl(Ty_buffer *frm, Ty_buffer *to)
/*[clinic end generated code: output=1df267d99f56b15e input=b10de38c85950a63]*/
{
    return _Ty_bytes_maketrans(frm, to);
}


/*[clinic input]
@critical_section
bytearray.replace

    old: Ty_buffer
    new: Ty_buffer
    count: Ty_ssize_t = -1
        Maximum number of occurrences to replace.
        -1 (the default value) means replace all occurrences.
    /

Return a copy with all occurrences of substring old replaced by new.

If the optional argument count is given, only the first count occurrences are
replaced.
[clinic start generated code]*/

static TyObject *
bytearray_replace_impl(PyByteArrayObject *self, Ty_buffer *old,
                       Ty_buffer *new, Ty_ssize_t count)
/*[clinic end generated code: output=d39884c4dc59412a input=6992755672c8a807]*/
{
    return stringlib_replace((TyObject *)self,
                             (const char *)old->buf, old->len,
                             (const char *)new->buf, new->len, count);
}

/*[clinic input]
@critical_section
bytearray.split

    sep: object = None
        The delimiter according which to split the bytearray.
        None (the default value) means split on ASCII whitespace characters
        (space, tab, return, newline, formfeed, vertical tab).
    maxsplit: Ty_ssize_t = -1
        Maximum number of splits to do.
        -1 (the default value) means no limit.

Return a list of the sections in the bytearray, using sep as the delimiter.
[clinic start generated code]*/

static TyObject *
bytearray_split_impl(PyByteArrayObject *self, TyObject *sep,
                     Ty_ssize_t maxsplit)
/*[clinic end generated code: output=833e2cf385d9a04d input=1c367486b9938909]*/
{
    Ty_ssize_t len = TyByteArray_GET_SIZE(self), n;
    const char *s = TyByteArray_AS_STRING(self), *sub;
    TyObject *list;
    Ty_buffer vsub;

    if (maxsplit < 0)
        maxsplit = PY_SSIZE_T_MAX;

    if (sep == Ty_None)
        return stringlib_split_whitespace((TyObject*) self, s, len, maxsplit);

    if (PyObject_GetBuffer(sep, &vsub, PyBUF_SIMPLE) != 0)
        return NULL;
    sub = vsub.buf;
    n = vsub.len;

    list = stringlib_split(
        (TyObject*) self, s, len, sub, n, maxsplit
        );
    PyBuffer_Release(&vsub);
    return list;
}

/*[clinic input]
@critical_section
bytearray.partition

    sep: object
    /

Partition the bytearray into three parts using the given separator.

This will search for the separator sep in the bytearray. If the separator is
found, returns a 3-tuple containing the part before the separator, the
separator itself, and the part after it as new bytearray objects.

If the separator is not found, returns a 3-tuple containing the copy of the
original bytearray object and two empty bytearray objects.
[clinic start generated code]*/

static TyObject *
bytearray_partition_impl(PyByteArrayObject *self, TyObject *sep)
/*[clinic end generated code: output=b5fa1e03f10cfccb input=632855f986733f34]*/
{
    TyObject *bytesep, *result;

    bytesep = _PyByteArray_FromBufferObject(sep);
    if (! bytesep)
        return NULL;

    result = stringlib_partition(
            (TyObject*) self,
            TyByteArray_AS_STRING(self), TyByteArray_GET_SIZE(self),
            bytesep,
            TyByteArray_AS_STRING(bytesep), TyByteArray_GET_SIZE(bytesep)
            );

    Ty_DECREF(bytesep);
    return result;
}

/*[clinic input]
@critical_section
bytearray.rpartition

    sep: object
    /

Partition the bytearray into three parts using the given separator.

This will search for the separator sep in the bytearray, starting at the end.
If the separator is found, returns a 3-tuple containing the part before the
separator, the separator itself, and the part after it as new bytearray
objects.

If the separator is not found, returns a 3-tuple containing two empty bytearray
objects and the copy of the original bytearray object.
[clinic start generated code]*/

static TyObject *
bytearray_rpartition_impl(PyByteArrayObject *self, TyObject *sep)
/*[clinic end generated code: output=0186ce7b1ef61289 input=4318e3d125497450]*/
{
    TyObject *bytesep, *result;

    bytesep = _PyByteArray_FromBufferObject(sep);
    if (! bytesep)
        return NULL;

    result = stringlib_rpartition(
            (TyObject*) self,
            TyByteArray_AS_STRING(self), TyByteArray_GET_SIZE(self),
            bytesep,
            TyByteArray_AS_STRING(bytesep), TyByteArray_GET_SIZE(bytesep)
            );

    Ty_DECREF(bytesep);
    return result;
}

/*[clinic input]
@critical_section
bytearray.rsplit = bytearray.split

Return a list of the sections in the bytearray, using sep as the delimiter.

Splitting is done starting at the end of the bytearray and working to the front.
[clinic start generated code]*/

static TyObject *
bytearray_rsplit_impl(PyByteArrayObject *self, TyObject *sep,
                      Ty_ssize_t maxsplit)
/*[clinic end generated code: output=a55e0b5a03cb6190 input=3cd513c2b94a53c1]*/
{
    Ty_ssize_t len = TyByteArray_GET_SIZE(self), n;
    const char *s = TyByteArray_AS_STRING(self), *sub;
    TyObject *list;
    Ty_buffer vsub;

    if (maxsplit < 0)
        maxsplit = PY_SSIZE_T_MAX;

    if (sep == Ty_None)
        return stringlib_rsplit_whitespace((TyObject*) self, s, len, maxsplit);

    if (PyObject_GetBuffer(sep, &vsub, PyBUF_SIMPLE) != 0)
        return NULL;
    sub = vsub.buf;
    n = vsub.len;

    list = stringlib_rsplit(
        (TyObject*) self, s, len, sub, n, maxsplit
        );
    PyBuffer_Release(&vsub);
    return list;
}

/*[clinic input]
@critical_section
bytearray.reverse

Reverse the order of the values in B in place.
[clinic start generated code]*/

static TyObject *
bytearray_reverse_impl(PyByteArrayObject *self)
/*[clinic end generated code: output=9f7616f29ab309d3 input=2f3d5ce3180ffc53]*/
{
    char swap, *head, *tail;
    Ty_ssize_t i, j, n = Ty_SIZE(self);

    j = n / 2;
    head = TyByteArray_AS_STRING(self);
    tail = head + n - 1;
    for (i = 0; i < j; i++) {
        swap = *head;
        *head++ = *tail;
        *tail-- = swap;
    }

    Py_RETURN_NONE;
}


/*[python input]
class bytesvalue_converter(CConverter):
    type = 'int'
    converter = '_getbytevalue'
[python start generated code]*/
/*[python end generated code: output=da39a3ee5e6b4b0d input=29c2e7c26c212812]*/


/*[clinic input]
@critical_section
bytearray.insert

    index: Ty_ssize_t
        The index where the value is to be inserted.
    item: bytesvalue
        The item to be inserted.
    /

Insert a single item into the bytearray before the given index.
[clinic start generated code]*/

static TyObject *
bytearray_insert_impl(PyByteArrayObject *self, Ty_ssize_t index, int item)
/*[clinic end generated code: output=76c775a70e7b07b7 input=b3e14ede546dd8cc]*/
{
    Ty_ssize_t n = Ty_SIZE(self);
    char *buf;

    if (n == PY_SSIZE_T_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "cannot add more objects to bytearray");
        return NULL;
    }
    if (bytearray_resize_lock_held((TyObject *)self, n + 1) < 0)
        return NULL;
    buf = TyByteArray_AS_STRING(self);

    if (index < 0) {
        index += n;
        if (index < 0)
            index = 0;
    }
    if (index > n)
        index = n;
    memmove(buf + index + 1, buf + index, n - index);
    buf[index] = item;

    Py_RETURN_NONE;
}

static TyObject *
bytearray_isalnum(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_isalnum(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_isalpha(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_isalpha(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_isascii(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_isascii(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_isdigit(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_isdigit(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_islower(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_islower(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_isspace(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_isspace(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_istitle(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_istitle(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_isupper(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_isupper(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

/*[clinic input]
@critical_section
bytearray.append

    item: bytesvalue
        The item to be appended.
    /

Append a single item to the end of the bytearray.
[clinic start generated code]*/

static TyObject *
bytearray_append_impl(PyByteArrayObject *self, int item)
/*[clinic end generated code: output=a154e19ed1886cb6 input=a874689bac8bd352]*/
{
    Ty_ssize_t n = Ty_SIZE(self);

    if (n == PY_SSIZE_T_MAX) {
        TyErr_SetString(TyExc_OverflowError,
                        "cannot add more objects to bytearray");
        return NULL;
    }
    if (bytearray_resize_lock_held((TyObject *)self, n + 1) < 0)
        return NULL;

    TyByteArray_AS_STRING(self)[n] = item;

    Py_RETURN_NONE;
}

static TyObject *
bytearray_capitalize(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_capitalize(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_center(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_center(self, args, nargs);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_expandtabs(TyObject *self, TyObject *const *args, Ty_ssize_t nargs, TyObject *kwnames)
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_expandtabs(self, args, nargs, kwnames);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

/*[clinic input]
@critical_section
bytearray.extend

    iterable_of_ints: object
        The iterable of items to append.
    /

Append all the items from the iterator or sequence to the end of the bytearray.
[clinic start generated code]*/

static TyObject *
bytearray_extend_impl(PyByteArrayObject *self, TyObject *iterable_of_ints)
/*[clinic end generated code: output=2f25e0ce72b98748 input=86e65beaba444650]*/
{
    TyObject *it, *item, *bytearray_obj;
    Ty_ssize_t buf_size = 0, len = 0;
    int value;
    char *buf;

    /* bytearray_setslice code only accepts something supporting PEP 3118. */
    if (PyObject_CheckBuffer(iterable_of_ints)) {
        if (bytearray_setslice(self, Ty_SIZE(self), Ty_SIZE(self), iterable_of_ints) == -1)
            return NULL;

        Py_RETURN_NONE;
    }

    it = PyObject_GetIter(iterable_of_ints);
    if (it == NULL) {
        if (TyErr_ExceptionMatches(TyExc_TypeError)) {
            TyErr_Format(TyExc_TypeError,
                         "can't extend bytearray with %.100s",
                         Ty_TYPE(iterable_of_ints)->tp_name);
        }
        return NULL;
    }

    /* Try to determine the length of the argument. 32 is arbitrary. */
    buf_size = PyObject_LengthHint(iterable_of_ints, 32);
    if (buf_size == -1) {
        Ty_DECREF(it);
        return NULL;
    }

    bytearray_obj = TyByteArray_FromStringAndSize(NULL, buf_size);
    if (bytearray_obj == NULL) {
        Ty_DECREF(it);
        return NULL;
    }
    buf = TyByteArray_AS_STRING(bytearray_obj);

    while ((item = TyIter_Next(it)) != NULL) {
        if (! _getbytevalue(item, &value)) {
            if (TyErr_ExceptionMatches(TyExc_TypeError) && TyUnicode_Check(iterable_of_ints)) {
                TyErr_Format(TyExc_TypeError,
                             "expected iterable of integers; got: 'str'");
            }
            Ty_DECREF(item);
            Ty_DECREF(it);
            Ty_DECREF(bytearray_obj);
            return NULL;
        }
        buf[len++] = value;
        Ty_DECREF(item);

        if (len >= buf_size) {
            Ty_ssize_t addition;
            if (len == PY_SSIZE_T_MAX) {
                Ty_DECREF(it);
                Ty_DECREF(bytearray_obj);
                return TyErr_NoMemory();
            }
            addition = len >> 1;
            if (addition > PY_SSIZE_T_MAX - len - 1)
                buf_size = PY_SSIZE_T_MAX;
            else
                buf_size = len + addition + 1;
            if (bytearray_resize_lock_held((TyObject *)bytearray_obj, buf_size) < 0) {
                Ty_DECREF(it);
                Ty_DECREF(bytearray_obj);
                return NULL;
            }
            /* Recompute the `buf' pointer, since the resizing operation may
               have invalidated it. */
            buf = TyByteArray_AS_STRING(bytearray_obj);
        }
    }
    Ty_DECREF(it);

    if (TyErr_Occurred()) {
        Ty_DECREF(bytearray_obj);
        return NULL;
    }

    /* Resize down to exact size. */
    if (bytearray_resize_lock_held((TyObject *)bytearray_obj, len) < 0) {
        Ty_DECREF(bytearray_obj);
        return NULL;
    }

    if (bytearray_setslice(self, Ty_SIZE(self), Ty_SIZE(self), bytearray_obj) == -1) {
        Ty_DECREF(bytearray_obj);
        return NULL;
    }
    Ty_DECREF(bytearray_obj);

    assert(!TyErr_Occurred());
    Py_RETURN_NONE;
}

/*[clinic input]
@critical_section
bytearray.pop

    index: Ty_ssize_t = -1
        The index from where to remove the item.
        -1 (the default value) means remove the last item.
    /

Remove and return a single item from B.

If no index argument is given, will pop the last item.
[clinic start generated code]*/

static TyObject *
bytearray_pop_impl(PyByteArrayObject *self, Ty_ssize_t index)
/*[clinic end generated code: output=e0ccd401f8021da8 input=fc0fd8de4f97661c]*/
{
    int value;
    Ty_ssize_t n = Ty_SIZE(self);
    char *buf;

    if (n == 0) {
        TyErr_SetString(TyExc_IndexError,
                        "pop from empty bytearray");
        return NULL;
    }
    if (index < 0)
        index += Ty_SIZE(self);
    if (index < 0 || index >= Ty_SIZE(self)) {
        TyErr_SetString(TyExc_IndexError, "pop index out of range");
        return NULL;
    }
    if (!_canresize(self))
        return NULL;

    buf = TyByteArray_AS_STRING(self);
    value = buf[index];
    memmove(buf + index, buf + index + 1, n - index);
    if (bytearray_resize_lock_held((TyObject *)self, n - 1) < 0)
        return NULL;

    return _TyLong_FromUnsignedChar((unsigned char)value);
}

/*[clinic input]
@critical_section
bytearray.remove

    value: bytesvalue
        The value to remove.
    /

Remove the first occurrence of a value in the bytearray.
[clinic start generated code]*/

static TyObject *
bytearray_remove_impl(PyByteArrayObject *self, int value)
/*[clinic end generated code: output=d659e37866709c13 input=797588bc77f86afb]*/
{
    Ty_ssize_t where, n = Ty_SIZE(self);
    char *buf = TyByteArray_AS_STRING(self);

    where = stringlib_find_char(buf, n, value);
    if (where < 0) {
        TyErr_SetString(TyExc_ValueError, "value not found in bytearray");
        return NULL;
    }
    if (!_canresize(self))
        return NULL;

    memmove(buf + where, buf + where + 1, n - where);
    if (bytearray_resize_lock_held((TyObject *)self, n - 1) < 0)
        return NULL;

    Py_RETURN_NONE;
}

#define LEFTSTRIP 0
#define RIGHTSTRIP 1
#define BOTHSTRIP 2

static TyObject*
bytearray_strip_impl_helper(PyByteArrayObject* self, TyObject* bytes, int striptype)
{
    Ty_ssize_t mysize, byteslen;
    const char* myptr;
    const char* bytesptr;
    Ty_buffer vbytes;

    if (bytes == Ty_None) {
        bytesptr = "\t\n\r\f\v ";
        byteslen = 6;
    }
    else {
        if (PyObject_GetBuffer(bytes, &vbytes, PyBUF_SIMPLE) != 0)
            return NULL;
        bytesptr = (const char*)vbytes.buf;
        byteslen = vbytes.len;
    }
    myptr = TyByteArray_AS_STRING(self);
    mysize = Ty_SIZE(self);

    Ty_ssize_t left = 0;
    if (striptype != RIGHTSTRIP) {
        while (left < mysize && memchr(bytesptr, (unsigned char)myptr[left], byteslen))
            left++;
    }
    Ty_ssize_t right = mysize;
    if (striptype != LEFTSTRIP) {
        do {
            right--;
        } while (right >= left && memchr(bytesptr, (unsigned char)myptr[right], byteslen));
        right++;
    }
    if (bytes != Ty_None)
        PyBuffer_Release(&vbytes);
    return TyByteArray_FromStringAndSize(myptr + left, right - left);
}

/*[clinic input]
@critical_section
bytearray.strip

    bytes: object = None
    /

Strip leading and trailing bytes contained in the argument.

If the argument is omitted or None, strip leading and trailing ASCII whitespace.
[clinic start generated code]*/

static TyObject *
bytearray_strip_impl(PyByteArrayObject *self, TyObject *bytes)
/*[clinic end generated code: output=760412661a34ad5a input=1f9026e5ad35388a]*/
{
    return bytearray_strip_impl_helper(self, bytes, BOTHSTRIP);
}

static TyObject *
bytearray_swapcase(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_swapcase(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_title(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_title(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_upper(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_upper(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_lower(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_lower(self, NULL);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_zfill(TyObject *self, TyObject *arg)
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_zfill(self, arg);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

/*[clinic input]
@critical_section
bytearray.lstrip

    bytes: object = None
    /

Strip leading bytes contained in the argument.

If the argument is omitted or None, strip leading ASCII whitespace.
[clinic start generated code]*/

static TyObject *
bytearray_lstrip_impl(PyByteArrayObject *self, TyObject *bytes)
/*[clinic end generated code: output=d005c9d0ab909e66 input=ed86e00eb2023625]*/
{
    return bytearray_strip_impl_helper(self, bytes, LEFTSTRIP);
}

/*[clinic input]
@critical_section
bytearray.rstrip

    bytes: object = None
    /

Strip trailing bytes contained in the argument.

If the argument is omitted or None, strip trailing ASCII whitespace.
[clinic start generated code]*/

static TyObject *
bytearray_rstrip_impl(PyByteArrayObject *self, TyObject *bytes)
/*[clinic end generated code: output=030e2fbd2f7276bd input=d9ca66cf20fe7649]*/
{
    return bytearray_strip_impl_helper(self, bytes, RIGHTSTRIP);
}

/*[clinic input]
@critical_section
bytearray.decode

    encoding: str(c_default="NULL") = 'utf-8'
        The encoding with which to decode the bytearray.
    errors: str(c_default="NULL") = 'strict'
        The error handling scheme to use for the handling of decoding errors.
        The default is 'strict' meaning that decoding errors raise a
        UnicodeDecodeError. Other possible values are 'ignore' and 'replace'
        as well as any other name registered with codecs.register_error that
        can handle UnicodeDecodeErrors.

Decode the bytearray using the codec registered for encoding.
[clinic start generated code]*/

static TyObject *
bytearray_decode_impl(PyByteArrayObject *self, const char *encoding,
                      const char *errors)
/*[clinic end generated code: output=f57d43f4a00b42c5 input=86c303ee376b8453]*/
{
    if (encoding == NULL)
        encoding = TyUnicode_GetDefaultEncoding();
    return TyUnicode_FromEncodedObject((TyObject*)self, encoding, errors);
}

TyDoc_STRVAR(alloc_doc,
"B.__alloc__() -> int\n\
\n\
Return the number of bytes actually allocated.");

static TyObject *
bytearray_alloc(TyObject *op, TyObject *Py_UNUSED(ignored))
{
    PyByteArrayObject *self = _PyByteArray_CAST(op);
    return TyLong_FromSsize_t(FT_ATOMIC_LOAD_SSIZE_RELAXED(self->ob_alloc));
}

/*[clinic input]
@critical_section
bytearray.join

    iterable_of_bytes: object
    /

Concatenate any number of bytes/bytearray objects.

The bytearray whose method is called is inserted in between each pair.

The result is returned as a new bytearray object.
[clinic start generated code]*/

static TyObject *
bytearray_join_impl(PyByteArrayObject *self, TyObject *iterable_of_bytes)
/*[clinic end generated code: output=0ced382b5846a7ee input=49627e07ca31ca26]*/
{
    TyObject *ret;
    self->ob_exports++; // this protects `self` from being cleared/resized if `iterable_of_bytes` is a custom iterator
    ret = stringlib_bytes_join((TyObject*)self, iterable_of_bytes);
    self->ob_exports--; // unexport `self`
    return ret;
}

static TyObject *
bytearray_ljust(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_ljust(self, args, nargs);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

static TyObject *
bytearray_rjust(TyObject *self, TyObject *const *args, Ty_ssize_t nargs)
{
    TyObject *ret;
    Ty_BEGIN_CRITICAL_SECTION(self);
    ret = stringlib_rjust(self, args, nargs);
    Ty_END_CRITICAL_SECTION();
    return ret;
}

/*[clinic input]
@critical_section
bytearray.splitlines

    keepends: bool = False

Return a list of the lines in the bytearray, breaking at line boundaries.

Line breaks are not included in the resulting list unless keepends is given and
true.
[clinic start generated code]*/

static TyObject *
bytearray_splitlines_impl(PyByteArrayObject *self, int keepends)
/*[clinic end generated code: output=4223c94b895f6ad9 input=874cd662866a66a1]*/
{
    return stringlib_splitlines(
        (TyObject*) self, TyByteArray_AS_STRING(self),
        TyByteArray_GET_SIZE(self), keepends
        );
}

/*[clinic input]
@classmethod
bytearray.fromhex

    string: object
    /

Create a bytearray object from a string of hexadecimal numbers.

Spaces between two numbers are accepted.
Example: bytearray.fromhex('B9 01EF') -> bytearray(b'\\xb9\\x01\\xef')
[clinic start generated code]*/

static TyObject *
bytearray_fromhex_impl(TyTypeObject *type, TyObject *string)
/*[clinic end generated code: output=8f0f0b6d30fb3ba0 input=7e314e5b2d7ab484]*/
{
    TyObject *result = _TyBytes_FromHex(string, type == &TyByteArray_Type);
    if (type != &TyByteArray_Type && result != NULL) {
        Ty_SETREF(result, PyObject_CallOneArg((TyObject *)type, result));
    }
    return result;
}

/*[clinic input]
@critical_section
bytearray.hex

    sep: object = NULL
        An optional single character or byte to separate hex bytes.
    bytes_per_sep: int = 1
        How many bytes between separators.  Positive values count from the
        right, negative values count from the left.

Create a string of hexadecimal numbers from a bytearray object.

Example:
>>> value = bytearray([0xb9, 0x01, 0xef])
>>> value.hex()
'b901ef'
>>> value.hex(':')
'b9:01:ef'
>>> value.hex(':', 2)
'b9:01ef'
>>> value.hex(':', -2)
'b901:ef'
[clinic start generated code]*/

static TyObject *
bytearray_hex_impl(PyByteArrayObject *self, TyObject *sep, int bytes_per_sep)
/*[clinic end generated code: output=29c4e5ef72c565a0 input=7784107de7048873]*/
{
    char* argbuf = TyByteArray_AS_STRING(self);
    Ty_ssize_t arglen = TyByteArray_GET_SIZE(self);
    return _Ty_strhex_with_sep(argbuf, arglen, sep, bytes_per_sep);
}

static TyObject *
_common_reduce(PyByteArrayObject *self, int proto)
{
    TyObject *state;
    const char *buf;

    state = _TyObject_GetState((TyObject *)self);
    if (state == NULL) {
        return NULL;
    }

    if (!Ty_SIZE(self)) {
        return Ty_BuildValue("(O()N)", Ty_TYPE(self), state);
    }
    buf = TyByteArray_AS_STRING(self);
    if (proto < 3) {
        /* use str based reduction for backwards compatibility with Python 2.x */
        TyObject *latin1 = TyUnicode_DecodeLatin1(buf, Ty_SIZE(self), NULL);
        return Ty_BuildValue("(O(Ns)N)", Ty_TYPE(self), latin1, "latin-1", state);
    }
    else {
        /* use more efficient byte based reduction */
        return Ty_BuildValue("(O(y#)N)", Ty_TYPE(self), buf, Ty_SIZE(self), state);
    }
}

/*[clinic input]
@critical_section
bytearray.__reduce__ as bytearray_reduce

Return state information for pickling.
[clinic start generated code]*/

static TyObject *
bytearray_reduce_impl(PyByteArrayObject *self)
/*[clinic end generated code: output=52bf304086464cab input=0fac78e4b7d84dd2]*/
{
    return _common_reduce(self, 2);
}

/*[clinic input]
@critical_section
bytearray.__reduce_ex__ as bytearray_reduce_ex

    proto: int = 0
    /

Return state information for pickling.
[clinic start generated code]*/

static TyObject *
bytearray_reduce_ex_impl(PyByteArrayObject *self, int proto)
/*[clinic end generated code: output=52eac33377197520 input=751718f477033a29]*/
{
    return _common_reduce(self, proto);
}

/*[clinic input]
bytearray.__sizeof__ as bytearray_sizeof

Returns the size of the bytearray object in memory, in bytes.
[clinic start generated code]*/

static TyObject *
bytearray_sizeof_impl(PyByteArrayObject *self)
/*[clinic end generated code: output=738abdd17951c427 input=e27320fd98a4bc5a]*/
{
    size_t res = _TyObject_SIZE(Ty_TYPE(self));
    res += (size_t)FT_ATOMIC_LOAD_SSIZE_RELAXED(self->ob_alloc) * sizeof(char);
    return TyLong_FromSize_t(res);
}

static PySequenceMethods bytearray_as_sequence = {
    bytearray_length,                       /* sq_length */
    TyByteArray_Concat,                     /* sq_concat */
    bytearray_repeat,                       /* sq_repeat */
    bytearray_getitem,                      /* sq_item */
    0,                                      /* sq_slice */
    bytearray_setitem,                      /* sq_ass_item */
    0,                                      /* sq_ass_slice */
    bytearray_contains,                     /* sq_contains */
    bytearray_iconcat,                      /* sq_inplace_concat */
    bytearray_irepeat,                      /* sq_inplace_repeat */
};

static PyMappingMethods bytearray_as_mapping = {
    bytearray_length,
    bytearray_subscript,
    bytearray_ass_subscript,
};

static PyBufferProcs bytearray_as_buffer = {
    bytearray_getbuffer,
    bytearray_releasebuffer,
};

static TyMethodDef bytearray_methods[] = {
    {"__alloc__", bytearray_alloc, METH_NOARGS, alloc_doc},
    BYTEARRAY_REDUCE_METHODDEF
    BYTEARRAY_REDUCE_EX_METHODDEF
    BYTEARRAY_SIZEOF_METHODDEF
    BYTEARRAY_APPEND_METHODDEF
    {"capitalize", bytearray_capitalize, METH_NOARGS, _Ty_capitalize__doc__},
    {"center", _PyCFunction_CAST(bytearray_center), METH_FASTCALL,
    stringlib_center__doc__},
    BYTEARRAY_CLEAR_METHODDEF
    BYTEARRAY_COPY_METHODDEF
    BYTEARRAY_COUNT_METHODDEF
    BYTEARRAY_DECODE_METHODDEF
    BYTEARRAY_ENDSWITH_METHODDEF
    {"expandtabs", _PyCFunction_CAST(bytearray_expandtabs),
    METH_FASTCALL|METH_KEYWORDS, stringlib_expandtabs__doc__},
    BYTEARRAY_EXTEND_METHODDEF
    BYTEARRAY_FIND_METHODDEF
    BYTEARRAY_FROMHEX_METHODDEF
    BYTEARRAY_HEX_METHODDEF
    BYTEARRAY_INDEX_METHODDEF
    BYTEARRAY_INSERT_METHODDEF
    {"isalnum", bytearray_isalnum, METH_NOARGS, _Ty_isalnum__doc__},
    {"isalpha", bytearray_isalpha, METH_NOARGS, _Ty_isalpha__doc__},
    {"isascii", bytearray_isascii, METH_NOARGS, _Ty_isascii__doc__},
    {"isdigit", bytearray_isdigit, METH_NOARGS, _Ty_isdigit__doc__},
    {"islower", bytearray_islower, METH_NOARGS, _Ty_islower__doc__},
    {"isspace", bytearray_isspace, METH_NOARGS, _Ty_isspace__doc__},
    {"istitle", bytearray_istitle, METH_NOARGS, _Ty_istitle__doc__},
    {"isupper", bytearray_isupper, METH_NOARGS, _Ty_isupper__doc__},
    BYTEARRAY_JOIN_METHODDEF
    {"ljust", _PyCFunction_CAST(bytearray_ljust), METH_FASTCALL,
    stringlib_ljust__doc__},
    {"lower", bytearray_lower, METH_NOARGS, _Ty_lower__doc__},
    BYTEARRAY_LSTRIP_METHODDEF
    BYTEARRAY_MAKETRANS_METHODDEF
    BYTEARRAY_PARTITION_METHODDEF
    BYTEARRAY_POP_METHODDEF
    BYTEARRAY_REMOVE_METHODDEF
    BYTEARRAY_REPLACE_METHODDEF
    BYTEARRAY_REMOVEPREFIX_METHODDEF
    BYTEARRAY_REMOVESUFFIX_METHODDEF
    BYTEARRAY_RESIZE_METHODDEF
    BYTEARRAY_REVERSE_METHODDEF
    BYTEARRAY_RFIND_METHODDEF
    BYTEARRAY_RINDEX_METHODDEF
    {"rjust", _PyCFunction_CAST(bytearray_rjust), METH_FASTCALL,
    stringlib_rjust__doc__},
    BYTEARRAY_RPARTITION_METHODDEF
    BYTEARRAY_RSPLIT_METHODDEF
    BYTEARRAY_RSTRIP_METHODDEF
    BYTEARRAY_SPLIT_METHODDEF
    BYTEARRAY_SPLITLINES_METHODDEF
    BYTEARRAY_STARTSWITH_METHODDEF
    BYTEARRAY_STRIP_METHODDEF
    {"swapcase", bytearray_swapcase, METH_NOARGS, _Ty_swapcase__doc__},
    {"title", bytearray_title, METH_NOARGS, _Ty_title__doc__},
    BYTEARRAY_TRANSLATE_METHODDEF
    {"upper", bytearray_upper, METH_NOARGS, _Ty_upper__doc__},
    {"zfill", bytearray_zfill, METH_O, stringlib_zfill__doc__},
    {NULL}
};

static TyObject *
bytearray_mod_lock_held(TyObject *v, TyObject *w)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(v);
    if (!TyByteArray_Check(v))
        Py_RETURN_NOTIMPLEMENTED;
    return _TyBytes_FormatEx(TyByteArray_AS_STRING(v), TyByteArray_GET_SIZE(v), w, 1);
}

static TyObject *
bytearray_mod(TyObject *v, TyObject *w)
{
    TyObject *ret;
    if (TyByteArray_Check(w)) {
        Ty_BEGIN_CRITICAL_SECTION2(v, w);
        ret = bytearray_mod_lock_held(v, w);
        Ty_END_CRITICAL_SECTION2();
    }
    else {
        Ty_BEGIN_CRITICAL_SECTION(v);
        ret = bytearray_mod_lock_held(v, w);
        Ty_END_CRITICAL_SECTION();
    }
    return ret;
}

static TyNumberMethods bytearray_as_number = {
    0,              /*nb_add*/
    0,              /*nb_subtract*/
    0,              /*nb_multiply*/
    bytearray_mod,  /*nb_remainder*/
};

TyDoc_STRVAR(bytearray_doc,
"bytearray(iterable_of_ints) -> bytearray\n\
bytearray(string, encoding[, errors]) -> bytearray\n\
bytearray(bytes_or_buffer) -> mutable copy of bytes_or_buffer\n\
bytearray(int) -> bytes array of size given by the parameter initialized with null bytes\n\
bytearray() -> empty bytes array\n\
\n\
Construct a mutable bytearray object from:\n\
  - an iterable yielding integers in range(256)\n\
  - a text string encoded using the specified encoding\n\
  - a bytes or a buffer object\n\
  - any object implementing the buffer API.\n\
  - an integer");


static TyObject *bytearray_iter(TyObject *seq);

TyTypeObject TyByteArray_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "bytearray",
    sizeof(PyByteArrayObject),
    0,
    bytearray_dealloc,                  /* tp_dealloc */
    0,                                  /* tp_vectorcall_offset */
    0,                                  /* tp_getattr */
    0,                                  /* tp_setattr */
    0,                                  /* tp_as_async */
    bytearray_repr,                     /* tp_repr */
    &bytearray_as_number,               /* tp_as_number */
    &bytearray_as_sequence,             /* tp_as_sequence */
    &bytearray_as_mapping,              /* tp_as_mapping */
    0,                                  /* tp_hash */
    0,                                  /* tp_call */
    bytearray_str,                      /* tp_str */
    PyObject_GenericGetAttr,            /* tp_getattro */
    0,                                  /* tp_setattro */
    &bytearray_as_buffer,               /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_BASETYPE |
        _Ty_TPFLAGS_MATCH_SELF,       /* tp_flags */
    bytearray_doc,                      /* tp_doc */
    0,                                  /* tp_traverse */
    0,                                  /* tp_clear */
    bytearray_richcompare,              /* tp_richcompare */
    0,                                  /* tp_weaklistoffset */
    bytearray_iter,                     /* tp_iter */
    0,                                  /* tp_iternext */
    bytearray_methods,                  /* tp_methods */
    0,                                  /* tp_members */
    0,                                  /* tp_getset */
    0,                                  /* tp_base */
    0,                                  /* tp_dict */
    0,                                  /* tp_descr_get */
    0,                                  /* tp_descr_set */
    0,                                  /* tp_dictoffset */
    bytearray___init__,                 /* tp_init */
    TyType_GenericAlloc,                /* tp_alloc */
    TyType_GenericNew,                  /* tp_new */
    PyObject_Free,                      /* tp_free */
    .tp_version_tag = _Ty_TYPE_VERSION_BYTEARRAY,
};

/*********************** Bytearray Iterator ****************************/

typedef struct {
    PyObject_HEAD
    Ty_ssize_t it_index;
    PyByteArrayObject *it_seq; /* Set to NULL when iterator is exhausted */
} bytesiterobject;

#define _bytesiterobject_CAST(op)   ((bytesiterobject *)(op))

static void
bytearrayiter_dealloc(TyObject *self)
{
    bytesiterobject *it = _bytesiterobject_CAST(self);
    _TyObject_GC_UNTRACK(it);
    Ty_XDECREF(it->it_seq);
    PyObject_GC_Del(it);
}

static int
bytearrayiter_traverse(TyObject *self, visitproc visit, void *arg)
{
    bytesiterobject *it = _bytesiterobject_CAST(self);
    Ty_VISIT(it->it_seq);
    return 0;
}

static TyObject *
bytearrayiter_next(TyObject *self)
{
    bytesiterobject *it = _bytesiterobject_CAST(self);
    int val;

    assert(it != NULL);
    Ty_ssize_t index = FT_ATOMIC_LOAD_SSIZE_RELAXED(it->it_index);
    if (index < 0) {
        return NULL;
    }
    PyByteArrayObject *seq = it->it_seq;
    assert(TyByteArray_Check(seq));

    Ty_BEGIN_CRITICAL_SECTION(seq);
    if (index < Ty_SIZE(seq)) {
        val = (unsigned char)TyByteArray_AS_STRING(seq)[index];
    }
    else {
        val = -1;
    }
    Ty_END_CRITICAL_SECTION();

    if (val == -1) {
        FT_ATOMIC_STORE_SSIZE_RELAXED(it->it_index, -1);
#ifndef Ty_GIL_DISABLED
        Ty_CLEAR(it->it_seq);
#endif
        return NULL;
    }
    FT_ATOMIC_STORE_SSIZE_RELAXED(it->it_index, index + 1);
    return _TyLong_FromUnsignedChar((unsigned char)val);
}

static TyObject *
bytearrayiter_length_hint(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    bytesiterobject *it = _bytesiterobject_CAST(self);
    Ty_ssize_t len = 0;
    Ty_ssize_t index = FT_ATOMIC_LOAD_SSIZE_RELAXED(it->it_index);
    if (index >= 0) {
        len = TyByteArray_GET_SIZE(it->it_seq) - index;
        if (len < 0) {
            len = 0;
        }
    }
    return TyLong_FromSsize_t(len);
}

TyDoc_STRVAR(length_hint_doc,
    "Private method returning an estimate of len(list(it)).");

static TyObject *
bytearrayiter_reduce(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    TyObject *iter = _TyEval_GetBuiltin(&_Ty_ID(iter));

    /* _TyEval_GetBuiltin can invoke arbitrary code,
     * call must be before access of iterator pointers.
     * see issue #101765 */
    bytesiterobject *it = _bytesiterobject_CAST(self);
    Ty_ssize_t index = FT_ATOMIC_LOAD_SSIZE_RELAXED(it->it_index);
    if (index >= 0) {
        return Ty_BuildValue("N(O)n", iter, it->it_seq, index);
    }
    return Ty_BuildValue("N(())", iter);
}

static TyObject *
bytearrayiter_setstate(TyObject *self, TyObject *state)
{
    Ty_ssize_t index = TyLong_AsSsize_t(state);
    if (index == -1 && TyErr_Occurred()) {
        return NULL;
    }

    bytesiterobject *it = _bytesiterobject_CAST(self);
    if (FT_ATOMIC_LOAD_SSIZE_RELAXED(it->it_index) >= 0) {
        if (index < -1) {
            index = -1;
        }
        else {
            Ty_ssize_t size = TyByteArray_GET_SIZE(it->it_seq);
            if (index > size) {
                index = size; /* iterator at end */
            }
        }
        FT_ATOMIC_STORE_SSIZE_RELAXED(it->it_index, index);
    }
    Py_RETURN_NONE;
}

TyDoc_STRVAR(setstate_doc, "Set state information for unpickling.");

static TyMethodDef bytearrayiter_methods[] = {
    {"__length_hint__", bytearrayiter_length_hint, METH_NOARGS,
     length_hint_doc},
     {"__reduce__",     bytearrayiter_reduce, METH_NOARGS,
     bytearray_reduce__doc__},
    {"__setstate__",    bytearrayiter_setstate, METH_O,
     setstate_doc},
    {NULL, NULL} /* sentinel */
};

TyTypeObject PyByteArrayIter_Type = {
    TyVarObject_HEAD_INIT(&TyType_Type, 0)
    "bytearray_iterator",              /* tp_name */
    sizeof(bytesiterobject),           /* tp_basicsize */
    0,                                 /* tp_itemsize */
    /* methods */
    bytearrayiter_dealloc,             /* tp_dealloc */
    0,                                 /* tp_vectorcall_offset */
    0,                                 /* tp_getattr */
    0,                                 /* tp_setattr */
    0,                                 /* tp_as_async */
    0,                                 /* tp_repr */
    0,                                 /* tp_as_number */
    0,                                 /* tp_as_sequence */
    0,                                 /* tp_as_mapping */
    0,                                 /* tp_hash */
    0,                                 /* tp_call */
    0,                                 /* tp_str */
    PyObject_GenericGetAttr,           /* tp_getattro */
    0,                                 /* tp_setattro */
    0,                                 /* tp_as_buffer */
    Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC, /* tp_flags */
    0,                                 /* tp_doc */
    bytearrayiter_traverse,            /* tp_traverse */
    0,                                 /* tp_clear */
    0,                                 /* tp_richcompare */
    0,                                 /* tp_weaklistoffset */
    PyObject_SelfIter,                 /* tp_iter */
    bytearrayiter_next,                /* tp_iternext */
    bytearrayiter_methods,             /* tp_methods */
    0,
};

static TyObject *
bytearray_iter(TyObject *seq)
{
    bytesiterobject *it;

    if (!TyByteArray_Check(seq)) {
        TyErr_BadInternalCall();
        return NULL;
    }
    it = PyObject_GC_New(bytesiterobject, &PyByteArrayIter_Type);
    if (it == NULL)
        return NULL;
    it->it_index = 0;  // -1 indicates exhausted
    it->it_seq = (PyByteArrayObject *)Ty_NewRef(seq);
    _TyObject_GC_TRACK(it);
    return (TyObject *)it;
}
