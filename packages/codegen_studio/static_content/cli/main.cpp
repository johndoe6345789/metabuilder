#include <iostream>
#include <string>

int main(int argc, char** argv) {
  std::string project = "starter-app";
  if (argc > 1 && argv[1] != nullptr) {
    project = argv[1];
  }

  std::cout << "Codegen Studio CLI" << std::endl;
  std::cout << "Project: " << project << std::endl;
  std::cout << "Zip entries:" << std::endl;
  std::cout << "- " << project << "/README.md" << std::endl;
  std::cout << "- " << project << "/package.json" << std::endl;
  std::cout << "- " << project << "/src/app/page.tsx" << std::endl;

  return 0;
}
