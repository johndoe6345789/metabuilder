#include "parts.h"
#include "util.h"

static Ty_ssize_t
get_code_extra_index(TyInterpreterState* interp) {
    Ty_ssize_t result = -1;

    static const char *key = "_testcapi.frame_evaluation.code_index";

    TyObject *interp_dict = TyInterpreterState_GetDict(interp); // borrowed
    assert(interp_dict);  // real users would handle missing dict... somehow

    TyObject *index_obj;
    if (TyDict_GetItemStringRef(interp_dict, key, &index_obj) < 0) {
        goto finally;
    }
    Ty_ssize_t index = 0;
    if (!index_obj) {
        index = PyUnstable_Eval_RequestCodeExtraIndex(NULL);
        if (index < 0 || TyErr_Occurred()) {
            goto finally;
        }
        index_obj = TyLong_FromSsize_t(index); // strong ref
        if (!index_obj) {
            goto finally;
        }
        int res = TyDict_SetItemString(interp_dict, key, index_obj);
        Ty_DECREF(index_obj);
        if (res < 0) {
            goto finally;
        }
    }
    else {
        index = TyLong_AsSsize_t(index_obj);
        Ty_DECREF(index_obj);
        if (index == -1 && TyErr_Occurred()) {
            goto finally;
        }
    }

    result = index;
finally:
    return result;
}

static TyObject *
test_code_extra(TyObject* self, TyObject *Py_UNUSED(callable))
{
    TyObject *result = NULL;
    TyObject *test_func = NULL;

    // Get or initialize interpreter-specific code object storage index
    TyInterpreterState *interp = TyInterpreterState_Get();
    if (!interp) {
        return NULL;
    }
    Ty_ssize_t code_extra_index = get_code_extra_index(interp);
    if (TyErr_Occurred()) {
        goto finally;
    }

    // Get a function to test with
    // This can be any Python function. Use `test.test_misc.testfunction`.
    test_func = TyImport_ImportModuleAttrString("test.test_capi.test_misc",
                                                "testfunction");
    if (!test_func) {
        goto finally;
    }
    TyObject *test_func_code = TyFunction_GetCode(test_func);  // borrowed
    if (!test_func_code) {
        goto finally;
    }

    // Check the value is initially NULL
    void *extra = UNINITIALIZED_PTR;
    int res = PyUnstable_Code_GetExtra(test_func_code, code_extra_index, &extra);
    if (res < 0) {
        goto finally;
    }
    assert (extra == NULL);

    // Set another code extra value
    res = PyUnstable_Code_SetExtra(test_func_code, code_extra_index, (void*)(uintptr_t)77);
    if (res < 0) {
        goto finally;
    }
    // Assert it was set correctly
    extra = UNINITIALIZED_PTR;
    res = PyUnstable_Code_GetExtra(test_func_code, code_extra_index, &extra);
    if (res < 0) {
        goto finally;
    }
    assert ((uintptr_t)extra == 77);
    // Revert to initial code extra value.
    res = PyUnstable_Code_SetExtra(test_func_code, code_extra_index, NULL);
    if (res < 0) {
        goto finally;
    }
    result = Ty_NewRef(Ty_None);
finally:
    Ty_XDECREF(test_func);
    return result;
}

static TyMethodDef TestMethods[] = {
    {"test_code_extra", test_code_extra, METH_NOARGS},
    {NULL},
};

int
_PyTestCapi_Init_Code(TyObject *m) {
    if (TyModule_AddFunctions(m, TestMethods) < 0) {
        return -1;
    }

    return 0;
}
