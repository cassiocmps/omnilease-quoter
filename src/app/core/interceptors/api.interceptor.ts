import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * apiInterceptor
 * 
 * Modern Functional HTTP Interceptor (`HttpInterceptorFn`).
 * 
 * Modern vs Legacy Contrast:
 * - Replaces legacy class-based `HttpInterceptor` implementing `intercept(req, next)`.
 * - No need for `HTTP_INTERCEPTORS` multi-provider injection tokens in NgModules!
 * - Configured directly via `provideHttpClient(withInterceptors([apiInterceptor]))`.
 * 
 * Enterprise Capabilities:
 * 1. Distributed Tracing: Generates a unique `X-Correlation-ID` per HTTP request.
 * 2. Auth Header Injection: Attaches Bearer authentication token.
 * 3. Observability & Error Interception: Catches HTTP 422 (bureau validation errors)
 *    and HTTP 503 (carrier downtime) with correlation ID tagging.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Use crypto.randomUUID or fallback for environments without Web Crypto API
  const correlationId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'ol-' + Math.random().toString(36).substring(2, 11);

  const authToken = (typeof localStorage !== 'undefined' && localStorage.getItem('auth_token'))
    ? localStorage.getItem('auth_token')
    : 'guest_token';

  const authReq = req.clone({
    setHeaders: {
      'X-Correlation-ID': correlationId,
      'Authorization': `Bearer ${authToken}`
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 422) {
        console.error(`[Correlation: ${correlationId}] Bureau validation failed (HTTP 422):`, error.message);
      } else if (error.status === 503) {
        console.error(`[Correlation: ${correlationId}] Carrier gateway timeout / unavailable (HTTP 503):`, error.message);
      }
      return throwError(() => error);
    })
  );
};
