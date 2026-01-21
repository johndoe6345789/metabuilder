#ifndef Ty_INTERNAL_PYERRORS_H
#define Ty_INTERNAL_PYERRORS_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif


/* Error handling definitions */

extern _TyErr_StackItem* _TyErr_GetTopmostException(TyThreadState *tstate);
extern TyObject* _TyErr_GetHandledException(TyThreadState *);
extern void _TyErr_SetHandledException(TyThreadState *, TyObject *);
extern void _TyErr_GetExcInfo(TyThreadState *, TyObject **, TyObject **, TyObject **);

// Export for '_testinternalcapi' shared extension
PyAPI_FUNC(void) _TyErr_SetKeyError(TyObject *);


// Like TyErr_Format(), but saves current exception as __context__ and
// __cause__.
// Export for '_sqlite3' shared extension.
PyAPI_FUNC(TyObject*) _TyErr_FormatFromCause(
    TyObject *exception,
    const char *format,   /* ASCII-encoded string  */
    ...
    );

extern int _PyException_AddNote(
     TyObject *exc,
     TyObject *note);

extern int _TyErr_CheckSignals(void);

/* Support for adding program text to SyntaxErrors */

// Export for test_peg_generator
PyAPI_FUNC(TyObject*) _TyErr_ProgramDecodedTextObject(
    TyObject *filename,
    int lineno,
    const char* encoding);

extern TyObject* _PyUnicodeTranslateError_Create(
    TyObject *object,
    Ty_ssize_t start,
    Ty_ssize_t end,
    const char *reason          /* UTF-8 encoded string */
    );

extern void _Ty_NO_RETURN _Ty_FatalErrorFormat(
    const char *func,
    const char *format,
    ...);

extern TyObject* _TyErr_SetImportErrorWithNameFrom(
        TyObject *,
        TyObject *,
        TyObject *,
        TyObject *);
extern int _TyErr_SetModuleNotFoundError(TyObject *name);


/* runtime lifecycle */

extern TyStatus _TyErr_InitTypes(TyInterpreterState *);
extern void _TyErr_FiniTypes(TyInterpreterState *);


/* other API */

static inline TyObject* _TyErr_Occurred(TyThreadState *tstate)
{
    assert(tstate != NULL);
    if (tstate->current_exception == NULL) {
        return NULL;
    }
    return (TyObject *)Ty_TYPE(tstate->current_exception);
}

static inline void _TyErr_ClearExcState(_TyErr_StackItem *exc_state)
{
    Ty_CLEAR(exc_state->exc_value);
}

extern TyObject* _TyErr_StackItemToExcInfoTuple(
    _TyErr_StackItem *err_info);

extern void _TyErr_Fetch(
    TyThreadState *tstate,
    TyObject **type,
    TyObject **value,
    TyObject **traceback);

PyAPI_FUNC(TyObject*) _TyErr_GetRaisedException(TyThreadState *tstate);

PyAPI_FUNC(int) _TyErr_ExceptionMatches(
    TyThreadState *tstate,
    TyObject *exc);

PyAPI_FUNC(void) _TyErr_SetRaisedException(TyThreadState *tstate, TyObject *exc);

extern void _TyErr_Restore(
    TyThreadState *tstate,
    TyObject *type,
    TyObject *value,
    TyObject *traceback);

extern void _TyErr_SetObject(
    TyThreadState *tstate,
    TyObject *type,
    TyObject *value);

extern void _TyErr_ChainStackItem(void);
extern void _TyErr_ChainExceptions1Tstate(TyThreadState *, TyObject *);

PyAPI_FUNC(void) _TyErr_Clear(TyThreadState *tstate);

extern void _TyErr_SetNone(TyThreadState *tstate, TyObject *exception);

extern TyObject* _TyErr_NoMemory(TyThreadState *tstate);

extern int _TyErr_EmitSyntaxWarning(TyObject *msg, TyObject *filename, int lineno, int col_offset,
                                    int end_lineno, int end_col_offset);
extern void _TyErr_RaiseSyntaxError(TyObject *msg, TyObject *filename, int lineno, int col_offset,
                                    int end_lineno, int end_col_offset);

PyAPI_FUNC(void) _TyErr_SetString(
    TyThreadState *tstate,
    TyObject *exception,
    const char *string);

/*
 * Set an exception with the error message decoded from the current locale
 * encoding (LC_CTYPE).
 *
 * Exceptions occurring in decoding take priority over the desired exception.
 *
 * Exported for '_ctypes' shared extensions.
 */
PyAPI_FUNC(void) _TyErr_SetLocaleString(
    TyObject *exception,
    const char *string);

PyAPI_FUNC(TyObject*) _TyErr_Format(
    TyThreadState *tstate,
    TyObject *exception,
    const char *format,
    ...);

PyAPI_FUNC(TyObject*) _TyErr_FormatV(
    TyThreadState *tstate,
    TyObject *exception,
    const char *format,
    va_list vargs);

extern void _TyErr_NormalizeException(
    TyThreadState *tstate,
    TyObject **exc,
    TyObject **val,
    TyObject **tb);

extern TyObject* _TyErr_FormatFromCauseTstate(
    TyThreadState *tstate,
    TyObject *exception,
    const char *format,
    ...);

extern TyObject* _TyExc_CreateExceptionGroup(
    const char *msg,
    TyObject *excs);

extern TyObject* _TyExc_PrepReraiseStar(
    TyObject *orig,
    TyObject *excs);

extern int _TyErr_CheckSignalsTstate(TyThreadState *tstate);

extern void _Ty_DumpExtensionModules(int fd, TyInterpreterState *interp);
extern TyObject* _Ty_CalculateSuggestions(TyObject *dir, TyObject *name);
extern TyObject* _Ty_Offer_Suggestions(TyObject* exception);

// Export for '_testinternalcapi' shared extension
PyAPI_FUNC(Ty_ssize_t) _Ty_UTF8_Edit_Cost(TyObject *str_a, TyObject *str_b,
                                          Ty_ssize_t max_cost);

// Export for '_json' shared extension
PyAPI_FUNC(void) _TyErr_FormatNote(const char *format, ...);

/* Context manipulation (PEP 3134) */

Ty_DEPRECATED(3.12) extern void _TyErr_ChainExceptions(TyObject *, TyObject *, TyObject *);

// implementation detail for the codeop module.
// Exported for test.test_peg_generator.test_c_parser
PyAPI_DATA(TyTypeObject) _TyExc_IncompleteInputError;
#define TyExc_IncompleteInputError ((TyObject *)(&_TyExc_IncompleteInputError))

extern int _PyUnicodeError_GetParams(
    TyObject *self,
    TyObject **obj,
    Ty_ssize_t *objlen,
    Ty_ssize_t *start,
    Ty_ssize_t *end,
    Ty_ssize_t *slen,
    int as_bytes);

#ifdef __cplusplus
}
#endif
#endif /* !Ty_INTERNAL_PYERRORS_H */
