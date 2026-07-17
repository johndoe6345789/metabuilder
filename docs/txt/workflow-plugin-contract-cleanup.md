# Workflow plugin contract cleanup

This change strengthens the TypeScript workflow plugin boundary by replacing broad `any` types with JSON-compatible types, defining a minimal runtime interface, and allowing both synchronous and asynchronous executors.

The declaration file is kept in sync with the source contract.
