#ifndef Ty_INTERNAL_DICT_STATE_H
#define Ty_INTERNAL_DICT_STATE_H
#ifdef __cplusplus
extern "C" {
#endif

#ifndef Ty_BUILD_CORE
#  error "this header requires Ty_BUILD_CORE define"
#endif

#define DICT_MAX_WATCHERS 8
#define DICT_WATCHED_MUTATION_BITS 4

struct _Ty_dict_state {
    uint32_t next_keys_version;
    TyDict_WatchCallback watchers[DICT_MAX_WATCHERS];
};

#define _dict_state_INIT \
    { \
        .next_keys_version = 2, \
    }


#ifdef __cplusplus
}
#endif
#endif   /* !Ty_INTERNAL_DICT_STATE_H */
