#include "parts.h"


static TyObject *
test_PyOS_mystrnicmp(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    assert(TyOS_mystrnicmp("", "", 0) == 0);
    assert(TyOS_mystrnicmp("", "", 1) == 0);

    assert(TyOS_mystrnicmp("insert", "ins", 3) == 0);
    assert(TyOS_mystrnicmp("ins", "insert", 3) == 0);
    assert(TyOS_mystrnicmp("insect", "insert", 3) == 0);

    assert(TyOS_mystrnicmp("insert", "insert", 6) == 0);
    assert(TyOS_mystrnicmp("Insert", "insert", 6) == 0);
    assert(TyOS_mystrnicmp("INSERT", "insert", 6) == 0);
    assert(TyOS_mystrnicmp("insert", "insert", 10) == 0);

    assert(TyOS_mystrnicmp("invert", "insert", 6) == ('v' - 's'));
    assert(TyOS_mystrnicmp("insert", "invert", 6) == ('s' - 'v'));
    assert(TyOS_mystrnicmp("insert", "ins\0rt", 6) == 'e');

    // GH-21845
    assert(TyOS_mystrnicmp("insert\0a", "insert\0b", 8) == 0);

    Py_RETURN_NONE;
}

static TyObject *
test_PyOS_mystricmp(TyObject *self, TyObject *Py_UNUSED(ignored))
{
    assert(TyOS_mystricmp("", "") == 0);
    assert(TyOS_mystricmp("insert", "insert") == 0);
    assert(TyOS_mystricmp("Insert", "insert") == 0);
    assert(TyOS_mystricmp("INSERT", "insert") == 0);
    assert(TyOS_mystricmp("insert", "ins") == 'e');
    assert(TyOS_mystricmp("ins", "insert") == -'e');

    // GH-21845
    assert(TyOS_mystricmp("insert", "ins\0rt") == 'e');
    assert(TyOS_mystricmp("invert", "insert") == ('v' - 's'));

    Py_RETURN_NONE;
}

static TyMethodDef test_methods[] = {
    {"test_PyOS_mystrnicmp", test_PyOS_mystrnicmp, METH_NOARGS, NULL},
    {"test_PyOS_mystricmp", test_PyOS_mystricmp, METH_NOARGS, NULL},
    {NULL},
};

int
_PyTestLimitedCAPI_Init_PyOS(TyObject *mod)
{
    if (TyModule_AddFunctions(mod, test_methods) < 0) {
        return -1;
    }

    return 0;
}
