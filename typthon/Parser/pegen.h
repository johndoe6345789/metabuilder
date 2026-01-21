#ifndef PEGEN_H
#define PEGEN_H

#include <Python.h>
#include <pycore_ast.h>
#include <pycore_token.h>

#include "lexer/state.h"

#if 0
#define PyPARSE_YIELD_IS_KEYWORD        0x0001
#endif

#define PyPARSE_DONT_IMPLY_DEDENT       0x0002

#if 0
#define PyPARSE_WITH_IS_KEYWORD         0x0003
#define PyPARSE_PRINT_IS_FUNCTION       0x0004
#define PyPARSE_UNICODE_LITERALS        0x0008
#endif

#define PyPARSE_IGNORE_COOKIE 0x0010
#define PyPARSE_BARRY_AS_BDFL 0x0020
#define PyPARSE_TYPE_COMMENTS 0x0040
#define PyPARSE_ALLOW_INCOMPLETE_INPUT 0x0100

#define CURRENT_POS (-5)

#define TOK_GET_MODE(tok) (&(tok->tok_mode_stack[tok->tok_mode_stack_index]))
#define TOK_GET_STRING_PREFIX(tok) (TOK_GET_MODE(tok)->string_kind == TSTRING ? 't' : 'f')

typedef struct _memo {
    int type;
    void *node;
    int mark;
    struct _memo *next;
} Memo;

typedef struct {
    int type;
    TyObject *bytes;
    int level;
    int lineno, col_offset, end_lineno, end_col_offset;
    Memo *memo;
    TyObject *metadata;
} Token;

typedef struct {
    const char *str;
    int type;
} KeywordToken;


typedef struct {
    struct {
        int lineno;
        char *comment;  // The " <tag>" in "# type: ignore <tag>"
    } *items;
    size_t size;
    size_t num_items;
} growable_comment_array;

typedef struct {
    int lineno;
    int col_offset;
    int end_lineno;
    int end_col_offset;
} location;

typedef struct {
    struct tok_state *tok;
    Token **tokens;
    int mark;
    int fill, size;
    PyArena *arena;
    KeywordToken **keywords;
    char **soft_keywords;
    int n_keyword_lists;
    int start_rule;
    int *errcode;
    int parsing_started;
    TyObject* normalize;
    int starting_lineno;
    int starting_col_offset;
    int error_indicator;
    int flags;
    int feature_version;
    growable_comment_array type_ignore_comments;
    Token *known_err_token;
    int level;
    int call_invalid_rules;
    int debug;
    location last_stmt_location;
} Parser;

typedef struct {
    cmpop_ty cmpop;
    expr_ty expr;
} CmpopExprPair;

typedef struct {
    expr_ty key;
    expr_ty value;
} KeyValuePair;

typedef struct {
    expr_ty key;
    pattern_ty pattern;
} KeyPatternPair;

typedef struct {
    arg_ty arg;
    expr_ty value;
} NameDefaultPair;

typedef struct {
    asdl_arg_seq *plain_names;
    asdl_seq *names_with_defaults; // asdl_seq* of NameDefaultsPair's
} SlashWithDefault;

typedef struct {
    arg_ty vararg;
    asdl_seq *kwonlyargs; // asdl_seq* of NameDefaultsPair's
    arg_ty kwarg;
} StarEtc;

typedef struct { operator_ty kind; } AugOperator;
typedef struct {
    void *element;
    int is_keyword;
} KeywordOrStarred;

typedef struct {
    void *result;
    TyObject *metadata;
} ResultTokenWithMetadata;

// Internal parser functions
#if defined(Ty_DEBUG)
void _TyPegen_clear_memo_statistics(void);
TyObject *_TyPegen_get_memo_statistics(void);
#endif

int _TyPegen_insert_memo(Parser *p, int mark, int type, void *node);
int _TyPegen_update_memo(Parser *p, int mark, int type, void *node);
int _TyPegen_is_memoized(Parser *p, int type, void *pres);

int _TyPegen_lookahead(int, void *(func)(Parser *), Parser *);
int _TyPegen_lookahead_for_expr(int, expr_ty (func)(Parser *), Parser *);
int _TyPegen_lookahead_for_stmt(int, stmt_ty (func)(Parser *), Parser *);
int _TyPegen_lookahead_with_int(int, Token *(func)(Parser *, int), Parser *, int);
int _TyPegen_lookahead_with_string(int, expr_ty (func)(Parser *, const char*), Parser *, const char*);

Token *_TyPegen_expect_token(Parser *p, int type);
void* _TyPegen_expect_forced_result(Parser *p, void* result, const char* expected);
Token *_TyPegen_expect_forced_token(Parser *p, int type, const char* expected);
expr_ty _TyPegen_expect_soft_keyword(Parser *p, const char *keyword);
expr_ty _TyPegen_soft_keyword_token(Parser *p);
expr_ty _TyPegen_fstring_middle_token(Parser* p);
Token *_TyPegen_get_last_nonnwhitespace_token(Parser *);
int _TyPegen_fill_token(Parser *p);
expr_ty _TyPegen_name_token(Parser *p);
expr_ty _TyPegen_number_token(Parser *p);
void *_TyPegen_string_token(Parser *p);
TyObject *_TyPegen_set_source_in_metadata(Parser *p, Token *t);
Ty_ssize_t _TyPegen_byte_offset_to_character_offset_line(TyObject *line, Ty_ssize_t col_offset, Ty_ssize_t end_col_offset);
Ty_ssize_t _TyPegen_byte_offset_to_character_offset(TyObject *line, Ty_ssize_t col_offset);
Ty_ssize_t _TyPegen_byte_offset_to_character_offset_raw(const char*, Ty_ssize_t col_offset);

// Error handling functions and APIs
typedef enum {
    STAR_TARGETS,
    DEL_TARGETS,
    FOR_TARGETS
} TARGETS_TYPE;

int _Pypegen_raise_decode_error(Parser *p);
void _TyPegen_raise_tokenizer_init_error(TyObject *filename);
int _Pypegen_tokenizer_error(Parser *p);
void *_TyPegen_raise_error(Parser *p, TyObject *errtype, int use_mark, const char *errmsg, ...);
void *_TyPegen_raise_error_known_location(Parser *p, TyObject *errtype,
                                          Ty_ssize_t lineno, Ty_ssize_t col_offset,
                                          Ty_ssize_t end_lineno, Ty_ssize_t end_col_offset,
                                          const char *errmsg, va_list va);
void _Pypegen_set_syntax_error(Parser* p, Token* last_token);
void _Pypegen_stack_overflow(Parser *p);

static inline void *
RAISE_ERROR_KNOWN_LOCATION(Parser *p, TyObject *errtype,
                           Ty_ssize_t lineno, Ty_ssize_t col_offset,
                           Ty_ssize_t end_lineno, Ty_ssize_t end_col_offset,
                           const char *errmsg, ...)
{
    va_list va;
    va_start(va, errmsg);
    Ty_ssize_t _col_offset = (col_offset == CURRENT_POS ? CURRENT_POS : col_offset + 1);
    Ty_ssize_t _end_col_offset = (end_col_offset == CURRENT_POS ? CURRENT_POS : end_col_offset + 1);
    _TyPegen_raise_error_known_location(p, errtype, lineno, _col_offset, end_lineno, _end_col_offset, errmsg, va);
    va_end(va);
    return NULL;
}
#define RAISE_SYNTAX_ERROR(msg, ...) _TyPegen_raise_error(p, TyExc_SyntaxError, 0, msg, ##__VA_ARGS__)
#define RAISE_INDENTATION_ERROR(msg, ...) _TyPegen_raise_error(p, TyExc_IndentationError, 0, msg, ##__VA_ARGS__)
#define RAISE_SYNTAX_ERROR_ON_NEXT_TOKEN(msg, ...) _TyPegen_raise_error(p, TyExc_SyntaxError, 1, msg, ##__VA_ARGS__)
#define RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, msg, ...) \
    RAISE_ERROR_KNOWN_LOCATION(p, TyExc_SyntaxError, (a)->lineno, (a)->col_offset, (b)->end_lineno, (b)->end_col_offset, msg, ##__VA_ARGS__)
#define RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, msg, ...) \
    RAISE_ERROR_KNOWN_LOCATION(p, TyExc_SyntaxError, (a)->lineno, (a)->col_offset, (a)->end_lineno, (a)->end_col_offset, msg, ##__VA_ARGS__)
#define RAISE_SYNTAX_ERROR_STARTING_FROM(a, msg, ...) \
    RAISE_ERROR_KNOWN_LOCATION(p, TyExc_SyntaxError, (a)->lineno, (a)->col_offset, CURRENT_POS, CURRENT_POS, msg, ##__VA_ARGS__)
#define RAISE_SYNTAX_ERROR_INVALID_TARGET(type, e) _RAISE_SYNTAX_ERROR_INVALID_TARGET(p, type, e)

Ty_LOCAL_INLINE(void *)
CHECK_CALL(Parser *p, void *result)
{
    if (result == NULL) {
        assert(TyErr_Occurred());
        p->error_indicator = 1;
    }
    return result;
}

/* This is needed for helper functions that are allowed to
   return NULL without an error. Example: _TyPegen_seq_extract_starred_exprs */
Ty_LOCAL_INLINE(void *)
CHECK_CALL_NULL_ALLOWED(Parser *p, void *result)
{
    if (result == NULL && TyErr_Occurred()) {
        p->error_indicator = 1;
    }
    return result;
}

#define CHECK(type, result) ((type) CHECK_CALL(p, result))
#define CHECK_NULL_ALLOWED(type, result) ((type) CHECK_CALL_NULL_ALLOWED(p, result))

expr_ty _TyPegen_get_invalid_target(expr_ty e, TARGETS_TYPE targets_type);
const char *_TyPegen_get_expr_name(expr_ty);
Ty_LOCAL_INLINE(void *)
_RAISE_SYNTAX_ERROR_INVALID_TARGET(Parser *p, TARGETS_TYPE type, void *e)
{
    expr_ty invalid_target = CHECK_NULL_ALLOWED(expr_ty, _TyPegen_get_invalid_target(e, type));
    if (invalid_target != NULL) {
        const char *msg;
        if (type == STAR_TARGETS || type == FOR_TARGETS) {
            msg = "cannot assign to %s";
        }
        else {
            msg = "cannot delete %s";
        }
        return RAISE_SYNTAX_ERROR_KNOWN_LOCATION(
            invalid_target,
            msg,
            _TyPegen_get_expr_name(invalid_target)
        );
        return RAISE_SYNTAX_ERROR_KNOWN_LOCATION(invalid_target, "invalid syntax");
    }
    return NULL;
}

// Action utility functions

void *_TyPegen_dummy_name(Parser *p, ...);
void * _TyPegen_seq_last_item(asdl_seq *seq);
#define PyPegen_last_item(seq, type) ((type)_TyPegen_seq_last_item((asdl_seq*)seq))
void * _TyPegen_seq_first_item(asdl_seq *seq);
#define PyPegen_first_item(seq, type) ((type)_TyPegen_seq_first_item((asdl_seq*)seq))
#define UNUSED(expr) do { (void)(expr); } while (0)
#define EXTRA_EXPR(head, tail) head->lineno, (head)->col_offset, (tail)->end_lineno, (tail)->end_col_offset, p->arena
#define EXTRA _start_lineno, _start_col_offset, _end_lineno, _end_col_offset, p->arena
TyObject *_TyPegen_new_type_comment(Parser *, const char *);

Ty_LOCAL_INLINE(TyObject *)
NEW_TYPE_COMMENT(Parser *p, Token *tc)
{
    if (tc == NULL) {
        return NULL;
    }
    const char *bytes = TyBytes_AsString(tc->bytes);
    if (bytes == NULL) {
        goto error;
    }
    TyObject *tco = _TyPegen_new_type_comment(p, bytes);
    if (tco == NULL) {
        goto error;
    }
    return tco;
 error:
    p->error_indicator = 1;  // Inline CHECK_CALL
    return NULL;
}

Ty_LOCAL_INLINE(void *)
INVALID_VERSION_CHECK(Parser *p, int version, char *msg, void *node)
{
    if (node == NULL) {
        p->error_indicator = 1;  // Inline CHECK_CALL
        return NULL;
    }
    if (p->feature_version < version) {
        p->error_indicator = 1;
        return RAISE_SYNTAX_ERROR("%s only supported in Python 3.%i and greater",
                                  msg, version);
    }
    return node;
}

#define CHECK_VERSION(type, version, msg, node) ((type) INVALID_VERSION_CHECK(p, version, msg, node))

arg_ty _TyPegen_add_type_comment_to_arg(Parser *, arg_ty, Token *);
TyObject *_TyPegen_new_identifier(Parser *, const char *);
asdl_seq *_TyPegen_singleton_seq(Parser *, void *);
asdl_seq *_TyPegen_seq_insert_in_front(Parser *, void *, asdl_seq *);
asdl_seq *_TyPegen_seq_append_to_end(Parser *, asdl_seq *, void *);
asdl_seq *_TyPegen_seq_flatten(Parser *, asdl_seq *);
expr_ty _TyPegen_join_names_with_dot(Parser *, expr_ty, expr_ty);
int _TyPegen_seq_count_dots(asdl_seq *);
alias_ty _TyPegen_alias_for_star(Parser *, int, int, int, int, PyArena *);
asdl_identifier_seq *_TyPegen_map_names_to_ids(Parser *, asdl_expr_seq *);
CmpopExprPair *_TyPegen_cmpop_expr_pair(Parser *, cmpop_ty, expr_ty);
asdl_int_seq *_TyPegen_get_cmpops(Parser *p, asdl_seq *);
asdl_expr_seq *_TyPegen_get_exprs(Parser *, asdl_seq *);
expr_ty _TyPegen_set_expr_context(Parser *, expr_ty, expr_context_ty);
KeyValuePair *_TyPegen_key_value_pair(Parser *, expr_ty, expr_ty);
asdl_expr_seq *_TyPegen_get_keys(Parser *, asdl_seq *);
asdl_expr_seq *_TyPegen_get_values(Parser *, asdl_seq *);
KeyPatternPair *_TyPegen_key_pattern_pair(Parser *, expr_ty, pattern_ty);
asdl_expr_seq *_TyPegen_get_pattern_keys(Parser *, asdl_seq *);
asdl_pattern_seq *_TyPegen_get_patterns(Parser *, asdl_seq *);
NameDefaultPair *_TyPegen_name_default_pair(Parser *, arg_ty, expr_ty, Token *);
SlashWithDefault *_TyPegen_slash_with_default(Parser *, asdl_arg_seq *, asdl_seq *);
StarEtc *_TyPegen_star_etc(Parser *, arg_ty, asdl_seq *, arg_ty);
arguments_ty _TyPegen_make_arguments(Parser *, asdl_arg_seq *, SlashWithDefault *,
                                     asdl_arg_seq *, asdl_seq *, StarEtc *);
arguments_ty _TyPegen_empty_arguments(Parser *);
expr_ty _TyPegen_template_str(Parser *p, Token *a, asdl_expr_seq *raw_expressions, Token *b);
expr_ty _TyPegen_joined_str(Parser *p, Token *a, asdl_expr_seq *raw_expressions, Token *b);
expr_ty _TyPegen_interpolation(Parser *, expr_ty, Token *, ResultTokenWithMetadata *, ResultTokenWithMetadata *, Token *,
                                 int, int, int, int, PyArena *);
expr_ty _TyPegen_formatted_value(Parser *, expr_ty, Token *, ResultTokenWithMetadata *, ResultTokenWithMetadata *, Token *,
                                 int, int, int, int, PyArena *);
AugOperator *_TyPegen_augoperator(Parser*, operator_ty type);
stmt_ty _TyPegen_function_def_decorators(Parser *, asdl_expr_seq *, stmt_ty);
stmt_ty _TyPegen_class_def_decorators(Parser *, asdl_expr_seq *, stmt_ty);
KeywordOrStarred *_TyPegen_keyword_or_starred(Parser *, void *, int);
asdl_expr_seq *_TyPegen_seq_extract_starred_exprs(Parser *, asdl_seq *);
asdl_keyword_seq *_TyPegen_seq_delete_starred_exprs(Parser *, asdl_seq *);
expr_ty _TyPegen_collect_call_seqs(Parser *, asdl_expr_seq *, asdl_seq *,
                     int lineno, int col_offset, int end_lineno,
                     int end_col_offset, PyArena *arena);
expr_ty _TyPegen_constant_from_token(Parser* p, Token* tok);
expr_ty _TyPegen_decoded_constant_from_token(Parser* p, Token* tok);
expr_ty _TyPegen_constant_from_string(Parser* p, Token* tok);
expr_ty _TyPegen_concatenate_tstrings(Parser *p, asdl_expr_seq *, int, int, int, int, PyArena *);
expr_ty _TyPegen_concatenate_strings(Parser *p, asdl_expr_seq *, int, int, int, int, PyArena *);
expr_ty _TyPegen_FetchRawForm(Parser *p, int, int, int, int);
expr_ty _TyPegen_ensure_imaginary(Parser *p, expr_ty);
expr_ty _TyPegen_ensure_real(Parser *p, expr_ty);
asdl_seq *_TyPegen_join_sequences(Parser *, asdl_seq *, asdl_seq *);
int _TyPegen_check_barry_as_flufl(Parser *, Token *);
int _TyPegen_check_legacy_stmt(Parser *p, expr_ty t);
ResultTokenWithMetadata *_TyPegen_check_fstring_conversion(Parser *p, Token *, expr_ty t);
ResultTokenWithMetadata *_TyPegen_setup_full_format_spec(Parser *, Token *, asdl_expr_seq *, int, int,
                                                         int, int, PyArena *);
mod_ty _TyPegen_make_module(Parser *, asdl_stmt_seq *);
void *_TyPegen_arguments_parsing_error(Parser *, expr_ty);
expr_ty _TyPegen_get_last_comprehension_item(comprehension_ty comprehension);
void *_TyPegen_nonparen_genexp_in_call(Parser *p, expr_ty args, asdl_comprehension_seq *comprehensions);
stmt_ty _TyPegen_checked_future_import(Parser *p, identifier module, asdl_alias_seq *,
                                       int , int, int , int , int , PyArena *);
asdl_stmt_seq* _TyPegen_register_stmts(Parser *p, asdl_stmt_seq* stmts);
stmt_ty _TyPegen_register_stmt(Parser *p, stmt_ty s);

// Parser API

Parser *_TyPegen_Parser_New(struct tok_state *, int, int, int, int *, const char*, PyArena *);
void _TyPegen_Parser_Free(Parser *);
mod_ty _TyPegen_run_parser_from_file_pointer(FILE *, int, TyObject *, const char *,
                                    const char *, const char *, PyCompilerFlags *, int *, TyObject **,
                                    PyArena *);
void *_TyPegen_run_parser(Parser *);
mod_ty _TyPegen_run_parser_from_string(const char *, int, TyObject *, PyCompilerFlags *, PyArena *);
asdl_stmt_seq *_TyPegen_interactive_exit(Parser *);

// Generated function in parse.c - function definition in python.gram
void *_TyPegen_parse(Parser *);

#endif
