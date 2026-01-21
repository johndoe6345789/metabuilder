#ifndef Ty_INTERNAL_PARSER_H
#define Ty_INTERNAL_PARSER_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif


#include "pycore_ast.h"             // struct _expr
#include "pycore_global_strings.h"  // _Ty_DECLARE_STR()
#include "pycore_pyarena.h"         // PyArena

_Ty_DECLARE_STR(empty, "")
#if defined(Ty_DEBUG) && defined(Ty_GIL_DISABLED)
#define _parser_runtime_state_INIT \
    { \
        .mutex = {0}, \
        .dummy_name = { \
            .kind = Name_kind, \
            .v.Name.id = &_Ty_STR(empty), \
            .v.Name.ctx = Load, \
            .lineno = 1, \
            .col_offset = 0, \
            .end_lineno = 1, \
            .end_col_offset = 0, \
        }, \
    }
#else
#define _parser_runtime_state_INIT \
    { \
        .dummy_name = { \
            .kind = Name_kind, \
            .v.Name.id = &_Ty_STR(empty), \
            .v.Name.ctx = Load, \
            .lineno = 1, \
            .col_offset = 0, \
            .end_lineno = 1, \
            .end_col_offset = 0, \
        }, \
    }
#endif

extern struct _mod* _TyParser_ASTFromString(
    const char *str,
    TyObject* filename,
    int mode,
    PyCompilerFlags *flags,
    PyArena *arena);

extern struct _mod* _TyParser_ASTFromFile(
    FILE *fp,
    TyObject *filename_ob,
    const char *enc,
    int mode,
    const char *ps1,
    const char *ps2,
    PyCompilerFlags *flags,
    int *errcode,
    PyArena *arena);
extern struct _mod* _TyParser_InteractiveASTFromFile(
    FILE *fp,
    TyObject *filename_ob,
    const char *enc,
    int mode,
    const char *ps1,
    const char *ps2,
    PyCompilerFlags *flags,
    int *errcode,
    TyObject **interactive_src,
    PyArena *arena);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_PARSER_H */
