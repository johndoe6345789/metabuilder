# Default Application Workflow

The Default Application Workflow is AutoMetabuilder's production-ready system that combines backend initialization with an iterative AI agent loop. It demonstrates the framework's self-referential approach where internal logic is expressed as declarative workflows.

## Overview

This workflow package replaces imperative Python code with a declarative JSON-based approach, providing a complete end-to-end workflow that bootstraps the backend and executes the AI loop.

## Key Components

### Phase 1: Backend Bootstrap (9 nodes)

Initializes all required services:
- Message loading from storage
- Metadata configuration
- Prompt template loading
- GitHub client initialization
- OpenAI client initialization
- Tool definitions loading
- Plugin loading and initialization
- Context seeding
- Message seeding

### Phase 2: AI Agent Loop (8 nodes)

Executes the core agent through iterative cycles:
1. Loading context
2. Seeding messages
3. Making LLM requests
4. Executing tool calls
5. Appending results

The loop continues for up to 10 iterations or until no tool calls are returned.

## Main Advantages

The workflow-based architecture provides:

- **Separation of Concerns**: Clear boundaries between initialization and execution
- **Flexibility**: Easy to modify individual nodes without affecting others
- **Observability**: Each node execution can be logged and monitored
- **Extensibility**: New nodes can be added without changing existing ones
- **Visual**: The declarative format enables visual workflow editors
- **Testable**: Individual nodes can be unit tested in isolation
- **Modular**: Components can be reused across different workflows

## File Structure

```
default_app_workflow/
├── package.json      # Package metadata and configuration
├── workflow.json     # Workflow definition with nodes and connections
└── README.md         # This documentation file
```

## Customization

To create a custom variant:

1. Copy this package to a new directory
2. Edit the `workflow.json` file to modify nodes or connections
3. Update the `package.json` with new name and description
4. Update any configuration references

## Related Workflows

- `backend_bootstrap` - Initialization only
- `single_pass` - Single AI request without loop
- `iterative_loop` - Loop-only without bootstrap
- `plan_execute_summarize` - Advanced planning workflow

## Architecture Notes

The system distinguishes between:

- **Immutable Context**: Configuration and dependencies that don't change during execution
- **Mutable Store**: Execution state that changes as the workflow progresses

This separation enables both workflow data flow and programmatic access patterns.

## License

MIT
