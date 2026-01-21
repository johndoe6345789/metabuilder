// Forward declarations of types of the Python C API.
// Declare them at the same place since redefining typedef is a C11 feature.
// Only use a forward declaration if there is an interdependency between two
// header files.

#ifndef Ty_PYTYPEDEFS_H
#define Ty_PYTYPEDEFS_H
#ifdef __cplusplus
extern "C" {
#endif

typedef struct TyModuleDef TyModuleDef;
typedef struct PyModuleDef_Slot PyModuleDef_Slot;
typedef struct TyMethodDef TyMethodDef;
typedef struct TyGetSetDef TyGetSetDef;
typedef struct TyMemberDef TyMemberDef;

typedef struct _object TyObject;
typedef struct _longobject PyLongObject;
typedef struct _typeobject TyTypeObject;
typedef struct PyCodeObject PyCodeObject;
typedef struct _frame PyFrameObject;

typedef struct _ts TyThreadState;
typedef struct _is TyInterpreterState;

#ifdef __cplusplus
}
#endif
#endif   // !Ty_PYTYPEDEFS_H
