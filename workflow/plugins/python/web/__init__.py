"""Web workflow plugins: Flask server, API endpoints, file I/O, translations.

These plugins provide workflow-based access to web data operations, enabling
declarative workflows to interact with web-related functionality.

Available Plugins:

Environment Management:
- web_get_env_vars - Load environment variables
- web_persist_env_vars - Save environment variables

File I/O:
- web_read_json - Read JSON files
- web_get_recent_logs - Get recent log entries
- web_load_messages - Load translation messages

Translation Management:
- web_list_translations - List available translations
- web_load_translation - Load a translation
- web_create_translation - Create new translation
- web_update_translation - Update translation
- web_delete_translation - Delete translation
- web_get_ui_messages - Get UI messages with fallback

Navigation & Metadata:
- web_get_navigation_items - Get navigation menu items

Prompt Management:
- web_get_prompt_content - Read prompt content
- web_write_prompt - Write prompt content
- web_build_prompt_yaml - Build YAML prompt

Workflow Operations:
- web_get_workflow_content - Read workflow JSON
- web_write_workflow - Write workflow JSON
- web_load_workflow_packages - Load workflow packages
- web_summarize_workflow_packages - Summarize packages

Flask Server Setup:
- web_create_flask_app - Create Flask application
- web_register_blueprint - Register Flask blueprints
- web_start_server - Start Flask server
- web_build_context - Build API context
"""
