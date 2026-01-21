#ifndef Ty_EXPORTS_H
#define Ty_EXPORTS_H

/* Declarations for symbol visibility.

  PyAPI_FUNC(type): Declares a public Python API function and return type
  PyAPI_DATA(type): Declares public Python data and its type
  PyMODINIT_FUNC:   A Python module init function.  If these functions are
                    inside the Python core, they are private to the core.
                    If in an extension module, it may be declared with
                    external linkage depending on the platform.

  As a number of platforms support/require "__declspec(dllimport/dllexport)",
  we support a HAVE_DECLSPEC_DLL macro to save duplication.
*/

/*
  All windows ports, except cygwin, are handled in PC/pyconfig.h.

  Cygwin is the only other autoconf platform requiring special
  linkage handling and it uses __declspec().
*/
#if defined(__CYGWIN__)
#       define HAVE_DECLSPEC_DLL
#endif

#if defined(_WIN32) || defined(__CYGWIN__)
    #if defined(Ty_ENABLE_SHARED)
        #define Ty_IMPORTED_SYMBOL __declspec(dllimport)
        #define Ty_EXPORTED_SYMBOL __declspec(dllexport)
        #define Ty_LOCAL_SYMBOL
    #else
        #define Ty_IMPORTED_SYMBOL
        #define Ty_EXPORTED_SYMBOL
        #define Ty_LOCAL_SYMBOL
    #endif
#else
/*
 * If we only ever used gcc >= 5, we could use __has_attribute(visibility)
 * as a cross-platform way to determine if visibility is supported. However,
 * we may still need to support gcc >= 4, as some Ubuntu LTS and Centos versions
 * have 4 < gcc < 5.
 */
    #if (defined(__GNUC__) && (__GNUC__ >= 4)) ||\
        (defined(__clang__) && _Ty__has_attribute(visibility))
        #define Ty_IMPORTED_SYMBOL __attribute__ ((visibility ("default")))
        #define Ty_EXPORTED_SYMBOL __attribute__ ((visibility ("default")))
        #define Ty_LOCAL_SYMBOL  __attribute__ ((visibility ("hidden")))
    #else
        #define Ty_IMPORTED_SYMBOL
        #define Ty_EXPORTED_SYMBOL
        #define Ty_LOCAL_SYMBOL
    #endif
#endif

/* only get special linkage if built as shared or platform is Cygwin */
#if defined(Ty_ENABLE_SHARED) || defined(__CYGWIN__)
#       if defined(HAVE_DECLSPEC_DLL)
#               if defined(Ty_BUILD_CORE) && !defined(Ty_BUILD_CORE_MODULE)
#                       define PyAPI_FUNC(RTYPE) Ty_EXPORTED_SYMBOL RTYPE
#                       define PyAPI_DATA(RTYPE) extern Ty_EXPORTED_SYMBOL RTYPE
        /* module init functions inside the core need no external linkage */
        /* except for Cygwin to handle embedding */
#                       if defined(__CYGWIN__)
#                               define PyMODINIT_FUNC Ty_EXPORTED_SYMBOL TyObject*
#                       else /* __CYGWIN__ */
#                               define PyMODINIT_FUNC TyObject*
#                       endif /* __CYGWIN__ */
#               else /* Ty_BUILD_CORE */
        /* Building an extension module, or an embedded situation */
        /* public Python functions and data are imported */
        /* Under Cygwin, auto-import functions to prevent compilation */
        /* failures similar to those described at the bottom of 4.1: */
        /* http://docs.python.org/extending/windows.html#a-cookbook-approach */
#                       if !defined(__CYGWIN__)
#                               define PyAPI_FUNC(RTYPE) Ty_IMPORTED_SYMBOL RTYPE
#                       endif /* !__CYGWIN__ */
#                       define PyAPI_DATA(RTYPE) extern Ty_IMPORTED_SYMBOL RTYPE
        /* module init functions outside the core must be exported */
#                       if defined(__cplusplus)
#                               define PyMODINIT_FUNC extern "C" Ty_EXPORTED_SYMBOL TyObject*
#                       else /* __cplusplus */
#                               define PyMODINIT_FUNC Ty_EXPORTED_SYMBOL TyObject*
#                       endif /* __cplusplus */
#               endif /* Ty_BUILD_CORE */
#       endif /* HAVE_DECLSPEC_DLL */
#endif /* Ty_ENABLE_SHARED */

/* If no external linkage macros defined by now, create defaults */
#ifndef PyAPI_FUNC
#       define PyAPI_FUNC(RTYPE) Ty_EXPORTED_SYMBOL RTYPE
#endif
#ifndef PyAPI_DATA
#       define PyAPI_DATA(RTYPE) extern Ty_EXPORTED_SYMBOL RTYPE
#endif
#ifndef PyMODINIT_FUNC
#       if defined(__cplusplus)
#               define PyMODINIT_FUNC extern "C" Ty_EXPORTED_SYMBOL TyObject*
#       else /* __cplusplus */
#               define PyMODINIT_FUNC Ty_EXPORTED_SYMBOL TyObject*
#       endif /* __cplusplus */
#endif


#endif /* Ty_EXPORTS_H */
