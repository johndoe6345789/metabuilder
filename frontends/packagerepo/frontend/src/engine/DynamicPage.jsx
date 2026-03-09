'use client';
import { Renderer } from './Renderer';
import { getRouteByPath } from './registry';

/**
 * Dynamic Page Component
 * Renders a page from JSON definition based on the current route
 */
export function DynamicPage({ path, context = {} }) {
  const route = getRouteByPath(path);

  if (!route) {
    return (
      <div className="container">
        <div className="alert alert--error">Page not found: {path}</div>
      </div>
    );
  }

  return <Renderer definition={route.definition} context={context} />;
}

/**
 * Higher-order component to wrap a page with dynamic rendering
 */
export function withDynamicPage(path) {
  return function DynamicPageWrapper(props) {
    return <DynamicPage path={path} context={props} />;
  };
}

export default DynamicPage;
