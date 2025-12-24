# C++ Build Assistant - Quick Reference

## 🚀 Quick Start

```bash
# First time
npm run cpp:full

# Daily development
npm run cpp:build
```

## 📋 Commands

| Command | What it does |
|---------|--------------|
| `npm run cpp:check` | ✓ Check if tools installed |
| `npm run cpp:init` | 📄 Create conanfile.txt |
| `npm run cpp:install` | 📦 Install C++ dependencies |
| `npm run cpp:configure` | ⚙️ Configure CMake + Ninja |
| `npm run cpp:build` | 🏗️ Build project |
| `npm run cpp:test` | 🧪 Run tests |
| `npm run cpp:clean` | 🧹 Clean build |
| `npm run cpp:rebuild` | 🔄 Clean + rebuild |
| `npm run cpp:full` | 🎯 Complete workflow |

## 🛠️ Options

```bash
# Build specific target
npm run cpp:build -- build dbal_daemon

# Debug build
npm run cpp:build -- configure --debug
npm run cpp:build -- build

# Custom parallelism
npm run cpp:build -- build --jobs=4
```

## 📦 Install Tools

### macOS
```bash
brew install cmake conan ninja gcc
```

### Linux
```bash
sudo apt-get install cmake ninja-build g++
pip install conan
```

### Windows
```bash
choco install cmake conan ninja
```

## 🔧 Troubleshooting

### Conan profile missing
```bash
conan profile detect --force
```

### Clean rebuild
```bash
npm run cpp:clean
npm run cpp:full
```

### Verify tools
```bash
npm run cpp:check
cmake --version
conan --version
ninja --version
```

## 📁 Project Structure

```
dbal/
├── cpp/
│   ├── CMakeLists.txt      # Build config
│   ├── conanfile.txt       # Dependencies
│   ├── build/              # Generated files
│   ├── include/            # Headers
│   ├── src/                # Implementation
│   └── tests/              # Tests
└── tools/
    └── cpp-build-assistant.js  # Build script
```

## 🔄 Common Workflows

### After code change
```bash
npm run cpp:build
```

### After adding dependency
```bash
# 1. Edit dbal/cpp/conanfile.txt
# 2. Run:
npm run cpp:install
npm run cpp:configure
npm run cpp:build
```

### Before commit
```bash
npm run cpp:test
```

### Fresh start
```bash
npm run cpp:clean
npm run cpp:full
npm run cpp:test
```

## 📚 Documentation

- [Full Guide](./CPP_BUILD_ASSISTANT.md)
- [Tool README](../dbal/tools/BUILD_ASSISTANT_README.md)
- [DBAL Architecture](../dbal/PROJECT.md)

## 🎯 What It Does

1. **Checks** dependencies (CMake, Conan, Ninja, GCC)
2. **Installs** C++ packages via Conan
3. **Configures** CMake with Ninja generator
4. **Builds** using Ninja (parallel, fast)
5. **Tests** with CTest
6. **Integrates** with CI/CD pipelines

## 💡 Tips

- Use `cpp:full` for first build
- Use `cpp:build` for incremental builds
- Use `cpp:rebuild` when things break
- Check `build/compile_commands.json` for IDE integration
- Ninja handles incremental builds automatically

## ⚡ Performance

- **Parallel builds**: Uses all CPU cores by default
- **Incremental**: Only rebuilds changed files
- **Caching**: Use `ccache` for even faster rebuilds
- **Fast**: Ninja is significantly faster than Make

## 🔐 Security Note

The C++ daemon provides a secure layer between TypeScript and the database:

```
Spark App (TS) → C++ Daemon → Database
    ↑                ↑
  Browser      Built via assistant
```

## 🤝 Integration

Works seamlessly with:
- ✅ GitHub Actions (see `.github/workflows/cpp-build.yml`)
- ✅ VS Code (auto-generates `compile_commands.json`)
- ✅ CLion (detects CMake automatically)
- ✅ npm scripts (consistent interface)
- ✅ CI/CD pipelines (simple commands)
