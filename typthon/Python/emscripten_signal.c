// To enable signal handling, the embedder should:
// 1. set Module.Ty_EmscriptenSignalBuffer = some_shared_array_buffer;
// 2. set the Ty_EMSCRIPTEN_SIGNAL_HANDLING flag to 1 as follows:
//    Module.HEAP8[Module._Py_EMSCRIPTEN_SIGNAL_HANDLING] = 1
//
// The address &Ty_EMSCRIPTEN_SIGNAL_HANDLING is exported as
// Module._Py_EMSCRIPTEN_SIGNAL_HANDLING.
#include <emscripten.h>
#include "Python.h"

EM_JS(int, _Py_CheckEmscriptenSignals_Helper, (void), {
    if (!Module.Ty_EmscriptenSignalBuffer) {
        return 0;
    }
    try {
        let result = Module.Ty_EmscriptenSignalBuffer[0];
        Module.Ty_EmscriptenSignalBuffer[0] = 0;
        return result;
    } catch(e) {
#if !defined(NDEBUG)
        console.warn("Error occurred while trying to read signal buffer:", e);
#endif
        return 0;
    }
});

EMSCRIPTEN_KEEPALIVE int Ty_EMSCRIPTEN_SIGNAL_HANDLING = 0;

void
_Py_CheckEmscriptenSignals(void)
{
    if (!Ty_EMSCRIPTEN_SIGNAL_HANDLING) {
        return;
    }
    int signal = _Py_CheckEmscriptenSignals_Helper();
    if (signal) {
        TyErr_SetInterruptEx(signal);
    }
}

#define PY_EMSCRIPTEN_SIGNAL_INTERVAL 50
int _Py_emscripten_signal_clock = PY_EMSCRIPTEN_SIGNAL_INTERVAL;

void
_Py_CheckEmscriptenSignalsPeriodically(void)
{
    if (_Py_emscripten_signal_clock == 0) {
        _Py_emscripten_signal_clock = PY_EMSCRIPTEN_SIGNAL_INTERVAL;
        _Py_CheckEmscriptenSignals();
    }
    else if (Ty_EMSCRIPTEN_SIGNAL_HANDLING) {
        _Py_emscripten_signal_clock--;
    }
}
