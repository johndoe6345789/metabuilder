#include "prisma_datasource_generator.hpp"

namespace dbal {
namespace core {

std::string PrismaDatasourceGenerator::generateDatasource() {
    return R"(datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
})";
}

std::string PrismaDatasourceGenerator::generateClient() {
    return R"(generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
})";
}

} // namespace core
} // namespace dbal
