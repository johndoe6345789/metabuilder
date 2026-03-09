# Quick Reference: Android UI Consistency Checklist

## ✅ Pre-Launch Android Verification

### Navigation (5 min)
- [ ] All routes accessible on Android (393x851)
- [ ] Navigation menu works (hamburger or alternative)
- [ ] Back/forward buttons work
- [ ] No hidden routes
- [ ] Menu closes after selection

**Test:** `npx playwright test -g "Navigation Consistency"`

### Forms (5 min)
- [ ] All input fields visible and focused
- [ ] Correct keyboard type appears (email, number, text)
- [ ] Form submission works
- [ ] Validation messages display
- [ ] Labels stay associated with inputs

**Test:** `npx playwright test -g "Form and Input Consistency"`

### Buttons & Touches (5 min)
- [ ] All buttons tappable (44px minimum)
- [ ] Visual feedback on tap
- [ ] No overlapping touch targets
- [ ] Buttons spaced 8px+ apart
- [ ] Same functionality as desktop

**Test:** `npx playwright test -g "Button and Interactive"`

### Layout (5 min)
- [ ] No horizontal scroll at any route
- [ ] Content fits in 393px width
- [ ] Proper margins and padding
- [ ] Elements don't overlap
- [ ] Safe area respected (notches, bars)

**Test:** `npx playwright test -g "Layout and Spacing"`

### Text & Readability (5 min)
- [ ] No text cut off
- [ ] Readable font sizes (12px+)
- [ ] Sufficient color contrast
- [ ] Line height appropriate
- [ ] No emoji rendering issues

**Test:** `npx playwright test -g "Typography Consistency"`

### Performance (5 min)
- [ ] Page loads < 5 seconds
- [ ] No memory leaks
- [ ] Smooth scrolling (60fps)
- [ ] Tap responds < 100ms
- [ ] No excessive network requests

**Test:** `npm run test:e2e functionality`

### Accessibility (5 min)
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Alt text on images
- [ ] Keyboard navigation works
- [ ] Form labels clear

**Test:** `npx playwright test -g "Accessibility"`

**TOTAL TIME: ~35-40 minutes**

## 🎯 Daily Android QA Checklist

### Morning Smoke Test (10 min)
```bash
# Run cross-platform tests
npx playwright test cross-platform.spec.ts

# Run mobile-only tests
npx playwright test --project=chromium-mobile
```

- [ ] All tests pass
- [ ] No new console errors
- [ ] Performance acceptable

### After Each Deployment
```bash
# Full test suite
npm run test:e2e

# Manual verification
# On Android device:
# 1. Open app
# 2. Navigate all routes
# 3. Fill and submit form
# 4. Verify no scrolling needed
```

- [ ] No horizontal scroll
- [ ] All features accessible
- [ ] Performance acceptable

## 📋 Documentation Verification Checklist

For each doc file in `/docs`:

- [ ] Mentions "mobile" or "Android" support
- [ ] Has separate mobile instructions (if needed)
- [ ] Uses "tap" terminology for touch
- [ ] Includes mobile screenshot (if UI shown)
- [ ] Lists supported browsers
- [ ] Mentions network/performance considerations
- [ ] Has mobile troubleshooting section
- [ ] Links to ANDROID-UI-CONSISTENCY.md

## 🔧 Common Issues & Quick Fixes

### Issue: Horizontal Scrolling
**Quick Fix:**
```css
body, html {
  max-width: 100vw;
  overflow-x: hidden;
}
```
**Verify:** `npx playwright test -g "no horizontal scroll"`

### Issue: Buttons Not Tappable
**Quick Fix:**
```css
button, a, input[type="checkbox"] {
  min-height: 44px;
  min-width: 44px;
}
```
**Verify:** `npx playwright test -g "buttons are touch-friendly"`

### Issue: Text Cut Off
**Quick Fix:**
```css
* {
  word-break: break-word;
  overflow-wrap: break-word;
}
```
**Verify:** `npx playwright test -g "text is handled properly"`

### Issue: Modal Too Large
**Quick Fix:**
```css
.modal {
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}
```

### Issue: Form Overlapped by Keyboard
**Quick Fix:**
```css
input:focus {
  scroll-into-view(smooth, center);
}
```

### Issue: Safe Area Ignored
**Quick Fix:**
```css
.header {
  padding-top: max(16px, env(safe-area-inset-top));
  padding-left: max(16px, env(safe-area-inset-left));
  padding-right: max(16px, env(safe-area-inset-right));
}
```

## 🧪 Test Commands Reference

```bash
# All tests
npm run test:e2e

# Cross-platform consistency only
npm run test:e2e cross-platform

# Mobile/Android only
npx playwright test --project=chromium-mobile

# Desktop only
npx playwright test --project=chromium-desktop

# Specific test by name
npx playwright test -g "navigation"

# With browser visible
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Update snapshots
npx playwright test --update-snapshots

# Generate report
npx playwright test && npx playwright show-report
```

## 📊 Success Metrics

### Must-Have (Required)
- ✅ 0 horizontal scroll on any route
- ✅ All buttons tappable (44px+)
- ✅ All routes accessible
- ✅ Forms work identically
- ✅ No console errors

### Should-Have (Important)
- ✅ Page loads < 5s
- ✅ Tap response < 100ms
- ✅ Touch targets 8px+ apart
- ✅ Safe area respected
- ✅ Readable without zoom

### Nice-to-Have (Bonus)
- ✅ Smooth 60fps scrolling
- ✅ Gesture support (swipe)
- ✅ Animated transitions
- ✅ Native feel
- ✅ Haptic feedback

## 📱 Device Matrix

**Minimum Support:**
- Pixel 5 (393x851) - Android baseline
- Small phone (320x568) - Oldest supported
- Large tablet (1024x1366) - Landscape

**Recommended Testing:**
- Pixel 5 (393x851) - Standard Android
- Samsung S21 (360x800) - Different aspect
- Tablet (768x1024) - Landscape
- Old device (320x480) - Minimum

## 🚀 Pre-Release Checklist (15 min)

```
Feature Complete:
- [ ] All 6 routes accessible on Android
- [ ] All forms submitting
- [ ] All buttons functioning
- [ ] No console errors

Layout Check:
- [ ] No horizontal scroll
- [ ] Content fits viewport
- [ ] Safe areas respected
- [ ] No overlapping elements

Performance Check:
- [ ] Loads < 5s
- [ ] Smooth scrolling
- [ ] Responsive to taps
- [ ] Memory stable

Documentation Check:
- [ ] Docs mention Android support
- [ ] Mobile instructions included
- [ ] Screenshots show mobile
- [ ] Links to consistency guide

Run Tests:
- [ ] npm run test:e2e
- [ ] npx playwright test --project=chromium-mobile
- [ ] All tests pass

Manual Test:
- [ ] Works on real Android device
- [ ] All features accessible
- [ ] No unexpected behaviors
- [ ] Performance acceptable
```

**Expected Time: 15 minutes**

## 📞 Need Help?

### Documentation
- See: `ANDROID-UI-CONSISTENCY.md`
- See: `DOCS-ANDROID-COMPLIANCE.md`
- See: `tests/e2e/cross-platform.spec.ts`

### Testing
- See: `README-TESTS.md`
- See: `DEBUGGING_GUIDE.md`

### Common Issues
- See: "Common Issues & Quick Fixes" section above

### Run Help
```bash
npm run test:e2e -- --help
npx playwright test --help
```

## 💡 Tips for Android Development

1. **Always test on Android**
   - Desktop doesn't catch all issues
   - Use Pixel 5 as reference

2. **Use Android DevTools**
   - Chrome Remote Debugging
   - Android Emulator
   - Real device testing

3. **Monitor on Slow Networks**
   - Slow 3G profile
   - Offline support
   - Progressive enhancement

4. **Check Safe Areas**
   - Notches on modern phones
   - System bars (status, nav)
   - Use env(safe-area-inset-*)

5. **Verify Touch Targets**
   - 44px minimum (WCAG)
   - 8px spacing
   - No overlaps

6. **Test Real Scenarios**
   - Interrupted by call/SMS
   - App backgrounding
   - Network switching
   - Orientation changes

## 🎉 All Clear!

If everything above checks out:
- ✅ Android UI is consistent
- ✅ Documentation is complete
- ✅ Tests pass on all platforms
- ✅ Ready to release

**User Experience:** Same on Android as desktop ✨
