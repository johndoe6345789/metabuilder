import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, "../../../..");

const backend = process.env.BACKEND_URL || "http://localhost:9000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_BASE_PATH || "",
  output: "standalone",
  transpilePackages: [
    "@shared/m3",
    "@shared/components",
    "@shared/hooks",
    "@shared/hooks-canvas",
    "@shared/icons",
    "@shared/redux-core",
    "@shared/redux-slices",
    "@shared/scss",
    "@shared/service-adapters",
  ],
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
    includePaths: [
      path.join(monorepoRoot, "shared", "scss"),
      path.join(monorepoRoot, "shared", "scss", "m3-scss"),
    ],
    loadPaths: [
      path.join(monorepoRoot, "shared", "scss", "m3-scss"),
      path.join(monorepoRoot, "shared", "scss"),
    ],
  },
  turbopack: { root: monorepoRoot },
  async rewrites() {
    return [
      {
        source: "/api/s3/health",
        destination: `${backend}/health`,
      },
      {
        source: "/api/s3/buckets",
        destination: `${backend}/`,
      },
      {
        source: "/api/s3/buckets/:bucket",
        destination: `${backend}/:bucket`,
      },
      {
        source: "/api/s3/list/:bucket",
        destination: `${backend}/list/:bucket`,
      },
      {
        source: "/api/s3/objects/:bucket/:key*",
        destination: `${backend}/:bucket/:key*`,
      },
    ];
  },
};

export default nextConfig;
