/**
 * CSS Schema V2 to CSS Compiler
 *
 * Compiles the abstract V2 schema to actual CSS that can be injected into the page.
 * This demonstrates how the GUI designer's output becomes real CSS.
 */

interface StylesSchemaV2 {
  schema_version: string;
  package: string;
  tokens?: TokensSection;
  selectors?: Selector[];
  effects?: Effect[];
  appearance?: Appearance[];
  layouts?: Layout[];
  transitions?: Transition[];
  rules?: Rule[];
  environments?: Environment[];
}

interface TokensSection {
  colors?: Record<string, ColorToken>;
  spacing?: {
    unit?: { type: string; value: { number: number; unit: string } };
    scale?: number[];
  };
  typography?: {
    fontFamily?: Record<string, string>;
  };
}

interface ColorToken {
  type: string;
  value: string;
  metadata?: {
    name?: string;
    category?: string;
  };
}

interface Selector {
  id: string;
  predicate: {
    targetType: string;
    classes: string[];
    states: string[];
    relationship?: {
      type: string;
      ancestor: {
        targetType: string;
        classes: string[];
      };
    };
  };
}

interface Effect {
  id: string;
  properties: Record<string, any>;
}

interface Appearance {
  id: string;
  layers: Layer[];
  clip?: string;
}

interface Layer {
  type: string;
  order?: number;
  properties: Record<string, any>;
}

interface Layout {
  id: string;
  type: string;
  constraints: any;
}

interface Transition {
  id: string;
  trigger: { state: string };
  properties: string[];
  duration: { value: number; unit: string };
  easing: string;
}

interface Rule {
  id: string;
  selector: string;
  priority: {
    importance: string;
    origin?: string;
    specificity: { ids: number; classes: number; types: number };
    sourceOrder: number;
  };
  effects?: { ref: string };
  appearance?: { ref: string };
  transition?: { ref: string };
  layout?: { ref: string };
  enabled: boolean;
}

interface Environment {
  id: string;
  conditions: {
    viewport?: {
      minWidth?: { value: number; unit: string };
      maxWidth?: { value: number; unit: string };
    };
    colorScheme?: string;
  };
}

export class StylesCompiler {
  private schema: StylesSchemaV2;
  private cssVariables: Map<string, string> = new Map();

  constructor(schema: StylesSchemaV2) {
    this.schema = schema;
    this.extractTokens();
  }

  /**
   * Extract tokens as CSS custom properties
   */
  private extractTokens() {
    if (!this.schema.tokens) return;

    // Colors
    if (this.schema.tokens.colors) {
      Object.entries(this.schema.tokens.colors).forEach(([key, token]) => {
        this.cssVariables.set(`--color-${key}`, token.value);
      });
    }

    // Spacing
    if (this.schema.tokens.spacing?.unit) {
      const { number, unit } = this.schema.tokens.spacing.unit.value;
      this.cssVariables.set('--spacing-unit', `${number}${unit}`);
    }
  }

  /**
   * Build a CSS selector from predicate
   */
  private buildSelector(selectorId: string): string {
    const selector = this.schema.selectors?.find(s => s.id === selectorId);
    if (!selector) return '';

    const { predicate } = selector;
    let css = '';

    // Map component types to FakeMUI classes
    const typeMap: Record<string, string> = {
      'Text': '.text',
      'Button': '.button',
      'Card': '.card',
      'Box': '.box',
      'Input': '.input',
      'Table': '.table',
      'TableRow': '.table-row',
      'Nav': '.nav',
      'Section': '.section',
    };

    const baseClass = typeMap[predicate.targetType] || `.${predicate.targetType.toLowerCase()}`;
    const packagePrefix = this.schema.package || '';

    // Add classes with package prefix
    const classSelectors = predicate.classes.map(c => {
      // If class already has package prefix, use as-is
      if (c.startsWith(packagePrefix + '_')) {
        return `.${c}`;
      }
      // Otherwise, add package prefix
      return `.${packagePrefix}_${c}`;
    }).join('');

    // Add states
    const stateSelectors = predicate.states.map(s => `:${s}`).join('');

    // Generate selector with package prefix
    // E.g., ui_level3 + "button" => `.ui_level3_button`
    css = `${classSelectors}${stateSelectors}`;

    // Handle relationship
    if (predicate.relationship) {
      const ancestorType = typeMap[predicate.relationship.ancestor.targetType] ||
                          `.${predicate.relationship.ancestor.targetType.toLowerCase()}`;
      const ancestorClasses = predicate.relationship.ancestor.classes.map(c => {
        if (c.startsWith(packagePrefix + '_')) {
          return `.${c}`;
        }
        return `.${packagePrefix}_${c}`;
      }).join('');

      if (predicate.relationship.type === 'descendant') {
        css = `${ancestorType}${ancestorClasses} ${css}`;
      } else if (predicate.relationship.type === 'child') {
        css = `${ancestorType}${ancestorClasses} > ${css}`;
      }
    }

    return css;
  }

  /**
   * Compile effect properties to CSS
   */
  private compileEffectProperties(effectId: string): string {
    const effect = this.schema.effects?.find(e => e.id === effectId);
    if (!effect) return '';

    const properties: string[] = [];

    Object.entries(effect.properties).forEach(([prop, value]) => {
      const cssProperty = this.convertPropertyName(prop);
      const cssValue = this.convertPropertyValue(value);

      if (cssValue) {
        properties.push(`  ${cssProperty}: ${cssValue};`);
      }
    });

    return properties.join('\n');
  }

  /**
   * Convert camelCase to kebab-case
   */
  private convertPropertyName(prop: string): string {
    return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  /**
   * Convert typed property value to CSS value
   */
  private convertPropertyValue(value: any): string {
    if (!value) return '';

    // Token reference
    if (value.token) {
      return `var(--color-${value.token})`;
    }

    // Length value
    if (value.value !== undefined && value.unit) {
      return `${value.value}${value.unit}`;
    }

    // Number
    if (typeof value === 'number') {
      return value.toString();
    }

    // String
    if (typeof value === 'string') {
      return value;
    }

    // Responsive breakpoints
    if (value.type === 'responsive' && value.breakpoints) {
      // Return the largest breakpoint value for now
      const sizes = Object.keys(value.breakpoints).sort().reverse();
      const largest = value.breakpoints[sizes[0]];
      return `${largest.value}${largest.unit}`;
    }

    // Transform
    if (value.type === 'transform') {
      const transforms: string[] = [];
      if (value.value.translateY) {
        transforms.push(`translateY(${value.value.translateY.value}${value.value.translateY.unit})`);
      }
      if (value.value.translateX) {
        transforms.push(`translateX(${value.value.translateX.value}${value.value.translateX.unit})`);
      }
      if (value.value.scale) {
        transforms.push(`scale(${value.value.scale})`);
      }
      if (value.value.rotate) {
        transforms.push(`rotate(${value.value.rotate.value}${value.value.rotate.unit || 'deg'})`);
      }
      return transforms.join(' ');
    }

    return '';
  }

  /**
   * Compile appearance layers to CSS
   */
  private compileAppearance(appearanceId: string): string {
    const appearance = this.schema.appearance?.find(a => a.id === appearanceId);
    if (!appearance) return '';

    const properties: string[] = [];

    // Sort layers by order
    const sortedLayers = [...appearance.layers].sort((a, b) => (a.order || 0) - (b.order || 0));

    sortedLayers.forEach(layer => {
      if (layer.type === 'background' && layer.properties.gradient) {
        const gradient = this.compileGradient(layer.properties.gradient);
        properties.push(`  background: ${gradient};`);
      }

      if (layer.type === 'border' && layer.properties) {
        if (layer.properties.width) {
          properties.push(`  border-width: ${layer.properties.width.value}${layer.properties.width.unit};`);
        }
        if (layer.properties.style) {
          properties.push(`  border-style: ${layer.properties.style};`);
        }
        if (layer.properties.color) {
          const color = layer.properties.color.token
            ? `var(--color-${layer.properties.color.token})`
            : layer.properties.color;
          properties.push(`  border-color: ${color};`);
        }
        if (layer.properties.radius) {
          properties.push(`  border-radius: ${layer.properties.radius.value}${layer.properties.radius.unit};`);
        }
      }

      if (layer.type === 'shadow' && layer.properties) {
        const shadow = [
          layer.properties.offsetX ? `${layer.properties.offsetX.value}${layer.properties.offsetX.unit}` : '0',
          layer.properties.offsetY ? `${layer.properties.offsetY.value}${layer.properties.offsetY.unit}` : '0',
          layer.properties.blur ? `${layer.properties.blur.value}${layer.properties.blur.unit}` : '0',
          layer.properties.spread ? `${layer.properties.spread.value}${layer.properties.spread.unit}` : '0',
          layer.properties.color?.value || 'rgba(0,0,0,0.1)',
        ].join(' ');
        properties.push(`  box-shadow: ${shadow};`);
      }

      if (layer.type === 'foreground' && layer.properties.color) {
        const color = layer.properties.color.value?.token
          ? `var(--color-${layer.properties.color.value.token})`
          : layer.properties.color.value;
        properties.push(`  color: ${color};`);
      }
    });

    // Handle clip
    if (appearance.clip === 'text') {
      properties.push('  background-clip: text;');
      properties.push('  -webkit-background-clip: text;');
      properties.push('  -webkit-text-fill-color: transparent;');
      properties.push('  color: transparent;');
    }

    return properties.join('\n');
  }

  /**
   * Compile gradient definition
   */
  private compileGradient(gradient: any): string {
    const { type, angle, stops } = gradient;

    const stopStrings = stops.map((stop: any) => {
      const color = stop.color.token
        ? `var(--color-${stop.color.token})`
        : stop.color.value;
      return `${color} ${stop.position * 100}%`;
    });

    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${stopStrings.join(', ')})`;
    }

    return '';
  }

  /**
   * Compile transition
   */
  private compileTransition(transitionId: string): string {
    const transition = this.schema.transitions?.find(t => t.id === transitionId);
    if (!transition) return '';

    const properties = transition.properties.map(p => this.convertPropertyName(p)).join(', ');
    const duration = `${transition.duration.value}${transition.duration.unit}`;
    const easing = transition.easing;

    return `  transition: ${properties} ${duration} ${easing};`;
  }

  /**
   * Compile all rules to CSS
   */
  public compile(): string {
    const css: string[] = [];

    // Add CSS custom properties
    if (this.cssVariables.size > 0) {
      css.push(':root {');
      this.cssVariables.forEach((value, key) => {
        css.push(`  ${key}: ${value};`);
      });
      css.push('}');
      css.push('');
    }

    // Sort rules by priority
    const sortedRules = [...(this.schema.rules || [])].sort((a, b) => {
      return a.priority.sourceOrder - b.priority.sourceOrder;
    });

    // Compile each rule
    sortedRules.forEach(rule => {
      if (!rule.enabled) return;

      const selector = this.buildSelector(rule.selector);
      if (!selector) return;

      css.push(`${selector} {`);

      // Add effects
      if (rule.effects) {
        const effectsCSS = this.compileEffectProperties(rule.effects.ref);
        if (effectsCSS) css.push(effectsCSS);
      }

      // Add appearance
      if (rule.appearance) {
        const appearanceCSS = this.compileAppearance(rule.appearance.ref);
        if (appearanceCSS) css.push(appearanceCSS);
      }

      // Add transition
      if (rule.transition) {
        const transitionCSS = this.compileTransition(rule.transition.ref);
        if (transitionCSS) css.push(transitionCSS);
      }

      css.push('}');
      css.push('');
    });

    // Add responsive breakpoints
    this.compileResponsive(css);

    return css.join('\n');
  }

  /**
   * Compile responsive styles
   */
  private compileResponsive(css: string[]) {
    // Group rules by environment
    this.schema.environments?.forEach(env => {
      if (!env.conditions.viewport) return;

      const mediaQuery: string[] = [];

      if (env.conditions.viewport.minWidth) {
        const { value, unit } = env.conditions.viewport.minWidth;
        mediaQuery.push(`min-width: ${value}${unit}`);
      }

      if (env.conditions.viewport.maxWidth) {
        const { value, unit } = env.conditions.viewport.maxWidth;
        mediaQuery.push(`max-width: ${value}${unit}`);
      }

      if (mediaQuery.length > 0) {
        css.push(`@media (${mediaQuery.join(' and ')}) {`);

        // Add responsive styles here
        // For now, just compile all rules again
        // In a full implementation, you'd filter rules by environment

        css.push('}');
        css.push('');
      }
    });
  }
}

/**
 * Compile V2 schema to CSS
 */
export function compileToCSS(schema: StylesSchemaV2): string {
  const compiler = new StylesCompiler(schema);
  return compiler.compile();
}

/**
 * Load and compile styles from a package
 */
export async function loadPackageStyles(packageId: string): Promise<string> {
  try {
    const response = await fetch(`/packages/${packageId}/seed/styles.json`);
    const schema = await response.json();

    // Check if it's V2 schema
    if (schema.schema_version || schema.package) {
      return compileToCSS(schema);
    } else {
      // V1: Just extract CSS strings
      return schema.map((entry: any) => entry.css || '').join('\n\n');
    }
  } catch (error) {
    console.error(`Failed to load styles for package ${packageId}:`, error);
    return '';
  }
}

/**
 * Inject compiled CSS into the page
 */
export function injectStyles(packageId: string, css: string) {
  const styleId = `styles-${packageId}`;

  let styleEl = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.dataset.package = packageId;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = css;
}

/**
 * Load and inject package styles
 */
export async function loadAndInjectStyles(packageId: string) {
  const css = await loadPackageStyles(packageId);
  injectStyles(packageId, css);
  return css;
}
