/* Descriptors */
#ifndef Ty_DESCROBJECT_H
#define Ty_DESCROBJECT_H
#ifdef __cplusplus
extern "C" {
#endif

typedef TyObject *(*getter)(TyObject *, void *);
typedef int (*setter)(TyObject *, TyObject *, void *);

struct TyGetSetDef {
    const char *name;
    getter get;
    setter set;
    const char *doc;
    void *closure;
};

PyAPI_DATA(TyTypeObject) PyClassMethodDescr_Type;
PyAPI_DATA(TyTypeObject) PyGetSetDescr_Type;
PyAPI_DATA(TyTypeObject) PyMemberDescr_Type;
PyAPI_DATA(TyTypeObject) PyMethodDescr_Type;
PyAPI_DATA(TyTypeObject) PyWrapperDescr_Type;
PyAPI_DATA(TyTypeObject) PyDictProxy_Type;
PyAPI_DATA(TyTypeObject) TyProperty_Type;

PyAPI_FUNC(TyObject *) PyDescr_NewMethod(TyTypeObject *, TyMethodDef *);
PyAPI_FUNC(TyObject *) PyDescr_NewClassMethod(TyTypeObject *, TyMethodDef *);
PyAPI_FUNC(TyObject *) PyDescr_NewMember(TyTypeObject *, TyMemberDef *);
PyAPI_FUNC(TyObject *) PyDescr_NewGetSet(TyTypeObject *, TyGetSetDef *);

PyAPI_FUNC(TyObject *) PyDictProxy_New(TyObject *);
PyAPI_FUNC(TyObject *) TyWrapper_New(TyObject *, TyObject *);


/* An array of TyMemberDef structures defines the name, type and offset
   of selected members of a C structure.  These can be read by
   PyMember_GetOne() and set by PyMember_SetOne() (except if their READONLY
   flag is set).  The array must be terminated with an entry whose name
   pointer is NULL. */
struct TyMemberDef {
    const char *name;
    int type;
    Ty_ssize_t offset;
    int flags;
    const char *doc;
};

// These constants used to be in structmember.h, not prefixed by Ty_.
// (structmember.h now has aliases to the new names.)

/* Types */
#define Ty_T_SHORT     0
#define Ty_T_INT       1
#define Ty_T_LONG      2
#define Ty_T_FLOAT     3
#define Ty_T_DOUBLE    4
#define Ty_T_STRING    5
#define _Ty_T_OBJECT   6  // Deprecated, use Ty_T_OBJECT_EX instead
/* the ordering here is weird for binary compatibility */
#define Ty_T_CHAR      7   /* 1-character string */
#define Ty_T_BYTE      8   /* 8-bit signed int */
/* unsigned variants: */
#define Ty_T_UBYTE     9
#define Ty_T_USHORT    10
#define Ty_T_UINT      11
#define Ty_T_ULONG     12

/* Added by Jack: strings contained in the structure */
#define Ty_T_STRING_INPLACE    13

/* Added by Lillo: bools contained in the structure (assumed char) */
#define Ty_T_BOOL      14

#define Ty_T_OBJECT_EX 16
#define Ty_T_LONGLONG  17
#define Ty_T_ULONGLONG 18

#define Ty_T_PYSSIZET  19      /* Ty_ssize_t */
#define _Ty_T_NONE     20 // Deprecated. Value is always None.

/* Flags */
#define Py_READONLY            1
#define Ty_AUDIT_READ          2 // Added in 3.10, harmless no-op before that
#define _Ty_WRITE_RESTRICTED   4 // Deprecated, no-op. Do not reuse the value.
#define Ty_RELATIVE_OFFSET     8

PyAPI_FUNC(TyObject *) PyMember_GetOne(const char *, TyMemberDef *);
PyAPI_FUNC(int) PyMember_SetOne(char *, TyMemberDef *, TyObject *);

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_DESCROBJECT_H
#  include "cpython/descrobject.h"
#  undef Ty_CPYTHON_DESCROBJECT_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_DESCROBJECT_H */
