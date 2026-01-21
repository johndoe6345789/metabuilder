/**
 * typed function to send messages to the parent window
 */
function sendMessageToBridge(message) {
    window.parent.postMessage(message, '*');
}
let currentSelectedElement = null;
let currentHighlightedElement = null;
let mutationObserver = null;
// Keyboard overlay state
let keyboardOverlays = [];
const extractProps = (props) => {
    return Object.entries(props || {}).reduce((acc, [key, value]) => {
        if (['string', 'number', 'boolean'].includes(typeof value) &&
            !['data-loc', 'data-component', 'children'].includes(key)) {
            acc[key] = value;
        }
        return acc;
    }, {});
};
/**
 * Core element selection logic shared between mouse and keyboard selection
 * @param makeEditable - Whether to make text elements editable immediately (false during Tab navigation)
 */
function selectElement(element, makeEditable = true) {
    // Get React fiber info
    const reactPropsKey = Object.keys(element).find((key) => key.startsWith('__reactProps'));
    const reactFiberKey = Object.keys(element).find((key) => key.startsWith('__reactFiber'));
    const fiberProps = reactPropsKey ? element[reactPropsKey] : undefined;
    const fiberNode = reactFiberKey ? element[reactFiberKey] : undefined;
    if (!fiberNode) {
        return;
    }
    const elementDynamic = element.getAttribute('data-dynamic');
    const isTextElement = typeof fiberProps.children === 'string';
    const editable = !elementDynamic && isTextElement;
    currentSelectedElement = element;
    // Send selection message
    const payload = createElementPayload(element);
    sendMessageToBridge({
        type: 'spark:designer:host:element:selected',
        element: payload,
    });
    // Show selected overlay
    document.querySelectorAll('.debugger-overlay').forEach((x) => x.remove());
    showOverlay(element);
    // Disconnect previous observer if it exists
    if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
    }
    // Set up mutation observer for the selected element
    mutationObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes') {
                sendMessageToBridge({
                    type: 'spark:designer:bridge:element:updated',
                    element: createElementPayload(element),
                });
                updateOverlayPositions();
            }
        }
    });
    mutationObserver.observe(element, {
        attributes: true,
        attributeFilter: ['data-loc', 'data-loc-end', 'data-component-loc', 'data-component-loc-end', 'class'],
    });
    // Make editable if applicable AND makeEditable is true
    // During Tab navigation (makeEditable=false), we don't steal focus with contentEditable
    // User can press Enter to explicitly make it editable
    if (editable && makeEditable) {
        element.contentEditable = 'true';
        element.focus();
        element.addEventListener('blur', () => {
            element.contentEditable = 'false';
            sendMessageToBridge({
                type: 'spark:designer:bridge:element:updated',
                element: createElementPayload(element),
            });
        }, { once: true });
    }
}
function createElementPayload(element) {
    const reactPropsKey = Object.keys(element).find((key) => key.startsWith('__reactProps'));
    const reactFiberKey = Object.keys(element).find((key) => key.startsWith('__reactFiber'));
    const fiberProps = reactPropsKey ? element[reactPropsKey] : undefined;
    const fiberNode = reactFiberKey ? element[reactFiberKey] : undefined;
    const elementDataLoc = element.getAttribute('data-loc')?.split(':');
    const elementDataLocEnd = element.getAttribute('data-loc-end')?.split(':');
    const componentLoc = element.getAttribute('data-component-loc')?.split(':');
    const componentLocEnd = element.getAttribute('data-component-loc-end')?.split(':');
    const elementDynamic = element.getAttribute('data-dynamic');
    const isTextElement = typeof fiberProps.children === 'string';
    const editable = !elementDynamic && isTextElement;
    const rect = element.getBoundingClientRect();
    return {
        tag: fiberNode.type?.name || fiberNode.type,
        component: {
            location: componentLoc && componentLocEnd
                ? {
                    start: {
                        filePath: componentLoc?.[0],
                        line: parseInt(componentLoc?.[1], 10),
                        column: parseInt(componentLoc?.[2], 10),
                    },
                    end: {
                        filePath: componentLocEnd?.[0],
                        line: parseInt(componentLocEnd?.[1], 10),
                        column: parseInt(componentLocEnd?.[2], 10),
                    },
                }
                : null,
        },
        props: extractProps(fiberProps),
        location: elementDataLoc && elementDataLocEnd
            ? {
                start: {
                    filePath: elementDataLoc[0],
                    line: parseInt(elementDataLoc[1], 10),
                    column: parseInt(elementDataLoc[2], 10),
                },
                end: {
                    filePath: elementDataLocEnd[0],
                    line: parseInt(elementDataLocEnd[1], 10),
                    column: parseInt(elementDataLocEnd[2], 10),
                },
            }
            : null,
        instanceCount: document.querySelectorAll(`[data-loc="${elementDataLoc}"]`).length,
        position: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        },
        editable,
        text: isTextElement ? element.innerText : null,
        class: element.getAttribute('class'),
    };
}
function handleClick(event) {
    const element = event.target;
    if (!(element instanceof HTMLElement)) {
        return;
    }
    // Skip our keyboard overlay buttons - let their own handlers deal with selection
    // IMPORTANT: Check this BEFORE preventDefault/stopPropagation so button handler can fire
    if (element.classList.contains('spark-keyboard-overlay')) {
        return;
    }
    // Only prevent default and stop propagation for actual element clicks
    event.preventDefault();
    event.stopPropagation();
    if (element === currentSelectedElement && element.contentEditable === 'true') {
        return;
    }
    else {
        if (currentSelectedElement?.contentEditable === 'true') {
            currentSelectedElement.contentEditable = 'false';
            currentSelectedElement.blur();
        }
    }
    if (event.target === document.documentElement || element === currentSelectedElement) {
        document.querySelectorAll('.debugger-overlay').forEach((x) => x.remove());
        if (element === currentSelectedElement) {
            currentHighlightedElement = currentSelectedElement;
            showOverlay(currentHighlightedElement);
        }
        currentSelectedElement = null;
        sendMessageToBridge({
            type: 'spark:designer:bridge:element:deselected',
            element: null,
        });
        return;
    }
    // Check if element has React fiber before selecting
    const reactFiberKey = Object.keys(element).find((key) => key.startsWith('__reactFiber'));
    if (!reactFiberKey || !element[reactFiberKey]) {
        return;
    }
    // Use shared selection logic
    selectElement(element);
}
function showOverlay(element) {
    const elementDataLoc = element.getAttribute('data-loc');
    const componentDataLoc = element.getAttribute('data-component-loc');
    const computedStyles = window.getComputedStyle(element);
    const elements = componentDataLoc
        ? document.querySelectorAll(`[data-component-loc="${componentDataLoc}"]`)
        : document.querySelectorAll(`[data-loc="${elementDataLoc}"]`);
    elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.style.setProperty('--fg-color', '#4493f8');
        overlay.className = 'debugger-overlay';
        overlay.style.position = 'fixed';
        overlay.style.pointerEvents = 'none';
        overlay.style.border = '1px solid var(--fg-color)';
        overlay.style.left = rect.left + 'px';
        overlay.style.top = rect.top + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
        overlay.style.color = 'var(--fg-color)';
        overlay.style.borderRadius = parseInt(computedStyles.borderRadius) + 'px';
        overlay.style.borderTopLeftRadius = '0px';
        overlay.setAttribute('data-element-name', element.tagName.toLowerCase());
        overlay.setAttribute('data-overlay-loc', elementDataLoc);
        if (el === currentHighlightedElement || el === currentSelectedElement) {
            overlay.style.setProperty('--display-tag', 'flex');
        }
        if (componentDataLoc) {
            // overlay.setAttribute('data-element-name', componentName)
            overlay.style.setProperty('--fg-color', '#AB7DF8');
        }
        document.body.appendChild(overlay);
    });
}
function updateOverlayPositions() {
    document.querySelectorAll('.debugger-overlay').forEach((x) => x.remove());
    if (currentSelectedElement && currentSelectedElement !== currentHighlightedElement) {
        showOverlay(currentSelectedElement);
    }
    if (currentHighlightedElement) {
        showOverlay(currentHighlightedElement);
    }
    if (currentSelectedElement) {
        sendMessageToBridge({
            type: 'spark:designer:bridge:element:updated',
            element: createElementPayload(currentSelectedElement),
        });
    }
}
function handleMouseOver(event) {
    const element = event.target;
    if (!(element instanceof HTMLElement))
        return;
    if (element === currentSelectedElement) {
        document.querySelectorAll('.debugger-overlay').forEach((x) => x.remove());
        showOverlay(currentSelectedElement);
        return;
    }
    if (element !== currentHighlightedElement) {
        document.querySelectorAll('.debugger-overlay').forEach((x) => x.remove());
    }
    currentHighlightedElement = element;
    // if the element is not the same as the current selected element, show the overlay
    if (currentSelectedElement && currentSelectedElement !== currentHighlightedElement) {
        showOverlay(currentSelectedElement);
    }
    // we want to show the current overlay to be later in the DOM tree
    showOverlay(currentHighlightedElement);
}
function handleMouseOut(event) {
    if (!event.relatedTarget) {
        currentHighlightedElement = null;
        document.querySelectorAll('.debugger-overlay').forEach((x) => x.remove());
        if (currentSelectedElement) {
            showOverlay(currentSelectedElement);
        }
    }
}
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
const updateOverlayPositionsThrottled = throttle(updateOverlayPositions, 10); // ~60fps
/**
 * Creates keyboard-accessible overlay buttons for selectable elements
 * These overlays enable Tab-based keyboard navigation without modifying user's elements
 */
function createKeyboardOverlays() {
    // Remove any existing overlays first
    removeKeyboardOverlays();
    // Find all selectable elements with data-loc attribute
    const elements = document.querySelectorAll('[data-loc]');
    const selectableElements = [];
    elements.forEach((element) => {
        // Skip root elements
        if (element.tagName === 'HTML' || element.tagName === 'BODY') {
            return;
        }
        // Skip our own overlay buttons
        if (element.classList.contains('spark-keyboard-overlay')) {
            return;
        }
        // Skip hidden or zero-size elements
        const rect = element.getBoundingClientRect();
        // In test environments (jsdom), getBoundingClientRect may return 0
        // So we also check computed styles
        const computedStyle = window.getComputedStyle(element);
        const hasSize = rect.width > 0 || rect.height > 0 ||
            (computedStyle.width !== '0px' && computedStyle.height !== '0px');
        if (!hasSize) {
            return;
        }
        // Only include elements with React fiber (valid components)
        const reactFiberKey = Object.keys(element).find((key) => key.startsWith('__reactFiber'));
        if (reactFiberKey) {
            const fiber = element[reactFiberKey];
            if (fiber && fiber.stateNode === element) {
                element._cachedComponentName = fiber?.type?.name || fiber?.type || element.tagName.toLowerCase();
                selectableElements.push(element);
            }
        }
    });
    // Create overlay button for each selectable element
    selectableElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        // Skip elements with zero dimensions (they break Tab navigation)
        // Even though they passed the initial size filter, getBoundingClientRect can return 0x0
        if (rect.width === 0 || rect.height === 0) {
            return;
        }
        // Create focusable button overlay
        const button = document.createElement('button');
        button.className = 'spark-keyboard-overlay';
        button.setAttribute('type', 'button');
        button.setAttribute('tabindex', '0');
        // Use cached component name from earlier lookup
        const componentName = element._cachedComponentName || element.tagName.toLowerCase();
        button.setAttribute('aria-label', `Select ${componentName} element, ${index + 1} of ${selectableElements.length}`);
        button.setAttribute('data-target-loc', element.getAttribute('data-loc') || '');
        // Position button over the element
        // Use rect if available, otherwise use element's offset/computed style
        const left = rect.left || element.offsetLeft || 0;
        const top = rect.top || element.offsetTop || 0;
        const width = rect.width || element.offsetWidth || parseFloat(window.getComputedStyle(element).width) || 0;
        const height = rect.height || element.offsetHeight || parseFloat(window.getComputedStyle(element).height) || 0;
        button.style.position = 'fixed';
        button.style.left = left + 'px';
        button.style.top = top + 'px';
        button.style.width = width + 'px';
        button.style.height = height + 'px';
        // Make invisible but focusable
        button.style.opacity = '0';
        button.style.border = 'none';
        button.style.background = 'transparent';
        button.style.cursor = 'pointer';
        button.style.zIndex = '9998';
        button.style.padding = '0';
        button.style.margin = '0';
        // Show visual feedback on focus
        button.addEventListener('focus', (e) => {
            currentHighlightedElement = element;
            document.querySelectorAll('.debugger-overlay').forEach((x) => x.remove());
            // Restore selected element overlay if different from focused element
            if (currentSelectedElement && currentSelectedElement !== element) {
                showOverlay(currentSelectedElement);
            }
            // Show hover overlay for focused element (same as mouse hover)
            showOverlay(element);
            // Auto-select the focused element so modal/input updates
            selectElement(element, false);
        });
        // Remove hover overlay when Tab moves away
        button.addEventListener('blur', (e) => {
            if (currentHighlightedElement === element) {
                currentHighlightedElement = null;
                document.querySelectorAll('.debugger-overlay').forEach((x) => x.remove());
                // Restore selected element overlay if exists AND it's different from the blurred element
                if (currentSelectedElement && currentSelectedElement !== element) {
                    showOverlay(currentSelectedElement);
                }
            }
        });
        // Handle keyboard events on overlay buttons
        button.addEventListener('keydown', (e) => {
            // Escape = exit selector mode (tell parent to disable)
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                // Tell parent window to disable selector mode
                sendMessageToBridge({
                    type: 'spark:designer:host:disable-requested',
                });
                return; // Don't process other handlers
            }
            // Shift+Enter starts the cycle: element → input → theme panel → element
            if (e.key === 'Enter' && e.shiftKey) {
                // Prevent default Shift+Enter behavior
                e.preventDefault();
                e.stopPropagation();
                // Tell parent window to focus its input field (first step in cycle)
                sendMessageToBridge({
                    type: 'spark:designer:host:focus-input-requested',
                    buttonDataLoc: button.getAttribute('data-target-loc'),
                });
                return; // Don't process other handlers
            }
        });
        // Handle click/Enter to select element
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Select element immediately (makeEditable=true for click, unlike Tab navigation)
            selectElement(element, true);
        });
        document.body.appendChild(button);
        keyboardOverlays.push(button);
    });
    // Auto-focus the first overlay button for keyboard-only users
    // This allows them to start Tab navigation immediately after enabling selector mode
    if (keyboardOverlays.length > 0) {
        // Use setTimeout to ensure the button is fully rendered and focusable
        setTimeout(() => {
            // Check again in case overlays were removed before timeout fires
            if (keyboardOverlays.length > 0 && keyboardOverlays[0]) {
                keyboardOverlays[0].focus();
            }
        }, 0);
    }
}
/**
 * Removes all keyboard overlay buttons
 */
function removeKeyboardOverlays() {
    keyboardOverlays.forEach((button) => {
        button.remove();
    });
    keyboardOverlays = [];
}
/**
 * Updates positions of keyboard overlay buttons (for scroll/resize)
 */
function updateKeyboardOverlayPositions() {
    keyboardOverlays.forEach((button) => {
        const targetLoc = button.getAttribute('data-target-loc');
        if (!targetLoc)
            return;
        const element = document.querySelector(`[data-loc="${CSS.escape(targetLoc)}"]`);
        if (!element)
            return;
        const rect = element.getBoundingClientRect();
        button.style.left = rect.left + 'px';
        button.style.top = rect.top + 'px';
        button.style.width = rect.width + 'px';
        button.style.height = rect.height + 'px';
    });
}
const updateKeyboardOverlayPositionsThrottled = throttle(updateKeyboardOverlayPositions, 10); // ~100fps max (10ms throttle)
/**
 * Prevents default behavior on native interactive elements
 * This allows them to be selected like any other element while preventing their normal actions
 */
function handleNativeElementInteraction(event) {
    const element = event.target;
    // Prevent default button/link/input behavior
    event.preventDefault();
    event.stopPropagation(); // For Enter key on native elements, select them like we do with overlay buttons
    if (event.type === 'keydown' && event.key === 'Enter') {
        selectElement(element);
    }
}
/**
 * Adds event listeners to native interactive elements to override their default behavior
 */
function disableNativeInteractivity() {
    const nativeElements = document.querySelectorAll('button, input, textarea, select, a[href]');
    nativeElements.forEach((element) => {
        // Prevent default click behavior (but allow selection via handleClick)
        element.addEventListener('click', handleNativeElementInteraction, true);
        // Prevent Enter key from triggering button action, use it for selection instead
        element.addEventListener('keydown', handleNativeElementInteraction, true);
        // Mark element as having listeners for cleanup
        element.setAttribute('data-spark-intercepted', 'true');
    });
}
/**
 * Removes event listeners from native interactive elements
 */
function restoreNativeInteractivity() {
    const nativeElements = document.querySelectorAll('[data-spark-intercepted="true"]');
    nativeElements.forEach((element) => {
        element.removeEventListener('click', handleNativeElementInteraction, true);
        element.removeEventListener('keydown', handleNativeElementInteraction, true);
        element.removeAttribute('data-spark-intercepted');
    });
}
/**
 * Handle messages from the parent window
 */
function handleMessage(message) {
    switch (message.type) {
        case 'spark:designer:bridge:enable': { // IMPORTANT: Disable native interactivity FIRST so our handlers fire before handleClick
            // This prevents native button/link behavior while allowing element selection
            disableNativeInteractivity();
            window.addEventListener('click', handleClick, true);
            window.addEventListener('mouseover', handleMouseOver, true);
            window.addEventListener('scroll', updateOverlayPositionsThrottled, {
                passive: true,
            });
            window.addEventListener('resize', updateOverlayPositionsThrottled, {
                passive: true,
            });
            // when cursor leaves the window
            document.addEventListener('mouseout', handleMouseOut, true);
            // Create keyboard-accessible overlays
            createKeyboardOverlays();
            // Update keyboard overlay positions on scroll/resize
            window.addEventListener('scroll', updateKeyboardOverlayPositionsThrottled, {
                passive: true,
            });
            window.addEventListener('resize', updateKeyboardOverlayPositionsThrottled, {
                passive: true,
            });
            break;
        }
        case 'spark:designer:bridge:disable': {
            currentHighlightedElement = null;
            currentSelectedElement = null;
            window.removeEventListener('click', handleClick, true);
            window.removeEventListener('mouseover', handleMouseOver, true);
            window.removeEventListener('scroll', updateOverlayPositionsThrottled);
            window.removeEventListener('resize', updateOverlayPositionsThrottled);
            document.removeEventListener('mouseout', handleMouseOut, true);
            document.querySelectorAll('.debugger-overlay').forEach((x) => x.remove());
            if (mutationObserver) {
                mutationObserver.disconnect();
                mutationObserver = null;
            }
            // Clean up keyboard overlays
            removeKeyboardOverlays();
            // Remove keyboard-specific scroll/resize listeners (separate from mouse overlay listeners above)
            window.removeEventListener('scroll', updateKeyboardOverlayPositionsThrottled);
            window.removeEventListener('resize', updateKeyboardOverlayPositionsThrottled);
            // Restore native interactivity
            restoreNativeInteractivity();
            break;
        }
        case 'spark:designer:bridge:deselect': {
            document.querySelectorAll('.debugger-overlay').forEach((x) => x.remove());
            currentSelectedElement = null;
            if (mutationObserver) {
                mutationObserver.disconnect();
                mutationObserver = null;
            }
            break;
        }
        case 'spark:designer:bridge:restore-focus': {
            const { buttonDataLoc } = message;
            // Find the overlay button at the specified data-loc and focus it
            if (buttonDataLoc) {
                const button = document.querySelector(`.spark-keyboard-overlay[data-target-loc="${CSS.escape(buttonDataLoc)}"]`);
                if (button) {
                    button.focus();
                }
            }
            break;
        }
        case 'spark:designer:bridge:restore-focus-from-theme-panel': {
            const { buttonDataLoc } = message;
            // Find the overlay button at the specified data-loc and focus it
            // Same as restore-focus, but specifically from theme panel navigation
            if (buttonDataLoc) {
                const button = document.querySelector(`.spark-keyboard-overlay[data-target-loc="${CSS.escape(buttonDataLoc)}"]`);
                if (button) {
                    button.focus();
                }
            }
            break;
        }
        case 'spark:designer:bridge:update-theme-token': {
            const { token, value } = message;
            document.documentElement.style.setProperty(`--${token}`, value);
            break;
        }
        case 'spark:designer:bridge:update-element-token': {
            const { location, name, value } = message;
            const { filePath, line, column } = location;
            document.querySelectorAll(`[data-loc="${filePath}:${line}:${column}"]`).forEach((el) => {
                el.style.setProperty(name, value);
            });
            break;
        }
        case 'spark:designer:bridge:update-class-name': {
            const { location, className, replace } = message;
            const { filePath, line, column } = location;
            document.querySelectorAll(`[data-loc="${filePath}:${line}:${column}"]`).forEach((el) => {
                const elementClassName = el.getAttribute('class') || '';
                // Simple concatenation - if more sophisticated merging is needed, consider adding tailwind-merge
                const newClassName = replace ? className : `${elementClassName} ${className}`.trim();
                el.setAttribute('class', newClassName);
            });
            break;
        }
    }
}
/**
 * Listen for messages from the parent window
 */
window.addEventListener('message', (event) => {
    handleMessage(event.data);
});
//# sourceMappingURL=designerHost.js.map
