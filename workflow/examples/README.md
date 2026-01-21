# Workflow Examples

Example workflow packages from AutoMetabuilder demonstrating various patterns.

## Python Examples (`python/`)

These are JSON-based workflow definitions that use the Python plugins.

### Templates

| Package | Description |
|---------|-------------|
| `blank` | Empty starter template |
| `single_pass` | Single AI request with tool execution |
| `iterative_loop` | AI loop with tool calls until completion |
| `contextual_iterative_loop` | Loop with repository context |
| `plan_execute_summarize` | Planning, execution, and summarization pattern |

### Data Processing

| Package | Description |
|---------|-------------|
| `data_processing_demo` | Filter, map, reduce operations |
| `conditional_logic_demo` | Branching and conditional logic |
| `repo_scan_context` | Scan repository and build context |

### Plugin Test Suites

| Package | Description |
|---------|-------------|
| `dict_plugins_test` | Dictionary operation tests |
| `list_plugins_test` | List operation tests |
| `logic_plugins_test` | Boolean logic tests |
| `math_plugins_test` | Arithmetic operation tests |
| `string_plugins_test` | String manipulation tests |

### Infrastructure

| Package | Description |
|---------|-------------|
| `backend_bootstrap` | Initialize backend services |
| `default_app_workflow` | Full application workflow |
| `web_server_bootstrap` | Flask server with routes |
| `web_server_json_routes` | JSON API route configuration |

### Specialized

| Package | Description |
|---------|-------------|
| `game_tick_loop` | Game loop with tick phases |
| `testing_triangle` | Lint, unit test, UI test pipeline |

## Workflow Structure

Each package contains:

- `package.json` - Package metadata
- `workflow.json` - Workflow definition with nodes and connections

## Running Examples

These workflows are designed to run with the Python executor and plugins in `workflow/plugins/python/`.
