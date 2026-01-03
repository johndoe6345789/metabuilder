import { execSync } from 'child_process'
import os from 'os'
import { log } from './logging'

export const checkCommand = (command: string, name: string): boolean => {
  try {
    execSync(`${command} --version`, { stdio: 'pipe' })
    log.success(`${name} is installed`)
    return true
  } catch {
    log.error(`${name} is NOT installed`)
    return false
  }
}

export const checkDependencies = (): boolean => {
  log.section('Checking Dependencies')

  const deps = [
    { cmd: 'cmake', name: 'CMake' },
    { cmd: 'conan', name: 'Conan' },
    { cmd: 'ninja', name: 'Ninja' },
    { cmd: 'g++', name: 'GCC' },
  ]

  const results = deps.map(({ cmd, name }) => ({
    name,
    installed: checkCommand(cmd, name),
  }))

  const allInstalled = results.every(result => result.installed)

  if (!allInstalled) {
    log.warn('\nSome dependencies are missing. Install them:')

    if (os.platform() === 'darwin') {
      log.info('  brew install cmake conan ninja gcc')
    } else if (os.platform() === 'linux') {
      log.info('  sudo apt-get install cmake ninja-build g++')
      log.info('  pip install conan')
    } else if (os.platform() === 'win32') {
      log.info('  choco install cmake conan ninja')
    }
  }

  return allInstalled
}
