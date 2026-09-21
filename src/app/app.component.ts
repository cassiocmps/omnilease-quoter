import { Component, signal, computed, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { QuoteCardComponent } from './features/quotes/components/quote-card/quote-card.component';
import { UiCardComponent } from './shared/components/ui-card/ui-card.component';
import { CpfMaskDirective } from './shared/directives/cpf-mask.directive';
import { CepMaskDirective } from './shared/directives/cep-mask.directive';
import { AddressLookupService } from './core/services/address-lookup.service';
import { AddressResult } from './core/models/address.models';
import { ProviderQuote } from './core/models/insurance.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    QuoteCardComponent,
    UiCardComponent,
    CpfMaskDirective,
    CepMaskDirective
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly title = 'OmniLease Quoter';

  private readonly addressService = inject(AddressLookupService);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Reactive stream subject for debounced address lookup (Milestone 3).
   */
  readonly cepSubject = new Subject<string>();
  readonly propertyCep = signal<string>('01310-100');
  readonly isSearchingCep = signal<boolean>(false);
  readonly propertyAddress = signal<AddressResult | null>({
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    complemento: 'Bela Vista',
    bairro: 'Bela Vista',
    localidade: 'São Paulo',
    uf: 'SP'
  });

  /**
   * Signal state tracking tenant information and live CPF masking (Milestone 2).
   */
  readonly tenantCpf = signal<string>('341.892.108-45');
  readonly tenantName = signal<string>('Mariana S. Santos');
  readonly tenantIncome = signal<number>(12500);
  readonly totalCommitment = signal<number>(3730);

  /**
   * Toggle state for UiCardComponent featured projection styling.
   */
  readonly isCardFeatured = signal<boolean>(true);

  /**
   * Computed signals for tenant financial eligibility (3x income rule).
   */
  readonly incomeMultiplier = computed(() =>
    (this.tenantIncome() / this.totalCommitment()).toFixed(2)
  );

  readonly isIncomeApproved = computed(() =>
    this.tenantIncome() >= this.totalCommitment() * 3
  );

  /**
   * Signal state tracking the currently selected quotation.
   * Demonstrates parent-child reactive communication via signal inputs and output events.
   */
  readonly selectedQuote = signal<ProviderQuote | null>(null);

  /**
   * Initial mock quote data from underwriting carriers.
   * In Milestone 3 & 7, this will be replaced with real-time reactive streaming services.
   */
  readonly carrierQuotes = signal<ProviderQuote[]>([
    {
      quoteId: 'APX-2026-98124',
      providerId: 'apex-marine',
      providerName: 'Apex Marine Seguros',
      status: 'APPROVED',
      creditScore: 840,
      responseTimeMs: 620,
      financials: {
        totalCommitment: 3730.00,
        monthlyPremium: 312.45,
        annualPremium: 3749.40,
        installments: [
          { times: 1, value: 3749.40, hasInterest: false },
          { times: 3, value: 1249.80, hasInterest: false },
          { times: 12, value: 312.45, hasInterest: false }
        ]
      },
      highlights: [
        'Aprovação imediata sem envio de holerite',
        'Indenização em até 3 dias úteis',
        'Assistência Residencial 24h inclusa'
      ]
    },
    {
      quoteId: 'BCN-2026-11029',
      providerId: 'beacon-assurance',
      providerName: 'Beacon Assurance',
      status: 'PENDING_ANALYSIS',
      creditScore: 680,
      responseTimeMs: 1850,
      financials: {
        totalCommitment: 3730.00,
        monthlyPremium: 345.10,
        annualPremium: 4141.20,
        installments: [
          { times: 1, value: 4141.20, hasInterest: false },
          { times: 6, value: 690.20, hasInterest: false },
          { times: 12, value: 345.10, hasInterest: false }
        ]
      },
      highlights: [
        'Cobertura de Danos ao Imóvel inclusa',
        'Análise de crédito manual em até 24h úteis'
      ]
    },
    {
      quoteId: 'VNG-2026-44391',
      providerId: 'vanguard-surety',
      providerName: 'Vanguard Surety',
      status: 'APPROVED',
      creditScore: 790,
      responseTimeMs: 1180,
      financials: {
        totalCommitment: 3730.00,
        monthlyPremium: 328.80,
        annualPremium: 3945.60,
        installments: [
          { times: 1, value: 3945.60, hasInterest: false },
          { times: 12, value: 328.80, hasInterest: false }
        ]
      },
      highlights: [
        'Desconto de 5% para pagamento à vista',
        'Pintura Interna e Externa básica'
      ]
    }
  ]);

  constructor() {
    // Pipeline connection: Subscribes to the debounced ViaCEP typeahead stream
    this.addressService.searchAddressByCep(this.cepSubject)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.isSearchingCep.set(false);
          if (result) {
            this.propertyAddress.set(result);
          }
        },
        error: () => {
          this.isSearchingCep.set(false);
        }
      });
  }

  /**
   * Event handler receiving output event from QuoteCardComponent.
   */
  onQuoteSelected(quote: ProviderQuote): void {
    this.selectedQuote.set(quote);
  }

  /**
   * Updates the tenant CPF signal as user types through the masked input.
   */
  onCpfInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.tenantCpf.set(target.value);
    }
  }

  /**
   * Dispatches CEP updates through the debounced RxJS typeahead pipeline.
   */
  onCepInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.propertyCep.set(target.value);
      const digits = target.value.replace(/\D/g, '');
      if (digits.length === 8) {
        this.isSearchingCep.set(true);
      } else {
        this.isSearchingCep.set(false);
      }
      this.cepSubject.next(target.value);
    }
  }

  /**
   * Toggles the featured visual state of the projected UiCardComponent shell.
   */
  toggleCardFeatured(): void {
    this.isCardFeatured.update(current => !current);
  }
}

