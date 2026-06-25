import { colorize, formatTable } from './logger-colors.js';
export class Logger {
    constructor() {
        this.verbose = false;
        this.useColors = true;
        this.logs = [];
    }
    static getInstance() {
        if (!Logger.instance)
            Logger.instance = new Logger();
        return Logger.instance;
    }
    configure(options) {
        if (options.verbose !== undefined)
            this.verbose = options.verbose;
        if (options.useColors !== undefined)
            this.useColors = options.useColors;
    }
    error(message, context) {
        this.log('error', message, context);
        const prefix = colorize('✖', 'red', this.useColors);
        const msg = colorize(message, 'red', this.useColors);
        if (this.useColors) {
            console.error(`${prefix} ${msg}`, context || '');
        }
        else {
            console.error(`[ERROR] ${message}`, context || '');
        }
    }
    warn(message, context) {
        this.log('warn', message, context);
        if (this.useColors) {
            console.warn(`${colorize('⚠', 'yellow', true)} ${colorize(message, 'yellow', true)}`, context || '');
        }
        else {
            console.warn(`[WARN] ${message}`, context || '');
        }
    }
    info(message, context) {
        this.log('info', message, context);
        if (this.useColors) {
            console.log(`${colorize('ℹ', 'blue', true)} ${colorize(message, 'blue', true)}`, context || '');
        }
        else {
            console.log(`[INFO] ${message}`, context || '');
        }
    }
    debug(message, context) {
        if (!this.verbose)
            return;
        this.log('debug', message, context);
        if (this.useColors) {
            console.log(`${colorize('◆', 'gray', true)} ${colorize(message, 'gray', true)}`, context || '');
        }
        else {
            console.log(`[DEBUG] ${message}`, context || '');
        }
    }
    log(level, message, context) {
        this.logs.push({
            level,
            timestamp: new Date().toISOString(),
            message,
            context,
        });
    }
    getLogs() {
        return [...this.logs];
    }
    clearLogs() {
        this.logs = [];
    }
    colorize(text, color) {
        return colorize(text, color, this.useColors);
    }
    table(data) {
        return formatTable(data);
    }
}
export const logger = Logger.getInstance();
