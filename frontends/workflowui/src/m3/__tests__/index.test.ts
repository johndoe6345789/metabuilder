/**
 * Tests for local m3 re-export barrel
 * The module simply re-exports @metabuilder/m3 (which is mocked in tests)
 */

// m3 is mapped to __mocks__/m3Mock.tsx in jest config
import * as M3 from '../index';

describe('m3 index barrel', () => {
  it('exports Button', () => {
    expect(M3).toHaveProperty('Button');
  });

  it('exports Typography', () => {
    expect(M3).toHaveProperty('Typography');
  });

  it('exports Box', () => {
    expect(M3).toHaveProperty('Box');
  });

  it('exports Card', () => {
    expect(M3).toHaveProperty('Card');
  });
});
