/*
 * This file compiles an abstract syntax tree (AST) into Python bytecode.
 *
 * The primary entry point is _TyAST_Compile(), which returns a
 * PyCodeObject.  The compiler makes several passes to build the code
 * object:
 *   1. Checks for future statements.  See future.c
 *   2. Builds a symbol table.  See symtable.c.
 *   3. Generate an instruction sequence. See compiler_mod() in this file, which
 *      calls functions from codegen.c.
 *   4. Generate a control flow graph and run optimizations on it.  See flowgraph.c.
 *   5. Assemble the basic blocks into final code.  See optimize_and_assemble() in
 *      this file, and assembler.c.
 *
 */

#include "Python.h"
#include "pycore_ast.h"           // TyAST_Check()
#include "pycore_code.h"
#include "pycore_compile.h"
#include "pycore_flowgraph.h"     // _PyCfg_FromInstructionSequence()
#include "pycore_pystate.h"       // _Ty_GetConfig()
#include "pycore_runtime.h"       // _Ty_ID()
#include "pycore_setobject.h"     // _TySet_NextEntry()
#include "pycore_stats.h"
#include "pycore_unicodeobject.h" // _TyUnicode_EqualToASCIIString()

#include "cpython/code.h"

#include <stdbool.h>


#undef SUCCESS
#undef ERROR
#define SUCCESS 0
#define ERROR -1

#define RETURN_IF_ERROR(X)  \
    do {                    \
        if ((X) == -1) {    \
            return ERROR;   \
        }                   \
    } while (0)

typedef _Ty_SourceLocation location;
typedef _PyJumpTargetLabel jump_target_label;
typedef _PyInstructionSequence instr_sequence;
typedef struct _PyCfgBuilder cfg_builder;
typedef _PyCompile_FBlockInfo fblockinfo;
typedef enum _PyCompile_FBlockType fblocktype;

/* The following items change on entry and exit of code blocks.
   They must be saved and restored when returning to a block.
*/
struct compiler_unit {
    PySTEntryObject *u_ste;

    int u_scope_type;

    TyObject *u_private;            /* for private name mangling */
    TyObject *u_static_attributes;  /* for class: attributes accessed via self.X */
    TyObject *u_deferred_annotations; /* AnnAssign nodes deferred to the end of compilation */
    TyObject *u_conditional_annotation_indices;  /* indices of annotations that are conditionally executed (or -1 for unconditional annotations) */
    long u_next_conditional_annotation_index;  /* index of the next conditional annotation */

    instr_sequence *u_instr_sequence; /* codegen output */
    instr_sequence *u_stashed_instr_sequence; /* temporarily stashed parent instruction sequence */

    int u_nfblocks;
    int u_in_inlined_comp;
    int u_in_conditional_block;

    _PyCompile_FBlockInfo u_fblock[CO_MAXBLOCKS];

    _PyCompile_CodeUnitMetadata u_metadata;
};

/* This struct captures the global state of a compilation.

The u pointer points to the current compilation unit, while units
for enclosing blocks are stored in c_stack.     The u and c_stack are
managed by _PyCompile_EnterScope() and _PyCompile_ExitScope().

Note that we don't track recursion levels during compilation - the
task of detecting and rejecting excessive levels of nesting is
handled by the symbol analysis pass.

*/

typedef struct _PyCompiler {
    TyObject *c_filename;
    struct symtable *c_st;
    _PyFutureFeatures c_future;  /* module's __future__ */
    PyCompilerFlags c_flags;

    int c_optimize;              /* optimization level */
    int c_interactive;           /* true if in interactive mode */
    TyObject *c_const_cache;     /* Python dict holding all constants,
                                    including names tuple */
    struct compiler_unit *u;     /* compiler state for current block */
    TyObject *c_stack;           /* Python list holding compiler_unit ptrs */

    bool c_save_nested_seqs;     /* if true, construct recursive instruction sequences
                                  * (including instructions for nested code objects)
                                  */
} compiler;

static int
compiler_setup(compiler *c, mod_ty mod, TyObject *filename,
               PyCompilerFlags *flags, int optimize, PyArena *arena)
{
    PyCompilerFlags local_flags = _PyCompilerFlags_INIT;

    c->c_const_cache = TyDict_New();
    if (!c->c_const_cache) {
        return ERROR;
    }

    c->c_stack = TyList_New(0);
    if (!c->c_stack) {
        return ERROR;
    }

    c->c_filename = Ty_NewRef(filename);
    if (!_PyFuture_FromAST(mod, filename, &c->c_future)) {
        return ERROR;
    }
    if (!flags) {
        flags = &local_flags;
    }
    int merged = c->c_future.ff_features | flags->cf_flags;
    c->c_future.ff_features = merged;
    flags->cf_flags = merged;
    c->c_flags = *flags;
    c->c_optimize = (optimize == -1) ? _Ty_GetConfig()->optimization_level : optimize;
    c->c_save_nested_seqs = false;

    if (!_TyAST_Preprocess(mod, arena, filename, c->c_optimize, merged, 0)) {
        return ERROR;
    }
    c->c_st = _TySymtable_Build(mod, filename, &c->c_future);
    if (c->c_st == NULL) {
        if (!TyErr_Occurred()) {
            TyErr_SetString(TyExc_SystemError, "no symtable");
        }
        return ERROR;
    }
    return SUCCESS;
}

static void
compiler_free(compiler *c)
{
    if (c->c_st) {
        _TySymtable_Free(c->c_st);
    }
    Ty_XDECREF(c->c_filename);
    Ty_XDECREF(c->c_const_cache);
    Ty_XDECREF(c->c_stack);
    TyMem_Free(c);
}

static compiler*
new_compiler(mod_ty mod, TyObject *filename, PyCompilerFlags *pflags,
             int optimize, PyArena *arena)
{
    compiler *c = TyMem_Calloc(1, sizeof(compiler));
    if (c == NULL) {
        return NULL;
    }
    if (compiler_setup(c, mod, filename, pflags, optimize, arena) < 0) {
        compiler_free(c);
        return NULL;
    }
    return c;
}

static void
compiler_unit_free(struct compiler_unit *u)
{
    Ty_CLEAR(u->u_instr_sequence);
    Ty_CLEAR(u->u_stashed_instr_sequence);
    Ty_CLEAR(u->u_ste);
    Ty_CLEAR(u->u_metadata.u_name);
    Ty_CLEAR(u->u_metadata.u_qualname);
    Ty_CLEAR(u->u_metadata.u_consts);
    Ty_CLEAR(u->u_metadata.u_names);
    Ty_CLEAR(u->u_metadata.u_varnames);
    Ty_CLEAR(u->u_metadata.u_freevars);
    Ty_CLEAR(u->u_metadata.u_cellvars);
    Ty_CLEAR(u->u_metadata.u_fasthidden);
    Ty_CLEAR(u->u_private);
    Ty_CLEAR(u->u_static_attributes);
    Ty_CLEAR(u->u_deferred_annotations);
    Ty_CLEAR(u->u_conditional_annotation_indices);
    TyMem_Free(u);
}

#define CAPSULE_NAME "compile.c compiler unit"

int
_PyCompile_MaybeAddStaticAttributeToClass(compiler *c, expr_ty e)
{
    assert(e->kind == Attribute_kind);
    expr_ty attr_value = e->v.Attribute.value;
    if (attr_value->kind != Name_kind ||
        e->v.Attribute.ctx != Store ||
        !_TyUnicode_EqualToASCIIString(attr_value->v.Name.id, "self"))
    {
        return SUCCESS;
    }
    Ty_ssize_t stack_size = TyList_GET_SIZE(c->c_stack);
    for (Ty_ssize_t i = stack_size - 1; i >= 0; i--) {
        TyObject *capsule = TyList_GET_ITEM(c->c_stack, i);
        struct compiler_unit *u = (struct compiler_unit *)PyCapsule_GetPointer(
                                                              capsule, CAPSULE_NAME);
        assert(u);
        if (u->u_scope_type == COMPILE_SCOPE_CLASS) {
            assert(u->u_static_attributes);
            RETURN_IF_ERROR(TySet_Add(u->u_static_attributes, e->v.Attribute.attr));
            break;
        }
    }
    return SUCCESS;
}

static int
compiler_set_qualname(compiler *c)
{
    Ty_ssize_t stack_size;
    struct compiler_unit *u = c->u;
    TyObject *name, *base;

    base = NULL;
    stack_size = TyList_GET_SIZE(c->c_stack);
    assert(stack_size >= 1);
    if (stack_size > 1) {
        int scope, force_global = 0;
        struct compiler_unit *parent;
        TyObject *mangled, *capsule;

        capsule = TyList_GET_ITEM(c->c_stack, stack_size - 1);
        parent = (struct compiler_unit *)PyCapsule_GetPointer(capsule, CAPSULE_NAME);
        assert(parent);
        if (parent->u_scope_type == COMPILE_SCOPE_ANNOTATIONS) {
            /* The parent is an annotation scope, so we need to
               look at the grandparent. */
            if (stack_size == 2) {
                // If we're immediately within the module, we can skip
                // the rest and just set the qualname to be the same as name.
                u->u_metadata.u_qualname = Ty_NewRef(u->u_metadata.u_name);
                return SUCCESS;
            }
            capsule = TyList_GET_ITEM(c->c_stack, stack_size - 2);
            parent = (struct compiler_unit *)PyCapsule_GetPointer(capsule, CAPSULE_NAME);
            assert(parent);
        }

        if (u->u_scope_type == COMPILE_SCOPE_FUNCTION
            || u->u_scope_type == COMPILE_SCOPE_ASYNC_FUNCTION
            || u->u_scope_type == COMPILE_SCOPE_CLASS) {
            assert(u->u_metadata.u_name);
            mangled = _Ty_Mangle(parent->u_private, u->u_metadata.u_name);
            if (!mangled) {
                return ERROR;
            }

            scope = _PyST_GetScope(parent->u_ste, mangled);
            Ty_DECREF(mangled);
            RETURN_IF_ERROR(scope);
            assert(scope != GLOBAL_IMPLICIT);
            if (scope == GLOBAL_EXPLICIT)
                force_global = 1;
        }

        if (!force_global) {
            if (parent->u_scope_type == COMPILE_SCOPE_FUNCTION
                || parent->u_scope_type == COMPILE_SCOPE_ASYNC_FUNCTION
                || parent->u_scope_type == COMPILE_SCOPE_LAMBDA)
            {
                _Ty_DECLARE_STR(dot_locals, ".<locals>");
                base = TyUnicode_Concat(parent->u_metadata.u_qualname,
                                        &_Ty_STR(dot_locals));
                if (base == NULL) {
                    return ERROR;
                }
            }
            else {
                base = Ty_NewRef(parent->u_metadata.u_qualname);
            }
        }
    }

    if (base != NULL) {
        name = TyUnicode_Concat(base, _Ty_LATIN1_CHR('.'));
        Ty_DECREF(base);
        if (name == NULL) {
            return ERROR;
        }
        TyUnicode_Append(&name, u->u_metadata.u_name);
        if (name == NULL) {
            return ERROR;
        }
    }
    else {
        name = Ty_NewRef(u->u_metadata.u_name);
    }
    u->u_metadata.u_qualname = name;

    return SUCCESS;
}

/* Merge const *o* and return constant key object.
 * If recursive, insert all elements if o is a tuple or frozen set.
 */
static TyObject*
const_cache_insert(TyObject *const_cache, TyObject *o, bool recursive)
{
    assert(TyDict_CheckExact(const_cache));
    // None and Ellipsis are immortal objects, and key is the singleton.
    // No need to merge object and key.
    if (o == Ty_None || o == Ty_Ellipsis) {
        return o;
    }

    TyObject *key = _TyCode_ConstantKey(o);
    if (key == NULL) {
        return NULL;
    }

    TyObject *t;
    int res = TyDict_SetDefaultRef(const_cache, key, key, &t);
    if (res != 0) {
        // o was not inserted into const_cache. t is either the existing value
        // or NULL (on error).
        Ty_DECREF(key);
        return t;
    }
    Ty_DECREF(t);

    if (!recursive) {
        return key;
    }

    // We registered o in const_cache.
    // When o is a tuple or frozenset, we want to merge its
    // items too.
    if (TyTuple_CheckExact(o)) {
        Ty_ssize_t len = TyTuple_GET_SIZE(o);
        for (Ty_ssize_t i = 0; i < len; i++) {
            TyObject *item = TyTuple_GET_ITEM(o, i);
            TyObject *u = const_cache_insert(const_cache, item, recursive);
            if (u == NULL) {
                Ty_DECREF(key);
                return NULL;
            }

            // See _TyCode_ConstantKey()
            TyObject *v;  // borrowed
            if (TyTuple_CheckExact(u)) {
                v = TyTuple_GET_ITEM(u, 1);
            }
            else {
                v = u;
            }
            if (v != item) {
                TyTuple_SET_ITEM(o, i, Ty_NewRef(v));
                Ty_DECREF(item);
            }

            Ty_DECREF(u);
        }
    }
    else if (TyFrozenSet_CheckExact(o)) {
        // *key* is tuple. And its first item is frozenset of
        // constant keys.
        // See _TyCode_ConstantKey() for detail.
        assert(TyTuple_CheckExact(key));
        assert(TyTuple_GET_SIZE(key) == 2);

        Ty_ssize_t len = TySet_GET_SIZE(o);
        if (len == 0) {  // empty frozenset should not be re-created.
            return key;
        }
        TyObject *tuple = TyTuple_New(len);
        if (tuple == NULL) {
            Ty_DECREF(key);
            return NULL;
        }
        Ty_ssize_t i = 0, pos = 0;
        TyObject *item;
        Ty_hash_t hash;
        while (_TySet_NextEntry(o, &pos, &item, &hash)) {
            TyObject *k = const_cache_insert(const_cache, item, recursive);
            if (k == NULL) {
                Ty_DECREF(tuple);
                Ty_DECREF(key);
                return NULL;
            }
            TyObject *u;
            if (TyTuple_CheckExact(k)) {
                u = Ty_NewRef(TyTuple_GET_ITEM(k, 1));
                Ty_DECREF(k);
            }
            else {
                u = k;
            }
            TyTuple_SET_ITEM(tuple, i, u);  // Steals reference of u.
            i++;
        }

        // Instead of rewriting o, we create new frozenset and embed in the
        // key tuple.  Caller should get merged frozenset from the key tuple.
        TyObject *new = TyFrozenSet_New(tuple);
        Ty_DECREF(tuple);
        if (new == NULL) {
            Ty_DECREF(key);
            return NULL;
        }
        assert(TyTuple_GET_ITEM(key, 1) == o);
        Ty_DECREF(o);
        TyTuple_SET_ITEM(key, 1, new);
    }

    return key;
}

static TyObject*
merge_consts_recursive(TyObject *const_cache, TyObject *o)
{
    return const_cache_insert(const_cache, o, true);
}

Ty_ssize_t
_PyCompile_DictAddObj(TyObject *dict, TyObject *o)
{
    TyObject *v;
    Ty_ssize_t arg;

    if (TyDict_GetItemRef(dict, o, &v) < 0) {
        return ERROR;
    }
    if (!v) {
        arg = TyDict_GET_SIZE(dict);
        v = TyLong_FromSsize_t(arg);
        if (!v) {
            return ERROR;
        }
        if (TyDict_SetItem(dict, o, v) < 0) {
            Ty_DECREF(v);
            return ERROR;
        }
    }
    else
        arg = TyLong_AsLong(v);
    Ty_DECREF(v);
    return arg;
}

Ty_ssize_t
_PyCompile_AddConst(compiler *c, TyObject *o)
{
    TyObject *key = merge_consts_recursive(c->c_const_cache, o);
    if (key == NULL) {
        return ERROR;
    }

    Ty_ssize_t arg = _PyCompile_DictAddObj(c->u->u_metadata.u_consts, key);
    Ty_DECREF(key);
    return arg;
}

static TyObject *
list2dict(TyObject *list)
{
    Ty_ssize_t i, n;
    TyObject *v, *k;
    TyObject *dict = TyDict_New();
    if (!dict) return NULL;

    n = TyList_Size(list);
    for (i = 0; i < n; i++) {
        v = TyLong_FromSsize_t(i);
        if (!v) {
            Ty_DECREF(dict);
            return NULL;
        }
        k = TyList_GET_ITEM(list, i);
        if (TyDict_SetItem(dict, k, v) < 0) {
            Ty_DECREF(v);
            Ty_DECREF(dict);
            return NULL;
        }
        Ty_DECREF(v);
    }
    return dict;
}

/* Return new dict containing names from src that match scope(s).

src is a symbol table dictionary.  If the scope of a name matches
either scope_type or flag is set, insert it into the new dict.  The
values are integers, starting at offset and increasing by one for
each key.
*/

static TyObject *
dictbytype(TyObject *src, int scope_type, int flag, Ty_ssize_t offset)
{
    Ty_ssize_t i = offset, num_keys, key_i;
    TyObject *k, *v, *dest = TyDict_New();
    TyObject *sorted_keys;

    assert(offset >= 0);
    if (dest == NULL)
        return NULL;

    /* Sort the keys so that we have a deterministic order on the indexes
       saved in the returned dictionary.  These indexes are used as indexes
       into the free and cell var storage.  Therefore if they aren't
       deterministic, then the generated bytecode is not deterministic.
    */
    sorted_keys = TyDict_Keys(src);
    if (sorted_keys == NULL) {
        Ty_DECREF(dest);
        return NULL;
    }
    if (TyList_Sort(sorted_keys) != 0) {
        Ty_DECREF(sorted_keys);
        Ty_DECREF(dest);
        return NULL;
    }
    num_keys = TyList_GET_SIZE(sorted_keys);

    for (key_i = 0; key_i < num_keys; key_i++) {
        k = TyList_GET_ITEM(sorted_keys, key_i);
        v = TyDict_GetItemWithError(src, k);
        if (!v) {
            if (!TyErr_Occurred()) {
                TyErr_SetObject(TyExc_KeyError, k);
            }
            Ty_DECREF(sorted_keys);
            Ty_DECREF(dest);
            return NULL;
        }
        long vi = TyLong_AsLong(v);
        if (vi == -1 && TyErr_Occurred()) {
            Ty_DECREF(sorted_keys);
            Ty_DECREF(dest);
            return NULL;
        }
        if (SYMBOL_TO_SCOPE(vi) == scope_type || vi & flag) {
            TyObject *item = TyLong_FromSsize_t(i);
            if (item == NULL) {
                Ty_DECREF(sorted_keys);
                Ty_DECREF(dest);
                return NULL;
            }
            i++;
            if (TyDict_SetItem(dest, k, item) < 0) {
                Ty_DECREF(sorted_keys);
                Ty_DECREF(item);
                Ty_DECREF(dest);
                return NULL;
            }
            Ty_DECREF(item);
        }
    }
    Ty_DECREF(sorted_keys);
    return dest;
}

int
_PyCompile_EnterScope(compiler *c, identifier name, int scope_type,
                       void *key, int lineno, TyObject *private,
                      _PyCompile_CodeUnitMetadata *umd)
{
    struct compiler_unit *u;
    u = (struct compiler_unit *)TyMem_Calloc(1, sizeof(struct compiler_unit));
    if (!u) {
        TyErr_NoMemory();
        return ERROR;
    }
    u->u_scope_type = scope_type;
    if (umd != NULL) {
        u->u_metadata = *umd;
    }
    else {
        u->u_metadata.u_argcount = 0;
        u->u_metadata.u_posonlyargcount = 0;
        u->u_metadata.u_kwonlyargcount = 0;
    }
    u->u_ste = _TySymtable_Lookup(c->c_st, key);
    if (!u->u_ste) {
        compiler_unit_free(u);
        return ERROR;
    }
    u->u_metadata.u_name = Ty_NewRef(name);
    u->u_metadata.u_varnames = list2dict(u->u_ste->ste_varnames);
    if (!u->u_metadata.u_varnames) {
        compiler_unit_free(u);
        return ERROR;
    }
    u->u_metadata.u_cellvars = dictbytype(u->u_ste->ste_symbols, CELL, DEF_COMP_CELL, 0);
    if (!u->u_metadata.u_cellvars) {
        compiler_unit_free(u);
        return ERROR;
    }
    if (u->u_ste->ste_needs_class_closure) {
        /* Cook up an implicit __class__ cell. */
        Ty_ssize_t res;
        assert(u->u_scope_type == COMPILE_SCOPE_CLASS);
        res = _PyCompile_DictAddObj(u->u_metadata.u_cellvars, &_Ty_ID(__class__));
        if (res < 0) {
            compiler_unit_free(u);
            return ERROR;
        }
    }
    if (u->u_ste->ste_needs_classdict) {
        /* Cook up an implicit __classdict__ cell. */
        Ty_ssize_t res;
        assert(u->u_scope_type == COMPILE_SCOPE_CLASS);
        res = _PyCompile_DictAddObj(u->u_metadata.u_cellvars, &_Ty_ID(__classdict__));
        if (res < 0) {
            compiler_unit_free(u);
            return ERROR;
        }
    }
    if (u->u_ste->ste_has_conditional_annotations) {
        /* Cook up an implicit __conditional__annotations__ cell */
        Ty_ssize_t res;
        assert(u->u_scope_type == COMPILE_SCOPE_CLASS || u->u_scope_type == COMPILE_SCOPE_MODULE);
        res = _PyCompile_DictAddObj(u->u_metadata.u_cellvars, &_Ty_ID(__conditional_annotations__));
        if (res < 0) {
            compiler_unit_free(u);
            return ERROR;
        }
    }

    u->u_metadata.u_freevars = dictbytype(u->u_ste->ste_symbols, FREE, DEF_FREE_CLASS,
                               TyDict_GET_SIZE(u->u_metadata.u_cellvars));
    if (!u->u_metadata.u_freevars) {
        compiler_unit_free(u);
        return ERROR;
    }

    u->u_metadata.u_fasthidden = TyDict_New();
    if (!u->u_metadata.u_fasthidden) {
        compiler_unit_free(u);
        return ERROR;
    }

    u->u_nfblocks = 0;
    u->u_in_inlined_comp = 0;
    u->u_metadata.u_firstlineno = lineno;
    u->u_metadata.u_consts = TyDict_New();
    if (!u->u_metadata.u_consts) {
        compiler_unit_free(u);
        return ERROR;
    }
    u->u_metadata.u_names = TyDict_New();
    if (!u->u_metadata.u_names) {
        compiler_unit_free(u);
        return ERROR;
    }

    u->u_deferred_annotations = NULL;
    u->u_conditional_annotation_indices = NULL;
    u->u_next_conditional_annotation_index = 0;
    if (scope_type == COMPILE_SCOPE_CLASS) {
        u->u_static_attributes = TySet_New(0);
        if (!u->u_static_attributes) {
            compiler_unit_free(u);
            return ERROR;
        }
    }
    else {
        u->u_static_attributes = NULL;
    }

    u->u_instr_sequence = (instr_sequence*)_PyInstructionSequence_New();
    if (!u->u_instr_sequence) {
        compiler_unit_free(u);
        return ERROR;
    }
    u->u_stashed_instr_sequence = NULL;

    /* Push the old compiler_unit on the stack. */
    if (c->u) {
        TyObject *capsule = PyCapsule_New(c->u, CAPSULE_NAME, NULL);
        if (!capsule || TyList_Append(c->c_stack, capsule) < 0) {
            Ty_XDECREF(capsule);
            compiler_unit_free(u);
            return ERROR;
        }
        Ty_DECREF(capsule);
        if (private == NULL) {
            private = c->u->u_private;
        }
    }

    u->u_private = Ty_XNewRef(private);

    c->u = u;
    if (scope_type != COMPILE_SCOPE_MODULE) {
        RETURN_IF_ERROR(compiler_set_qualname(c));
    }
    return SUCCESS;
}

void
_PyCompile_ExitScope(compiler *c)
{
    // Don't call PySequence_DelItem() with an exception raised
    TyObject *exc = TyErr_GetRaisedException();

    instr_sequence *nested_seq = NULL;
    if (c->c_save_nested_seqs) {
        nested_seq = c->u->u_instr_sequence;
        Ty_INCREF(nested_seq);
    }
    compiler_unit_free(c->u);
    /* Restore c->u to the parent unit. */
    Ty_ssize_t n = TyList_GET_SIZE(c->c_stack) - 1;
    if (n >= 0) {
        TyObject *capsule = TyList_GET_ITEM(c->c_stack, n);
        c->u = (struct compiler_unit *)PyCapsule_GetPointer(capsule, CAPSULE_NAME);
        assert(c->u);
        /* we are deleting from a list so this really shouldn't fail */
        if (PySequence_DelItem(c->c_stack, n) < 0) {
            TyErr_FormatUnraisable("Exception ignored while removing "
                                   "the last compiler stack item");
        }
        if (nested_seq != NULL) {
            if (_PyInstructionSequence_AddNested(c->u->u_instr_sequence, nested_seq) < 0) {
                TyErr_FormatUnraisable("Exception ignored while appending "
                                       "nested instruction sequence");
            }
        }
    }
    else {
        c->u = NULL;
    }
    Ty_XDECREF(nested_seq);

    TyErr_SetRaisedException(exc);
}

/*
 * Frame block handling functions
 */

int
_PyCompile_PushFBlock(compiler *c, location loc,
                     fblocktype t, jump_target_label block_label,
                     jump_target_label exit, void *datum)
{
    fblockinfo *f;
    if (c->u->u_nfblocks >= CO_MAXBLOCKS) {
        return _PyCompile_Error(c, loc, "too many statically nested blocks");
    }
    f = &c->u->u_fblock[c->u->u_nfblocks++];
    f->fb_type = t;
    f->fb_block = block_label;
    f->fb_loc = loc;
    f->fb_exit = exit;
    f->fb_datum = datum;
    return SUCCESS;
}

void
_PyCompile_PopFBlock(compiler *c, fblocktype t, jump_target_label block_label)
{
    struct compiler_unit *u = c->u;
    assert(u->u_nfblocks > 0);
    u->u_nfblocks--;
    assert(u->u_fblock[u->u_nfblocks].fb_type == t);
    assert(SAME_JUMP_TARGET_LABEL(u->u_fblock[u->u_nfblocks].fb_block, block_label));
}

fblockinfo *
_PyCompile_TopFBlock(compiler *c)
{
    if (c->u->u_nfblocks == 0) {
        return NULL;
    }
    return &c->u->u_fblock[c->u->u_nfblocks - 1];
}

void
_PyCompile_DeferredAnnotations(compiler *c,
                               TyObject **deferred_annotations,
                               TyObject **conditional_annotation_indices)
{
    *deferred_annotations = Ty_XNewRef(c->u->u_deferred_annotations);
    *conditional_annotation_indices = Ty_XNewRef(c->u->u_conditional_annotation_indices);
}

static location
start_location(asdl_stmt_seq *stmts)
{
    if (asdl_seq_LEN(stmts) > 0) {
        /* Set current line number to the line number of first statement.
         * This way line number for SETUP_ANNOTATIONS will always
         * coincide with the line number of first "real" statement in module.
         * If body is empty, then lineno will be set later in the assembly stage.
         */
        stmt_ty st = (stmt_ty)asdl_seq_GET(stmts, 0);
        return SRC_LOCATION_FROM_AST(st);
    }
    return (const _Ty_SourceLocation){1, 1, 0, 0};
}

static int
compiler_codegen(compiler *c, mod_ty mod)
{
    RETURN_IF_ERROR(_PyCodegen_EnterAnonymousScope(c, mod));
    assert(c->u->u_scope_type == COMPILE_SCOPE_MODULE);
    switch (mod->kind) {
    case Module_kind: {
        asdl_stmt_seq *stmts = mod->v.Module.body;
        RETURN_IF_ERROR(_PyCodegen_Module(c, start_location(stmts), stmts, false));
        break;
    }
    case Interactive_kind: {
        c->c_interactive = 1;
        asdl_stmt_seq *stmts = mod->v.Interactive.body;
        RETURN_IF_ERROR(_PyCodegen_Module(c, start_location(stmts), stmts, true));
        break;
    }
    case Expression_kind: {
        RETURN_IF_ERROR(_PyCodegen_Expression(c, mod->v.Expression.body));
        break;
    }
    default: {
        TyErr_Format(TyExc_SystemError,
                     "module kind %d should not be possible",
                     mod->kind);
        return ERROR;
    }}
    return SUCCESS;
}

static PyCodeObject *
compiler_mod(compiler *c, mod_ty mod)
{
    PyCodeObject *co = NULL;
    int addNone = mod->kind != Expression_kind;
    if (compiler_codegen(c, mod) < 0) {
        goto finally;
    }
    co = _PyCompile_OptimizeAndAssemble(c, addNone);
finally:
    _PyCompile_ExitScope(c);
    return co;
}

int
_PyCompile_GetRefType(compiler *c, TyObject *name)
{
    if (c->u->u_scope_type == COMPILE_SCOPE_CLASS &&
        (_TyUnicode_EqualToASCIIString(name, "__class__") ||
         _TyUnicode_EqualToASCIIString(name, "__classdict__") ||
         _TyUnicode_EqualToASCIIString(name, "__conditional_annotations__"))) {
        return CELL;
    }
    PySTEntryObject *ste = c->u->u_ste;
    int scope = _PyST_GetScope(ste, name);
    if (scope == 0) {
        TyErr_Format(TyExc_SystemError,
                     "_PyST_GetScope(name=%R) failed: "
                     "unknown scope in unit %S (%R); "
                     "symbols: %R; locals: %R; "
                     "globals: %R",
                     name,
                     c->u->u_metadata.u_name, ste->ste_id,
                     ste->ste_symbols, c->u->u_metadata.u_varnames,
                     c->u->u_metadata.u_names);
        return ERROR;
    }
    return scope;
}

static int
dict_lookup_arg(TyObject *dict, TyObject *name)
{
    TyObject *v = TyDict_GetItemWithError(dict, name);
    if (v == NULL) {
        return ERROR;
    }
    return TyLong_AsLong(v);
}

int
_PyCompile_LookupCellvar(compiler *c, TyObject *name)
{
    assert(c->u->u_metadata.u_cellvars);
    return dict_lookup_arg(c->u->u_metadata.u_cellvars, name);
}

int
_PyCompile_LookupArg(compiler *c, PyCodeObject *co, TyObject *name)
{
    /* Special case: If a class contains a method with a
     * free variable that has the same name as a method,
     * the name will be considered free *and* local in the
     * class.  It should be handled by the closure, as
     * well as by the normal name lookup logic.
     */
    int reftype = _PyCompile_GetRefType(c, name);
    if (reftype == -1) {
        return ERROR;
    }
    int arg;
    if (reftype == CELL) {
        arg = dict_lookup_arg(c->u->u_metadata.u_cellvars, name);
    }
    else {
        arg = dict_lookup_arg(c->u->u_metadata.u_freevars, name);
    }
    if (arg == -1 && !TyErr_Occurred()) {
        TyObject *freevars = _TyCode_GetFreevars(co);
        if (freevars == NULL) {
            TyErr_Clear();
        }
        TyErr_Format(TyExc_SystemError,
            "compiler_lookup_arg(name=%R) with reftype=%d failed in %S; "
            "freevars of code %S: %R",
            name,
            reftype,
            c->u->u_metadata.u_name,
            co->co_name,
            freevars);
        Ty_XDECREF(freevars);
        return ERROR;
    }
    return arg;
}

TyObject *
_PyCompile_StaticAttributesAsTuple(compiler *c)
{
    assert(c->u->u_static_attributes);
    TyObject *static_attributes_unsorted = PySequence_List(c->u->u_static_attributes);
    if (static_attributes_unsorted == NULL) {
        return NULL;
    }
    if (TyList_Sort(static_attributes_unsorted) != 0) {
        Ty_DECREF(static_attributes_unsorted);
        return NULL;
    }
    TyObject *static_attributes = PySequence_Tuple(static_attributes_unsorted);
    Ty_DECREF(static_attributes_unsorted);
    return static_attributes;
}

int
_PyCompile_ResolveNameop(compiler *c, TyObject *mangled, int scope,
                          _PyCompile_optype *optype, Ty_ssize_t *arg)
{
    TyObject *dict = c->u->u_metadata.u_names;
    *optype = COMPILE_OP_NAME;

    assert(scope >= 0);
    switch (scope) {
    case FREE:
        dict = c->u->u_metadata.u_freevars;
        *optype = COMPILE_OP_DEREF;
        break;
    case CELL:
        dict = c->u->u_metadata.u_cellvars;
        *optype = COMPILE_OP_DEREF;
        break;
    case LOCAL:
        if (_PyST_IsFunctionLike(c->u->u_ste)) {
            *optype = COMPILE_OP_FAST;
        }
        else {
            TyObject *item;
            RETURN_IF_ERROR(TyDict_GetItemRef(c->u->u_metadata.u_fasthidden, mangled,
                                              &item));
            if (item == Ty_True) {
                *optype = COMPILE_OP_FAST;
            }
            Ty_XDECREF(item);
        }
        break;
    case GLOBAL_IMPLICIT:
        if (_PyST_IsFunctionLike(c->u->u_ste)) {
            *optype = COMPILE_OP_GLOBAL;
        }
        break;
    case GLOBAL_EXPLICIT:
        *optype = COMPILE_OP_GLOBAL;
        break;
    default:
        /* scope can be 0 */
        break;
    }
    if (*optype != COMPILE_OP_FAST) {
        *arg = _PyCompile_DictAddObj(dict, mangled);
        RETURN_IF_ERROR(*arg);
    }
    return SUCCESS;
}

int
_PyCompile_TweakInlinedComprehensionScopes(compiler *c, location loc,
                                            PySTEntryObject *entry,
                                            _PyCompile_InlinedComprehensionState *state)
{
    int in_class_block = (c->u->u_ste->ste_type == ClassBlock) && !c->u->u_in_inlined_comp;
    c->u->u_in_inlined_comp++;

    TyObject *k, *v;
    Ty_ssize_t pos = 0;
    while (TyDict_Next(entry->ste_symbols, &pos, &k, &v)) {
        long symbol = TyLong_AsLong(v);
        assert(symbol >= 0 || TyErr_Occurred());
        RETURN_IF_ERROR(symbol);
        long scope = SYMBOL_TO_SCOPE(symbol);

        long outsymbol = _PyST_GetSymbol(c->u->u_ste, k);
        RETURN_IF_ERROR(outsymbol);
        long outsc = SYMBOL_TO_SCOPE(outsymbol);

        // If a name has different scope inside than outside the comprehension,
        // we need to temporarily handle it with the right scope while
        // compiling the comprehension. If it's free in the comprehension
        // scope, no special handling; it should be handled the same as the
        // enclosing scope. (If it's free in outer scope and cell in inner
        // scope, we can't treat it as both cell and free in the same function,
        // but treating it as free throughout is fine; it's *_DEREF
        // either way.)
        if ((scope != outsc && scope != FREE && !(scope == CELL && outsc == FREE))
                || in_class_block) {
            if (state->temp_symbols == NULL) {
                state->temp_symbols = TyDict_New();
                if (state->temp_symbols == NULL) {
                    return ERROR;
                }
            }
            // update the symbol to the in-comprehension version and save
            // the outer version; we'll restore it after running the
            // comprehension
            if (TyDict_SetItem(c->u->u_ste->ste_symbols, k, v) < 0) {
                return ERROR;
            }
            TyObject *outv = TyLong_FromLong(outsymbol);
            if (outv == NULL) {
                return ERROR;
            }
            int res = TyDict_SetItem(state->temp_symbols, k, outv);
            Ty_DECREF(outv);
            RETURN_IF_ERROR(res);
        }
        // locals handling for names bound in comprehension (DEF_LOCAL |
        // DEF_NONLOCAL occurs in assignment expression to nonlocal)
        if ((symbol & DEF_LOCAL && !(symbol & DEF_NONLOCAL)) || in_class_block) {
            if (!_PyST_IsFunctionLike(c->u->u_ste)) {
                // non-function scope: override this name to use fast locals
                TyObject *orig;
                if (TyDict_GetItemRef(c->u->u_metadata.u_fasthidden, k, &orig) < 0) {
                    return ERROR;
                }
                assert(orig == NULL || orig == Ty_True || orig == Ty_False);
                if (orig != Ty_True) {
                    if (TyDict_SetItem(c->u->u_metadata.u_fasthidden, k, Ty_True) < 0) {
                        return ERROR;
                    }
                    if (state->fast_hidden == NULL) {
                        state->fast_hidden = TySet_New(NULL);
                        if (state->fast_hidden == NULL) {
                            return ERROR;
                        }
                    }
                    if (TySet_Add(state->fast_hidden, k) < 0) {
                        return ERROR;
                    }
                }
            }
        }
    }
    return SUCCESS;
}

int
_PyCompile_RevertInlinedComprehensionScopes(compiler *c, location loc,
                                             _PyCompile_InlinedComprehensionState *state)
{
    c->u->u_in_inlined_comp--;
    if (state->temp_symbols) {
        TyObject *k, *v;
        Ty_ssize_t pos = 0;
        while (TyDict_Next(state->temp_symbols, &pos, &k, &v)) {
            if (TyDict_SetItem(c->u->u_ste->ste_symbols, k, v)) {
                return ERROR;
            }
        }
        Ty_CLEAR(state->temp_symbols);
    }
    if (state->fast_hidden) {
        while (TySet_Size(state->fast_hidden) > 0) {
            TyObject *k = TySet_Pop(state->fast_hidden);
            if (k == NULL) {
                return ERROR;
            }
            // we set to False instead of clearing, so we can track which names
            // were temporarily fast-locals and should use CO_FAST_HIDDEN
            if (TyDict_SetItem(c->u->u_metadata.u_fasthidden, k, Ty_False)) {
                Ty_DECREF(k);
                return ERROR;
            }
            Ty_DECREF(k);
        }
        Ty_CLEAR(state->fast_hidden);
    }
    return SUCCESS;
}

void
_PyCompile_EnterConditionalBlock(struct _PyCompiler *c)
{
    c->u->u_in_conditional_block++;
}

void
_PyCompile_LeaveConditionalBlock(struct _PyCompiler *c)
{
    assert(c->u->u_in_conditional_block > 0);
    c->u->u_in_conditional_block--;
}

int
_PyCompile_AddDeferredAnnotation(compiler *c, stmt_ty s,
                                 TyObject **conditional_annotation_index)
{
    if (c->u->u_deferred_annotations == NULL) {
        c->u->u_deferred_annotations = TyList_New(0);
        if (c->u->u_deferred_annotations == NULL) {
            return ERROR;
        }
    }
    if (c->u->u_conditional_annotation_indices == NULL) {
        c->u->u_conditional_annotation_indices = TyList_New(0);
        if (c->u->u_conditional_annotation_indices == NULL) {
            return ERROR;
        }
    }
    TyObject *ptr = TyLong_FromVoidPtr((void *)s);
    if (ptr == NULL) {
        return ERROR;
    }
    if (TyList_Append(c->u->u_deferred_annotations, ptr) < 0) {
        Ty_DECREF(ptr);
        return ERROR;
    }
    Ty_DECREF(ptr);
    TyObject *index;
    if (c->u->u_scope_type == COMPILE_SCOPE_MODULE || c->u->u_in_conditional_block) {
        index = TyLong_FromLong(c->u->u_next_conditional_annotation_index);
        if (index == NULL) {
            return ERROR;
        }
        *conditional_annotation_index = Ty_NewRef(index);
        c->u->u_next_conditional_annotation_index++;
    }
    else {
        index = TyLong_FromLong(-1);
        if (index == NULL) {
            return ERROR;
        }
    }
    int rc = TyList_Append(c->u->u_conditional_annotation_indices, index);
    Ty_DECREF(index);
    RETURN_IF_ERROR(rc);
    return SUCCESS;
}

/* Raises a SyntaxError and returns ERROR.
 * If something goes wrong, a different exception may be raised.
 */
int
_PyCompile_Error(compiler *c, location loc, const char *format, ...)
{
    va_list vargs;
    va_start(vargs, format);
    TyObject *msg = TyUnicode_FromFormatV(format, vargs);
    va_end(vargs);
    if (msg == NULL) {
        return ERROR;
    }
    _TyErr_RaiseSyntaxError(msg, c->c_filename, loc.lineno, loc.col_offset + 1,
                            loc.end_lineno, loc.end_col_offset + 1);
    Ty_DECREF(msg);
    return ERROR;
}

/* Emits a SyntaxWarning and returns 0 on success.
   If a SyntaxWarning raised as error, replaces it with a SyntaxError
   and returns -1.
*/
int
_PyCompile_Warn(compiler *c, location loc, const char *format, ...)
{
    va_list vargs;
    va_start(vargs, format);
    TyObject *msg = TyUnicode_FromFormatV(format, vargs);
    va_end(vargs);
    if (msg == NULL) {
        return ERROR;
    }
    int ret = _TyErr_EmitSyntaxWarning(msg, c->c_filename, loc.lineno, loc.col_offset + 1,
                                       loc.end_lineno, loc.end_col_offset + 1);
    Ty_DECREF(msg);
    return ret;
}

TyObject *
_PyCompile_Mangle(compiler *c, TyObject *name)
{
    return _Ty_Mangle(c->u->u_private, name);
}

TyObject *
_PyCompile_MaybeMangle(compiler *c, TyObject *name)
{
    return _Ty_MaybeMangle(c->u->u_private, c->u->u_ste, name);
}

instr_sequence *
_PyCompile_InstrSequence(compiler *c)
{
    return c->u->u_instr_sequence;
}

int
_PyCompile_StartAnnotationSetup(struct _PyCompiler *c)
{
    instr_sequence *new_seq = (instr_sequence *)_PyInstructionSequence_New();
    if (new_seq == NULL) {
        return ERROR;
    }
    assert(c->u->u_stashed_instr_sequence == NULL);
    c->u->u_stashed_instr_sequence = c->u->u_instr_sequence;
    c->u->u_instr_sequence = new_seq;
    return SUCCESS;
}

int
_PyCompile_EndAnnotationSetup(struct _PyCompiler *c)
{
    assert(c->u->u_stashed_instr_sequence != NULL);
    instr_sequence *parent_seq = c->u->u_stashed_instr_sequence;
    instr_sequence *anno_seq = c->u->u_instr_sequence;
    c->u->u_stashed_instr_sequence = NULL;
    c->u->u_instr_sequence = parent_seq;
    if (_PyInstructionSequence_SetAnnotationsCode(parent_seq, anno_seq) == ERROR) {
        Ty_DECREF(anno_seq);
        return ERROR;
    }
    return SUCCESS;
}


int
_PyCompile_FutureFeatures(compiler *c)
{
    return c->c_future.ff_features;
}

struct symtable *
_PyCompile_Symtable(compiler *c)
{
    return c->c_st;
}

PySTEntryObject *
_PyCompile_SymtableEntry(compiler *c)
{
    return c->u->u_ste;
}

int
_PyCompile_OptimizationLevel(compiler *c)
{
    return c->c_optimize;
}

int
_PyCompile_IsInteractiveTopLevel(compiler *c)
{
    assert(c->c_stack != NULL);
    assert(TyList_CheckExact(c->c_stack));
    bool is_nested_scope = TyList_GET_SIZE(c->c_stack) > 0;
    return c->c_interactive && !is_nested_scope;
}

int
_PyCompile_ScopeType(compiler *c)
{
    return c->u->u_scope_type;
}

int
_PyCompile_IsInInlinedComp(compiler *c)
{
    return c->u->u_in_inlined_comp;
}

TyObject *
_PyCompile_Qualname(compiler *c)
{
    assert(c->u->u_metadata.u_qualname);
    return c->u->u_metadata.u_qualname;
}

_PyCompile_CodeUnitMetadata *
_PyCompile_Metadata(compiler *c)
{
    return &c->u->u_metadata;
}

// Merge *obj* with constant cache, without recursion.
int
_PyCompile_ConstCacheMergeOne(TyObject *const_cache, TyObject **obj)
{
    TyObject *key = const_cache_insert(const_cache, *obj, false);
    if (key == NULL) {
        return ERROR;
    }
    if (TyTuple_CheckExact(key)) {
        TyObject *item = TyTuple_GET_ITEM(key, 1);
        Ty_SETREF(*obj, Ty_NewRef(item));
        Ty_DECREF(key);
    }
    else {
        Ty_SETREF(*obj, key);
    }
    return SUCCESS;
}

static TyObject *
consts_dict_keys_inorder(TyObject *dict)
{
    TyObject *consts, *k, *v;
    Ty_ssize_t i, pos = 0, size = TyDict_GET_SIZE(dict);

    consts = TyList_New(size);   /* TyCode_Optimize() requires a list */
    if (consts == NULL)
        return NULL;
    while (TyDict_Next(dict, &pos, &k, &v)) {
        assert(TyLong_CheckExact(v));
        i = TyLong_AsLong(v);
        /* The keys of the dictionary can be tuples wrapping a constant.
         * (see _PyCompile_DictAddObj and _TyCode_ConstantKey). In that case
         * the object we want is always second. */
        if (TyTuple_CheckExact(k)) {
            k = TyTuple_GET_ITEM(k, 1);
        }
        assert(i < size);
        assert(i >= 0);
        TyList_SET_ITEM(consts, i, Ty_NewRef(k));
    }
    return consts;
}

static int
compute_code_flags(compiler *c)
{
    PySTEntryObject *ste = c->u->u_ste;
    int flags = 0;
    if (_PyST_IsFunctionLike(ste)) {
        flags |= CO_NEWLOCALS | CO_OPTIMIZED;
        if (ste->ste_nested)
            flags |= CO_NESTED;
        if (ste->ste_generator && !ste->ste_coroutine)
            flags |= CO_GENERATOR;
        if (ste->ste_generator && ste->ste_coroutine)
            flags |= CO_ASYNC_GENERATOR;
        if (ste->ste_varargs)
            flags |= CO_VARARGS;
        if (ste->ste_varkeywords)
            flags |= CO_VARKEYWORDS;
        if (ste->ste_has_docstring)
            flags |= CO_HAS_DOCSTRING;
        if (ste->ste_method)
            flags |= CO_METHOD;
    }

    if (ste->ste_coroutine && !ste->ste_generator) {
        flags |= CO_COROUTINE;
    }

    /* (Only) inherit compilerflags in PyCF_MASK */
    flags |= (c->c_flags.cf_flags & PyCF_MASK);

    return flags;
}

static PyCodeObject *
optimize_and_assemble_code_unit(struct compiler_unit *u, TyObject *const_cache,
                                int code_flags, TyObject *filename)
{
    cfg_builder *g = NULL;
    instr_sequence optimized_instrs;
    memset(&optimized_instrs, 0, sizeof(instr_sequence));

    PyCodeObject *co = NULL;
    TyObject *consts = consts_dict_keys_inorder(u->u_metadata.u_consts);
    if (consts == NULL) {
        goto error;
    }
    g = _PyCfg_FromInstructionSequence(u->u_instr_sequence);
    if (g == NULL) {
        goto error;
    }
    int nlocals = (int)TyDict_GET_SIZE(u->u_metadata.u_varnames);
    int nparams = (int)TyList_GET_SIZE(u->u_ste->ste_varnames);
    assert(u->u_metadata.u_firstlineno);

    if (_PyCfg_OptimizeCodeUnit(g, consts, const_cache, nlocals,
                                nparams, u->u_metadata.u_firstlineno) < 0) {
        goto error;
    }

    int stackdepth;
    int nlocalsplus;
    if (_PyCfg_OptimizedCfgToInstructionSequence(g, &u->u_metadata, code_flags,
                                                 &stackdepth, &nlocalsplus,
                                                 &optimized_instrs) < 0) {
        goto error;
    }

    /** Assembly **/
    co = _PyAssemble_MakeCodeObject(&u->u_metadata, const_cache, consts,
                                    stackdepth, &optimized_instrs, nlocalsplus,
                                    code_flags, filename);

error:
    Ty_XDECREF(consts);
    PyInstructionSequence_Fini(&optimized_instrs);
    _PyCfgBuilder_Free(g);
    return co;
}


PyCodeObject *
_PyCompile_OptimizeAndAssemble(compiler *c, int addNone)
{
    struct compiler_unit *u = c->u;
    TyObject *const_cache = c->c_const_cache;
    TyObject *filename = c->c_filename;

    int code_flags = compute_code_flags(c);
    if (code_flags < 0) {
        return NULL;
    }

    if (_PyCodegen_AddReturnAtEnd(c, addNone) < 0) {
        return NULL;
    }

    return optimize_and_assemble_code_unit(u, const_cache, code_flags, filename);
}

PyCodeObject *
_TyAST_Compile(mod_ty mod, TyObject *filename, PyCompilerFlags *pflags,
               int optimize, PyArena *arena)
{
    assert(!TyErr_Occurred());
    compiler *c = new_compiler(mod, filename, pflags, optimize, arena);
    if (c == NULL) {
        return NULL;
    }

    PyCodeObject *co = compiler_mod(c, mod);
    compiler_free(c);
    assert(co || TyErr_Occurred());
    return co;
}

int
_PyCompile_AstPreprocess(mod_ty mod, TyObject *filename, PyCompilerFlags *cf,
                         int optimize, PyArena *arena, int no_const_folding)
{
    _PyFutureFeatures future;
    if (!_PyFuture_FromAST(mod, filename, &future)) {
        return -1;
    }
    int flags = future.ff_features | cf->cf_flags;
    if (optimize == -1) {
        optimize = _Ty_GetConfig()->optimization_level;
    }
    if (!_TyAST_Preprocess(mod, arena, filename, optimize, flags, no_const_folding)) {
        return -1;
    }
    return 0;
}

// C implementation of inspect.cleandoc()
//
// Difference from inspect.cleandoc():
// - Do not remove leading and trailing blank lines to keep lineno.
TyObject *
_PyCompile_CleanDoc(TyObject *doc)
{
    doc = PyObject_CallMethod(doc, "expandtabs", NULL);
    if (doc == NULL) {
        return NULL;
    }

    Ty_ssize_t doc_size;
    const char *doc_utf8 = TyUnicode_AsUTF8AndSize(doc, &doc_size);
    if (doc_utf8 == NULL) {
        Ty_DECREF(doc);
        return NULL;
    }
    const char *p = doc_utf8;
    const char *pend = p + doc_size;

    // First pass: find minimum indentation of any non-blank lines
    // after first line.
    while (p < pend && *p++ != '\n') {
    }

    Ty_ssize_t margin = PY_SSIZE_T_MAX;
    while (p < pend) {
        const char *s = p;
        while (*p == ' ') p++;
        if (p < pend && *p != '\n') {
            margin = Ty_MIN(margin, p - s);
        }
        while (p < pend && *p++ != '\n') {
        }
    }
    if (margin == PY_SSIZE_T_MAX) {
        margin = 0;
    }

    // Second pass: write cleandoc into buff.

    // copy first line without leading spaces.
    p = doc_utf8;
    while (*p == ' ') {
        p++;
    }
    if (p == doc_utf8 && margin == 0 ) {
        // doc is already clean.
        return doc;
    }

    char *buff = TyMem_Malloc(doc_size);
    if (buff == NULL){
        Ty_DECREF(doc);
        TyErr_NoMemory();
        return NULL;
    }

    char *w = buff;

    while (p < pend) {
        int ch = *w++ = *p++;
        if (ch == '\n') {
            break;
        }
    }

    // copy subsequent lines without margin.
    while (p < pend) {
        for (Ty_ssize_t i = 0; i < margin; i++, p++) {
            if (*p != ' ') {
                assert(*p == '\n' || *p == '\0');
                break;
            }
        }
        while (p < pend) {
            int ch = *w++ = *p++;
            if (ch == '\n') {
                break;
            }
        }
    }

    Ty_DECREF(doc);
    TyObject *res = TyUnicode_FromStringAndSize(buff, w - buff);
    TyMem_Free(buff);
    return res;
}

/* Access to compiler optimizations for unit tests.
 *
 * _PyCompile_CodeGen takes an AST, applies code-gen and
 * returns the unoptimized CFG as an instruction list.
 *
 */
TyObject *
_PyCompile_CodeGen(TyObject *ast, TyObject *filename, PyCompilerFlags *pflags,
                   int optimize, int compile_mode)
{
    TyObject *res = NULL;
    TyObject *metadata = NULL;

    if (!TyAST_Check(ast)) {
        TyErr_SetString(TyExc_TypeError, "expected an AST");
        return NULL;
    }

    PyArena *arena = _TyArena_New();
    if (arena == NULL) {
        return NULL;
    }

    mod_ty mod = TyAST_obj2mod(ast, arena, compile_mode);
    if (mod == NULL || !_TyAST_Validate(mod)) {
        _TyArena_Free(arena);
        return NULL;
    }

    compiler *c = new_compiler(mod, filename, pflags, optimize, arena);
    if (c == NULL) {
        _TyArena_Free(arena);
        return NULL;
    }
    c->c_save_nested_seqs = true;

    metadata = TyDict_New();
    if (metadata == NULL) {
        return NULL;
    }

    if (compiler_codegen(c, mod) < 0) {
        goto finally;
    }

    _PyCompile_CodeUnitMetadata *umd = &c->u->u_metadata;

#define SET_METADATA_INT(key, value) do { \
        TyObject *v = TyLong_FromLong((long)value); \
        if (v == NULL) goto finally; \
        int res = TyDict_SetItemString(metadata, key, v); \
        Ty_XDECREF(v); \
        if (res < 0) goto finally; \
    } while (0);

    SET_METADATA_INT("argcount", umd->u_argcount);
    SET_METADATA_INT("posonlyargcount", umd->u_posonlyargcount);
    SET_METADATA_INT("kwonlyargcount", umd->u_kwonlyargcount);
#undef SET_METADATA_INT

    int addNone = mod->kind != Expression_kind;
    if (_PyCodegen_AddReturnAtEnd(c, addNone) < 0) {
        goto finally;
    }

    if (_PyInstructionSequence_ApplyLabelMap(_PyCompile_InstrSequence(c)) < 0) {
        return NULL;
    }
    /* Allocate a copy of the instruction sequence on the heap */
    res = TyTuple_Pack(2, _PyCompile_InstrSequence(c), metadata);

finally:
    Ty_XDECREF(metadata);
    _PyCompile_ExitScope(c);
    compiler_free(c);
    _TyArena_Free(arena);
    return res;
}

int _PyCfg_JumpLabelsToTargets(cfg_builder *g);

PyCodeObject *
_PyCompile_Assemble(_PyCompile_CodeUnitMetadata *umd, TyObject *filename,
                    TyObject *seq)
{
    if (!_PyInstructionSequence_Check(seq)) {
        TyErr_SetString(TyExc_TypeError, "expected an instruction sequence");
        return NULL;
    }
    cfg_builder *g = NULL;
    PyCodeObject *co = NULL;
    instr_sequence optimized_instrs;
    memset(&optimized_instrs, 0, sizeof(instr_sequence));

    TyObject *const_cache = TyDict_New();
    if (const_cache == NULL) {
        return NULL;
    }

    g = _PyCfg_FromInstructionSequence((instr_sequence*)seq);
    if (g == NULL) {
        goto error;
    }

    if (_PyCfg_JumpLabelsToTargets(g) < 0) {
        goto error;
    }

    int code_flags = 0;
    int stackdepth, nlocalsplus;
    if (_PyCfg_OptimizedCfgToInstructionSequence(g, umd, code_flags,
                                                 &stackdepth, &nlocalsplus,
                                                 &optimized_instrs) < 0) {
        goto error;
    }

    TyObject *consts = consts_dict_keys_inorder(umd->u_consts);
    if (consts == NULL) {
        goto error;
    }
    co = _PyAssemble_MakeCodeObject(umd, const_cache,
                                    consts, stackdepth, &optimized_instrs,
                                    nlocalsplus, code_flags, filename);
    Ty_DECREF(consts);

error:
    Ty_DECREF(const_cache);
    _PyCfgBuilder_Free(g);
    PyInstructionSequence_Fini(&optimized_instrs);
    return co;
}

/* Retained for API compatibility.
 * Optimization is now done in _PyCfg_OptimizeCodeUnit */

TyObject *
TyCode_Optimize(TyObject *code, TyObject* Py_UNUSED(consts),
                TyObject *Py_UNUSED(names), TyObject *Py_UNUSED(lnotab_obj))
{
    return Ty_NewRef(code);
}
