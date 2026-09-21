import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { QuoteFormComponent } from '../../components/quote-form/quote-form.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { CepMaskDirective } from '../../../../shared/directives/cep-mask.directive';
import { AddressLookupService } from '../../../../core/services/address-lookup.service';
import { QuoteStateService } from '../../../../core/services/quote-state.service';
import { AddressResult } from '../../../../core/models/address.models';
import { ProviderQuote } from '../../../../core/models/insurance.models';

@Component({
  selector: 'app-wizard-page',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    QuoteFormComponent,
    UiCardComponent,
    CepMaskDirective
  ],
  templateUrl: './wizard-page.component.html',
  styleUrl: './wizard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WizardPageComponent {
  private readonly router = inject(Router);
  private readonly quoteState = inject(QuoteStateService);
  private readonly addressService = inject(AddressLookupService);

  readonly cepSubject = new Subject<string>();
  readonly propertyCep = signal<string>('01310-100');

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

  onCepInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.propertyCep.set(target.value);
      this.cepSubject.next(target.value);
    }
  }

  onFormSubmit(formData: any): void {
    const totalCommitment = formData.rentAmount + formData.condoAmount + formData.iptuAmount;

    // Generate calculated carrier proposals
    const generatedQuotes: ProviderQuote[] = [
      {
        quoteId: 'APX-2026-98124',
        providerId: 'apex-marine',
        providerName: 'Apex Marine Seguros',
        status: 'APPROVED',
        creditScore: 840,
        responseTimeMs: 620,
        financials: {
          totalCommitment,
          monthlyPremium: Math.round(totalCommitment * 0.0837 * 100) / 100,
          annualPremium: Math.round(totalCommitment * 0.0837 * 12 * 100) / 100,
          installments: [
            { times: 1, value: Math.round(totalCommitment * 0.0837 * 12 * 100) / 100, hasInterest: false },
            { times: 12, value: Math.round(totalCommitment * 0.0837 * 100) / 100, hasInterest: false }
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
          totalCommitment,
          monthlyPremium: Math.round(totalCommitment * 0.0925 * 100) / 100,
          annualPremium: Math.round(totalCommitment * 0.0925 * 12 * 100) / 100,
          installments: [
            { times: 1, value: Math.round(totalCommitment * 0.0925 * 12 * 100) / 100, hasInterest: false },
            { times: 12, value: Math.round(totalCommitment * 0.0925 * 100) / 100, hasInterest: false }
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
          totalCommitment,
          monthlyPremium: Math.round(totalCommitment * 0.0881 * 100) / 100,
          annualPremium: Math.round(totalCommitment * 0.0881 * 12 * 100) / 100,
          installments: [
            { times: 1, value: Math.round(totalCommitment * 0.0881 * 12 * 100) / 100, hasInterest: false },
            { times: 12, value: Math.round(totalCommitment * 0.0881 * 100) / 100, hasInterest: false }
          ]
        },
        highlights: [
          'Desconto de 5% para pagamento à vista',
          'Pintura Interna e Externa básica'
        ]
      }
    ];

    this.quoteState.setQuotes(generatedQuotes);
    this.router.navigate(['/results']);
  }
}
