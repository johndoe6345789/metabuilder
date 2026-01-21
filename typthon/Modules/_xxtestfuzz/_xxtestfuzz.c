#include <Python.h>
#include <stdlib.h>
#include <inttypes.h>

int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size);

static TyObject* _fuzz_run(TyObject* self, TyObject* args) {
    const char* buf;
    Ty_ssize_t size;
    if (!TyArg_ParseTuple(args, "s#", &buf, &size)) {
        return NULL;
    }
    int rv = LLVMFuzzerTestOneInput((const uint8_t*)buf, size);
    if (TyErr_Occurred()) {
        return NULL;
    }
    if (rv != 0) {
        // Nonzero return codes are reserved for future use.
        TyErr_Format(
            TyExc_RuntimeError, "Nonzero return code from fuzzer: %d", rv);
        return NULL;
    }
    Py_RETURN_NONE;
}

static TyMethodDef module_methods[] = {
    {"run", _fuzz_run, METH_VARARGS, ""},
    {NULL},
};

static PyModuleDef_Slot module_slots[] = {
    {Ty_mod_gil, Ty_MOD_GIL_NOT_USED},
    {0, NULL},
};

static struct TyModuleDef _fuzzmodule = {
        PyModuleDef_HEAD_INIT,
        "_fuzz",
        NULL,
        0,
        module_methods,
        module_slots,
        NULL,
        NULL,
        NULL
};

PyMODINIT_FUNC
PyInit__xxtestfuzz(void)
{
    return PyModuleDef_Init(&_fuzzmodule);
}
