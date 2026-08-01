#ifndef DBAL_CREDENTIAL_INDEX_HPP
#define DBAL_CREDENTIAL_INDEX_HPP

// set/verify/delete now live in client_misc_ops.cpp, backed by the generic
// adapter + Argon2id — the InMemoryStore-based versions that used to live
// here were confirmed dead (unreachable from any HTTP route) and deleted.
#include "crud/first_login_flag.hpp"

#endif
