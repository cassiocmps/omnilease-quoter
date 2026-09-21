import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, filter, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { AddressResult } from '../models/address.models';

/**
 * AddressLookupService
 * 
 * Enterprise postal code (CEP) query service using Angular 18 functional dependency injection
 * and reactive typeahead streaming.
 * 
 * Architectural Highlights:
 * 1. Functional DI: Uses `inject(HttpClient)` rather than constructor injection.
 * 2. Glitch-free Async Pipeline:
 *    - `map`: Sanitizes input by stripping non-numeric characters.
 *    - `filter`: Suppresses queries until exactly 8 digits are typed.
 *    - `debounceTime(350)`: Waits 350ms after the user stops typing to conserve bandwidth.
 *    - `distinctUntilChanged()`: Prevents redundant HTTP requests for identical CEP values.
 *    - `switchMap`: Cancels in-flight requests if a newer CEP is emitted before the previous one completes.
 *    - `catchError`: Localized inside `switchMap` so that HTTP network errors do NOT complete/kill the outer source stream!
 */
@Injectable({
  providedIn: 'root'
})
export class AddressLookupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://viacep.com.br/ws';

  /**
   * Direct lookup for a single Brazilian CEP string.
   * 
   * @param cep Raw or formatted 8-digit postal code
   * @returns Observable with AddressResult or null if invalid/error
   */
  lookupCep(cep: string): Observable<AddressResult | null> {
    const cleanCep = (cep ?? '').replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      return of(null);
    }

    return this.http.get<AddressResult>(`${this.baseUrl}/${cleanCep}/json/`).pipe(
      map(result => {
        // ViaCEP returns { erro: "true" } or { erro: true } when CEP is not found
        if (result && (result.erro === true || result.erro === 'true')) {
          return null;
        }
        return result;
      }),
      catchError(err => {
        console.error(`[AddressLookupService] CEP lookup failed for "${cleanCep}":`, err);
        return of(null);
      })
    );
  }

  /**
   * Enterprise Typeahead Stream: transforms continuous user keystrokes into debounced address results.
   * 
   * @param cepStream$ Continuous input stream of raw CEP values
   * @returns Observable stream emitting matched AddressResult or null
   */
  searchAddressByCep(cepStream$: Observable<string>): Observable<AddressResult | null> {
    return cepStream$.pipe(
      map(cep => (cep ?? '').replace(/\D/g, '')),
      filter(cleanCep => cleanCep.length === 8),
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(cleanCep => this.lookupCep(cleanCep))
    );
  }
}
