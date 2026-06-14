"""
Unit tests for _DEBUG_RUNNERS config in app.py.
Pure Python — no Docker or network required.
Run: python -m pytest backend/tests/test_debug_runners.py
"""

import importlib
import os
import sys
import types
import unittest

# ---------------------------------------------------------------------------
# Minimal stubs so app.py can be imported without its heavy deps
# ---------------------------------------------------------------------------

def _stub_module(name: str, **attrs) -> types.ModuleType:
    m = types.ModuleType(name)
    for k, v in attrs.items():
        setattr(m, k, v)
    return m

_flask   = _stub_module('flask',
    Flask=type('Flask', (), {'__init__': lambda *a, **kw: None}),
    request=None, jsonify=lambda x: x, g=None)
_flask.Flask.route       = lambda *a, **kw: (lambda f: f)
_flask.Flask.before_request = lambda *a, **kw: (lambda f: f)
_flask.Flask.after_request  = lambda *a, **kw: (lambda f: f)
_flask.Flask.errorhandler   = lambda *a, **kw: (lambda f: f)
_flask_cors = _stub_module('flask_cors', CORS=lambda *a, **kw: None)
_jwt   = _stub_module('flask_jwt_extended',
    JWTManager=lambda *a, **kw: None,
    create_access_token=None,
    jwt_required=lambda *a, **kw: (lambda f: f),
    get_jwt_identity=None,
    verify_jwt_in_request=None)
_docker_errors = _stub_module('docker.errors',
    NotFound=Exception,
    ImageNotFound=Exception,
    DockerException=Exception)
_docker_lib = _stub_module('docker',
    DockerClient=type('DockerClient', (), {}),
    errors=_docker_errors)
_docker_lib.from_env = lambda: None
sys.modules['docker.errors'] = _docker_errors
_smtplib = _stub_module('smtplib')
_email   = _stub_module('email.mime.text',
    MIMEText=type('MIMEText', (), {}))

for name, mod in [
    ('flask', _flask), ('flask_cors', _flask_cors),
    ('flask_jwt_extended', _jwt), ('docker', _docker_lib),
    ('smtplib', _smtplib), ('email.mime.text', _email),
]:
    sys.modules.setdefault(name, mod)

# Set required env vars before import
import tempfile
os.environ.setdefault('NEXT_PUBLIC_FLASK_BACKEND_URL', 'http://localhost:5000')
_tmp_db = os.path.join(tempfile.gettempdir(), 'pastebin_test.db')
os.environ.setdefault('DATABASE_PATH', _tmp_db)

# ---------------------------------------------------------------------------
# Import the module under test
# ---------------------------------------------------------------------------

sys.path.insert(
    0,
    os.path.join(os.path.dirname(__file__), '..'),
)

# Guard: if import fails we want a clear error
try:
    from app import _DEBUG_RUNNERS  # type: ignore[import-untyped]
except Exception as exc:
    _DEBUG_RUNNERS = None
    _IMPORT_ERROR  = exc
else:
    _IMPORT_ERROR = None


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@unittest.skipIf(_IMPORT_ERROR, f'app import failed: {_IMPORT_ERROR}')
class TestDebugRunnersCppCmake(unittest.TestCase):

    def test_cpp_cmake_key_present(self):
        self.assertIn('cpp-cmake', _DEBUG_RUNNERS)

    def test_image_defaults_to_cpp_debug(self):
        runner = _DEBUG_RUNNERS['cpp-cmake']
        os.environ.pop('CPP_DEBUG_IMAGE', None)
        self.assertEqual(runner['image'](), 'cpp-debug:latest')

    def test_image_respects_env_var(self):
        runner = _DEBUG_RUNNERS['cpp-cmake']
        os.environ['CPP_DEBUG_IMAGE'] = 'my-registry/cpp-debug:v2'
        try:
            self.assertEqual(runner['image'](), 'my-registry/cpp-debug:v2')
        finally:
            del os.environ['CPP_DEBUG_IMAGE']

    def test_dap_command_contains_gpp(self):
        runner = _DEBUG_RUNNERS['cpp-cmake']
        cmd = runner['dap'].format(port=5678)
        self.assertIn('g++', cmd)
        self.assertIn('-g', cmd)
        self.assertIn('-O0', cmd)

    def test_dap_command_contains_codelldb(self):
        runner = _DEBUG_RUNNERS['cpp-cmake']
        cmd = runner['dap'].format(port=5678)
        self.assertIn('codelldb', cmd)
        self.assertIn('5678', cmd)

    def test_dap_command_uses_socat_bridge(self):
        # codelldb v1.12+ binds 127.0.0.1; socat bridges 0.0.0.0:{port}
        runner = _DEBUG_RUNNERS['cpp-cmake']
        cmd = runner['dap'].format(port=5678)
        self.assertIn('socat', cmd)
        self.assertIn('0.0.0.0', cmd)

    def test_dap_command_outputs_to_prog(self):
        runner = _DEBUG_RUNNERS['cpp-cmake']
        cmd = runner['dap'].format(port=5678)
        self.assertIn('__prog__', cmd)

    def test_launch_args_shape(self):
        runner = _DEBUG_RUNNERS['cpp-cmake']
        args = runner['launch']('main.cpp')
        self.assertEqual(args['request'], 'launch')
        self.assertEqual(args['program'], '/workspace/__prog__')
        self.assertIn('cwd', args)
        self.assertIn('args', args)

    def test_no_setup_key(self):
        # cpp-cmake has no 'setup' because adapters are pre-baked into the image
        runner = _DEBUG_RUNNERS['cpp-cmake']
        self.assertNotIn('setup', runner)

    def test_all_required_keys_present(self):
        runner = _DEBUG_RUNNERS['cpp-cmake']
        for key in ('image', 'dap', 'launch'):
            self.assertIn(key, runner, f'Missing key: {key}')


@unittest.skipIf(_IMPORT_ERROR, f'app import failed: {_IMPORT_ERROR}')
class TestDebugRunnersExistingLanguages(unittest.TestCase):
    """Smoke-check that our additions didn't break existing runners."""

    def test_python_runner_still_present(self):
        self.assertIn('python', _DEBUG_RUNNERS)

    def test_javascript_runner_still_present(self):
        self.assertIn('javascript', _DEBUG_RUNNERS)

    def test_typescript_runner_still_present(self):
        self.assertIn('typescript', _DEBUG_RUNNERS)

    def test_node_runners_dap_path_updated(self):
        for lang in ('javascript', 'typescript'):
            cmd = _DEBUG_RUNNERS[lang]['dap'].format(port=5678)
            self.assertIn('/opt/js-debug', cmd,
                f'{lang}: dap command should use /opt/js-debug path')
            self.assertNotIn('npm root', cmd,
                f'{lang}: dap command must not use npm root')

    def test_python_uses_attach_request(self):
        # debugpy `--listen … --wait-for-client <script>` is a server that
        # already holds the debuggee — the client must ATTACH, not launch,
        # or breakpoints never bind.
        args = _DEBUG_RUNNERS['python']['launch']('main.py')
        self.assertEqual(args['request'], 'attach')
        self.assertNotIn('program', args,
            'attach must not re-specify program (set on the command line)')

    def test_python_dap_waits_for_client(self):
        cmd = _DEBUG_RUNNERS['python']['dap'].format(port=5678, entry='main.py')
        self.assertIn('--wait-for-client', cmd)
        self.assertIn('debugpy', cmd)


if __name__ == '__main__':
    unittest.main()
