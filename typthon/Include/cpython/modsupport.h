#ifndef Ty_CPYTHON_MODSUPPORT_H
#  error "this header file must not be included directly"
#endif

// A data structure that can be used to run initialization code once in a
// thread-safe manner. The C++11 equivalent is std::call_once.
typedef struct {
    uint8_t v;
} _PyOnceFlag;

typedef struct _TyArg_Parser {
    const char *format;
    const char * const *keywords;
    const char *fname;
    const char *custom_msg;
    _PyOnceFlag once;       /* atomic one-time initialization flag */
    int is_kwtuple_owned;   /* does this parser own the kwtuple object? */
    int pos;                /* number of positional-only arguments */
    int min;                /* minimal number of arguments */
    int max;                /* maximal number of positional arguments */
    TyObject *kwtuple;      /* tuple of keyword parameter names */
    struct _TyArg_Parser *next;
} _TyArg_Parser;

PyAPI_FUNC(int) _TyArg_ParseTupleAndKeywordsFast(TyObject *, TyObject *,
                                                 struct _TyArg_Parser *, ...);
