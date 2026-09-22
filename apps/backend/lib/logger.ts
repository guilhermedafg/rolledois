import winston from "winston";

type LogLevel = "error" | "warn" | "info" | "debug" | "http" | "verbose";

const colorReset = "\x1b[0m";
const colors: Record<LogLevel, string> = {
    error: "\x1b[31m",
    warn: "\x1b[33m",
    info: "\x1b[34m",
    debug: "\x1b[32m",
    http: "\x1b[37m",
    verbose: "\x1b[37m",
};

const formatter = winston.format.printf(({ level, message }) => {
    return `${colors[level as LogLevel]}${level.toUpperCase()}${colorReset}: ${message}`;
});

export const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.label({ label: "Backend" }),
        winston.format.timestamp(),
        formatter,
    ),
});

if (process.env.NODE_ENV !== "production") {
    logger.level = "debug";
}

logger.add(new winston.transports.Console());
