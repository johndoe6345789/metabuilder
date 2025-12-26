#include <iostream>
#include <string>
#include <string_view>

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

struct PermissionLevelInfo {
  int id;
  const char* title;
  const char* description;
  const char* capabilities;
};

static constexpr PermissionLevelInfo permissionLevels[] = {
  {1, "Guest", "Read public marketing and landing pages.", "Access front page · View news feed · Browse docs"},
  {2, "Regular User", "Customize profile, dashboards, and personal settings.", "Update profile · Save dashboards · Post comments"},
  {3, "Moderator", "Triage reports, resolve flags, and keep the community civil.", "Review reports · Moderate threads · Apply warnings"},
  {4, "God", "Design workflows, seed packages, and edit the front page.", "Edit architecture · Seed packages · Define workflows"},
  {5, "Super God", "Transfer ownership, audit the system, and override safeguards.", "Promote gods · Transfer rights · Run audits"},
};

static void printLevels() {
  std::cout << "Permission levels inventory:" << std::endl;
  for (const auto& level : permissionLevels) {
    std::cout << "Level " << level.id << " · " << level.title << std::endl;
    std::cout << "  " << level.description << std::endl;
    std::cout << "  Capabilities: " << level.capabilities << std::endl;
  }
}

int main(int argc, char** argv) {
  for (int i = 1; i < argc; ++i) {
    if (std::string_view(argv[i]) == "--levels") {
      printLevels();
      return 0;
    }
  }

  const auto spec = parseSpec(argc, argv);
  printSpec(spec);
  std::cout << "- " << spec.projectName << "/README.md" << std::endl;
  std::cout << "- " << spec.projectName << "/package.json" << std::endl;
  std::cout << "- " << spec.projectName << "/src/app/page.tsx" << std::endl;
  std::cout << "- " << spec.projectName << "/cli/main.cpp" << std::endl;
  return 0;
}
