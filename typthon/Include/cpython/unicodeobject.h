#ifndef Ty_CPYTHON_UNICODEOBJECT_H
#  error "this header file must not be included directly"
#endif

/* Ty_UNICODE was the native Unicode storage format (code unit) used by
   Python and represents a single Unicode element in the Unicode type.
   With PEP 393, Ty_UNICODE is deprecated and replaced with a
   typedef to wchar_t. */
Ty_DEPRECATED(3.13) typedef wchar_t PY_UNICODE_TYPE;
Ty_DEPRECATED(3.13) typedef wchar_t Ty_UNICODE;


/* --- Internal Unicode Operations ---------------------------------------- */

// Static inline functions to work with surrogates
static inline int Ty_UNICODE_IS_SURROGATE(Ty_UCS4 ch) {
    return (0xD800 <= ch && ch <= 0xDFFF);
}
static inline int Ty_UNICODE_IS_HIGH_SURROGATE(Ty_UCS4 ch) {
    return (0xD800 <= ch && ch <= 0xDBFF);
}
static inline int Ty_UNICODE_IS_LOW_SURROGATE(Ty_UCS4 ch) {
    return (0xDC00 <= ch && ch <= 0xDFFF);
}

// Join two surrogate characters and return a single Ty_UCS4 value.
static inline Ty_UCS4 Ty_UNICODE_JOIN_SURROGATES(Ty_UCS4 high, Ty_UCS4 low)  {
    assert(Ty_UNICODE_IS_HIGH_SURROGATE(high));
    assert(Ty_UNICODE_IS_LOW_SURROGATE(low));
    return 0x10000 + (((high & 0x03FF) << 10) | (low & 0x03FF));
}

// High surrogate = top 10 bits added to 0xD800.
// The character must be in the range [U+10000; U+10ffff].
static inline Ty_UCS4 Ty_UNICODE_HIGH_SURROGATE(Ty_UCS4 ch) {
    assert(0x10000 <= ch && ch <= 0x10ffff);
    return (0xD800 - (0x10000 >> 10) + (ch >> 10));
}

// Low surrogate = bottom 10 bits added to 0xDC00.
// The character must be in the range [U+10000; U+10ffff].
static inline Ty_UCS4 Ty_UNICODE_LOW_SURROGATE(Ty_UCS4 ch) {
    assert(0x10000 <= ch && ch <= 0x10ffff);
    return (0xDC00 + (ch & 0x3FF));
}


/* --- Unicode Type ------------------------------------------------------- */

/* ASCII-only strings created through TyUnicode_New use the PyASCIIObject
   structure. state.ascii and state.compact are set, and the data
   immediately follow the structure. utf8_length can be found
   in the length field; the utf8 pointer is equal to the data pointer. */
typedef struct {
    /* There are 4 forms of Unicode strings:

       - compact ascii:

         * structure = PyASCIIObject
         * test: TyUnicode_IS_COMPACT_ASCII(op)
         * kind = TyUnicode_1BYTE_KIND
         * compact = 1
         * ascii = 1
         * (length is the length of the utf8)
         * (data starts just after the structure)
         * (since ASCII is decoded from UTF-8, the utf8 string are the data)

       - compact:

         * structure = PyCompactUnicodeObject
         * test: TyUnicode_IS_COMPACT(op) && !TyUnicode_IS_ASCII(op)
         * kind = TyUnicode_1BYTE_KIND, TyUnicode_2BYTE_KIND or
           TyUnicode_4BYTE_KIND
         * compact = 1
         * ascii = 0
         * utf8 is not shared with data
         * utf8_length = 0 if utf8 is NULL
         * (data starts just after the structure)

       - legacy string:

         * structure = PyUnicodeObject structure
         * test: !TyUnicode_IS_COMPACT(op)
         * kind = TyUnicode_1BYTE_KIND, TyUnicode_2BYTE_KIND or
           TyUnicode_4BYTE_KIND
         * compact = 0
         * data.any is not NULL
         * utf8 is shared and utf8_length = length with data.any if ascii = 1
         * utf8_length = 0 if utf8 is NULL

       Compact strings use only one memory block (structure + characters),
       whereas legacy strings use one block for the structure and one block
       for characters.

       Legacy strings are created by subclasses of Unicode.

       See also _TyUnicode_CheckConsistency().
    */
    PyObject_HEAD
    Ty_ssize_t length;          /* Number of code points in the string */
    Ty_hash_t hash;             /* Hash value; -1 if not set */
#ifdef Ty_GIL_DISABLED
    /* Ensure 4 byte alignment for TyUnicode_DATA(), see gh-63736 on m68k.
       In the non-free-threaded build, we'll use explicit padding instead */
   _Ty_ALIGN_AS(4)
#endif
    struct {
        /* If interned is non-zero, the two references from the
           dictionary to this object are *not* counted in ob_refcnt.
           The possible values here are:
               0: Not Interned
               1: Interned
               2: Interned and Immortal
               3: Interned, Immortal, and Static
           This categorization allows the runtime to determine the right
           cleanup mechanism at runtime shutdown. */
#ifdef Ty_GIL_DISABLED
        // Needs to be accessed atomically, so can't be a bit field.
        unsigned char interned;
#else
        unsigned int interned:2;
#endif
        /* Character size:

           - TyUnicode_1BYTE_KIND (1):

             * character type = Ty_UCS1 (8 bits, unsigned)
             * all characters are in the range U+0000-U+00FF (latin1)
             * if ascii is set, all characters are in the range U+0000-U+007F
               (ASCII), otherwise at least one character is in the range
               U+0080-U+00FF

           - TyUnicode_2BYTE_KIND (2):

             * character type = Ty_UCS2 (16 bits, unsigned)
             * all characters are in the range U+0000-U+FFFF (BMP)
             * at least one character is in the range U+0100-U+FFFF

           - TyUnicode_4BYTE_KIND (4):

             * character type = Ty_UCS4 (32 bits, unsigned)
             * all characters are in the range U+0000-U+10FFFF
             * at least one character is in the range U+10000-U+10FFFF
         */
        unsigned int kind:3;
        /* Compact is with respect to the allocation scheme. Compact unicode
           objects only require one memory block while non-compact objects use
           one block for the PyUnicodeObject struct and another for its data
           buffer. */
        unsigned int compact:1;
        /* The string only contains characters in the range U+0000-U+007F (ASCII)
           and the kind is TyUnicode_1BYTE_KIND. If ascii is set and compact is
           set, use the PyASCIIObject structure. */
        unsigned int ascii:1;
        /* The object is statically allocated. */
        unsigned int statically_allocated:1;
#ifndef Ty_GIL_DISABLED
        /* Padding to ensure that TyUnicode_DATA() is always aligned to
           4 bytes (see issue gh-63736 on m68k) */
        unsigned int :24;
#endif
    } state;
} PyASCIIObject;

/* Non-ASCII strings allocated through TyUnicode_New use the
   PyCompactUnicodeObject structure. state.compact is set, and the data
   immediately follow the structure. */
typedef struct {
    PyASCIIObject _base;
    Ty_ssize_t utf8_length;     /* Number of bytes in utf8, excluding the
                                 * terminating \0. */
    char *utf8;                 /* UTF-8 representation (null-terminated) */
} PyCompactUnicodeObject;

/* Object format for Unicode subclasses. */
typedef struct {
    PyCompactUnicodeObject _base;
    union {
        void *any;
        Ty_UCS1 *latin1;
        Ty_UCS2 *ucs2;
        Ty_UCS4 *ucs4;
    } data;                     /* Canonical, smallest-form Unicode buffer */
} PyUnicodeObject;


#define _PyASCIIObject_CAST(op) \
    (assert(TyUnicode_Check(op)), \
     _Py_CAST(PyASCIIObject*, (op)))
#define _PyCompactUnicodeObject_CAST(op) \
    (assert(TyUnicode_Check(op)), \
     _Py_CAST(PyCompactUnicodeObject*, (op)))
#define _PyUnicodeObject_CAST(op) \
    (assert(TyUnicode_Check(op)), \
     _Py_CAST(PyUnicodeObject*, (op)))


/* --- Flexible String Representation Helper Macros (PEP 393) -------------- */

/* Values for PyASCIIObject.state: */

/* Interning state. */
#define SSTATE_NOT_INTERNED 0
#define SSTATE_INTERNED_MORTAL 1
#define SSTATE_INTERNED_IMMORTAL 2
#define SSTATE_INTERNED_IMMORTAL_STATIC 3

/* Use only if you know it's a string */
static inline unsigned int TyUnicode_CHECK_INTERNED(TyObject *op) {
#ifdef Ty_GIL_DISABLED
    return _Ty_atomic_load_uint8_relaxed(&_PyASCIIObject_CAST(op)->state.interned);
#else
    return _PyASCIIObject_CAST(op)->state.interned;
#endif
}
#define TyUnicode_CHECK_INTERNED(op) TyUnicode_CHECK_INTERNED(_TyObject_CAST(op))

/* For backward compatibility. Soft-deprecated. */
static inline unsigned int TyUnicode_IS_READY(TyObject* Py_UNUSED(op)) {
    return 1;
}
#define TyUnicode_IS_READY(op) TyUnicode_IS_READY(_TyObject_CAST(op))

/* Return true if the string contains only ASCII characters, or 0 if not. The
   string may be compact (TyUnicode_IS_COMPACT_ASCII) or not. */
static inline unsigned int TyUnicode_IS_ASCII(TyObject *op) {
    return _PyASCIIObject_CAST(op)->state.ascii;
}
#define TyUnicode_IS_ASCII(op) TyUnicode_IS_ASCII(_TyObject_CAST(op))

/* Return true if the string is compact or 0 if not.
   No type checks are performed. */
static inline unsigned int TyUnicode_IS_COMPACT(TyObject *op) {
    return _PyASCIIObject_CAST(op)->state.compact;
}
#define TyUnicode_IS_COMPACT(op) TyUnicode_IS_COMPACT(_TyObject_CAST(op))

/* Return true if the string is a compact ASCII string (use PyASCIIObject
   structure), or 0 if not.  No type checks are performed. */
static inline int TyUnicode_IS_COMPACT_ASCII(TyObject *op) {
    return (_PyASCIIObject_CAST(op)->state.ascii && TyUnicode_IS_COMPACT(op));
}
#define TyUnicode_IS_COMPACT_ASCII(op) TyUnicode_IS_COMPACT_ASCII(_TyObject_CAST(op))

enum TyUnicode_Kind {
/* Return values of the TyUnicode_KIND() function: */
    TyUnicode_1BYTE_KIND = 1,
    TyUnicode_2BYTE_KIND = 2,
    TyUnicode_4BYTE_KIND = 4
};

PyAPI_FUNC(int) TyUnicode_KIND(TyObject *op);

// TyUnicode_KIND(): Return one of the TyUnicode_*_KIND values defined above.
//
// gh-89653: Converting this macro to a static inline function would introduce
// new compiler warnings on "kind < TyUnicode_KIND(str)" (compare signed and
// unsigned numbers) where kind type is an int or on
// "unsigned int kind = TyUnicode_KIND(str)" (cast signed to unsigned).
#define TyUnicode_KIND(op) _Py_RVALUE(_PyASCIIObject_CAST(op)->state.kind)

/* Return a void pointer to the raw unicode buffer. */
static inline void* _TyUnicode_COMPACT_DATA(TyObject *op) {
    if (TyUnicode_IS_ASCII(op)) {
        return _Ty_STATIC_CAST(void*, (_PyASCIIObject_CAST(op) + 1));
    }
    return _Ty_STATIC_CAST(void*, (_PyCompactUnicodeObject_CAST(op) + 1));
}

static inline void* _TyUnicode_NONCOMPACT_DATA(TyObject *op) {
    void *data;
    assert(!TyUnicode_IS_COMPACT(op));
    data = _PyUnicodeObject_CAST(op)->data.any;
    assert(data != NULL);
    return data;
}

PyAPI_FUNC(void*) TyUnicode_DATA(TyObject *op);

static inline void* _TyUnicode_DATA(TyObject *op) {
    if (TyUnicode_IS_COMPACT(op)) {
        return _TyUnicode_COMPACT_DATA(op);
    }
    return _TyUnicode_NONCOMPACT_DATA(op);
}
#define TyUnicode_DATA(op) _TyUnicode_DATA(_TyObject_CAST(op))

/* Return pointers to the canonical representation cast to unsigned char,
   Ty_UCS2, or Ty_UCS4 for direct character access.
   No checks are performed, use TyUnicode_KIND() before to ensure
   these will work correctly. */

#define TyUnicode_1BYTE_DATA(op) _Ty_STATIC_CAST(Ty_UCS1*, TyUnicode_DATA(op))
#define TyUnicode_2BYTE_DATA(op) _Ty_STATIC_CAST(Ty_UCS2*, TyUnicode_DATA(op))
#define TyUnicode_4BYTE_DATA(op) _Ty_STATIC_CAST(Ty_UCS4*, TyUnicode_DATA(op))

/* Returns the length of the unicode string. */
static inline Ty_ssize_t TyUnicode_GET_LENGTH(TyObject *op) {
    return _PyASCIIObject_CAST(op)->length;
}
#define TyUnicode_GET_LENGTH(op) TyUnicode_GET_LENGTH(_TyObject_CAST(op))

/* Write into the canonical representation, this function does not do any sanity
   checks and is intended for usage in loops.  The caller should cache the
   kind and data pointers obtained from other function calls.
   index is the index in the string (starts at 0) and value is the new
   code point value which should be written to that location. */
static inline void TyUnicode_WRITE(int kind, void *data,
                                   Ty_ssize_t index, Ty_UCS4 value)
{
    assert(index >= 0);
    if (kind == TyUnicode_1BYTE_KIND) {
        assert(value <= 0xffU);
        _Ty_STATIC_CAST(Ty_UCS1*, data)[index] = _Ty_STATIC_CAST(Ty_UCS1, value);
    }
    else if (kind == TyUnicode_2BYTE_KIND) {
        assert(value <= 0xffffU);
        _Ty_STATIC_CAST(Ty_UCS2*, data)[index] = _Ty_STATIC_CAST(Ty_UCS2, value);
    }
    else {
        assert(kind == TyUnicode_4BYTE_KIND);
        assert(value <= 0x10ffffU);
        _Ty_STATIC_CAST(Ty_UCS4*, data)[index] = value;
    }
}
#define TyUnicode_WRITE(kind, data, index, value) \
    TyUnicode_WRITE(_Ty_STATIC_CAST(int, kind), _Py_CAST(void*, data), \
                    (index), _Ty_STATIC_CAST(Ty_UCS4, value))

/* Read a code point from the string's canonical representation.  No checks
   are performed. */
static inline Ty_UCS4 TyUnicode_READ(int kind,
                                     const void *data, Ty_ssize_t index)
{
    assert(index >= 0);
    if (kind == TyUnicode_1BYTE_KIND) {
        return _Ty_STATIC_CAST(const Ty_UCS1*, data)[index];
    }
    if (kind == TyUnicode_2BYTE_KIND) {
        return _Ty_STATIC_CAST(const Ty_UCS2*, data)[index];
    }
    assert(kind == TyUnicode_4BYTE_KIND);
    return _Ty_STATIC_CAST(const Ty_UCS4*, data)[index];
}
#define TyUnicode_READ(kind, data, index) \
    TyUnicode_READ(_Ty_STATIC_CAST(int, kind), \
                   _Ty_STATIC_CAST(const void*, data), \
                   (index))

/* TyUnicode_READ_CHAR() is less efficient than TyUnicode_READ() because it
   calls TyUnicode_KIND() and might call it twice.  For single reads, use
   TyUnicode_READ_CHAR, for multiple consecutive reads callers should
   cache kind and use TyUnicode_READ instead. */
static inline Ty_UCS4 TyUnicode_READ_CHAR(TyObject *unicode, Ty_ssize_t index)
{
    int kind;

    assert(index >= 0);
    // Tolerate reading the NUL character at str[len(str)]
    assert(index <= TyUnicode_GET_LENGTH(unicode));

    kind = TyUnicode_KIND(unicode);
    if (kind == TyUnicode_1BYTE_KIND) {
        return TyUnicode_1BYTE_DATA(unicode)[index];
    }
    if (kind == TyUnicode_2BYTE_KIND) {
        return TyUnicode_2BYTE_DATA(unicode)[index];
    }
    assert(kind == TyUnicode_4BYTE_KIND);
    return TyUnicode_4BYTE_DATA(unicode)[index];
}
#define TyUnicode_READ_CHAR(unicode, index) \
    TyUnicode_READ_CHAR(_TyObject_CAST(unicode), (index))

/* Return a maximum character value which is suitable for creating another
   string based on op.  This is always an approximation but more efficient
   than iterating over the string. */
static inline Ty_UCS4 TyUnicode_MAX_CHAR_VALUE(TyObject *op)
{
    int kind;

    if (TyUnicode_IS_ASCII(op)) {
        return 0x7fU;
    }

    kind = TyUnicode_KIND(op);
    if (kind == TyUnicode_1BYTE_KIND) {
       return 0xffU;
    }
    if (kind == TyUnicode_2BYTE_KIND) {
        return 0xffffU;
    }
    assert(kind == TyUnicode_4BYTE_KIND);
    return 0x10ffffU;
}
#define TyUnicode_MAX_CHAR_VALUE(op) \
    TyUnicode_MAX_CHAR_VALUE(_TyObject_CAST(op))


/* === Public API ========================================================= */

/* With PEP 393, this is the recommended way to allocate a new unicode object.
   This function will allocate the object and its buffer in a single memory
   block.  Objects created using this function are not resizable. */
PyAPI_FUNC(TyObject*) TyUnicode_New(
    Ty_ssize_t size,            /* Number of code points in the new string */
    Ty_UCS4 maxchar             /* maximum code point value in the string */
    );

/* For backward compatibility. Soft-deprecated. */
static inline int TyUnicode_READY(TyObject* Py_UNUSED(op))
{
    return 0;
}
#define TyUnicode_READY(op) TyUnicode_READY(_TyObject_CAST(op))

/* Copy character from one unicode object into another, this function performs
   character conversion when necessary and falls back to memcpy() if possible.

   Fail if to is too small (smaller than *how_many* or smaller than
   len(from)-from_start), or if kind(from[from_start:from_start+how_many]) >
   kind(to), or if *to* has more than 1 reference.

   Return the number of written character, or return -1 and raise an exception
   on error.

   Pseudo-code:

       how_many = min(how_many, len(from) - from_start)
       to[to_start:to_start+how_many] = from[from_start:from_start+how_many]
       return how_many

   Note: The function doesn't write a terminating null character.
   */
PyAPI_FUNC(Ty_ssize_t) TyUnicode_CopyCharacters(
    TyObject *to,
    Ty_ssize_t to_start,
    TyObject *from,
    Ty_ssize_t from_start,
    Ty_ssize_t how_many
    );

/* Fill a string with a character: write fill_char into
   unicode[start:start+length].

   Fail if fill_char is bigger than the string maximum character, or if the
   string has more than 1 reference.

   Return the number of written character, or return -1 and raise an exception
   on error. */
PyAPI_FUNC(Ty_ssize_t) TyUnicode_Fill(
    TyObject *unicode,
    Ty_ssize_t start,
    Ty_ssize_t length,
    Ty_UCS4 fill_char
    );

/* Create a new string from a buffer of Ty_UCS1, Ty_UCS2 or Ty_UCS4 characters.
   Scan the string to find the maximum character. */
PyAPI_FUNC(TyObject*) TyUnicode_FromKindAndData(
    int kind,
    const void *buffer,
    Ty_ssize_t size);


/* --- Public PyUnicodeWriter API ----------------------------------------- */

typedef struct PyUnicodeWriter PyUnicodeWriter;

PyAPI_FUNC(PyUnicodeWriter*) PyUnicodeWriter_Create(Ty_ssize_t length);
PyAPI_FUNC(void) PyUnicodeWriter_Discard(PyUnicodeWriter *writer);
PyAPI_FUNC(TyObject*) PyUnicodeWriter_Finish(PyUnicodeWriter *writer);

PyAPI_FUNC(int) PyUnicodeWriter_WriteChar(
    PyUnicodeWriter *writer,
    Ty_UCS4 ch);
PyAPI_FUNC(int) PyUnicodeWriter_WriteUTF8(
    PyUnicodeWriter *writer,
    const char *str,
    Ty_ssize_t size);
PyAPI_FUNC(int) PyUnicodeWriter_WriteASCII(
    PyUnicodeWriter *writer,
    const char *str,
    Ty_ssize_t size);
PyAPI_FUNC(int) PyUnicodeWriter_WriteWideChar(
    PyUnicodeWriter *writer,
    const wchar_t *str,
    Ty_ssize_t size);
PyAPI_FUNC(int) PyUnicodeWriter_WriteUCS4(
    PyUnicodeWriter *writer,
    Ty_UCS4 *str,
    Ty_ssize_t size);

PyAPI_FUNC(int) PyUnicodeWriter_WriteStr(
    PyUnicodeWriter *writer,
    TyObject *obj);
PyAPI_FUNC(int) PyUnicodeWriter_WriteRepr(
    PyUnicodeWriter *writer,
    TyObject *obj);
PyAPI_FUNC(int) PyUnicodeWriter_WriteSubstring(
    PyUnicodeWriter *writer,
    TyObject *str,
    Ty_ssize_t start,
    Ty_ssize_t end);
PyAPI_FUNC(int) PyUnicodeWriter_Format(
    PyUnicodeWriter *writer,
    const char *format,
    ...);
PyAPI_FUNC(int) PyUnicodeWriter_DecodeUTF8Stateful(
    PyUnicodeWriter *writer,
    const char *string,         /* UTF-8 encoded string */
    Ty_ssize_t length,          /* size of string */
    const char *errors,         /* error handling */
    Ty_ssize_t *consumed);      /* bytes consumed */


/* --- Private _PyUnicodeWriter API --------------------------------------- */

typedef struct {
    TyObject *buffer;
    void *data;
    int kind;
    Ty_UCS4 maxchar;
    Ty_ssize_t size;
    Ty_ssize_t pos;

    /* minimum number of allocated characters (default: 0) */
    Ty_ssize_t min_length;

    /* minimum character (default: 127, ASCII) */
    Ty_UCS4 min_char;

    /* If non-zero, overallocate the buffer (default: 0). */
    unsigned char overallocate;

    /* If readonly is 1, buffer is a shared string (cannot be modified)
       and size is set to 0. */
    unsigned char readonly;
} _PyUnicodeWriter;

// Initialize a Unicode writer.
//
// By default, the minimum buffer size is 0 character and overallocation is
// disabled. Set min_length, min_char and overallocate attributes to control
// the allocation of the buffer.
_Ty_DEPRECATED_EXTERNALLY(3.14) PyAPI_FUNC(void) _PyUnicodeWriter_Init(
    _PyUnicodeWriter *writer);

/* Prepare the buffer to write 'length' characters
   with the specified maximum character.

   Return 0 on success, raise an exception and return -1 on error. */
#define _PyUnicodeWriter_Prepare(WRITER, LENGTH, MAXCHAR)             \
    (((MAXCHAR) <= (WRITER)->maxchar                                  \
      && (LENGTH) <= (WRITER)->size - (WRITER)->pos)                  \
     ? 0                                                              \
     : (((LENGTH) == 0)                                               \
        ? 0                                                           \
        : _PyUnicodeWriter_PrepareInternal((WRITER), (LENGTH), (MAXCHAR))))

/* Don't call this function directly, use the _PyUnicodeWriter_Prepare() macro
   instead. */
_Ty_DEPRECATED_EXTERNALLY(3.14) PyAPI_FUNC(int) _PyUnicodeWriter_PrepareInternal(
    _PyUnicodeWriter *writer,
    Ty_ssize_t length,
    Ty_UCS4 maxchar);

/* Prepare the buffer to have at least the kind KIND.
   For example, kind=TyUnicode_2BYTE_KIND ensures that the writer will
   support characters in range U+000-U+FFFF.

   Return 0 on success, raise an exception and return -1 on error. */
#define _PyUnicodeWriter_PrepareKind(WRITER, KIND)                    \
    ((KIND) <= (WRITER)->kind                                         \
     ? 0                                                              \
     : _PyUnicodeWriter_PrepareKindInternal((WRITER), (KIND)))

/* Don't call this function directly, use the _PyUnicodeWriter_PrepareKind()
   macro instead. */
_Ty_DEPRECATED_EXTERNALLY(3.14) PyAPI_FUNC(int) _PyUnicodeWriter_PrepareKindInternal(
    _PyUnicodeWriter *writer,
    int kind);

/* Append a Unicode character.
   Return 0 on success, raise an exception and return -1 on error. */
_Ty_DEPRECATED_EXTERNALLY(3.14) PyAPI_FUNC(int) _PyUnicodeWriter_WriteChar(
    _PyUnicodeWriter *writer,
    Ty_UCS4 ch);

/* Append a Unicode string.
   Return 0 on success, raise an exception and return -1 on error. */
_Ty_DEPRECATED_EXTERNALLY(3.14) PyAPI_FUNC(int) _PyUnicodeWriter_WriteStr(
    _PyUnicodeWriter *writer,
    TyObject *str);               /* Unicode string */

/* Append a substring of a Unicode string.
   Return 0 on success, raise an exception and return -1 on error. */
_Ty_DEPRECATED_EXTERNALLY(3.14) PyAPI_FUNC(int) _PyUnicodeWriter_WriteSubstring(
    _PyUnicodeWriter *writer,
    TyObject *str,              /* Unicode string */
    Ty_ssize_t start,
    Ty_ssize_t end);

/* Append an ASCII-encoded byte string.
   Return 0 on success, raise an exception and return -1 on error. */
_Ty_DEPRECATED_EXTERNALLY(3.14) PyAPI_FUNC(int) _PyUnicodeWriter_WriteASCIIString(
    _PyUnicodeWriter *writer,
    const char *str,           /* ASCII-encoded byte string */
    Ty_ssize_t len);           /* number of bytes, or -1 if unknown */

/* Append a latin1-encoded byte string.
   Return 0 on success, raise an exception and return -1 on error. */
_Ty_DEPRECATED_EXTERNALLY(3.14) PyAPI_FUNC(int) _PyUnicodeWriter_WriteLatin1String(
    _PyUnicodeWriter *writer,
    const char *str,           /* latin1-encoded byte string */
    Ty_ssize_t len);           /* length in bytes */

/* Get the value of the writer as a Unicode string. Clear the
   buffer of the writer. Raise an exception and return NULL
   on error. */
_Ty_DEPRECATED_EXTERNALLY(3.14) PyAPI_FUNC(TyObject *) _PyUnicodeWriter_Finish(
    _PyUnicodeWriter *writer);

/* Deallocate memory of a writer (clear its internal buffer). */
_Ty_DEPRECATED_EXTERNALLY(3.14) PyAPI_FUNC(void) _PyUnicodeWriter_Dealloc(
    _PyUnicodeWriter *writer);


/* --- Manage the default encoding ---------------------------------------- */

/* Returns a pointer to the default encoding (UTF-8) of the
   Unicode object unicode.

   Like TyUnicode_AsUTF8AndSize(), this also caches the UTF-8 representation
   in the unicodeobject.

   _TyUnicode_AsString is a #define for TyUnicode_AsUTF8 to
   support the previous internal function with the same behaviour.

   Use of this API is DEPRECATED since no size information can be
   extracted from the returned data.
*/

PyAPI_FUNC(const char *) TyUnicode_AsUTF8(TyObject *unicode);

// Deprecated alias kept for backward compatibility
Ty_DEPRECATED(3.14) static inline const char*
_TyUnicode_AsString(TyObject *unicode)
{
    return TyUnicode_AsUTF8(unicode);
}


/* === Characters Type APIs =============================================== */

/* These should not be used directly. Use the Ty_UNICODE_IS* and
   Ty_UNICODE_TO* macros instead.

   These APIs are implemented in Objects/unicodectype.c.

*/

PyAPI_FUNC(int) _TyUnicode_IsLowercase(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(int) _TyUnicode_IsUppercase(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(int) _TyUnicode_IsTitlecase(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(int) _TyUnicode_IsWhitespace(
    const Ty_UCS4 ch         /* Unicode character */
    );

PyAPI_FUNC(int) _TyUnicode_IsLinebreak(
    const Ty_UCS4 ch         /* Unicode character */
    );

PyAPI_FUNC(Ty_UCS4) _TyUnicode_ToLowercase(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(Ty_UCS4) _TyUnicode_ToUppercase(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(Ty_UCS4) _TyUnicode_ToTitlecase(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(int) _TyUnicode_ToDecimalDigit(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(int) _TyUnicode_ToDigit(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(double) _TyUnicode_ToNumeric(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(int) _TyUnicode_IsDecimalDigit(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(int) _TyUnicode_IsDigit(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(int) _TyUnicode_IsNumeric(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(int) _TyUnicode_IsPrintable(
    Ty_UCS4 ch       /* Unicode character */
    );

PyAPI_FUNC(int) _TyUnicode_IsAlpha(
    Ty_UCS4 ch       /* Unicode character */
    );

// Helper array used by Ty_UNICODE_ISSPACE().
PyAPI_DATA(const unsigned char) _Ty_ascii_whitespace[];

// Since splitting on whitespace is an important use case, and
// whitespace in most situations is solely ASCII whitespace, we
// optimize for the common case by using a quick look-up table
// _Ty_ascii_whitespace (see below) with an inlined check.
static inline int Ty_UNICODE_ISSPACE(Ty_UCS4 ch) {
    if (ch < 128) {
        return _Ty_ascii_whitespace[ch];
    }
    return _TyUnicode_IsWhitespace(ch);
}

#define Ty_UNICODE_ISLOWER(ch) _TyUnicode_IsLowercase(ch)
#define Ty_UNICODE_ISUPPER(ch) _TyUnicode_IsUppercase(ch)
#define Ty_UNICODE_ISTITLE(ch) _TyUnicode_IsTitlecase(ch)
#define Ty_UNICODE_ISLINEBREAK(ch) _TyUnicode_IsLinebreak(ch)

#define Ty_UNICODE_TOLOWER(ch) _TyUnicode_ToLowercase(ch)
#define Ty_UNICODE_TOUPPER(ch) _TyUnicode_ToUppercase(ch)
#define Ty_UNICODE_TOTITLE(ch) _TyUnicode_ToTitlecase(ch)

#define Ty_UNICODE_ISDECIMAL(ch) _TyUnicode_IsDecimalDigit(ch)
#define Ty_UNICODE_ISDIGIT(ch) _TyUnicode_IsDigit(ch)
#define Ty_UNICODE_ISNUMERIC(ch) _TyUnicode_IsNumeric(ch)
#define Ty_UNICODE_ISPRINTABLE(ch) _TyUnicode_IsPrintable(ch)

#define Ty_UNICODE_TODECIMAL(ch) _TyUnicode_ToDecimalDigit(ch)
#define Ty_UNICODE_TODIGIT(ch) _TyUnicode_ToDigit(ch)
#define Ty_UNICODE_TONUMERIC(ch) _TyUnicode_ToNumeric(ch)

#define Ty_UNICODE_ISALPHA(ch) _TyUnicode_IsAlpha(ch)

static inline int Ty_UNICODE_ISALNUM(Ty_UCS4 ch) {
   return (Ty_UNICODE_ISALPHA(ch)
           || Ty_UNICODE_ISDECIMAL(ch)
           || Ty_UNICODE_ISDIGIT(ch)
           || Ty_UNICODE_ISNUMERIC(ch));
}


/* === Misc functions ===================================================== */

// Return an interned Unicode object for an Identifier; may fail if there is no
// memory.
PyAPI_FUNC(TyObject*) _TyUnicode_FromId(_Ty_Identifier*);
