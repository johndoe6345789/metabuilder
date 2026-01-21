#ifndef Ty_STRUCTMEMBER_H
#define Ty_STRUCTMEMBER_H
#ifdef __cplusplus
extern "C" {
#endif


/* Interface to map C struct members to Python object attributes
 *
 * This header is deprecated: new code should not use stuff from here.
 * New definitions are in descrobject.h.
 *
 * However, there's nothing wrong with old code continuing to use it,
 * and there's not much maintenance overhead in maintaining a few aliases.
 * So, don't be too eager to convert old code.
 *
 * It uses names not prefixed with Ty_.
 * It is also *not* included from Python.h and must be included individually.
 */

#include <stddef.h> /* For offsetof (not always provided by Python.h) */

/* Types */
#define T_SHORT     Ty_T_SHORT
#define T_INT       Ty_T_INT
#define T_LONG      Ty_T_LONG
#define T_FLOAT     Ty_T_FLOAT
#define T_DOUBLE    Ty_T_DOUBLE
#define T_STRING    Ty_T_STRING
#define T_OBJECT    _Ty_T_OBJECT
#define T_CHAR      Ty_T_CHAR
#define T_BYTE      Ty_T_BYTE
#define T_UBYTE     Ty_T_UBYTE
#define T_USHORT    Ty_T_USHORT
#define T_UINT      Ty_T_UINT
#define T_ULONG     Ty_T_ULONG
#define T_STRING_INPLACE    Ty_T_STRING_INPLACE
#define T_BOOL      Ty_T_BOOL
#define T_OBJECT_EX Ty_T_OBJECT_EX
#define T_LONGLONG  Ty_T_LONGLONG
#define T_ULONGLONG Ty_T_ULONGLONG
#define T_PYSSIZET  Ty_T_PYSSIZET
#define T_NONE      _Ty_T_NONE

/* Flags */
#define READONLY            Py_READONLY
#define PY_AUDIT_READ        Ty_AUDIT_READ
#define READ_RESTRICTED     Ty_AUDIT_READ
#define PY_WRITE_RESTRICTED _Ty_WRITE_RESTRICTED
#define RESTRICTED          (READ_RESTRICTED | PY_WRITE_RESTRICTED)


#ifdef __cplusplus
}
#endif
#endif /* !Ty_STRUCTMEMBER_H */
