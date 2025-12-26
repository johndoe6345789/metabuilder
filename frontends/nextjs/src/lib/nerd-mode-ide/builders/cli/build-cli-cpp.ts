export function buildCliCpp(): string {
  return [
    '#include <iostream>',
    '',
    'int main(int argc, char** argv) {',
    '  std::cout << "MetaBuilder CLI bootstrap" << std::endl;',
    '  std::cout << "Arguments: " << argc - 1 << std::endl;',
    '  return 0;',
    '}',
  ].join('\n')
}
