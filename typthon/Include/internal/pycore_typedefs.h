#ifndef Ty_INTERNAL_TYPEDEFS_H
#define Ty_INTERNAL_TYPEDEFS_H

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#ifdef __cplusplus
extern "C" {
#endif

typedef struct _PyInterpreterFrame _PyInterpreterFrame;
typedef struct pyruntimestate _PyRuntimeState;

#ifdef __cplusplus
}
#endif
#endif  // !Ty_INTERNAL_TYPEDEFS_H
