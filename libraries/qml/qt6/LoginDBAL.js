// LoginDBAL.js — placeholder pending real OIDC login for the desktop app.
//
// Previously called a DBAL route ("core/auth/login") that doesn't exist
// anywhere in the daemon, and silently fell back to a hardcoded dev
// credential list (demo/mod/admin/god/super with plaintext passwords) on
// failure -- a real security hole, not a dev convenience. Removed rather
// than left in place. A proper fix needs a native OIDC integration (system
// browser handoff + loopback-redirect listener), which is separate,
// larger follow-up work -- not a drop-in replacement for this file alone.
