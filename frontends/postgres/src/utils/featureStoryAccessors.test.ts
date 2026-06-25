import { describe, expect, it } from 'vitest';
import {
  getAllPlaywrightPlaybooks,
  getAllStorybookStories,
  getPlaywrightPlaybook,
  getPlaywrightPlaybooksByTag,
  getStorybookStoriesForComponent,
  getStorybookStory,
} from './featureStoryAccessors';

describe('featureStoryAccessors', () => {
  describe('getPlaywrightPlaybook', () => {
    it('should return a playbook by name if it exists', () => {
      const all = getAllPlaywrightPlaybooks();
      const names = Object.keys(all);
      if (names.length > 0) {
        const firstName = names[0]!;
        const pb = getPlaywrightPlaybook(firstName);
        expect(pb).toBeDefined();
        expect(pb?.name).toBeDefined();
        expect(Array.isArray(pb?.steps)).toBe(true);
      }
    });

    it('should return undefined for non-existent playbook', () => {
      expect(getPlaywrightPlaybook('non-existent-playbook')).toBeUndefined();
    });
  });

  describe('getAllPlaywrightPlaybooks', () => {
    it('should return an object (possibly empty)', () => {
      const books = getAllPlaywrightPlaybooks();
      expect(typeof books).toBe('object');
      expect(books).not.toBeNull();
    });

    it('should have playbooks with required properties', () => {
      const books = getAllPlaywrightPlaybooks();
      Object.values(books).forEach(pb => {
        expect(pb).toHaveProperty('name');
        expect(pb).toHaveProperty('description');
        expect(pb).toHaveProperty('steps');
        expect(Array.isArray(pb.steps)).toBe(true);
      });
    });
  });

  describe('getPlaywrightPlaybooksByTag', () => {
    it('should return an array', () => {
      const result = getPlaywrightPlaybooksByTag('smoke');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return only playbooks with the given tag', () => {
      const all = getAllPlaywrightPlaybooks();
      const smokeBooks = Object.values(all).filter(pb =>
        pb.tags?.includes('smoke'),
      );
      const result = getPlaywrightPlaybooksByTag('smoke');
      expect(result.length).toBe(smokeBooks.length);
    });

    it('should return empty array for non-existent tag', () => {
      const result = getPlaywrightPlaybooksByTag(
        'non-existent-tag-xyz-12345',
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('getStorybookStory', () => {
    it('should return undefined for non-existent component/story', () => {
      expect(
        getStorybookStory('NonExistentComp', 'NonExistentStory'),
      ).toBeUndefined();
    });

    it('should return a story if it exists', () => {
      const all = getAllStorybookStories();
      const compNames = Object.keys(all);
      if (compNames.length > 0) {
        const comp = compNames[0]!;
        const stories = all[comp]!;
        const storyNames = Object.keys(stories);
        if (storyNames.length > 0) {
          const story = getStorybookStory(comp, storyNames[0]!);
          expect(story).toBeDefined();
          expect(story?.name).toBeDefined();
        }
      }
    });
  });

  describe('getAllStorybookStories', () => {
    it('should return an object', () => {
      const stories = getAllStorybookStories();
      expect(typeof stories).toBe('object');
    });
  });

  describe('getStorybookStoriesForComponent', () => {
    it('should return empty object for non-existent component', () => {
      const result = getStorybookStoriesForComponent('NoSuchComp');
      expect(result).toEqual({});
    });

    it('should return stories for a known component', () => {
      const all = getAllStorybookStories();
      const comps = Object.keys(all);
      if (comps.length > 0) {
        const comp = comps[0]!;
        const stories = getStorybookStoriesForComponent(comp);
        expect(typeof stories).toBe('object');
        expect(Object.keys(stories).length).toBeGreaterThan(0);
      }
    });
  });
});
