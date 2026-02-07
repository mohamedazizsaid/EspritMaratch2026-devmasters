import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LogsService } from './logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logsService: LogsService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user, ip, headers } = request;
        const startTime = Date.now();

        // Determine action from method
        const actionMap: Record<string, string> = {
            GET: 'READ',
            POST: 'CREATE',
            PUT: 'UPDATE',
            PATCH: 'UPDATE',
            DELETE: 'DELETE',
        };

        // Detect auth actions
        let action = actionMap[method] || 'OTHER';
        if (url.includes('/auth/login')) action = 'LOGIN';
        else if (url.includes('/auth/logout')) action = 'LOGOUT';
        else if (url.includes('/auth/register')) action = 'REGISTER';

        return next.handle().pipe(
            tap((responseData) => {
                const duration = Date.now() - startTime;
                const statusCode = context.switchToHttp().getResponse().statusCode;

                this.logsService.createLog({
                    type: statusCode >= 400 ? 'error' : 'success',
                    action,
                    message: `${method} ${url} - ${statusCode}`,
                    method,
                    endpoint: url,
                    statusCode,
                    userId: user?.userId || user?.sub,
                    userEmail: user?.email,
                    ipAddress: ip || headers?.['x-forwarded-for'],
                    duration,
                    userAgent: headers?.['user-agent'],
                    timestamp: new Date(),
                } as any).catch(() => { /* silent fail on log write */ });
            }),
            catchError((error) => {
                const duration = Date.now() - startTime;

                this.logsService.createLog({
                    type: 'error',
                    action,
                    message: `${method} ${url} - ${error.status || 500} - ${error.message}`,
                    method,
                    endpoint: url,
                    statusCode: error.status || 500,
                    userId: user?.userId || user?.sub,
                    userEmail: user?.email,
                    ipAddress: ip || headers?.['x-forwarded-for'],
                    duration,
                    userAgent: headers?.['user-agent'],
                    timestamp: new Date(),
                } as any).catch(() => { /* silent fail on log write */ });

                throw error;
            }),
        );
    }
}
