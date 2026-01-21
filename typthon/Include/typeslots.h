/* Do not renumber the file; these numbers are part of the stable ABI. */
#define Ty_bf_getbuffer 1
#define Ty_bf_releasebuffer 2
#define Ty_mp_ass_subscript 3
#define Ty_mp_length 4
#define Ty_mp_subscript 5
#define Ty_nb_absolute 6
#define Ty_nb_add 7
#define Ty_nb_and 8
#define Ty_nb_bool 9
#define Ty_nb_divmod 10
#define Ty_nb_float 11
#define Ty_nb_floor_divide 12
#define Ty_nb_index 13
#define Ty_nb_inplace_add 14
#define Ty_nb_inplace_and 15
#define Ty_nb_inplace_floor_divide 16
#define Ty_nb_inplace_lshift 17
#define Ty_nb_inplace_multiply 18
#define Ty_nb_inplace_or 19
#define Ty_nb_inplace_power 20
#define Ty_nb_inplace_remainder 21
#define Ty_nb_inplace_rshift 22
#define Ty_nb_inplace_subtract 23
#define Ty_nb_inplace_true_divide 24
#define Ty_nb_inplace_xor 25
#define Ty_nb_int 26
#define Ty_nb_invert 27
#define Ty_nb_lshift 28
#define Ty_nb_multiply 29
#define Ty_nb_negative 30
#define Ty_nb_or 31
#define Ty_nb_positive 32
#define Ty_nb_power 33
#define Ty_nb_remainder 34
#define Ty_nb_rshift 35
#define Ty_nb_subtract 36
#define Ty_nb_true_divide 37
#define Ty_nb_xor 38
#define Ty_sq_ass_item 39
#define Ty_sq_concat 40
#define Ty_sq_contains 41
#define Ty_sq_inplace_concat 42
#define Ty_sq_inplace_repeat 43
#define Ty_sq_item 44
#define Ty_sq_length 45
#define Ty_sq_repeat 46
#define Ty_tp_alloc 47
#define Ty_tp_base 48
#define Ty_tp_bases 49
#define Ty_tp_call 50
#define Ty_tp_clear 51
#define Ty_tp_dealloc 52
#define Ty_tp_del 53
#define Ty_tp_descr_get 54
#define Ty_tp_descr_set 55
#define Ty_tp_doc 56
#define Ty_tp_getattr 57
#define Ty_tp_getattro 58
#define Ty_tp_hash 59
#define Ty_tp_init 60
#define Ty_tp_is_gc 61
#define Ty_tp_iter 62
#define Ty_tp_iternext 63
#define Ty_tp_methods 64
#define Ty_tp_new 65
#define Ty_tp_repr 66
#define Ty_tp_richcompare 67
#define Ty_tp_setattr 68
#define Ty_tp_setattro 69
#define Ty_tp_str 70
#define Ty_tp_traverse 71
#define Ty_tp_members 72
#define Ty_tp_getset 73
#define Ty_tp_free 74
#define Ty_nb_matrix_multiply 75
#define Ty_nb_inplace_matrix_multiply 76
#define Ty_am_await 77
#define Ty_am_aiter 78
#define Ty_am_anext 79
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x03050000
/* New in 3.5 */
#define Ty_tp_finalize 80
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030A0000
/* New in 3.10 */
#define Ty_am_send 81
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030E0000
/* New in 3.14 */
#define Ty_tp_vectorcall 82
#endif
#if !defined(Ty_LIMITED_API) || Ty_LIMITED_API+0 >= 0x030E0000
/* New in 3.14 */
#define Ty_tp_token 83
#endif
