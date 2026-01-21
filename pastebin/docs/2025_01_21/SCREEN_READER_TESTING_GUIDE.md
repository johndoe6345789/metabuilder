# Screen Reader Testing Guide for Aria-Live Regions

## Overview

This guide provides step-by-step instructions for testing aria-live regions and dynamic content announcements across different screen readers and platforms.

## Quick Testing Checklist

- [ ] MonacoEditor status announcement
- [ ] PythonTerminal state updates
- [ ] Terminal output announcements
- [ ] Error alerts (assertive aria-live)
- [ ] Parameter list updates
- [ ] Empty state messaging
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

---

## Testing Tools & Platforms

### Windows

#### NVDA (Free, Open Source)
- **Download:** https://www.nvaccess.org/download/
- **Version:** Latest stable
- **Best for:** Comprehensive testing, free option

#### JAWS (Commercial)
- **Download:** https://www.freedomscientific.com/products/software/jaws/
- **Version:** Latest version
- **Best for:** Enterprise testing, most features

### macOS

#### VoiceOver (Built-in)
- **Enable:** Cmd + F5 or System Preferences > Accessibility > VoiceOver
- **Disable:** Cmd + F5 (toggle)
- **Best for:** Apple ecosystem testing

### iOS

#### VoiceOver (Built-in)
- **Enable:** Settings > Accessibility > VoiceOver > On
- **Navigation:** Swipe right/left for next/previous item
- **Best for:** Mobile testing

### Android

#### TalkBack (Built-in)
- **Enable:** Settings > Accessibility > TalkBack > On
- **Navigation:** Swipe right/left for next/previous item
- **Best for:** Android device testing

---

## Test Scenarios

### 1. MonacoEditor Status Announcement

**Location:** Code editor components (SnippetDialog, etc.)

#### NVDA (Windows)
1. Open application with NVDA running
2. Navigate to code editor using Tab key
3. **Expected:** Hear "Code editor loaded with [Language] syntax highlighting. Editable/Read-only mode."
4. Focus on editor and press Alt+Down to read full description

#### JAWS (Windows)
1. Start JAWS and load application
2. Use arrow keys to navigate to editor
3. Press Insert+F7 to open Find dialog
4. Search for "code editor"
5. **Expected:** Announcement includes language and mode

#### VoiceOver (macOS)
1. Enable VoiceOver (Cmd + F5)
2. Press VO+U to open rotor
3. Navigate to status items
4. **Expected:** See editor status announcement

#### Test Verification
```
Announcement should include:
- "Code editor loaded"
- Language name (JavaScript, TypeScript, etc.)
- Mode (Editable or Read-only)
- "syntax highlighting"
```

---

### 2. PythonTerminal Status Updates

**Location:** Python runner component

#### NVDA (Windows)
1. Open Python terminal
2. Click "Run" button
3. **Expected:** Hear "Code is running"
4. Wait for execution or errors
5. **Expected:** Hear updated status messages

#### JAWS (Windows)
1. Navigate to terminal with arrow keys
2. Activate Run button (Enter/Space)
3. **Expected:** Status announcements during execution
4. If errors occur, should hear "Errors detected in output" (assertive)

#### VoiceOver (macOS)
1. VO+U to open rotor
2. Find "Python Terminal" region
3. Press VO+Right Arrow to enter
4. **Expected:** Hear status updates as code runs

#### Expected Announcements
```
Initial: "Terminal is initializing"
Running: "Code is running"
Input waiting: "Waiting for user input"
Complete: "[N] lines of output"
Errors: "Errors detected in output" (interrupting)
```

---

### 3. Terminal Output Announcements

**Location:** Terminal output area below Run button

#### NVDA (Windows)
1. Run Python code that produces output
2. **Expected:** Announcements of output lines
3. If errors appear, should interrupt immediately
4. Press Ctrl to stop speech, then arrow through output

#### JAWS (Windows)
1. Run code and observe output
2. **Expected:** Each new output line announced
3. Errors should interrupt immediately
4. Use arrow keys to review individual lines

#### Test Error Announcement
1. Run code that produces error: `1/0` (division by zero)
2. **Expected:** Immediate announcement: "Error: division by zero"
3. Should interrupt any other announcements (assertive)

#### VoiceOver (macOS)
1. Run code with errors
2. **Expected:** Hear error immediately
3. Use VO+Down Arrow to navigate through output
4. Each error line should be marked as "alert"

---

### 4. Input Parameter List Updates

**Location:** Preview Configuration section in snippet editor

#### NVDA (Windows)
1. Open snippet editor dialog
2. Navigate to "Add Parameter" button
3. **Expected:** Button label includes current parameter count
4. Click button to add parameter
5. **Expected:** Hear "1 parameter configured"
6. Add more parameters
7. **Expected:** Count updates ("2 parameters configured", etc.)

#### JAWS (Windows)
1. Use arrow keys to navigate parameter list
2. **Expected:** Hear parameter count announcement
3. Add new parameter with button
4. **Expected:** Parameter region announcement updates
5. Delete parameter
6. **Expected:** Count decreases with announcement

#### Parameter Announcement Examples
```
0 parameters: "0 parameters configured"
1 parameter: "1 parameter configured"
Multiple: "3 parameters configured"
```

---

### 5. Empty State Messaging

**Location:** Snippet list area when no snippets exist

#### NVDA (Windows)
1. Delete all snippets or start fresh
2. Navigate to snippet area
3. **Expected:** Hear "No snippets available"
4. Full announcement: "[Title]. [Description]"

#### JAWS (Windows)
1. View empty snippet area
2. Press Insert+A to read current window
3. **Expected:** Empty state announcement
4. Use arrow keys to find Create button
5. **Expected:** Button guidance provided

#### VoiceOver (macOS)
1. Navigate to empty state
2. VO+U to open rotor
3. Find status regions
4. **Expected:** Empty state message announced

#### Expected Announcement
```
"No snippets yet. Create your first snippet to get started."
```

---

## Aria-Live Urgency Testing

### Polite vs Assertive

#### Testing aria-live="polite"
1. Regular status updates (not critical)
2. Parameter count changes
3. Normal terminal output
4. **Behavior:** Wait for natural pause in speech
5. **Expected:** User hears other content first, then announcement

#### Testing aria-live="assertive"
1. Error messages
2. Critical alerts
3. Validation errors
4. **Behavior:** Interrupt current speech immediately
5. **Expected:** User hears error alert right away

#### Test Procedure
1. Have screen reader reading long content
2. Trigger aria-live="assertive" event (error)
3. **Expected:** Current speech stops, error announced
4. Compare with aria-live="polite" event
5. **Expected:** Polite event waits for pause

---

## Keyboard Navigation Testing

### Tab Order
1. Start at page top
2. Press Tab repeatedly
3. Verify logical tab order:
   ```
   Editor → Run Button → Output Area → Parameters → Create Button
   ```

### Screen Reader Navigation
1. **NVDA:** Use H to jump to headings, L for lists, B for buttons
2. **JAWS:** Use arrow keys and Insert+F3 for Find
3. **VoiceOver:** Use VO+U for rotor navigation

### Testing Shortcuts
- Tab/Shift+Tab for forward/back
- Enter/Space to activate buttons
- Arrow keys within lists and regions
- Escape to close dialogs

---

## Common Testing Scenarios

### Scenario 1: Code Execution with Output

```
1. Open snippet editor
2. Add code: console.log("Hello")
3. Click Run
4. Expected sequence:
   - "Terminal is initializing"
   - "Code is running"
   - Output line announced: "Hello"
   - Status: "[1] lines of output"
```

### Scenario 2: Code Execution with Error

```
1. Add code: throw new Error("Test")
2. Click Run
3. Expected sequence:
   - "Terminal is initializing"
   - "Code is running"
   - "Errors detected in output" (INTERRUPTS)
   - Error line announced: "Error: Test"
```

### Scenario 3: Adding Parameters

```
1. Open snippet with parameters
2. See "0 parameters configured"
3. Click "Add Parameter"
4. Fill in parameter details
5. Expected: "1 parameter configured"
6. Repeat: "2 parameters configured"
```

### Scenario 4: Empty State Flow

```
1. Delete all snippets or start fresh
2. Expected: "No snippets available"
3. Full message: "No snippets yet. Create your first snippet to get started."
4. Tab to Create button
5. Screen reader reads: "Create new snippet"
```

---

## Platform-Specific Testing

### Windows with NVDA

```bash
# Start NVDA
1. Download and install NVDA
2. Launch NVDA before opening browser
3. Navigate to application URL
4. Use Ctrl+Shift+Arrow for navigation modes
5. Press Ctrl to stop speech
6. Press F7 for review window
```

### Windows with JAWS

```bash
# Start JAWS
1. Launch JAWS before browser
2. JAWS automatically reads webpage
3. Use arrow keys for normal navigation
4. Insert+Home for JAWS help
5. Insert+F7 for Find
```

### macOS with VoiceOver

```bash
# Enable VoiceOver
1. Press Cmd + F5 to toggle
2. VO = Control + Option (by default)
3. VO + U to open rotor
4. VO + Arrow Keys to navigate
5. VO + Space to interact
```

### iOS/Android Testing

```
1. Enable TalkBack (Android) or VoiceOver (iOS)
2. Swipe right to navigate forward
3. Swipe left to navigate backward
4. Double tap to interact
5. Two-finger swipe up to read all
```

---

## Troubleshooting Common Issues

### Issue: Announcement Not Heard

**Solution:**
1. Verify aria-live region exists in DOM
2. Check that text content is not empty
3. Ensure role attribute is set correctly
4. Confirm sr-only class isn't hiding region completely
5. Check for JavaScript errors in console

### Issue: Announcement Repeated

**Solution:**
1. Verify aria-atomic value is correct
2. Check that region isn't being recreated
3. Ensure state updates don't duplicate content
4. Use React DevTools to inspect re-renders

### Issue: Wrong Announcement Urgency

**Solution:**
1. Verify aria-live="assertive" for errors
2. Confirm aria-live="polite" for normal updates
3. Check dynamic aria-live switching logic
4. Test with multiple screen readers

### Issue: Keyboard Navigation Broken

**Solution:**
1. Verify tab order is logical
2. Check that buttons/inputs are focusable
3. Ensure no tabindex conflicts
4. Test with keyboard only (no mouse)

---

## Automated Testing

### Using axe-core

```bash
npm install --save-dev @axe-core/react

# Run accessibility tests
npm run test:a11y
```

### Using WebAIM

```bash
# Check WCAG compliance
Visit: https://webaim.org/articles/screenreader_testing/
```

### Using ARIA Test Suite

```bash
# Test aria-live specifically
npm install --save-dev aria-live-test-suite
```

---

## Documentation Template

When testing, use this template to document findings:

```
Component: [Name]
Screen Reader: [NVDA/JAWS/VoiceOver/TalkBack]
Platform: [Windows/macOS/iOS/Android]
Browser: [Chrome/Firefox/Safari]

Test Case: [Description]
Expected: [What should be announced]
Actual: [What was heard]
Status: [PASS/FAIL/PARTIAL]

Notes: [Any additional observations]
```

---

## Resources

- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [NVDA Documentation](https://www.nvaccess.org/documentation/)
- [JAWS Documentation](https://www.freedomscientific.com/products/software/jaws/documentation/)
- [VoiceOver Guide](https://www.apple.com/accessibility/voiceover/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Compliance Checklist

- [x] Aria-live regions implemented for all dynamic content
- [x] Polite vs assertive urgency correctly applied
- [x] Screen-reader-only announcements using sr-only class
- [x] Semantic HTML roles (status, alert, log)
- [x] Keyboard navigation fully functional
- [x] Aria-labels provide clear context
- [x] No duplicate announcements
- [x] Tests written for all components
- [ ] Manual testing completed with NVDA
- [ ] Manual testing completed with JAWS
- [ ] Manual testing completed with VoiceOver
- [ ] Manual testing completed with TalkBack
- [ ] Accessibility audit passed (axe-core)
- [ ] WCAG 2.1 Level AA compliance verified

