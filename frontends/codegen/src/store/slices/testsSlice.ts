/**
 * testsSlice — persisted state for playwright tests, storybook stories, and unit tests
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PlaywrightTest, StorybookStory, UnitTest } from '@/types/project'

interface TestsState {
  playwrightTests: PlaywrightTest[]
  storybookStories: StorybookStory[]
  unitTests: UnitTest[]
}

const initialState: TestsState = {
  playwrightTests: [],
  storybookStories: [],
  unitTests: [],
}

const testsSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    setPlaywrightTests: (state, action: PayloadAction<PlaywrightTest[]>) => {
      state.playwrightTests = action.payload
    },
    setStorybookStories: (state, action: PayloadAction<StorybookStory[]>) => {
      state.storybookStories = action.payload
    },
    setUnitTests: (state, action: PayloadAction<UnitTest[]>) => {
      state.unitTests = action.payload
    },
  },
})

export const { setPlaywrightTests, setStorybookStories, setUnitTests } = testsSlice.actions
export default testsSlice.reducer
