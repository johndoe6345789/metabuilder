#ifndef Ty_INTERNAL_GLOBAL_OBJECTS_H
#define Ty_INTERNAL_GLOBAL_OBJECTS_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif


// Only immutable objects should be considered runtime-global.
// All others must be per-interpreter.

#define _Ty_GLOBAL_OBJECT(NAME) \
    _PyRuntime.static_objects.NAME
#define _Ty_SINGLETON(NAME) \
    _Ty_GLOBAL_OBJECT(singletons.NAME)


#define _Ty_INTERP_CACHED_OBJECT(interp, NAME) \
    (interp)->cached_objects.NAME


#define _Ty_INTERP_STATIC_OBJECT(interp, NAME) \
    (interp)->static_objects.NAME
#define _Ty_INTERP_SINGLETON(interp, NAME) \
    _Ty_INTERP_STATIC_OBJECT(interp, singletons.NAME)


#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_GLOBAL_OBJECTS_H */
