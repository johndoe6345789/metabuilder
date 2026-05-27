/**
 * Tests for local fakemui re-export barrel
 * The module simply re-exports @metabuilder/fakemui (which is mocked in tests)
 */

// fakemui is mapped to __mocks__/fakeMuiMock.tsx in jest config
import * as FakeMui from '../index';

describe('fakemui index barrel', () => {
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
