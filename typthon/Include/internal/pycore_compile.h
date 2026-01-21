#ifndef Ty_INTERNAL_COMPILE_H
#define Ty_INTERNAL_COMPILE_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#include <stdbool.h>

#include "pycore_ast.h"       // mod_ty
#include "pycore_symtable.h"  // _Ty_SourceLocation
#include "pycore_instruction_sequence.h"

/* A soft limit for stack use, to avoid excessive
 * memory use for large constants, etc.
 *
 * The value 30 is plucked out of thin air.
 * Code that could use more stack than this is
 * rare, so the exact value is unimportant.
 */
#define _PY_STACK_USE_GUIDELINE 30

struct _arena;   // Type defined in pycore_pyarena.h
struct _mod;     // Type defined in pycore_ast.h

// Export for 'test_peg_generator' shared extension
PyAPI_FUNC(PyCodeObject*) _TyAST_Compile(
    struct _mod *mod,
    TyObject *filename,
    PyCompilerFlags *flags,
    int optimize,
    struct _arena *arena);

/* AST preprocessing */
extern int _PyCompile_AstPreprocess(
    struct _mod *mod,
    TyObject *filename,
    PyCompilerFlags *flags,
    int optimize,
    struct _arena *arena,
    int syntax_check_only);

extern int _TyAST_Preprocess(
    struct _mod *,
    struct _arena *arena,
    TyObject *filename,
    int optimize,
    int ff_features,
    int syntax_check_only);


typedef struct {
    TyObject *u_name;
    TyObject *u_qualname;  /* dot-separated qualified name (lazy) */

    /* The following fields are dicts that map objects to
       the index of them in co_XXX.      The index is used as
       the argument for opcodes that refer to those collections.
    */
    TyObject *u_consts;    /* all constants */
    TyObject *u_names;     /* all names */
    TyObject *u_varnames;  /* local variables */
    TyObject *u_cellvars;  /* cell variables */
    TyObject *u_freevars;  /* free variables */
    TyObject *u_fasthidden; /* dict; keys are names that are fast-locals only
                               temporarily within an inlined comprehension. When
                               value is True, treat as fast-local. */

    Ty_ssize_t u_argcount;        /* number of arguments for block */
    Ty_ssize_t u_posonlyargcount;        /* number of positional only arguments for block */
    Ty_ssize_t u_kwonlyargcount; /* number of keyword only arguments for block */

    int u_firstlineno; /* the first lineno of the block */
} _PyCompile_CodeUnitMetadata;

struct _PyCompiler;

typedef enum {
    COMPILE_OP_FAST,
    COMPILE_OP_GLOBAL,
    COMPILE_OP_DEREF,
    COMPILE_OP_NAME,
} _PyCompile_optype;

/* _PyCompile_FBlockInfo tracks the current frame block.
 *
 * A frame block is used to handle loops, try/except, and try/finally.
 * It's called a frame block to distinguish it from a basic block in the
 * compiler IR.
 */

enum _PyCompile_FBlockType {
     COMPILE_FBLOCK_WHILE_LOOP,
     COMPILE_FBLOCK_FOR_LOOP,
     COMPILE_FBLOCK_TRY_EXCEPT,
     COMPILE_FBLOCK_FINALLY_TRY,
     COMPILE_FBLOCK_FINALLY_END,
     COMPILE_FBLOCK_WITH,
     COMPILE_FBLOCK_ASYNC_WITH,
     COMPILE_FBLOCK_HANDLER_CLEANUP,
     COMPILE_FBLOCK_POP_VALUE,
     COMPILE_FBLOCK_EXCEPTION_HANDLER,
     COMPILE_FBLOCK_EXCEPTION_GROUP_HANDLER,
     COMPILE_FBLOCK_ASYNC_COMPREHENSION_GENERATOR,
     COMPILE_FBLOCK_STOP_ITERATION,
};

typedef struct {
    enum _PyCompile_FBlockType fb_type;
    _PyJumpTargetLabel fb_block;
    _Ty_SourceLocation fb_loc;
    /* (optional) type-specific exit or cleanup block */
    _PyJumpTargetLabel fb_exit;
    /* (optional) additional information required for unwinding */
    void *fb_datum;
} _PyCompile_FBlockInfo;


int _PyCompile_PushFBlock(struct _PyCompiler *c, _Ty_SourceLocation loc,
                          enum _PyCompile_FBlockType t,
                          _PyJumpTargetLabel block_label,
                          _PyJumpTargetLabel exit, void *datum);
void _PyCompile_PopFBlock(struct _PyCompiler *c, enum _PyCompile_FBlockType t,
                          _PyJumpTargetLabel block_label);
_PyCompile_FBlockInfo *_PyCompile_TopFBlock(struct _PyCompiler *c);

int _PyCompile_EnterScope(struct _PyCompiler *c, identifier name, int scope_type,
                          void *key, int lineno, TyObject *private,
                          _PyCompile_CodeUnitMetadata *umd);
void _PyCompile_ExitScope(struct _PyCompiler *c);
Ty_ssize_t _PyCompile_AddConst(struct _PyCompiler *c, TyObject *o);
_PyInstructionSequence *_PyCompile_InstrSequence(struct _PyCompiler *c);
int _PyCompile_StartAnnotationSetup(struct _PyCompiler *c);
int _PyCompile_EndAnnotationSetup(struct _PyCompiler *c);
int _PyCompile_FutureFeatures(struct _PyCompiler *c);
void _PyCompile_DeferredAnnotations(
    struct _PyCompiler *c, TyObject **deferred_annotations,
    TyObject **conditional_annotation_indices);
TyObject *_PyCompile_Mangle(struct _PyCompiler *c, TyObject *name);
TyObject *_PyCompile_MaybeMangle(struct _PyCompiler *c, TyObject *name);
int _PyCompile_MaybeAddStaticAttributeToClass(struct _PyCompiler *c, expr_ty e);
int _PyCompile_GetRefType(struct _PyCompiler *c, TyObject *name);
int _PyCompile_LookupCellvar(struct _PyCompiler *c, TyObject *name);
int _PyCompile_ResolveNameop(struct _PyCompiler *c, TyObject *mangled, int scope,
                             _PyCompile_optype *optype, Ty_ssize_t *arg);

int _PyCompile_IsInteractiveTopLevel(struct _PyCompiler *c);
int _PyCompile_IsInInlinedComp(struct _PyCompiler *c);
int _PyCompile_ScopeType(struct _PyCompiler *c);
int _PyCompile_OptimizationLevel(struct _PyCompiler *c);
int _PyCompile_LookupArg(struct _PyCompiler *c, PyCodeObject *co, TyObject *name);
TyObject *_PyCompile_Qualname(struct _PyCompiler *c);
_PyCompile_CodeUnitMetadata *_PyCompile_Metadata(struct _PyCompiler *c);
TyObject *_PyCompile_StaticAttributesAsTuple(struct _PyCompiler *c);

struct symtable *_PyCompile_Symtable(struct _PyCompiler *c);
PySTEntryObject *_PyCompile_SymtableEntry(struct _PyCompiler *c);

enum {
    COMPILE_SCOPE_MODULE,
    COMPILE_SCOPE_CLASS,
    COMPILE_SCOPE_FUNCTION,
    COMPILE_SCOPE_ASYNC_FUNCTION,
    COMPILE_SCOPE_LAMBDA,
    COMPILE_SCOPE_COMPREHENSION,
    COMPILE_SCOPE_ANNOTATIONS,
};


typedef struct {
    TyObject *pushed_locals;
    TyObject *temp_symbols;
    TyObject *fast_hidden;
    _PyJumpTargetLabel cleanup;
} _PyCompile_InlinedComprehensionState;

int _PyCompile_TweakInlinedComprehensionScopes(struct _PyCompiler *c, _Ty_SourceLocation loc,
                                               PySTEntryObject *entry,
                                               _PyCompile_InlinedComprehensionState *state);
int _PyCompile_RevertInlinedComprehensionScopes(struct _PyCompiler *c, _Ty_SourceLocation loc,
                                                _PyCompile_InlinedComprehensionState *state);
int _PyCompile_AddDeferredAnnotation(struct _PyCompiler *c, stmt_ty s,
                                     TyObject **conditional_annotation_index);
void _PyCompile_EnterConditionalBlock(struct _PyCompiler *c);
void _PyCompile_LeaveConditionalBlock(struct _PyCompiler *c);

int _PyCodegen_AddReturnAtEnd(struct _PyCompiler *c, int addNone);
int _PyCodegen_EnterAnonymousScope(struct _PyCompiler* c, mod_ty mod);
int _PyCodegen_Expression(struct _PyCompiler *c, expr_ty e);
int _PyCodegen_Module(struct _PyCompiler *c, _Ty_SourceLocation loc, asdl_stmt_seq *stmts,
                      bool is_interactive);

int _PyCompile_ConstCacheMergeOne(TyObject *const_cache, TyObject **obj);

PyCodeObject *_PyCompile_OptimizeAndAssemble(struct _PyCompiler *c, int addNone);

Ty_ssize_t _PyCompile_DictAddObj(TyObject *dict, TyObject *o);
int _PyCompile_Error(struct _PyCompiler *c, _Ty_SourceLocation loc, const char *format, ...);
int _PyCompile_Warn(struct _PyCompiler *c, _Ty_SourceLocation loc, const char *format, ...);

// Export for '_opcode' extension module
PyAPI_FUNC(TyObject*) _PyCompile_GetUnaryIntrinsicName(int index);
PyAPI_FUNC(TyObject*) _PyCompile_GetBinaryIntrinsicName(int index);

/* Access compiler internals for unit testing */

// Export for '_testinternalcapi' shared extension
PyAPI_FUNC(TyObject*) _PyCompile_CleanDoc(TyObject *doc);

// Export for '_testinternalcapi' shared extension
PyAPI_FUNC(TyObject*) _PyCompile_CodeGen(
        TyObject *ast,
        TyObject *filename,
        PyCompilerFlags *flags,
        int optimize,
        int compile_mode);

// Export for '_testinternalcapi' shared extension
PyAPI_FUNC(PyCodeObject*)
_PyCompile_Assemble(_PyCompile_CodeUnitMetadata *umd, TyObject *filename,
                    TyObject *instructions);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_COMPILE_H */
