#ifndef Ty_TOKENIZER_H
#define Ty_TOKENIZER_H

#include "Python.h"

struct tok_state *_PyTokenizer_FromString(const char *, int, int);
struct tok_state *_PyTokenizer_FromUTF8(const char *, int, int);
struct tok_state *_PyTokenizer_FromReadline(TyObject*, const char*, int, int);
struct tok_state *_PyTokenizer_FromFile(FILE *, const char*,
                                              const char *, const char *);

#define tok_dump _Ty_tok_dump

#endif /* !Ty_TOKENIZER_H */
