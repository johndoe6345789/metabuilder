#include <Python.h>
#include <errcode.h>

#include "pycore_pyerrors.h"      // _TyErr_ProgramDecodedTextObject()
#include "lexer/state.h"
#include "lexer/lexer.h"
#include "pegen.h"

// TOKENIZER ERRORS

void
_TyPegen_raise_tokenizer_init_error(TyObject *filename)
{
    if (!(TyErr_ExceptionMatches(TyExc_LookupError)
          || TyErr_ExceptionMatches(TyExc_SyntaxError)
          || TyErr_ExceptionMatches(TyExc_ValueError)
          || TyErr_ExceptionMatches(TyExc_UnicodeDecodeError))) {
        return;
    }
    TyObject *errstr = NULL;
    TyObject *tuple = NULL;
    TyObject *type;
    TyObject *value;
    TyObject *tback;
    TyErr_Fetch(&type, &value, &tback);
    errstr = PyObject_Str(value);
    if (!errstr) {
        goto error;
    }

    TyObject *tmp = Ty_BuildValue("(OiiO)", filename, 0, -1, Ty_None);
    if (!tmp) {
        goto error;
    }

    tuple = TyTuple_Pack(2, errstr, tmp);
    Ty_DECREF(tmp);
    if (!value) {
        goto error;
    }
    TyErr_SetObject(TyExc_SyntaxError, tuple);

error:
    Ty_XDECREF(type);
    Ty_XDECREF(value);
    Ty_XDECREF(tback);
    Ty_XDECREF(errstr);
    Ty_XDECREF(tuple);
}

static inline void
raise_unclosed_parentheses_error(Parser *p) {
       int error_lineno = p->tok->parenlinenostack[p->tok->level-1];
       int error_col = p->tok->parencolstack[p->tok->level-1];
       RAISE_ERROR_KNOWN_LOCATION(p, TyExc_SyntaxError,
                                  error_lineno, error_col, error_lineno, -1,
                                  "'%c' was never closed",
                                  p->tok->parenstack[p->tok->level-1]);
}

int
_Pypegen_tokenizer_error(Parser *p)
{
    if (TyErr_Occurred()) {
        return -1;
    }

    const char *msg = NULL;
    TyObject* errtype = TyExc_SyntaxError;
    Ty_ssize_t col_offset = -1;
    p->error_indicator = 1;
    switch (p->tok->done) {
        case E_TOKEN:
            msg = "invalid token";
            break;
        case E_EOF:
            if (p->tok->level) {
                raise_unclosed_parentheses_error(p);
            } else {
                RAISE_SYNTAX_ERROR("unexpected EOF while parsing");
            }
            return -1;
        case E_DEDENT:
            RAISE_INDENTATION_ERROR("unindent does not match any outer indentation level");
            return -1;
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
            col_offset = p->tok->cur - p->tok->buf - 1;
            msg = "unexpected character after line continuation character";
            break;
        }
        case E_COLUMNOVERFLOW:
            TyErr_SetString(TyExc_OverflowError,
                    "Parser column offset overflow - source line is too big");
            return -1;
        default:
            msg = "unknown parsing error";
    }

    RAISE_ERROR_KNOWN_LOCATION(p, errtype, p->tok->lineno,
                               col_offset >= 0 ? col_offset : 0,
                               p->tok->lineno, -1, msg);
    return -1;
}

int
_Pypegen_raise_decode_error(Parser *p)
{
    assert(TyErr_Occurred());
    const char *errtype = NULL;
    if (TyErr_ExceptionMatches(TyExc_UnicodeError)) {
        errtype = "unicode error";
    }
    else if (TyErr_ExceptionMatches(TyExc_ValueError)) {
        errtype = "value error";
    }
    if (errtype) {
        TyObject *type;
        TyObject *value;
        TyObject *tback;
        TyObject *errstr;
        TyErr_Fetch(&type, &value, &tback);
        errstr = PyObject_Str(value);
        if (errstr) {
            RAISE_SYNTAX_ERROR("(%s) %U", errtype, errstr);
            Ty_DECREF(errstr);
        }
        else {
            TyErr_Clear();
            RAISE_SYNTAX_ERROR("(%s) unknown error", errtype);
        }
        Ty_XDECREF(type);
        Ty_XDECREF(value);
        Ty_XDECREF(tback);
    }

    return -1;
}

static int
_TyPegen_tokenize_full_source_to_check_for_errors(Parser *p) {
    // Tokenize the whole input to see if there are any tokenization
    // errors such as mismatching parentheses. These will get priority
    // over generic syntax errors only if the line number of the error is
    // before the one that we had for the generic error.

    // We don't want to tokenize to the end for interactive input
    if (p->tok->prompt != NULL) {
        return 0;
    }

    TyObject *type, *value, *traceback;
    TyErr_Fetch(&type, &value, &traceback);

    Token *current_token = p->known_err_token != NULL ? p->known_err_token : p->tokens[p->fill - 1];
    Ty_ssize_t current_err_line = current_token->lineno;

    int ret = 0;
    struct token new_token;
    _PyToken_Init(&new_token);

    for (;;) {
        switch (_PyTokenizer_Get(p->tok, &new_token)) {
            case ERRORTOKEN:
                if (TyErr_Occurred()) {
                    ret = -1;
                    goto exit;
                }
                if (p->tok->level != 0) {
                    int error_lineno = p->tok->parenlinenostack[p->tok->level-1];
                    if (current_err_line > error_lineno) {
                        raise_unclosed_parentheses_error(p);
                        ret = -1;
                        goto exit;
                    }
                }
                break;
            case ENDMARKER:
                break;
            default:
                continue;
        }
        break;
    }


exit:
    _PyToken_Free(&new_token);
    // If we're in an f-string, we want the syntax error in the expression part
    // to propagate, so that tokenizer errors (like expecting '}') that happen afterwards
    // do not swallow it.
    if (TyErr_Occurred() && p->tok->tok_mode_stack_index <= 0) {
        Ty_XDECREF(value);
        Ty_XDECREF(type);
        Ty_XDECREF(traceback);
    } else {
        TyErr_Restore(type, value, traceback);
    }
    return ret;
}

// PARSER ERRORS

void *
_TyPegen_raise_error(Parser *p, TyObject *errtype, int use_mark, const char *errmsg, ...)
{
    // Bail out if we already have an error set.
    if (p->error_indicator && TyErr_Occurred()) {
        return NULL;
    }
    if (p->fill == 0) {
        va_list va;
        va_start(va, errmsg);
        _TyPegen_raise_error_known_location(p, errtype, 0, 0, 0, -1, errmsg, va);
        va_end(va);
        return NULL;
    }
    if (use_mark && p->mark == p->fill && _TyPegen_fill_token(p) < 0) {
        p->error_indicator = 1;
        return NULL;
    }
    Token *t = p->known_err_token != NULL
                   ? p->known_err_token
                   : p->tokens[use_mark ? p->mark : p->fill - 1];
    Ty_ssize_t col_offset;
    Ty_ssize_t end_col_offset = -1;
    if (t->col_offset == -1) {
        if (p->tok->cur == p->tok->buf) {
            col_offset = 0;
        } else {
            const char* start = p->tok->buf  ? p->tok->line_start : p->tok->buf;
            col_offset = Ty_SAFE_DOWNCAST(p->tok->cur - start, intptr_t, int);
        }
    } else {
        col_offset = t->col_offset + 1;
    }

    if (t->end_col_offset != -1) {
        end_col_offset = t->end_col_offset + 1;
    }

    va_list va;
    va_start(va, errmsg);
    _TyPegen_raise_error_known_location(p, errtype, t->lineno, col_offset, t->end_lineno, end_col_offset, errmsg, va);
    va_end(va);

    return NULL;
}

static TyObject *
get_error_line_from_tokenizer_buffers(Parser *p, Ty_ssize_t lineno)
{
    /* If the file descriptor is interactive, the source lines of the current
     * (multi-line) statement are stored in p->tok->interactive_src_start.
     * If not, we're parsing from a string, which means that the whole source
     * is stored in p->tok->str. */
    assert((p->tok->fp == NULL && p->tok->str != NULL) || p->tok->fp != NULL);

    char *cur_line = p->tok->fp_interactive ? p->tok->interactive_src_start : p->tok->str;
    if (cur_line == NULL) {
        assert(p->tok->fp_interactive);
        // We can reach this point if the tokenizer buffers for interactive source have not been
        // initialized because we failed to decode the original source with the given locale.
        return Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
    }

    Ty_ssize_t relative_lineno = p->starting_lineno ? lineno - p->starting_lineno + 1 : lineno;
    const char* buf_end = p->tok->fp_interactive ? p->tok->interactive_src_end : p->tok->inp;

    if (buf_end < cur_line) {
        buf_end = cur_line + strlen(cur_line);
    }

    for (int i = 0; i < relative_lineno - 1; i++) {
        char *new_line = strchr(cur_line, '\n');
        // The assert is here for debug builds but the conditional that
        // follows is there so in release builds we do not crash at the cost
        // to report a potentially wrong line.
        assert(new_line != NULL && new_line + 1 < buf_end);
        if (new_line == NULL || new_line + 1 > buf_end) {
            break;
        }
        cur_line = new_line + 1;
    }

    char *next_newline;
    if ((next_newline = strchr(cur_line, '\n')) == NULL) { // This is the last line
        next_newline = cur_line + strlen(cur_line);
    }
    return TyUnicode_DecodeUTF8(cur_line, next_newline - cur_line, "replace");
}

void *
_TyPegen_raise_error_known_location(Parser *p, TyObject *errtype,
                                    Ty_ssize_t lineno, Ty_ssize_t col_offset,
                                    Ty_ssize_t end_lineno, Ty_ssize_t end_col_offset,
                                    const char *errmsg, va_list va)
{
    // Bail out if we already have an error set.
    if (p->error_indicator && TyErr_Occurred()) {
        return NULL;
    }
    TyObject *value = NULL;
    TyObject *errstr = NULL;
    TyObject *error_line = NULL;
    TyObject *tmp = NULL;
    p->error_indicator = 1;

    if (end_lineno == CURRENT_POS) {
        end_lineno = p->tok->lineno;
    }
    if (end_col_offset == CURRENT_POS) {
        end_col_offset = p->tok->cur - p->tok->line_start;
    }

    errstr = TyUnicode_FromFormatV(errmsg, va);
    if (!errstr) {
        goto error;
    }

    if (p->tok->fp_interactive && p->tok->interactive_src_start != NULL) {
        error_line = get_error_line_from_tokenizer_buffers(p, lineno);
    }
    else if (p->start_rule == Ty_file_input) {
        error_line = _TyErr_ProgramDecodedTextObject(p->tok->filename,
                                                     (int) lineno, p->tok->encoding);
    }

    if (!error_line) {
        /* TyErr_ProgramTextObject was not called or returned NULL. If it was not called,
           then we need to find the error line from some other source, because
           p->start_rule != Ty_file_input. If it returned NULL, then it either unexpectedly
           failed or we're parsing from a string or the REPL. There's a third edge case where
           we're actually parsing from a file, which has an E_EOF SyntaxError and in that case
           `TyErr_ProgramTextObject` fails because lineno points to last_file_line + 1, which
           does not physically exist */
        assert(p->tok->fp == NULL || p->tok->fp == stdin || p->tok->done == E_EOF);

        if (p->tok->lineno <= lineno && p->tok->inp > p->tok->buf) {
            Ty_ssize_t size = p->tok->inp - p->tok->line_start;
            error_line = TyUnicode_DecodeUTF8(p->tok->line_start, size, "replace");
        }
        else if (p->tok->fp == NULL || p->tok->fp == stdin) {
            error_line = get_error_line_from_tokenizer_buffers(p, lineno);
        }
        else {
            error_line = Ty_GetConstant(Ty_CONSTANT_EMPTY_STR);
        }
        if (!error_line) {
            goto error;
        }
    }

    Ty_ssize_t col_number = col_offset;
    Ty_ssize_t end_col_number = end_col_offset;

    col_number = _TyPegen_byte_offset_to_character_offset(error_line, col_offset);
    if (col_number < 0) {
        goto error;
    }

    if (end_col_offset > 0) {
        end_col_number = _TyPegen_byte_offset_to_character_offset(error_line, end_col_offset);
        if (end_col_number < 0) {
            goto error;
        }
    }

    tmp = Ty_BuildValue("(OnnNnn)", p->tok->filename, lineno, col_number, error_line, end_lineno, end_col_number);
    if (!tmp) {
        goto error;
    }
    value = TyTuple_Pack(2, errstr, tmp);
    Ty_DECREF(tmp);
    if (!value) {
        goto error;
    }
    TyErr_SetObject(errtype, value);

    Ty_DECREF(errstr);
    Ty_DECREF(value);
    return NULL;

error:
    Ty_XDECREF(errstr);
    Ty_XDECREF(error_line);
    return NULL;
}

void
_Pypegen_set_syntax_error(Parser* p, Token* last_token) {
    // Existing syntax error
    if (TyErr_Occurred()) {
        // Prioritize tokenizer errors to custom syntax errors raised
        // on the second phase only if the errors come from the parser.
        int is_tok_ok = (p->tok->done == E_DONE || p->tok->done == E_OK);
        if (is_tok_ok && TyErr_ExceptionMatches(TyExc_SyntaxError)) {
            _TyPegen_tokenize_full_source_to_check_for_errors(p);
        }
        // Propagate the existing syntax error.
        return;
    }
    // Initialization error
    if (p->fill == 0) {
        RAISE_SYNTAX_ERROR("error at start before reading any input");
    }
    // Parser encountered EOF (End of File) unexpectedtly
    if (last_token->type == ERRORTOKEN && p->tok->done == E_EOF) {
        if (p->tok->level) {
            raise_unclosed_parentheses_error(p);
        } else {
            RAISE_SYNTAX_ERROR("unexpected EOF while parsing");
        }
        return;
    }
    // Indentation error in the tokenizer
    if (last_token->type == INDENT || last_token->type == DEDENT) {
        RAISE_INDENTATION_ERROR(last_token->type == INDENT ? "unexpected indent" : "unexpected unindent");
        return;
    }
    // Unknown error (generic case)

    // Use the last token we found on the first pass to avoid reporting
    // incorrect locations for generic syntax errors just because we reached
    // further away when trying to find specific syntax errors in the second
    // pass.
    RAISE_SYNTAX_ERROR_KNOWN_LOCATION(last_token, "invalid syntax");
    // _TyPegen_tokenize_full_source_to_check_for_errors will override the existing
    // generic SyntaxError we just raised if errors are found.
    _TyPegen_tokenize_full_source_to_check_for_errors(p);
}

void
_Pypegen_stack_overflow(Parser *p)
{
    p->error_indicator = 1;
    TyErr_SetString(TyExc_MemoryError,
        "Parser stack overflowed - Python source too complex to parse");
}
