#include "Python.h"

#include "pegen.h"

mod_ty
_TyParser_ASTFromString(const char *str, TyObject* filename, int mode,
                        PyCompilerFlags *flags, PyArena *arena)
{
    if (TySys_Audit("compile", "yO", str, filename) < 0) {
        return NULL;
    }

    mod_ty result = _TyPegen_run_parser_from_string(str, mode, filename, flags, arena);
    return result;
}

mod_ty
_TyParser_ASTFromFile(FILE *fp, TyObject *filename_ob, const char *enc,
                      int mode, const char *ps1, const char* ps2,
                      PyCompilerFlags *flags, int *errcode, PyArena *arena)
{
    if (TySys_Audit("compile", "OO", Ty_None, filename_ob) < 0) {
        return NULL;
    }
    return _TyPegen_run_parser_from_file_pointer(fp, mode, filename_ob, enc, ps1, ps2,
                                        flags, errcode, NULL, arena);
}

mod_ty
_TyParser_InteractiveASTFromFile(FILE *fp, TyObject *filename_ob, const char *enc,
                                 int mode, const char *ps1, const char* ps2,
                                 PyCompilerFlags *flags, int *errcode,
                                 TyObject **interactive_src, PyArena *arena)
{
    if (TySys_Audit("compile", "OO", Ty_None, filename_ob) < 0) {
        return NULL;
    }
    return _TyPegen_run_parser_from_file_pointer(fp, mode, filename_ob, enc, ps1, ps2,
                                                 flags, errcode, interactive_src, arena);
}