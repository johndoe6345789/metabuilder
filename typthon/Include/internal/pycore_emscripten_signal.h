#ifndef Ty_EMSCRIPTEN_SIGNAL_H
#define Ty_EMSCRIPTEN_SIGNAL_H

#if defined(__EMSCRIPTEN__)

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

void
_Ty_CheckEmscriptenSignals(void);

void
_Ty_CheckEmscriptenSignalsPeriodically(void);

#define _Ty_CHECK_EMSCRIPTEN_SIGNALS() _Ty_CheckEmscriptenSignals()

#define _Ty_CHECK_EMSCRIPTEN_SIGNALS_PERIODICALLY() _Ty_CheckEmscriptenSignalsPeriodically()

extern int Ty_EMSCRIPTEN_SIGNAL_HANDLING;
extern int _Ty_emscripten_signal_clock;

#else

#define _Ty_CHECK_EMSCRIPTEN_SIGNALS()
#define _Ty_CHECK_EMSCRIPTEN_SIGNALS_PERIODICALLY()

#endif // defined(__EMSCRIPTEN__)

#endif // ndef Ty_EMSCRIPTEN_SIGNAL_H
