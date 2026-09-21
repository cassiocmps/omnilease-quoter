import { Component, signal, computed, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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

  /**
   * Reactive stream subject for debounced address lookup.
   */
  readonly cepSubject = new Subject<string>();
  readonly propertyCep = signal<string>('01310-100');

  /**
   * RxJS-to-Signal Bridge (Milestone 4):
   * Seamlessly converts the address search Observable stream into a readonly Signal.
   * Eliminates manual .subscribe() and manual takeUntilDestroyed() teardowns!
   */
  readonly propertyAddress = toSignal(
    this.addressService.searchAddressByCep(this.cepSubject),
    {
      initialValue: {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: 'Bela Vista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP'
      } as AddressResult
    }
  );

  /**
   * Fine-Grained Reactive Financial State (Milestone 4):
   * Independent writable signals modeling lease commitments.
   */
  readonly rent = signal<number>(2500);
  readonly condo = signal<number>(600);
  readonly iptu = signal<number>(150);

  /**
   * Glitch-Free Computed Derivations:
   * Re-evaluates synchronously and lazily only when dependent signals mutate.
   */
  readonly totalCommitment = computed(() => this.rent() + this.condo() + this.iptu());

  /**
   * Enterprise Underwriting Rule:
   * Tenant minimum qualifying gross income (3x total commitment multiplier).
   */
  readonly minimumRequiredIncome = computed(() => this.totalCommitment() * 3);

  /**
   * Tenant profile signals
   */
  readonly tenantCpf = signal<string>('341.892.108-45');
  readonly tenantName = signal<string>('Mariana S. Santos');
  readonly tenantIncome = signal<number>(12500);

  readonly incomeMultiplier = computed(() =>
    this.totalCommitment() > 0 ? (this.tenantIncome() / this.totalCommitment()).toFixed(2) : '0.00'
  );

  readonly isIncomeApproved = computed(() =>
    this.tenantIncome() >= this.minimumRequiredIncome()
  );

  /**
   * Toggle state for UiCardComponent featured projection styling.
   */
  readonly isCardFeatured = signal<boolean>(true);

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
    /**
     * Reactive Audit Effect (Milestone 4):
     * Demonstrates effect() executing whenever fine-grained signals change.
     * Used in enterprise apps for analytics tracking, external sync, and underwriting audit logs.
     */
    effect(() => {
      const commitment = this.totalCommitment();
      const minIncome = this.minimumRequiredIncome();
      const currentIncome = this.tenantIncome();
      const approved = this.isIncomeApproved();
      console.log(
        `[OmniLease Underwriting Engine] Commitment: R$ ${commitment} | Req. Income (3x): R$ ${minIncome} | Actual Income: R$ ${currentIncome} | Approved: ${approved}`
      );
    });
  }

  /**
   * Financial Mutation Methods updating fine-grained signals.
   */
  setRent(value: number): void {
    this.rent.set(Math.max(0, value));
  }

  setCondo(value: number): void {
    this.condo.set(Math.max(0, value));
  }

  setIptu(value: number): void {
    this.iptu.set(Math.max(0, value));
  }

  setTenantIncome(value: number): void {
    this.tenantIncome.set(Math.max(0, value));
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

