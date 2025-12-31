/**
 * CSS Loader Utility
 *
 * This utility demonstrates how to load CSS from the database
 * and inject it into the application at runtime.
 *
 * Usage:
 *   import { CSSLoader } from '@/utils/cssLoader';
 *
 *   const loader = new CSSLoader();
 *   await loader.loadPackageStyles('ui_home');
 *   await loader.loadGlobalStyles();
 */

interface StyleEntry {
  id: string;
  package_id: string;
  type: 'global' | 'component' | 'utility' | 'animation';
  category: string | null;
  class_name: string | null;
  description: string | null;
  priority: number;
  css: string;
  enabled: boolean;
}

interface StyleVariable {
  name: string;
  value: string;
  type: 'color' | 'size' | 'font' | 'number' | 'string';
}

export class CSSLoader {
  private loadedStyles: Set<string> = new Set();
  private styleElements: Map<string, HTMLStyleElement> = new Map();

  /**
   * Load all global styles (theme, base, etc.)
   */
  async loadGlobalStyles(): Promise<void> {
    const styles = await this.fetchStyles({
      type: 'global',
      enabled: true,
    });

    this.injectStyles('global-styles', styles);
  }

  /**
   * Load styles for a specific package
   */
  async loadPackageStyles(packageId: string): Promise<void> {
    if (this.loadedStyles.has(packageId)) {
      console.log(`Styles for package ${packageId} already loaded`);
      return;
    }

    const styles = await this.fetchStyles({
      package_id: packageId,
      enabled: true,
    });

    this.injectStyles(`package-${packageId}`, styles);
    this.loadedStyles.add(packageId);
  }

  /**
   * Load styles by type (component, utility, animation)
   */
  async loadStylesByType(type: StyleEntry['type']): Promise<void> {
    const styles = await this.fetchStyles({
      type,
      enabled: true,
    });

    this.injectStyles(`type-${type}`, styles);
  }

  /**
   * Reload a specific style entry (for live editing)
   */
  async reloadStyle(styleId: string): Promise<void> {
    const style = await this.fetchStyleById(styleId);

    if (!style) {
      console.error(`Style ${styleId} not found`);
      return;
    }

    // Find or create style element
    let styleEl = this.styleElements.get(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = `style-${styleId}`;
      styleEl.dataset.styleId = styleId;
      document.head.appendChild(styleEl);
      this.styleElements.set(styleId, styleEl);
    }

    styleEl.textContent = style.css;
    console.log(`Reloaded style: ${styleId}`);
  }

  /**
   * Load and apply CSS variables from database
   */
  async loadStyleVariables(): Promise<void> {
    const variables = await this.fetchStyleVariables();

    const cssVars = variables.map(v => `  ${v.name}: ${v.value};`).join('\n');
    const css = `:root {\n${cssVars}\n}`;

    this.injectStyles('css-variables', [{
      id: 'css-vars',
      css,
      priority: 0,
    } as StyleEntry]);
  }

  /**
   * Update a CSS variable value
   */
  async updateVariable(name: string, value: string): Promise<void> {
    await this.saveStyleVariable(name, value);
    await this.loadStyleVariables();
  }

  /**
   * Unload styles for a package
   */
  unloadPackageStyles(packageId: string): void {
    const elementId = `package-${packageId}`;
    const element = this.styleElements.get(elementId);

    if (element) {
      element.remove();
      this.styleElements.delete(elementId);
      this.loadedStyles.delete(packageId);
      console.log(`Unloaded styles for package: ${packageId}`);
    }
  }

  /**
   * Clear all dynamically loaded styles
   */
  clearAllStyles(): void {
    this.styleElements.forEach((el) => el.remove());
    this.styleElements.clear();
    this.loadedStyles.clear();
  }

  /**
   * Inject styles into the DOM
   */
  private injectStyles(elementId: string, styles: StyleEntry[]): void {
    // Sort by priority
    const sorted = [...styles].sort((a, b) => a.priority - b.priority);

    // Combine CSS
    const css = sorted.map(s => {
      const comment = `/* ${s.id}: ${s.description || 'No description'} */\n`;
      return comment + s.css;
    }).join('\n\n');

    // Create or update style element
    let styleEl = this.styleElements.get(elementId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = elementId;
      styleEl.dataset.source = 'database';
      document.head.appendChild(styleEl);
      this.styleElements.set(elementId, styleEl);
    }

    styleEl.textContent = css;
    console.log(`Injected ${styles.length} styles as ${elementId}`);
  }

  /**
   * Fetch styles from database (API call)
   */
  private async fetchStyles(filters: Partial<StyleEntry>): Promise<StyleEntry[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`/api/styles?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch styles: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetch a single style by ID
   */
  private async fetchStyleById(styleId: string): Promise<StyleEntry | null> {
    const response = await fetch(`/api/styles/${styleId}`);
    if (!response.ok) {
      return null;
    }

    return response.json();
  }

  /**
   * Fetch all CSS variables
   */
  private async fetchStyleVariables(): Promise<StyleVariable[]> {
    const response = await fetch('/api/style-variables');
    if (!response.ok) {
      throw new Error(`Failed to fetch style variables: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Save/update a CSS variable
   */
  private async saveStyleVariable(name: string, value: string): Promise<void> {
    const response = await fetch('/api/style-variables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save variable: ${response.statusText}`);
    }
  }
}

/**
 * Singleton instance for global use
 */
export const cssLoader = new CSSLoader();

/**
 * React Hook for loading package styles
 */
export function usePackageStyles(packageId: string) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    cssLoader
      .loadPackageStyles(packageId)
      .then(() => setLoaded(true))
      .catch(setError);

    return () => {
      // Optional: Unload on unmount
      // cssLoader.unloadPackageStyles(packageId);
    };
  }, [packageId]);

  return { loaded, error };
}

/**
 * Initialize CSS system
 * Call this early in your app initialization
 */
export async function initializeCSSSystem() {
  try {
    // 1. Load CSS variables first
    await cssLoader.loadStyleVariables();

    // 2. Load global styles
    await cssLoader.loadGlobalStyles();

    // 3. Load utility styles
    await cssLoader.loadStylesByType('utility');

    // 4. Load animation styles
    await cssLoader.loadStylesByType('animation');

    console.log('CSS system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize CSS system:', error);
    throw error;
  }
}

/**
 * Live CSS Editor Support
 * Listen for style updates from CSS Designer
 */
export function enableLiveCSS() {
  if (typeof window === 'undefined') return;

  // WebSocket or Server-Sent Events for live updates
  const eventSource = new EventSource('/api/styles/live');

  eventSource.addEventListener('style-updated', (event) => {
    const { styleId } = JSON.parse(event.data);
    cssLoader.reloadStyle(styleId);
  });

  eventSource.addEventListener('variable-updated', () => {
    cssLoader.loadStyleVariables();
  });

  return () => {
    eventSource.close();
  };
}

// Example usage in app initialization:
//
// import { initializeCSSSystem, enableLiveCSS } from '@/utils/cssLoader';
//
// async function main() {
//   await initializeCSSSystem();
//
//   if (process.env.NODE_ENV === 'development') {
//     enableLiveCSS();
//   }
// }
