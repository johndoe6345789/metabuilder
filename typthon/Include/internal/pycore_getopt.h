#ifndef Ty_INTERNAL_PYGETOPT_H
#define Ty_INTERNAL_PYGETOPT_H

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

extern int _TyOS_opterr;
extern Ty_ssize_t _TyOS_optind;
extern const wchar_t *_TyOS_optarg;

extern void _TyOS_ResetGetOpt(void);

typedef struct {
    const wchar_t *name;
    int has_arg;
    int val;
} _TyOS_LongOption;

extern int _TyOS_GetOpt(Ty_ssize_t argc, wchar_t * const *argv, int *longindex);

#endif /* !Ty_INTERNAL_PYGETOPT_H */
