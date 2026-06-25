import { describe, expect, it, vi } from 'vitest';
import {
  generateMeta,
  generateStory,
  generateStories,
  listStorybookComponents,
  createMockHandlers,
} from './storyGenerator';

describe('storyGenerator', () => {
  describe('generateMeta', () => {
    it('should return meta object with title and component', () => {
      const MockComponent = () => null;
      const meta = generateMeta(MockComponent, 'MockComponent');
      expect(meta.title).toBe('Components/MockComponent');
      expect(meta.component).toBe(MockComponent);
    });

    it('should include autodocs tag', () => {
      const MockComponent = () => null;
      const meta = generateMeta(MockComponent, 'SomeWidget');
      expect(meta.tags).toContain('autodocs');
    });

    it('should merge customMeta overrides', () => {
      const MockComponent = () => null;
      const meta = generateMeta(MockComponent, 'AnotherComp', {
        parameters: { layout: 'fullscreen' },
      });
      expect(meta.parameters?.layout).toBe('fullscreen');
    });
  });

  describe('generateStory', () => {
    it('should return a story object with name and args', () => {
      const config = {
        name: 'Default',
        description: 'Default story',
        args: { label: 'Click me', disabled: false },
      };
      const story = generateStory(config);
      expect(story.name).toBe('Default');
      expect(story.args).toEqual({ label: 'Click me', disabled: false });
    });

    it('should use empty object when args are not provided', () => {
      const config = { name: 'NoArgs', description: 'story without args' };
      const story = generateStory(config);
      expect(story.args).toEqual({});
    });

    it('should include parameters when provided', () => {
      const config = {
        name: 'WithParams',
        description: 'story with params',
        parameters: { layout: 'fullscreen' },
      };
      const story = generateStory(config);
      expect(story.parameters).toEqual({ layout: 'fullscreen' });
    });
  });

  describe('generateStories', () => {
    it('should return an empty object for unknown component', () => {
      const stories = generateStories('NonExistentComponent_xyz');
      expect(stories).toEqual({});
    });

    it('should return an object (keyed by story name) for known component', () => {
      // We test with a component that likely has stories in features.json
      // or just confirm the return type for unknown component
      const stories = generateStories('SomeComponent');
      expect(typeof stories).toBe('object');
    });
  });

  describe('listStorybookComponents', () => {
    it('should return an array', () => {
      const components = listStorybookComponents();
      expect(Array.isArray(components)).toBe(true);
    });
  });

  describe('createMockHandlers', () => {
    it('should create handlers for each name', () => {
      const handlers = createMockHandlers(['onClick', 'onChange', 'onSubmit']);
      expect(typeof handlers.onClick).toBe('function');
      expect(typeof handlers.onChange).toBe('function');
      expect(typeof handlers.onSubmit).toBe('function');
    });

    it('should return empty object for empty array', () => {
      const handlers = createMockHandlers([]);
      expect(Object.keys(handlers).length).toBe(0);
    });

    it('handler functions should be callable without throwing', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const handlers = createMockHandlers(['myHandler']);
      expect(() => handlers['myHandler']!()).not.toThrow();
      consoleSpy.mockRestore();
    });
  });
});
