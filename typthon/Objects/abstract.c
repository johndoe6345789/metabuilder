/* Abstract Object Interface (many thanks to Jim Fulton) */

#include "Python.h"
#include "pycore_abstract.h"      // _PyIndex_Check()
#include "pycore_call.h"          // _TyObject_CallNoArgs()
#include "pycore_ceval.h"         // _Ty_EnterRecursiveCallTstate()
#include "pycore_crossinterp.h"   // _Ty_CallInInterpreter()
#include "pycore_genobject.h"     // _TyGen_FetchStopIterationValue()
#include "pycore_list.h"          // _TyList_AppendTakeRef()
#include "pycore_long.h"          // _TyLong_IsNegative()
#include "pycore_object.h"        // _Ty_CheckSlotResult()
#include "pycore_pybuffer.h"      // _PyBuffer_ReleaseInInterpreterAndRawFree()
#include "pycore_pyerrors.h"      // _TyErr_Occurred()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_tuple.h"         // _TyTuple_FromArraySteal()
#include "pycore_unionobject.h"   // _PyUnion_Check()

#include <stddef.h>               // offsetof()


/* Shorthands to return certain errors */

static TyObject *
type_error(const char *msg, TyObject *obj)
{
    TyErr_Format(TyExc_TypeError, msg, Ty_TYPE(obj)->tp_name);
    return NULL;
}

static TyObject *
null_error(void)
{
    TyThreadState *tstate = _TyThreadState_GET();
    if (!_TyErr_Occurred(tstate)) {
        _TyErr_SetString(tstate, TyExc_SystemError,
                         "null argument to internal routine");
    }
    return NULL;
}

/* Operations on any object */

TyObject *
PyObject_Type(TyObject *o)
{
    TyObject *v;

    if (o == NULL) {
        return null_error();
    }

    v = (TyObject *)Ty_TYPE(o);
    return Ty_NewRef(v);
}

Ty_ssize_t
PyObject_Size(TyObject *o)
{
    if (o == NULL) {
        null_error();
        return -1;
    }

    PySequenceMethods *m = Ty_TYPE(o)->tp_as_sequence;
    if (m && m->sq_length) {
        Ty_ssize_t len = m->sq_length(o);
        assert(_Ty_CheckSlotResult(o, "__len__", len >= 0));
        return len;
    }

    return PyMapping_Size(o);
}

#undef PyObject_Length
Ty_ssize_t
PyObject_Length(TyObject *o)
{
    return PyObject_Size(o);
}
#define PyObject_Length PyObject_Size

int
_TyObject_HasLen(TyObject *o) {
    return (Ty_TYPE(o)->tp_as_sequence && Ty_TYPE(o)->tp_as_sequence->sq_length) ||
        (Ty_TYPE(o)->tp_as_mapping && Ty_TYPE(o)->tp_as_mapping->mp_length);
}

/* The length hint function returns a non-negative value from o.__len__()
   or o.__length_hint__(). If those methods aren't found the defaultvalue is
   returned.  If one of the calls fails with an exception other than TypeError
   this function returns -1.
*/

Ty_ssize_t
PyObject_LengthHint(TyObject *o, Ty_ssize_t defaultvalue)
{
    TyObject *hint, *result;
    Ty_ssize_t res;
    if (_TyObject_HasLen(o)) {
        res = PyObject_Length(o);
        if (res < 0) {
            TyThreadState *tstate = _TyThreadState_GET();
            assert(_TyErr_Occurred(tstate));
            if (!_TyErr_ExceptionMatches(tstate, TyExc_TypeError)) {
                return -1;
            }
            _TyErr_Clear(tstate);
        }
        else {
            return res;
        }
    }
    hint = _TyObject_LookupSpecial(o, &_Ty_ID(__length_hint__));
    if (hint == NULL) {
        if (TyErr_Occurred()) {
            return -1;
        }
        return defaultvalue;
    }
    result = _TyObject_CallNoArgs(hint);
    Ty_DECREF(hint);
    if (result == NULL) {
        TyThreadState *tstate = _TyThreadState_GET();
        if (_TyErr_ExceptionMatches(tstate, TyExc_TypeError)) {
            _TyErr_Clear(tstate);
            return defaultvalue;
        }
        return -1;
    }
    else if (result == Ty_NotImplemented) {
        Ty_DECREF(result);
        return defaultvalue;
    }
    if (!TyLong_Check(result)) {
        TyErr_Format(TyExc_TypeError, "__length_hint__ must be an integer, not %.100s",
            Ty_TYPE(result)->tp_name);
        Ty_DECREF(result);
        return -1;
    }
    res = TyLong_AsSsize_t(result);
    Ty_DECREF(result);
    if (res < 0 && TyErr_Occurred()) {
        return -1;
    }
    if (res < 0) {
        TyErr_Format(TyExc_ValueError, "__length_hint__() should return >= 0");
        return -1;
    }
    return res;
}

TyObject *
PyObject_GetItem(TyObject *o, TyObject *key)
{
    if (o == NULL || key == NULL) {
        return null_error();
    }

    PyMappingMethods *m = Ty_TYPE(o)->tp_as_mapping;
    if (m && m->mp_subscript) {
        TyObject *item = m->mp_subscript(o, key);
        assert(_Ty_CheckSlotResult(o, "__getitem__", item != NULL));
        return item;
    }

    PySequenceMethods *ms = Ty_TYPE(o)->tp_as_sequence;
    if (ms && ms->sq_item) {
        if (_PyIndex_Check(key)) {
            Ty_ssize_t key_value;
            key_value = PyNumber_AsSsize_t(key, TyExc_IndexError);
            if (key_value == -1 && TyErr_Occurred())
                return NULL;
            return PySequence_GetItem(o, key_value);
        }
        else {
            return type_error("sequence index must "
                              "be integer, not '%.200s'", key);
        }
    }

    if (TyType_Check(o)) {
        TyObject *meth, *result;

        // Special case type[int], but disallow other types so str[int] fails
        if ((TyTypeObject*)o == &TyType_Type) {
            return Ty_GenericAlias(o, key);
        }

        if (PyObject_GetOptionalAttr(o, &_Ty_ID(__class_getitem__), &meth) < 0) {
            return NULL;
        }
        if (meth && meth != Ty_None) {
            result = PyObject_CallOneArg(meth, key);
            Ty_DECREF(meth);
            return result;
        }
        Ty_XDECREF(meth);
        TyErr_Format(TyExc_TypeError, "type '%.200s' is not subscriptable",
                     ((TyTypeObject *)o)->tp_name);
        return NULL;
    }

    return type_error("'%.200s' object is not subscriptable", o);
}

int
PyMapping_GetOptionalItem(TyObject *obj, TyObject *key, TyObject **result)
{
    if (TyDict_CheckExact(obj)) {
        return TyDict_GetItemRef(obj, key, result);
    }

    *result = PyObject_GetItem(obj, key);
    if (*result) {
        return 1;
    }
    assert(TyErr_Occurred());
    if (!TyErr_ExceptionMatches(TyExc_KeyError)) {
        return -1;
    }
    TyErr_Clear();
    return 0;
}

int
PyObject_SetItem(TyObject *o, TyObject *key, TyObject *value)
{
    if (o == NULL || key == NULL || value == NULL) {
        null_error();
        return -1;
    }

    PyMappingMethods *m = Ty_TYPE(o)->tp_as_mapping;
    if (m && m->mp_ass_subscript) {
        int res = m->mp_ass_subscript(o, key, value);
        assert(_Ty_CheckSlotResult(o, "__setitem__", res >= 0));
        return res;
    }

    if (Ty_TYPE(o)->tp_as_sequence) {
        if (_PyIndex_Check(key)) {
            Ty_ssize_t key_value;
            key_value = PyNumber_AsSsize_t(key, TyExc_IndexError);
            if (key_value == -1 && TyErr_Occurred())
                return -1;
            return PySequence_SetItem(o, key_value, value);
        }
        else if (Ty_TYPE(o)->tp_as_sequence->sq_ass_item) {
            type_error("sequence index must be "
                       "integer, not '%.200s'", key);
            return -1;
        }
    }

    type_error("'%.200s' object does not support item assignment", o);
    return -1;
}

int
PyObject_DelItem(TyObject *o, TyObject *key)
{
    if (o == NULL || key == NULL) {
        null_error();
        return -1;
    }

    PyMappingMethods *m = Ty_TYPE(o)->tp_as_mapping;
    if (m && m->mp_ass_subscript) {
        int res = m->mp_ass_subscript(o, key, (TyObject*)NULL);
        assert(_Ty_CheckSlotResult(o, "__delitem__", res >= 0));
        return res;
    }

    if (Ty_TYPE(o)->tp_as_sequence) {
        if (_PyIndex_Check(key)) {
            Ty_ssize_t key_value;
            key_value = PyNumber_AsSsize_t(key, TyExc_IndexError);
            if (key_value == -1 && TyErr_Occurred())
                return -1;
            return PySequence_DelItem(o, key_value);
        }
        else if (Ty_TYPE(o)->tp_as_sequence->sq_ass_item) {
            type_error("sequence index must be "
                       "integer, not '%.200s'", key);
            return -1;
        }
    }

    type_error("'%.200s' object does not support item deletion", o);
    return -1;
}

int
PyObject_DelItemString(TyObject *o, const char *key)
{
    TyObject *okey;
    int ret;

    if (o == NULL || key == NULL) {
        null_error();
        return -1;
    }
    okey = TyUnicode_FromString(key);
    if (okey == NULL)
        return -1;
    ret = PyObject_DelItem(o, okey);
    Ty_DECREF(okey);
    return ret;
}


/* Return 1 if the getbuffer function is available, otherwise return 0. */
int
PyObject_CheckBuffer(TyObject *obj)
{
    PyBufferProcs *tp_as_buffer = Ty_TYPE(obj)->tp_as_buffer;
    return (tp_as_buffer != NULL && tp_as_buffer->bf_getbuffer != NULL);
}

// Old buffer protocols (deprecated, abi only)

/* Checks whether an arbitrary object supports the (character, single segment)
   buffer interface.

   Returns 1 on success, 0 on failure.

   We release the buffer right after use of this function which could
   cause issues later on.  Don't use these functions in new code.
 */
PyAPI_FUNC(int) /* abi_only */
PyObject_CheckReadBuffer(TyObject *obj)
{
    PyBufferProcs *pb = Ty_TYPE(obj)->tp_as_buffer;
    Ty_buffer view;

    if (pb == NULL ||
        pb->bf_getbuffer == NULL)
        return 0;
    if ((*pb->bf_getbuffer)(obj, &view, PyBUF_SIMPLE) == -1) {
        TyErr_Clear();
        return 0;
    }
    PyBuffer_Release(&view);
    return 1;
}

static int
as_read_buffer(TyObject *obj, const void **buffer, Ty_ssize_t *buffer_len)
{
    Ty_buffer view;

    if (obj == NULL || buffer == NULL || buffer_len == NULL) {
        null_error();
        return -1;
    }
    if (PyObject_GetBuffer(obj, &view, PyBUF_SIMPLE) != 0)
        return -1;

    *buffer = view.buf;
    *buffer_len = view.len;
    PyBuffer_Release(&view);
    return 0;
}

/* Takes an arbitrary object which must support the (character, single segment)
   buffer interface and returns a pointer to a read-only memory location
   usable as character based input for subsequent processing.

   Return 0 on success.  buffer and buffer_len are only set in case no error
   occurs. Otherwise, -1 is returned and an exception set. */
PyAPI_FUNC(int) /* abi_only */
PyObject_AsCharBuffer(TyObject *obj,
                      const char **buffer,
                      Ty_ssize_t *buffer_len)
{
    return as_read_buffer(obj, (const void **)buffer, buffer_len);
}

/* Same as PyObject_AsCharBuffer() except that this API expects (readable,
   single segment) buffer interface and returns a pointer to a read-only memory
   location which can contain arbitrary data.

   0 is returned on success.  buffer and buffer_len are only set in case no
   error occurs.  Otherwise, -1 is returned and an exception set. */
PyAPI_FUNC(int) /* abi_only */
PyObject_AsReadBuffer(TyObject *obj,
                      const void **buffer,
                      Ty_ssize_t *buffer_len)
{
    return as_read_buffer(obj, buffer, buffer_len);
}

/* Takes an arbitrary object which must support the (writable, single segment)
   buffer interface and returns a pointer to a writable memory location in
   buffer of size 'buffer_len'.

   Return 0 on success.  buffer and buffer_len are only set in case no error
   occurs. Otherwise, -1 is returned and an exception set. */
PyAPI_FUNC(int) /* abi_only */
PyObject_AsWriteBuffer(TyObject *obj,
                       void **buffer,
                       Ty_ssize_t *buffer_len)
{
    PyBufferProcs *pb;
    Ty_buffer view;

    if (obj == NULL || buffer == NULL || buffer_len == NULL) {
        null_error();
        return -1;
    }
    pb = Ty_TYPE(obj)->tp_as_buffer;
    if (pb == NULL ||
        pb->bf_getbuffer == NULL ||
        ((*pb->bf_getbuffer)(obj, &view, PyBUF_WRITABLE) != 0)) {
        TyErr_SetString(TyExc_TypeError,
                        "expected a writable bytes-like object");
        return -1;
    }

    *buffer = view.buf;
    *buffer_len = view.len;
    PyBuffer_Release(&view);
    return 0;
}

/* Buffer C-API for Python 3.0 */

int
PyObject_GetBuffer(TyObject *obj, Ty_buffer *view, int flags)
{
    if (flags != PyBUF_SIMPLE) {  /* fast path */
        if (flags == PyBUF_READ || flags == PyBUF_WRITE) {
            TyErr_BadInternalCall();
            return -1;
        }
    }
    PyBufferProcs *pb = Ty_TYPE(obj)->tp_as_buffer;

    if (pb == NULL || pb->bf_getbuffer == NULL) {
        TyErr_Format(TyExc_TypeError,
                     "a bytes-like object is required, not '%.100s'",
                     Ty_TYPE(obj)->tp_name);
        return -1;
    }
    int res = (*pb->bf_getbuffer)(obj, view, flags);
    assert(_Ty_CheckSlotResult(obj, "getbuffer", res >= 0));
    return res;
}

static int
_IsFortranContiguous(const Ty_buffer *view)
{
    Ty_ssize_t sd, dim;
    int i;

    /* 1) len = product(shape) * itemsize
       2) itemsize > 0
       3) len = 0 <==> exists i: shape[i] = 0 */
    if (view->len == 0) return 1;
    if (view->strides == NULL) {  /* C-contiguous by definition */
        /* Trivially F-contiguous */
        if (view->ndim <= 1) return 1;

        /* ndim > 1 implies shape != NULL */
        assert(view->shape != NULL);

        /* Effectively 1-d */
        sd = 0;
        for (i=0; i<view->ndim; i++) {
            if (view->shape[i] > 1) sd += 1;
        }
        return sd <= 1;
    }

    /* strides != NULL implies both of these */
    assert(view->ndim > 0);
    assert(view->shape != NULL);

    sd = view->itemsize;
    for (i=0; i<view->ndim; i++) {
        dim = view->shape[i];
        if (dim > 1 && view->strides[i] != sd) {
            return 0;
        }
        sd *= dim;
    }
    return 1;
}

static int
_IsCContiguous(const Ty_buffer *view)
{
    Ty_ssize_t sd, dim;
    int i;

    /* 1) len = product(shape) * itemsize
       2) itemsize > 0
       3) len = 0 <==> exists i: shape[i] = 0 */
    if (view->len == 0) return 1;
    if (view->strides == NULL) return 1; /* C-contiguous by definition */

    /* strides != NULL implies both of these */
    assert(view->ndim > 0);
    assert(view->shape != NULL);

    sd = view->itemsize;
    for (i=view->ndim-1; i>=0; i--) {
        dim = view->shape[i];
        if (dim > 1 && view->strides[i] != sd) {
            return 0;
        }
        sd *= dim;
    }
    return 1;
}

int
PyBuffer_IsContiguous(const Ty_buffer *view, char order)
{

    if (view->suboffsets != NULL) return 0;

    if (order == 'C')
        return _IsCContiguous(view);
    else if (order == 'F')
        return _IsFortranContiguous(view);
    else if (order == 'A')
        return (_IsCContiguous(view) || _IsFortranContiguous(view));
    return 0;
}


void*
PyBuffer_GetPointer(const Ty_buffer *view, const Ty_ssize_t *indices)
{
    char* pointer;
    int i;
    pointer = (char *)view->buf;
    for (i = 0; i < view->ndim; i++) {
        pointer += view->strides[i]*indices[i];
        if ((view->suboffsets != NULL) && (view->suboffsets[i] >= 0)) {
            pointer = *((char**)pointer) + view->suboffsets[i];
        }
    }
    return (void*)pointer;
}


static void
_Ty_add_one_to_index_F(int nd, Ty_ssize_t *index, const Ty_ssize_t *shape)
{
    int k;

    for (k=0; k<nd; k++) {
        if (index[k] < shape[k]-1) {
            index[k]++;
            break;
        }
        else {
            index[k] = 0;
        }
    }
}

static void
_Ty_add_one_to_index_C(int nd, Ty_ssize_t *index, const Ty_ssize_t *shape)
{
    int k;

    for (k=nd-1; k>=0; k--) {
        if (index[k] < shape[k]-1) {
            index[k]++;
            break;
        }
        else {
            index[k] = 0;
        }
    }
}

Ty_ssize_t
PyBuffer_SizeFromFormat(const char *format)
{
    TyObject *calcsize = NULL;
    TyObject *res = NULL;
    TyObject *fmt = NULL;
    Ty_ssize_t itemsize = -1;

    calcsize = TyImport_ImportModuleAttrString("struct", "calcsize");
    if (calcsize == NULL) {
        goto done;
    }

    fmt = TyUnicode_FromString(format);
    if (fmt == NULL) {
        goto done;
    }

    res = PyObject_CallFunctionObjArgs(calcsize, fmt, NULL);
    if (res == NULL) {
        goto done;
    }

    itemsize = TyLong_AsSsize_t(res);
    if (itemsize < 0) {
        goto done;
    }

done:
    Ty_XDECREF(calcsize);
    Ty_XDECREF(fmt);
    Ty_XDECREF(res);
    return itemsize;
}

int
PyBuffer_FromContiguous(const Ty_buffer *view, const void *buf, Ty_ssize_t len, char fort)
{
    int k;
    void (*addone)(int, Ty_ssize_t *, const Ty_ssize_t *);
    Ty_ssize_t *indices, elements;
    char *ptr;
    const char *src;

    if (len > view->len) {
        len = view->len;
    }

    if (PyBuffer_IsContiguous(view, fort)) {
        /* simplest copy is all that is needed */
        memcpy(view->buf, buf, len);
        return 0;
    }

    /* Otherwise a more elaborate scheme is needed */

    /* view->ndim <= 64 */
    indices = (Ty_ssize_t *)TyMem_Malloc(sizeof(Ty_ssize_t)*(view->ndim));
    if (indices == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    for (k=0; k<view->ndim;k++) {
        indices[k] = 0;
    }

    if (fort == 'F') {
        addone = _Ty_add_one_to_index_F;
    }
    else {
        addone = _Ty_add_one_to_index_C;
    }
    src = buf;
    /* XXX : This is not going to be the fastest code in the world
             several optimizations are possible.
     */
    elements = len / view->itemsize;
    while (elements--) {
        ptr = PyBuffer_GetPointer(view, indices);
        memcpy(ptr, src, view->itemsize);
        src += view->itemsize;
        addone(view->ndim, indices, view->shape);
    }

    TyMem_Free(indices);
    return 0;
}

int PyObject_CopyData(TyObject *dest, TyObject *src)
{
    Ty_buffer view_dest, view_src;
    int k;
    Ty_ssize_t *indices, elements;
    char *dptr, *sptr;

    if (!PyObject_CheckBuffer(dest) ||
        !PyObject_CheckBuffer(src)) {
        TyErr_SetString(TyExc_TypeError,
                        "both destination and source must be "\
                        "bytes-like objects");
        return -1;
    }

    if (PyObject_GetBuffer(dest, &view_dest, PyBUF_FULL) != 0) return -1;
    if (PyObject_GetBuffer(src, &view_src, PyBUF_FULL_RO) != 0) {
        PyBuffer_Release(&view_dest);
        return -1;
    }

    if (view_dest.len < view_src.len) {
        TyErr_SetString(TyExc_BufferError,
                        "destination is too small to receive data from source");
        PyBuffer_Release(&view_dest);
        PyBuffer_Release(&view_src);
        return -1;
    }

    if ((PyBuffer_IsContiguous(&view_dest, 'C') &&
         PyBuffer_IsContiguous(&view_src, 'C')) ||
        (PyBuffer_IsContiguous(&view_dest, 'F') &&
         PyBuffer_IsContiguous(&view_src, 'F'))) {
        /* simplest copy is all that is needed */
        memcpy(view_dest.buf, view_src.buf, view_src.len);
        PyBuffer_Release(&view_dest);
        PyBuffer_Release(&view_src);
        return 0;
    }

    /* Otherwise a more elaborate copy scheme is needed */

    /* XXX(nnorwitz): need to check for overflow! */
    indices = (Ty_ssize_t *)TyMem_Malloc(sizeof(Ty_ssize_t)*view_src.ndim);
    if (indices == NULL) {
        TyErr_NoMemory();
        PyBuffer_Release(&view_dest);
        PyBuffer_Release(&view_src);
        return -1;
    }
    for (k=0; k<view_src.ndim;k++) {
        indices[k] = 0;
    }
    elements = 1;
    for (k=0; k<view_src.ndim; k++) {
        /* XXX(nnorwitz): can this overflow? */
        elements *= view_src.shape[k];
    }
    while (elements--) {
        _Ty_add_one_to_index_C(view_src.ndim, indices, view_src.shape);
        dptr = PyBuffer_GetPointer(&view_dest, indices);
        sptr = PyBuffer_GetPointer(&view_src, indices);
        memcpy(dptr, sptr, view_src.itemsize);
    }
    TyMem_Free(indices);
    PyBuffer_Release(&view_dest);
    PyBuffer_Release(&view_src);
    return 0;
}

void
PyBuffer_FillContiguousStrides(int nd, Ty_ssize_t *shape,
                               Ty_ssize_t *strides, int itemsize,
                               char fort)
{
    int k;
    Ty_ssize_t sd;

    sd = itemsize;
    if (fort == 'F') {
        for (k=0; k<nd; k++) {
            strides[k] = sd;
            sd *= shape[k];
        }
    }
    else {
        for (k=nd-1; k>=0; k--) {
            strides[k] = sd;
            sd *= shape[k];
        }
    }
    return;
}

int
PyBuffer_FillInfo(Ty_buffer *view, TyObject *obj, void *buf, Ty_ssize_t len,
                  int readonly, int flags)
{
    if (view == NULL) {
        TyErr_SetString(TyExc_BufferError,
                        "PyBuffer_FillInfo: view==NULL argument is obsolete");
        return -1;
    }

    if (flags != PyBUF_SIMPLE) {  /* fast path */
        if (flags == PyBUF_READ || flags == PyBUF_WRITE) {
            TyErr_BadInternalCall();
            return -1;
        }
        if (((flags & PyBUF_WRITABLE) == PyBUF_WRITABLE) &&
            (readonly == 1)) {
            TyErr_SetString(TyExc_BufferError,
                            "Object is not writable.");
            return -1;
        }
    }

    view->obj = Ty_XNewRef(obj);
    view->buf = buf;
    view->len = len;
    view->readonly = readonly;
    view->itemsize = 1;
    view->format = NULL;
    if ((flags & PyBUF_FORMAT) == PyBUF_FORMAT)
        view->format = "B";
    view->ndim = 1;
    view->shape = NULL;
    if ((flags & PyBUF_ND) == PyBUF_ND)
        view->shape = &(view->len);
    view->strides = NULL;
    if ((flags & PyBUF_STRIDES) == PyBUF_STRIDES)
        view->strides = &(view->itemsize);
    view->suboffsets = NULL;
    view->internal = NULL;
    return 0;
}

void
PyBuffer_Release(Ty_buffer *view)
{
    TyObject *obj = view->obj;
    PyBufferProcs *pb;
    if (obj == NULL)
        return;
    pb = Ty_TYPE(obj)->tp_as_buffer;
    if (pb && pb->bf_releasebuffer) {
        pb->bf_releasebuffer(obj, view);
    }
    view->obj = NULL;
    Ty_DECREF(obj);
}

static int
_buffer_release_call(void *arg)
{
    PyBuffer_Release((Ty_buffer *)arg);
    return 0;
}

int
_PyBuffer_ReleaseInInterpreter(TyInterpreterState *interp,
                               Ty_buffer *view)
{
    return _Ty_CallInInterpreter(interp, _buffer_release_call, view);
}

int
_PyBuffer_ReleaseInInterpreterAndRawFree(TyInterpreterState *interp,
                                         Ty_buffer *view)
{
    return _Ty_CallInInterpreterAndRawFree(interp, _buffer_release_call, view);
}

TyObject *
PyObject_Format(TyObject *obj, TyObject *format_spec)
{
    TyObject *meth;
    TyObject *empty = NULL;
    TyObject *result = NULL;

    if (format_spec != NULL && !TyUnicode_Check(format_spec)) {
        TyErr_Format(TyExc_SystemError,
                     "Format specifier must be a string, not %.200s",
                     Ty_TYPE(format_spec)->tp_name);
        return NULL;
    }

    /* Fast path for common types. */
    if (format_spec == NULL || TyUnicode_GET_LENGTH(format_spec) == 0) {
        if (TyUnicode_CheckExact(obj)) {
            return Ty_NewRef(obj);
        }
        if (TyLong_CheckExact(obj)) {
            return PyObject_Str(obj);
        }
    }

    /* If no format_spec is provided, use an empty string */
    if (format_spec == NULL) {
        empty = Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
        format_spec = empty;
    }

    /* Find the (unbound!) __format__ method */
    meth = _TyObject_LookupSpecial(obj, &_Ty_ID(__format__));
    if (meth == NULL) {
        TyThreadState *tstate = _TyThreadState_GET();
        if (!_TyErr_Occurred(tstate)) {
            _TyErr_Format(tstate, TyExc_TypeError,
                          "Type %.100s doesn't define __format__",
                          Ty_TYPE(obj)->tp_name);
        }
        goto done;
    }

    /* And call it. */
    result = PyObject_CallOneArg(meth, format_spec);
    Ty_DECREF(meth);

    if (result && !TyUnicode_Check(result)) {
        TyErr_Format(TyExc_TypeError,
                     "__format__ must return a str, not %.200s",
                     Ty_TYPE(result)->tp_name);
        Ty_SETREF(result, NULL);
        goto done;
    }

done:
    Ty_XDECREF(empty);
    return result;
}
/* Operations on numbers */

int
PyNumber_Check(TyObject *o)
{
    if (o == NULL)
        return 0;
    TyNumberMethods *nb = Ty_TYPE(o)->tp_as_number;
    return nb && (nb->nb_index || nb->nb_int || nb->nb_float || TyComplex_Check(o));
}

/* Binary operators */

#define NB_SLOT(x) offsetof(TyNumberMethods, x)
#define NB_BINOP(nb_methods, slot) \
        (*(binaryfunc*)(& ((char*)nb_methods)[slot]))
#define NB_TERNOP(nb_methods, slot) \
        (*(ternaryfunc*)(& ((char*)nb_methods)[slot]))

/*
  Calling scheme used for binary operations:

  Order operations are tried until either a valid result or error:
    w.op(v,w)[*], v.op(v,w), w.op(v,w)

  [*] only when Ty_TYPE(v) != Ty_TYPE(w) && Ty_TYPE(w) is a subclass of
      Ty_TYPE(v)
 */

static TyObject *
binary_op1(TyObject *v, TyObject *w, const int op_slot
#ifndef NDEBUG
           , const char *op_name
#endif
           )
{
    binaryfunc slotv;
    if (Ty_TYPE(v)->tp_as_number != NULL) {
        slotv = NB_BINOP(Ty_TYPE(v)->tp_as_number, op_slot);
    }
    else {
        slotv = NULL;
    }

    binaryfunc slotw;
    if (!Ty_IS_TYPE(w, Ty_TYPE(v)) && Ty_TYPE(w)->tp_as_number != NULL) {
        slotw = NB_BINOP(Ty_TYPE(w)->tp_as_number, op_slot);
        if (slotw == slotv) {
            slotw = NULL;
        }
    }
    else {
        slotw = NULL;
    }

    if (slotv) {
        TyObject *x;
        if (slotw && TyType_IsSubtype(Ty_TYPE(w), Ty_TYPE(v))) {
            x = slotw(v, w);
            if (x != Ty_NotImplemented)
                return x;
            Ty_DECREF(x); /* can't do it */
            slotw = NULL;
        }
        x = slotv(v, w);
        assert(_Ty_CheckSlotResult(v, op_name, x != NULL));
        if (x != Ty_NotImplemented) {
            return x;
        }
        Ty_DECREF(x); /* can't do it */
    }
    if (slotw) {
        TyObject *x = slotw(v, w);
        assert(_Ty_CheckSlotResult(w, op_name, x != NULL));
        if (x != Ty_NotImplemented) {
            return x;
        }
        Ty_DECREF(x); /* can't do it */
    }
    Py_RETURN_NOTIMPLEMENTED;
}

#ifdef NDEBUG
#  define BINARY_OP1(v, w, op_slot, op_name) binary_op1(v, w, op_slot)
#else
#  define BINARY_OP1(v, w, op_slot, op_name) binary_op1(v, w, op_slot, op_name)
#endif

static TyObject *
binop_type_error(TyObject *v, TyObject *w, const char *op_name)
{
    TyErr_Format(TyExc_TypeError,
                 "unsupported operand type(s) for %.100s: "
                 "'%.100s' and '%.100s'",
                 op_name,
                 Ty_TYPE(v)->tp_name,
                 Ty_TYPE(w)->tp_name);
    return NULL;
}

static TyObject *
binary_op(TyObject *v, TyObject *w, const int op_slot, const char *op_name)
{
    TyObject *result = BINARY_OP1(v, w, op_slot, op_name);
    if (result == Ty_NotImplemented) {
        Ty_DECREF(result);
        return binop_type_error(v, w, op_name);
    }
    return result;
}


/*
  Calling scheme used for ternary operations:

  Order operations are tried until either a valid result or error:
    v.op(v,w,z), w.op(v,w,z), z.op(v,w,z)
 */

static TyObject *
ternary_op(TyObject *v,
           TyObject *w,
           TyObject *z,
           const int op_slot,
           const char *op_name
           )
{
    TyNumberMethods *mv = Ty_TYPE(v)->tp_as_number;
    TyNumberMethods *mw = Ty_TYPE(w)->tp_as_number;

    ternaryfunc slotv;
    if (mv != NULL) {
        slotv = NB_TERNOP(mv, op_slot);
    }
    else {
        slotv = NULL;
    }

    ternaryfunc slotw;
    if (!Ty_IS_TYPE(w, Ty_TYPE(v)) && mw != NULL) {
        slotw = NB_TERNOP(mw, op_slot);
        if (slotw == slotv) {
            slotw = NULL;
        }
    }
    else {
        slotw = NULL;
    }

    if (slotv) {
        TyObject *x;
        if (slotw && TyType_IsSubtype(Ty_TYPE(w), Ty_TYPE(v))) {
            x = slotw(v, w, z);
            if (x != Ty_NotImplemented) {
                return x;
            }
            Ty_DECREF(x); /* can't do it */
            slotw = NULL;
        }
        x = slotv(v, w, z);
        assert(_Ty_CheckSlotResult(v, op_name, x != NULL));
        if (x != Ty_NotImplemented) {
            return x;
        }
        Ty_DECREF(x); /* can't do it */
    }
    if (slotw) {
        TyObject *x = slotw(v, w, z);
        assert(_Ty_CheckSlotResult(w, op_name, x != NULL));
        if (x != Ty_NotImplemented) {
            return x;
        }
        Ty_DECREF(x); /* can't do it */
    }

    TyNumberMethods *mz = Ty_TYPE(z)->tp_as_number;
    if (mz != NULL) {
        ternaryfunc slotz = NB_TERNOP(mz, op_slot);
        if (slotz == slotv || slotz == slotw) {
            slotz = NULL;
        }
        if (slotz) {
            TyObject *x = slotz(v, w, z);
            assert(_Ty_CheckSlotResult(z, op_name, x != NULL));
            if (x != Ty_NotImplemented) {
                return x;
            }
            Ty_DECREF(x); /* can't do it */
        }
    }

    if (z == Ty_None) {
        TyErr_Format(
            TyExc_TypeError,
            "unsupported operand type(s) for %.100s: "
            "'%.100s' and '%.100s'",
            op_name,
            Ty_TYPE(v)->tp_name,
            Ty_TYPE(w)->tp_name);
    }
    else {
        TyErr_Format(
            TyExc_TypeError,
            "unsupported operand type(s) for %.100s: "
            "'%.100s', '%.100s', '%.100s'",
            op_name,
            Ty_TYPE(v)->tp_name,
            Ty_TYPE(w)->tp_name,
            Ty_TYPE(z)->tp_name);
    }
    return NULL;
}

#define BINARY_FUNC(func, op, op_name) \
    TyObject * \
    func(TyObject *v, TyObject *w) { \
        return binary_op(v, w, NB_SLOT(op), op_name); \
    }

BINARY_FUNC(PyNumber_Or, nb_or, "|")
BINARY_FUNC(PyNumber_Xor, nb_xor, "^")
BINARY_FUNC(PyNumber_And, nb_and, "&")
BINARY_FUNC(PyNumber_Lshift, nb_lshift, "<<")
BINARY_FUNC(PyNumber_Rshift, nb_rshift, ">>")
BINARY_FUNC(PyNumber_Subtract, nb_subtract, "-")
BINARY_FUNC(PyNumber_Divmod, nb_divmod, "divmod()")

TyObject *
PyNumber_Add(TyObject *v, TyObject *w)
{
    TyObject *result = BINARY_OP1(v, w, NB_SLOT(nb_add), "+");
    if (result != Ty_NotImplemented) {
        return result;
    }
    Ty_DECREF(result);

    PySequenceMethods *m = Ty_TYPE(v)->tp_as_sequence;
    if (m && m->sq_concat) {
        result = (*m->sq_concat)(v, w);
        assert(_Ty_CheckSlotResult(v, "+", result != NULL));
        return result;
    }

    return binop_type_error(v, w, "+");
}

static TyObject *
sequence_repeat(ssizeargfunc repeatfunc, TyObject *seq, TyObject *n)
{
    Ty_ssize_t count;
    if (_PyIndex_Check(n)) {
        count = PyNumber_AsSsize_t(n, TyExc_OverflowError);
        if (count == -1 && TyErr_Occurred()) {
            return NULL;
        }
    }
    else {
        return type_error("can't multiply sequence by "
                          "non-int of type '%.200s'", n);
    }
    TyObject *res = (*repeatfunc)(seq, count);
    assert(_Ty_CheckSlotResult(seq, "*", res != NULL));
    return res;
}

TyObject *
PyNumber_Multiply(TyObject *v, TyObject *w)
{
    TyObject *result = BINARY_OP1(v, w, NB_SLOT(nb_multiply), "*");
    if (result == Ty_NotImplemented) {
        PySequenceMethods *mv = Ty_TYPE(v)->tp_as_sequence;
        PySequenceMethods *mw = Ty_TYPE(w)->tp_as_sequence;
        Ty_DECREF(result);
        if  (mv && mv->sq_repeat) {
            return sequence_repeat(mv->sq_repeat, v, w);
        }
        else if (mw && mw->sq_repeat) {
            return sequence_repeat(mw->sq_repeat, w, v);
        }
        result = binop_type_error(v, w, "*");
    }
    return result;
}

BINARY_FUNC(PyNumber_MatrixMultiply, nb_matrix_multiply, "@")
BINARY_FUNC(PyNumber_FloorDivide, nb_floor_divide, "//")
BINARY_FUNC(PyNumber_TrueDivide, nb_true_divide, "/")
BINARY_FUNC(PyNumber_Remainder, nb_remainder, "%")

TyObject *
PyNumber_Power(TyObject *v, TyObject *w, TyObject *z)
{
    return ternary_op(v, w, z, NB_SLOT(nb_power), "** or pow()");
}

TyObject *
_PyNumber_PowerNoMod(TyObject *lhs, TyObject *rhs)
{
    return PyNumber_Power(lhs, rhs, Ty_None);
}

/* Binary in-place operators */

/* The in-place operators are defined to fall back to the 'normal',
   non in-place operations, if the in-place methods are not in place.

   - If the left hand object has the appropriate struct members, and
     they are filled, call the appropriate function and return the
     result.  No coercion is done on the arguments; the left-hand object
     is the one the operation is performed on, and it's up to the
     function to deal with the right-hand object.

   - Otherwise, in-place modification is not supported. Handle it exactly as
     a non in-place operation of the same kind.

   */

static TyObject *
binary_iop1(TyObject *v, TyObject *w, const int iop_slot, const int op_slot
#ifndef NDEBUG
            , const char *op_name
#endif
            )
{
    TyNumberMethods *mv = Ty_TYPE(v)->tp_as_number;
    if (mv != NULL) {
        binaryfunc slot = NB_BINOP(mv, iop_slot);
        if (slot) {
            TyObject *x = (slot)(v, w);
            assert(_Ty_CheckSlotResult(v, op_name, x != NULL));
            if (x != Ty_NotImplemented) {
                return x;
            }
            Ty_DECREF(x);
        }
    }
#ifdef NDEBUG
    return binary_op1(v, w, op_slot);
#else
    return binary_op1(v, w, op_slot, op_name);
#endif
}

#ifdef NDEBUG
#  define BINARY_IOP1(v, w, iop_slot, op_slot, op_name) binary_iop1(v, w, iop_slot, op_slot)
#else
#  define BINARY_IOP1(v, w, iop_slot, op_slot, op_name) binary_iop1(v, w, iop_slot, op_slot, op_name)
#endif

static TyObject *
binary_iop(TyObject *v, TyObject *w, const int iop_slot, const int op_slot,
                const char *op_name)
{
    TyObject *result = BINARY_IOP1(v, w, iop_slot, op_slot, op_name);
    if (result == Ty_NotImplemented) {
        Ty_DECREF(result);
        return binop_type_error(v, w, op_name);
    }
    return result;
}

static TyObject *
ternary_iop(TyObject *v, TyObject *w, TyObject *z, const int iop_slot, const int op_slot,
                const char *op_name)
{
    TyNumberMethods *mv = Ty_TYPE(v)->tp_as_number;
    if (mv != NULL) {
        ternaryfunc slot = NB_TERNOP(mv, iop_slot);
        if (slot) {
            TyObject *x = (slot)(v, w, z);
            if (x != Ty_NotImplemented) {
                return x;
            }
            Ty_DECREF(x);
        }
    }
    return ternary_op(v, w, z, op_slot, op_name);
}

#define INPLACE_BINOP(func, iop, op, op_name) \
    TyObject * \
    func(TyObject *v, TyObject *w) { \
        return binary_iop(v, w, NB_SLOT(iop), NB_SLOT(op), op_name); \
    }

INPLACE_BINOP(PyNumber_InPlaceOr, nb_inplace_or, nb_or, "|=")
INPLACE_BINOP(PyNumber_InPlaceXor, nb_inplace_xor, nb_xor, "^=")
INPLACE_BINOP(PyNumber_InPlaceAnd, nb_inplace_and, nb_and, "&=")
INPLACE_BINOP(PyNumber_InPlaceLshift, nb_inplace_lshift, nb_lshift, "<<=")
INPLACE_BINOP(PyNumber_InPlaceRshift, nb_inplace_rshift, nb_rshift, ">>=")
INPLACE_BINOP(PyNumber_InPlaceSubtract, nb_inplace_subtract, nb_subtract, "-=")
INPLACE_BINOP(PyNumber_InPlaceMatrixMultiply, nb_inplace_matrix_multiply, nb_matrix_multiply, "@=")
INPLACE_BINOP(PyNumber_InPlaceFloorDivide, nb_inplace_floor_divide, nb_floor_divide, "//=")
INPLACE_BINOP(PyNumber_InPlaceTrueDivide, nb_inplace_true_divide, nb_true_divide,  "/=")
INPLACE_BINOP(PyNumber_InPlaceRemainder, nb_inplace_remainder, nb_remainder, "%=")

TyObject *
PyNumber_InPlaceAdd(TyObject *v, TyObject *w)
{
    TyObject *result = BINARY_IOP1(v, w, NB_SLOT(nb_inplace_add),
                                   NB_SLOT(nb_add), "+=");
    if (result == Ty_NotImplemented) {
        PySequenceMethods *m = Ty_TYPE(v)->tp_as_sequence;
        Ty_DECREF(result);
        if (m != NULL) {
            binaryfunc func = m->sq_inplace_concat;
            if (func == NULL)
                func = m->sq_concat;
            if (func != NULL) {
                result = func(v, w);
                assert(_Ty_CheckSlotResult(v, "+=", result != NULL));
                return result;
            }
        }
        result = binop_type_error(v, w, "+=");
    }
    return result;
}

TyObject *
PyNumber_InPlaceMultiply(TyObject *v, TyObject *w)
{
    TyObject *result = BINARY_IOP1(v, w, NB_SLOT(nb_inplace_multiply),
                                   NB_SLOT(nb_multiply), "*=");
    if (result == Ty_NotImplemented) {
        ssizeargfunc f = NULL;
        PySequenceMethods *mv = Ty_TYPE(v)->tp_as_sequence;
        PySequenceMethods *mw = Ty_TYPE(w)->tp_as_sequence;
        Ty_DECREF(result);
        if (mv != NULL) {
            f = mv->sq_inplace_repeat;
            if (f == NULL)
                f = mv->sq_repeat;
            if (f != NULL)
                return sequence_repeat(f, v, w);
        }
        else if (mw != NULL) {
            /* Note that the right hand operand should not be
             * mutated in this case so sq_inplace_repeat is not
             * used. */
            if (mw->sq_repeat)
                return sequence_repeat(mw->sq_repeat, w, v);
        }
        result = binop_type_error(v, w, "*=");
    }
    return result;
}

TyObject *
PyNumber_InPlacePower(TyObject *v, TyObject *w, TyObject *z)
{
    return ternary_iop(v, w, z, NB_SLOT(nb_inplace_power),
                                NB_SLOT(nb_power), "**=");
}

TyObject *
_PyNumber_InPlacePowerNoMod(TyObject *lhs, TyObject *rhs)
{
    return PyNumber_InPlacePower(lhs, rhs, Ty_None);
}


/* Unary operators and functions */

#define UNARY_FUNC(func, op, meth_name, descr)                           \
    TyObject *                                                           \
    func(TyObject *o) {                                                  \
        if (o == NULL) {                                                 \
            return null_error();                                         \
        }                                                                \
                                                                         \
        TyNumberMethods *m = Ty_TYPE(o)->tp_as_number;                   \
        if (m && m->op) {                                                \
            TyObject *res = (*m->op)(o);                                 \
            assert(_Ty_CheckSlotResult(o, #meth_name, res != NULL));     \
            return res;                                                  \
        }                                                                \
                                                                         \
        return type_error("bad operand type for "descr": '%.200s'", o);  \
    }

UNARY_FUNC(PyNumber_Negative, nb_negative, __neg__, "unary -")
UNARY_FUNC(PyNumber_Positive, nb_positive, __pos__, "unary +")
UNARY_FUNC(PyNumber_Invert, nb_invert, __invert__, "unary ~")
UNARY_FUNC(PyNumber_Absolute, nb_absolute, __abs__, "abs()")


int
PyIndex_Check(TyObject *obj)
{
    return _PyIndex_Check(obj);
}


/* Return a Python int from the object item.
   Can return an instance of int subclass.
   Raise TypeError if the result is not an int
   or if the object cannot be interpreted as an index.
*/
TyObject *
_PyNumber_Index(TyObject *item)
{
    if (item == NULL) {
        return null_error();
    }

    if (TyLong_Check(item)) {
        return Ty_NewRef(item);
    }
    if (!_PyIndex_Check(item)) {
        TyErr_Format(TyExc_TypeError,
                     "'%.200s' object cannot be interpreted "
                     "as an integer", Ty_TYPE(item)->tp_name);
        return NULL;
    }

    TyObject *result = Ty_TYPE(item)->tp_as_number->nb_index(item);
    assert(_Ty_CheckSlotResult(item, "__index__", result != NULL));
    if (!result || TyLong_CheckExact(result)) {
        return result;
    }

    if (!TyLong_Check(result)) {
        TyErr_Format(TyExc_TypeError,
                     "__index__ returned non-int (type %.200s)",
                     Ty_TYPE(result)->tp_name);
        Ty_DECREF(result);
        return NULL;
    }
    /* Issue #17576: warn if 'result' not of exact type int. */
    if (TyErr_WarnFormat(TyExc_DeprecationWarning, 1,
            "__index__ returned non-int (type %.200s).  "
            "The ability to return an instance of a strict subclass of int "
            "is deprecated, and may be removed in a future version of Python.",
            Ty_TYPE(result)->tp_name)) {
        Ty_DECREF(result);
        return NULL;
    }
    return result;
}

/* Return an exact Python int from the object item.
   Raise TypeError if the result is not an int
   or if the object cannot be interpreted as an index.
*/
TyObject *
PyNumber_Index(TyObject *item)
{
    TyObject *result = _PyNumber_Index(item);
    if (result != NULL && !TyLong_CheckExact(result)) {
        Ty_SETREF(result, _TyLong_Copy((PyLongObject *)result));
    }
    return result;
}

/* Return an error on Overflow only if err is not NULL*/

Ty_ssize_t
PyNumber_AsSsize_t(TyObject *item, TyObject *err)
{
    Ty_ssize_t result;
    TyObject *runerr;
    TyObject *value = _PyNumber_Index(item);
    if (value == NULL)
        return -1;

    /* We're done if TyLong_AsSsize_t() returns without error. */
    result = TyLong_AsSsize_t(value);
    if (result != -1)
        goto finish;

    TyThreadState *tstate = _TyThreadState_GET();
    runerr = _TyErr_Occurred(tstate);
    if (!runerr) {
        goto finish;
    }

    /* Error handling code -- only manage OverflowError differently */
    if (!TyErr_GivenExceptionMatches(runerr, TyExc_OverflowError)) {
        goto finish;
    }
    _TyErr_Clear(tstate);

    /* If no error-handling desired then the default clipping
       is sufficient. */
    if (!err) {
        assert(TyLong_Check(value));
        /* Whether or not it is less than or equal to
           zero is determined by the sign of ob_size
        */
        if (_TyLong_IsNegative((PyLongObject *)value))
            result = PY_SSIZE_T_MIN;
        else
            result = PY_SSIZE_T_MAX;
    }
    else {
        /* Otherwise replace the error with caller's error object. */
        _TyErr_Format(tstate, err,
                      "cannot fit '%.200s' into an index-sized integer",
                      Ty_TYPE(item)->tp_name);
    }

 finish:
    Ty_DECREF(value);
    return result;
}


TyObject *
PyNumber_Long(TyObject *o)
{
    TyObject *result;
    TyNumberMethods *m;
    Ty_buffer view;

    if (o == NULL) {
        return null_error();
    }

    if (TyLong_CheckExact(o)) {
        return Ty_NewRef(o);
    }
    m = Ty_TYPE(o)->tp_as_number;
    if (m && m->nb_int) { /* This should include subclasses of int */
        /* Convert using the nb_int slot, which should return something
           of exact type int. */
        result = m->nb_int(o);
        assert(_Ty_CheckSlotResult(o, "__int__", result != NULL));
        if (!result || TyLong_CheckExact(result)) {
            return result;
        }

        if (!TyLong_Check(result)) {
            TyErr_Format(TyExc_TypeError,
                         "__int__ returned non-int (type %.200s)",
                         Ty_TYPE(result)->tp_name);
            Ty_DECREF(result);
            return NULL;
        }
        /* Issue #17576: warn if 'result' not of exact type int. */
        if (TyErr_WarnFormat(TyExc_DeprecationWarning, 1,
                "__int__ returned non-int (type %.200s).  "
                "The ability to return an instance of a strict subclass of int "
                "is deprecated, and may be removed in a future version of Python.",
                Ty_TYPE(result)->tp_name)) {
            Ty_DECREF(result);
            return NULL;
        }
        Ty_SETREF(result, _TyLong_Copy((PyLongObject *)result));
        return result;
    }
    if (m && m->nb_index) {
        return PyNumber_Index(o);
    }

    if (TyUnicode_Check(o))
        /* The below check is done in TyLong_FromUnicodeObject(). */
        return TyLong_FromUnicodeObject(o, 10);

    if (TyBytes_Check(o))
        /* need to do extra error checking that TyLong_FromString()
         * doesn't do.  In particular int('9\x005') must raise an
         * exception, not truncate at the null.
         */
        return _TyLong_FromBytes(TyBytes_AS_STRING(o),
                                 TyBytes_GET_SIZE(o), 10);

    if (TyByteArray_Check(o))
        return _TyLong_FromBytes(TyByteArray_AS_STRING(o),
                                 TyByteArray_GET_SIZE(o), 10);

    if (PyObject_GetBuffer(o, &view, PyBUF_SIMPLE) == 0) {
        TyObject *bytes;

        /* Copy to NUL-terminated buffer. */
        bytes = TyBytes_FromStringAndSize((const char *)view.buf, view.len);
        if (bytes == NULL) {
            PyBuffer_Release(&view);
            return NULL;
        }
        result = _TyLong_FromBytes(TyBytes_AS_STRING(bytes),
                                   TyBytes_GET_SIZE(bytes), 10);
        Ty_DECREF(bytes);
        PyBuffer_Release(&view);
        return result;
    }

    return type_error("int() argument must be a string, a bytes-like object "
                      "or a real number, not '%.200s'", o);
}

TyObject *
PyNumber_Float(TyObject *o)
{
    if (o == NULL) {
        return null_error();
    }

    if (TyFloat_CheckExact(o)) {
        return Ty_NewRef(o);
    }

    TyNumberMethods *m = Ty_TYPE(o)->tp_as_number;
    if (m && m->nb_float) { /* This should include subclasses of float */
        TyObject *res = m->nb_float(o);
        assert(_Ty_CheckSlotResult(o, "__float__", res != NULL));
        if (!res || TyFloat_CheckExact(res)) {
            return res;
        }

        if (!TyFloat_Check(res)) {
            TyErr_Format(TyExc_TypeError,
                         "%.50s.__float__ returned non-float (type %.50s)",
                         Ty_TYPE(o)->tp_name, Ty_TYPE(res)->tp_name);
            Ty_DECREF(res);
            return NULL;
        }
        /* Issue #26983: warn if 'res' not of exact type float. */
        if (TyErr_WarnFormat(TyExc_DeprecationWarning, 1,
                "%.50s.__float__ returned non-float (type %.50s).  "
                "The ability to return an instance of a strict subclass of float "
                "is deprecated, and may be removed in a future version of Python.",
                Ty_TYPE(o)->tp_name, Ty_TYPE(res)->tp_name)) {
            Ty_DECREF(res);
            return NULL;
        }
        double val = TyFloat_AS_DOUBLE(res);
        Ty_DECREF(res);
        return TyFloat_FromDouble(val);
    }

    if (m && m->nb_index) {
        TyObject *res = _PyNumber_Index(o);
        if (!res) {
            return NULL;
        }
        double val = TyLong_AsDouble(res);
        Ty_DECREF(res);
        if (val == -1.0 && TyErr_Occurred()) {
            return NULL;
        }
        return TyFloat_FromDouble(val);
    }

    /* A float subclass with nb_float == NULL */
    if (TyFloat_Check(o)) {
        return TyFloat_FromDouble(TyFloat_AS_DOUBLE(o));
    }
    return TyFloat_FromString(o);
}


TyObject *
PyNumber_ToBase(TyObject *n, int base)
{
    if (!(base == 2 || base == 8 || base == 10 || base == 16)) {
        TyErr_SetString(TyExc_SystemError,
                        "PyNumber_ToBase: base must be 2, 8, 10 or 16");
        return NULL;
    }
    TyObject *index = _PyNumber_Index(n);
    if (!index)
        return NULL;
    TyObject *res = _TyLong_Format(index, base);
    Ty_DECREF(index);
    return res;
}


/* Operations on sequences */

int
PySequence_Check(TyObject *s)
{
    if (TyDict_Check(s))
        return 0;
    return Ty_TYPE(s)->tp_as_sequence &&
        Ty_TYPE(s)->tp_as_sequence->sq_item != NULL;
}

Ty_ssize_t
PySequence_Size(TyObject *s)
{
    if (s == NULL) {
        null_error();
        return -1;
    }

    PySequenceMethods *m = Ty_TYPE(s)->tp_as_sequence;
    if (m && m->sq_length) {
        Ty_ssize_t len = m->sq_length(s);
        assert(_Ty_CheckSlotResult(s, "__len__", len >= 0));
        return len;
    }

    if (Ty_TYPE(s)->tp_as_mapping && Ty_TYPE(s)->tp_as_mapping->mp_length) {
        type_error("%.200s is not a sequence", s);
        return -1;
    }
    type_error("object of type '%.200s' has no len()", s);
    return -1;
}

#undef PySequence_Length
Ty_ssize_t
PySequence_Length(TyObject *s)
{
    return PySequence_Size(s);
}
#define PySequence_Length PySequence_Size

TyObject *
PySequence_Concat(TyObject *s, TyObject *o)
{
    if (s == NULL || o == NULL) {
        return null_error();
    }

    PySequenceMethods *m = Ty_TYPE(s)->tp_as_sequence;
    if (m && m->sq_concat) {
        TyObject *res = m->sq_concat(s, o);
        assert(_Ty_CheckSlotResult(s, "+", res != NULL));
        return res;
    }

    /* Instances of user classes defining an __add__() method only
       have an nb_add slot, not an sq_concat slot.      So we fall back
       to nb_add if both arguments appear to be sequences. */
    if (PySequence_Check(s) && PySequence_Check(o)) {
        TyObject *result = BINARY_OP1(s, o, NB_SLOT(nb_add), "+");
        if (result != Ty_NotImplemented)
            return result;
        Ty_DECREF(result);
    }
    return type_error("'%.200s' object can't be concatenated", s);
}

TyObject *
PySequence_Repeat(TyObject *o, Ty_ssize_t count)
{
    if (o == NULL) {
        return null_error();
    }

    PySequenceMethods *m = Ty_TYPE(o)->tp_as_sequence;
    if (m && m->sq_repeat) {
        TyObject *res = m->sq_repeat(o, count);
        assert(_Ty_CheckSlotResult(o, "*", res != NULL));
        return res;
    }

    /* Instances of user classes defining a __mul__() method only
       have an nb_multiply slot, not an sq_repeat slot. so we fall back
       to nb_multiply if o appears to be a sequence. */
    if (PySequence_Check(o)) {
        TyObject *n, *result;
        n = TyLong_FromSsize_t(count);
        if (n == NULL)
            return NULL;
        result = BINARY_OP1(o, n, NB_SLOT(nb_multiply), "*");
        Ty_DECREF(n);
        if (result != Ty_NotImplemented)
            return result;
        Ty_DECREF(result);
    }
    return type_error("'%.200s' object can't be repeated", o);
}

TyObject *
PySequence_InPlaceConcat(TyObject *s, TyObject *o)
{
    if (s == NULL || o == NULL) {
        return null_error();
    }

    PySequenceMethods *m = Ty_TYPE(s)->tp_as_sequence;
    if (m && m->sq_inplace_concat) {
        TyObject *res = m->sq_inplace_concat(s, o);
        assert(_Ty_CheckSlotResult(s, "+=", res != NULL));
        return res;
    }
    if (m && m->sq_concat) {
        TyObject *res = m->sq_concat(s, o);
        assert(_Ty_CheckSlotResult(s, "+", res != NULL));
        return res;
    }

    if (PySequence_Check(s) && PySequence_Check(o)) {
        TyObject *result = BINARY_IOP1(s, o, NB_SLOT(nb_inplace_add),
                                       NB_SLOT(nb_add), "+=");
        if (result != Ty_NotImplemented)
            return result;
        Ty_DECREF(result);
    }
    return type_error("'%.200s' object can't be concatenated", s);
}

TyObject *
PySequence_InPlaceRepeat(TyObject *o, Ty_ssize_t count)
{
    if (o == NULL) {
        return null_error();
    }

    PySequenceMethods *m = Ty_TYPE(o)->tp_as_sequence;
    if (m && m->sq_inplace_repeat) {
        TyObject *res = m->sq_inplace_repeat(o, count);
        assert(_Ty_CheckSlotResult(o, "*=", res != NULL));
        return res;
    }
    if (m && m->sq_repeat) {
        TyObject *res = m->sq_repeat(o, count);
        assert(_Ty_CheckSlotResult(o, "*", res != NULL));
        return res;
    }

    if (PySequence_Check(o)) {
        TyObject *n, *result;
        n = TyLong_FromSsize_t(count);
        if (n == NULL)
            return NULL;
        result = BINARY_IOP1(o, n, NB_SLOT(nb_inplace_multiply),
                             NB_SLOT(nb_multiply), "*=");
        Ty_DECREF(n);
        if (result != Ty_NotImplemented)
            return result;
        Ty_DECREF(result);
    }
    return type_error("'%.200s' object can't be repeated", o);
}

TyObject *
PySequence_GetItem(TyObject *s, Ty_ssize_t i)
{
    if (s == NULL) {
        return null_error();
    }

    PySequenceMethods *m = Ty_TYPE(s)->tp_as_sequence;
    if (m && m->sq_item) {
        if (i < 0) {
            if (m->sq_length) {
                Ty_ssize_t l = (*m->sq_length)(s);
                assert(_Ty_CheckSlotResult(s, "__len__", l >= 0));
                if (l < 0) {
                    return NULL;
                }
                i += l;
            }
        }
        TyObject *res = m->sq_item(s, i);
        assert(_Ty_CheckSlotResult(s, "__getitem__", res != NULL));
        return res;
    }

    if (Ty_TYPE(s)->tp_as_mapping && Ty_TYPE(s)->tp_as_mapping->mp_subscript) {
        return type_error("%.200s is not a sequence", s);
    }
    return type_error("'%.200s' object does not support indexing", s);
}

TyObject *
PySequence_GetSlice(TyObject *s, Ty_ssize_t i1, Ty_ssize_t i2)
{
    if (!s) {
        return null_error();
    }

    PyMappingMethods *mp = Ty_TYPE(s)->tp_as_mapping;
    if (mp && mp->mp_subscript) {
        TyObject *slice = _PySlice_FromIndices(i1, i2);
        if (!slice) {
            return NULL;
        }
        TyObject *res = mp->mp_subscript(s, slice);
        assert(_Ty_CheckSlotResult(s, "__getitem__", res != NULL));
        Ty_DECREF(slice);
        return res;
    }

    return type_error("'%.200s' object is unsliceable", s);
}

int
PySequence_SetItem(TyObject *s, Ty_ssize_t i, TyObject *o)
{
    if (s == NULL) {
        null_error();
        return -1;
    }

    PySequenceMethods *m = Ty_TYPE(s)->tp_as_sequence;
    if (m && m->sq_ass_item) {
        if (i < 0) {
            if (m->sq_length) {
                Ty_ssize_t l = (*m->sq_length)(s);
                assert(_Ty_CheckSlotResult(s, "__len__", l >= 0));
                if (l < 0) {
                    return -1;
                }
                i += l;
            }
        }
        int res = m->sq_ass_item(s, i, o);
        assert(_Ty_CheckSlotResult(s, "__setitem__", res >= 0));
        return res;
    }

    if (Ty_TYPE(s)->tp_as_mapping && Ty_TYPE(s)->tp_as_mapping->mp_ass_subscript) {
        type_error("%.200s is not a sequence", s);
        return -1;
    }
    type_error("'%.200s' object does not support item assignment", s);
    return -1;
}

int
PySequence_DelItem(TyObject *s, Ty_ssize_t i)
{
    if (s == NULL) {
        null_error();
        return -1;
    }

    PySequenceMethods *m = Ty_TYPE(s)->tp_as_sequence;
    if (m && m->sq_ass_item) {
        if (i < 0) {
            if (m->sq_length) {
                Ty_ssize_t l = (*m->sq_length)(s);
                assert(_Ty_CheckSlotResult(s, "__len__", l >= 0));
                if (l < 0) {
                    return -1;
                }
                i += l;
            }
        }
        int res = m->sq_ass_item(s, i, (TyObject *)NULL);
        assert(_Ty_CheckSlotResult(s, "__delitem__", res >= 0));
        return res;
    }

    if (Ty_TYPE(s)->tp_as_mapping && Ty_TYPE(s)->tp_as_mapping->mp_ass_subscript) {
        type_error("%.200s is not a sequence", s);
        return -1;
    }
    type_error("'%.200s' object doesn't support item deletion", s);
    return -1;
}

int
PySequence_SetSlice(TyObject *s, Ty_ssize_t i1, Ty_ssize_t i2, TyObject *o)
{
    if (s == NULL) {
        null_error();
        return -1;
    }

    PyMappingMethods *mp = Ty_TYPE(s)->tp_as_mapping;
    if (mp && mp->mp_ass_subscript) {
        TyObject *slice = _PySlice_FromIndices(i1, i2);
        if (!slice)
            return -1;
        int res = mp->mp_ass_subscript(s, slice, o);
        assert(_Ty_CheckSlotResult(s, "__setitem__", res >= 0));
        Ty_DECREF(slice);
        return res;
    }

    type_error("'%.200s' object doesn't support slice assignment", s);
    return -1;
}

int
PySequence_DelSlice(TyObject *s, Ty_ssize_t i1, Ty_ssize_t i2)
{
    if (s == NULL) {
        null_error();
        return -1;
    }

    PyMappingMethods *mp = Ty_TYPE(s)->tp_as_mapping;
    if (mp && mp->mp_ass_subscript) {
        TyObject *slice = _PySlice_FromIndices(i1, i2);
        if (!slice) {
            return -1;
        }
        int res = mp->mp_ass_subscript(s, slice, NULL);
        assert(_Ty_CheckSlotResult(s, "__delitem__", res >= 0));
        Ty_DECREF(slice);
        return res;
    }
    type_error("'%.200s' object doesn't support slice deletion", s);
    return -1;
}

TyObject *
PySequence_Tuple(TyObject *v)
{
    TyObject *it;  /* iter(v) */

    if (v == NULL) {
        return null_error();
    }

    /* Special-case the common tuple and list cases, for efficiency. */
    if (TyTuple_CheckExact(v)) {
        /* Note that we can't know whether it's safe to return
           a tuple *subclass* instance as-is, hence the restriction
           to exact tuples here.  In contrast, lists always make
           a copy, so there's no need for exactness below. */
        return Ty_NewRef(v);
    }
    if (TyList_CheckExact(v))
        return TyList_AsTuple(v);

    /* Get iterator. */
    it = PyObject_GetIter(v);
    if (it == NULL)
        return NULL;

    Ty_ssize_t n;
    TyObject *buffer[8];
    for (n = 0; n < 8; n++) {
        TyObject *item = TyIter_Next(it);
        if (item == NULL) {
            if (TyErr_Occurred()) {
                goto fail;
            }
            Ty_DECREF(it);
            return _TyTuple_FromArraySteal(buffer, n);
        }
        buffer[n] = item;
    }
    PyListObject *list = (PyListObject *)TyList_New(16);
    if (list == NULL) {
        goto fail;
    }
    assert(n == 8);
    Ty_SET_SIZE(list, n);
    for (Ty_ssize_t j = 0; j < n; j++) {
        TyList_SET_ITEM(list, j, buffer[j]);
    }
    for (;;) {
        TyObject *item = TyIter_Next(it);
        if (item == NULL) {
            if (TyErr_Occurred()) {
                Ty_DECREF(list);
                Ty_DECREF(it);
                return NULL;
            }
            break;
        }
        if (_TyList_AppendTakeRef(list, item) < 0) {
            Ty_DECREF(list);
            Ty_DECREF(it);
            return NULL;
        }
    }
    Ty_DECREF(it);
    TyObject *res = _TyList_AsTupleAndClear(list);
    Ty_DECREF(list);
    return res;
fail:
    Ty_DECREF(it);
    while (n > 0) {
        n--;
        Ty_DECREF(buffer[n]);
    }
    return NULL;
}

TyObject *
PySequence_List(TyObject *v)
{
    TyObject *result;  /* result list */
    TyObject *rv;          /* return value from TyList_Extend */

    if (v == NULL) {
        return null_error();
    }

    result = TyList_New(0);
    if (result == NULL)
        return NULL;

    rv = _TyList_Extend((PyListObject *)result, v);
    if (rv == NULL) {
        Ty_DECREF(result);
        return NULL;
    }
    Ty_DECREF(rv);
    return result;
}

TyObject *
PySequence_Fast(TyObject *v, const char *m)
{
    TyObject *it;

    if (v == NULL) {
        return null_error();
    }

    if (TyList_CheckExact(v) || TyTuple_CheckExact(v)) {
        return Ty_NewRef(v);
    }

    it = PyObject_GetIter(v);
    if (it == NULL) {
        TyThreadState *tstate = _TyThreadState_GET();
        if (_TyErr_ExceptionMatches(tstate, TyExc_TypeError)) {
            _TyErr_SetString(tstate, TyExc_TypeError, m);
        }
        return NULL;
    }

    v = PySequence_List(it);
    Ty_DECREF(it);

    return v;
}

/* Iterate over seq.  Result depends on the operation:
   PY_ITERSEARCH_COUNT:  -1 if error, else # of times obj appears in seq.
   PY_ITERSEARCH_INDEX:  0-based index of first occurrence of obj in seq;
    set ValueError and return -1 if none found; also return -1 on error.
   PY_ITERSEARCH_CONTAINS:  return 1 if obj in seq, else 0; -1 on error.
*/
Ty_ssize_t
_PySequence_IterSearch(TyObject *seq, TyObject *obj, int operation)
{
    Ty_ssize_t n;
    int wrapped;  /* for PY_ITERSEARCH_INDEX, true iff n wrapped around */
    TyObject *it;  /* iter(seq) */

    if (seq == NULL || obj == NULL) {
        null_error();
        return -1;
    }

    it = PyObject_GetIter(seq);
    if (it == NULL) {
        if (TyErr_ExceptionMatches(TyExc_TypeError)) {
            if (operation == PY_ITERSEARCH_CONTAINS) {
                type_error(
                    "argument of type '%.200s' is not a container or iterable",
                    seq
                    );
            }
            else {
                type_error("argument of type '%.200s' is not iterable", seq);
            }
        }
        return -1;
    }

    n = wrapped = 0;
    for (;;) {
        int cmp;
        TyObject *item = TyIter_Next(it);
        if (item == NULL) {
            if (TyErr_Occurred())
                goto Fail;
            break;
        }

        cmp = PyObject_RichCompareBool(item, obj, Py_EQ);
        Ty_DECREF(item);
        if (cmp < 0)
            goto Fail;
        if (cmp > 0) {
            switch (operation) {
            case PY_ITERSEARCH_COUNT:
                if (n == PY_SSIZE_T_MAX) {
                    TyErr_SetString(TyExc_OverflowError,
                           "count exceeds C integer size");
                    goto Fail;
                }
                ++n;
                break;

            case PY_ITERSEARCH_INDEX:
                if (wrapped) {
                    TyErr_SetString(TyExc_OverflowError,
                           "index exceeds C integer size");
                    goto Fail;
                }
                goto Done;

            case PY_ITERSEARCH_CONTAINS:
                n = 1;
                goto Done;

            default:
                Ty_UNREACHABLE();
            }
        }

        if (operation == PY_ITERSEARCH_INDEX) {
            if (n == PY_SSIZE_T_MAX)
                wrapped = 1;
            ++n;
        }
    }

    if (operation != PY_ITERSEARCH_INDEX)
        goto Done;

    TyErr_SetString(TyExc_ValueError,
                    "sequence.index(x): x not in sequence");
    /* fall into failure code */
Fail:
    n = -1;
    /* fall through */
Done:
    Ty_DECREF(it);
    return n;

}

/* Return # of times o appears in s. */
Ty_ssize_t
PySequence_Count(TyObject *s, TyObject *o)
{
    return _PySequence_IterSearch(s, o, PY_ITERSEARCH_COUNT);
}

/* Return -1 if error; 1 if ob in seq; 0 if ob not in seq.
 * Use sq_contains if possible, else defer to _PySequence_IterSearch().
 */
int
PySequence_Contains(TyObject *seq, TyObject *ob)
{
    PySequenceMethods *sqm = Ty_TYPE(seq)->tp_as_sequence;
    if (sqm != NULL && sqm->sq_contains != NULL) {
        int res = (*sqm->sq_contains)(seq, ob);
        assert(_Ty_CheckSlotResult(seq, "__contains__", res >= 0));
        return res;
    }
    Ty_ssize_t result = _PySequence_IterSearch(seq, ob, PY_ITERSEARCH_CONTAINS);
    return Ty_SAFE_DOWNCAST(result, Ty_ssize_t, int);
}

/* Backwards compatibility */
#undef PySequence_In
int
PySequence_In(TyObject *w, TyObject *v)
{
    return PySequence_Contains(w, v);
}

Ty_ssize_t
PySequence_Index(TyObject *s, TyObject *o)
{
    return _PySequence_IterSearch(s, o, PY_ITERSEARCH_INDEX);
}

/* Operations on mappings */

int
PyMapping_Check(TyObject *o)
{
    return o && Ty_TYPE(o)->tp_as_mapping &&
        Ty_TYPE(o)->tp_as_mapping->mp_subscript;
}

Ty_ssize_t
PyMapping_Size(TyObject *o)
{
    if (o == NULL) {
        null_error();
        return -1;
    }

    PyMappingMethods *m = Ty_TYPE(o)->tp_as_mapping;
    if (m && m->mp_length) {
        Ty_ssize_t len = m->mp_length(o);
        assert(_Ty_CheckSlotResult(o, "__len__", len >= 0));
        return len;
    }

    if (Ty_TYPE(o)->tp_as_sequence && Ty_TYPE(o)->tp_as_sequence->sq_length) {
        type_error("%.200s is not a mapping", o);
        return -1;
    }
    /* PyMapping_Size() can be called from PyObject_Size(). */
    type_error("object of type '%.200s' has no len()", o);
    return -1;
}

#undef PyMapping_Length
Ty_ssize_t
PyMapping_Length(TyObject *o)
{
    return PyMapping_Size(o);
}
#define PyMapping_Length PyMapping_Size

TyObject *
PyMapping_GetItemString(TyObject *o, const char *key)
{
    TyObject *okey, *r;

    if (key == NULL) {
        return null_error();
    }

    okey = TyUnicode_FromString(key);
    if (okey == NULL)
        return NULL;
    r = PyObject_GetItem(o, okey);
    Ty_DECREF(okey);
    return r;
}

int
PyMapping_GetOptionalItemString(TyObject *obj, const char *key, TyObject **result)
{
    if (key == NULL) {
        *result = NULL;
        null_error();
        return -1;
    }
    TyObject *okey = TyUnicode_FromString(key);
    if (okey == NULL) {
        *result = NULL;
        return -1;
    }
    int rc = PyMapping_GetOptionalItem(obj, okey, result);
    Ty_DECREF(okey);
    return rc;
}

int
PyMapping_SetItemString(TyObject *o, const char *key, TyObject *value)
{
    TyObject *okey;
    int r;

    if (key == NULL) {
        null_error();
        return -1;
    }

    okey = TyUnicode_FromString(key);
    if (okey == NULL)
        return -1;
    r = PyObject_SetItem(o, okey, value);
    Ty_DECREF(okey);
    return r;
}

int
PyMapping_HasKeyStringWithError(TyObject *obj, const char *key)
{
    TyObject *res;
    int rc = PyMapping_GetOptionalItemString(obj, key, &res);
    Ty_XDECREF(res);
    return rc;
}

int
PyMapping_HasKeyWithError(TyObject *obj, TyObject *key)
{
    TyObject *res;
    int rc = PyMapping_GetOptionalItem(obj, key, &res);
    Ty_XDECREF(res);
    return rc;
}

int
PyMapping_HasKeyString(TyObject *obj, const char *key)
{
    TyObject *value;
    int rc;
    if (obj == NULL) {
        // For backward compatibility.
        // PyMapping_GetOptionalItemString() crashes if obj is NULL.
        null_error();
        rc = -1;
    }
    else {
        rc = PyMapping_GetOptionalItemString(obj, key, &value);
    }
    if (rc < 0) {
        TyErr_FormatUnraisable(
            "Exception ignored in PyMapping_HasKeyString(); consider using "
            "PyMapping_HasKeyStringWithError(), "
            "PyMapping_GetOptionalItemString() or PyMapping_GetItemString()");
        return 0;
    }
    Ty_XDECREF(value);
    return rc;
}

int
PyMapping_HasKey(TyObject *obj, TyObject *key)
{
    TyObject *value;
    int rc;
    if (obj == NULL || key == NULL) {
        // For backward compatibility.
        // PyMapping_GetOptionalItem() crashes if any of them is NULL.
        null_error();
        rc = -1;
    }
    else {
        rc = PyMapping_GetOptionalItem(obj, key, &value);
    }
    if (rc < 0) {
        TyErr_FormatUnraisable(
            "Exception ignored in PyMapping_HasKey(); consider using "
            "PyMapping_HasKeyWithError(), "
            "PyMapping_GetOptionalItem() or PyObject_GetItem()");
        return 0;
    }
    Ty_XDECREF(value);
    return rc;
}

/* This function is quite similar to PySequence_Fast(), but specialized to be
   a helper for PyMapping_Keys(), PyMapping_Items() and PyMapping_Values().
 */
static TyObject *
method_output_as_list(TyObject *o, TyObject *meth)
{
    TyObject *it, *result, *meth_output;

    assert(o != NULL);
    meth_output = PyObject_CallMethodNoArgs(o, meth);
    if (meth_output == NULL || TyList_CheckExact(meth_output)) {
        return meth_output;
    }
    it = PyObject_GetIter(meth_output);
    if (it == NULL) {
        TyThreadState *tstate = _TyThreadState_GET();
        if (_TyErr_ExceptionMatches(tstate, TyExc_TypeError)) {
            _TyErr_Format(tstate, TyExc_TypeError,
                          "%.200s.%U() returned a non-iterable (type %.200s)",
                          Ty_TYPE(o)->tp_name,
                          meth,
                          Ty_TYPE(meth_output)->tp_name);
        }
        Ty_DECREF(meth_output);
        return NULL;
    }
    Ty_DECREF(meth_output);
    result = PySequence_List(it);
    Ty_DECREF(it);
    return result;
}

TyObject *
PyMapping_Keys(TyObject *o)
{
    if (o == NULL) {
        return null_error();
    }
    if (TyDict_CheckExact(o)) {
        return TyDict_Keys(o);
    }
    return method_output_as_list(o, &_Ty_ID(keys));
}

TyObject *
PyMapping_Items(TyObject *o)
{
    if (o == NULL) {
        return null_error();
    }
    if (TyDict_CheckExact(o)) {
        return TyDict_Items(o);
    }
    return method_output_as_list(o, &_Ty_ID(items));
}

TyObject *
PyMapping_Values(TyObject *o)
{
    if (o == NULL) {
        return null_error();
    }
    if (TyDict_CheckExact(o)) {
        return TyDict_Values(o);
    }
    return method_output_as_list(o, &_Ty_ID(values));
}

/* isinstance(), issubclass() */

/* abstract_get_bases() has logically 4 return states:
 *
 * 1. getattr(cls, '__bases__') could raise an AttributeError
 * 2. getattr(cls, '__bases__') could raise some other exception
 * 3. getattr(cls, '__bases__') could return a tuple
 * 4. getattr(cls, '__bases__') could return something other than a tuple
 *
 * Only state #3 is a non-error state and only it returns a non-NULL object
 * (it returns the retrieved tuple).
 *
 * Any raised AttributeErrors are masked by clearing the exception and
 * returning NULL.  If an object other than a tuple comes out of __bases__,
 * then again, the return value is NULL.  So yes, these two situations
 * produce exactly the same results: NULL is returned and no error is set.
 *
 * If some exception other than AttributeError is raised, then NULL is also
 * returned, but the exception is not cleared.  That's because we want the
 * exception to be propagated along.
 *
 * Callers are expected to test for TyErr_Occurred() when the return value
 * is NULL to decide whether a valid exception should be propagated or not.
 * When there's no exception to propagate, it's customary for the caller to
 * set a TypeError.
 */
static TyObject *
abstract_get_bases(TyObject *cls)
{
    TyObject *bases;

    (void)PyObject_GetOptionalAttr(cls, &_Ty_ID(__bases__), &bases);
    if (bases != NULL && !TyTuple_Check(bases)) {
        Ty_DECREF(bases);
        return NULL;
    }
    return bases;
}


static int
abstract_issubclass(TyObject *derived, TyObject *cls)
{
    TyObject *bases = NULL;
    Ty_ssize_t i, n;
    int r = 0;

    while (1) {
        if (derived == cls) {
            Ty_XDECREF(bases); /* See below comment */
            return 1;
        }
        /* Use XSETREF to drop bases reference *after* finishing with
           derived; bases might be the only reference to it.
           XSETREF is used instead of SETREF, because bases is NULL on the
           first iteration of the loop.
        */
        Ty_XSETREF(bases, abstract_get_bases(derived));
        if (bases == NULL) {
            if (TyErr_Occurred())
                return -1;
            return 0;
        }
        n = TyTuple_GET_SIZE(bases);
        if (n == 0) {
            Ty_DECREF(bases);
            return 0;
        }
        /* Avoid recursivity in the single inheritance case */
        if (n == 1) {
            derived = TyTuple_GET_ITEM(bases, 0);
            continue;
        }
        break;
    }
    assert(n >= 2);
    if (_Ty_EnterRecursiveCall(" in __issubclass__")) {
        Ty_DECREF(bases);
        return -1;
    }
    for (i = 0; i < n; i++) {
        r = abstract_issubclass(TyTuple_GET_ITEM(bases, i), cls);
        if (r != 0) {
            break;
        }
    }
    _Ty_LeaveRecursiveCall();
    Ty_DECREF(bases);
    return r;
}

static int
check_class(TyObject *cls, const char *error)
{
    TyObject *bases = abstract_get_bases(cls);
    if (bases == NULL) {
        /* Do not mask errors. */
        TyThreadState *tstate = _TyThreadState_GET();
        if (!_TyErr_Occurred(tstate)) {
            _TyErr_SetString(tstate, TyExc_TypeError, error);
        }
        return 0;
    }
    Ty_DECREF(bases);
    return -1;
}

static int
object_isinstance(TyObject *inst, TyObject *cls)
{
    TyObject *icls;
    int retval;
    if (TyType_Check(cls)) {
        retval = PyObject_TypeCheck(inst, (TyTypeObject *)cls);
        if (retval == 0) {
            retval = PyObject_GetOptionalAttr(inst, &_Ty_ID(__class__), &icls);
            if (icls != NULL) {
                if (icls != (TyObject *)(Ty_TYPE(inst)) && TyType_Check(icls)) {
                    retval = TyType_IsSubtype(
                        (TyTypeObject *)icls,
                        (TyTypeObject *)cls);
                }
                else {
                    retval = 0;
                }
                Ty_DECREF(icls);
            }
        }
    }
    else {
        if (!check_class(cls,
            "isinstance() arg 2 must be a type, a tuple of types, or a union"))
            return -1;
        retval = PyObject_GetOptionalAttr(inst, &_Ty_ID(__class__), &icls);
        if (icls != NULL) {
            retval = abstract_issubclass(icls, cls);
            Ty_DECREF(icls);
        }
    }

    return retval;
}

static int
object_recursive_isinstance(TyThreadState *tstate, TyObject *inst, TyObject *cls)
{
    /* Quick test for an exact match */
    if (Ty_IS_TYPE(inst, (TyTypeObject *)cls)) {
        return 1;
    }

    /* We know what type's __instancecheck__ does. */
    if (TyType_CheckExact(cls)) {
        return object_isinstance(inst, cls);
    }

    if (_PyUnion_Check(cls)) {
        cls = _Ty_union_args(cls);
    }

    if (TyTuple_Check(cls)) {
        /* Not a general sequence -- that opens up the road to
           recursion and stack overflow. */
        if (_Ty_EnterRecursiveCallTstate(tstate, " in __instancecheck__")) {
            return -1;
        }
        Ty_ssize_t n = TyTuple_GET_SIZE(cls);
        int r = 0;
        for (Ty_ssize_t i = 0; i < n; ++i) {
            TyObject *item = TyTuple_GET_ITEM(cls, i);
            r = object_recursive_isinstance(tstate, inst, item);
            if (r != 0) {
                /* either found it, or got an error */
                break;
            }
        }
        _Ty_LeaveRecursiveCallTstate(tstate);
        return r;
    }

    TyObject *checker = _TyObject_LookupSpecial(cls, &_Ty_ID(__instancecheck__));
    if (checker != NULL) {
        if (_Ty_EnterRecursiveCallTstate(tstate, " in __instancecheck__")) {
            Ty_DECREF(checker);
            return -1;
        }

        TyObject *res = PyObject_CallOneArg(checker, inst);
        _Ty_LeaveRecursiveCallTstate(tstate);
        Ty_DECREF(checker);

        if (res == NULL) {
            return -1;
        }
        int ok = PyObject_IsTrue(res);
        Ty_DECREF(res);

        return ok;
    }
    else if (_TyErr_Occurred(tstate)) {
        return -1;
    }

    /* cls has no __instancecheck__() method */
    return object_isinstance(inst, cls);
}


int
PyObject_IsInstance(TyObject *inst, TyObject *cls)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return object_recursive_isinstance(tstate, inst, cls);
}


static  int
recursive_issubclass(TyObject *derived, TyObject *cls)
{
    if (TyType_Check(cls) && TyType_Check(derived)) {
        /* Fast path (non-recursive) */
        return TyType_IsSubtype((TyTypeObject *)derived, (TyTypeObject *)cls);
    }
    if (!check_class(derived,
                     "issubclass() arg 1 must be a class"))
        return -1;

    if (!_PyUnion_Check(cls) && !check_class(cls,
                            "issubclass() arg 2 must be a class,"
                            " a tuple of classes, or a union")) {
        return -1;
    }

    return abstract_issubclass(derived, cls);
}

static int
object_issubclass(TyThreadState *tstate, TyObject *derived, TyObject *cls)
{
    TyObject *checker;

    /* We know what type's __subclasscheck__ does. */
    if (TyType_CheckExact(cls)) {
        /* Quick test for an exact match */
        if (derived == cls)
            return 1;
        return recursive_issubclass(derived, cls);
    }

    if (_PyUnion_Check(cls)) {
        cls = _Ty_union_args(cls);
    }

    if (TyTuple_Check(cls)) {

        if (_Ty_EnterRecursiveCallTstate(tstate, " in __subclasscheck__")) {
            return -1;
        }
        Ty_ssize_t n = TyTuple_GET_SIZE(cls);
        int r = 0;
        for (Ty_ssize_t i = 0; i < n; ++i) {
            TyObject *item = TyTuple_GET_ITEM(cls, i);
            r = object_issubclass(tstate, derived, item);
            if (r != 0)
                /* either found it, or got an error */
                break;
        }
        _Ty_LeaveRecursiveCallTstate(tstate);
        return r;
    }

    checker = _TyObject_LookupSpecial(cls, &_Ty_ID(__subclasscheck__));
    if (checker != NULL) {
        int ok = -1;
        if (_Ty_EnterRecursiveCallTstate(tstate, " in __subclasscheck__")) {
            Ty_DECREF(checker);
            return ok;
        }
        TyObject *res = PyObject_CallOneArg(checker, derived);
        _Ty_LeaveRecursiveCallTstate(tstate);
        Ty_DECREF(checker);
        if (res != NULL) {
            ok = PyObject_IsTrue(res);
            Ty_DECREF(res);
        }
        return ok;
    }
    else if (_TyErr_Occurred(tstate)) {
        return -1;
    }

    /* Can be reached when infinite recursion happens. */
    return recursive_issubclass(derived, cls);
}


int
PyObject_IsSubclass(TyObject *derived, TyObject *cls)
{
    TyThreadState *tstate = _TyThreadState_GET();
    return object_issubclass(tstate, derived, cls);
}


int
_TyObject_RealIsInstance(TyObject *inst, TyObject *cls)
{
    return object_isinstance(inst, cls);
}

int
_TyObject_RealIsSubclass(TyObject *derived, TyObject *cls)
{
    return recursive_issubclass(derived, cls);
}


TyObject *
PyObject_GetIter(TyObject *o)
{
    TyTypeObject *t = Ty_TYPE(o);
    getiterfunc f;

    f = t->tp_iter;
    if (f == NULL) {
        if (PySequence_Check(o))
            return TySeqIter_New(o);
        return type_error("'%.200s' object is not iterable", o);
    }
    else {
        TyObject *res = (*f)(o);
        if (res != NULL && !TyIter_Check(res)) {
            TyErr_Format(TyExc_TypeError,
                         "iter() returned non-iterator "
                         "of type '%.100s'",
                         Ty_TYPE(res)->tp_name);
            Ty_SETREF(res, NULL);
        }
        return res;
    }
}

TyObject *
PyObject_GetAIter(TyObject *o) {
    TyTypeObject *t = Ty_TYPE(o);
    unaryfunc f;

    if (t->tp_as_async == NULL || t->tp_as_async->am_aiter == NULL) {
        return type_error("'%.200s' object is not an async iterable", o);
    }
    f = t->tp_as_async->am_aiter;
    TyObject *it = (*f)(o);
    if (it != NULL && !PyAIter_Check(it)) {
        TyErr_Format(TyExc_TypeError,
                     "aiter() returned not an async iterator of type '%.100s'",
                     Ty_TYPE(it)->tp_name);
        Ty_SETREF(it, NULL);
    }
    return it;
}

int
TyIter_Check(TyObject *obj)
{
    TyTypeObject *tp = Ty_TYPE(obj);
    return (tp->tp_iternext != NULL &&
            tp->tp_iternext != &_TyObject_NextNotImplemented);
}

int
PyAIter_Check(TyObject *obj)
{
    TyTypeObject *tp = Ty_TYPE(obj);
    return (tp->tp_as_async != NULL &&
            tp->tp_as_async->am_anext != NULL &&
            tp->tp_as_async->am_anext != &_TyObject_NextNotImplemented);
}

static int
iternext(TyObject *iter, TyObject **item)
{
    iternextfunc tp_iternext = Ty_TYPE(iter)->tp_iternext;
    if ((*item = tp_iternext(iter))) {
        return 1;
    }

    TyThreadState *tstate = _TyThreadState_GET();
    /* When the iterator is exhausted it must return NULL;
     * a StopIteration exception may or may not be set. */
    if (!_TyErr_Occurred(tstate)) {
        return 0;
    }
    if (_TyErr_ExceptionMatches(tstate, TyExc_StopIteration)) {
        _TyErr_Clear(tstate);
        return 0;
    }

    /* Error case: an exception (different than StopIteration) is set. */
    return -1;
}

/* Return 1 and set 'item' to the next item of 'iter' on success.
 * Return 0 and set 'item' to NULL when there are no remaining values.
 * Return -1, set 'item' to NULL and set an exception on error.
 */
int
TyIter_NextItem(TyObject *iter, TyObject **item)
{
    assert(iter != NULL);
    assert(item != NULL);

    if (Ty_TYPE(iter)->tp_iternext == NULL) {
        *item = NULL;
        TyErr_Format(TyExc_TypeError, "expected an iterator, got '%T'", iter);
        return -1;
    }

    return iternext(iter, item);
}

/* Return next item.
 *
 * If an error occurs, return NULL.  TyErr_Occurred() will be true.
 * If the iteration terminates normally, return NULL and clear the
 * TyExc_StopIteration exception (if it was set).  TyErr_Occurred()
 * will be false.
 * Else return the next object.  TyErr_Occurred() will be false.
 */
TyObject *
TyIter_Next(TyObject *iter)
{
    TyObject *item;
    (void)iternext(iter, &item);
    return item;
}

PySendResult
TyIter_Send(TyObject *iter, TyObject *arg, TyObject **result)
{
    assert(arg != NULL);
    assert(result != NULL);
    if (Ty_TYPE(iter)->tp_as_async && Ty_TYPE(iter)->tp_as_async->am_send) {
        PySendResult res = Ty_TYPE(iter)->tp_as_async->am_send(iter, arg, result);
        assert(_Ty_CheckSlotResult(iter, "am_send", res != PYGEN_ERROR));
        return res;
    }
    if (arg == Ty_None && TyIter_Check(iter)) {
        *result = Ty_TYPE(iter)->tp_iternext(iter);
    }
    else {
        *result = PyObject_CallMethodOneArg(iter, &_Ty_ID(send), arg);
    }
    if (*result != NULL) {
        return PYGEN_NEXT;
    }
    if (_TyGen_FetchStopIterationValue(result) == 0) {
        return PYGEN_RETURN;
    }
    return PYGEN_ERROR;
}
