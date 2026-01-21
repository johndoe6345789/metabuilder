/*
 * Declarations shared between the different parts of the io module
 */

#include "exports.h"

#include "pycore_moduleobject.h"  // _TyModule_GetState()
#include "pycore_typeobject.h"    // _TyType_GetModuleState()
#include "structmember.h"

/* Type specs */
extern TyType_Spec bufferediobase_spec;
extern TyType_Spec bufferedrandom_spec;
extern TyType_Spec bufferedreader_spec;
extern TyType_Spec bufferedrwpair_spec;
extern TyType_Spec bufferedwriter_spec;
extern TyType_Spec bytesio_spec;
extern TyType_Spec bytesiobuf_spec;
extern TyType_Spec fileio_spec;
extern TyType_Spec iobase_spec;
extern TyType_Spec nldecoder_spec;
extern TyType_Spec rawiobase_spec;
extern TyType_Spec stringio_spec;
extern TyType_Spec textiobase_spec;
extern TyType_Spec textiowrapper_spec;

#ifdef HAVE_WINDOWS_CONSOLE_IO
extern TyType_Spec winconsoleio_spec;
#endif

/* These functions are used as METH_NOARGS methods, are normally called
 * with args=NULL, and return a new reference.
 * BUT when args=Ty_True is passed, they return a borrowed reference.
 */
typedef struct _io_state _PyIO_State;  // Forward decl.
extern TyObject* _PyIOBase_check_readable(_PyIO_State *state,
                                          TyObject *self, TyObject *args);
extern TyObject* _PyIOBase_check_writable(_PyIO_State *state,
                                          TyObject *self, TyObject *args);
extern TyObject* _PyIOBase_check_seekable(_PyIO_State *state,
                                          TyObject *self, TyObject *args);
extern TyObject* _PyIOBase_check_closed(TyObject *self, TyObject *args);

/* Helper for finalization.
   This function will revive an object ready to be deallocated and try to
   close() it. It returns 0 if the object can be destroyed, or -1 if it
   is alive again. */
extern int _PyIOBase_finalize(TyObject *self);

/* Returns true if the given FileIO object is closed.
   Doesn't check the argument type, so be careful! */
extern int _PyFileIO_closed(TyObject *self);

/* Shortcut to the core of the IncrementalNewlineDecoder.decode method */
extern TyObject *_PyIncrementalNewlineDecoder_decode(
    TyObject *self, TyObject *input, int final);

/* Finds the first line ending between `start` and `end`.
   If found, returns the index after the line ending and doesn't touch
   `*consumed`.
   If not found, returns -1 and sets `*consumed` to the number of characters
   which can be safely put aside until another search.

   NOTE: for performance reasons, `end` must point to a NUL character ('\0').
   Otherwise, the function will scan further and return garbage.

   There are three modes, in order of priority:
   * translated: Only find \n (assume newlines already translated)
   * universal: Use universal newlines algorithm
   * Otherwise, the line ending is specified by readnl, a str object */
extern Ty_ssize_t _PyIO_find_line_ending(
    int translated, int universal, TyObject *readnl,
    int kind, const char *start, const char *end, Ty_ssize_t *consumed);

/* Return 1 if an OSError with errno == EINTR is set (and then
   clears the error indicator), 0 otherwise.
   Should only be called when TyErr_Occurred() is true.
*/
extern int _PyIO_trap_eintr(void);

#define DEFAULT_BUFFER_SIZE (128 * 1024)  /* bytes */

/*
 * Offset type for positioning.
 */

/* Printing a variable of type off_t (with e.g., TyUnicode_FromFormat)
   correctly and without producing compiler warnings is surprisingly painful.
   We identify an integer type whose size matches off_t and then: (1) cast the
   off_t to that integer type and (2) use the appropriate conversion
   specification.  The cast is necessary: gcc complains about formatting a
   long with "%lld" even when both long and long long have the same
   precision. */

#ifdef MS_WINDOWS

/* Windows uses long long for offsets */
typedef long long Ty_off_t;
# define TyLong_AsOff_t     TyLong_AsLongLong
# define TyLong_FromOff_t   TyLong_FromLongLong
# define PY_OFF_T_MAX       LLONG_MAX
# define PY_OFF_T_MIN       LLONG_MIN
# define PY_OFF_T_COMPAT    long long    /* type compatible with off_t */
# define PY_PRIdOFF         "lld"        /* format to use for that type */

#else

/* Other platforms use off_t */
typedef off_t Ty_off_t;
#if (SIZEOF_OFF_T == SIZEOF_SIZE_T)
# define TyLong_AsOff_t     TyLong_AsSsize_t
# define TyLong_FromOff_t   TyLong_FromSsize_t
# define PY_OFF_T_MAX       PY_SSIZE_T_MAX
# define PY_OFF_T_MIN       PY_SSIZE_T_MIN
# define PY_OFF_T_COMPAT    Ty_ssize_t
# define PY_PRIdOFF         "zd"
#elif (SIZEOF_OFF_T == SIZEOF_LONG_LONG)
# define TyLong_AsOff_t     TyLong_AsLongLong
# define TyLong_FromOff_t   TyLong_FromLongLong
# define PY_OFF_T_MAX       LLONG_MAX
# define PY_OFF_T_MIN       LLONG_MIN
# define PY_OFF_T_COMPAT    long long
# define PY_PRIdOFF         "lld"
#elif (SIZEOF_OFF_T == SIZEOF_LONG)
# define TyLong_AsOff_t     TyLong_AsLong
# define TyLong_FromOff_t   TyLong_FromLong
# define PY_OFF_T_MAX       LONG_MAX
# define PY_OFF_T_MIN       LONG_MIN
# define PY_OFF_T_COMPAT    long
# define PY_PRIdOFF         "ld"
#else
# error off_t does not match either size_t, long, or long long!
#endif

#endif

extern Ty_off_t PyNumber_AsOff_t(TyObject *item, TyObject *err);

/* Implementation details */

/* IO module structure */

extern TyModuleDef _PyIO_Module;

struct _io_state {
    int initialized;
    TyObject *unsupported_operation;

    /* Types */
    TyTypeObject *PyIOBase_Type;
    TyTypeObject *PyIncrementalNewlineDecoder_Type;
    TyTypeObject *PyRawIOBase_Type;
    TyTypeObject *PyBufferedIOBase_Type;
    TyTypeObject *PyBufferedRWPair_Type;
    TyTypeObject *PyBufferedRandom_Type;
    TyTypeObject *PyBufferedReader_Type;
    TyTypeObject *PyBufferedWriter_Type;
    TyTypeObject *PyBytesIOBuffer_Type;
    TyTypeObject *PyBytesIO_Type;
    TyTypeObject *PyFileIO_Type;
    TyTypeObject *PyStringIO_Type;
    TyTypeObject *PyTextIOBase_Type;
    TyTypeObject *PyTextIOWrapper_Type;
#ifdef HAVE_WINDOWS_CONSOLE_IO
    TyTypeObject *PyWindowsConsoleIO_Type;
#endif
};

static inline _PyIO_State *
get_io_state(TyObject *module)
{
    void *state = _TyModule_GetState(module);
    assert(state != NULL);
    return (_PyIO_State *)state;
}

static inline _PyIO_State *
get_io_state_by_cls(TyTypeObject *cls)
{
    void *state = _TyType_GetModuleState(cls);
    assert(state != NULL);
    return (_PyIO_State *)state;
}

static inline _PyIO_State *
find_io_state_by_def(TyTypeObject *type)
{
    TyObject *mod = TyType_GetModuleByDef(type, &_PyIO_Module);
    assert(mod != NULL);
    return get_io_state(mod);
}

extern TyObject *_PyIOBase_cannot_pickle(TyObject *self, TyObject *args);

#ifdef HAVE_WINDOWS_CONSOLE_IO
extern char _PyIO_get_console_type(TyObject *);
#endif
