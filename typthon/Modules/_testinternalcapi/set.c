#include "parts.h"
#include "../_testcapi/util.h"  // NULLABLE, RETURN_INT

#include "pycore_critical_section.h"
#include "pycore_setobject.h"


static TyObject *
set_update(TyObject *self, TyObject *args)
{
    TyObject *set, *iterable;
    if (!TyArg_ParseTuple(args, "OO", &set, &iterable)) {
        return NULL;
    }
    NULLABLE(set);
    NULLABLE(iterable);
    RETURN_INT(_TySet_Update(set, iterable));
}

static TyObject *
set_next_entry(TyObject *self, TyObject *args)
{
    int rc;
    Ty_ssize_t pos;
    Ty_hash_t hash = (Ty_hash_t)UNINITIALIZED_SIZE;
    TyObject *set, *item = UNINITIALIZED_PTR;
    if (!TyArg_ParseTuple(args, "On", &set, &pos)) {
        return NULL;
    }
    NULLABLE(set);
    Ty_BEGIN_CRITICAL_SECTION(set);
    rc = _TySet_NextEntryRef(set, &pos, &item, &hash);
    Ty_END_CRITICAL_SECTION();
    if (rc == 1) {
        TyObject *ret = Ty_BuildValue("innO", rc, pos, hash, item);
        Ty_DECREF(item);
        return ret;
    }
    assert(item == UNINITIALIZED_PTR);
    assert(hash == (Ty_hash_t)UNINITIALIZED_SIZE);
    if (rc == -1) {
        return NULL;
    }
    assert(rc == 0);
    Py_RETURN_NONE;
}


static TyMethodDef TestMethods[] = {
    {"set_update", set_update, METH_VARARGS},
    {"set_next_entry", set_next_entry, METH_VARARGS},

    {NULL},
};

int
_PyTestInternalCapi_Init_Set(TyObject *m)
{
    if (TyModule_AddFunctions(m, TestMethods) < 0) {
        return -1;
    }
    return 0;
}
