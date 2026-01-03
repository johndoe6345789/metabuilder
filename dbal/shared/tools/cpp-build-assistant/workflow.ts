import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { log } from './logging'
import type { ExecResult, ExecOptions } from './types'

export const execCommand = (command: string, cppDir: string, options: ExecOptions = {}): ExecResult => {
  try {
    const result = execSync(command, {
      cwd: options.cwd || cppDir,
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
    })
    return { success: true, output: result as string }
  } catch (error: unknown) {
    const execError = error as { message?: string; stdout?: string }
    return { success: false, error: execError.message, output: execError.stdout }
  }
}

export const ensureConanFile = (cppDir: string): boolean => {
  log.section('Checking Conanfile')

  const conanfilePath = path.join(cppDir, 'conanfile.txt')

  if (fs.existsSync(conanfilePath)) {
    log.success('conanfile.txt exists')
    return true
  }

  log.info('Creating conanfile.txt...')

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
`

  fs.writeFileSync(conanfilePath, conanfileContent)
  log.success('Created conanfile.txt')
  return true
}

export const installConanDeps = (cppDir: string, execFn: typeof execCommand): boolean => {
  log.section('Installing Conan Dependencies')

  const conanfilePath = path.join(cppDir, 'conanfile.txt')
  if (!fs.existsSync(conanfilePath)) {
    log.error('conanfile.txt not found')
    return false
  }

  log.info('Running conan install...')

  const buildType = process.env.CMAKE_BUILD_TYPE || 'Release'
  const result = execFn(`conan install . --output-folder=build --build=missing -s build_type=${buildType}`, cppDir)

  if (!result.success) {
    log.error('Conan install failed')
    return false
  }

  log.success('Conan dependencies installed')
  return true
}

export const configureCMake = (cppDir: string, buildType: 'Debug' | 'Release', execFn: typeof execCommand): boolean => {
  log.section('Configuring CMake with Ninja')

  const buildDir = path.join(cppDir, 'build')
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true })
  }

  log.info(`Build type: ${buildType}`)

  const toolchainPath = path.join(buildDir, 'conan_toolchain.cmake')
  const cmakeArgs = [
    '-G Ninja',
    `-DCMAKE_BUILD_TYPE=${buildType}`,
    '-DCMAKE_EXPORT_COMPILE_COMMANDS=ON',
  ]

  if (fs.existsSync(toolchainPath)) {
    cmakeArgs.push(`-DCMAKE_TOOLCHAIN_FILE=${toolchainPath}`)
    log.info('Using Conan toolchain')
  }

  const result = execFn(`cmake -B build ${cmakeArgs.join(' ')} .`, cppDir)

  if (!result.success) {
    log.error('CMake configuration failed')
    return false
  }

  log.success('CMake configured successfully')
  return true
}

export const buildTarget = (cppDir: string, target = 'all', jobs = os.cpus().length, execFn: typeof execCommand): boolean => {
  log.section('Building with Ninja')

  log.info(`Building target: ${target}`)
  log.info(`Using ${jobs} parallel jobs`)

  const result = execFn(`cmake --build build --target ${target} -j ${jobs}`, cppDir)

  if (!result.success) {
    log.error('Build failed')
    return false
  }

  log.success('Build completed successfully')
  return true
}

export const runTests = (cppDir: string, execFn: typeof execCommand): boolean => {
  log.section('Running Tests')

  const result = execFn('ctest --test-dir build --output-on-failure', cppDir)

  if (!result.success) {
    log.error('Tests failed')
    return false
  }

  log.success('All tests passed')
  return true
}

export const cleanBuild = (buildDir: string): boolean => {
  log.section('Cleaning Build Artifacts')

  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true })
    log.success('Build directory removed')
  } else {
    log.info('Build directory does not exist')
  }

  return true
}
