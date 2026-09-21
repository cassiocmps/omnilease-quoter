import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject } from 'rxjs';
import { AddressLookupService } from './address-lookup.service';
import { AddressResult } from '../models/address.models';

describe('AddressLookupService', () => {
  let service: AddressLookupService;
  let httpMock: HttpTestingController;

  const mockAddress: AddressResult = {
    cep: '01001-000',
    logradouro: 'Praça da Sé',
    complemento: 'lado ímpar',
    bairro: 'Sé',
    localidade: 'São Paulo',
    uf: 'SP',
    ddd: '11'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AddressLookupService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AddressLookupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created with functional inject()', () => {
    expect(service).toBeTruthy();
  });

  describe('lookupCep', () => {
    it('should return null immediately when CEP has less than 8 digits', () => {
      let result: AddressResult | null | undefined;
      service.lookupCep('12345').subscribe(res => result = res);

      expect(result).toBeNull();
      httpMock.expectNone('https://viacep.com.br/ws/12345/json/');
    });

    it('should fetch and return address for valid 8-digit CEP', () => {
      let result: AddressResult | null | undefined;
      service.lookupCep('01001-000').subscribe(res => result = res);

      const req = httpMock.expectOne('https://viacep.com.br/ws/01001000/json/');
      expect(req.request.method).toBe('GET');
      req.flush(mockAddress);

      expect(result).toEqual(mockAddress);
    });

    it('should return null when ViaCEP returns erro payload', () => {
      let result: AddressResult | null | undefined;
      service.lookupCep('99999-999').subscribe(res => result = res);

      const req = httpMock.expectOne('https://viacep.com.br/ws/99999999/json/');
      req.flush({ erro: true });

      expect(result).toBeNull();
    });

    it('should catch HTTP errors gracefully and return null', () => {
      let result: AddressResult | null | undefined;
      service.lookupCep('01001-000').subscribe(res => result = res);

      const req = httpMock.expectOne('https://viacep.com.br/ws/01001000/json/');
      req.flush('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });

      expect(result).toBeNull();
    });
  });

  describe('searchAddressByCep (Typeahead Pipeline)', () => {
    it('should debounce input by 350ms, strip non-digits, and query ViaCEP', fakeAsync(() => {
      const cepSubject$ = new Subject<string>();
      let latestResult: AddressResult | null | undefined;

      service.searchAddressByCep(cepSubject$).subscribe(res => latestResult = res);

      // Typing incomplete CEP
      cepSubject$.next('010');
      tick(100);
      cepSubject$.next('0100');
      tick(100);

      // No request made for incomplete CEP
      httpMock.expectNone('https://viacep.com.br/ws/0100/json/');

      // Type complete formatted CEP
      cepSubject$.next('01001-000');
      tick(200); // 200ms < 350ms debounce
      httpMock.expectNone('https://viacep.com.br/ws/01001000/json/');

      tick(150); // total 350ms passed!
      const req = httpMock.expectOne('https://viacep.com.br/ws/01001000/json/');
      req.flush(mockAddress);

      expect(latestResult).toEqual(mockAddress);
    }));

    it('should ignore duplicate consecutive emissions with distinctUntilChanged', fakeAsync(() => {
      const cepSubject$ = new Subject<string>();
      let callCount = 0;

      service.searchAddressByCep(cepSubject$).subscribe(() => callCount++);

      cepSubject$.next('01001-000');
      tick(350);
      const req1 = httpMock.expectOne('https://viacep.com.br/ws/01001000/json/');
      req1.flush(mockAddress);

      // Same CEP emitted again
      cepSubject$.next('01001000');
      tick(350);
      // No new HTTP request should be sent!
      httpMock.expectNone('https://viacep.com.br/ws/01001000/json/');

      expect(callCount).toBe(1);
    }));
  });
});
