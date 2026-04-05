export interface LogEntry {
    timestamp: string;
    method: string;
    url: string;
    statusCode: number;
    responseTime: number;
}

export class RequestLogger {
    private static logs: LogEntry[] = [];

    public static middleware(req: any, res: any, next: any): void {
        const startTime = Date.now();
        const originalSend = res.send;
        const originalJson = res.json;
        const originalEnd = res.end;

        const logRequest = () => {
            const responseTime = Date.now() - startTime;

            const logEntry: LogEntry = {
                timestamp: new Date().toISOString(),
                method: req.method,
                url: req.originalUrl || req.url,
                statusCode: res.statusCode,
                responseTime: responseTime
            };

            RequestLogger.logs.push(logEntry);

            if (process.env.NODE_ENV !== 'test') {
                console.log(
                    `[${logEntry.timestamp}] ${logEntry.method} ${logEntry.url} - ${logEntry.statusCode} (${logEntry.responseTime}ms)`
                );
            }
        };

        let logged = false;

        res.send = function (...args: any[]) {
            if (!logged) {
                logged = true;
                logRequest();
            }
            return originalSend.apply(res, args);
        };

        res.json = function (...args: any[]) {
            if (!logged) {
                logged = true;
                logRequest();
            }
            return originalJson.apply(res, args);
        };

        res.end = function (...args: any[]) {
            if (!logged) {
                logged = true;
                logRequest();
            }
            return originalEnd.apply(res, args);
        };

        next();
    }

    public static getLogs(): LogEntry[] {
        return [...RequestLogger.logs];
    }

    public static clearLogs(): void {
        RequestLogger.logs = [];
    }

    public static getRecentLogs(count: number): LogEntry[] {
        return RequestLogger.logs.slice(-count);
    }
}
