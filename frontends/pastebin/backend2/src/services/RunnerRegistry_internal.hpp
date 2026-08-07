#pragma once

#include "RunnerRegistry.hpp"

#include <map>
#include <string>

namespace pastebin {

void populateCoreRunners(std::map<std::string, RunnerSpec>& m);
void populateScriptRunners(std::map<std::string, RunnerSpec>& m);
void populateCompiledRunners(std::map<std::string, RunnerSpec>& m);
void populateMiscRunners(std::map<std::string, RunnerSpec>& m);
void populateSqlRunners(std::map<std::string, RunnerSpec>& m);

} // namespace pastebin
