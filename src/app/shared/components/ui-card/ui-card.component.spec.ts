import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UiCardComponent } from './ui-card.component';

/**
 * Test host component to test multi-slot content projection
 */
@Component({
  standalone: true,
  imports: [UiCardComponent],
  template: `
    <app-ui-card [isFeatured]="featured">
      <h2 card-title id="projected-title">Carrier Approval Header</h2>
      <p id="projected-body">Tenant qualification passed with 3.35x income ratio.</p>
      <button card-actions id="projected-action" type="button">Emit Policy</button>
    </app-ui-card>
  `
})
class TestHostComponent {
  featured = false;
}

describe('UiCardComponent (Content Projection)', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, UiCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create host and card shell', () => {
    const cardEl = fixture.debugElement.query(By.directive(UiCardComponent));
    expect(cardEl).toBeTruthy();
  });

  it('should project card-title into the .card-header slot', () => {
    const headerEl = fixture.debugElement.query(By.css('.card-header'));
    const titleEl = headerEl.query(By.css('#projected-title'));

    expect(titleEl).toBeTruthy();
    expect(titleEl.nativeElement.textContent.trim()).toBe('Carrier Approval Header');
  });

  it('should project default content into the .card-body slot', () => {
    const bodyEl = fixture.debugElement.query(By.css('.card-body'));
    const contentEl = bodyEl.query(By.css('#projected-body'));

    expect(contentEl).toBeTruthy();
    expect(contentEl.nativeElement.textContent.trim()).toBe(
      'Tenant qualification passed with 3.35x income ratio.'
    );
  });

  it('should project card-actions into the .card-footer slot', () => {
    const footerEl = fixture.debugElement.query(By.css('.card-footer'));
    const actionBtn = footerEl.query(By.css('#projected-action'));

    expect(actionBtn).toBeTruthy();
    expect(actionBtn.nativeElement.textContent.trim()).toBe('Emit Policy');
  });

  it('should toggle .featured class when isFeatured signal input updates', () => {
    const wrapperEl = fixture.debugElement.query(By.css('.card-wrapper'));
    expect(wrapperEl.nativeElement.classList.contains('featured')).toBeFalse();

    // Toggle featured to true
    hostComponent.featured = true;
    fixture.detectChanges();

    expect(wrapperEl.nativeElement.classList.contains('featured')).toBeTrue();
  });
});
