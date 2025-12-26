#include <iostream>
#include <string>

struct ProjectSpec {
  std::string projectName{"starter-app"};
  std::string runtime{"web"};
  std::string packageId{"codegen_studio"};
  std::string tone{"adaptive"};
};

static ProjectSpec parseSpec(int argc, char** argv) {
  ProjectSpec spec;
  if (argc > 1 && argv[1] != nullptr) {
    spec.projectName = argv[1];
  }
  if (argc > 2 && argv[2] != nullptr) {
    spec.runtime = argv[2];
  }
  if (argc > 3 && argv[3] != nullptr) {
    spec.packageId = argv[3];
  }
  if (argc > 4 && argv[4] != nullptr) {
    spec.tone = argv[4];
  }
  return spec;
}

static void printSpec(const ProjectSpec& spec) {
  std::cout << "Codegen Studio CLI" << std::endl;
  std::cout << "Project: " << spec.projectName << std::endl;
  std::cout << "Runtime: " << spec.runtime << std::endl;
  std::cout << "Package: " << spec.packageId << std::endl;
  std::cout << "Tone: " << spec.tone << std::endl;
  std::cout << "Zip manifest: " << spec.projectName << "/spec.json" << std::endl;
  std::cout << "Zip includes Next.js + CLI stubs." << std::endl;
}

int main(int argc, char** argv) {
  const auto spec = parseSpec(argc, argv);
  printSpec(spec);
  std::cout << "- " << spec.projectName << "/README.md" << std::endl;
  std::cout << "- " << spec.projectName << "/package.json" << std::endl;
  std::cout << "- " << spec.projectName << "/src/app/page.tsx" << std::endl;
  std::cout << "- " << spec.projectName << "/cli/main.cpp" << std::endl;
  return 0;
}
