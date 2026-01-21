#include "parts.h"
#include "util.h"

#include "frameobject.h"          // TyFrame_New()


static TyObject *
frame_getlocals(TyObject *self, TyObject *frame)
{
    if (!TyFrame_Check(frame)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a frame");
        return NULL;
    }
    return TyFrame_GetLocals((PyFrameObject *)frame);
}


static TyObject *
frame_getglobals(TyObject *self, TyObject *frame)
{
    if (!TyFrame_Check(frame)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a frame");
        return NULL;
    }
    return TyFrame_GetGlobals((PyFrameObject *)frame);
}


static TyObject *
frame_getgenerator(TyObject *self, TyObject *frame)
{
    if (!TyFrame_Check(frame)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a frame");
        return NULL;
    }
    return TyFrame_GetGenerator((PyFrameObject *)frame);
}


static TyObject *
frame_getbuiltins(TyObject *self, TyObject *frame)
{
    if (!TyFrame_Check(frame)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a frame");
        return NULL;
    }
    return TyFrame_GetBuiltins((PyFrameObject *)frame);
}


static TyObject *
frame_getlasti(TyObject *self, TyObject *frame)
{
    if (!TyFrame_Check(frame)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a frame");
        return NULL;
    }
    int lasti = TyFrame_GetLasti((PyFrameObject *)frame);
    if (lasti < 0) {
        assert(lasti == -1);
        Py_RETURN_NONE;
    }
    return TyLong_FromLong(lasti);
}


static TyObject *
frame_new(TyObject *self, TyObject *args)
{
    TyObject *code, *globals, *locals;
    if (!TyArg_ParseTuple(args, "OOO", &code, &globals, &locals)) {
        return NULL;
    }
    if (!TyCode_Check(code)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a code object");
        return NULL;
    }
    TyThreadState *tstate = TyThreadState_Get();

    return (TyObject *)TyFrame_New(tstate, (PyCodeObject *)code, globals, locals);
}


static TyObject *
frame_getvar(TyObject *self, TyObject *args)
{
    TyObject *frame, *name;
    if (!TyArg_ParseTuple(args, "OO", &frame, &name)) {
        return NULL;
    }
    if (!TyFrame_Check(frame)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a frame");
        return NULL;
    }

    return TyFrame_GetVar((PyFrameObject *)frame, name);
}


static TyObject *
frame_getvarstring(TyObject *self, TyObject *args)
{
    TyObject *frame;
    const char *name;
    if (!TyArg_ParseTuple(args, "Oy", &frame, &name)) {
        return NULL;
    }
    if (!TyFrame_Check(frame)) {
        TyErr_SetString(TyExc_TypeError, "argument must be a frame");
        return NULL;
    }

    return TyFrame_GetVarString((PyFrameObject *)frame, name);
}


static TyMethodDef test_methods[] = {
    {"frame_getlocals", frame_getlocals, METH_O, NULL},
    {"frame_getglobals", frame_getglobals, METH_O, NULL},
    {"frame_getgenerator", frame_getgenerator, METH_O, NULL},
    {"frame_getbuiltins", frame_getbuiltins, METH_O, NULL},
    {"frame_getlasti", frame_getlasti, METH_O, NULL},
    {"frame_new", frame_new, METH_VARARGS, NULL},
    {"frame_getvar", frame_getvar, METH_VARARGS, NULL},
    {"frame_getvarstring", frame_getvarstring, METH_VARARGS, NULL},
    {NULL},
};

int
_PyTestCapi_Init_Frame(TyObject *m)
{
    return TyModule_AddFunctions(m, test_methods);
}

