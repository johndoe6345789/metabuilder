#ifndef Ty_CRITICAL_SECTION_H
#define Ty_CRITICAL_SECTION_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_LIMITED_API
#  define Ty_CPYTHON_CRITICAL_SECTION_H
#  include "cpython/critical_section.h"
#  undef Ty_CPYTHON_CRITICAL_SECTION_H
#endif

#ifdef __cplusplus
}
#endif
#endif /* !Ty_CRITICAL_SECTION_H */
