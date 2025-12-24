import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
} as const;

interface ExecResult {
  success: boolean;
  output?: string;
  error?: string;
}

interface ExecOptions {
  cwd?: string;
  silent?: boolean;
  args?: string[];
}

const log = {
  info: (msg: string) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
  success: (msg: string) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  warn: (msg: string) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
  error: (msg: string) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  section: (msg: string) => console.log(`\n${COLORS.bright}${COLORS.cyan}${msg}${COLORS.reset}\n`),
};

export class CppBuildAssistant {
  private projectRoot: string;
  private cppDir: string;
  private buildDir: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || path.join(__dirname, '..');
    this.cppDir = path.join(this.projectRoot, 'cpp');
    this.buildDir = path.join(this.cppDir, 'build');
  }

  private exec(command: string, options: ExecOptions = {}): ExecResult {
    try {
      const result = execSync(command, {
        cwd: options.cwd || this.cppDir,
        encoding: 'utf-8',
        stdio: options.silent ? 'pipe' : 'inherit',
      });
      return { success: true, output: result as string };
    } catch (error: any) {
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  private checkCommand(command: string, name: string): boolean {
    try {
      execSync(`${command} --version`, { stdio: 'pipe' });
      log.success(`${name} is installed`);
      return true;
    } catch {
      log.error(`${name} is NOT installed`);
      return false;
    }
  }

  checkDependencies(): boolean {
    log.section('Checking Dependencies');

    const deps = [
      { cmd: 'cmake', name: 'CMake' },
      { cmd: 'conan', name: 'Conan' },
      { cmd: 'ninja', name: 'Ninja' },
      { cmd: 'g++', name: 'GCC' },
    ];

    const results = deps.map(({ cmd, name }) => ({
      name,
      installed: this.checkCommand(cmd, name),
    }));

    const allInstalled = results.every((r) => r.installed);

    if (!allInstalled) {
      log.warn('\nSome dependencies are missing. Install them:');
      
      if (os.platform() === 'darwin') {
        log.info('  brew install cmake conan ninja gcc');
      } else if (os.platform() === 'linux') {
        log.info('  sudo apt-get install cmake ninja-build g++');
        log.info('  pip install conan');
      } else if (os.platform() === 'win32') {
        log.info('  choco install cmake conan ninja');
      }
    }

    return allInstalled;
  }

  createConanfile(): boolean {
    log.section('Checking Conanfile');

    const conanfilePath = path.join(this.cppDir, 'conanfile.txt');

    if (fs.existsSync(conanfilePath)) {
      log.success('conanfile.txt exists');
      return true;
    }

    log.info('Creating conanfile.txt...');

    const conanfileContent = `[requires]
sqlite3/3.45.0
fmt/10.2.1
spdlog/1.13.0
nlohmann_json/3.11.3

[generators]
CMakeDeps
CMakeToolchain

[options]
sqlite3:shared=False

[layout]
cmake_layout
`;

    fs.writeFileSync(conanfilePath, conanfileContent);
    log.success('Created conanfile.txt');
    return true;
  }

  installConanDeps(): boolean {
    log.section('Installing Conan Dependencies');

    const conanfilePath = path.join(this.cppDir, 'conanfile.txt');
    if (!fs.existsSync(conanfilePath)) {
      log.error('conanfile.txt not found');
      return false;
    }

    log.info('Running conan install...');

    const buildType = process.env.CMAKE_BUILD_TYPE || 'Release';
    const result = this.exec(
      `conan install . --output-folder=build --build=missing -s build_type=${buildType}`
    );

    if (!result.success) {
      log.error('Conan install failed');
      return false;
    }

    log.success('Conan dependencies installed');
    return true;
  }

  configureCMake(buildType: 'Debug' | 'Release' = 'Release'): boolean {
    log.section('Configuring CMake with Ninja');

    if (!fs.existsSync(this.buildDir)) {
      fs.mkdirSync(this.buildDir, { recursive: true });
    }

    log.info(`Build type: ${buildType}`);

    const toolchainPath = path.join(this.buildDir, 'conan_toolchain.cmake');
    const cmakeArgs = [
      '-G Ninja',
      `-DCMAKE_BUILD_TYPE=${buildType}`,
      '-DCMAKE_EXPORT_COMPILE_COMMANDS=ON',
    ];

    if (fs.existsSync(toolchainPath)) {
      cmakeArgs.push(`-DCMAKE_TOOLCHAIN_FILE=${toolchainPath}`);
      log.info('Using Conan toolchain');
    }

    const result = this.exec(`cmake -B build ${cmakeArgs.join(' ')} .`);

    if (!result.success) {
      log.error('CMake configuration failed');
      return false;
    }

    log.success('CMake configured successfully');
    return true;
  }

  build(target = 'all', jobs = os.cpus().length): boolean {
    log.section('Building with Ninja');

    log.info(`Building target: ${target}`);
    log.info(`Using ${jobs} parallel jobs`);

    const result = this.exec(`cmake --build build --target ${target} -j ${jobs}`);

    if (!result.success) {
      log.error('Build failed');
      return false;
    }

    log.success('Build completed successfully');
    return true;
  }

  test(): boolean {
    log.section('Running Tests');

    const result = this.exec('ctest --test-dir build --output-on-failure');

    if (!result.success) {
      log.error('Tests failed');
      return false;
    }

    log.success('All tests passed');
    return true;
  }

  clean(): boolean {
    log.section('Cleaning Build Artifacts');

    if (fs.existsSync(this.buildDir)) {
      fs.rmSync(this.buildDir, { recursive: true, force: true });
      log.success('Build directory removed');
    } else {
      log.info('Build directory does not exist');
    }

    return true;
  }

  async run(args: string[]): Promise<boolean> {
    const command = args[0] || 'help';
    const options = args.slice(1);

    const buildType = options.includes('--debug') ? 'Debug' : 'Release';
    const jobsArg = options.find((o) => o.startsWith('--jobs='));
    const jobs = jobsArg ? parseInt(jobsArg.split('=')[1]) : os.cpus().length;

    switch (command) {
      case 'check':
        return this.checkDependencies();

      case 'init':
        return this.createConanfile();

      case 'install':
        if (!this.checkDependencies()) return false;
        return this.installConanDeps();

      case 'configure':
        if (!this.checkDependencies()) return false;
        return this.configureCMake(buildType as 'Debug' | 'Release');

      case 'build':
        if (!this.checkDependencies()) return false;
        const target = options.find((o) => !o.startsWith('--')) || 'all';
        return this.build(target, jobs);

      case 'test':
        return this.test();

      case 'clean':
        return this.clean();

      case 'rebuild':
        this.clean();
        if (!this.checkDependencies()) return false;
        if (!this.configureCMake(buildType as 'Debug' | 'Release')) return false;
        return this.build('all', jobs);

      case 'full':
        log.section('Full Build Workflow');
        if (!this.checkDependencies()) return false;
        if (!this.createConanfile()) return false;
        if (!this.installConanDeps()) return false;
        if (!this.configureCMake(buildType as 'Debug' | 'Release')) return false;
        return this.build('all', jobs);

      case 'help':
      default:
        this.showHelp();
        return true;
    }
  }

  private showHelp(): void {
    console.log(`
${COLORS.bright}C++ Build Assistant${COLORS.reset} - Conan + Ninja Build Helper

${COLORS.cyan}USAGE:${COLORS.reset}
  npm run cpp:build [command] [options]

${COLORS.cyan}COMMANDS:${COLORS.reset}
  ${COLORS.green}check${COLORS.reset}              Check if all dependencies are installed
  ${COLORS.green}init${COLORS.reset}               Initialize project (create conanfile if missing)
  ${COLORS.green}install${COLORS.reset}            Install Conan dependencies
  ${COLORS.green}configure${COLORS.reset}          Configure CMake with Ninja generator
  ${COLORS.green}build${COLORS.reset} [target]     Build the project (default: all)
  ${COLORS.green}test${COLORS.reset}               Run tests with CTest
  ${COLORS.green}clean${COLORS.reset}              Remove build artifacts
  ${COLORS.green}rebuild${COLORS.reset}            Clean and rebuild
  ${COLORS.green}full${COLORS.reset}               Full workflow: check → install → configure → build
  ${COLORS.green}help${COLORS.reset}               Show this help message

${COLORS.cyan}OPTIONS:${COLORS.reset}
  --debug              Use Debug build type
  --release            Use Release build type (default)
  --jobs=N             Number of parallel build jobs (default: CPU count)

${COLORS.cyan}EXAMPLES:${COLORS.reset}
  npm run cpp:build check
  npm run cpp:build full
  npm run cpp:build build dbal_daemon
  npm run cpp:build build -- --debug
  npm run cpp:build test
`);
  }
}

if (require.main === module) {
  const assistant = new CppBuildAssistant(path.join(__dirname, '..'));
  const args = process.argv.slice(2);

  assistant
    .run(args)
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      log.error(error.message || error);
      process.exit(1);
    });
}
