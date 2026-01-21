/*
 * History: First version dated from 3/97, derived from my SCMLIB version
 * for win16.
 */
/*
 * Related Work:
 *      - calldll       http://www.nightmare.com/software.html
 *      - libffi        http://sourceware.cygnus.com/libffi/
 *      - ffcall        http://clisp.cons.org/~haible/packages-ffcall.html
 *   and, of course, Don Beaudry's MESS package, but this is more ctypes
 *   related.
 */


/*
  How are functions called, and how are parameters converted to C ?

  1. _ctypes.c::PyCFuncPtr_call receives an argument tuple 'inargs' and a
  keyword dictionary 'kwds'.

  2. After several checks, _build_callargs() is called which returns another
  tuple 'callargs'.  This may be the same tuple as 'inargs', a slice of
  'inargs', or a completely fresh tuple, depending on several things (is it a
  COM method?, are 'paramflags' available?).

  3. _build_callargs also calculates bitarrays containing indexes into
  the callargs tuple, specifying how to build the return value(s) of
  the function.

  4. _ctypes_callproc is then called with the 'callargs' tuple.  _ctypes_callproc first
  allocates two arrays.  The first is an array of 'struct argument' items, the
  second array has 'void *' entries.

  5. If 'converters' are present (converters is a sequence of argtypes'
  from_param methods), for each item in 'callargs' converter is called and the
  result passed to ConvParam.  If 'converters' are not present, each argument
  is directly passed to ConvParm.

  6. For each arg, ConvParam stores the contained C data (or a pointer to it,
  for structures) into the 'struct argument' array.

  7. Finally, a loop fills the 'void *' array so that each item points to the
  data contained in or pointed to by the 'struct argument' array.

  8. The 'void *' argument array is what _call_function_pointer
  expects. _call_function_pointer then has very little to do - only some
  libffi specific stuff, then it calls ffi_call.

  So, there are 4 data structures holding processed arguments:
  - the inargs tuple (in PyCFuncPtr_call)
  - the callargs tuple (in PyCFuncPtr_call)
  - the 'struct arguments' array
  - the 'void *' array

 */

/*[clinic input]
module _ctypes
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=476a19c49b31a75c]*/

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

#include "Python.h"


#ifdef MS_WIN32
#include <windows.h>
#include <tchar.h>
#else
#include <dlfcn.h>
#endif

#ifdef __APPLE__
#include <mach-o/dyld.h>
#endif

#ifdef MS_WIN32
#include <malloc.h>
#endif

#include <ffi.h>
#include "ctypes.h"
#ifdef HAVE_ALLOCA_H
/* AIX needs alloca.h for alloca() */
#include <alloca.h>
#endif

#ifdef _Py_MEMORY_SANITIZER
#include <sanitizer/msan_interface.h>
#endif

#if defined(_DEBUG) || defined(__MINGW32__)
/* Don't use structured exception handling on Windows if this is defined.
   MingW, AFAIK, doesn't support it.
*/
#define DONT_USE_SEH
#endif

#include "pycore_runtime.h"       // _PyRuntime
#include "pycore_global_objects.h"// _Ty_ID()
#include "pycore_traceback.h"     // _TyTraceback_Add()

#define clinic_state() (get_module_state(module))
#include "clinic/callproc.c.h"
#undef clinic_state

#define CTYPES_CAPSULE_NAME_PYMEM "_ctypes pymem"


static void pymem_destructor(TyObject *ptr)
{
    void *p = PyCapsule_GetPointer(ptr, CTYPES_CAPSULE_NAME_PYMEM);
    if (p) {
        TyMem_Free(p);
    }
}

/*
  ctypes maintains thread-local storage that has space for two error numbers:
  private copies of the system 'errno' value and, on Windows, the system error code
  accessed by the GetLastError() and SetLastError() api functions.

  Foreign functions created with CDLL(..., use_errno=True), when called, swap
  the system 'errno' value with the private copy just before the actual
  function call, and swapped again immediately afterwards.  The 'use_errno'
  parameter defaults to False, in this case 'ctypes_errno' is not touched.

  On Windows, foreign functions created with CDLL(..., use_last_error=True) or
  WinDLL(..., use_last_error=True) swap the system LastError value with the
  ctypes private copy.

  The values are also swapped immediately before and after ctypes callback
  functions are called, if the callbacks are constructed using the new
  optional use_errno parameter set to True: CFUNCTYPE(..., use_errno=TRUE) or
  WINFUNCTYPE(..., use_errno=True).

  New ctypes functions are provided to access the ctypes private copies from
  Python:

  - ctypes.set_errno(value) and ctypes.set_last_error(value) store 'value' in
    the private copy and returns the previous value.

  - ctypes.get_errno() and ctypes.get_last_error() returns the current ctypes
    private copies value.
*/

/*
  This function creates and returns a thread-local Python object that has
  space to store two integer error numbers; once created the Python object is
  kept alive in the thread state dictionary as long as the thread itself.
*/
TyObject *
_ctypes_get_errobj(ctypes_state *st, int **pspace)
{
    TyObject *dict = TyThreadState_GetDict();
    TyObject *errobj;
    if (dict == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
                        "cannot get thread state");
        return NULL;
    }
    assert(st->error_object_name != NULL);
    if (TyDict_GetItemRef(dict, st->error_object_name, &errobj) < 0) {
        return NULL;
    }
    if (errobj) {
        if (!PyCapsule_IsValid(errobj, CTYPES_CAPSULE_NAME_PYMEM)) {
            TyErr_SetString(TyExc_RuntimeError,
                "ctypes.error_object is an invalid capsule");
            Ty_DECREF(errobj);
            return NULL;
        }
    }
    else {
        void *space = TyMem_Calloc(2, sizeof(int));
        if (space == NULL)
            return NULL;
        errobj = PyCapsule_New(space, CTYPES_CAPSULE_NAME_PYMEM, pymem_destructor);
        if (errobj == NULL) {
            TyMem_Free(space);
            return NULL;
        }
        if (TyDict_SetItem(dict, st->error_object_name, errobj) < 0) {
            Ty_DECREF(errobj);
            return NULL;
        }
    }
    *pspace = (int *)PyCapsule_GetPointer(errobj, CTYPES_CAPSULE_NAME_PYMEM);
    return errobj;
}

static TyObject *
get_error_internal(TyObject *self, TyObject *args, int index)
{
    int *space;
    ctypes_state *st = get_module_state(self);
    TyObject *errobj = _ctypes_get_errobj(st, &space);
    TyObject *result;

    if (errobj == NULL)
        return NULL;
    result = TyLong_FromLong(space[index]);
    Ty_DECREF(errobj);
    return result;
}

static TyObject *
set_error_internal(TyObject *self, TyObject *args, int index)
{
    int new_errno, old_errno;
    TyObject *errobj;
    int *space;

    if (!TyArg_ParseTuple(args, "i", &new_errno)) {
        return NULL;
    }
    ctypes_state *st = get_module_state(self);
    errobj = _ctypes_get_errobj(st, &space);
    if (errobj == NULL)
        return NULL;
    old_errno = space[index];
    space[index] = new_errno;
    Ty_DECREF(errobj);
    return TyLong_FromLong(old_errno);
}

static TyObject *
get_errno(TyObject *self, TyObject *args)
{
    if (TySys_Audit("ctypes.get_errno", NULL) < 0) {
        return NULL;
    }
    return get_error_internal(self, args, 0);
}

static TyObject *
set_errno(TyObject *self, TyObject *args)
{
    if (TySys_Audit("ctypes.set_errno", "O", args) < 0) {
        return NULL;
    }
    return set_error_internal(self, args, 0);
}

#ifdef MS_WIN32

static TyObject *
get_last_error(TyObject *self, TyObject *args)
{
    if (TySys_Audit("ctypes.get_last_error", NULL) < 0) {
        return NULL;
    }
    return get_error_internal(self, args, 1);
}

static TyObject *
set_last_error(TyObject *self, TyObject *args)
{
    if (TySys_Audit("ctypes.set_last_error", "O", args) < 0) {
        return NULL;
    }
    return set_error_internal(self, args, 1);
}

static WCHAR *FormatError(DWORD code)
{
    WCHAR *lpMsgBuf;
    DWORD n;
    n = FormatMessageW(FORMAT_MESSAGE_ALLOCATE_BUFFER |
                       FORMAT_MESSAGE_FROM_SYSTEM |
                       FORMAT_MESSAGE_IGNORE_INSERTS,
                       NULL,
                       code,
                       MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), /* Default language */
               (LPWSTR) &lpMsgBuf,
               0,
               NULL);
    if (n) {
        while (iswspace(lpMsgBuf[n-1]))
            --n;
        lpMsgBuf[n] = L'\0'; /* rstrip() */
    }
    return lpMsgBuf;
}

#ifndef DONT_USE_SEH
static void SetException(DWORD code, EXCEPTION_RECORD *pr)
{
    if (TySys_Audit("ctypes.set_exception", "I", code) < 0) {
        /* An exception was set by the audit hook */
        return;
    }

    /* The 'code' is a normal win32 error code so it could be handled by
    TyErr_SetFromWindowsErr(). However, for some errors, we have additional
    information not included in the error code. We handle those here and
    delegate all others to the generic function. */
    switch (code) {
    case EXCEPTION_ACCESS_VIOLATION:
        /* The thread attempted to read from or write
           to a virtual address for which it does not
           have the appropriate access. */
        if (pr->ExceptionInformation[0] == 0)
            TyErr_Format(TyExc_OSError,
                         "exception: access violation reading %p",
                         pr->ExceptionInformation[1]);
        else
            TyErr_Format(TyExc_OSError,
                         "exception: access violation writing %p",
                         pr->ExceptionInformation[1]);
        break;

    case EXCEPTION_BREAKPOINT:
        /* A breakpoint was encountered. */
        TyErr_SetString(TyExc_OSError,
                        "exception: breakpoint encountered");
        break;

    case EXCEPTION_DATATYPE_MISALIGNMENT:
        /* The thread attempted to read or write data that is
           misaligned on hardware that does not provide
           alignment. For example, 16-bit values must be
           aligned on 2-byte boundaries, 32-bit values on
           4-byte boundaries, and so on. */
        TyErr_SetString(TyExc_OSError,
                        "exception: datatype misalignment");
        break;

    case EXCEPTION_SINGLE_STEP:
        /* A trace trap or other single-instruction mechanism
           signaled that one instruction has been executed. */
        TyErr_SetString(TyExc_OSError,
                        "exception: single step");
        break;

    case EXCEPTION_ARRAY_BOUNDS_EXCEEDED:
        /* The thread attempted to access an array element
           that is out of bounds, and the underlying hardware
           supports bounds checking. */
        TyErr_SetString(TyExc_OSError,
                        "exception: array bounds exceeded");
        break;

    case EXCEPTION_FLT_DENORMAL_OPERAND:
        /* One of the operands in a floating-point operation
           is denormal. A denormal value is one that is too
           small to represent as a standard floating-point
           value. */
        TyErr_SetString(TyExc_OSError,
                        "exception: floating-point operand denormal");
        break;

    case EXCEPTION_FLT_DIVIDE_BY_ZERO:
        /* The thread attempted to divide a floating-point
           value by a floating-point divisor of zero. */
        TyErr_SetString(TyExc_OSError,
                        "exception: float divide by zero");
        break;

    case EXCEPTION_FLT_INEXACT_RESULT:
        /* The result of a floating-point operation cannot be
           represented exactly as a decimal fraction. */
        TyErr_SetString(TyExc_OSError,
                        "exception: float inexact");
        break;

    case EXCEPTION_FLT_INVALID_OPERATION:
        /* This exception represents any floating-point
           exception not included in this list. */
        TyErr_SetString(TyExc_OSError,
                        "exception: float invalid operation");
        break;

    case EXCEPTION_FLT_OVERFLOW:
        /* The exponent of a floating-point operation is
           greater than the magnitude allowed by the
           corresponding type. */
        TyErr_SetString(TyExc_OSError,
                        "exception: float overflow");
        break;

    case EXCEPTION_FLT_STACK_CHECK:
        /* The stack overflowed or underflowed as the result
           of a floating-point operation. */
        TyErr_SetString(TyExc_OSError,
                        "exception: stack over/underflow");
        break;

    case EXCEPTION_STACK_OVERFLOW:
        /* The stack overflowed or underflowed as the result
           of a floating-point operation. */
        TyErr_SetString(TyExc_OSError,
                        "exception: stack overflow");
        break;

    case EXCEPTION_FLT_UNDERFLOW:
        /* The exponent of a floating-point operation is less
           than the magnitude allowed by the corresponding
           type. */
        TyErr_SetString(TyExc_OSError,
                        "exception: float underflow");
        break;

    case EXCEPTION_INT_DIVIDE_BY_ZERO:
        /* The thread attempted to divide an integer value by
           an integer divisor of zero. */
        TyErr_SetString(TyExc_OSError,
                        "exception: integer divide by zero");
        break;

    case EXCEPTION_INT_OVERFLOW:
        /* The result of an integer operation caused a carry
           out of the most significant bit of the result. */
        TyErr_SetString(TyExc_OSError,
                        "exception: integer overflow");
        break;

    case EXCEPTION_PRIV_INSTRUCTION:
        /* The thread attempted to execute an instruction
           whose operation is not allowed in the current
           machine mode. */
        TyErr_SetString(TyExc_OSError,
                        "exception: privileged instruction");
        break;

    case EXCEPTION_NONCONTINUABLE_EXCEPTION:
        /* The thread attempted to continue execution after a
           noncontinuable exception occurred. */
        TyErr_SetString(TyExc_OSError,
                        "exception: nocontinuable");
        break;

    default:
        TyErr_SetFromWindowsErr(code);
        break;
    }
}

static DWORD HandleException(EXCEPTION_POINTERS *ptrs,
                             DWORD *pdw, EXCEPTION_RECORD *record)
{
    *pdw = ptrs->ExceptionRecord->ExceptionCode;
    *record = *ptrs->ExceptionRecord;
    /* We don't want to catch breakpoint exceptions, they are used to attach
     * a debugger to the process.
     */
    if (*pdw == EXCEPTION_BREAKPOINT)
        return EXCEPTION_CONTINUE_SEARCH;
    return EXCEPTION_EXECUTE_HANDLER;
}
#endif

static TyObject *
check_hresult(TyObject *self, TyObject *args)
{
    HRESULT hr;
    if (!TyArg_ParseTuple(args, "i", &hr))
        return NULL;
    if (FAILED(hr))
        return TyErr_SetFromWindowsErr(hr);
    return TyLong_FromLong(hr);
}

#endif

/**************************************************************/

PyCArgObject *
PyCArgObject_new(ctypes_state *st)
{
    PyCArgObject *p;
    p = PyObject_GC_New(PyCArgObject, st->PyCArg_Type);
    if (p == NULL)
        return NULL;
    p->pffi_type = NULL;
    p->tag = '\0';
    p->obj = NULL;
    memset(&p->value, 0, sizeof(p->value));
    PyObject_GC_Track(p);
    return p;
}

static int
PyCArg_traverse(TyObject *op, visitproc visit, void *arg)
{
    PyCArgObject *self = _PyCArgObject_CAST(op);
    Ty_VISIT(Ty_TYPE(self));
    Ty_VISIT(self->obj);
    return 0;
}

static int
PyCArg_clear(TyObject *op)
{
    PyCArgObject *self = _PyCArgObject_CAST(op);
    Ty_CLEAR(self->obj);
    return 0;
}

static void
PyCArg_dealloc(TyObject *self)
{
    TyTypeObject *tp = Ty_TYPE(self);
    PyObject_GC_UnTrack(self);
    (void)PyCArg_clear(self);
    tp->tp_free(self);
    Ty_DECREF(tp);
}

static int
is_literal_char(unsigned char c)
{
    return c < 128 && _TyUnicode_IsPrintable(c) && c != '\\' && c != '\'';
}

static TyObject *
PyCArg_repr(TyObject *op)
{
    PyCArgObject *self = _PyCArgObject_CAST(op);
    switch(self->tag) {
    case 'b':
    case 'B':
        return TyUnicode_FromFormat("<cparam '%c' (%d)>",
            self->tag, self->value.b);
    case 'h':
    case 'H':
        return TyUnicode_FromFormat("<cparam '%c' (%d)>",
            self->tag, self->value.h);
    case 'i':
    case 'I':
        return TyUnicode_FromFormat("<cparam '%c' (%d)>",
            self->tag, self->value.i);
    case 'l':
    case 'L':
        return TyUnicode_FromFormat("<cparam '%c' (%ld)>",
            self->tag, self->value.l);

    case 'q':
    case 'Q':
        return TyUnicode_FromFormat("<cparam '%c' (%lld)>",
            self->tag, self->value.q);
    case 'd':
    case 'f': {
        TyObject *f = TyFloat_FromDouble((self->tag == 'f') ? self->value.f : self->value.d);
        if (f == NULL) {
            return NULL;
        }
        TyObject *result = TyUnicode_FromFormat("<cparam '%c' (%R)>", self->tag, f);
        Ty_DECREF(f);
        return result;
    }
    case 'c':
        if (is_literal_char((unsigned char)self->value.c)) {
            return TyUnicode_FromFormat("<cparam '%c' ('%c')>",
                self->tag, self->value.c);
        }
        else {
            return TyUnicode_FromFormat("<cparam '%c' ('\\x%02x')>",
                self->tag, (unsigned char)self->value.c);
        }

/* Hm, are these 'z' and 'Z' codes useful at all?
   Shouldn't they be replaced by the functionality of create_string_buffer()
   and c_wstring() ?
*/
    case 'z':
    case 'Z':
    case 'P':
        return TyUnicode_FromFormat("<cparam '%c' (%p)>",
            self->tag, self->value.p);
        break;

    default:
        if (is_literal_char((unsigned char)self->tag)) {
            return TyUnicode_FromFormat("<cparam '%c' at %p>",
                (unsigned char)self->tag, (void *)self);
        }
        else {
            return TyUnicode_FromFormat("<cparam 0x%02x at %p>",
                (unsigned char)self->tag, (void *)self);
        }
    }
}

static TyMemberDef PyCArgType_members[] = {
    { "_obj", _Ty_T_OBJECT,
      offsetof(PyCArgObject, obj), Py_READONLY,
      "the wrapped object" },
    { NULL },
};

static TyType_Slot carg_slots[] = {
    {Ty_tp_dealloc, PyCArg_dealloc},
    {Ty_tp_traverse, PyCArg_traverse},
    {Ty_tp_clear, PyCArg_clear},
    {Ty_tp_repr, PyCArg_repr},
    {Ty_tp_members, PyCArgType_members},
    {0, NULL},
};

TyType_Spec carg_spec = {
    .name = "_ctypes.CArgObject",
    .basicsize = sizeof(PyCArgObject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_HAVE_GC |
              Ty_TPFLAGS_IMMUTABLETYPE | Ty_TPFLAGS_DISALLOW_INSTANTIATION),
    .slots = carg_slots,
};

/****************************************************************/
/*
 * Convert a TyObject * into a parameter suitable to pass to an
 * C function call.
 *
 * 1. Python integers are converted to C int and passed by value.
 *    Ty_None is converted to a C NULL pointer.
 *
 * 2. 3-tuples are expected to have a format character in the first
 *    item, which must be 'i', 'f', 'd', 'q', or 'P'.
 *    The second item will have to be an integer, float, double, long long
 *    or integer (denoting an address void *), will be converted to the
 *    corresponding C data type and passed by value.
 *
 * 3. Other Python objects are tested for an '_as_parameter_' attribute.
 *    The value of this attribute must be an integer which will be passed
 *    by value, or a 2-tuple or 3-tuple which will be used according
 *    to point 2 above. The third item (if any), is ignored. It is normally
 *    used to keep the object alive where this parameter refers to.
 *    XXX This convention is dangerous - you can construct arbitrary tuples
 *    in Python and pass them. Would it be safer to use a custom container
 *    datatype instead of a tuple?
 *
 * 4. Other Python objects cannot be passed as parameters - an exception is raised.
 *
 * 5. ConvParam will store the converted result in a struct containing format
 *    and value.
 */

union result {
    char c;
    char b;
    short h;
    int i;
    long l;
    long long q;
    long double g;
    double d;
    float f;
    void *p;
    double D[2];
    float F[2];
    long double G[2];
};

struct argument {
    ffi_type *ffi_type;
    TyObject *keep;
    union result value;
};

/*
 * Convert a single Python object into a PyCArgObject and return it.
 */
static int ConvParam(ctypes_state *st,
                     TyObject *obj, Ty_ssize_t index, struct argument *pa)
{
    pa->keep = NULL; /* so we cannot forget it later */

    StgInfo *info;
    int result = PyStgInfo_FromObject(st, obj, &info);
    if (result < 0) {
        return -1;
    }
    if (info) {
        assert(info);
        PyCArgObject *carg;
        assert(info->paramfunc);
        /* If it has an stginfo, it is a CDataObject */
        Ty_BEGIN_CRITICAL_SECTION(obj);
        carg = info->paramfunc(st, (CDataObject *)obj);
        Ty_END_CRITICAL_SECTION();
        if (carg == NULL)
            return -1;
        pa->ffi_type = carg->pffi_type;
        memcpy(&pa->value, &carg->value, sizeof(pa->value));
        pa->keep = (TyObject *)carg;
        return 0;
    }

    if (PyCArg_CheckExact(st, obj)) {
        PyCArgObject *carg = (PyCArgObject *)obj;
        pa->ffi_type = carg->pffi_type;
        pa->keep = Ty_NewRef(obj);
        memcpy(&pa->value, &carg->value, sizeof(pa->value));
        return 0;
    }

    /* check for None, integer, string or unicode and use directly if successful */
    if (obj == Ty_None) {
        pa->ffi_type = &ffi_type_pointer;
        pa->value.p = NULL;
        return 0;
    }

    if (TyLong_Check(obj)) {
        pa->ffi_type = &ffi_type_sint;
        pa->value.i = (long)TyLong_AsUnsignedLong(obj);
        if (pa->value.i == -1 && TyErr_Occurred()) {
            TyErr_Clear();
            pa->value.i = TyLong_AsLong(obj);
            if (pa->value.i == -1 && TyErr_Occurred()) {
                TyErr_SetString(TyExc_OverflowError,
                                "int too long to convert");
                return -1;
            }
        }
        return 0;
    }

    if (TyBytes_Check(obj)) {
        pa->ffi_type = &ffi_type_pointer;
        pa->value.p = TyBytes_AsString(obj);
        pa->keep = Ty_NewRef(obj);
        return 0;
    }

    if (TyUnicode_Check(obj)) {
        pa->ffi_type = &ffi_type_pointer;
        pa->value.p = TyUnicode_AsWideCharString(obj, NULL);
        if (pa->value.p == NULL)
            return -1;
        pa->keep = PyCapsule_New(pa->value.p, CTYPES_CAPSULE_NAME_PYMEM, pymem_destructor);
        if (!pa->keep) {
            TyMem_Free(pa->value.p);
            return -1;
        }
        return 0;
    }

    {
        TyObject *arg;
        if (PyObject_GetOptionalAttr(obj, &_Ty_ID(_as_parameter_), &arg) < 0) {
            return -1;
        }
        /* Which types should we exactly allow here?
           integers are required for using Python classes
           as parameters (they have to expose the '_as_parameter_'
           attribute)
        */
        if (arg) {
            int result;
            result = ConvParam(st, arg, index, pa);
            Ty_DECREF(arg);
            return result;
        }
        TyErr_Format(TyExc_TypeError,
                     "Don't know how to convert parameter %d",
                     Ty_SAFE_DOWNCAST(index, Ty_ssize_t, int));
        return -1;
    }
}

#if defined(MS_WIN32) && !defined(_WIN32_WCE)
/*
Per: https://msdn.microsoft.com/en-us/library/7572ztz4.aspx
To be returned by value in RAX, user-defined types must have a length
of 1, 2, 4, 8, 16, 32, or 64 bits
*/
int can_return_struct_as_int(size_t s)
{
    return s == 1 || s == 2 || s == 4;
}

int can_return_struct_as_sint64(size_t s)
{
#ifdef _M_ARM
    // 8 byte structs cannot be returned in a register on ARM32
    return 0;
#else
    return s == 8;
#endif
}
#endif


// returns NULL with exception set on error
ffi_type *_ctypes_get_ffi_type(ctypes_state *st, TyObject *obj)
{
    if (obj == NULL) {
        return &ffi_type_sint;
    }

    StgInfo *info;
    if (PyStgInfo_FromType(st, obj, &info) < 0) {
        return NULL;
    }

    if (info == NULL) {
        return &ffi_type_sint;
    }
#if defined(MS_WIN32) && !defined(_WIN32_WCE)
    /* This little trick works correctly with MSVC.
       It returns small structures in registers
    */
    if (info->ffi_type_pointer.type == FFI_TYPE_STRUCT) {
        if (can_return_struct_as_int(info->ffi_type_pointer.size))
            return &ffi_type_sint32;
        else if (can_return_struct_as_sint64 (info->ffi_type_pointer.size))
            return &ffi_type_sint64;
    }
#endif
    return &info->ffi_type_pointer;
}


/*
 * libffi uses:
 *
 * ffi_status ffi_prep_cif(ffi_cif *cif, ffi_abi abi,
 *                         unsigned int nargs,
 *                         ffi_type *rtype,
 *                         ffi_type **atypes);
 *
 * and then
 *
 * void ffi_call(ffi_cif *cif, void *fn, void *rvalue, void **avalues);
 */
static int _call_function_pointer(ctypes_state *st,
                                  int flags,
                                  PPROC pProc,
                                  void **avalues,
                                  ffi_type **atypes,
                                  ffi_type *restype,
                                  void *resmem,
                                  int argcount,
                                  int argtypecount)
{
    TyThreadState *_save = NULL; /* For Ty_BLOCK_THREADS and Ty_UNBLOCK_THREADS */
    TyObject *error_object = NULL;
    int *space;
    ffi_cif cif;
    int cc;
#if defined(MS_WIN32) && !defined(DONT_USE_SEH)
    DWORD dwExceptionCode = 0;
    EXCEPTION_RECORD record;
#endif
    /* XXX check before here */
    if (restype == NULL) {
        TyErr_SetString(TyExc_RuntimeError,
                        "No ffi_type for result");
        return -1;
    }

    cc = FFI_DEFAULT_ABI;
#if defined(MS_WIN32) && !defined(MS_WIN64) && !defined(_WIN32_WCE) && !defined(_M_ARM)
    if ((flags & FUNCFLAG_CDECL) == 0)
        cc = FFI_STDCALL;
#endif

#   ifdef USING_APPLE_OS_LIBFFI
#    ifdef HAVE_BUILTIN_AVAILABLE
#      define HAVE_FFI_PREP_CIF_VAR_RUNTIME __builtin_available(macos 10.15, ios 13, watchos 6, tvos 13, *)
#    else
#      define HAVE_FFI_PREP_CIF_VAR_RUNTIME (ffi_prep_cif_var != NULL)
#    endif
#   elif HAVE_FFI_PREP_CIF_VAR
#      define HAVE_FFI_PREP_CIF_VAR_RUNTIME true
#   else
#      define HAVE_FFI_PREP_CIF_VAR_RUNTIME false
#   endif

    /* Even on Apple-arm64 the calling convention for variadic functions coincides
     * with the standard calling convention in the case that the function called
     * only with its fixed arguments.   Thus, we do not need a special flag to be
     * set on variadic functions.   We treat a function as variadic if it is called
     * with a nonzero number of variadic arguments */
    bool is_variadic = (argtypecount != 0 && argcount > argtypecount);
    (void) is_variadic;

#if defined(__APPLE__) && defined(__arm64__)
    if (is_variadic) {
        if (HAVE_FFI_PREP_CIF_VAR_RUNTIME) {
        } else {
            TyErr_SetString(TyExc_NotImplementedError, "ffi_prep_cif_var() is missing");
            return -1;
        }
    }
#endif

#if HAVE_FFI_PREP_CIF_VAR
    if (is_variadic) {
        if (HAVE_FFI_PREP_CIF_VAR_RUNTIME) {
            if (FFI_OK != ffi_prep_cif_var(&cif,
                                        cc,
                                        argtypecount,
                                        argcount,
                                        restype,
                                        atypes)) {
                TyErr_SetString(TyExc_RuntimeError,
                                "ffi_prep_cif_var failed");
                return -1;
            }
        } else {
            if (FFI_OK != ffi_prep_cif(&cif,
                                       cc,
                                       argcount,
                                       restype,
                                       atypes)) {
                TyErr_SetString(TyExc_RuntimeError,
                                "ffi_prep_cif failed");
                return -1;
            }
        }
    } else
#endif

    {
        if (FFI_OK != ffi_prep_cif(&cif,
                                   cc,
                                   argcount,
                                   restype,
                                   atypes)) {
            TyErr_SetString(TyExc_RuntimeError,
                            "ffi_prep_cif failed");
            return -1;
        }
    }

    if (flags & (FUNCFLAG_USE_ERRNO | FUNCFLAG_USE_LASTERROR)) {
        error_object = _ctypes_get_errobj(st, &space);
        if (error_object == NULL)
            return -1;
    }
    if ((flags & FUNCFLAG_PYTHONAPI) == 0)
        Ty_UNBLOCK_THREADS
    if (flags & FUNCFLAG_USE_ERRNO) {
        int temp = space[0];
        space[0] = errno;
        errno = temp;
    }
#ifdef MS_WIN32
    if (flags & FUNCFLAG_USE_LASTERROR) {
        int temp = space[1];
        space[1] = GetLastError();
        SetLastError(temp);
    }
#ifndef DONT_USE_SEH
    __try {
#endif
#endif
                ffi_call(&cif, (void *)pProc, resmem, avalues);
#ifdef MS_WIN32
#ifndef DONT_USE_SEH
    }
    __except (HandleException(GetExceptionInformation(),
                              &dwExceptionCode, &record)) {
        ;
    }
#endif
    if (flags & FUNCFLAG_USE_LASTERROR) {
        int temp = space[1];
        space[1] = GetLastError();
        SetLastError(temp);
    }
#endif
    if (flags & FUNCFLAG_USE_ERRNO) {
        int temp = space[0];
        space[0] = errno;
        errno = temp;
    }
    if ((flags & FUNCFLAG_PYTHONAPI) == 0)
        Ty_BLOCK_THREADS
    Ty_XDECREF(error_object);
#ifdef MS_WIN32
#ifndef DONT_USE_SEH
    if (dwExceptionCode) {
        SetException(dwExceptionCode, &record);
        return -1;
    }
#endif
#endif
    if ((flags & FUNCFLAG_PYTHONAPI) && TyErr_Occurred())
        return -1;
    return 0;
}

/*
 * Convert the C value in result into a Python object, depending on restype.
 *
 * - If restype is NULL, return a Python integer.
 * - If restype is None, return None.
 * - If restype is a simple ctypes type (c_int, c_void_p), call the type's getfunc,
 *   pass the result to checker and return the result.
 * - If restype is another ctypes type, return an instance of that.
 * - Otherwise, call restype and return the result.
 */
static TyObject *GetResult(ctypes_state *st,
                           TyObject *restype, void *result, TyObject *checker)
{
    TyObject *retval, *v;

    if (restype == NULL)
        return TyLong_FromLong(*(int *)result);

    if (restype == Ty_None) {
        Py_RETURN_NONE;
    }

    StgInfo *info;
    if (PyStgInfo_FromType(st, restype, &info) < 0) {
        return NULL;
    }
    if (info == NULL) {
        return PyObject_CallFunction(restype, "i", *(int *)result);
    }

    if (info->getfunc && !_ctypes_simple_instance(st, restype)) {
        retval = info->getfunc(result, info->size);
        /* If restype is py_object (detected by comparing getfunc with
           O_get), we have to call Ty_XDECREF because O_get has already
           called Ty_INCREF, unless the result was NULL, in which case
           an error is set (by the called function, or by O_get).
        */
        if (info->getfunc == _ctypes_get_fielddesc("O")->getfunc) {
            Ty_XDECREF(retval);
        }
    }
    else {
        retval = PyCData_FromBaseObj(st, restype, NULL, 0, result);
    }
    if (!checker || !retval)
        return retval;

    v = PyObject_CallOneArg(checker, retval);
    if (v == NULL)
        _TyTraceback_Add("GetResult", "_ctypes/callproc.c", __LINE__-2);
    Ty_DECREF(retval);
    return v;
}

/*
 * Raise a new exception 'exc_class', adding additional text to the original
 * exception string.
 */
void _ctypes_extend_error(TyObject *exc_class, const char *fmt, ...)
{
    va_list vargs;

    va_start(vargs, fmt);
    TyObject *s = TyUnicode_FromFormatV(fmt, vargs);
    va_end(vargs);
    if (s == NULL) {
        return;
    }

    assert(TyErr_Occurred());
    TyObject *exc = TyErr_GetRaisedException();
    assert(exc != NULL);
    TyObject *cls_str = TyType_GetName(Ty_TYPE(exc));
    if (cls_str) {
        TyUnicode_AppendAndDel(&s, cls_str);
        TyUnicode_AppendAndDel(&s, TyUnicode_FromString(": "));
        if (s == NULL) {
            goto error;
        }
    }
    else {
        TyErr_Clear();
    }

    TyObject *msg_str = PyObject_Str(exc);
    if (msg_str) {
        TyUnicode_AppendAndDel(&s, msg_str);
    }
    else {
        TyErr_Clear();
        TyUnicode_AppendAndDel(&s, TyUnicode_FromString("???"));
    }
    if (s == NULL) {
        goto error;
    }
    TyErr_SetObject(exc_class, s);
error:
    Ty_XDECREF(exc);
    Ty_XDECREF(s);
}


#ifdef MS_WIN32

static TyObject *
GetComError(ctypes_state *st, HRESULT errcode, GUID *riid, IUnknown *pIunk)
{
    HRESULT hr;
    ISupportErrorInfo *psei = NULL;
    IErrorInfo *pei = NULL;
    BSTR descr=NULL, helpfile=NULL, source=NULL;
    GUID guid;
    DWORD helpcontext=0;
    LPOLESTR progid;
    TyObject *obj;
    LPOLESTR text;

    /* We absolutely have to release the GIL during COM method calls,
       otherwise we may get a deadlock!
    */
    Ty_BEGIN_ALLOW_THREADS

    hr = pIunk->lpVtbl->QueryInterface(pIunk, &IID_ISupportErrorInfo, (void **)&psei);
    if (FAILED(hr))
        goto failed;

    hr = psei->lpVtbl->InterfaceSupportsErrorInfo(psei, riid);
    psei->lpVtbl->Release(psei);
    if (FAILED(hr))
        goto failed;

    hr = GetErrorInfo(0, &pei);
    if (hr != S_OK)
        goto failed;

    pei->lpVtbl->GetDescription(pei, &descr);
    pei->lpVtbl->GetGUID(pei, &guid);
    pei->lpVtbl->GetHelpContext(pei, &helpcontext);
    pei->lpVtbl->GetHelpFile(pei, &helpfile);
    pei->lpVtbl->GetSource(pei, &source);

    pei->lpVtbl->Release(pei);

  failed:
    Ty_END_ALLOW_THREADS

    progid = NULL;
    ProgIDFromCLSID(&guid, &progid);

    text = FormatError(errcode);
    obj = Ty_BuildValue(
        "iu(uuuiu)",
        errcode,
        text,
        descr, source, helpfile, helpcontext,
        progid);
    if (obj) {
        TyErr_SetObject((TyObject *)st->PyComError_Type, obj);
        Ty_DECREF(obj);
    }
    LocalFree(text);

    if (descr)
        SysFreeString(descr);
    if (helpfile)
        SysFreeString(helpfile);
    if (source)
        SysFreeString(source);

    return NULL;
}
#endif

#if (defined(__x86_64__) && (defined(__MINGW64__) || defined(__CYGWIN__))) || \
    defined(__aarch64__) || defined(__riscv)
#define CTYPES_PASS_BY_REF_HACK
#define POW2(x) (((x & ~(x - 1)) == x) ? x : 0)
#define IS_PASS_BY_REF(x) (x > 8 || !POW2(x))
#endif

/*
 * Requirements, must be ensured by the caller:
 * - argtuple is tuple of arguments
 * - argtypes is either NULL, or a tuple of the same size as argtuple
 *
 * - XXX various requirements for restype, not yet collected
 */
TyObject *_ctypes_callproc(ctypes_state *st,
                    PPROC pProc,
                    TyObject *argtuple,
#ifdef MS_WIN32
                    IUnknown *pIunk,
                    GUID *iid,
#endif
                    int flags,
                    TyObject *argtypes, /* misleading name: This is a tuple of
                                           methods, not types: the .from_param
                                           class methods of the types */
            TyObject *restype,
            TyObject *checker)
{
    Ty_ssize_t i, n, argcount, argtype_count;
    void *resbuf;
    struct argument *args, *pa;
    ffi_type **atypes;
    ffi_type *rtype;
    void **avalues;
    TyObject *retval = NULL;

    // Both call_function and call_cdeclfunction call us:
#if SIZEOF_VOID_P == SIZEOF_LONG
    if (TySys_Audit("ctypes.call_function", "kO",
                    (unsigned long)pProc, argtuple) < 0) {
#elif SIZEOF_VOID_P == SIZEOF_LONG_LONG
    if (TySys_Audit("ctypes.call_function", "KO",
                    (unsigned long long)pProc, argtuple) < 0) {
#else
# warning "unexpected pointer size, you may see odd values in audit hooks"
    if (TySys_Audit("ctypes.call_function", "nO",
                    (Ty_ssize_t)pProc, argtuple) < 0) {
#endif
        return NULL;
    }

    n = argcount = TyTuple_GET_SIZE(argtuple);
#ifdef MS_WIN32
    /* an optional COM object this pointer */
    if (pIunk)
        ++argcount;
#endif

    if (argcount > CTYPES_MAX_ARGCOUNT)
    {
        TyErr_Format(st->TyExc_ArgError, "too many arguments (%zi), maximum is %i",
                     argcount, CTYPES_MAX_ARGCOUNT);
        return NULL;
    }

    args = alloca(sizeof(struct argument) * argcount);
    memset(args, 0, sizeof(struct argument) * argcount);
    argtype_count = argtypes ? TyTuple_GET_SIZE(argtypes) : 0;
#ifdef MS_WIN32
    if (pIunk) {
        args[0].ffi_type = &ffi_type_pointer;
        args[0].value.p = pIunk;
        pa = &args[1];
    } else
#endif
        pa = &args[0];

    /* Convert the arguments */
    for (i = 0; i < n; ++i, ++pa) {
        TyObject *converter;
        TyObject *arg;
        int err;

        arg = TyTuple_GET_ITEM(argtuple, i);            /* borrowed ref */
        /* For cdecl functions, we allow more actual arguments
           than the length of the argtypes tuple.
           This is checked in _ctypes::PyCFuncPtr_Call
        */
        if (argtypes && argtype_count > i) {
            TyObject *v;
            converter = TyTuple_GET_ITEM(argtypes, i);
            v = PyObject_CallOneArg(converter, arg);
            if (v == NULL) {
                _ctypes_extend_error(st->TyExc_ArgError, "argument %zd: ", i+1);
                goto cleanup;
            }

            err = ConvParam(st, v, i+1, pa);
            Ty_DECREF(v);
            if (-1 == err) {
                _ctypes_extend_error(st->TyExc_ArgError, "argument %zd: ", i+1);
                goto cleanup;
            }
        } else {
            err = ConvParam(st, arg, i+1, pa);
            if (-1 == err) {
                _ctypes_extend_error(st->TyExc_ArgError, "argument %zd: ", i+1);
                goto cleanup; /* leaking ? */
            }
        }
    }

    if (restype == Ty_None) {
        rtype = &ffi_type_void;
    } else {
        rtype = _ctypes_get_ffi_type(st, restype);
    }
    if (!rtype) {
        goto cleanup;
    }

    resbuf = alloca(max(rtype->size, sizeof(ffi_arg)));

#ifdef _Py_MEMORY_SANITIZER
    /* ffi_call actually initializes resbuf, but from asm, which
     * MemorySanitizer can't detect. Avoid false positives from MSan. */
    if (resbuf != NULL) {
        __msan_unpoison(resbuf, max(rtype->size, sizeof(ffi_arg)));
    }
#endif
    avalues = (void **)alloca(sizeof(void *) * argcount);
    atypes = (ffi_type **)alloca(sizeof(ffi_type *) * argcount);
    if (!resbuf || !avalues || !atypes) {
        TyErr_NoMemory();
        goto cleanup;
    }
    for (i = 0; i < argcount; ++i) {
        atypes[i] = args[i].ffi_type;
#ifdef CTYPES_PASS_BY_REF_HACK
        size_t size = atypes[i]->size;
        if (IS_PASS_BY_REF(size)) {
            void *tmp = alloca(size);
            if (atypes[i]->type == FFI_TYPE_STRUCT)
                memcpy(tmp, args[i].value.p, size);
            else
                memcpy(tmp, (void*)&args[i].value, size);

            avalues[i] = tmp;
        }
        else
#endif
        if (atypes[i]->type == FFI_TYPE_STRUCT)
            avalues[i] = (void *)args[i].value.p;
        else
            avalues[i] = (void *)&args[i].value;
    }

    if (-1 == _call_function_pointer(st, flags, pProc, avalues, atypes,
                                     rtype, resbuf,
                                     Ty_SAFE_DOWNCAST(argcount, Ty_ssize_t, int),
                                     Ty_SAFE_DOWNCAST(argtype_count, Ty_ssize_t, int)))
        goto cleanup;

#ifdef WORDS_BIGENDIAN
    /* libffi returns the result in a buffer with sizeof(ffi_arg). This
       causes problems on big endian machines, since the result buffer
       address cannot simply be used as result pointer, instead we must
       adjust the pointer value:
     */
    /*
      XXX I should find out and clarify why this is needed at all,
      especially why adjusting for ffi_type_float must be avoided on
      64-bit platforms.
     */
    if (rtype->type != FFI_TYPE_FLOAT
        && rtype->type != FFI_TYPE_STRUCT
        && rtype->size < sizeof(ffi_arg))
    {
        resbuf = (char *)resbuf + sizeof(ffi_arg) - rtype->size;
    }
#endif

#ifdef MS_WIN32
    if (iid && pIunk) {
        if (*(int *)resbuf & 0x80000000)
            retval = GetComError(st, *(HRESULT *)resbuf, iid, pIunk);
        else
            retval = TyLong_FromLong(*(int *)resbuf);
    } else if (flags & FUNCFLAG_HRESULT) {
        if (*(int *)resbuf & 0x80000000)
            retval = TyErr_SetFromWindowsErr(*(int *)resbuf);
        else
            retval = TyLong_FromLong(*(int *)resbuf);
    } else
#endif
        retval = GetResult(st, restype, resbuf, checker);
  cleanup:
    for (i = 0; i < argcount; ++i)
        Ty_XDECREF(args[i].keep);
    return retval;
}

static int
_parse_voidp(TyObject *obj, void *arg)
{
    void **address = (void **)arg;
    *address = TyLong_AsVoidPtr(obj);
    if (*address == NULL)
        return 0;
    return 1;
}

#ifdef MS_WIN32

TyDoc_STRVAR(format_error_doc,
"FormatError([integer]) -> string\n\
\n\
Convert a win32 error code into a string. If the error code is not\n\
given, the return value of a call to GetLastError() is used.\n");
static TyObject *format_error(TyObject *self, TyObject *args)
{
    TyObject *result;
    wchar_t *lpMsgBuf;
    DWORD code = 0;
    if (!TyArg_ParseTuple(args, "|i:FormatError", &code))
        return NULL;
    if (code == 0)
        code = GetLastError();
    lpMsgBuf = FormatError(code);
    if (lpMsgBuf) {
        result = TyUnicode_FromWideChar(lpMsgBuf, wcslen(lpMsgBuf));
        LocalFree(lpMsgBuf);
    } else {
        result = TyUnicode_FromString("<no description>");
    }
    return result;
}

TyDoc_STRVAR(load_library_doc,
"LoadLibrary(name, load_flags) -> handle\n\
\n\
Load an executable (usually a DLL), and return a handle to it.\n\
The handle may be used to locate exported functions in this\n\
module. load_flags are as defined for LoadLibraryEx in the\n\
Windows API.\n");
static TyObject *load_library(TyObject *self, TyObject *args)
{
    TyObject *nameobj;
    int load_flags = 0;
    HMODULE hMod;
    DWORD err;

    if (!TyArg_ParseTuple(args, "U|i:LoadLibrary", &nameobj, &load_flags))
        return NULL;

    if (TySys_Audit("ctypes.dlopen", "O", nameobj) < 0) {
        return NULL;
    }

    WCHAR *name = TyUnicode_AsWideCharString(nameobj, NULL);
    if (!name)
        return NULL;

    Ty_BEGIN_ALLOW_THREADS
    /* bpo-36085: Limit DLL search directories to avoid pre-loading
     * attacks and enable use of the AddDllDirectory function.
     */
    hMod = LoadLibraryExW(name, NULL, (DWORD)load_flags);
    err = hMod ? 0 : GetLastError();
    Ty_END_ALLOW_THREADS

    TyMem_Free(name);
    if (err == ERROR_MOD_NOT_FOUND) {
        TyErr_Format(TyExc_FileNotFoundError,
                     ("Could not find module '%.500S' (or one of its "
                      "dependencies). Try using the full path with "
                      "constructor syntax."),
                     nameobj);
        return NULL;
    } else if (err) {
        return TyErr_SetFromWindowsErr(err);
    }
#ifdef _WIN64
    return TyLong_FromVoidPtr(hMod);
#else
    return TyLong_FromLong((int)hMod);
#endif
}

TyDoc_STRVAR(free_library_doc,
"FreeLibrary(handle) -> void\n\
\n\
Free the handle of an executable previously loaded by LoadLibrary.\n");
static TyObject *free_library(TyObject *self, TyObject *args)
{
    void *hMod;
    BOOL result;
    DWORD err;
    if (!TyArg_ParseTuple(args, "O&:FreeLibrary", &_parse_voidp, &hMod))
        return NULL;

    Ty_BEGIN_ALLOW_THREADS
    result = FreeLibrary((HMODULE)hMod);
    err = result ? 0 : GetLastError();
    Ty_END_ALLOW_THREADS

    if (!result) {
        return TyErr_SetFromWindowsErr(err);
    }
    Py_RETURN_NONE;
}

TyDoc_STRVAR(copy_com_pointer_doc,
"CopyComPointer(src, dst) -> HRESULT value\n");

static TyObject *
copy_com_pointer(TyObject *self, TyObject *args)
{
    TyObject *p1, *p2, *r = NULL;
    struct argument a, b;
    IUnknown *src, **pdst;
    if (!TyArg_ParseTuple(args, "OO:CopyComPointer", &p1, &p2))
        return NULL;
    a.keep = b.keep = NULL;

    ctypes_state *st = get_module_state(self);
    if (ConvParam(st, p1, 0, &a) < 0 || ConvParam(st, p2, 1, &b) < 0) {
        goto done;
    }
    src = (IUnknown *)a.value.p;
    pdst = (IUnknown **)b.value.p;

    if (pdst == NULL)
        r = TyLong_FromLong(E_POINTER);
    else {
        if (src)
            src->lpVtbl->AddRef(src);
        *pdst = src;
        r = TyLong_FromLong(S_OK);
    }
  done:
    Ty_XDECREF(a.keep);
    Ty_XDECREF(b.keep);
    return r;
}
#else
#ifdef __APPLE__
#ifdef HAVE_DYLD_SHARED_CACHE_CONTAINS_PATH
#  ifdef HAVE_BUILTIN_AVAILABLE
#    define HAVE_DYLD_SHARED_CACHE_CONTAINS_PATH_RUNTIME \
        __builtin_available(macOS 11.0, iOS 14.0, tvOS 14.0, watchOS 7.0, *)
#  else
#    define HAVE_DYLD_SHARED_CACHE_CONTAINS_PATH_RUNTIME \
         (_dyld_shared_cache_contains_path != NULL)
#  endif
#else
// Support the deprecated case of compiling on an older macOS version
static void *libsystem_b_handle;
static bool (*_dyld_shared_cache_contains_path)(const char *path);

__attribute__((constructor)) void load_dyld_shared_cache_contains_path(void) {
    libsystem_b_handle = dlopen("/usr/lib/libSystem.B.dylib", RTLD_LAZY);
    if (libsystem_b_handle != NULL) {
        _dyld_shared_cache_contains_path = dlsym(libsystem_b_handle, "_dyld_shared_cache_contains_path");
    }
}

__attribute__((destructor)) void unload_dyld_shared_cache_contains_path(void) {
    if (libsystem_b_handle != NULL) {
        dlclose(libsystem_b_handle);
    }
}
#define HAVE_DYLD_SHARED_CACHE_CONTAINS_PATH_RUNTIME \
    _dyld_shared_cache_contains_path != NULL
#endif

static TyObject *py_dyld_shared_cache_contains_path(TyObject *self, TyObject *args)
{
     TyObject *name, *name2;
     char *name_str;

     if (HAVE_DYLD_SHARED_CACHE_CONTAINS_PATH_RUNTIME) {
         int r;

         if (!TyArg_ParseTuple(args, "O", &name))
             return NULL;

         if (name == Ty_None)
             Py_RETURN_FALSE;

         if (TyUnicode_FSConverter(name, &name2) == 0)
             return NULL;
         name_str = TyBytes_AS_STRING(name2);

         r = _dyld_shared_cache_contains_path(name_str);
         Ty_DECREF(name2);

         if (r) {
             Py_RETURN_TRUE;
         } else {
             Py_RETURN_FALSE;
         }

     } else {
         TyErr_SetString(TyExc_NotImplementedError, "_dyld_shared_cache_contains_path symbol is missing");
         return NULL;
     }

 }
#endif

static TyObject *py_dl_open(TyObject *self, TyObject *args)
{
    TyObject *name, *name2;
    const char *name_str;
    void * handle;
#if HAVE_DECL_RTLD_LOCAL
    int mode = RTLD_NOW | RTLD_LOCAL;
#else
    /* cygwin doesn't define RTLD_LOCAL */
    int mode = RTLD_NOW;
#endif
    if (!TyArg_ParseTuple(args, "O|i:dlopen", &name, &mode))
        return NULL;
    mode |= RTLD_NOW;
    if (name != Ty_None) {
        if (TyUnicode_FSConverter(name, &name2) == 0)
            return NULL;
        name_str = TyBytes_AS_STRING(name2);
    } else {
        name_str = NULL;
        name2 = NULL;
    }
    if (TySys_Audit("ctypes.dlopen", "O", name) < 0) {
        return NULL;
    }
    handle = dlopen(name_str, mode);
    Ty_XDECREF(name2);
    if (!handle) {
        const char *errmsg = dlerror();
        if (errmsg) {
            _TyErr_SetLocaleString(TyExc_OSError, errmsg);
            return NULL;
        }
        TyErr_SetString(TyExc_OSError, "dlopen() error");
        return NULL;
    }
    return TyLong_FromVoidPtr(handle);
}

static TyObject *py_dl_close(TyObject *self, TyObject *args)
{
    void *handle;

    if (!TyArg_ParseTuple(args, "O&:dlclose", &_parse_voidp, &handle))
        return NULL;
    if (dlclose(handle)) {
        const char *errmsg = dlerror();
        if (errmsg) {
            _TyErr_SetLocaleString(TyExc_OSError, errmsg);
            return NULL;
        }
        TyErr_SetString(TyExc_OSError, "dlclose() error");
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *py_dl_sym(TyObject *self, TyObject *args)
{
    char *name;
    void *handle;
    void *ptr;

    if (!TyArg_ParseTuple(args, "O&s:dlsym",
                          &_parse_voidp, &handle, &name))
        return NULL;
    if (TySys_Audit("ctypes.dlsym/handle", "O", args) < 0) {
        return NULL;
    }
#undef USE_DLERROR
    #ifdef __CYGWIN__
        // dlerror() isn't very helpful on cygwin
    #else
        #define USE_DLERROR
        /* dlerror() always returns the latest error.
         *
         * Clear the previous value before calling dlsym(),
         * to ensure we can tell if our call resulted in an error.
         */
        (void)dlerror();
    #endif
    ptr = dlsym((void*)handle, name);
    if (ptr) {
        return TyLong_FromVoidPtr(ptr);
    }
    #ifdef USE_DLERROR
    const char *errmsg = dlerror();
    if (errmsg) {
        _TyErr_SetLocaleString(TyExc_OSError, errmsg);
        return NULL;
    }
    #endif
    #undef USE_DLERROR
    TyErr_Format(TyExc_OSError, "symbol '%s' not found", name);
    return NULL;
}
#endif

/*
 * Only for debugging so far: So that we can call CFunction instances
 *
 * XXX Needs to accept more arguments: flags, argtypes, restype
 */
static TyObject *
call_function(TyObject *self, TyObject *args)
{
    void *func;
    TyObject *arguments;
    TyObject *result;

    if (!TyArg_ParseTuple(args,
                          "O&O!",
                          &_parse_voidp, &func,
                          &TyTuple_Type, &arguments))
        return NULL;

    ctypes_state *st = get_module_state(self);
    result = _ctypes_callproc(st,
                        (PPROC)func,
                        arguments,
#ifdef MS_WIN32
                        NULL,
                        NULL,
#endif
                        0, /* flags */
                NULL, /* self->argtypes */
                NULL, /* self->restype */
                NULL); /* checker */
    return result;
}

/*
 * Only for debugging so far: So that we can call CFunction instances
 *
 * XXX Needs to accept more arguments: flags, argtypes, restype
 */
static TyObject *
call_cdeclfunction(TyObject *self, TyObject *args)
{
    void *func;
    TyObject *arguments;
    TyObject *result;

    if (!TyArg_ParseTuple(args,
                          "O&O!",
                          &_parse_voidp, &func,
                          &TyTuple_Type, &arguments))
        return NULL;

    ctypes_state *st = get_module_state(self);
    result = _ctypes_callproc(st,
                        (PPROC)func,
                        arguments,
#ifdef MS_WIN32
                        NULL,
                        NULL,
#endif
                        FUNCFLAG_CDECL, /* flags */
                        NULL, /* self->argtypes */
                        NULL, /* self->restype */
                        NULL); /* checker */
    return result;
}

/*****************************************************************
 * functions
 */

/*[clinic input]
_ctypes.sizeof
    obj: object
    /
Return the size in bytes of a C instance.

[clinic start generated code]*/

static TyObject *
_ctypes_sizeof(TyObject *module, TyObject *obj)
/*[clinic end generated code: output=ed38a3f364d7bd3e input=321fd0f65cb2d623]*/
{
    ctypes_state *st = get_module_state(module);

    StgInfo *info;
    if (PyStgInfo_FromType(st, obj, &info) < 0) {
        return NULL;
    }
    if (info) {
        return TyLong_FromSsize_t(info->size);
    }

    if (CDataObject_Check(st, obj)) {
        TyObject *ret = NULL;
        Ty_BEGIN_CRITICAL_SECTION(obj);
        ret = TyLong_FromSsize_t(((CDataObject *)obj)->b_size);
        Ty_END_CRITICAL_SECTION();
        return ret;
    }
    TyErr_SetString(TyExc_TypeError,
                    "this type has no size");
    return NULL;
}

TyDoc_STRVAR(alignment_doc,
"alignment(C type) -> integer\n"
"alignment(C instance) -> integer\n"
"Return the alignment requirements of a C instance");

static TyObject *
align_func(TyObject *self, TyObject *obj)
{
    ctypes_state *st = get_module_state(self);
    StgInfo *info;
    if (PyStgInfo_FromAny(st, obj, &info) < 0) {
        return NULL;
    }
    if (info) {
        return TyLong_FromSsize_t(info->align);
    }
    TyErr_SetString(TyExc_TypeError,
                    "no alignment info");
    return NULL;
}


/*[clinic input]
@critical_section obj
_ctypes.byref
    obj: object(subclass_of="clinic_state()->PyCData_Type")
    offset: Ty_ssize_t = 0
    /
Return a pointer lookalike to a C instance, only usable as function argument.

[clinic start generated code]*/

static TyObject *
_ctypes_byref_impl(TyObject *module, TyObject *obj, Ty_ssize_t offset)
/*[clinic end generated code: output=60dec5ed520c71de input=6ec02d95d15fbd56]*/
{
    ctypes_state *st = get_module_state(module);

    PyCArgObject *parg = PyCArgObject_new(st);
    if (parg == NULL)
        return NULL;

    parg->tag = 'P';
    parg->pffi_type = &ffi_type_pointer;
    parg->obj = Ty_NewRef(obj);
    parg->value.p = (char *)((CDataObject *)obj)->b_ptr + offset;
    return (TyObject *)parg;
}

/*[clinic input]
@critical_section obj
_ctypes.addressof
    obj: object(subclass_of="clinic_state()->PyCData_Type")
    /
Return the address of the C instance internal buffer

[clinic start generated code]*/

static TyObject *
_ctypes_addressof_impl(TyObject *module, TyObject *obj)
/*[clinic end generated code: output=30d8e80c4bab70c7 input=d83937d105d3a442]*/
{
    if (TySys_Audit("ctypes.addressof", "(O)", obj) < 0) {
        return NULL;
    }
    return TyLong_FromVoidPtr(((CDataObject *)obj)->b_ptr);
}

static int
converter(TyObject *obj, void *arg)
{
    void **address = (void **)arg;
    *address = TyLong_AsVoidPtr(obj);
    return *address != NULL;
}

static TyObject *
My_PyObj_FromPtr(TyObject *self, TyObject *args)
{
    TyObject *ob;
    if (!TyArg_ParseTuple(args, "O&:PyObj_FromPtr", converter, &ob)) {
        return NULL;
    }
    if (TySys_Audit("ctypes.PyObj_FromPtr", "(O)", ob) < 0) {
        return NULL;
    }
    return Ty_NewRef(ob);
}

static TyObject *
My_Py_INCREF(TyObject *self, TyObject *arg)
{
    Ty_INCREF(arg); /* that's what this function is for */
    Ty_INCREF(arg); /* that for returning it */
    return arg;
}

static TyObject *
My_Py_DECREF(TyObject *self, TyObject *arg)
{
    Ty_DECREF(arg); /* that's what this function is for */
    Ty_INCREF(arg); /* that's for returning it */
    return arg;
}

/*[clinic input]
@critical_section obj
_ctypes.resize
    obj: object(subclass_of="clinic_state()->PyCData_Type", type="CDataObject *")
    size: Ty_ssize_t
    /

[clinic start generated code]*/

static TyObject *
_ctypes_resize_impl(TyObject *module, CDataObject *obj, Ty_ssize_t size)
/*[clinic end generated code: output=11c89c7dbdbcd53f input=bf5a6aaea8514261]*/
{
    ctypes_state *st = get_module_state(module);
    StgInfo *info;
    int result = PyStgInfo_FromObject(st, (TyObject *)obj, &info);
    if (result < 0) {
        return NULL;
    }
    if (info == NULL) {
        TyErr_SetString(TyExc_TypeError,
                        "expected ctypes instance");
        return NULL;
    }
    if (size < info->size) {
        TyErr_Format(TyExc_ValueError,
                     "minimum size is %zd",
                     info->size);
        return NULL;
    }
    if (obj->b_needsfree == 0) {
        TyErr_Format(TyExc_ValueError,
                     "Memory cannot be resized because this object doesn't own it");
        return NULL;
    }
    if ((size_t)size <= sizeof(obj->b_value)) {
        /* internal default buffer is large enough */
        obj->b_size = size;
        goto done;
    }
    if (!_CDataObject_HasExternalBuffer(obj)) {
        /* We are currently using the objects default buffer, but it
           isn't large enough any more. */
        void *ptr = TyMem_Calloc(1, size);
        if (ptr == NULL)
            return TyErr_NoMemory();
        memmove(ptr, obj->b_ptr, obj->b_size);
        obj->b_ptr = ptr;
        obj->b_size = size;
    } else {
        void * ptr = TyMem_Realloc(obj->b_ptr, size);
        if (ptr == NULL)
            return TyErr_NoMemory();
        obj->b_ptr = ptr;
        obj->b_size = size;
    }
  done:
    Py_RETURN_NONE;
}

static TyObject *
unpickle(TyObject *self, TyObject *args)
{
    TyObject *typ, *state, *meth, *obj, *result;

    if (!TyArg_ParseTuple(args, "OO!", &typ, &TyTuple_Type, &state))
        return NULL;
    obj = PyObject_CallMethodOneArg(typ, &_Ty_ID(__new__), typ);
    if (obj == NULL)
        return NULL;

    meth = PyObject_GetAttr(obj, &_Ty_ID(__setstate__));
    if (meth == NULL) {
        goto error;
    }

    result = PyObject_Call(meth, state, NULL);
    Ty_DECREF(meth);
    if (result == NULL) {
        goto error;
    }
    Ty_DECREF(result);

    return obj;

error:
    Ty_DECREF(obj);
    return NULL;
}

static TyObject *
buffer_info(TyObject *self, TyObject *arg)
{
    TyObject *shape;
    Ty_ssize_t i;

    ctypes_state *st = get_module_state(self);
    StgInfo *info;
    if (PyStgInfo_FromAny(st, arg, &info) < 0) {
        return NULL;
    }
    if (info == NULL) {
        TyErr_SetString(TyExc_TypeError,
                        "not a ctypes type or object");
        return NULL;
    }
    shape = TyTuple_New(info->ndim);
    if (shape == NULL)
        return NULL;
    for (i = 0; i < (int)info->ndim; ++i)
        TyTuple_SET_ITEM(shape, i, TyLong_FromSsize_t(info->shape[i]));

    if (TyErr_Occurred()) {
        Ty_DECREF(shape);
        return NULL;
    }
    return Ty_BuildValue("siN", info->format, info->ndim, shape);
}



TyMethodDef _ctypes_module_methods[] = {
    {"get_errno", get_errno, METH_NOARGS},
    {"set_errno", set_errno, METH_VARARGS},
    {"_unpickle", unpickle, METH_VARARGS },
    {"buffer_info", buffer_info, METH_O, "Return buffer interface information"},
    _CTYPES_RESIZE_METHODDEF
#ifdef MS_WIN32
    {"get_last_error", get_last_error, METH_NOARGS},
    {"set_last_error", set_last_error, METH_VARARGS},
    {"CopyComPointer", copy_com_pointer, METH_VARARGS, copy_com_pointer_doc},
    {"FormatError", format_error, METH_VARARGS, format_error_doc},
    {"LoadLibrary", load_library, METH_VARARGS, load_library_doc},
    {"FreeLibrary", free_library, METH_VARARGS, free_library_doc},
    {"_check_HRESULT", check_hresult, METH_VARARGS},
#else
    {"dlopen", py_dl_open, METH_VARARGS,
     "dlopen(name, flag={RTLD_GLOBAL|RTLD_LOCAL}) open a shared library"},
    {"dlclose", py_dl_close, METH_VARARGS, "dlclose a library"},
    {"dlsym", py_dl_sym, METH_VARARGS, "find symbol in shared library"},
#endif
#ifdef __APPLE__
     {"_dyld_shared_cache_contains_path", py_dyld_shared_cache_contains_path, METH_VARARGS, "check if path is in the shared cache"},
#endif
    {"alignment", align_func, METH_O, alignment_doc},
    _CTYPES_SIZEOF_METHODDEF
    _CTYPES_BYREF_METHODDEF
    _CTYPES_ADDRESSOF_METHODDEF
    {"call_function", call_function, METH_VARARGS },
    {"call_cdeclfunction", call_cdeclfunction, METH_VARARGS },
    {"PyObj_FromPtr", My_PyObj_FromPtr, METH_VARARGS },
    {"Ty_INCREF", My_Py_INCREF, METH_O },
    {"Ty_DECREF", My_Py_DECREF, METH_O },
    {NULL,      NULL}        /* Sentinel */
};
