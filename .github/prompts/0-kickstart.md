Work your way through prompts folder, skip if not needed. Figure it out as you go along. Just get on with it. Commit as you go along with descriptive commit messages, do trunking to main. Don't worry if another bot made changes, just send it. Most bots are just working through a unit testing SDLC workflow.

Keep unit tests parameterised and make new test files where possible.

Leave TODO comments for missing functionality.

Check /docs/TODO/*

Use 'act' workflow runner to diagnose the github workflow process.

A class is just a container for 1 lambda per file. Refactor any files that step out of line. 1:1 mapping from unit test to file here, so unit test and file have similar names. Resolves any arguments about how big a source code file should be.

See also RADIX_TO_MUI_MIGRATION.md

See also LAMBDA_PROMPT.md

Go in the dbal and ensure that it is well formed, we trust our users data through that layer. Other parts of the system should be wired through this layer.

---------------------------
Do what this document says.
----------------------------
