# AGENTS.md

## 🧠 Project Overview

This project is a Python-based application. Agents working in this directory must adhere to Python 3.11+ best practices, with clear module separation, test coverage, security hygiene, and readable documentation.

---

## 📁 Project Structure

Agents must follow the directory structure below:

```
project-root/
│
├── src/                # Application source code
│   └── <package_name>/ # Python modules/packages
│
├── tests/              # Unit + integration tests
│   └── __init__.py
│
├── scripts/            # Utility and CLI scripts
│
├── docs/               # Documentation (Markdown or reStructuredText)
│
├── .github/            # GitHub Actions workflows
│
├── pyproject.toml      # Project metadata & tool configs (preferred)
├── requirements.txt    # Legacy dependency spec (optional)
├── .env.example        # Environment variable template
└── AGENTS.md           # Agent configuration (this file)
```

Do not create files outside this structure unless explicitly instructed.

---

## 🧪 Testing & Validation

Before submitting changes, agents **must** ensure all tests and linters pass:

```bash
# Set up environment (once)
python3 -m venv .venv
source .venv/bin/activate
pip install -e .[dev]

# Run unit tests
pytest --cov=src --cov-report=term --cov-report=xml

# Run linters
ruff check src/ tests/
mypy src/
black --check src/
```

### ✅ Required Quality Gates

- Code coverage: ≥ 90%
- Type coverage: 100% via `mypy`
- No linter errors (ruff + mypy)
- No black formatting issues

Agents must **not** commit code that fails these checks.

---

## 🧹 Code Style

- Use **PEP8 + PEP257** standards.
- Prefer `pyproject.toml` for tool configuration (Black, Ruff, Mypy, etc.).
- Function names: `snake_case`
- Class names: `PascalCase`
- Constant names: `UPPER_SNAKE_CASE`
- Use f-strings, not `%` or `.format()` for string interpolation.
- Keep function length under 50 lines where possible.

---

## 🔒 Security Guidelines

Agents must:

- Never commit `.env` files, secrets, or tokens.
- Use `dotenv` to load secrets during local execution.
- Avoid using `eval()`, `exec()`, or subprocess calls unless sandboxed and essential.
- Avoid external internet access during execution unless configured via API keys.

---

## 🧪 Testing Philosophy

- Use `pytest` with fixtures, mocking (`unittest.mock` or `pytest-mock`), and parameterized tests.
- Aim for 1:1 parity between modules and test modules.
- Include boundary cases and exception tests.

---

## 🧾 Commit & PR Conventions

Agents must format commits using **Conventional Commits**:

```
feat: add user authentication module
fix: correct path handling in file parser
docs: update README with usage example
```

Pull Requests should include:

- A concise title (≤ 72 chars)
- A summary of what changed and why
- Before/after behavior (if applicable)
- Testing evidence (CI, screenshots, coverage)

---

## 📦 Dependency Management

- Use **`pyproject.toml`** (via Poetry or PEP 621 standard)
- Prefer `pip install .[dev]` over `requirements.txt`
- Dev dependencies go under `[tool.poetry.group.dev.dependencies]` or similar
- Avoid `pip freeze` output for lockfiles — use `poetry.lock` or `requirements.lock` if necessary

---

## 🤖 Agent Behavior Summary

- Respect the file and folder structure
- Never break existing tests
- Follow Pythonic style and formatting
- Automate validation where possible
- Explain large changes via commit messages and PR descriptions
- Use comments where logic is non-obvious

---

Happy coding! 🐍


---

## ⚙️ Setup Script Requirement

Every project must include a `setup.sh` script at the root level that ensures:

- Python 3.11+ is installed
- Poetry is installed (via `install.python-poetry.org`)
- All dependencies are installed using `poetry install`

If this script does not exist, the agent must create it. It should be idempotent and safe to re-run.

Run it like this:

```bash
chmod +x setup.sh
./setup.sh
```


---

## 🖥 OS-Specific Setup Scripts (Expanded)

Agents must maintain the following OS-specific setup scripts:

- `setup_linux.sh`
- `setup_mac.sh`
- `setup_windows.ps1`

These scripts must:
- Ensure Python 3.11+ is present (install if missing)
- Install Poetry (if not already installed)
- Run `poetry install` to install dependencies
- Be idempotent and safe to re-run

A user must be able to simply clone the repo, run the appropriate script, and be ready to work.

Refer to `README.md` for user-friendly execution instructions.

---

## 🖥 OS-Specific Setup Scripts (Expanded)

Agents must maintain the following **OS-specific setup scripts** in the project root:

- `setup_linux.sh` – for Ubuntu, Debian, Fedora, Arch, etc.
- `setup_mac.sh` – for macOS (Intel/ARM); must auto-install Homebrew if missing
- `setup_windows.ps1` – for Windows 10+ using PowerShell

Each script must:
- Ensure Python 3.11+ is installed
- Install Poetry if missing
- Run `poetry install` to fetch dependencies
- Be idempotent and safe to re-run
- Provide clear terminal output

These scripts should allow a contributor to clone the project, run one script, and be ready to develop.

---

### 🐧 setup_linux.sh

```bash
#!/bin/bash
set -e

echo "🔍 Checking Python 3.11+..."
if ! python3 --version | grep -q "3.11"; then
  echo "Installing Python 3.11..."
  if command -v apt &>/dev/null; then
    sudo apt update
    sudo apt install -y python3.11 python3.11-venv python3.11-dev
    sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y python3.11
  elif command -v pacman &>/dev/null; then
    sudo pacman -S --noconfirm python
  else
    echo "❌ Unsupported Linux package manager."
    exit 1
  fi
fi

echo "✅ Python version: $(python3 --version)"

echo "🔍 Checking for Poetry..."
if ! command -v poetry &>/dev/null; then
  echo "📦 Installing Poetry..."
  curl -sSL https://install.python-poetry.org | python3 -
  export PATH="$HOME/.local/bin:$PATH"
else
  echo "✅ Poetry is installed: $(poetry --version)"
fi

echo "📦 Installing dependencies..."
poetry install

echo "✅ Linux setup complete. Use 'poetry shell' to activate environment."
```

---

### 🍎 setup_mac.sh

```bash
#!/bin/bash
set -e

echo "🔍 Checking Python 3.11+..."
if ! python3 --version | grep -q "3.11"; then
  echo "Installing Python 3.11 using Homebrew..."
  if ! command -v brew &>/dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    export PATH="/opt/homebrew/bin:$PATH"
  fi
  brew install python@3.11
  brew link python@3.11 --force
fi

echo "✅ Python version: $(python3 --version)"

echo "🔍 Checking for Poetry..."
if ! command -v poetry &>/dev/null; then
  echo "📦 Installing Poetry..."
  curl -sSL https://install.python-poetry.org | python3 -
  export PATH="$HOME/.local/bin:$PATH"
else
  echo "✅ Poetry is installed: $(poetry --version)"
fi

echo "📦 Installing dependencies..."
poetry install

echo "✅ macOS setup complete. Use 'poetry shell' to activate environment."
```

---

### 🪟 setup_windows.ps1

```powershell
# PowerShell script
Write-Host "🔍 Checking Python 3.11+..."
$pythonVersion = python --version
if (-not ($pythonVersion -like "*3.11*")) {
    Write-Host "Installing Python 3.11..."
    Invoke-WebRequest -Uri "https://www.python.org/ftp/python/3.11.5/python-3.11.5-amd64.exe" -OutFile "python_installer.exe"
    Start-Process -Wait -FilePath "./python_installer.exe" -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1"
    Remove-Item "python_installer.exe"
}

Write-Host "✅ Python version: $(python --version)"

Write-Host "🔍 Checking for Poetry..."
if (-not (Get-Command poetry -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Poetry..."
    (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
    $env:Path += ";$env:USERPROFILE\.poetry\bin"
}

Write-Host "📦 Installing dependencies..."
poetry install

Write-Host "✅ Windows setup complete. Run 'poetry shell' to activate environment."
```

---

### 📘 Instructing Users in README.md

Also ensure `README.md` includes this section:

```markdown
## 🖥 Setup Instructions

Run the setup script for your operating system:

**Linux:**
```bash
chmod +x setup_linux.sh
./setup_linux.sh
```

**macOS:**
```bash
chmod +x setup_mac.sh
./setup_mac.sh
```

**Windows (PowerShell):**
```powershell
.\setup_windows.ps1
```

After installation:
```bash
poetry shell
```
```
