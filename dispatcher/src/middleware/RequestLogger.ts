/**
 * LogEntry arayüzü - Her bir log kaydının yapısını tanımlar
 */
export interface LogEntry {
    timestamp: string;
    method: string;
    url: string;
    statusCode: number;
    responseTime: number;
}

/**
 * RequestLogger sınıfı - Gelen HTTP isteklerini loglayan middleware
 * 
 * Singleton pattern kullanarak tüm logları merkezi olarak yönetir.
 * Her istek için zaman damgası, HTTP metodu, URL, durum kodu ve
 * yanıt süresini kaydeder.
 */
export class RequestLogger {
    private static logs: LogEntry[] = [];

    /**
     * Express middleware fonksiyonu
     * İstek geldiğinde başlangıç zamanını kaydeder,
     * yanıt gönderildiğinde log kaydı oluşturur.
     */
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

            console.log(
                `[${logEntry.timestamp}] ${logEntry.method} ${logEntry.url} - ${logEntry.statusCode} (${logEntry.responseTime}ms)`
            );
        };

        // res.send'i override ederek loglama yapıyoruz
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

    /**
     * Tüm log kayıtlarını döndürür
     */
    public static getLogs(): LogEntry[] {
        return [...RequestLogger.logs];
    }

    /**
     * Tüm log kayıtlarını temizler (test amaçlı)
     */
    public static clearLogs(): void {
        RequestLogger.logs = [];
    }

    /**
     * Son N log kaydını döndürür
     */
    public static getRecentLogs(count: number): LogEntry[] {
        return RequestLogger.logs.slice(-count);
    }
}
