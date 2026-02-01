/**
 * Package Registry
 * Loads and manages all declarative UI packages
 */

// Import all package definitions statically (Next.js requires static imports for JSON)
import repoHomeUI from '../packages/repo_home/components/ui.json';
import repoHomeRoutes from '../packages/repo_home/page-config/routes.json';
import repoBrowseUI from '../packages/repo_browse/components/ui.json';
import repoBrowseRoutes from '../packages/repo_browse/page-config/routes.json';
import repoAuthUI from '../packages/repo_auth/components/ui.json';
import repoAuthRoutes from '../packages/repo_auth/page-config/routes.json';

// Package registry
const packages = {
  repo_home: { ui: repoHomeUI, routes: repoHomeRoutes },
  repo_browse: { ui: repoBrowseUI, routes: repoBrowseRoutes },
  repo_auth: { ui: repoAuthUI, routes: repoAuthRoutes },
};

// Build route-to-package mapping
const routeMap = {};
Object.entries(packages).forEach(([pkgId, pkg]) => {
  pkg.routes.forEach(route => {
    routeMap[route.path] = { ...route, packageId: pkgId, definition: pkg.ui };
  });
});

/**
 * Get package by ID
 */
export function getPackage(packageId) {
  return packages[packageId];
}

/**
 * Get all packages
 */
export function getAllPackages() {
  return packages;
}

/**
 * Get route config by path
 */
export function getRouteByPath(path) {
  return routeMap[path];
}

/**
 * Get all routes
 */
export function getAllRoutes() {
  return Object.values(routeMap);
}

/**
 * Get component definition from a package
 */
export function getComponent(packageId, componentId) {
  const pkg = packages[packageId];
  if (!pkg) return null;
  return pkg.ui.components?.find(c => c.id === componentId);
}

export default { getPackage, getAllPackages, getRouteByPath, getAllRoutes, getComponent };
