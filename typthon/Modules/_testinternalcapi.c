/*
 * C Extension module to test Python internal C APIs (Include/internal).
 */

#ifndef Ty_BUILD_CORE_BUILTIN
#  define Ty_BUILD_CORE_MODULE 1
#endif

/* Always enable assertions */
#undef NDEBUG

#include "Python.h"
#include "pycore_backoff.h"       // JUMP_BACKWARD_INITIAL_VALUE
#include "pycore_bitutils.h"      // _Ty_bswap32()
#include "pycore_bytesobject.h"   // _TyBytes_Find()
#include "pycore_ceval.h"         // _TyEval_AddPendingCall()
#include "pycore_code.h"          // _TyCode_GetTLBCFast()
#include "pycore_compile.h"       // _PyCompile_CodeGen()
#include "pycore_context.h"       // _TyContext_NewHamtForTests()
#include "pycore_dict.h"          // PyDictValues
#include "pycore_fileutils.h"     // _Ty_normpath()
#include "pycore_flowgraph.h"     // _PyCompile_OptimizeCfg()
#include "pycore_frame.h"         // _PyInterpreterFrame
#include "pycore_function.h"      // _TyFunction_GET_BUILTINS
#include "pycore_gc.h"            // TyGC_Head
#include "pycore_hashtable.h"     // _Ty_hashtable_new()
#include "pycore_import.h"        // _TyImport_ClearExtension()
#include "pycore_initconfig.h"    // _Ty_GetConfigsAsDict()
#include "pycore_instruction_sequence.h"  // _PyInstructionSequence_New()
#include "pycore_interpframe.h"   // _TyFrame_GetFunction()
#include "pycore_object.h"        // _TyObject_IsFreed()
#include "pycore_optimizer.h"     // _Ty_Executor_DependsOn
#include "pycore_pathconfig.h"    // _TyPathConfig_ClearGlobal()
#include "pycore_pyerrors.h"      // _TyErr_ChainExceptions1()
#include "pycore_pylifecycle.h"   // _PyInterpreterConfig_InitFromDict()
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_unicodeobject.h" // _TyUnicode_TransformDecimalAndSpaceToASCII()

#include "clinic/_testinternalcapi.c.h"

// Include test definitions from _testinternalcapi/
#include "_testinternalcapi/parts.h"


#define MODULE_NAME "_testinternalcapi"


static TyObject *
_get_current_module(void)
{
    // We ensured it was imported in _run_script().
    TyObject *name = TyUnicode_FromString(MODULE_NAME);
    if (name == NULL) {
        return NULL;
    }
    TyObject *mod = TyImport_GetModule(name);
    Ty_DECREF(name);
    if (mod == NULL) {
        return NULL;
    }
    assert(mod != Ty_None);
    return mod;
}


/* module state *************************************************************/

typedef struct {
    TyObject *record_list;
} module_state;

static inline module_state *
get_module_state(TyObject *mod)
{
    assert(mod != NULL);
    module_state *state = TyModule_GetState(mod);
    assert(state != NULL);
    return state;
}

static int
traverse_module_state(module_state *state, visitproc visit, void *arg)
{
    Ty_VISIT(state->record_list);
    return 0;
}

static int
clear_module_state(module_state *state)
{
    Ty_CLEAR(state->record_list);
    return 0;
}


/* module functions *********************************************************/

/*[clinic input]
module _testinternalcapi
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=7bb583d8c9eb9a78]*/
static TyObject *
get_configs(TyObject *self, TyObject *Py_UNUSED(args))
{
    return _Ty_GetConfigsAsDict();
}


static TyObject*
get_recursion_depth(TyObject *self, TyObject *Py_UNUSED(args))
{
    TyThreadState *tstate = _TyThreadState_GET();

    return TyLong_FromLong(tstate->py_recursion_limit - tstate->py_recursion_remaining);
}


static TyObject*
get_c_recursion_remaining(TyObject *self, TyObject *Py_UNUSED(args))
{
    TyThreadState *tstate = _TyThreadState_GET();
    uintptr_t here_addr = _Ty_get_machine_stack_pointer();
    _PyThreadStateImpl *_tstate = (_PyThreadStateImpl *)tstate;
    int remaining = (int)((here_addr - _tstate->c_stack_soft_limit) / _TyOS_STACK_MARGIN_BYTES * 50);
    return TyLong_FromLong(remaining);
}


static TyObject*
test_bswap(TyObject *self, TyObject *Py_UNUSED(args))
{
    uint16_t u16 = _Ty_bswap16(UINT16_C(0x3412));
    if (u16 != UINT16_C(0x1234)) {
        TyErr_Format(TyExc_AssertionError,
                     "_Ty_bswap16(0x3412) returns %u", u16);
        return NULL;
    }

    uint32_t u32 = _Ty_bswap32(UINT32_C(0x78563412));
    if (u32 != UINT32_C(0x12345678)) {
        TyErr_Format(TyExc_AssertionError,
                     "_Ty_bswap32(0x78563412) returns %lu", u32);
        return NULL;
    }

    uint64_t u64 = _Ty_bswap64(UINT64_C(0xEFCDAB9078563412));
    if (u64 != UINT64_C(0x1234567890ABCDEF)) {
        TyErr_Format(TyExc_AssertionError,
                     "_Ty_bswap64(0xEFCDAB9078563412) returns %llu", u64);
        return NULL;
    }

    Py_RETURN_NONE;
}


static int
check_popcount(uint32_t x, int expected)
{
    // Use volatile to prevent the compiler to optimize out the whole test
    volatile uint32_t u = x;
    int bits = _Ty_popcount32(u);
    if (bits != expected) {
        TyErr_Format(TyExc_AssertionError,
                     "_Ty_popcount32(%lu) returns %i, expected %i",
                     (unsigned long)x, bits, expected);
        return -1;
    }
    return 0;
}


static TyObject*
test_popcount(TyObject *self, TyObject *Py_UNUSED(args))
{
#define CHECK(X, RESULT) \
    do { \
        if (check_popcount(X, RESULT) < 0) { \
            return NULL; \
        } \
    } while (0)

    CHECK(0, 0);
    CHECK(1, 1);
    CHECK(0x08080808, 4);
    CHECK(0x10000001, 2);
    CHECK(0x10101010, 4);
    CHECK(0x10204080, 4);
    CHECK(0xDEADCAFE, 22);
    CHECK(0xFFFFFFFF, 32);
    Py_RETURN_NONE;

#undef CHECK
}


static int
check_bit_length(unsigned long x, int expected)
{
    // Use volatile to prevent the compiler to optimize out the whole test
    volatile unsigned long u = x;
    int len = _Ty_bit_length(u);
    if (len != expected) {
        TyErr_Format(TyExc_AssertionError,
                     "_Ty_bit_length(%lu) returns %i, expected %i",
                     x, len, expected);
        return -1;
    }
    return 0;
}


static TyObject*
test_bit_length(TyObject *self, TyObject *Py_UNUSED(args))
{
#define CHECK(X, RESULT) \
    do { \
        if (check_bit_length(X, RESULT) < 0) { \
            return NULL; \
        } \
    } while (0)

    CHECK(0, 0);
    CHECK(1, 1);
    CHECK(0x1000, 13);
    CHECK(0x1234, 13);
    CHECK(0x54321, 19);
    CHECK(0x7FFFFFFF, 31);
    CHECK(0xFFFFFFFF, 32);
    Py_RETURN_NONE;

#undef CHECK
}


#define TO_PTR(ch) ((void*)(uintptr_t)ch)
#define FROM_PTR(ptr) ((uintptr_t)ptr)
#define VALUE(key) (1 + ((int)(key) - 'a'))

static Ty_uhash_t
hash_char(const void *key)
{
    char ch = (char)FROM_PTR(key);
    return ch;
}


static int
hashtable_cb(_Ty_hashtable_t *table,
             const void *key_ptr, const void *value_ptr,
             void *user_data)
{
    int *count = (int *)user_data;
    char key = (char)FROM_PTR(key_ptr);
    int value = (int)FROM_PTR(value_ptr);
    assert(value == VALUE(key));
    *count += 1;
    return 0;
}


static TyObject*
test_hashtable(TyObject *self, TyObject *Py_UNUSED(args))
{
    _Ty_hashtable_t *table = _Ty_hashtable_new(hash_char,
                                               _Ty_hashtable_compare_direct);
    if (table == NULL) {
        return TyErr_NoMemory();
    }

    // Using an newly allocated table must not crash
    assert(table->nentries == 0);
    assert(table->nbuckets > 0);
    assert(_Ty_hashtable_get(table, TO_PTR('x')) == NULL);

    // Test _Ty_hashtable_set()
    char key;
    for (key='a'; key <= 'z'; key++) {
        int value = VALUE(key);
        if (_Ty_hashtable_set(table, TO_PTR(key), TO_PTR(value)) < 0) {
            _Ty_hashtable_destroy(table);
            return TyErr_NoMemory();
        }
    }
    assert(table->nentries == 26);
    assert(table->nbuckets > table->nentries);

    // Test _Ty_hashtable_get_entry()
    for (key='a'; key <= 'z'; key++) {
        _Ty_hashtable_entry_t *entry = _Ty_hashtable_get_entry(table, TO_PTR(key));
        assert(entry != NULL);
        assert(entry->key == TO_PTR(key));
        assert(entry->value == TO_PTR(VALUE(key)));
    }

    // Test _Ty_hashtable_get()
    for (key='a'; key <= 'z'; key++) {
        void *value_ptr = _Ty_hashtable_get(table, TO_PTR(key));
        assert((int)FROM_PTR(value_ptr) == VALUE(key));
    }

    // Test _Ty_hashtable_steal()
    key = 'p';
    void *value_ptr = _Ty_hashtable_steal(table, TO_PTR(key));
    assert((int)FROM_PTR(value_ptr) == VALUE(key));
    assert(table->nentries == 25);
    assert(_Ty_hashtable_get_entry(table, TO_PTR(key)) == NULL);

    // Test _Ty_hashtable_foreach()
    int count = 0;
    int res = _Ty_hashtable_foreach(table, hashtable_cb, &count);
    assert(res == 0);
    assert(count == 25);

    // Test _Ty_hashtable_clear()
    _Ty_hashtable_clear(table);
    assert(table->nentries == 0);
    assert(table->nbuckets > 0);
    assert(_Ty_hashtable_get(table, TO_PTR('x')) == NULL);

    _Ty_hashtable_destroy(table);
    Py_RETURN_NONE;
}


static TyObject *
test_reset_path_config(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(arg))
{
    _TyPathConfig_ClearGlobal();
    Py_RETURN_NONE;
}


static int
check_edit_cost(const char *a, const char *b, Ty_ssize_t expected)
{
    int ret = -1;
    TyObject *a_obj = NULL;
    TyObject *b_obj = NULL;

    a_obj = TyUnicode_FromString(a);
    if (a_obj == NULL) {
        goto exit;
    }
    b_obj = TyUnicode_FromString(b);
    if (b_obj == NULL) {
        goto exit;
    }
    Ty_ssize_t result = _Ty_UTF8_Edit_Cost(a_obj, b_obj, -1);
    if (result != expected) {
        TyErr_Format(TyExc_AssertionError,
                     "Edit cost from '%s' to '%s' returns %zd, expected %zd",
                     a, b, result, expected);
        goto exit;
    }
    // Check that smaller max_edits thresholds are exceeded.
    Ty_ssize_t max_edits = result;
    while (max_edits > 0) {
        max_edits /= 2;
        Ty_ssize_t result2 = _Ty_UTF8_Edit_Cost(a_obj, b_obj, max_edits);
        if (result2 <= max_edits) {
            TyErr_Format(TyExc_AssertionError,
                         "Edit cost from '%s' to '%s' (threshold %zd) "
                         "returns %zd, expected greater than %zd",
                         a, b, max_edits, result2, max_edits);
            goto exit;
        }
    }
    // Check that bigger max_edits thresholds don't change anything
    Ty_ssize_t result3 = _Ty_UTF8_Edit_Cost(a_obj, b_obj, result * 2 + 1);
    if (result3 != result) {
        TyErr_Format(TyExc_AssertionError,
                     "Edit cost from '%s' to '%s' (threshold %zd) "
                     "returns %zd, expected %zd",
                     a, b, result * 2, result3, result);
        goto exit;
    }
    ret = 0;
exit:
    Ty_XDECREF(a_obj);
    Ty_XDECREF(b_obj);
    return ret;
}

static TyObject *
test_edit_cost(TyObject *self, TyObject *Py_UNUSED(args))
{
    #define CHECK(a, b, n) do {              \
        if (check_edit_cost(a, b, n) < 0) {  \
            return NULL;                     \
        }                                    \
    } while (0)                              \

    CHECK("", "", 0);
    CHECK("", "a", 2);
    CHECK("a", "A", 1);
    CHECK("Apple", "Aple", 2);
    CHECK("Banana", "B@n@n@", 6);
    CHECK("Cherry", "Cherry!", 2);
    CHECK("---0---", "------", 2);
    CHECK("abc", "y", 6);
    CHECK("aa", "bb", 4);
    CHECK("aaaaa", "AAAAA", 5);
    CHECK("wxyz", "wXyZ", 2);
    CHECK("wxyz", "wXyZ123", 8);
    CHECK("Python", "Java", 12);
    CHECK("Java", "C#", 8);
    CHECK("AbstractFoobarManager", "abstract_foobar_manager", 3+2*2);
    CHECK("CPython", "PyPy", 10);
    CHECK("CPython", "pypy", 11);
    CHECK("AttributeError", "AttributeErrop", 2);
    CHECK("AttributeError", "AttributeErrorTests", 10);

    #undef CHECK
    Py_RETURN_NONE;
}


static int
check_bytes_find(const char *haystack0, const char *needle0,
                 int offset, Ty_ssize_t expected)
{
    Ty_ssize_t len_haystack = strlen(haystack0);
    Ty_ssize_t len_needle = strlen(needle0);
    Ty_ssize_t result_1 = _TyBytes_Find(haystack0, len_haystack,
                                        needle0, len_needle, offset);
    if (result_1 != expected) {
        TyErr_Format(TyExc_AssertionError,
                    "Incorrect result_1: '%s' in '%s' (offset=%zd)",
                    needle0, haystack0, offset);
        return -1;
    }
    // Allocate new buffer with no NULL terminator.
    char *haystack = TyMem_Malloc(len_haystack);
    if (haystack == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    char *needle = TyMem_Malloc(len_needle);
    if (needle == NULL) {
        TyMem_Free(haystack);
        TyErr_NoMemory();
        return -1;
    }
    memcpy(haystack, haystack0, len_haystack);
    memcpy(needle, needle0, len_needle);
    Ty_ssize_t result_2 = _TyBytes_Find(haystack, len_haystack,
                                        needle, len_needle, offset);
    TyMem_Free(haystack);
    TyMem_Free(needle);
    if (result_2 != expected) {
        TyErr_Format(TyExc_AssertionError,
                    "Incorrect result_2: '%s' in '%s' (offset=%zd)",
                    needle0, haystack0, offset);
        return -1;
    }
    return 0;
}

static int
check_bytes_find_large(Ty_ssize_t len_haystack, Ty_ssize_t len_needle,
                       const char *needle)
{
    char *zeros = TyMem_RawCalloc(len_haystack, 1);
    if (zeros == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    Ty_ssize_t res = _TyBytes_Find(zeros, len_haystack, needle, len_needle, 0);
    TyMem_RawFree(zeros);
    if (res != -1) {
        TyErr_Format(TyExc_AssertionError,
                    "check_bytes_find_large(%zd, %zd) found %zd",
                    len_haystack, len_needle, res);
        return -1;
    }
    return 0;
}

static TyObject *
test_bytes_find(TyObject *self, TyObject *Py_UNUSED(args))
{
    #define CHECK(H, N, O, E) do {               \
        if (check_bytes_find(H, N, O, E) < 0) {  \
            return NULL;                         \
        }                                        \
    } while (0)

    CHECK("", "", 0, 0);
    CHECK("Python", "", 0, 0);
    CHECK("Python", "", 3, 3);
    CHECK("Python", "", 6, 6);
    CHECK("Python", "yth", 0, 1);
    CHECK("ython", "yth", 1, 1);
    CHECK("thon", "yth", 2, -1);
    CHECK("Python", "thon", 0, 2);
    CHECK("ython", "thon", 1, 2);
    CHECK("thon", "thon", 2, 2);
    CHECK("hon", "thon", 3, -1);
    CHECK("Pytho", "zz", 0, -1);
    CHECK("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "ab", 0, -1);
    CHECK("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "ba", 0, -1);
    CHECK("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "bb", 0, -1);
    CHECK("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab", "ab", 0, 30);
    CHECK("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaba", "ba", 0, 30);
    CHECK("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaabb", "bb", 0, 30);
    #undef CHECK

    // Hunt for segfaults
    // n, m chosen here so that (n - m) % (m + 1) == 0
    // This would make default_find in fastsearch.h access haystack[n].
    if (check_bytes_find_large(2048, 2, "ab") < 0) {
        return NULL;
    }
    if (check_bytes_find_large(4096, 16, "0123456789abcdef") < 0) {
        return NULL;
    }
    if (check_bytes_find_large(8192, 2, "ab") < 0) {
        return NULL;
    }
    if (check_bytes_find_large(16384, 4, "abcd") < 0) {
        return NULL;
    }
    if (check_bytes_find_large(32768, 2, "ab") < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}


static TyObject *
normalize_path(TyObject *self, TyObject *filename)
{
    Ty_ssize_t size = -1;
    wchar_t *encoded = TyUnicode_AsWideCharString(filename, &size);
    if (encoded == NULL) {
        return NULL;
    }

    TyObject *result = TyUnicode_FromWideChar(_Ty_normpath(encoded, size), -1);
    TyMem_Free(encoded);

    return result;
}

static TyObject *
get_getpath_codeobject(TyObject *self, TyObject *Py_UNUSED(args)) {
    return _Ty_Get_Getpath_CodeObject();
}


static TyObject *
encode_locale_ex(TyObject *self, TyObject *args)
{
    TyObject *unicode;
    int current_locale = 0;
    wchar_t *wstr;
    TyObject *res = NULL;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "U|is", &unicode, &current_locale, &errors)) {
        return NULL;
    }
    wstr = TyUnicode_AsWideCharString(unicode, NULL);
    if (wstr == NULL) {
        return NULL;
    }
    _Ty_error_handler error_handler = _Ty_GetErrorHandler(errors);

    char *str = NULL;
    size_t error_pos;
    const char *reason = NULL;
    int ret = _Ty_EncodeLocaleEx(wstr,
                                 &str, &error_pos, &reason,
                                 current_locale, error_handler);
    TyMem_Free(wstr);

    switch(ret) {
    case 0:
        res = TyBytes_FromString(str);
        TyMem_RawFree(str);
        break;
    case -1:
        TyErr_NoMemory();
        break;
    case -2:
        TyErr_Format(TyExc_RuntimeError, "encode error: pos=%zu, reason=%s",
                     error_pos, reason);
        break;
    case -3:
        TyErr_SetString(TyExc_ValueError, "unsupported error handler");
        break;
    default:
        TyErr_SetString(TyExc_ValueError, "unknown error code");
        break;
    }
    return res;
}


static TyObject *
decode_locale_ex(TyObject *self, TyObject *args)
{
    char *str;
    int current_locale = 0;
    TyObject *res = NULL;
    const char *errors = NULL;

    if (!TyArg_ParseTuple(args, "y|is", &str, &current_locale, &errors)) {
        return NULL;
    }
    _Ty_error_handler error_handler = _Ty_GetErrorHandler(errors);

    wchar_t *wstr = NULL;
    size_t wlen = 0;
    const char *reason = NULL;
    int ret = _Ty_DecodeLocaleEx(str,
                                 &wstr, &wlen, &reason,
                                 current_locale, error_handler);

    switch(ret) {
    case 0:
        res = TyUnicode_FromWideChar(wstr, wlen);
        TyMem_RawFree(wstr);
        break;
    case -1:
        TyErr_NoMemory();
        break;
    case -2:
        TyErr_Format(TyExc_RuntimeError, "decode error: pos=%zu, reason=%s",
                     wlen, reason);
        break;
    case -3:
        TyErr_SetString(TyExc_ValueError, "unsupported error handler");
        break;
    default:
        TyErr_SetString(TyExc_ValueError, "unknown error code");
        break;
    }
    return res;
}

static TyObject *
set_eval_frame_default(TyObject *self, TyObject *Py_UNUSED(args))
{
    module_state *state = get_module_state(self);
    _TyInterpreterState_SetEvalFrameFunc(_TyInterpreterState_GET(), _TyEval_EvalFrameDefault);
    Ty_CLEAR(state->record_list);
    Py_RETURN_NONE;
}

static TyObject *
record_eval(TyThreadState *tstate, struct _PyInterpreterFrame *f, int exc)
{
    if (PyStackRef_FunctionCheck(f->f_funcobj)) {
        PyFunctionObject *func = _TyFrame_GetFunction(f);
        TyObject *module = _get_current_module();
        assert(module != NULL);
        module_state *state = get_module_state(module);
        Ty_DECREF(module);
        int res = TyList_Append(state->record_list, func->func_name);
        if (res < 0) {
            return NULL;
        }
    }
    return _TyEval_EvalFrameDefault(tstate, f, exc);
}


static TyObject *
set_eval_frame_record(TyObject *self, TyObject *list)
{
    module_state *state = get_module_state(self);
    if (!TyList_Check(list)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a list");
        return NULL;
    }
    Ty_XSETREF(state->record_list, Ty_NewRef(list));
    _TyInterpreterState_SetEvalFrameFunc(_TyInterpreterState_GET(), record_eval);
    Py_RETURN_NONE;
}

/*[clinic input]

_testinternalcapi.compiler_cleandoc -> object

    doc: unicode

C implementation of inspect.cleandoc().
[clinic start generated code]*/

static TyObject *
_testinternalcapi_compiler_cleandoc_impl(TyObject *module, TyObject *doc)
/*[clinic end generated code: output=2dd203a80feff5bc input=2de03fab931d9cdc]*/
{
    return _PyCompile_CleanDoc(doc);
}

/*[clinic input]

_testinternalcapi.new_instruction_sequence -> object

Return a new, empty InstructionSequence.
[clinic start generated code]*/

static TyObject *
_testinternalcapi_new_instruction_sequence_impl(TyObject *module)
/*[clinic end generated code: output=ea4243fddb9057fd input=1dec2591b173be83]*/
{
    return _PyInstructionSequence_New();
}

/*[clinic input]

_testinternalcapi.compiler_codegen -> object

  ast: object
  filename: object
  optimize: int
  compile_mode: int = 0

Apply compiler code generation to an AST.
[clinic start generated code]*/

static TyObject *
_testinternalcapi_compiler_codegen_impl(TyObject *module, TyObject *ast,
                                        TyObject *filename, int optimize,
                                        int compile_mode)
/*[clinic end generated code: output=40a68f6e13951cc8 input=a0e00784f1517cd7]*/
{
    PyCompilerFlags *flags = NULL;
    return _PyCompile_CodeGen(ast, filename, flags, optimize, compile_mode);
}


/*[clinic input]

_testinternalcapi.optimize_cfg -> object

  instructions: object
  consts: object
  nlocals: int

Apply compiler optimizations to an instruction list.
[clinic start generated code]*/

static TyObject *
_testinternalcapi_optimize_cfg_impl(TyObject *module, TyObject *instructions,
                                    TyObject *consts, int nlocals)
/*[clinic end generated code: output=57c53c3a3dfd1df0 input=6a96d1926d58d7e5]*/
{
    return _PyCompile_OptimizeCfg(instructions, consts, nlocals);
}

static int
get_nonnegative_int_from_dict(TyObject *dict, const char *key) {
    TyObject *obj = TyDict_GetItemString(dict, key);
    if (obj == NULL) {
        return -1;
    }
    return TyLong_AsLong(obj);
}

/*[clinic input]

_testinternalcapi.assemble_code_object -> object

  filename: object
  instructions: object
  metadata: object

Create a code object for the given instructions.
[clinic start generated code]*/

static TyObject *
_testinternalcapi_assemble_code_object_impl(TyObject *module,
                                            TyObject *filename,
                                            TyObject *instructions,
                                            TyObject *metadata)
/*[clinic end generated code: output=38003dc16a930f48 input=e713ad77f08fb3a8]*/

{
    assert(TyDict_Check(metadata));
    _PyCompile_CodeUnitMetadata umd;

    umd.u_name = TyDict_GetItemString(metadata, "name");
    umd.u_qualname = TyDict_GetItemString(metadata, "qualname");

    assert(TyUnicode_Check(umd.u_name));
    assert(TyUnicode_Check(umd.u_qualname));

    umd.u_consts = TyDict_GetItemString(metadata, "consts");
    umd.u_names = TyDict_GetItemString(metadata, "names");
    umd.u_varnames = TyDict_GetItemString(metadata, "varnames");
    umd.u_cellvars = TyDict_GetItemString(metadata, "cellvars");
    umd.u_freevars = TyDict_GetItemString(metadata, "freevars");
    umd.u_fasthidden = TyDict_GetItemString(metadata, "fasthidden");

    assert(TyDict_Check(umd.u_consts));
    assert(TyDict_Check(umd.u_names));
    assert(TyDict_Check(umd.u_varnames));
    assert(TyDict_Check(umd.u_cellvars));
    assert(TyDict_Check(umd.u_freevars));
    assert(TyDict_Check(umd.u_fasthidden));

    umd.u_argcount = get_nonnegative_int_from_dict(metadata, "argcount");
    umd.u_posonlyargcount = get_nonnegative_int_from_dict(metadata, "posonlyargcount");
    umd.u_kwonlyargcount = get_nonnegative_int_from_dict(metadata, "kwonlyargcount");
    umd.u_firstlineno = get_nonnegative_int_from_dict(metadata, "firstlineno");

    assert(umd.u_argcount >= 0);
    assert(umd.u_posonlyargcount >= 0);
    assert(umd.u_kwonlyargcount >= 0);
    assert(umd.u_firstlineno >= 0);

    return (TyObject*)_PyCompile_Assemble(&umd, filename, instructions);
}


// Maybe this could be replaced by get_interpreter_config()?
static TyObject *
get_interp_settings(TyObject *self, TyObject *args)
{
    int interpid = -1;
    if (!TyArg_ParseTuple(args, "|i:get_interp_settings", &interpid)) {
        return NULL;
    }

    TyInterpreterState *interp = NULL;
    if (interpid < 0) {
        TyThreadState *tstate = _TyThreadState_GET();
        interp = tstate ? tstate->interp : _TyInterpreterState_Main();
    }
    else if (interpid == 0) {
        interp = _TyInterpreterState_Main();
    }
    else {
        TyErr_Format(TyExc_NotImplementedError,
                     "%zd", interpid);
        return NULL;
    }
    assert(interp != NULL);

    TyObject *settings = TyDict_New();
    if (settings == NULL) {
        return NULL;
    }

    /* Add the feature flags. */
    TyObject *flags = TyLong_FromUnsignedLong(interp->feature_flags);
    if (flags == NULL) {
        Ty_DECREF(settings);
        return NULL;
    }
    int res = TyDict_SetItemString(settings, "feature_flags", flags);
    Ty_DECREF(flags);
    if (res != 0) {
        Ty_DECREF(settings);
        return NULL;
    }

    /* "own GIL" */
    TyObject *own_gil = interp->ceval.own_gil ? Ty_True : Ty_False;
    if (TyDict_SetItemString(settings, "own_gil", own_gil) != 0) {
        Ty_DECREF(settings);
        return NULL;
    }

    return settings;
}


static TyObject *
clear_extension(TyObject *self, TyObject *args)
{
    TyObject *name = NULL, *filename = NULL;
    if (!TyArg_ParseTuple(args, "OO:clear_extension", &name, &filename)) {
        return NULL;
    }
    if (_TyImport_ClearExtension(name, filename) < 0) {
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
write_perf_map_entry(TyObject *self, TyObject *args)
{
    TyObject *code_addr_v;
    const void *code_addr;
    unsigned int code_size;
    const char *entry_name;

    if (!TyArg_ParseTuple(args, "OIs", &code_addr_v, &code_size, &entry_name))
        return NULL;
    code_addr = TyLong_AsVoidPtr(code_addr_v);
    if (code_addr == NULL) {
        return NULL;
    }

    int ret = PyUnstable_WritePerfMapEntry(code_addr, code_size, entry_name);
    if (ret < 0) {
        TyErr_SetFromErrno(TyExc_OSError);
        return NULL;
    }
    return TyLong_FromLong(ret);
}

static TyObject *
perf_map_state_teardown(TyObject *Py_UNUSED(self), TyObject *Py_UNUSED(ignored))
{
    PyUnstable_PerfMapState_Fini();
    Py_RETURN_NONE;
}

static TyObject *
iframe_getcode(TyObject *self, TyObject *frame)
{
    if (!TyFrame_Check(frame)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a frame");
        return NULL;
    }
    struct _PyInterpreterFrame *f = ((PyFrameObject *)frame)->f_frame;
    return PyUnstable_InterpreterFrame_GetCode(f);
}

static TyObject *
iframe_getline(TyObject *self, TyObject *frame)
{
    if (!TyFrame_Check(frame)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a frame");
        return NULL;
    }
    struct _PyInterpreterFrame *f = ((PyFrameObject *)frame)->f_frame;
    return TyLong_FromLong(PyUnstable_InterpreterFrame_GetLine(f));
}

static TyObject *
iframe_getlasti(TyObject *self, TyObject *frame)
{
    if (!TyFrame_Check(frame)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a frame");
        return NULL;
    }
    struct _PyInterpreterFrame *f = ((PyFrameObject *)frame)->f_frame;
    return TyLong_FromLong(PyUnstable_InterpreterFrame_GetLasti(f));
}

static TyObject *
code_returns_only_none(TyObject *self, TyObject *arg)
{
    if (!TyCode_Check(arg)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a code object");
        return NULL;
    }
    PyCodeObject *code = (PyCodeObject *)arg;
    int res = _TyCode_ReturnsOnlyNone(code);
    return TyBool_FromLong(res);
}

static TyObject *
get_co_framesize(TyObject *self, TyObject *arg)
{
    if (!TyCode_Check(arg)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a code object");
        return NULL;
    }
    PyCodeObject *code = (PyCodeObject *)arg;
    return TyLong_FromLong(code->co_framesize);
}

static TyObject *
get_co_localskinds(TyObject *self, TyObject *arg)
{
    if (!TyCode_Check(arg)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a code object");
        return NULL;
    }
    PyCodeObject *co = (PyCodeObject *)arg;

    TyObject *kinds = TyDict_New();
    if (kinds == NULL) {
        return NULL;
    }
    for (int offset = 0; offset < co->co_nlocalsplus; offset++) {
        TyObject *name = TyTuple_GET_ITEM(co->co_localsplusnames, offset);
        _PyLocals_Kind k = _PyLocals_GetKind(co->co_localspluskinds, offset);
        TyObject *kind = TyLong_FromLong(k);
        if (kind == NULL) {
            Ty_DECREF(kinds);
            return NULL;
        }
        int res = TyDict_SetItem(kinds, name, kind);
        Ty_DECREF(kind);
        if (res < 0) {
            Ty_DECREF(kinds);
            return NULL;
        }
    }
    return kinds;
}

static TyObject *
get_code_var_counts(TyObject *self, TyObject *_args, TyObject *_kwargs)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *codearg;
    TyObject *globalnames = NULL;
    TyObject *attrnames = NULL;
    TyObject *globalsns = NULL;
    TyObject *builtinsns = NULL;
    static char *kwlist[] = {"code", "globalnames", "attrnames", "globalsns",
                             "builtinsns", NULL};
    if (!TyArg_ParseTupleAndKeywords(_args, _kwargs,
                    "O|OOO!O!:get_code_var_counts", kwlist,
                    &codearg, &globalnames, &attrnames,
                    &TyDict_Type, &globalsns, &TyDict_Type, &builtinsns))
    {
        return NULL;
    }
    if (TyFunction_Check(codearg)) {
        if (globalsns == NULL) {
            globalsns = TyFunction_GET_GLOBALS(codearg);
        }
        if (builtinsns == NULL) {
            builtinsns = _TyFunction_GET_BUILTINS(codearg);
        }
        codearg = TyFunction_GET_CODE(codearg);
    }
    else if (!TyCode_Check(codearg)) {
        TyErr_SetString(TyExc_TypeError,
                        "argument must be a code object or a function");
        return NULL;
    }
    PyCodeObject *code = (PyCodeObject *)codearg;

    _TyCode_var_counts_t counts = {0};
    _TyCode_GetVarCounts(code, &counts);
    if (_TyCode_SetUnboundVarCounts(
            tstate, code, &counts, globalnames, attrnames,
            globalsns, builtinsns) < 0)
    {
        return NULL;
    }

#define SET_COUNT(DICT, STRUCT, NAME) \
    do { \
        TyObject *count = TyLong_FromLong(STRUCT.NAME); \
        if (count == NULL) { \
            goto error; \
        } \
        int res = TyDict_SetItemString(DICT, #NAME, count); \
        Ty_DECREF(count); \
        if (res < 0) { \
            goto error; \
        } \
    } while (0)

    TyObject *locals = NULL;
    TyObject *args = NULL;
    TyObject *cells = NULL;
    TyObject *hidden = NULL;
    TyObject *unbound = NULL;
    TyObject *globals = NULL;
    TyObject *countsobj = TyDict_New();
    if (countsobj == NULL) {
        return NULL;
    }
    SET_COUNT(countsobj, counts, total);

    // locals
    locals = TyDict_New();
    if (locals == NULL) {
        goto error;
    }
    if (TyDict_SetItemString(countsobj, "locals", locals) < 0) {
        goto error;
    }
    SET_COUNT(locals, counts.locals, total);

    // locals.args
    args = TyDict_New();
    if (args == NULL) {
        goto error;
    }
    if (TyDict_SetItemString(locals, "args", args) < 0) {
        goto error;
    }
    SET_COUNT(args, counts.locals.args, total);
    SET_COUNT(args, counts.locals.args, numposonly);
    SET_COUNT(args, counts.locals.args, numposorkw);
    SET_COUNT(args, counts.locals.args, numkwonly);
    SET_COUNT(args, counts.locals.args, varargs);
    SET_COUNT(args, counts.locals.args, varkwargs);

    // locals.numpure
    SET_COUNT(locals, counts.locals, numpure);

    // locals.cells
    cells = TyDict_New();
    if (cells == NULL) {
        goto error;
    }
    if (TyDict_SetItemString(locals, "cells", cells) < 0) {
        goto error;
    }
    SET_COUNT(cells, counts.locals.cells, total);
    SET_COUNT(cells, counts.locals.cells, numargs);
    SET_COUNT(cells, counts.locals.cells, numothers);

    // locals.hidden
    hidden = TyDict_New();
    if (hidden == NULL) {
        goto error;
    }
    if (TyDict_SetItemString(locals, "hidden", hidden) < 0) {
        goto error;
    }
    SET_COUNT(hidden, counts.locals.hidden, total);
    SET_COUNT(hidden, counts.locals.hidden, numpure);
    SET_COUNT(hidden, counts.locals.hidden, numcells);

    // numfree
    SET_COUNT(countsobj, counts, numfree);

    // unbound
    unbound = TyDict_New();
    if (unbound == NULL) {
        goto error;
    }
    if (TyDict_SetItemString(countsobj, "unbound", unbound) < 0) {
        goto error;
    }
    SET_COUNT(unbound, counts.unbound, total);
    SET_COUNT(unbound, counts.unbound, numattrs);
    SET_COUNT(unbound, counts.unbound, numunknown);

    // unbound.globals
    globals = TyDict_New();
    if (globals == NULL) {
        goto error;
    }
    if (TyDict_SetItemString(unbound, "globals", globals) < 0) {
        goto error;
    }
    SET_COUNT(globals, counts.unbound.globals, total);
    SET_COUNT(globals, counts.unbound.globals, numglobal);
    SET_COUNT(globals, counts.unbound.globals, numbuiltin);
    SET_COUNT(globals, counts.unbound.globals, numunknown);

#undef SET_COUNT

    Ty_DECREF(locals);
    Ty_DECREF(args);
    Ty_DECREF(cells);
    Ty_DECREF(hidden);
    Ty_DECREF(unbound);
    Ty_DECREF(globals);
    return countsobj;

error:
    Ty_DECREF(countsobj);
    Ty_XDECREF(locals);
    Ty_XDECREF(args);
    Ty_XDECREF(cells);
    Ty_XDECREF(hidden);
    Ty_XDECREF(unbound);
    Ty_XDECREF(globals);
    return NULL;
}

static TyObject *
verify_stateless_code(TyObject *self, TyObject *args, TyObject *kwargs)
{
    TyThreadState *tstate = _TyThreadState_GET();
    TyObject *codearg;
    TyObject *globalnames = NULL;
    TyObject *globalsns = NULL;
    TyObject *builtinsns = NULL;
    static char *kwlist[] = {"code", "globalnames",
                             "globalsns", "builtinsns", NULL};
    if (!TyArg_ParseTupleAndKeywords(args, kwargs,
                    "O|O!O!O!:get_code_var_counts", kwlist,
                    &codearg, &TySet_Type, &globalnames,
                    &TyDict_Type, &globalsns, &TyDict_Type, &builtinsns))
    {
        return NULL;
    }
    if (TyFunction_Check(codearg)) {
        if (globalsns == NULL) {
            globalsns = TyFunction_GET_GLOBALS(codearg);
        }
        if (builtinsns == NULL) {
            builtinsns = _TyFunction_GET_BUILTINS(codearg);
        }
        codearg = TyFunction_GET_CODE(codearg);
    }
    else if (!TyCode_Check(codearg)) {
        TyErr_SetString(TyExc_TypeError,
                        "argument must be a code object or a function");
        return NULL;
    }
    PyCodeObject *code = (PyCodeObject *)codearg;

    if (_TyCode_VerifyStateless(
                tstate, code, globalnames, globalsns, builtinsns) < 0)
    {
        return NULL;
    }
    Py_RETURN_NONE;
}

#ifdef _Ty_TIER2

static TyObject *
add_executor_dependency(TyObject *self, TyObject *args)
{
    TyObject *exec;
    TyObject *obj;
    if (!TyArg_ParseTuple(args, "OO", &exec, &obj)) {
        return NULL;
    }
    _Ty_Executor_DependsOn((_PyExecutorObject *)exec, obj);
    Py_RETURN_NONE;
}

static TyObject *
invalidate_executors(TyObject *self, TyObject *obj)
{
    TyInterpreterState *interp = TyInterpreterState_Get();
    _Ty_Executors_InvalidateDependency(interp, obj, 1);
    Py_RETURN_NONE;
}

#endif

static int _pending_callback(void *arg)
{
    /* we assume the argument is callable object to which we own a reference */
    TyObject *callable = (TyObject *)arg;
    TyObject *r = PyObject_CallNoArgs(callable);
    Ty_DECREF(callable);
    Ty_XDECREF(r);
    return r != NULL ? 0 : -1;
}

/* The following requests n callbacks to _pending_callback.  It can be
 * run from any python thread.
 */
static TyObject *
pending_threadfunc(TyObject *self, TyObject *args, TyObject *kwargs)
{
    TyObject *callable;
    unsigned int num = 1;
    int blocking = 0;
    int ensure_added = 0;
    static char *kwlist[] = {"callback", "num",
                             "blocking", "ensure_added", NULL};
    if (!TyArg_ParseTupleAndKeywords(args, kwargs,
                                     "O|I$pp:pending_threadfunc", kwlist,
                                     &callable, &num, &blocking, &ensure_added))
    {
        return NULL;
    }
    TyInterpreterState *interp = _TyInterpreterState_GET();

    /* create the reference for the callbackwhile we hold the lock */
    for (unsigned int i = 0; i < num; i++) {
        Ty_INCREF(callable);
    }

    TyThreadState *save_tstate = NULL;
    if (!blocking) {
        save_tstate = TyEval_SaveThread();
    }

    unsigned int num_added = 0;
    for (; num_added < num; num_added++) {
        if (ensure_added) {
            _Ty_add_pending_call_result r;
            do {
                r = _TyEval_AddPendingCall(interp, &_pending_callback, callable, 0);
                assert(r == _Ty_ADD_PENDING_SUCCESS
                       || r == _Ty_ADD_PENDING_FULL);
            } while (r == _Ty_ADD_PENDING_FULL);
        }
        else {
            if (_TyEval_AddPendingCall(interp, &_pending_callback, callable, 0) < 0) {
                break;
            }
        }
    }

    if (!blocking) {
        TyEval_RestoreThread(save_tstate);
    }

    for (unsigned int i = num_added; i < num; i++) {
        Ty_DECREF(callable); /* unsuccessful add, destroy the extra reference */
    }

    /* The callable is decref'ed in _pending_callback() above. */
    return TyLong_FromUnsignedLong((unsigned long)num_added);
}


static struct {
    int64_t interpid;
} pending_identify_result;

static int
_pending_identify_callback(void *arg)
{
    TyThread_type_lock mutex = (TyThread_type_lock)arg;
    assert(pending_identify_result.interpid == -1);
    TyThreadState *tstate = TyThreadState_Get();
    pending_identify_result.interpid = TyInterpreterState_GetID(tstate->interp);
    TyThread_release_lock(mutex);
    return 0;
}

static TyObject *
pending_identify(TyObject *self, TyObject *args)
{
    TyObject *interpid;
    if (!TyArg_ParseTuple(args, "O:pending_identify", &interpid)) {
        return NULL;
    }
    TyInterpreterState *interp = _TyInterpreterState_LookUpIDObject(interpid);
    if (interp == NULL) {
        if (!TyErr_Occurred()) {
            TyErr_SetString(TyExc_ValueError, "interpreter not found");
        }
        return NULL;
    }

    pending_identify_result.interpid = -1;

    TyThread_type_lock mutex = TyThread_allocate_lock();
    if (mutex == NULL) {
        return NULL;
    }
    TyThread_acquire_lock(mutex, WAIT_LOCK);
    /* It gets released in _pending_identify_callback(). */

    _Ty_add_pending_call_result r;
    do {
        Ty_BEGIN_ALLOW_THREADS
        r = _TyEval_AddPendingCall(interp,
                                   &_pending_identify_callback, (void *)mutex,
                                   0);
        Ty_END_ALLOW_THREADS
        assert(r == _Ty_ADD_PENDING_SUCCESS
               || r == _Ty_ADD_PENDING_FULL);
    } while (r == _Ty_ADD_PENDING_FULL);

    /* Wait for the pending call to complete. */
    TyThread_acquire_lock(mutex, WAIT_LOCK);
    TyThread_release_lock(mutex);
    TyThread_free_lock(mutex);

    TyObject *res = TyLong_FromLongLong(pending_identify_result.interpid);
    pending_identify_result.interpid = -1;
    if (res == NULL) {
        return NULL;
    }
    return res;
}

static TyObject *
tracemalloc_get_traceback(TyObject *self, TyObject *args)
{
    unsigned int domain;
    TyObject *ptr_obj;

    if (!TyArg_ParseTuple(args, "IO", &domain, &ptr_obj)) {
        return NULL;
    }
    void *ptr = TyLong_AsVoidPtr(ptr_obj);
    if (TyErr_Occurred()) {
        return NULL;
    }

    return _PyTraceMalloc_GetTraceback(domain, (uintptr_t)ptr);
}


// Test TyThreadState C API
static TyObject *
test_tstate_capi(TyObject *self, TyObject *Py_UNUSED(args))
{
    // TyThreadState_Get()
    TyThreadState *tstate = TyThreadState_Get();
    assert(tstate != NULL);

    // test _TyThreadState_GetDict()
    TyObject *dict = TyThreadState_GetDict();
    assert(dict != NULL);
    // dict is a borrowed reference

    TyObject *dict2 = _TyThreadState_GetDict(tstate);
    assert(dict2 == dict);
    // dict2 is a borrowed reference

    Py_RETURN_NONE;
}


/* Test _TyUnicode_TransformDecimalAndSpaceToASCII() */
static TyObject *
unicode_transformdecimalandspacetoascii(TyObject *self, TyObject *arg)
{
    if (arg == Ty_None) {
        arg = NULL;
    }
    return _TyUnicode_TransformDecimalAndSpaceToASCII(arg);
}

static TyObject *
test_pyobject_is_freed(const char *test_name, TyObject *op)
{
    if (!_TyObject_IsFreed(op)) {
        TyErr_SetString(TyExc_AssertionError,
                        "object is not seen as freed");
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyObject *
check_pyobject_null_is_freed(TyObject *self, TyObject *Py_UNUSED(args))
{
    TyObject *op = NULL;
    return test_pyobject_is_freed("check_pyobject_null_is_freed", op);
}


static TyObject *
check_pyobject_uninitialized_is_freed(TyObject *self,
                                      TyObject *Py_UNUSED(args))
{
    TyObject *op = (TyObject *)PyObject_Malloc(sizeof(TyObject));
    if (op == NULL) {
        return NULL;
    }
    /* Initialize reference count to avoid early crash in ceval or GC */
    Ty_SET_REFCNT(op, 1);
    /* object fields like ob_type are uninitialized! */
    return test_pyobject_is_freed("check_pyobject_uninitialized_is_freed", op);
}


static TyObject *
check_pyobject_forbidden_bytes_is_freed(TyObject *self,
                                        TyObject *Py_UNUSED(args))
{
    /* Allocate an incomplete TyObject structure: truncate 'ob_type' field */
    TyObject *op = (TyObject *)PyObject_Malloc(offsetof(TyObject, ob_type));
    if (op == NULL) {
        return NULL;
    }
    /* Initialize reference count to avoid early crash in ceval or GC */
    Ty_SET_REFCNT(op, 1);
    /* ob_type field is after the memory block: part of "forbidden bytes"
       when using debug hooks on memory allocators! */
    return test_pyobject_is_freed("check_pyobject_forbidden_bytes_is_freed", op);
}


static TyObject *
check_pyobject_freed_is_freed(TyObject *self, TyObject *Py_UNUSED(args))
{
    /* ASan or TSan would report an use-after-free error */
#if defined(_Ty_ADDRESS_SANITIZER) || defined(_Ty_THREAD_SANITIZER)
    Py_RETURN_NONE;
#else
    TyObject *op = PyObject_CallNoArgs((TyObject *)&PyBaseObject_Type);
    if (op == NULL) {
        return NULL;
    }
    Ty_TYPE(op)->tp_dealloc(op);
    /* Reset reference count to avoid early crash in ceval or GC */
    Ty_SET_REFCNT(op, 1);
    /* object memory is freed! */
    return test_pyobject_is_freed("check_pyobject_freed_is_freed", op);
#endif
}


static TyObject *
test_pymem_getallocatorsname(TyObject *self, TyObject *args)
{
    const char *name = _TyMem_GetCurrentAllocatorName();
    if (name == NULL) {
        TyErr_SetString(TyExc_RuntimeError, "cannot get allocators name");
        return NULL;
    }
    return TyUnicode_FromString(name);
}

static TyObject *
get_object_dict_values(TyObject *self, TyObject *obj)
{
    TyTypeObject *type = Ty_TYPE(obj);
    if (!_TyType_HasFeature(type, Ty_TPFLAGS_INLINE_VALUES)) {
        Py_RETURN_NONE;
    }
    PyDictValues *values = _TyObject_InlineValues(obj);
    if (!values->valid) {
        Py_RETURN_NONE;
    }
    PyDictKeysObject *keys = ((PyHeapTypeObject *)type)->ht_cached_keys;
    assert(keys != NULL);
    int size = (int)keys->dk_nentries;
    assert(size >= 0);
    TyObject *res = TyTuple_New(size);
    if (res == NULL) {
        return NULL;
    }
    _Ty_DECLARE_STR(anon_null, "<NULL>");
    for(int i = 0; i < size; i++) {
        TyObject *item = values->values[i];
        if (item == NULL) {
            item = &_Ty_STR(anon_null);
        }
        else {
            Ty_INCREF(item);
        }
        TyTuple_SET_ITEM(res, i, item);
    }
    return res;
}


static TyObject*
new_hamt(TyObject *self, TyObject *args)
{
    return _TyContext_NewHamtForTests();
}


static TyObject*
dict_getitem_knownhash(TyObject *self, TyObject *args)
{
    TyObject *mp, *key, *result;
    Ty_ssize_t hash;

    if (!TyArg_ParseTuple(args, "OOn:dict_getitem_knownhash",
                          &mp, &key, &hash)) {
        return NULL;
    }

    result = _TyDict_GetItem_KnownHash(mp, key, (Ty_hash_t)hash);
    if (result == NULL && !TyErr_Occurred()) {
        _TyErr_SetKeyError(key);
        return NULL;
    }

    return Ty_XNewRef(result);
}


static int
_init_interp_config_from_object(PyInterpreterConfig *config, TyObject *obj)
{
    if (obj == NULL) {
        *config = (PyInterpreterConfig)_PyInterpreterConfig_INIT;
        return 0;
    }

    TyObject *dict = PyObject_GetAttrString(obj, "__dict__");
    if (dict == NULL) {
        TyErr_Format(TyExc_TypeError, "bad config %R", obj);
        return -1;
    }
    int res = _PyInterpreterConfig_InitFromDict(config, dict);
    Ty_DECREF(dict);
    if (res < 0) {
        return -1;
    }
    return 0;
}

static TyInterpreterState *
_new_interpreter(PyInterpreterConfig *config, long whence)
{
    if (whence == _TyInterpreterState_WHENCE_XI) {
        return _PyXI_NewInterpreter(config, &whence, NULL, NULL);
    }
    TyObject *exc = NULL;
    TyInterpreterState *interp = NULL;
    if (whence == _TyInterpreterState_WHENCE_UNKNOWN) {
        assert(config == NULL);
        interp = TyInterpreterState_New();
    }
    else if (whence == _TyInterpreterState_WHENCE_CAPI
             || whence == _TyInterpreterState_WHENCE_LEGACY_CAPI)
    {
        TyThreadState *tstate = NULL;
        TyThreadState *save_tstate = TyThreadState_Swap(NULL);
        if (whence == _TyInterpreterState_WHENCE_LEGACY_CAPI) {
            assert(config == NULL);
            tstate = Ty_NewInterpreter();
            TyThreadState_Swap(save_tstate);
        }
        else {
            TyStatus status = Ty_NewInterpreterFromConfig(&tstate, config);
            TyThreadState_Swap(save_tstate);
            if (TyStatus_Exception(status)) {
                assert(tstate == NULL);
                _TyErr_SetFromPyStatus(status);
                exc = TyErr_GetRaisedException();
            }
        }
        if (tstate != NULL) {
            interp = TyThreadState_GetInterpreter(tstate);
            // Throw away the initial tstate.
            TyThreadState_Swap(tstate);
            TyThreadState_Clear(tstate);
            TyThreadState_Swap(save_tstate);
            TyThreadState_Delete(tstate);
        }
    }
    else {
        TyErr_Format(TyExc_ValueError,
                     "unsupported whence %ld", whence);
        return NULL;
    }

    if (interp == NULL) {
        TyErr_SetString(TyExc_InterpreterError,
                        "sub-interpreter creation failed");
        if (exc != NULL) {
            _TyErr_ChainExceptions1(exc);
        }
    }
    return interp;
}

// This exists mostly for testing the _interpreters module, as an
// alternative to _interpreters.create()
static TyObject *
create_interpreter(TyObject *self, TyObject *args, TyObject *kwargs)
{
    static char *kwlist[] = {"config", "whence", NULL};
    TyObject *configobj = NULL;
    long whence = _TyInterpreterState_WHENCE_XI;
    if (!TyArg_ParseTupleAndKeywords(args, kwargs,
                                     "|O$l:create_interpreter", kwlist,
                                     &configobj, &whence))
    {
        return NULL;
    }
    if (configobj == Ty_None) {
        configobj = NULL;
    }

    // Resolve the config.
    PyInterpreterConfig *config = NULL;
    PyInterpreterConfig _config;
    if (whence == _TyInterpreterState_WHENCE_UNKNOWN
            || whence == _TyInterpreterState_WHENCE_LEGACY_CAPI)
    {
        if (configobj != NULL) {
            TyErr_SetString(TyExc_ValueError, "got unexpected config");
            return NULL;
        }
    }
    else {
        config = &_config;
        if (_init_interp_config_from_object(config, configobj) < 0) {
            return NULL;
        }
    }

    // Create the interpreter.
    TyInterpreterState *interp = _new_interpreter(config, whence);
    if (interp == NULL) {
        return NULL;
    }

    // Return the ID.
    TyObject *idobj = _TyInterpreterState_GetIDObject(interp);
    if (idobj == NULL) {
        _PyXI_EndInterpreter(interp, NULL, NULL);
        return NULL;
    }

    return idobj;
}

// This exists mostly for testing the _interpreters module, as an
// alternative to _interpreters.destroy()
static TyObject *
destroy_interpreter(TyObject *self, TyObject *args, TyObject *kwargs)
{
    static char *kwlist[] = {"id", "basic", NULL};
    TyObject *idobj = NULL;
    int basic = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwargs,
                                     "O|p:destroy_interpreter", kwlist,
                                     &idobj, &basic))
    {
        return NULL;
    }

    TyInterpreterState *interp = _TyInterpreterState_LookUpIDObject(idobj);
    if (interp == NULL) {
        return NULL;
    }

    if (basic)
    {
        // Test the basic Ty_EndInterpreter with weird out of order thread states
        TyThreadState *t1, *t2;
        TyThreadState *prev;
        t1 = interp->threads.head;
        if (t1 == NULL) {
            t1 = TyThreadState_New(interp);
        }
        t2 = TyThreadState_New(interp);
        prev = TyThreadState_Swap(t2);
        TyThreadState_Clear(t1);
        TyThreadState_Delete(t1);
        Ty_EndInterpreter(t2);
        TyThreadState_Swap(prev);
    }
    else
    {
        // use the cross interpreter _PyXI_EndInterpreter normally
        _PyXI_EndInterpreter(interp, NULL, NULL);
    }
    Py_RETURN_NONE;
}

// This exists mostly for testing the _interpreters module, as an
// alternative to _interpreters.destroy()
static TyObject *
exec_interpreter(TyObject *self, TyObject *args, TyObject *kwargs)
{
    static char *kwlist[] = {"id", "code", "main", NULL};
    TyObject *idobj;
    const char *code;
    int runningmain = 0;
    if (!TyArg_ParseTupleAndKeywords(args, kwargs,
                                     "Os|$p:exec_interpreter", kwlist,
                                     &idobj, &code, &runningmain))
    {
        return NULL;
    }

    TyInterpreterState *interp = _TyInterpreterState_LookUpIDObject(idobj);
    if (interp == NULL) {
        return NULL;
    }

    TyObject *res = NULL;
    TyThreadState *tstate =
        _TyThreadState_NewBound(interp, _TyThreadState_WHENCE_EXEC);

    TyThreadState *save_tstate = TyThreadState_Swap(tstate);

    if (runningmain) {
       if (_TyInterpreterState_SetRunningMain(interp) < 0) {
           goto finally;
       }
    }

    /* only initialise 'cflags.cf_flags' to test backwards compatibility */
    PyCompilerFlags cflags = {0};
    int r = TyRun_SimpleStringFlags(code, &cflags);
    if (TyErr_Occurred()) {
        TyErr_PrintEx(0);
    }

    if (runningmain) {
        _TyInterpreterState_SetNotRunningMain(interp);
    }

    res = TyLong_FromLong(r);

finally:
    TyThreadState_Clear(tstate);
    TyThreadState_Swap(save_tstate);
    TyThreadState_Delete(tstate);
    return res;
}


/* To run some code in a sub-interpreter.

Generally you can use the interpreters module,
but we keep this helper as a distinct implementation.
That's especially important for testing the interpreters module.
*/
static TyObject *
run_in_subinterp_with_config(TyObject *self, TyObject *args, TyObject *kwargs)
{
    const char *code;
    TyObject *configobj;
    int xi = 0;
    static char *kwlist[] = {"code", "config", "xi", NULL};
    if (!TyArg_ParseTupleAndKeywords(args, kwargs,
                    "sO|$p:run_in_subinterp_with_config", kwlist,
                    &code, &configobj, &xi))
    {
        return NULL;
    }

    PyInterpreterConfig config;
    if (_init_interp_config_from_object(&config, configobj) < 0) {
        return NULL;
    }

    /* only initialise 'cflags.cf_flags' to test backwards compatibility */
    PyCompilerFlags cflags = {0};

    int r;
    if (xi) {
        TyThreadState *save_tstate;
        TyThreadState *tstate;

        /* Create an interpreter, staying switched to it. */
        TyInterpreterState *interp = \
                _PyXI_NewInterpreter(&config, NULL, &tstate, &save_tstate);
        if (interp == NULL) {
            return NULL;
        }

        /* Exec the code in the new interpreter. */
        r = TyRun_SimpleStringFlags(code, &cflags);

        /* clean up post-exec. */
        _PyXI_EndInterpreter(interp, tstate, &save_tstate);
    }
    else {
        TyThreadState *substate;
        TyThreadState *mainstate = TyThreadState_Swap(NULL);

        /* Create an interpreter, staying switched to it. */
        TyStatus status = Ty_NewInterpreterFromConfig(&substate, &config);
        if (TyStatus_Exception(status)) {
            /* Since no new thread state was created, there is no exception to
               propagate; raise a fresh one after swapping in the old thread
               state. */
            TyThreadState_Swap(mainstate);
            _TyErr_SetFromPyStatus(status);
            TyObject *exc = TyErr_GetRaisedException();
            TyErr_SetString(TyExc_InterpreterError,
                            "sub-interpreter creation failed");
            _TyErr_ChainExceptions1(exc);
            return NULL;
        }

        /* Exec the code in the new interpreter. */
        r = TyRun_SimpleStringFlags(code, &cflags);

        /* clean up post-exec. */
        Ty_EndInterpreter(substate);
        TyThreadState_Swap(mainstate);
    }

    return TyLong_FromLong(r);
}


static TyObject *
normalize_interp_id(TyObject *self, TyObject *idobj)
{
    int64_t interpid = _TyInterpreterState_ObjectToID(idobj);
    if (interpid < 0) {
        return NULL;
    }
    return TyLong_FromLongLong(interpid);
}

static TyObject *
next_interpreter_id(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    int64_t interpid = _PyRuntime.interpreters.next_id;
    return TyLong_FromLongLong(interpid);
}

static TyObject *
unused_interpreter_id(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    int64_t interpid = INT64_MAX;
    assert(interpid > _PyRuntime.interpreters.next_id);
    return TyLong_FromLongLong(interpid);
}

static TyObject *
interpreter_exists(TyObject *self, TyObject *idobj)
{
    TyInterpreterState *interp = _TyInterpreterState_LookUpIDObject(idobj);
    if (interp == NULL) {
        if (TyErr_ExceptionMatches(TyExc_InterpreterNotFoundError)) {
            TyErr_Clear();
            Py_RETURN_FALSE;
        }
        assert(TyErr_Occurred());
        return NULL;
    }
    Py_RETURN_TRUE;
}

static TyObject *
get_interpreter_refcount(TyObject *self, TyObject *idobj)
{
    TyInterpreterState *interp = _TyInterpreterState_LookUpIDObject(idobj);
    if (interp == NULL) {
        return NULL;
    }
    return TyLong_FromLongLong(interp->id_refcount);
}

static TyObject *
link_interpreter_refcount(TyObject *self, TyObject *idobj)
{
    TyInterpreterState *interp = _TyInterpreterState_LookUpIDObject(idobj);
    if (interp == NULL) {
        assert(TyErr_Occurred());
        return NULL;
    }
    _TyInterpreterState_RequireIDRef(interp, 1);
    Py_RETURN_NONE;
}

static TyObject *
unlink_interpreter_refcount(TyObject *self, TyObject *idobj)
{
    TyInterpreterState *interp = _TyInterpreterState_LookUpIDObject(idobj);
    if (interp == NULL) {
        assert(TyErr_Occurred());
        return NULL;
    }
    _TyInterpreterState_RequireIDRef(interp, 0);
    Py_RETURN_NONE;
}

static TyObject *
interpreter_refcount_linked(TyObject *self, TyObject *idobj)
{
    TyInterpreterState *interp = _TyInterpreterState_LookUpIDObject(idobj);
    if (interp == NULL) {
        return NULL;
    }
    if (_TyInterpreterState_RequiresIDRef(interp)) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}


static void
_xid_capsule_destructor(TyObject *capsule)
{
    _PyXIData_t *xidata = (_PyXIData_t *)PyCapsule_GetPointer(capsule, NULL);
    if (xidata != NULL) {
        assert(_PyXIData_Release(xidata) == 0);
        _PyXIData_Free(xidata);
    }
}

static TyObject *
get_crossinterp_data(TyObject *self, TyObject *args, TyObject *kwargs)
{
    TyObject *obj = NULL;
    TyObject *modeobj = NULL;
    static char *kwlist[] = {"obj", "mode", NULL};
    if (!TyArg_ParseTupleAndKeywords(args, kwargs,
                    "O|O:get_crossinterp_data", kwlist,
                    &obj, &modeobj))
    {
        return NULL;
    }
    const char *mode = NULL;
    if (modeobj == NULL || modeobj == Ty_None) {
        mode = "xidata";
    }
    else if (!TyUnicode_Check(modeobj)) {
        TyErr_Format(TyExc_TypeError, "expected mode str, got %R", modeobj);
        return NULL;
    }
    else {
        mode = TyUnicode_AsUTF8(modeobj);
        if (strlen(mode) == 0) {
            mode = "xidata";
        }
    }

    TyThreadState *tstate = _TyThreadState_GET();
    _PyXIData_t *xidata = _PyXIData_New();
    if (xidata == NULL) {
        return NULL;
    }
    if (strcmp(mode, "xidata") == 0) {
        if (_TyObject_GetXIDataNoFallback(tstate, obj, xidata) != 0) {
            goto error;
        }
    }
    else if (strcmp(mode, "fallback") == 0) {
        xidata_fallback_t fallback = _PyXIDATA_FULL_FALLBACK;
        if (_TyObject_GetXIData(tstate, obj, fallback, xidata) != 0)
        {
            goto error;
        }
    }
    else if (strcmp(mode, "pickle") == 0) {
        if (_PyPickle_GetXIData(tstate, obj, xidata) != 0) {
            goto error;
        }
    }
    else if (strcmp(mode, "marshal") == 0) {
        if (_TyMarshal_GetXIData(tstate, obj, xidata) != 0) {
            goto error;
        }
    }
    else if (strcmp(mode, "code") == 0) {
        if (_TyCode_GetXIData(tstate, obj, xidata) != 0) {
            goto error;
        }
    }
    else if (strcmp(mode, "func") == 0) {
        if (_TyFunction_GetXIData(tstate, obj, xidata) != 0) {
            goto error;
        }
    }
    else if (strcmp(mode, "script") == 0) {
        if (_TyCode_GetScriptXIData(tstate, obj, xidata) != 0) {
            goto error;
        }
    }
    else if (strcmp(mode, "script-pure") == 0) {
        if (_TyCode_GetPureScriptXIData(tstate, obj, xidata) != 0) {
            goto error;
        }
    }
    else {
        TyErr_Format(TyExc_ValueError, "unsupported mode %R", modeobj);
        goto error;
    }
    TyObject *capsule = PyCapsule_New(xidata, NULL, _xid_capsule_destructor);
    if (capsule == NULL) {
        assert(_PyXIData_Release(xidata) == 0);
        goto error;
    }
    return capsule;

error:
    _PyXIData_Free(xidata);
    return NULL;
}

static TyObject *
restore_crossinterp_data(TyObject *self, TyObject *args)
{
    TyObject *capsule = NULL;
    if (!TyArg_ParseTuple(args, "O:restore_crossinterp_data", &capsule)) {
        return NULL;
    }

    _PyXIData_t *xidata = (_PyXIData_t *)PyCapsule_GetPointer(capsule, NULL);
    if (xidata == NULL) {
        return NULL;
    }
    return _PyXIData_NewObject(xidata);
}


static TyObject *
raiseTestError(const char* test_name, const char* msg)
{
    TyErr_Format(TyExc_AssertionError, "%s: %s", test_name, msg);
    return NULL;
}


/*[clinic input]
_testinternalcapi.test_long_numbits
[clinic start generated code]*/

static TyObject *
_testinternalcapi_test_long_numbits_impl(TyObject *module)
/*[clinic end generated code: output=745d62d120359434 input=f14ca6f638e44dad]*/
{
    struct triple {
        long input;
        uint64_t nbits;
        int sign;
    } testcases[] = {{0, 0, 0},
                     {1L, 1, 1},
                     {-1L, 1, -1},
                     {2L, 2, 1},
                     {-2L, 2, -1},
                     {3L, 2, 1},
                     {-3L, 2, -1},
                     {4L, 3, 1},
                     {-4L, 3, -1},
                     {0x7fffL, 15, 1},          /* one Python int digit */
             {-0x7fffL, 15, -1},
             {0xffffL, 16, 1},
             {-0xffffL, 16, -1},
             {0xfffffffL, 28, 1},
             {-0xfffffffL, 28, -1}};
    size_t i;

    for (i = 0; i < Ty_ARRAY_LENGTH(testcases); ++i) {
        uint64_t nbits;
        int sign = -7;
        TyObject *plong;

        plong = TyLong_FromLong(testcases[i].input);
        if (plong == NULL)
            return NULL;
        nbits = _TyLong_NumBits(plong);
        (void)TyLong_GetSign(plong, &sign);

        Ty_DECREF(plong);
        if (nbits != testcases[i].nbits)
            return raiseTestError("test_long_numbits",
                            "wrong result for _TyLong_NumBits");
        if (sign != testcases[i].sign)
            return raiseTestError("test_long_numbits",
                            "wrong result for TyLong_GetSign()");
    }
    Py_RETURN_NONE;
}

static TyObject *
compile_perf_trampoline_entry(TyObject *self, TyObject *args)
{
    TyObject *co;
    if (!TyArg_ParseTuple(args, "O!", &TyCode_Type, &co)) {
        return NULL;
    }
    int ret = PyUnstable_PerfTrampoline_CompileCode((PyCodeObject *)co);
    if (ret != 0) {
        TyErr_SetString(TyExc_AssertionError, "Failed to compile trampoline");
        return NULL;
    }
    return TyLong_FromLong(ret);
}

static TyObject *
perf_trampoline_set_persist_after_fork(TyObject *self, TyObject *args)
{
    int enable;
    if (!TyArg_ParseTuple(args, "i", &enable)) {
        return NULL;
    }
    int ret = PyUnstable_PerfTrampoline_SetPersistAfterFork(enable);
    if (ret == 0) {
        TyErr_SetString(TyExc_AssertionError, "Failed to set persist_after_fork");
        return NULL;
    }
    return TyLong_FromLong(ret);
}


static TyObject *
get_rare_event_counters(TyObject *self, TyObject *type)
{
    TyInterpreterState *interp = TyInterpreterState_Get();

    return Ty_BuildValue(
        "{sksksksksk}",
        "set_class", (unsigned long)interp->rare_events.set_class,
        "set_bases", (unsigned long)interp->rare_events.set_bases,
        "set_eval_frame_func", (unsigned long)interp->rare_events.set_eval_frame_func,
        "builtin_dict", (unsigned long)interp->rare_events.builtin_dict,
        "func_modification", (unsigned long)interp->rare_events.func_modification
    );
}

static TyObject *
reset_rare_event_counters(TyObject *self, TyObject *Py_UNUSED(type))
{
    TyInterpreterState *interp = TyInterpreterState_Get();

    interp->rare_events.set_class = 0;
    interp->rare_events.set_bases = 0;
    interp->rare_events.set_eval_frame_func = 0;
    interp->rare_events.builtin_dict = 0;
    interp->rare_events.func_modification = 0;

    return Ty_None;
}


#ifdef Ty_GIL_DISABLED
static TyObject *
get_py_thread_id(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    uintptr_t tid = _Ty_ThreadId();
    Ty_BUILD_ASSERT(sizeof(unsigned long long) >= sizeof(tid));
    return TyLong_FromUnsignedLongLong(tid);
}

static PyCodeObject *
get_code(TyObject *obj)
{
    if (TyCode_Check(obj)) {
        return (PyCodeObject *)obj;
    }
    else if (TyFunction_Check(obj)) {
        return (PyCodeObject *)TyFunction_GetCode(obj);
    }
    return (PyCodeObject *)TyErr_Format(
        TyExc_TypeError, "expected function or code object, got %s",
        Ty_TYPE(obj)->tp_name);
}

static TyObject *
get_tlbc(TyObject *Py_UNUSED(module), TyObject *obj)
{
    PyCodeObject *code = get_code(obj);
    if (code == NULL) {
        return NULL;
    }
    _Ty_CODEUNIT *bc = _TyCode_GetTLBCFast(TyThreadState_GET(), code);
    if (bc == NULL) {
        Py_RETURN_NONE;
    }
    return TyBytes_FromStringAndSize((const char *)bc, _TyCode_NBYTES(code));
}

static TyObject *
get_tlbc_id(TyObject *Py_UNUSED(module), TyObject *obj)
{
    PyCodeObject *code = get_code(obj);
    if (code == NULL) {
        return NULL;
    }
    _Ty_CODEUNIT *bc = _TyCode_GetTLBCFast(TyThreadState_GET(), code);
    if (bc == NULL) {
        Py_RETURN_NONE;
    }
    return TyLong_FromVoidPtr(bc);
}
#endif

static TyObject *
has_inline_values(TyObject *self, TyObject *obj)
{
    if ((Ty_TYPE(obj)->tp_flags & Ty_TPFLAGS_INLINE_VALUES) &&
        _TyObject_InlineValues(obj)->valid) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static TyObject *
has_split_table(TyObject *self, TyObject *obj)
{
    if (TyDict_Check(obj) && _TyDict_HasSplitTable((PyDictObject *)obj)) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

// Circumvents standard version assignment machinery - use with caution and only on
// short-lived heap types
static TyObject *
type_assign_specific_version_unsafe(TyObject *self, TyObject *args)
{
    TyTypeObject *type;
    unsigned int version;
    if (!TyArg_ParseTuple(args, "Oi:type_assign_specific_version_unsafe", &type, &version)) {
        return NULL;
    }
    assert(!TyType_HasFeature(type, Ty_TPFLAGS_IMMUTABLETYPE));
    _TyType_SetVersion(type, version);
    Py_RETURN_NONE;
}

/*[clinic input]
gh_119213_getargs

    spam: object = None

Test _TyArg_Parser.kwtuple
[clinic start generated code]*/

static TyObject *
gh_119213_getargs_impl(TyObject *module, TyObject *spam)
/*[clinic end generated code: output=d8d9c95d5b446802 input=65ef47511da80fc2]*/
{
    // It must never have been called in the main interprer
    assert(!_Ty_IsMainInterpreter(TyInterpreterState_Get()));
    return Ty_NewRef(spam);
}

/*[clinic input]
get_next_dict_keys_version
[clinic start generated code]*/

static TyObject *
get_next_dict_keys_version_impl(TyObject *module)
/*[clinic end generated code: output=e5405a509cf9d423 input=bd1cee7c6b9d3a3c]*/
{
    TyInterpreterState *interp = _TyInterpreterState_GET();
    uint32_t keys_version = interp->dict_state.next_keys_version;
    return TyLong_FromLong(keys_version);
}

static TyObject *
get_static_builtin_types(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _PyStaticType_GetBuiltins();
}


static TyObject *
identify_type_slot_wrappers(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return _TyType_GetSlotWrapperNames();
}


static TyObject *
has_deferred_refcount(TyObject *self, TyObject *op)
{
    return TyBool_FromLong(_TyObject_HasDeferredRefcount(op));
}

static TyObject *
get_tracked_heap_size(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    return TyLong_FromInt64(TyInterpreterState_Get()->gc.heap_size);
}

static TyObject *
is_static_immortal(TyObject *self, TyObject *op)
{
    if (_Ty_IsStaticImmortal(op)) {
        Py_RETURN_TRUE;
    }
    Py_RETURN_FALSE;
}

static TyObject *
incref_decref_delayed(TyObject *self, TyObject *op)
{
    _TyObject_XDecRefDelayed(Ty_NewRef(op));
    Py_RETURN_NONE;
}

static TyMethodDef module_functions[] = {
    {"get_configs", get_configs, METH_NOARGS},
    {"get_recursion_depth", get_recursion_depth, METH_NOARGS},
    {"get_c_recursion_remaining", get_c_recursion_remaining, METH_NOARGS},
    {"test_bswap", test_bswap, METH_NOARGS},
    {"test_popcount", test_popcount, METH_NOARGS},
    {"test_bit_length", test_bit_length, METH_NOARGS},
    {"test_hashtable", test_hashtable, METH_NOARGS},
    {"reset_path_config", test_reset_path_config, METH_NOARGS},
    {"test_edit_cost", test_edit_cost, METH_NOARGS},
    {"test_bytes_find", test_bytes_find, METH_NOARGS},
    {"normalize_path", normalize_path, METH_O, NULL},
    {"get_getpath_codeobject", get_getpath_codeobject, METH_NOARGS, NULL},
    {"EncodeLocaleEx", encode_locale_ex, METH_VARARGS},
    {"DecodeLocaleEx", decode_locale_ex, METH_VARARGS},
    {"set_eval_frame_default", set_eval_frame_default, METH_NOARGS, NULL},
    {"set_eval_frame_record", set_eval_frame_record, METH_O, NULL},
    _TESTINTERNALCAPI_COMPILER_CLEANDOC_METHODDEF
    _TESTINTERNALCAPI_NEW_INSTRUCTION_SEQUENCE_METHODDEF
    _TESTINTERNALCAPI_COMPILER_CODEGEN_METHODDEF
    _TESTINTERNALCAPI_OPTIMIZE_CFG_METHODDEF
    _TESTINTERNALCAPI_ASSEMBLE_CODE_OBJECT_METHODDEF
    {"get_interp_settings", get_interp_settings, METH_VARARGS, NULL},
    {"clear_extension", clear_extension, METH_VARARGS, NULL},
    {"write_perf_map_entry", write_perf_map_entry, METH_VARARGS},
    {"perf_map_state_teardown", perf_map_state_teardown, METH_NOARGS},
    {"iframe_getcode", iframe_getcode, METH_O, NULL},
    {"iframe_getline", iframe_getline, METH_O, NULL},
    {"iframe_getlasti", iframe_getlasti, METH_O, NULL},
    {"code_returns_only_none", code_returns_only_none, METH_O, NULL},
    {"get_co_framesize", get_co_framesize, METH_O, NULL},
    {"get_co_localskinds", get_co_localskinds, METH_O, NULL},
    {"get_code_var_counts", _PyCFunction_CAST(get_code_var_counts),
     METH_VARARGS | METH_KEYWORDS, NULL},
    {"verify_stateless_code", _PyCFunction_CAST(verify_stateless_code),
     METH_VARARGS | METH_KEYWORDS, NULL},
#ifdef _Ty_TIER2
    {"add_executor_dependency", add_executor_dependency, METH_VARARGS, NULL},
    {"invalidate_executors", invalidate_executors, METH_O, NULL},
#endif
    {"pending_threadfunc", _PyCFunction_CAST(pending_threadfunc),
     METH_VARARGS | METH_KEYWORDS},
    {"pending_identify", pending_identify, METH_VARARGS, NULL},
    {"_PyTraceMalloc_GetTraceback", tracemalloc_get_traceback, METH_VARARGS},
    {"test_tstate_capi", test_tstate_capi, METH_NOARGS, NULL},
    {"_TyUnicode_TransformDecimalAndSpaceToASCII", unicode_transformdecimalandspacetoascii, METH_O},
    {"check_pyobject_forbidden_bytes_is_freed",
                            check_pyobject_forbidden_bytes_is_freed, METH_NOARGS},
    {"check_pyobject_freed_is_freed", check_pyobject_freed_is_freed, METH_NOARGS},
    {"check_pyobject_null_is_freed",  check_pyobject_null_is_freed,  METH_NOARGS},
    {"check_pyobject_uninitialized_is_freed",
                              check_pyobject_uninitialized_is_freed, METH_NOARGS},
    {"pymem_getallocatorsname", test_pymem_getallocatorsname, METH_NOARGS},
    {"get_object_dict_values", get_object_dict_values, METH_O},
    {"hamt", new_hamt, METH_NOARGS},
    {"dict_getitem_knownhash",  dict_getitem_knownhash,          METH_VARARGS},
    {"create_interpreter", _PyCFunction_CAST(create_interpreter),
     METH_VARARGS | METH_KEYWORDS},
    {"destroy_interpreter", _PyCFunction_CAST(destroy_interpreter),
     METH_VARARGS | METH_KEYWORDS},
    {"exec_interpreter", _PyCFunction_CAST(exec_interpreter),
     METH_VARARGS | METH_KEYWORDS},
    {"run_in_subinterp_with_config",
     _PyCFunction_CAST(run_in_subinterp_with_config),
     METH_VARARGS | METH_KEYWORDS},
    {"normalize_interp_id", normalize_interp_id, METH_O},
    {"next_interpreter_id", next_interpreter_id, METH_NOARGS},
    {"unused_interpreter_id", unused_interpreter_id, METH_NOARGS},
    {"interpreter_exists", interpreter_exists, METH_O},
    {"get_interpreter_refcount", get_interpreter_refcount, METH_O},
    {"link_interpreter_refcount", link_interpreter_refcount,     METH_O},
    {"unlink_interpreter_refcount", unlink_interpreter_refcount, METH_O},
    {"interpreter_refcount_linked", interpreter_refcount_linked, METH_O},
    {"compile_perf_trampoline_entry", compile_perf_trampoline_entry, METH_VARARGS},
    {"perf_trampoline_set_persist_after_fork", perf_trampoline_set_persist_after_fork, METH_VARARGS},
    {"get_crossinterp_data",    _PyCFunction_CAST(get_crossinterp_data),
     METH_VARARGS | METH_KEYWORDS},
    {"restore_crossinterp_data", restore_crossinterp_data,       METH_VARARGS},
    _TESTINTERNALCAPI_TEST_LONG_NUMBITS_METHODDEF
    {"get_rare_event_counters", get_rare_event_counters, METH_NOARGS},
    {"reset_rare_event_counters", reset_rare_event_counters, METH_NOARGS},
    {"has_inline_values", has_inline_values, METH_O},
    {"has_split_table", has_split_table, METH_O},
    {"type_assign_specific_version_unsafe", type_assign_specific_version_unsafe, METH_VARARGS,
     TyDoc_STR("forcefully assign type->tp_version_tag")},

#ifdef Ty_GIL_DISABLED
    {"py_thread_id", get_py_thread_id, METH_NOARGS},
    {"get_tlbc", get_tlbc, METH_O, NULL},
    {"get_tlbc_id", get_tlbc_id, METH_O, NULL},
#endif
#ifdef _Ty_TIER2
    {"uop_symbols_test", _Ty_uop_symbols_test, METH_NOARGS},
#endif
    GH_119213_GETARGS_METHODDEF
    {"get_static_builtin_types", get_static_builtin_types, METH_NOARGS},
    {"identify_type_slot_wrappers", identify_type_slot_wrappers, METH_NOARGS},
    {"has_deferred_refcount", has_deferred_refcount, METH_O},
    {"get_tracked_heap_size", get_tracked_heap_size, METH_NOARGS},
    {"is_static_immortal", is_static_immortal, METH_O},
    {"incref_decref_delayed", incref_decref_delayed, METH_O},
    GET_NEXT_DICT_KEYS_VERSION_METHODDEF
    {NULL, NULL} /* sentinel */
};


/* initialization function */

static int
module_exec(TyObject *module)
{
    if (_PyTestInternalCapi_Init_Lock(module) < 0) {
        return 1;
    }
    if (_PyTestInternalCapi_Init_PyTime(module) < 0) {
        return 1;
    }
    if (_PyTestInternalCapi_Init_Set(module) < 0) {
        return 1;
    }
    if (_PyTestInternalCapi_Init_Complex(module) < 0) {
        return 1;
    }
    if (_PyTestInternalCapi_Init_CriticalSection(module) < 0) {
        return 1;
    }

    Ty_ssize_t sizeof_gc_head = 0;
#ifndef Ty_GIL_DISABLED
    sizeof_gc_head = sizeof(TyGC_Head);
#endif

    if (TyModule_Add(module, "SIZEOF_PYGC_HEAD",
                        TyLong_FromSsize_t(sizeof_gc_head)) < 0) {
        return 1;
    }

    if (TyModule_Add(module, "SIZEOF_MANAGED_PRE_HEADER",
                        TyLong_FromSsize_t(2 * sizeof(TyObject*))) < 0) {
        return 1;
    }

    if (TyModule_Add(module, "SIZEOF_PYOBJECT",
                        TyLong_FromSsize_t(sizeof(TyObject))) < 0) {
        return 1;
    }

    if (TyModule_Add(module, "SIZEOF_TIME_T",
                        TyLong_FromSsize_t(sizeof(time_t))) < 0) {
        return 1;
    }

    if (TyModule_Add(module, "TIER2_THRESHOLD",
                        TyLong_FromLong(JUMP_BACKWARD_INITIAL_VALUE + 1)) < 0) {
        return 1;
    }

    if (TyModule_Add(module, "SPECIALIZATION_THRESHOLD",
                        TyLong_FromLong(ADAPTIVE_WARMUP_VALUE + 1)) < 0) {
        return 1;
    }

    if (TyModule_Add(module, "SPECIALIZATION_COOLDOWN",
                        TyLong_FromLong(ADAPTIVE_COOLDOWN_VALUE + 1)) < 0) {
        return 1;
    }

    if (TyModule_Add(module, "SHARED_KEYS_MAX_SIZE",
                        TyLong_FromLong(SHARED_KEYS_MAX_SIZE)) < 0) {
        return 1;
    }

    return 0;
}

static struct PyModuleDef_Slot module_slots[] = {
    {Ty_mod_exec, module_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static int
module_traverse(TyObject *module, visitproc visit, void *arg)
{
    module_state *state = get_module_state(module);
    assert(state != NULL);
    traverse_module_state(state, visit, arg);
    return 0;
}

static int
module_clear(TyObject *module)
{
    module_state *state = get_module_state(module);
    assert(state != NULL);
    (void)clear_module_state(state);
    return 0;
}

static void
module_free(void *module)
{
    module_state *state = get_module_state(module);
    assert(state != NULL);
    (void)clear_module_state(state);
}

static struct TyModuleDef _testcapimodule = {
    .m_base = PyModuleDef_HEAD_INIT,
    .m_name = MODULE_NAME,
    .m_doc = NULL,
    .m_size = sizeof(module_state),
    .m_methods = module_functions,
    .m_slots = module_slots,
    .m_traverse = module_traverse,
    .m_clear = module_clear,
    .m_free = module_free,
};


PyMODINIT_FUNC
PyInit__testinternalcapi(void)
{
    return PyModuleDef_Init(&_testcapimodule);
}
