# Comprehensive Playwright Test Suite Documentation

This test suite provides thorough coverage for both styling defects and functionality defects across the Snippet Pastebin application.

## Test Files Overview

### 1. **visual-regression.spec.ts** - Visual and Styling Defects
Tests that detect visual inconsistencies and styling issues.

**Key Test Categories:**

#### Header & Footer Styling
- Verifies sticky header behavior
- Checks footer positioning and visibility
- Ensures no layout overflow in header/footer
- Validates proper spacing in main content areas

#### Typography Consistency
- Heading hierarchy validation (H1 > H2 > H3, etc.)
- Font weight consistency
- Text contrast sufficiency
- Link hover state styling

#### Color Consistency
- Theme color usage analysis
- Dark/light mode application validation
- Color distinctness verification

#### Responsive Breakpoints
- Tests at 5 different viewport sizes:
  - Mobile Small (320x568)
  - Mobile Standard (375x667)
  - Tablet (768x1024)
  - Desktop (1400x900)
  - Large Desktop (1920x1080)
- No horizontal overflow checks
- Layout integrity at each breakpoint

#### Element Visibility
- Zoom level testing (50%, 100%, 150%, 200%)
- Hidden element detection
- Visual hierarchy validation

#### Interactive Elements
- Button sizing and padding
- Focus state styling
- Accessibility standards (44px minimum)

#### Content Overflow
- Text truncation handling
- Image layout stability
- Proper use of ellipsis

### 2. **functionality.spec.ts** - Core Functionality Tests
Tests for application functionality and features.

**Key Test Categories:**

#### Navigation & Routing
- All main routes load without errors
- Navigation menu open/close functionality
- Browser back/forward button support
- Active route highlighting

#### Header Components
- Logo linking functionality
- Sticky header during scroll
- Backend status indicator

#### Snippet Manager
- Component rendering and dynamic import handling
- Toolbar control accessibility
- Selection controls functionality

#### Forms & Input
- Proper labeling of form elements
- Form submission handling
- Keyboard navigation support

#### Error Handling
- Network error resilience
- Invalid route handling
- Rapid click prevention
- Missing image handling gracefully

#### Accessibility
- Keyboard navigation (Tab key)
- Heading hierarchy validation
- ARIA roles on interactive elements
- Image alt text presence

#### Performance
- Page load time under 5 seconds
- Console error monitoring
- Memory usage stability across reloads

### 3. **components.spec.ts** - Component-Specific Tests
Detailed tests for individual components.

**Key Test Categories:**

#### Snippet Manager Component
- Rendering without hydration errors
- Grid structure and ARIA attributes
- Toolbar button functionality
- Selection controls

#### Navigation Component
- Link presence and completeness
- Active link highlighting
- Keyboard accessibility

#### Backend Indicator
- Visibility and content
- Connection state display

#### Layout Components
- Proper page structure (header, main, footer)
- Sidebar responsiveness
- Content scrollability

#### Modal/Dialog Components
- Accessibility when opened
- Escape key closure
- Focus management

#### Dropdown Menus
- Click to open functionality
- Keyboard navigation (arrow keys)
- Menu item selection

#### Alert/Toast Components
- Display correctness
- Success/error visual distinction

#### Animations
- Smooth page transitions
- Animation completion without errors
- No excessive repaints during animations

### 4. **mobile-responsive.spec.ts** - Mobile-Specific Tests
Comprehensive mobile and touch interaction testing.

**Key Test Categories:**

#### Touch Interactions
- Button touch target sizing (minimum 44px)
- Touch element spacing (minimum 4px gap)
- No horizontal scroll on mobile
- Touch target overlap detection

#### Viewport Height
- Short viewport handling (400px height)
- Above-the-fold content positioning
- Notch/safe area respect

#### Device-Specific
- Tablet two-column layouts
- Orientation change handling (portrait/landscape)
- Device-specific viewport support

#### Font Scaling
- Readability at various font scales (0.8x - 1.5x)
- Appropriate line heights for readability

#### Touch Events
- No ghost click prevention
- Swipe gesture handling
- Unintended navigation prevention

#### Mobile Input
- Mobile keyboard triggering
- Appropriate input types (email, number, etc.)

#### Printability
- Print stylesheet detection
- Content printability on mobile

### 5. **css-styling.spec.ts** - Advanced CSS Tests
Deep CSS validation and rendering tests.

**Key Test Categories:**

#### Layout Systems
- Flexbox alignment and gaps
- Grid layout configuration
- Proper flex/grid property usage

#### Overflow & Clipping
- Overflow property handling
- Text ellipsis for truncated text
- Scroll container behavior

#### Z-Index & Stacking
- Reasonable z-index values (< 10000)
- No excessive z-index conflicts
- Fixed/sticky element positioning

#### Visual Effects
- Box shadow rendering performance
- Text shadow readability
- Shadow performance impact

#### Transforms & Animations
- Valid CSS transform values
- Animation completion without errors
- Smooth transition timing (< 5 seconds)

#### Color & Opacity
- Valid opacity values (0-1 range)
- Valid CSS color formats
- Text/background color distinction

#### Borders & Spacing
- Consistent border styles
- Proper padding/margin application
- Consistent border radius usage

#### Typography
- Font family consistency (< 15 different fonts)
- Standard font weights (300, 400, 500, 600, 700, 800, 900)
- Readable letter/word spacing

#### Backgrounds
- Valid gradient syntax
- Gradient rendering without artifacts

## Running the Tests

### Run all tests:
```bash
npm run test:e2e
```

### Run specific test file:
```bash
npm run test:e2e visual-regression.spec.ts
```

### Run in headed mode (see browser):
```bash
npx playwright test --headed
```

### Run in debug mode:
```bash
npx playwright test --debug
```

### Run specific test:
```bash
npx playwright test -g "full page snapshot - desktop"
```

### Run on specific browser:
```bash
npx playwright test --project=chromium-desktop
```

## Key Test Strategies

### 1. **Visual Regression Detection**
- Screenshot comparisons
- CSS property validation
- Layout measurement verification
- Color consistency checks

### 2. **Responsive Design Testing**
- Multiple viewport sizes
- Touch target sizing
- Overflow prevention
- Safe area handling

### 3. **Functionality Verification**
- User interaction simulation
- State change detection
- Error boundary testing
- Performance monitoring

### 4. **Accessibility Validation**
- ARIA attribute presence
- Keyboard navigation support
- Focus management
- Heading hierarchy
- Alt text presence

### 5. **Performance Monitoring**
- Load time tracking
- Memory usage stability
- Render performance metrics
- Network error handling

## Expected Defects These Tests Can Catch

### Styling Defects:
- ✅ Horizontal scrollbar appearing unexpectedly
- ✅ Elements overlapping at certain breakpoints
- ✅ Text being cut off or invisible
- ✅ Wrong colors being applied
- ✅ Buttons too small to click
- ✅ Missing hover states
- ✅ Layout breaking on mobile
- ✅ Z-index stacking issues
- ✅ Text contrast problems
- ✅ Inconsistent spacing

### Functionality Defects:
- ✅ Navigation not working
- ✅ Buttons not responding to clicks
- ✅ Forms not submitting
- ✅ Pages not loading
- ✅ Memory leaks
- ✅ Console errors being thrown
- ✅ Missing ARIA labels (accessibility)
- ✅ Keyboard navigation broken
- ✅ Focus trapping issues
- ✅ Dynamic content not rendering
- ✅ Animation performance issues
- ✅ Touch events not registering on mobile

## CI/CD Integration

The tests are configured to:
- Run on multiple browsers (Chromium desktop and mobile)
- Retry failed tests twice in CI environment
- Capture screenshots on failure
- Record videos on failure
- Use trace files for debugging

## Notes

- Tests use `await page.waitForLoadState("networkidle")` to ensure content is loaded
- Screenshot tests may need initial baseline setup (`npm run test:e2e -- --update-snapshots`)
- Mobile tests skip on desktop and vice versa based on project name
- Tests include appropriate timeouts for animations and dynamic imports
- Memory metrics are monitored to catch memory leaks
- Both interactive and programmatic verification methods are used
