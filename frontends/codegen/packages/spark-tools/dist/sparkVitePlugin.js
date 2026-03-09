import { randomBytes } from 'crypto';
import sparkAgent from './agentPlugin.js';
import { tagSourcePlugin, designerHost } from './designerPlugin.js';
import { heartbeatPlugin } from './heartbeatPlugin.js';
import createIconImportProxy from './vitePhosphorIconProxyPlugin.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import 'os';

const require$1 = createRequire(import.meta.url);
const runtimeBuildPlugin = () => {
    return {
        name: 'runtime-wrapper',
        apply: 'build',
        generateBundle(options, bundle) {
            try {
                const runtimeProxyContent = readFileSync(require$1.resolve('./runtimeProxy'), 'utf-8');
                this.emitFile({
                    type: 'asset',
                    fileName: 'proxy.js',
                    source: runtimeProxyContent
                });
                const sparkPackageJsonContent = readFileSync(require$1.resolve('./spark.package.json'), 'utf-8');
                this.emitFile({
                    type: 'asset',
                    fileName: 'package.json',
                    source: sparkPackageJsonContent
                });
                console.log('Emitted proxy files to build output');
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn('⚠ Could not resolve files:', errorMessage);
            }
        }
    };
};

function findProjectRoot(startDir = process.cwd()) {
    let currentDir = startDir;
    while (currentDir !== path.dirname(currentDir)) {
        if (fs.existsSync(path.join(currentDir, 'package.json'))) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    return process.cwd();
}
function readSparkConfig() {
    try {
        const projectRoot = findProjectRoot();
        const configPath = path.join(projectRoot, 'runtime.config.json');
        if (fs.existsSync(configPath)) {
            const configContent = fs.readFileSync(configPath, 'utf-8');
            const config = JSON.parse(configContent);
            return config;
        }
    }
    catch (error) {
        console.warn('Warning: Could not read spark.json configuration file:', error);
    }
    return null;
}
const addGitHubAuth = (proxy, options) => {
    proxy.on('proxyReq', (proxyReq, req, res) => {
        if (process.env.GITHUB_TOKEN) {
            proxyReq.setHeader('Authorization', `bearer ${process.env.GITHUB_TOKEN}`);
        }
    });
};
function sparkVitePlugin(opts = {}) {
    const { serverURL = process.env.SPARK_AGENT_URL, agentDisabled = false, includeProxy = true, outputDir = process.env.OUTPUT_DIR || 'dist', githubRuntimeName = readSparkConfig()?.app || process.env.GITHUB_RUNTIME_PERMANENT_NAME, githubApiUrl = process.env.GITHUB_API_URL || 'https://api.github.com', port = 5000, corsOrigin = /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\]|(?:.*\.)?github\.com)(?::\d+)?$/, hmrOverlay = false, } = opts;
    const runningInWorkbench = !!process.env.SPARK_WORKBENCH_ID;
    const plugins = [
        createIconImportProxy(),
        // Main configuration plugin
        {
            name: 'spark-config',
            config: () => ({
                build: {
                    outDir: outputDir
                },
                define: {
                    GITHUB_RUNTIME_PERMANENT_NAME: JSON.stringify(githubRuntimeName),
                    BASE_KV_SERVICE_URL: JSON.stringify('/_spark/kv'),
                    VITE_SERVER_SESSION_ID: JSON.stringify(randomBytes(16).toString('hex')),
                    VITE_WORKBENCH_ORIGIN: JSON.stringify(process.env.SPARK_WORKBENCH_ORIGIN || 'https://github.com'),
                },
                optimizeDeps: {
                    include: [
                        "@phosphor-icons/react",
                        "@github/spark/hooks",
                        "sonner",
                        "react",
                        "recharts",
                        "react-day-picker",
                        "tailwind-merge",
                    ]
                },
                server: {
                    port,
                    hmr: {
                        overlay: hmrOverlay,
                    },
                    cors: {
                        origin: corsOrigin
                    },
                    watch: {
                        ignored: [
                            '**/prd.md',
                            '**.log',
                            '**/.azcopy/**',
                        ],
                        awaitWriteFinish: {
                            pollInterval: 50,
                            stabilityThreshold: 100,
                        },
                    },
                    proxy: {
                        '^/_spark/llm': {
                            target: 'https://models.github.ai/inference/chat/completions',
                            changeOrigin: true,
                            ignorePath: true,
                            configure: addGitHubAuth
                        },
                        '^/_spark/.*': {
                            target: githubApiUrl,
                            changeOrigin: true,
                            rewrite: (path) => {
                                const serviceName = path.replace('/_spark/', '').split('/')[0];
                                return path.replace(`/_spark/${serviceName}`, `/runtime/${githubRuntimeName}/${serviceName}`);
                            },
                            configure: addGitHubAuth
                        }
                    },
                },
            })
        }
    ];
    if (includeProxy) {
        plugins.push(runtimeBuildPlugin());
    }
    // Add workbench-specific plugins only when running in workbench
    if (runningInWorkbench) {
        plugins.unshift(sparkAgent({ serverURL, disabled: agentDisabled }), tagSourcePlugin(), heartbeatPlugin(), designerHost());
    }
    return plugins;
}

export { sparkVitePlugin as default };
//# sourceMappingURL=sparkVitePlugin.js.map
