import { E as EventType } from './heartbeat-event-types-BmKuwNhb.js';

const VERSION = "ec61fa57186e5a2ceb3003a660f42fd762e82193";
const WORKBENCH_ORIGIN = import.meta.env.VITE_WORKBENCH_ORIGIN || "https://github.com";
async function getSourceMapConsumer(sourceMap) {
    if (window.sourceMap !== undefined) {
        return await new window.sourceMap.SourceMapConsumer(sourceMap);
    }
    // @ts-ignore
    await import('https://unpkg.com/source-map@0.7.3/dist/source-map.js');
    window.sourceMap.SourceMapConsumer.initialize({
        "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm",
    });
    return await new window.sourceMap.SourceMapConsumer(sourceMap);
}
async function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Check whether the root element of the app exists.
 */
function getRootElement() {
    return document.getElementById("root");
}
/**
 * Checks if the given element is null or empty.
 */
function isEmptyElement(element) {
    if (element === null) {
        return true; // Treat missing element as empty
    }
    return element.textContent?.trim() === "";
}
async function monitorRootElement() {
    await wait(200); // Wait a bit for the root element to be rendered
    console.info("Root element monitoring enabled");
    let checkInterval = 500; // Start with 500 milliseconds
    const checkRootElement = () => {
        const rootElement = getRootElement();
        window.parent.postMessage({
            type: EventType.ROOT_ELEMENT_STATUS,
            payload: {
                timestamp: Date.now(),
                isEmpty: isEmptyElement(rootElement),
                exists: !!rootElement,
            },
        }, WORKBENCH_ORIGIN);
        clearInterval(intervalId);
        checkInterval = 3000;
        intervalId = setInterval(checkRootElement, checkInterval);
    };
    let intervalId = setInterval(checkRootElement, checkInterval);
    checkRootElement();
}
// Handle JavaScript errors
function setupErrorListener() {
    console.info("Runtime heartbeat enabled");
    window.addEventListener("error", (event) => {
        const { message, filename, lineno, colno } = event;
        fetch(filename)
            .then(async (response) => {
            if (response.ok) {
                const rawFile = await response.text();
                const base64SourceMap = rawFile.split("# sourceMappingURL=").pop();
                const rawBase64SourceMap = base64SourceMap.split("data:application/json;base64,").pop();
                const sourceMap = JSON.parse(atob(rawBase64SourceMap));
                const consumer = await getSourceMapConsumer(sourceMap);
                const originalPosition = consumer.originalPositionFor({
                    line: lineno,
                    column: colno,
                });
                const payload = {
                    line: originalPosition.line,
                    column: originalPosition.column,
                    path: new URL(filename).pathname,
                    message,
                };
                window.parent.postMessage({
                    type: EventType.SPARK_RUNTIME_ERROR,
                    payload,
                }, WORKBENCH_ORIGIN);
            }
        })
            .catch(() => {
            const payload = {
                line: lineno,
                column: colno,
                path: new URL(filename).pathname,
                message,
                sourceMap: false,
            };
            window.parent.postMessage({
                type: EventType.SPARK_RUNTIME_ERROR,
                payload,
            }, WORKBENCH_ORIGIN);
        });
    });
}
function initializeViteHeartbeat() {
    const viteServerSessionId = import.meta.env.VITE_SERVER_SESSION_ID || "unset";
    console.info("Vite heartbeat enabled. Server session ID:", viteServerSessionId);
    import.meta.hot?.on("vite:ws:connect", () => {
        console.info("Vite server WebSocket connected");
        window.parent.postMessage({
            type: EventType.SPARK_VITE_WS_CONNECT,
            payload: { timestamp: Date.now(), viteServerSessionId },
        }, WORKBENCH_ORIGIN);
    });
    import.meta.hot?.on("vite:ws:disconnect", () => {
        console.info("Vite server WebSocket disconnected");
        window.parent.postMessage({
            type: EventType.SPARK_VITE_WS_DISCONNECT,
            payload: { timestamp: Date.now(), viteServerSessionId },
        }, WORKBENCH_ORIGIN);
    });
    import.meta.hot?.on("vite:error", (error) => {
        console.warn("Vite server error:", error);
        window.parent.postMessage({
            type: EventType.SPARK_VITE_ERROR,
            payload: { error, timestamp: Date.now(), viteServerSessionId },
        }, WORKBENCH_ORIGIN);
    });
    import.meta.hot?.on("vite:afterUpdate", (updateInfo) => {
        window.parent.postMessage({
            type: EventType.SPARK_VITE_AFTER_UPDATE,
            payload: { updateInfo, timestamp: Date.now(), viteServerSessionId },
        }, WORKBENCH_ORIGIN);
        if (isEmptyElement(getRootElement())) {
            wait(100).then(() => {
                window.location.reload();
            });
        }
    });
}
function heartbeat() {
    console.info(`Spark Tools version: ${VERSION}`);
    setupErrorListener();
    monitorRootElement();
    // Tell parent the runtime is ready.
    window.parent.postMessage({
        type: EventType.SPARK_RUNTIME_PING,
        payload: {
            version: VERSION,
            timestamp: Date.now(),
        },
    }, WORKBENCH_ORIGIN);
}
heartbeat();
if (import.meta.hot) {
    initializeViteHeartbeat();
}
else {
    console.error(`Vite HMR is not available`);
}

export { setupErrorListener };
//# sourceMappingURL=heartbeat.js.map
