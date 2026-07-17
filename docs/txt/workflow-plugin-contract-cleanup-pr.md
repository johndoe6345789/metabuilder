# PR summary

## What changed

- Introduced JSON-compatible `JsonValue` and `JsonObject` workflow boundary types.
- Replaced broad `any` usage in the TypeScript plugin base contract.
- Added a typed `WorkflowRuntime` logging capability.
- Made plugin execution support synchronous and asynchronous implementations.
- Updated the checked-in declaration file to match the source.

## Why

The previous plugin boundary discarded most TypeScript safety and only described synchronous execution, even though workflow nodes commonly perform I/O. This change strengthens the shared C++/TypeScript JSON boundary while preserving synchronous plugin compatibility.

## Validation

- Compared branch against `main` using the GitHub API.
- Source and declaration changes are present together.
- Docker build/start was not available in the execution environment because Docker is not installed.
