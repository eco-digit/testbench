import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcoInsightsScreenComponent } from './eco-insights-screen.component';

describe('EcoInsightsScreenComponent', () => {
  let component: EcoInsightsScreenComponent;
  let fixture: ComponentFixture<EcoInsightsScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcoInsightsScreenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EcoInsightsScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
