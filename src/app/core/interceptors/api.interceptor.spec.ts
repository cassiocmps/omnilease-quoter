import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { apiInterceptor } from './api.interceptor';

describe('apiInterceptor (Functional HttpInterceptorFn)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should attach X-Correlation-ID and Authorization headers to outgoing request', () => {
    http.get('/api/v1/quotes').subscribe();

    const req = httpMock.expectOne('/api/v1/quotes');
    expect(req.request.headers.has('X-Correlation-ID')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toContain('Bearer ');
    req.flush({});
  });

  it('should intercept HTTP 422 bureau validation error and propagate error', () => {
    spyOn(console, 'error');
    let errorResponse: any;

    http.get('/api/v1/underwriting/validate').subscribe({
      error: (err) => errorResponse = err
    });

    const req = httpMock.expectOne('/api/v1/underwriting/validate');
    req.flush('Unprocessable Entity', { status: 422, statusText: 'Unprocessable Entity' });

    expect(errorResponse.status).toBe(422);
    expect(console.error).toHaveBeenCalled();
  });

  it('should intercept HTTP 503 carrier downtime and propagate error', () => {
    spyOn(console, 'error');
    let errorResponse: any;

    http.get('/api/v1/carriers/apex').subscribe({
      error: (err) => errorResponse = err
    });

    const req = httpMock.expectOne('/api/v1/carriers/apex');
    req.flush('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });

    expect(errorResponse.status).toBe(503);
    expect(console.error).toHaveBeenCalled();
  });
});
