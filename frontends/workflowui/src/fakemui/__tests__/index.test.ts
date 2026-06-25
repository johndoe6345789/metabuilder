/**
 * Tests for local m3 re-export barrel
 * The module simply re-exports @metabuilder/m3 (which is mocked in tests)
 */

// m3 is mapped to __mocks__/fakeMuiMock.tsx in jest config
import * as FakeMui from '../index';

describe('m3 index barrel', () => {
  it('exports Button', () => {
    expect(FakeMui).toHaveProperty('Button');
  });

  it('exports Typography', () => {
    expect(FakeMui).toHaveProperty('Typography');
  });

  it('exports Box', () => {
    expect(FakeMui).toHaveProperty('Box');
  });

  it('exports Card', () => {
    expect(FakeMui).toHaveProperty('Card');
  });
});
