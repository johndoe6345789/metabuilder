"""Phase 8: Email Client Integration Test Suite

Comprehensive end-to-end testing for email client functionality:
- Account creation and management
- IMAP/POP3 synchronization
- SMTP send operations
- RFC 5322 email parsing
- Folder management
- Attachment handling
- Search and filtering
- Error handling and recovery
- Performance benchmarking
- Docker Compose integration
- API endpoint testing
- Workflow plugin execution

Test Coverage:
- 67 test cases across 12 test classes
- Multi-tenant ACL enforcement
- Performance baselines
- Docker integration tests
- Full workflow scenarios (account → sync → send → receive)

Usage:
    pytest tests/integration/ -v
    pytest tests/integration/test_email_client_e2e.py::TestEmailSync -v
    RUN_DOCKER_TESTS=1 pytest -m docker
"""
