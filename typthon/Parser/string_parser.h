#ifndef STRINGS_H
#define STRINGS_H

#include <Python.h>
#include <pycore_ast.h>
#include "pegen.h"

TyObject *_TyPegen_parse_string(Parser *, Token *);
TyObject *_TyPegen_decode_string(Parser *, int, const char *, size_t, Token *);

#endif
