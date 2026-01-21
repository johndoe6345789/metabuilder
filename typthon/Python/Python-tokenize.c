#include "Python.h"
#include "errcode.h"
#include "internal/pycore_critical_section.h"   // Ty_BEGIN_CRITICAL_SECTION
#include "../Parser/lexer/state.h"
#include "../Parser/lexer/lexer.h"
#include "../Parser/tokenizer/tokenizer.h"
#include "../Parser/pegen.h"                    // _TyPegen_byte_offset_to_character_offset()

static struct TyModuleDef _tokenizemodule;

typedef struct {
    TyTypeObject *TokenizerIter;
} tokenize_state;

static tokenize_state *
get_tokenize_state(TyObject *module) {
    return (tokenize_state *)TyModule_GetState(module);
}

#define _tokenize_get_state_by_type(type) \
    get_tokenize_state(TyType_GetModuleByDef(type, &_tokenizemodule))

#include "pycore_runtime.h"
#include "clinic/Python-tokenize.c.h"

/*[clinic input]
module _tokenizer
class _tokenizer.tokenizeriter "tokenizeriterobject *" "_tokenize_get_state_by_type(type)->TokenizerIter"
[clinic start generated code]*/
/*[clinic end generated code: output=da39a3ee5e6b4b0d input=96d98ee2fef7a8bc]*/

typedef struct
{
    PyObject_HEAD struct tok_state *tok;
    int done;

    /* Needed to cache line for performance */
    TyObject *last_line;
    Ty_ssize_t last_lineno;
    Ty_ssize_t last_end_lineno;
    Ty_ssize_t byte_col_offset_diff;
} tokenizeriterobject;

/*[clinic input]
@classmethod
_tokenizer.tokenizeriter.__new__ as tokenizeriter_new

    readline: object
    /
    *
    extra_tokens: bool
    encoding: str(c_default="NULL") = 'utf-8'
[clinic start generated code]*/

static TyObject *
tokenizeriter_new_impl(TyTypeObject *type, TyObject *readline,
                       int extra_tokens, const char *encoding)
/*[clinic end generated code: output=7501a1211683ce16 input=f7dddf8a613ae8bd]*/
{
    tokenizeriterobject *self = (tokenizeriterobject *)type->tp_alloc(type, 0);
    if (self == NULL) {
        return NULL;
    }
    TyObject *filename = TyUnicode_FromString("<string>");
    if (filename == NULL) {
        return NULL;
    }
    self->tok = _PyTokenizer_FromReadline(readline, encoding, 1, 1);
    if (self->tok == NULL) {
        Ty_DECREF(filename);
        return NULL;
    }
    self->tok->filename = filename;
    if (extra_tokens) {
        self->tok->tok_extra_tokens = 1;
    }
    self->done = 0;

    self->last_line = NULL;
    self->byte_col_offset_diff = 0;
    self->last_lineno = 0;
    self->last_end_lineno = 0;

    return (TyObject *)self;
}

static int
_tokenizer_error(tokenizeriterobject *it)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(it);
    if (TyErr_Occurred()) {
        return -1;
    }

    const char *msg = NULL;
    TyObject* errtype = TyExc_SyntaxError;
    struct tok_state *tok = it->tok;
    switch (tok->done) {
        case E_TOKEN:
            msg = "invalid token";
            break;
        case E_EOF:
            TyErr_SetString(TyExc_SyntaxError, "unexpected EOF in multi-line statement");
            TyErr_SyntaxLocationObject(tok->filename, tok->lineno,
                                       tok->inp - tok->buf < 0 ? 0 : (int)(tok->inp - tok->buf));
            return -1;
        case E_DEDENT:
            msg = "unindent does not match any outer indentation level";
            errtype = TyExc_IndentationError;
            break;
        case E_INTR:
            if (!TyErr_Occurred()) {
                TyErr_SetNone(TyExc_KeyboardInterrupt);
            }
            return -1;
        case E_NOMEM:
            TyErr_NoMemory();
            return -1;
        case E_TABSPACE:
            errtype = TyExc_TabError;
            msg = "inconsistent use of tabs and spaces in indentation";
            break;
        case E_TOODEEP:
            errtype = TyExc_IndentationError;
            msg = "too many levels of indentation";
            break;
        case E_LINECONT: {
            msg = "unexpected character after line continuation character";
            break;
        }
        default:
            msg = "unknown tokenization error";
    }

    TyObject* errstr = NULL;
    TyObject* error_line = NULL;
    TyObject* tmp = NULL;
    TyObject* value = NULL;
    int result = 0;

    Ty_ssize_t size = tok->inp - tok->buf;
    assert(tok->buf[size-1] == '\n');
    size -= 1; // Remove the newline character from the end of the line
    error_line = TyUnicode_DecodeUTF8(tok->buf, size, "replace");
    if (!error_line) {
        result = -1;
        goto exit;
    }

    Ty_ssize_t offset = _TyPegen_byte_offset_to_character_offset(error_line, tok->inp - tok->buf);
    if (offset == -1) {
        result = -1;
        goto exit;
    }
    tmp = Ty_BuildValue("(OnnOOO)", tok->filename, tok->lineno, offset, error_line, Ty_None, Ty_None);
    if (!tmp) {
        result = -1;
        goto exit;
    }

    errstr = TyUnicode_FromString(msg);
    if (!errstr) {
        result = -1;
        goto exit;
    }

    value = TyTuple_Pack(2, errstr, tmp);
    if (!value) {
        result = -1;
        goto exit;
    }

    TyErr_SetObject(errtype, value);

exit:
    Ty_XDECREF(errstr);
    Ty_XDECREF(error_line);
    Ty_XDECREF(tmp);
    Ty_XDECREF(value);
    return result;
}

static TyObject *
_get_current_line(tokenizeriterobject *it, const char *line_start, Ty_ssize_t size,
                  int *line_changed)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(it);
    TyObject *line;
    if (it->tok->lineno != it->last_lineno) {
        // Line has changed since last token, so we fetch the new line and cache it
        // in the iter object.
        Ty_XDECREF(it->last_line);
        line = TyUnicode_DecodeUTF8(line_start, size, "replace");
        it->last_line = line;
        it->byte_col_offset_diff = 0;
    }
    else {
        line = it->last_line;
        *line_changed = 0;
    }
    return line;
}

static void
_get_col_offsets(tokenizeriterobject *it, struct token token, const char *line_start,
                 TyObject *line, int line_changed, Ty_ssize_t lineno, Ty_ssize_t end_lineno,
                 Ty_ssize_t *col_offset, Ty_ssize_t *end_col_offset)
{
    _Ty_CRITICAL_SECTION_ASSERT_OBJECT_LOCKED(it);
    Ty_ssize_t byte_offset = -1;
    if (token.start != NULL && token.start >= line_start) {
        byte_offset = token.start - line_start;
        if (line_changed) {
            *col_offset = _TyPegen_byte_offset_to_character_offset_line(line, 0, byte_offset);
            it->byte_col_offset_diff = byte_offset - *col_offset;
        }
        else {
            *col_offset = byte_offset - it->byte_col_offset_diff;
        }
    }

    if (token.end != NULL && token.end >= it->tok->line_start) {
        Ty_ssize_t end_byte_offset = token.end - it->tok->line_start;
        if (lineno == end_lineno) {
            // If the whole token is at the same line, we can just use the token.start
            // buffer for figuring out the new column offset, since using line is not
            // performant for very long lines.
            Ty_ssize_t token_col_offset = _TyPegen_byte_offset_to_character_offset_line(line, byte_offset, end_byte_offset);
            *end_col_offset = *col_offset + token_col_offset;
            it->byte_col_offset_diff += token.end - token.start - token_col_offset;
        }
        else {
            *end_col_offset = _TyPegen_byte_offset_to_character_offset_raw(it->tok->line_start, end_byte_offset);
            it->byte_col_offset_diff += end_byte_offset - *end_col_offset;
        }
    }
    it->last_lineno = lineno;
    it->last_end_lineno = end_lineno;
}

static TyObject *
tokenizeriter_next(TyObject *op)
{
    tokenizeriterobject *it = (tokenizeriterobject*)op;
    TyObject* result = NULL;

    Ty_BEGIN_CRITICAL_SECTION(it);

    struct token token;
    _PyToken_Init(&token);

    int type = _PyTokenizer_Get(it->tok, &token);
    if (type == ERRORTOKEN) {
        if(!TyErr_Occurred()) {
            _tokenizer_error(it);
            assert(TyErr_Occurred());
        }
        goto exit;
    }
    if (it->done || type == ERRORTOKEN) {
        TyErr_SetString(TyExc_StopIteration, "EOF");
        it->done = 1;
        goto exit;
    }
    TyObject *str = NULL;
    if (token.start == NULL || token.end == NULL) {
        str = Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
    }
    else {
        str = TyUnicode_FromStringAndSize(token.start, token.end - token.start);
    }
    if (str == NULL) {
        goto exit;
    }

    int is_trailing_token = 0;
    if (type == ENDMARKER || (type == DEDENT && it->tok->done == E_EOF)) {
        is_trailing_token = 1;
    }

    const char *line_start = ISSTRINGLIT(type) ? it->tok->multi_line_start : it->tok->line_start;
    TyObject* line = NULL;
    int line_changed = 1;
    if (it->tok->tok_extra_tokens && is_trailing_token) {
        line = Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
    } else {
        Ty_ssize_t size = it->tok->inp - line_start;
        if (size >= 1 && it->tok->implicit_newline) {
            size -= 1;
        }

        line = _get_current_line(it, line_start, size, &line_changed);
    }
    if (line == NULL) {
        Ty_DECREF(str);
        goto exit;
    }

    Ty_ssize_t lineno = ISSTRINGLIT(type) ? it->tok->first_lineno : it->tok->lineno;
    Ty_ssize_t end_lineno = it->tok->lineno;
    Ty_ssize_t col_offset = -1;
    Ty_ssize_t end_col_offset = -1;
    _get_col_offsets(it, token, line_start, line, line_changed,
                     lineno, end_lineno, &col_offset, &end_col_offset);

    if (it->tok->tok_extra_tokens) {
        if (is_trailing_token) {
            lineno = end_lineno = lineno + 1;
            col_offset = end_col_offset = 0;
        }
        // Necessary adjustments to match the original Python tokenize
        // implementation
        if (type > DEDENT && type < OP) {
            type = OP;
        }
        else if (type == NEWLINE) {
            Ty_DECREF(str);
            if (!it->tok->implicit_newline) {
                if (it->tok->start[0] == '\r') {
                    str = TyUnicode_FromString("\r\n");
                } else {
                    str = TyUnicode_FromString("\n");
                }
            }
            end_col_offset++;
        }
        else if (type == NL) {
            if (it->tok->implicit_newline) {
                Ty_DECREF(str);
                str = Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
            }
        }

        if (str == NULL) {
            Ty_DECREF(line);
            goto exit;
        }
    }

    result = Ty_BuildValue("(iN(nn)(nn)O)", type, str, lineno, col_offset, end_lineno, end_col_offset, line);
exit:
    _PyToken_Free(&token);
    if (type == ENDMARKER) {
        it->done = 1;
    }

    Ty_END_CRITICAL_SECTION();
    return result;
}

static void
tokenizeriter_dealloc(TyObject *op)
{
    tokenizeriterobject *it = (tokenizeriterobject*)op;
    TyTypeObject *tp = Ty_TYPE(it);
    Ty_XDECREF(it->last_line);
    _PyTokenizer_Free(it->tok);
    tp->tp_free(it);
    Ty_DECREF(tp);
}

static TyType_Slot tokenizeriter_slots[] = {
    {Ty_tp_new, tokenizeriter_new},
    {Ty_tp_dealloc, tokenizeriter_dealloc},
    {Ty_tp_getattro, PyObject_GenericGetAttr},
    {Ty_tp_iter, PyObject_SelfIter},
    {Ty_tp_iternext, tokenizeriter_next},
    {0, NULL},
};

static TyType_Spec tokenizeriter_spec = {
    .name = "_tokenize.TokenizerIter",
    .basicsize = sizeof(tokenizeriterobject),
    .flags = (Ty_TPFLAGS_DEFAULT | Ty_TPFLAGS_IMMUTABLETYPE),
    .slots = tokenizeriter_slots,
};

static int
tokenizemodule_exec(TyObject *m)
{
    tokenize_state *state = get_tokenize_state(m);
    if (state == NULL) {
        return -1;
    }

    state->TokenizerIter = (TyTypeObject *)TyType_FromModuleAndSpec(m, &tokenizeriter_spec, NULL);
    if (state->TokenizerIter == NULL) {
        return -1;
    }
    if (TyModule_AddType(m, state->TokenizerIter) < 0) {
        return -1;
    }

    return 0;
}

static TyMethodDef tokenize_methods[] = {
    {NULL, NULL, 0, NULL} /* Sentinel */
};

static PyModuleDef_Slot tokenizemodule_slots[] = {
    {Ty_mod_exec, tokenizemodule_exec},
    {Ty_mod_multiple_interpreters, Ty_MOD_PER_INTERPRETER_GIL_SUPPORTED},
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL}
};

static int
tokenizemodule_traverse(TyObject *m, visitproc visit, void *arg)
{
    tokenize_state *state = get_tokenize_state(m);
    Ty_VISIT(state->TokenizerIter);
    return 0;
}

static int
tokenizemodule_clear(TyObject *m)
{
    tokenize_state *state = get_tokenize_state(m);
    Ty_CLEAR(state->TokenizerIter);
    return 0;
}

static void
tokenizemodule_free(void *m)
{
    tokenizemodule_clear((TyObject *)m);
}

static struct TyModuleDef _tokenizemodule = {
    PyModuleDef_HEAD_INIT,
    .m_name = "_tokenize",
    .m_size = sizeof(tokenize_state),
    .m_slots = tokenizemodule_slots,
    .m_methods = tokenize_methods,
    .m_traverse = tokenizemodule_traverse,
    .m_clear = tokenizemodule_clear,
    .m_free = tokenizemodule_free,
};

PyMODINIT_FUNC
PyInit__tokenize(void)
{
    return PyModuleDef_Init(&_tokenizemodule);
}
