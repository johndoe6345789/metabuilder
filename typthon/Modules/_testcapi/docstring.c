#include "parts.h"


TyDoc_STRVAR(docstring_empty,
""
);

TyDoc_STRVAR(docstring_no_signature,
"This docstring has no signature."
);

TyDoc_STRVAR(docstring_with_invalid_signature,
"docstring_with_invalid_signature($module, /, boo)\n"
"\n"
"This docstring has an invalid signature."
);

TyDoc_STRVAR(docstring_with_invalid_signature2,
"docstring_with_invalid_signature2($module, /, boo)\n"
"\n"
"--\n"
"\n"
"This docstring also has an invalid signature."
);

TyDoc_STRVAR(docstring_with_signature,
"docstring_with_signature($module, /, sig)\n"
"--\n"
"\n"
"This docstring has a valid signature."
);

TyDoc_STRVAR(docstring_with_signature_but_no_doc,
"docstring_with_signature_but_no_doc($module, /, sig)\n"
"--\n"
"\n"
);

TyDoc_STRVAR(docstring_with_signature_and_extra_newlines,
"docstring_with_signature_and_extra_newlines($module, /, parameter)\n"
"--\n"
"\n"
"\n"
"This docstring has a valid signature and some extra newlines."
);

TyDoc_STRVAR(docstring_with_signature_with_defaults,
"docstring_with_signature_with_defaults(module, s='avocado',\n"
"        b=b'bytes', d=3.14, i=35, n=None, t=True, f=False,\n"
"        local=the_number_three, sys=sys.maxsize,\n"
"        exp=sys.maxsize - 1)\n"
"--\n"
"\n"
"\n"
"\n"
"This docstring has a valid signature with parameters,\n"
"and the parameters take defaults of varying types."
);

/* This is here to provide a docstring for test_descr. */
static TyObject *
test_with_docstring(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    Py_RETURN_NONE;
}

static TyMethodDef test_methods[] = {
    {"docstring_empty",
        test_with_docstring, METH_VARARGS,
        docstring_empty},
    {"docstring_no_signature",
        test_with_docstring, METH_VARARGS,
        docstring_no_signature},
    {"docstring_no_signature_noargs",
        test_with_docstring, METH_NOARGS,
        docstring_no_signature},
    {"docstring_no_signature_o",
        test_with_docstring, METH_O,
        docstring_no_signature},
    {"docstring_with_invalid_signature",
        test_with_docstring, METH_VARARGS,
        docstring_with_invalid_signature},
    {"docstring_with_invalid_signature2",
        test_with_docstring, METH_VARARGS,
        docstring_with_invalid_signature2},
    {"docstring_with_signature",
        test_with_docstring, METH_VARARGS,
        docstring_with_signature},
    {"docstring_with_signature_and_extra_newlines",
        test_with_docstring, METH_VARARGS,
        docstring_with_signature_and_extra_newlines},
    {"docstring_with_signature_but_no_doc",
        test_with_docstring, METH_VARARGS,
        docstring_with_signature_but_no_doc},
    {"docstring_with_signature_with_defaults",
        test_with_docstring, METH_VARARGS,
        docstring_with_signature_with_defaults},
    {"no_docstring",
        test_with_docstring, METH_VARARGS},
    {"test_with_docstring",
        test_with_docstring,              METH_VARARGS,
        TyDoc_STR("This is a pretty normal docstring.")},
    {"func_with_unrepresentable_signature",
        test_with_docstring, METH_VARARGS,
        TyDoc_STR(
            "func_with_unrepresentable_signature($module, /, a, b=<x>)\n"
            "--\n\n"
            "This docstring has a signature with unrepresentable default."
        )},
    {NULL},
};

static TyMethodDef DocStringNoSignatureTest_methods[] = {
    {"meth_noargs",
        test_with_docstring, METH_NOARGS,
        docstring_no_signature},
    {"meth_o",
        test_with_docstring, METH_O,
        docstring_no_signature},
    {"meth_noargs_class",
        test_with_docstring, METH_NOARGS|METH_CLASS,
        docstring_no_signature},
    {"meth_o_class",
        test_with_docstring, METH_O|METH_CLASS,
        docstring_no_signature},
    {"meth_noargs_static",
        test_with_docstring, METH_NOARGS|METH_STATIC,
        docstring_no_signature},
    {"meth_o_static",
        test_with_docstring, METH_O|METH_STATIC,
        docstring_no_signature},
    {"meth_noargs_coexist",
        test_with_docstring, METH_NOARGS|METH_COEXIST,
        docstring_no_signature},
    {"meth_o_coexist",
        test_with_docstring, METH_O|METH_COEXIST,
        docstring_no_signature},
    {NULL},
};

static TyTypeObject DocStringNoSignatureTest = {
    TyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "_testcapi.DocStringNoSignatureTest",
    .tp_basicsize = sizeof(TyObject),
    .tp_flags = Ty_TPFLAGS_DEFAULT,
    .tp_methods = DocStringNoSignatureTest_methods,
    .tp_new = TyType_GenericNew,
};

static TyMethodDef DocStringUnrepresentableSignatureTest_methods[] = {
    {"meth",
        test_with_docstring, METH_VARARGS,
        TyDoc_STR(
            "meth($self, /, a, b=<x>)\n"
            "--\n\n"
            "This docstring has a signature with unrepresentable default."
        )},
    {"classmeth",
        test_with_docstring, METH_VARARGS|METH_CLASS,
        TyDoc_STR(
            "classmeth($type, /, a, b=<x>)\n"
            "--\n\n"
            "This docstring has a signature with unrepresentable default."
        )},
    {"staticmeth",
        test_with_docstring, METH_VARARGS|METH_STATIC,
        TyDoc_STR(
            "staticmeth(a, b=<x>)\n"
            "--\n\n"
            "This docstring has a signature with unrepresentable default."
        )},
    {"with_default",
        test_with_docstring, METH_VARARGS,
        TyDoc_STR(
            "with_default($self, /, x=ONE)\n"
            "--\n\n"
            "This instance method has a default parameter value from the module scope."
        )},
    {NULL},
};

static TyTypeObject DocStringUnrepresentableSignatureTest = {
    TyVarObject_HEAD_INIT(NULL, 0)
    .tp_name = "_testcapi.DocStringUnrepresentableSignatureTest",
    .tp_basicsize = sizeof(TyObject),
    .tp_flags = Ty_TPFLAGS_DEFAULT,
    .tp_methods = DocStringUnrepresentableSignatureTest_methods,
    .tp_new = TyType_GenericNew,
};

int
_PyTestCapi_Init_Docstring(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }
    if (TyModule_AddType(mod, &DocStringNoSignatureTest) < 0) {
        return -1;
    }
    if (TyModule_AddType(mod, &DocStringUnrepresentableSignatureTest) < 0) {
        return -1;
    }
    if (TyModule_AddObject(mod, "ONE", TyLong_FromLong(1)) < 0) {
        return -1;
    }
    return 0;
}
