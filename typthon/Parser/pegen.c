#include <Python.h>
#include "pycore_ast.h"           // _TyAST_Validate(),
#include "pycore_pystate.h"       // _TyThreadState_GET()
#include "pycore_parser.h"        // _PYPEGEN_NSTATISTICS
#include "pycore_pyerrors.h"      // TyExc_IncompleteInputError
#include "pycore_runtime.h"     // _PyRuntime
#include "pycore_unicodeobject.h" // _TyUnicode_InternImmortal
#include <errcode.h>

#include "lexer/lexer.h"
#include "tokenizer/tokenizer.h"
#include "pegen.h"

// Internal parser functions

asdl_stmt_seq*
_TyPegen_interactive_exit(Parser *p)
{
    if (p->errcode) {
        *(p->errcode) = E_EOF;
    }
    return NULL;
}

Ty_ssize_t
_TyPegen_byte_offset_to_character_offset_line(TyObject *line, Ty_ssize_t col_offset, Ty_ssize_t end_col_offset)
{
    const unsigned char *data = (const unsigned char*)TyUnicode_AsUTF8(line);

    Ty_ssize_t len = 0;
    while (col_offset < end_col_offset) {
        Ty_UCS4 ch = data[col_offset];
        if (ch < 0x80) {
            col_offset += 1;
        } else if ((ch & 0xe0) == 0xc0) {
            col_offset += 2;
        } else if ((ch & 0xf0) == 0xe0) {
            col_offset += 3;
        } else if ((ch & 0xf8) == 0xf0) {
            col_offset += 4;
        } else {
            TyErr_SetString(TyExc_ValueError, "Invalid UTF-8 sequence");
            return -1;
        }
        len++;
    }
    return len;
}

Ty_ssize_t
_TyPegen_byte_offset_to_character_offset_raw(const char* str, Ty_ssize_t col_offset)
{
    Ty_ssize_t len = (Ty_ssize_t)strlen(str);
    if (col_offset > len + 1) {
        col_offset = len + 1;
    }
    assert(col_offset >= 0);
    TyObject *text = TyUnicode_DecodeUTF8(str, col_offset, "replace");
    if (!text) {
        return -1;
    }
    Ty_ssize_t size = TyUnicode_GET_LENGTH(text);
    Ty_DECREF(text);
    return size;
}

Ty_ssize_t
_TyPegen_byte_offset_to_character_offset(TyObject *line, Ty_ssize_t col_offset)
{
    const char *str = TyUnicode_AsUTF8(line);
    if (!str) {
        return -1;
    }
    return _TyPegen_byte_offset_to_character_offset_raw(str, col_offset);
}

// Here, mark is the start of the node, while p->mark is the end.
// If node==NULL, they should be the same.
int
_TyPegen_insert_memo(Parser *p, int mark, int type, void *node)
{
    // Insert in front
    Memo *m = _TyArena_Malloc(p->arena, sizeof(Memo));
    if (m == NULL) {
        return -1;
    }
    m->type = type;
    m->node = node;
    m->mark = p->mark;
    m->next = p->tokens[mark]->memo;
    p->tokens[mark]->memo = m;
    return 0;
}

// Like _TyPegen_insert_memo(), but updates an existing node if found.
int
_TyPegen_update_memo(Parser *p, int mark, int type, void *node)
{
    for (Memo *m = p->tokens[mark]->memo; m != NULL; m = m->next) {
        if (m->type == type) {
            // Update existing node.
            m->node = node;
            m->mark = p->mark;
            return 0;
        }
    }
    // Insert new node.
    return _TyPegen_insert_memo(p, mark, type, node);
}

static int
init_normalization(Parser *p)
{
    if (p->normalize) {
        return 1;
    }
    p->normalize = TyImport_ImportModuleAttrString("unicodedata", "normalize");
    if (!p->normalize)
    {
        return 0;
    }
    return 1;
}

static int
growable_comment_array_init(growable_comment_array *arr, size_t initial_size) {
    assert(initial_size > 0);
    arr->items = TyMem_Malloc(initial_size * sizeof(*arr->items));
    arr->size = initial_size;
    arr->num_items = 0;

    return arr->items != NULL;
}

static int
growable_comment_array_add(growable_comment_array *arr, int lineno, char *comment) {
    if (arr->num_items >= arr->size) {
        size_t new_size = arr->size * 2;
        void *new_items_array = TyMem_Realloc(arr->items, new_size * sizeof(*arr->items));
        if (!new_items_array) {
            return 0;
        }
        arr->items = new_items_array;
        arr->size = new_size;
    }

    arr->items[arr->num_items].lineno = lineno;
    arr->items[arr->num_items].comment = comment;  // Take ownership
    arr->num_items++;
    return 1;
}

static void
growable_comment_array_deallocate(growable_comment_array *arr) {
    for (unsigned i = 0; i < arr->num_items; i++) {
        TyMem_Free(arr->items[i].comment);
    }
    TyMem_Free(arr->items);
}

static int
_get_keyword_or_name_type(Parser *p, struct token *new_token)
{
    Ty_ssize_t name_len = new_token->end_col_offset - new_token->col_offset;
    assert(name_len > 0);

    if (name_len >= p->n_keyword_lists ||
        p->keywords[name_len] == NULL ||
        p->keywords[name_len]->type == -1) {
        return NAME;
    }
    for (KeywordToken *k = p->keywords[name_len]; k != NULL && k->type != -1; k++) {
        if (strncmp(k->str, new_token->start, (size_t)name_len) == 0) {
            return k->type;
        }
    }
    return NAME;
}

static int
initialize_token(Parser *p, Token *parser_token, struct token *new_token, int token_type) {
    assert(parser_token != NULL);

    parser_token->type = (token_type == NAME) ? _get_keyword_or_name_type(p, new_token) : token_type;
    parser_token->bytes = TyBytes_FromStringAndSize(new_token->start, new_token->end - new_token->start);
    if (parser_token->bytes == NULL) {
        return -1;
    }
    if (_TyArena_AddPyObject(p->arena, parser_token->bytes) < 0) {
        Ty_DECREF(parser_token->bytes);
        return -1;
    }

    parser_token->metadata = NULL;
    if (new_token->metadata != NULL) {
        if (_TyArena_AddPyObject(p->arena, new_token->metadata) < 0) {
            Ty_DECREF(new_token->metadata);
            return -1;
        }
        parser_token->metadata = new_token->metadata;
        new_token->metadata = NULL;
    }

    parser_token->level = new_token->level;
    parser_token->lineno = new_token->lineno;
    parser_token->col_offset = p->tok->lineno == p->starting_lineno ? p->starting_col_offset + new_token->col_offset
                                                                    : new_token->col_offset;
    parser_token->end_lineno = new_token->end_lineno;
    parser_token->end_col_offset = p->tok->lineno == p->starting_lineno ? p->starting_col_offset + new_token->end_col_offset
                                                                 : new_token->end_col_offset;

    p->fill += 1;

    if (token_type == ERRORTOKEN && p->tok->done == E_DECODE) {
        return _Pypegen_raise_decode_error(p);
    }

    return (token_type == ERRORTOKEN ? _Pypegen_tokenizer_error(p) : 0);
}

static int
_resize_tokens_array(Parser *p) {
    int newsize = p->size * 2;
    Token **new_tokens = TyMem_Realloc(p->tokens, (size_t)newsize * sizeof(Token *));
    if (new_tokens == NULL) {
        TyErr_NoMemory();
        return -1;
    }
    p->tokens = new_tokens;

    for (int i = p->size; i < newsize; i++) {
        p->tokens[i] = TyMem_Calloc(1, sizeof(Token));
        if (p->tokens[i] == NULL) {
            p->size = i; // Needed, in order to cleanup correctly after parser fails
            TyErr_NoMemory();
            return -1;
        }
    }
    p->size = newsize;
    return 0;
}

int
_TyPegen_fill_token(Parser *p)
{
    struct token new_token;
    _PyToken_Init(&new_token);
    int type = _PyTokenizer_Get(p->tok, &new_token);

    // Record and skip '# type: ignore' comments
    while (type == TYPE_IGNORE) {
        Ty_ssize_t len = new_token.end_col_offset - new_token.col_offset;
        char *tag = TyMem_Malloc((size_t)len + 1);
        if (tag == NULL) {
            TyErr_NoMemory();
            goto error;
        }
        strncpy(tag, new_token.start, (size_t)len);
        tag[len] = '\0';
        // Ownership of tag passes to the growable array
        if (!growable_comment_array_add(&p->type_ignore_comments, p->tok->lineno, tag)) {
            TyErr_NoMemory();
            goto error;
        }
        type = _PyTokenizer_Get(p->tok, &new_token);
    }

    // If we have reached the end and we are in single input mode we need to insert a newline and reset the parsing
    if (p->start_rule == Ty_single_input && type == ENDMARKER && p->parsing_started) {
        type = NEWLINE; /* Add an extra newline */
        p->parsing_started = 0;

        if (p->tok->indent && !(p->flags & PyPARSE_DONT_IMPLY_DEDENT)) {
            p->tok->pendin = -p->tok->indent;
            p->tok->indent = 0;
        }
    }
    else {
        p->parsing_started = 1;
    }

    // Check if we are at the limit of the token array capacity and resize if needed
    if ((p->fill == p->size) && (_resize_tokens_array(p) != 0)) {
        goto error;
    }

    Token *t = p->tokens[p->fill];
    return initialize_token(p, t, &new_token, type);
error:
    _PyToken_Free(&new_token);
    return -1;
}

#if defined(Ty_DEBUG)
// Instrumentation to count the effectiveness of memoization.
// The array counts the number of tokens skipped by memoization,
// indexed by type.

#define NSTATISTICS _PYPEGEN_NSTATISTICS
#define memo_statistics _PyRuntime.parser.memo_statistics

#ifdef Ty_GIL_DISABLED
#define MUTEX_LOCK() PyMutex_Lock(&_PyRuntime.parser.mutex)
#define MUTEX_UNLOCK() PyMutex_Unlock(&_PyRuntime.parser.mutex)
#else
#define MUTEX_LOCK()
#define MUTEX_UNLOCK()
#endif

void
_TyPegen_clear_memo_statistics(void)
{
    MUTEX_LOCK();
    for (int i = 0; i < NSTATISTICS; i++) {
        memo_statistics[i] = 0;
    }
    MUTEX_UNLOCK();
}

TyObject *
_TyPegen_get_memo_statistics(void)
{
    TyObject *ret = TyList_New(NSTATISTICS);
    if (ret == NULL) {
        return NULL;
    }

    MUTEX_LOCK();
    for (int i = 0; i < NSTATISTICS; i++) {
        TyObject *value = TyLong_FromLong(memo_statistics[i]);
        if (value == NULL) {
            MUTEX_UNLOCK();
            Ty_DECREF(ret);
            return NULL;
        }
        // TyList_SetItem borrows a reference to value.
        if (TyList_SetItem(ret, i, value) < 0) {
            MUTEX_UNLOCK();
            Ty_DECREF(ret);
            return NULL;
        }
    }
    MUTEX_UNLOCK();
    return ret;
}
#endif

int  // bool
_TyPegen_is_memoized(Parser *p, int type, void *pres)
{
    if (p->mark == p->fill) {
        if (_TyPegen_fill_token(p) < 0) {
            p->error_indicator = 1;
            return -1;
        }
    }

    Token *t = p->tokens[p->mark];

    for (Memo *m = t->memo; m != NULL; m = m->next) {
        if (m->type == type) {
#if defined(Ty_DEBUG)
            if (0 <= type && type < NSTATISTICS) {
                long count = m->mark - p->mark;
                // A memoized negative result counts for one.
                if (count <= 0) {
                    count = 1;
                }
                MUTEX_LOCK();
                memo_statistics[type] += count;
                MUTEX_UNLOCK();
            }
#endif
            p->mark = m->mark;
            *(void **)(pres) = m->node;
            return 1;
        }
    }
    return 0;
}

#define LOOKAHEAD1(NAME, RES_TYPE)                                  \
    int                                                             \
    NAME (int positive, RES_TYPE (func)(Parser *), Parser *p)       \
    {                                                               \
        int mark = p->mark;                                         \
        void *res = func(p);                                        \
        p->mark = mark;                                             \
        return (res != NULL) == positive;                           \
    }

LOOKAHEAD1(_TyPegen_lookahead, void *)
LOOKAHEAD1(_TyPegen_lookahead_for_expr, expr_ty)
LOOKAHEAD1(_TyPegen_lookahead_for_stmt, stmt_ty)
#undef LOOKAHEAD1

#define LOOKAHEAD2(NAME, RES_TYPE, T)                                   \
    int                                                                 \
    NAME (int positive, RES_TYPE (func)(Parser *, T), Parser *p, T arg) \
    {                                                                   \
        int mark = p->mark;                                             \
        void *res = func(p, arg);                                       \
        p->mark = mark;                                                 \
        return (res != NULL) == positive;                               \
    }

LOOKAHEAD2(_TyPegen_lookahead_with_int, Token *, int)
LOOKAHEAD2(_TyPegen_lookahead_with_string, expr_ty, const char *)
#undef LOOKAHEAD2

Token *
_TyPegen_expect_token(Parser *p, int type)
{
    if (p->mark == p->fill) {
        if (_TyPegen_fill_token(p) < 0) {
            p->error_indicator = 1;
            return NULL;
        }
    }
    Token *t = p->tokens[p->mark];
    if (t->type != type) {
       return NULL;
    }
    p->mark += 1;
    return t;
}

void*
_TyPegen_expect_forced_result(Parser *p, void* result, const char* expected) {

    if (p->error_indicator == 1) {
        return NULL;
    }
    if (result == NULL) {
        RAISE_SYNTAX_ERROR("expected (%s)", expected);
        return NULL;
    }
    return result;
}

Token *
_TyPegen_expect_forced_token(Parser *p, int type, const char* expected) {

    if (p->error_indicator == 1) {
        return NULL;
    }

    if (p->mark == p->fill) {
        if (_TyPegen_fill_token(p) < 0) {
            p->error_indicator = 1;
            return NULL;
        }
    }
    Token *t = p->tokens[p->mark];
    if (t->type != type) {
        RAISE_SYNTAX_ERROR_KNOWN_LOCATION(t, "expected '%s'", expected);
        return NULL;
    }
    p->mark += 1;
    return t;
}

expr_ty
_TyPegen_expect_soft_keyword(Parser *p, const char *keyword)
{
    if (p->mark == p->fill) {
        if (_TyPegen_fill_token(p) < 0) {
            p->error_indicator = 1;
            return NULL;
        }
    }
    Token *t = p->tokens[p->mark];
    if (t->type != NAME) {
        return NULL;
    }
    const char *s = TyBytes_AsString(t->bytes);
    if (!s) {
        p->error_indicator = 1;
        return NULL;
    }
    if (strcmp(s, keyword) != 0) {
        return NULL;
    }
    return _TyPegen_name_token(p);
}

Token *
_TyPegen_get_last_nonnwhitespace_token(Parser *p)
{
    assert(p->mark >= 0);
    Token *token = NULL;
    for (int m = p->mark - 1; m >= 0; m--) {
        token = p->tokens[m];
        if (token->type != ENDMARKER && (token->type < NEWLINE || token->type > DEDENT)) {
            break;
        }
    }
    return token;
}

TyObject *
_TyPegen_new_identifier(Parser *p, const char *n)
{
    TyObject *id = TyUnicode_DecodeUTF8(n, (Ty_ssize_t)strlen(n), NULL);
    if (!id) {
        goto error;
    }
    /* Check whether there are non-ASCII characters in the
       identifier; if so, normalize to NFKC. */
    if (!TyUnicode_IS_ASCII(id))
    {
        if (!init_normalization(p))
        {
            Ty_DECREF(id);
            goto error;
        }
        TyObject *form = TyUnicode_InternFromString("NFKC");
        if (form == NULL)
        {
            Ty_DECREF(id);
            goto error;
        }
        TyObject *args[2] = {form, id};
        TyObject *id2 = PyObject_Vectorcall(p->normalize, args, 2, NULL);
        Ty_DECREF(id);
        Ty_DECREF(form);
        if (!id2) {
            goto error;
        }

        if (!TyUnicode_Check(id2))
        {
            TyErr_Format(TyExc_TypeError,
                         "unicodedata.normalize() must return a string, not "
                         "%.200s",
                         _TyType_Name(Ty_TYPE(id2)));
            Ty_DECREF(id2);
            goto error;
        }
        id = id2;
    }
    static const char * const forbidden[] = {
        "None",
        "True",
        "False",
        NULL
    };
    for (int i = 0; forbidden[i] != NULL; i++) {
        if (_TyUnicode_EqualToASCIIString(id, forbidden[i])) {
            TyErr_Format(TyExc_ValueError,
                         "identifier field can't represent '%s' constant",
                         forbidden[i]);
            Ty_DECREF(id);
            goto error;
        }
    }
    TyInterpreterState *interp = _TyInterpreterState_GET();
    _TyUnicode_InternImmortal(interp, &id);
    if (_TyArena_AddPyObject(p->arena, id) < 0)
    {
        Ty_DECREF(id);
        goto error;
    }
    return id;

error:
    p->error_indicator = 1;
    return NULL;
}

static expr_ty
_TyPegen_name_from_token(Parser *p, Token* t)
{
    if (t == NULL) {
        return NULL;
    }
    const char *s = TyBytes_AsString(t->bytes);
    if (!s) {
        p->error_indicator = 1;
        return NULL;
    }
    TyObject *id = _TyPegen_new_identifier(p, s);
    if (id == NULL) {
        p->error_indicator = 1;
        return NULL;
    }
    return _TyAST_Name(id, Load, t->lineno, t->col_offset, t->end_lineno,
                       t->end_col_offset, p->arena);
}

expr_ty
_TyPegen_name_token(Parser *p)
{
    Token *t = _TyPegen_expect_token(p, NAME);
    return _TyPegen_name_from_token(p, t);
}

void *
_TyPegen_string_token(Parser *p)
{
    return _TyPegen_expect_token(p, STRING);
}

expr_ty _TyPegen_soft_keyword_token(Parser *p) {
    Token *t = _TyPegen_expect_token(p, NAME);
    if (t == NULL) {
        return NULL;
    }
    char *the_token;
    Ty_ssize_t size;
    TyBytes_AsStringAndSize(t->bytes, &the_token, &size);
    for (char **keyword = p->soft_keywords; *keyword != NULL; keyword++) {
        if (strlen(*keyword) == (size_t)size &&
            strncmp(*keyword, the_token, (size_t)size) == 0) {
            return _TyPegen_name_from_token(p, t);
        }
    }
    return NULL;
}

static TyObject *
parsenumber_raw(const char *s)
{
    const char *end;
    long x;
    double dx;
    Ty_complex compl;
    int imflag;

    assert(s != NULL);
    errno = 0;
    end = s + strlen(s) - 1;
    imflag = *end == 'j' || *end == 'J';
    if (s[0] == '0') {
        x = (long)TyOS_strtoul(s, (char **)&end, 0);
        if (x < 0 && errno == 0) {
            return TyLong_FromString(s, (char **)0, 0);
        }
    }
    else {
        x = TyOS_strtol(s, (char **)&end, 0);
    }
    if (*end == '\0') {
        if (errno != 0) {
            return TyLong_FromString(s, (char **)0, 0);
        }
        return TyLong_FromLong(x);
    }
    /* XXX Huge floats may silently fail */
    if (imflag) {
        compl.real = 0.;
        compl.imag = TyOS_string_to_double(s, (char **)&end, NULL);
        if (compl.imag == -1.0 && TyErr_Occurred()) {
            return NULL;
        }
        return TyComplex_FromCComplex(compl);
    }
    dx = TyOS_string_to_double(s, NULL, NULL);
    if (dx == -1.0 && TyErr_Occurred()) {
        return NULL;
    }
    return TyFloat_FromDouble(dx);
}

static TyObject *
parsenumber(const char *s)
{
    char *dup;
    char *end;
    TyObject *res = NULL;

    assert(s != NULL);

    if (strchr(s, '_') == NULL) {
        return parsenumber_raw(s);
    }
    /* Create a duplicate without underscores. */
    dup = TyMem_Malloc(strlen(s) + 1);
    if (dup == NULL) {
        return TyErr_NoMemory();
    }
    end = dup;
    for (; *s; s++) {
        if (*s != '_') {
            *end++ = *s;
        }
    }
    *end = '\0';
    res = parsenumber_raw(dup);
    TyMem_Free(dup);
    return res;
}

expr_ty
_TyPegen_number_token(Parser *p)
{
    Token *t = _TyPegen_expect_token(p, NUMBER);
    if (t == NULL) {
        return NULL;
    }

    const char *num_raw = TyBytes_AsString(t->bytes);
    if (num_raw == NULL) {
        p->error_indicator = 1;
        return NULL;
    }

    if (p->feature_version < 6 && strchr(num_raw, '_') != NULL) {
        p->error_indicator = 1;
        return RAISE_SYNTAX_ERROR("Underscores in numeric literals are only supported "
                                  "in Python 3.6 and greater");
    }

    TyObject *c = parsenumber(num_raw);

    if (c == NULL) {
        p->error_indicator = 1;
        TyThreadState *tstate = _TyThreadState_GET();
        // The only way a ValueError should happen in _this_ code is via
        // TyLong_FromString hitting a length limit.
        if (tstate->current_exception != NULL &&
            Ty_TYPE(tstate->current_exception) == (TyTypeObject *)TyExc_ValueError
        ) {
            TyObject *exc = TyErr_GetRaisedException();
            /* Intentionally omitting columns to avoid a wall of 1000s of '^'s
             * on the error message. Nobody is going to overlook their huge
             * numeric literal once given the line. */
            RAISE_ERROR_KNOWN_LOCATION(
                p, TyExc_SyntaxError,
                t->lineno, -1 /* col_offset */,
                t->end_lineno, -1 /* end_col_offset */,
                "%S - Consider hexadecimal for huge integer literals "
                "to avoid decimal conversion limits.",
                exc);
            Ty_DECREF(exc);
        }
        return NULL;
    }

    if (_TyArena_AddPyObject(p->arena, c) < 0) {
        Ty_DECREF(c);
        p->error_indicator = 1;
        return NULL;
    }

    return _TyAST_Constant(c, NULL, t->lineno, t->col_offset, t->end_lineno,
                           t->end_col_offset, p->arena);
}

/* Check that the source for a single input statement really is a single
   statement by looking at what is left in the buffer after parsing.
   Trailing whitespace and comments are OK. */
static int // bool
bad_single_statement(Parser *p)
{
    char *cur = p->tok->cur;
    char c = *cur;

    for (;;) {
        while (c == ' ' || c == '\t' || c == '\n' || c == '\014') {
            c = *++cur;
        }

        if (!c) {
            return 0;
        }

        if (c != '#') {
            return 1;
        }

        /* Suck up comment. */
        while (c && c != '\n') {
            c = *++cur;
        }
    }
}

static int
compute_parser_flags(PyCompilerFlags *flags)
{
    int parser_flags = 0;
    if (!flags) {
        return 0;
    }
    if (flags->cf_flags & PyCF_DONT_IMPLY_DEDENT) {
        parser_flags |= PyPARSE_DONT_IMPLY_DEDENT;
    }
    if (flags->cf_flags & PyCF_IGNORE_COOKIE) {
        parser_flags |= PyPARSE_IGNORE_COOKIE;
    }
    if (flags->cf_flags & CO_FUTURE_BARRY_AS_BDFL) {
        parser_flags |= PyPARSE_BARRY_AS_BDFL;
    }
    if (flags->cf_flags & PyCF_TYPE_COMMENTS) {
        parser_flags |= PyPARSE_TYPE_COMMENTS;
    }
    if (flags->cf_flags & PyCF_ALLOW_INCOMPLETE_INPUT) {
        parser_flags |= PyPARSE_ALLOW_INCOMPLETE_INPUT;
    }
    return parser_flags;
}

// Parser API

Parser *
_TyPegen_Parser_New(struct tok_state *tok, int start_rule, int flags,
                    int feature_version, int *errcode, const char* source, PyArena *arena)
{
    Parser *p = TyMem_Malloc(sizeof(Parser));
    if (p == NULL) {
        return (Parser *) TyErr_NoMemory();
    }
    assert(tok != NULL);
    tok->type_comments = (flags & PyPARSE_TYPE_COMMENTS) > 0;
    p->tok = tok;
    p->keywords = NULL;
    p->n_keyword_lists = -1;
    p->soft_keywords = NULL;
    p->tokens = TyMem_Malloc(sizeof(Token *));
    if (!p->tokens) {
        TyMem_Free(p);
        return (Parser *) TyErr_NoMemory();
    }
    p->tokens[0] = TyMem_Calloc(1, sizeof(Token));
    if (!p->tokens[0]) {
        TyMem_Free(p->tokens);
        TyMem_Free(p);
        return (Parser *) TyErr_NoMemory();
    }
    if (!growable_comment_array_init(&p->type_ignore_comments, 10)) {
        TyMem_Free(p->tokens[0]);
        TyMem_Free(p->tokens);
        TyMem_Free(p);
        return (Parser *) TyErr_NoMemory();
    }

    p->mark = 0;
    p->fill = 0;
    p->size = 1;

    p->errcode = errcode;
    p->arena = arena;
    p->start_rule = start_rule;
    p->parsing_started = 0;
    p->normalize = NULL;
    p->error_indicator = 0;

    p->starting_lineno = 0;
    p->starting_col_offset = 0;
    p->flags = flags;
    p->feature_version = feature_version;
    p->known_err_token = NULL;
    p->level = 0;
    p->call_invalid_rules = 0;
    p->last_stmt_location.lineno = 0;
    p->last_stmt_location.col_offset = 0;
    p->last_stmt_location.end_lineno = 0;
    p->last_stmt_location.end_col_offset = 0;
#ifdef Ty_DEBUG
    p->debug = _Ty_GetConfig()->parser_debug;
#endif
    return p;
}

void
_TyPegen_Parser_Free(Parser *p)
{
    Ty_XDECREF(p->normalize);
    for (int i = 0; i < p->size; i++) {
        TyMem_Free(p->tokens[i]);
    }
    TyMem_Free(p->tokens);
    growable_comment_array_deallocate(&p->type_ignore_comments);
    TyMem_Free(p);
}

static void
reset_parser_state_for_error_pass(Parser *p)
{
    p->last_stmt_location.lineno = 0;
    p->last_stmt_location.col_offset = 0;
    p->last_stmt_location.end_lineno = 0;
    p->last_stmt_location.end_col_offset = 0;
    for (int i = 0; i < p->fill; i++) {
        p->tokens[i]->memo = NULL;
    }
    p->mark = 0;
    p->call_invalid_rules = 1;
    // Don't try to get extra tokens in interactive mode when trying to
    // raise specialized errors in the second pass.
    p->tok->interactive_underflow = IUNDERFLOW_STOP;
}

static inline int
_is_end_of_source(Parser *p) {
    int err = p->tok->done;
    return err == E_EOF || err == E_EOFS || err == E_EOLS;
}

static void
_TyPegen_set_syntax_error_metadata(Parser *p) {
    TyObject *exc = TyErr_GetRaisedException();
    if (!exc || !PyObject_TypeCheck(exc, (TyTypeObject *)TyExc_SyntaxError)) {
        TyErr_SetRaisedException(exc);
        return;
    }
    const char *source = NULL;
    if (p->tok->str != NULL) {
        source = p->tok->str;
    }
    if (!source && p->tok->fp_interactive && p->tok->interactive_src_start) {
        source = p->tok->interactive_src_start;
    }
    TyObject* the_source = NULL;
    if (source) {
        if (p->tok->encoding == NULL) {
            the_source = TyUnicode_FromString(source);
        } else {
            the_source = TyUnicode_Decode(source, strlen(source), p->tok->encoding, NULL);
        }
    }
    if (!the_source) {
        TyErr_Clear();
        the_source = Ty_None;
        Ty_INCREF(the_source);
    }
    TyObject* metadata = Ty_BuildValue(
        "(iiN)",
        p->last_stmt_location.lineno,
        p->last_stmt_location.col_offset,
        the_source // N gives ownership to metadata
    );
    if (!metadata) {
        Ty_DECREF(the_source);
        TyErr_Clear();
        return;
    }
    TySyntaxErrorObject *syntax_error = (TySyntaxErrorObject *)exc;

    Ty_XDECREF(syntax_error->metadata);
    syntax_error->metadata = metadata;
    TyErr_SetRaisedException(exc);
}

void *
_TyPegen_run_parser(Parser *p)
{
    void *res = _TyPegen_parse(p);
    assert(p->level == 0);
    if (res == NULL) {
        if ((p->flags & PyPARSE_ALLOW_INCOMPLETE_INPUT) &&  _is_end_of_source(p)) {
            TyErr_Clear();
            return _TyPegen_raise_error(p, TyExc_IncompleteInputError, 0, "incomplete input");
        }
        if (TyErr_Occurred() && !TyErr_ExceptionMatches(TyExc_SyntaxError)) {
            return NULL;
        }
       // Make a second parser pass. In this pass we activate heavier and slower checks
        // to produce better error messages and more complete diagnostics. Extra "invalid_*"
        // rules will be active during parsing.
        Token *last_token = p->tokens[p->fill - 1];
        reset_parser_state_for_error_pass(p);
        _TyPegen_parse(p);

        // Set SyntaxErrors accordingly depending on the parser/tokenizer status at the failure
        // point.
        _Pypegen_set_syntax_error(p, last_token);

        // Set the metadata in the exception from p->last_stmt_location
        if (TyErr_ExceptionMatches(TyExc_SyntaxError)) {
            _TyPegen_set_syntax_error_metadata(p);
        }
       return NULL;
    }

    if (p->start_rule == Ty_single_input && bad_single_statement(p)) {
        p->tok->done = E_BADSINGLE; // This is not necessary for now, but might be in the future
        return RAISE_SYNTAX_ERROR("multiple statements found while compiling a single statement");
    }

    // test_peg_generator defines _Ty_TEST_PEGEN to not call TyAST_Validate()
#if defined(Ty_DEBUG) && !defined(_Ty_TEST_PEGEN)
    if (p->start_rule == Ty_single_input ||
        p->start_rule == Ty_file_input ||
        p->start_rule == Ty_eval_input)
    {
        if (!_TyAST_Validate(res)) {
            return NULL;
        }
    }
#endif
    return res;
}

mod_ty
_TyPegen_run_parser_from_file_pointer(FILE *fp, int start_rule, TyObject *filename_ob,
                             const char *enc, const char *ps1, const char *ps2,
                             PyCompilerFlags *flags, int *errcode,
                             TyObject **interactive_src, PyArena *arena)
{
    struct tok_state *tok = _PyTokenizer_FromFile(fp, enc, ps1, ps2);
    if (tok == NULL) {
        if (TyErr_Occurred()) {
            _TyPegen_raise_tokenizer_init_error(filename_ob);
            return NULL;
        }
        return NULL;
    }
    if (!tok->fp || ps1 != NULL || ps2 != NULL ||
        TyUnicode_CompareWithASCIIString(filename_ob, "<stdin>") == 0) {
        tok->fp_interactive = 1;
    }
    // This transfers the ownership to the tokenizer
    tok->filename = Ty_NewRef(filename_ob);

    // From here on we need to clean up even if there's an error
    mod_ty result = NULL;

    int parser_flags = compute_parser_flags(flags);
    Parser *p = _TyPegen_Parser_New(tok, start_rule, parser_flags, PY_MINOR_VERSION,
                                    errcode, NULL, arena);
    if (p == NULL) {
        goto error;
    }

    result = _TyPegen_run_parser(p);
    _TyPegen_Parser_Free(p);

    if (tok->fp_interactive && tok->interactive_src_start && result && interactive_src != NULL) {
        *interactive_src = TyUnicode_FromString(tok->interactive_src_start);
        if (!interactive_src || _TyArena_AddPyObject(arena, *interactive_src) < 0) {
            Ty_XDECREF(interactive_src);
            result = NULL;
            goto error;
        }
    }

error:
    _PyTokenizer_Free(tok);
    return result;
}

mod_ty
_TyPegen_run_parser_from_string(const char *str, int start_rule, TyObject *filename_ob,
                       PyCompilerFlags *flags, PyArena *arena)
{
    int exec_input = start_rule == Ty_file_input;

    struct tok_state *tok;
    if (flags != NULL && flags->cf_flags & PyCF_IGNORE_COOKIE) {
        tok = _PyTokenizer_FromUTF8(str, exec_input, 0);
    } else {
        tok = _PyTokenizer_FromString(str, exec_input, 0);
    }
    if (tok == NULL) {
        if (TyErr_Occurred()) {
            _TyPegen_raise_tokenizer_init_error(filename_ob);
        }
        return NULL;
    }
    // This transfers the ownership to the tokenizer
    tok->filename = Ty_NewRef(filename_ob);

    // We need to clear up from here on
    mod_ty result = NULL;

    int parser_flags = compute_parser_flags(flags);
    int feature_version = flags && (flags->cf_flags & PyCF_ONLY_AST) ?
        flags->cf_feature_version : PY_MINOR_VERSION;
    Parser *p = _TyPegen_Parser_New(tok, start_rule, parser_flags, feature_version,
                                    NULL, str, arena);
    if (p == NULL) {
        goto error;
    }

    result = _TyPegen_run_parser(p);
    _TyPegen_Parser_Free(p);

error:
    _PyTokenizer_Free(tok);
    return result;
}
