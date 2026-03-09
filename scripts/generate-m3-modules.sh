#!/bin/bash
# Generate pure SCSS Modules based on Material Design 3
# These are standalone .module.scss files that work with React/Next.js CSS Modules
# They use M3 design tokens but with camelCase class names for JS import

set -e

OUTPUT_DIR="/Users/rmac/Documents/metabuilder/scss/m3-modules"

echo "=== Generating M3 SCSS Modules ==="
echo "Output: $OUTPUT_DIR"
echo ""

mkdir -p "$OUTPUT_DIR"

# Generate Dialog module
cat > "$OUTPUT_DIR/dialog.module.scss" << 'EOF'
// Dialog SCSS Module - Material Design 3
// Pure CSS Module implementation with M3 design tokens

$container-color: var(--mat-sys-surface-container-high, #fff);
$container-shape: var(--mat-sys-corner-extra-large, 28px);
$container-elevation: var(--mat-sys-elevation-3, 0 8px 24px rgba(0,0,0,0.15));
$subhead-color: var(--mat-sys-on-surface, rgba(0, 0, 0, 0.87));
$supporting-text-color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));
$scrim-color: var(--mat-sys-scrim, #000);
$transition-duration: 150ms;

.dialogOpen {}

.dialogOverlay {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, $scrim-color 32%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: var(--z-modal, 1300);
  animation: dialogFadeIn $transition-duration ease-out;
}

@keyframes dialogFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialogContainer {
  display: block;
  box-sizing: border-box;
  outline: 0;
  max-width: 560px;
  min-width: 280px;
}

.dialogPanelSm { max-width: 400px; }
.dialogPanelMd { max-width: 560px; }
.dialogPanelLg { max-width: 720px; }
.dialogPanelXl { max-width: 900px; }

.dialogPanelFullscreen {
  max-width: 100%;
  width: 100vw;
  height: 100vh;
  .dialogSurface { border-radius: 0; max-height: 100vh; }
}

.dialogInnerContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity linear $transition-duration;
}

.dialogOpen .dialogInnerContainer { opacity: 1; }

.dialogSurface {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  overflow-y: auto;
  outline: 0;
  transform: scale(0.8);
  transition: transform $transition-duration cubic-bezier(0, 0, 0.2, 1);
  max-height: calc(100vh - 48px);
  box-shadow: $container-elevation;
  border-radius: $container-shape;
  background-color: $container-color;
}

.dialogOpen .dialogSurface { transform: none; }

.dialogHeader {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 0;
}

.dialogHeaderWithIcon {
  flex-direction: column;
  text-align: center;
}

.dialogTitle {
  display: block;
  flex-shrink: 0;
  margin: 0;
  padding: 24px 24px 16px;
  color: $subhead-color;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.5rem;
}

.dialogContent {
  display: block;
  flex-grow: 1;
  margin: 0;
  overflow: auto;
  max-height: 65vh;
  padding: 0 24px 20px;
  color: $supporting-text-color;
  font-size: 1rem;
  line-height: 1.5rem;
  > :first-child { margin-top: 0; }
  > :last-child { margin-bottom: 0; }
}

.dialogTitle + .dialogContent { padding-top: 0; }

.dialogActions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  min-height: 52px;
  padding: 16px 24px;
  gap: 8px;
}

.dialogActionsStart { justify-content: flex-start; }
.dialogActionsCenter { justify-content: center; }
.dialogActionsStacked {
  flex-direction: column;
  align-items: stretch;
  > * { width: 100%; }
}

.dialogIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--mat-sys-secondary, #625b71);
}

.dialogHeaderWithIcon .dialogIcon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.dialogClose {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--mat-sys-on-surface-variant, rgba(0, 0, 0, 0.6));
  cursor: pointer;
  &:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
  &:focus-visible { outline: 2px solid var(--mat-sys-primary); outline-offset: 2px; }
}

.dialogDivider {
  height: 1px;
  background: var(--mat-sys-outline-variant, rgba(0, 0, 0, 0.12));
  margin: 0;
  border: none;
}
EOF

echo "  Created: dialog.module.scss"

# Generate Button module
cat > "$OUTPUT_DIR/button.module.scss" << 'EOF'
// Button SCSS Module - Material Design 3

$primary: var(--mat-sys-primary, #6750a4);
$on-primary: var(--mat-sys-on-primary, #fff);
$primary-container: var(--mat-sys-primary-container, #eaddff);
$on-primary-container: var(--mat-sys-on-primary-container, #21005d);
$surface: var(--mat-sys-surface, #fff);
$on-surface: var(--mat-sys-on-surface, #1d1b20);
$outline: var(--mat-sys-outline, #79747e);
$shape: var(--mat-sys-corner-full, 9999px);

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 64px;
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: $shape;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.1px;
  cursor: pointer;
  transition: background-color 100ms, box-shadow 100ms;
  &:disabled { opacity: 0.38; cursor: not-allowed; }
}

.buttonFilled {
  background: $primary;
  color: $on-primary;
  &:hover { box-shadow: var(--mat-sys-elevation-1); }
  &:active { box-shadow: none; }
}

.buttonTonal {
  background: $primary-container;
  color: $on-primary-container;
  &:hover { box-shadow: var(--mat-sys-elevation-1); }
}

.buttonOutlined {
  background: transparent;
  color: $primary;
  border: 1px solid $outline;
  &:hover { background: color-mix(in srgb, $primary 8%, transparent); }
}

.buttonText {
  background: transparent;
  color: $primary;
  padding: 0 12px;
  &:hover { background: color-mix(in srgb, $primary 8%, transparent); }
}

.buttonElevated {
  background: $surface;
  color: $primary;
  box-shadow: var(--mat-sys-elevation-1);
  &:hover { box-shadow: var(--mat-sys-elevation-2); }
}

.buttonSmall { height: 32px; padding: 0 16px; font-size: 0.75rem; }
.buttonLarge { height: 48px; padding: 0 32px; font-size: 1rem; }

.iconButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 8px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: $on-surface;
  cursor: pointer;
  &:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
  &:disabled { opacity: 0.38; cursor: not-allowed; }
}

.fab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 56px;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background: $primary-container;
  color: $on-primary-container;
  box-shadow: var(--mat-sys-elevation-3);
  cursor: pointer;
  &:hover { box-shadow: var(--mat-sys-elevation-4); }
}

.fabSmall { min-width: 40px; height: 40px; padding: 8px; border-radius: 12px; }
.fabLarge { min-width: 96px; height: 96px; padding: 30px; border-radius: 28px; }
.fabExtended { padding: 16px 24px; border-radius: 16px; gap: 12px; }
EOF

echo "  Created: button.module.scss"

# Generate Card module
cat > "$OUTPUT_DIR/card.module.scss" << 'EOF'
// Card SCSS Module - Material Design 3

$surface: var(--mat-sys-surface, #fff);
$surface-container: var(--mat-sys-surface-container, #f3edf7);
$surface-container-low: var(--mat-sys-surface-container-low, #f7f2fa);
$on-surface: var(--mat-sys-on-surface, #1d1b20);
$outline: var(--mat-sys-outline, #79747e);
$outline-variant: var(--mat-sys-outline-variant, #cac4d0);
$shape: var(--mat-sys-corner-medium, 12px);

.card {
  display: flex;
  flex-direction: column;
  border-radius: $shape;
  overflow: hidden;
}

.cardElevated {
  background: $surface-container-low;
  box-shadow: var(--mat-sys-elevation-1);
}

.cardFilled {
  background: $surface-container;
}

.cardOutlined {
  background: $surface;
  border: 1px solid $outline-variant;
}

.cardHeader {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.cardAvatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.cardHeaderText {
  flex: 1;
  min-width: 0;
}

.cardTitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: $on-surface;
}

.cardSubtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--mat-sys-on-surface-variant);
}

.cardMedia {
  display: block;
  width: 100%;
  object-fit: cover;
}

.cardContent {
  padding: 16px;
  color: var(--mat-sys-on-surface-variant);
  font-size: 0.875rem;
  line-height: 1.43;
}

.cardActions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 16px;
}

.cardActionArea {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  text-align: inherit;
  cursor: pointer;
  &:hover { background: color-mix(in srgb, $on-surface 8%, transparent); }
}
EOF

echo "  Created: card.module.scss"

# Generate TextField module
cat > "$OUTPUT_DIR/text-field.module.scss" << 'EOF'
// TextField SCSS Module - Material Design 3

$primary: var(--mat-sys-primary, #6750a4);
$on-surface: var(--mat-sys-on-surface, #1d1b20);
$on-surface-variant: var(--mat-sys-on-surface-variant, #49454f);
$outline: var(--mat-sys-outline, #79747e);
$outline-variant: var(--mat-sys-outline-variant, #cac4d0);
$surface-container-highest: var(--mat-sys-surface-container-highest, #e6e0e9);
$error: var(--mat-sys-error, #b3261e);
$shape: var(--mat-sys-corner-extra-small, 4px);

.textField {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.textFieldLabel {
  font-size: 0.75rem;
  font-weight: 500;
  color: $on-surface-variant;
  margin-bottom: 4px;
}

.textFieldInput {
  height: 56px;
  padding: 16px;
  border: none;
  border-radius: $shape $shape 0 0;
  background: $surface-container-highest;
  color: $on-surface;
  font-size: 1rem;
  outline: none;
  border-bottom: 1px solid $on-surface-variant;
  transition: border-color 100ms;
  &:focus { border-bottom: 2px solid $primary; margin-bottom: -1px; }
  &::placeholder { color: $on-surface-variant; }
}

.textFieldOutlined {
  .textFieldInput {
    background: transparent;
    border: 1px solid $outline;
    border-radius: $shape;
    &:focus { border: 2px solid $primary; padding: 15px; }
  }
}

.textFieldError {
  .textFieldInput { border-color: $error; }
  .textFieldLabel { color: $error; }
}

.textFieldHelper {
  font-size: 0.75rem;
  color: $on-surface-variant;
  padding: 4px 16px 0;
}

.textFieldError .textFieldHelper { color: $error; }

.textFieldDisabled {
  opacity: 0.38;
  .textFieldInput { cursor: not-allowed; }
}
EOF

echo "  Created: text-field.module.scss"

# Generate Chip module
cat > "$OUTPUT_DIR/chip.module.scss" << 'EOF'
// Chip SCSS Module - Material Design 3

$on-surface: var(--mat-sys-on-surface, #1d1b20);
$on-surface-variant: var(--mat-sys-on-surface-variant, #49454f);
$surface-container-low: var(--mat-sys-surface-container-low, #f7f2fa);
$outline: var(--mat-sys-outline, #79747e);
$primary: var(--mat-sys-primary, #6750a4);
$secondary-container: var(--mat-sys-secondary-container, #e8def8);
$on-secondary-container: var(--mat-sys-on-secondary-container, #1d192b);

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 100ms;
}

.chipOutlined {
  background: transparent;
  border: 1px solid $outline;
  color: $on-surface-variant;
  &:hover { background: color-mix(in srgb, $on-surface 8%, transparent); }
}

.chipFilled {
  background: $surface-container-low;
  border: none;
  color: $on-surface-variant;
  &:hover { background: color-mix(in srgb, $on-surface 12%, $surface-container-low); }
}

.chipSelected {
  background: $secondary-container;
  color: $on-secondary-container;
  border-color: transparent;
}

.chipIcon {
  width: 18px;
  height: 18px;
  margin-left: -4px;
}

.chipDelete {
  width: 18px;
  height: 18px;
  margin-right: -4px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 50%;
  &:hover { background: color-mix(in srgb, currentColor 12%, transparent); }
}

.chipDisabled {
  opacity: 0.38;
  cursor: not-allowed;
}
EOF

echo "  Created: chip.module.scss"

# Generate List module
cat > "$OUTPUT_DIR/list.module.scss" << 'EOF'
// List SCSS Module - Material Design 3

$on-surface: var(--mat-sys-on-surface, #1d1b20);
$on-surface-variant: var(--mat-sys-on-surface-variant, #49454f);
$surface: var(--mat-sys-surface, #fff);

.list {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}

.listItem {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 56px;
  padding: 8px 16px;
  color: $on-surface;
}

.listItemButton {
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  &:hover { background: color-mix(in srgb, $on-surface 8%, transparent); }
  &:active { background: color-mix(in srgb, $on-surface 12%, transparent); }
}

.listItemIcon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: $on-surface-variant;
}

.listItemAvatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.listItemText {
  flex: 1;
  min-width: 0;
}

.listItemPrimary {
  font-size: 1rem;
  color: $on-surface;
  margin: 0;
}

.listItemSecondary {
  font-size: 0.875rem;
  color: $on-surface-variant;
  margin: 0;
}

.listSubheader {
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: $on-surface-variant;
}

.listDivider {
  height: 1px;
  background: var(--mat-sys-outline-variant);
  margin: 0;
  border: none;
}
EOF

echo "  Created: list.module.scss"

# Generate Progress module
cat > "$OUTPUT_DIR/progress.module.scss" << 'EOF'
// Progress SCSS Module - Material Design 3

$primary: var(--mat-sys-primary, #6750a4);
$primary-container: var(--mat-sys-primary-container, #eaddff);
$surface-container-highest: var(--mat-sys-surface-container-highest, #e6e0e9);

.linearProgress {
  height: 4px;
  width: 100%;
  background: $surface-container-highest;
  border-radius: 2px;
  overflow: hidden;
}

.linearProgressBar {
  height: 100%;
  background: $primary;
  border-radius: 2px;
  transition: width 200ms ease;
}

.linearProgressIndeterminate .linearProgressBar {
  width: 50%;
  animation: linearIndeterminate 1.5s infinite ease-in-out;
}

@keyframes linearIndeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}

.circularProgress {
  display: inline-block;
  width: 40px;
  height: 40px;
}

.circularProgressSvg {
  animation: circularRotate 1.4s linear infinite;
}

.circularProgressCircle {
  stroke: $primary;
  stroke-linecap: round;
  animation: circularDash 1.4s ease-in-out infinite;
}

@keyframes circularRotate {
  100% { transform: rotate(360deg); }
}

@keyframes circularDash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

.circularProgressSmall { width: 24px; height: 24px; }
.circularProgressLarge { width: 56px; height: 56px; }
EOF

echo "  Created: progress.module.scss"

# Generate Snackbar module
cat > "$OUTPUT_DIR/snackbar.module.scss" << 'EOF'
// Snackbar SCSS Module - Material Design 3

$inverse-surface: var(--mat-sys-inverse-surface, #322f35);
$inverse-on-surface: var(--mat-sys-inverse-on-surface, #f5eff7);
$inverse-primary: var(--mat-sys-inverse-primary, #d0bcff);

.snackbar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 288px;
  max-width: 568px;
  padding: 14px 16px;
  background: $inverse-surface;
  color: $inverse-on-surface;
  border-radius: 4px;
  box-shadow: var(--mat-sys-elevation-3);
  font-size: 0.875rem;
  z-index: var(--z-snackbar, 1400);
  animation: snackbarSlideIn 150ms ease-out;
}

@keyframes snackbarSlideIn {
  from { transform: translateX(-50%) translateY(100%); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

.snackbarMessage {
  flex: 1;
}

.snackbarAction {
  flex-shrink: 0;
  padding: 0 8px;
  border: none;
  background: transparent;
  color: $inverse-primary;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  &:hover { background: color-mix(in srgb, $inverse-primary 8%, transparent); }
}

.snackbarClose {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: $inverse-on-surface;
  cursor: pointer;
  border-radius: 50%;
  &:hover { background: color-mix(in srgb, $inverse-on-surface 8%, transparent); }
}
EOF

echo "  Created: snackbar.module.scss"

echo ""
echo "=== Generation Complete ==="
echo ""
ls -la "$OUTPUT_DIR"
